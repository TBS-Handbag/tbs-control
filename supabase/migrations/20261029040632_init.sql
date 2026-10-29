create extension if not exists btree_gist with schema extensions;

create type public.area as enum ('cut', 'press');
create type public.worker_role as enum ('operators', 'counters');

create table public.machines (
    id text primary key,
    name text not null check (char_length(name) between 1 and 50),
    short text not null,
    area public.area not null,
    "group" text not null,
    sort int not null default 0
);

create table public.orders (
    id bigint generated always as identity primary key,
    machine_id text not null references public.machines (id) on delete cascade,
    -- mã lệnh đếm lại từ L01 mỗi ngày (giờ VN) cho từng máy
    day date not null default (now() at time zone 'Asia/Ho_Chi_Minh')::date,
    seq int not null,
    code text generated always as ('L' || lpad(seq::text, 2, '0')) stored,
    start_at timestamptz not null,
    end_at timestamptz not null,
    check (end_at > start_at),
    unique (machine_id, day, seq),
    -- deferred: stop_order dời cả hàng chờ trong 1 UPDATE, giữa chừng có thể chồng tạm
    exclude using gist (machine_id with =, tstzrange(start_at, end_at) with &&) deferrable initially deferred
);
create index on public.orders (machine_id, end_at);

create table public.machine_workers (
    id bigint generated always as identity primary key,
    machine_id text not null references public.machines (id) on delete cascade,
    role public.worker_role not null,
    name text not null check (char_length(name) between 1 and 50)
);
create unique index on public.machine_workers (machine_id, role, lower(name));

-- Lệnh nối liền: máy còn lệnh thì bắt đầu ngay khi lệnh cuối kết thúc (bỏ qua p_start),
-- máy trống thì bắt đầu ở p_start (không sớm hơn hiện tại).
create function public.create_order(p_machine text, p_start timestamptz, p_duration interval)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_day date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
    v_start timestamptz;
    v_code text;
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
    v_start := coalesce(
        v_start,
        greatest(date_trunc('minute', coalesce(p_start, now())), date_trunc('minute', now()))
    );

    insert into public.orders (machine_id, day, seq, start_at, end_at)
    select p_machine, v_day, coalesce(max(seq), 0) + 1, v_start, v_start + p_duration
    from public.orders
    where machine_id = p_machine and day = v_day
    returning code into v_code;
    return v_code;
end;
$$;

-- Dừng sớm lệnh đang chạy: kết thúc ở phút hiện tại, cả hàng chờ dời lên cùng độ lệch.
create function public.stop_order(p_machine text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    cur public.orders;
    v_stop timestamptz;
    v_delta interval;
begin
    perform 1 from public.machines where id = p_machine for update;
    select * into cur from public.orders
    where machine_id = p_machine and start_at <= now() and end_at > now();
    if not found then
        return;
    end if;

    v_stop := greatest(date_trunc('minute', now()), cur.start_at);
    v_delta := cur.end_at - v_stop;
    if v_stop = cur.start_at then
        delete from public.orders where id = cur.id;
    else
        update public.orders set end_at = v_stop where id = cur.id;
    end if;
    update public.orders
    set start_at = start_at - v_delta, end_at = end_at - v_delta
    where machine_id = p_machine and start_at >= cur.end_at;
end;
$$;

-- Dự án nội bộ, không auth: ai cũng đọc/ghi, riêng orders chỉ ghi qua RPC để giữ lệnh nối liền.
alter table public.machines enable row level security;
alter table public.orders enable row level security;
alter table public.machine_workers enable row level security;

create policy "public read" on public.machines for select using (true);
create policy "public rename" on public.machines for update using (true) with check (true);
revoke update on public.machines from anon, authenticated;
grant update (name) on public.machines to anon, authenticated;

create policy "public read" on public.orders for select using (true);

create policy "public read" on public.machine_workers for select using (true);
create policy "public insert" on public.machine_workers for insert with check (true);
create policy "public delete" on public.machine_workers for delete using (true);

revoke execute on function public.create_order, public.stop_order from public;
grant execute on function public.create_order, public.stop_order to anon, authenticated;
