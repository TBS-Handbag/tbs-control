-- Xoá 1 lệnh đang chờ: các lệnh sau nó dời lên đúng bằng thời lượng lệnh bị xoá để hàng chờ vẫn nối liền.
-- Lệnh đang Hoạt động không xoá ở đây, dùng stop_order.
create function public.delete_order(p_machine text, p_order bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    o public.orders;
begin
    perform 1 from public.machines where id = p_machine for update;
    select * into o from public.orders where id = p_order and machine_id = p_machine;
    if not found then
        return;
    end if;
    if o.start_at <= now() then
        raise exception 'Lệnh % đang Hoạt động, dùng Dừng để kết thúc', o.code;
    end if;

    delete from public.orders where id = o.id;
    update public.orders
    set start_at = start_at - (o.end_at - o.start_at), end_at = end_at - (o.end_at - o.start_at)
    where machine_id = p_machine and start_at >= o.end_at;
end;
$$;

revoke execute on function public.delete_order from public;
grant execute on function public.delete_order to anon, authenticated;
