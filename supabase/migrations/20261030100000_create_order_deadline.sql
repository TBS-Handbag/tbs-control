-- Lệnh phải kết thúc muộn nhất 22:00 (giờ VN) của ngày bắt đầu; báo luôn thời lượng tối đa còn lại.
create or replace function public.create_order(p_machine text, p_start timestamptz, p_duration interval)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_day date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
    v_start timestamptz;
    v_deadline timestamptz;
    v_code text;
    v_prev public.orders;
begin
    if p_duration is null or p_duration <= interval '0' then
        raise exception 'Thời lượng phải lớn hơn 0';
    end if;
    -- khoá máy để 2 thao tác lệnh cùng lúc không tính trùng giờ bắt đầu / mã lệnh
    perform 1 from public.machines where id = p_machine for update;
    if not found then
        raise exception 'Không tìm thấy máy %', p_machine;
    end if;

    select max(end_at) into v_start from public.orders where machine_id = p_machine and end_at > now();
    v_start := coalesce(v_start, date_trunc('minute', coalesce(p_start, now())));
    if v_start + p_duration <= now() then
        raise exception 'Giờ kết thúc đã qua, chọn giờ muộn hơn';
    end if;

    v_deadline := ((v_start at time zone 'Asia/Ho_Chi_Minh')::date + time '22:00') at time zone 'Asia/Ho_Chi_Minh';
    if v_start >= v_deadline then
        raise exception 'Đã quá 22:00, không tạo thêm lệnh trong ngày';
    end if;
    if v_start + p_duration > v_deadline then
        raise exception 'Lệnh phải kết thúc trước 22:00, thời lượng tối đa %',
            to_char(v_deadline - v_start, 'FMHH24:MI');
    end if;

    select * into v_prev from public.orders
    where machine_id = p_machine and tstzrange(start_at, end_at) && tstzrange(v_start, v_start + p_duration)
    order by end_at desc
    limit 1;
    if found then
        raise exception 'Trùng giờ với lệnh % đã chạy, chọn giờ bắt đầu từ % trở đi',
            v_prev.code, to_char(v_prev.end_at at time zone 'Asia/Ho_Chi_Minh', 'HH24:MI');
    end if;

    insert into public.orders (machine_id, day, seq, start_at, end_at)
    select p_machine, v_day, coalesce(max(seq), 0) + 1, v_start, v_start + p_duration
    from public.orders
    where machine_id = p_machine and day = v_day
    returning code into v_code;
    return v_code;
end;
$$;
