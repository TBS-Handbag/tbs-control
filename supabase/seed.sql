-- Danh sách máy mặc định, chưa có lệnh nên tất cả ở trạng thái Nhàn rỗi.

insert into public.machines (id, name, short, area, "group", sort)
select 'P' || lpad(i::text, 2, '0'), 'Máy ' || lpad(i::text, 2, '0'), lpad(i::text, 2, '0'), 'press', 'Chặt thủy lực', i
from generate_series(1, 18) i;

insert into public.machines (id, name, short, area, "group", sort) values
    ('trai-td1', 'Trải TĐ 1', 'TĐ 1', 'cut', 'Trải', 19),
    ('trai-td2', 'Trải TĐ 2', 'TĐ 2', 'cut', 'Trải', 20),
    ('trai-tc', 'Trải TC', 'TC', 'cut', 'Trải', 21),
    ('bullmer-1', 'Bullmer 1', '1', 'cut', 'Bullmer', 23),
    ('bullmer-2', 'Bullmer 2', '2', 'cut', 'Bullmer', 24);
