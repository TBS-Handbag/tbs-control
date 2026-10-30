-- Lệnh chạy quá giờ dự kiến: dời giờ kết thúc tới p_end (giờ VN, cùng ngày với lệnh).
-- p_order là lệnh đang Hoạt động, hoặc lệnh vừa kết thúc (app đã tự chuyển sang lệnh sau mà máy vẫn chạy lệnh cũ).
-- Lệnh sau bị đè thì cả hàng chờ lùi theo phần bị đè; vẫn giữ luật mọi lệnh xong trước 22:00.
create function public.extend_order(p_machine text, p_order bigint, p_end time)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    o public.orders;
    v_end timestamptz;
    v_next timestamptz;
    v_shift interval;
    v_last timestamptz;
    v_deadline timestamptz;
begin
    perform 1 from public.machines where id = p_machine for update;
    select * into o from public.orders where id = p_order and machine_id = p_machine;
    if not found then
        raise exception 'Không tìm thấy lệnh';
    end if;
    -- chỉ lệnh đang Hoạt động hoặc lệnh kết thúc gần nhất: đã bắt đầu và không có lệnh nào kết thúc sau nó
    if o.start_at > now() or exists (
        select 1 from public.orders
        where machine_id = p_machine and end_at <= now() and start_at > o.start_at
    ) then
        raise exception 'Chỉ thêm giờ được cho lệnh đang Hoạt động hoặc lệnh vừa kết thúc';
    end if;

    v_end := ((o.end_at at time zone 'Asia/Ho_Chi_Minh')::date + p_end) at time zone 'Asia/Ho_Chi_Minh';
    if v_end <= o.end_at then
        raise exception 'Giờ kết thúc mới phải sau %', to_char(o.end_at at time zone 'Asia/Ho_Chi_Minh', 'HH24:MI');
    end if;

    select min(start_at), max(end_at) into v_next, v_last
    from public.orders where machine_id = p_machine and start_at >= o.end_at;
    -- lệnh sau cách một khoảng trống thì chỉ lùi phần bị đè
    v_shift := greatest(v_end - coalesce(v_next, v_end), interval '0');
    v_deadline := ((o.start_at at time zone 'Asia/Ho_Chi_Minh')::date + time '22:00') at time zone 'Asia/Ho_Chi_Minh';
    if greatest(v_end, v_last + v_shift) > v_deadline then
        raise exception 'Cả hàng chờ phải xong trước 22:00, giờ kết thúc muộn nhất %',
            to_char(
                (v_deadline - greatest(coalesce(v_last, o.end_at) - coalesce(v_next, o.end_at), interval '0'))
                    at time zone 'Asia/Ho_Chi_Minh',
                'HH24:MI'
            );
    end if;

    update public.orders
    set start_at = start_at + v_shift, end_at = end_at + v_shift
    where machine_id = p_machine and start_at >= o.end_at;
    update public.orders set end_at = v_end where id = o.id;
end;
$$;

revoke execute on function public.extend_order from public;
grant execute on function public.extend_order to anon, authenticated;
