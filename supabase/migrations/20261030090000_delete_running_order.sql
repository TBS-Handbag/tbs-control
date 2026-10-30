-- Cho xoá cả lệnh đang Hoạt động: khác stop_order (giữ phần đã chạy), ở đây xoá hẳn bản ghi.
-- Lệnh sau dời lên bắt đầu từ phút hiện tại (lệnh chờ thì từ start_at của nó) để hàng chờ vẫn nối liền.
create or replace function public.delete_order(p_machine text, p_order bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    o public.orders;
    v_from timestamptz;
begin
    perform 1 from public.machines where id = p_machine for update;
    select * into o from public.orders where id = p_order and machine_id = p_machine;
    if not found then
        return;
    end if;
    if o.end_at <= now() then
        raise exception 'Lệnh % đã kết thúc', o.code;
    end if;

    v_from := greatest(date_trunc('minute', now()), o.start_at);
    delete from public.orders where id = o.id;
    update public.orders
    set start_at = start_at - (o.end_at - v_from), end_at = end_at - (o.end_at - v_from)
    where machine_id = p_machine and start_at >= o.end_at;
end;
$$;
