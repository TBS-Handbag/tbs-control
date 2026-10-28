// shortcut: mock data tĩnh cho UI, thay bằng query Supabase khi làm logic.

export type Area = 'cut' | 'press';

export type Order = { code: string; start: string; end: string };

export type Machine = {
    id: string;
    name: string;
    short: string;
    area: Area;
    group: string;
    /** Không cho sửa tay: luôn suy ra từ `current` (có lệnh hiện tại = đang hoạt động). */
    running: boolean;
    current: Order | null;
    queue: Order[];
    /** Công nhân điều hành máy */
    operators: string[];
    /** Công nhân kiểm đếm sản phẩm */
    counters: string[];
};

export type WorkerRole = 'operators' | 'counters';

export const WORKER_ROLES: { role: WorkerRole; title: string }[] = [
    { role: 'operators', title: 'Điều hành máy' },
    { role: 'counters', title: 'Kiểm đếm sản phẩm' },
];

const WORKERS: Record<string, Pick<Machine, WorkerRole>> = {
    'trai-td1': { operators: ['Nguyễn Văn An', 'Trần Văn Bình'], counters: ['Lê Thị Cúc'] },
    'trai-td2': { operators: ['Phạm Văn Dũng'], counters: ['Hoàng Thị Em', 'Võ Thị Phượng'] },
    'cat-td': { operators: ['Đặng Văn Giang'], counters: [] },
    'bullmer-1': { operators: ['Bùi Văn Hải'], counters: ['Đỗ Thị Hoa'] },
    P01: { operators: ['Ngô Văn Khánh'], counters: ['Dương Thị Lan'] },
    P02: { operators: ['Lý Văn Minh', 'Mai Văn Nam'], counters: ['Trịnh Thị Oanh'] },
};

export const AREAS = {
    cut: { index: 1, title: 'Trải-Cắt, Bullmer', href: '/machines/cut' },
    press: { index: 2, title: 'Chặt thủy lực', href: '/machines/press' },
} as const;

const pad = (n: number) => String(n).padStart(2, '0');
const iso = (min: number) => `2026-10-${pad(28 + Math.floor(min / 1440))}T${pad(Math.floor((min % 1440) / 60))}:${pad(min % 60)}`;

let seq = 2600;
function makeMachine(
    id: string,
    name: string,
    short: string,
    area: Area,
    group: string,
    hasCurrent: boolean,
    queueSize: number,
    startHour: number,
): Machine {
    const current = hasCurrent ? { code: `L${++seq}`, start: iso(startHour * 60), end: iso(startHour * 60 + 120) } : null;
    let t = current ? startHour * 60 + 120 : 13 * 60;
    const queue = Array.from({ length: queueSize }, () => {
        const order = { code: `L${++seq}`, start: iso(t), end: iso(t + 90) };
        t += 90;
        return order;
    });
    const { operators = [], counters = [] } = WORKERS[id] ?? {};
    return { id, name, short, area, group, running: current !== null, current, queue, operators, counters };
}

const STOPPED_PRESS = [4, 9, 15];

export const MACHINES: Machine[] = [
    ...Array.from({ length: 18 }, (_, i) =>
        makeMachine(`P${pad(i + 1)}`, `Máy ${pad(i + 1)}`, pad(i + 1), 'press', 'Chặt thủy lực', !STOPPED_PRESS.includes(i + 1), ((i + 1) * 7) % 5, 6 + ((i + 1) % 3)),
    ),
    makeMachine('trai-td1', 'Trải TĐ 1', 'TĐ 1', 'cut', 'Trải', true, 3, 6),
    makeMachine('trai-td2', 'Trải TĐ 2', 'TĐ 2', 'cut', 'Trải', true, 1, 7),
    makeMachine('trai-tc', 'Trải TC', 'TC', 'cut', 'Trải', false, 2, 0),
    makeMachine('cat-td', 'Cắt TĐ', 'TĐ', 'cut', 'Cắt', true, 2, 6),
    makeMachine('cat-tc', 'Cắt TC', 'TC', 'cut', 'Cắt', true, 0, 8),
    makeMachine('bullmer-1', 'Bullmer 1', '1', 'cut', 'Bullmer', true, 4, 6),
    makeMachine('bullmer-2', 'Bullmer 2', '2', 'cut', 'Bullmer', false, 0, 0),
];

export const CUT_GROUPS = ['Trải', 'Cắt', 'Bullmer'];

export const machinesByArea = (area: Area) => MACHINES.filter((m) => m.area === area);

export const getMachine = (id: string) => MACHINES.find((m) => m.id === id);

export function stat(list: Machine[]) {
    const run = list.filter((m) => m.running).length;
    return { total: list.length, run, stop: list.length - run };
}

const MINUTE = 60000;
// Date -> "2026-10-28T06:00" theo giờ local, cùng định dạng với dữ liệu lệnh
const toIso = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

/**
 * Dừng sớm lệnh đang chạy lúc `now`: lệnh chờ #1 chạy ngay, cả hàng chờ dời theo cùng độ lệch
 * (giữ nguyên thời lượng và khoảng nghỉ giữa các lệnh). Hết lệnh chờ thì máy dừng.
 */
export function stopEarly(current: Order, queue: Order[], now: Date): { current: Order | null; queue: Order[] } {
    if (!queue.length) return { current: null, queue: [] };
    // làm tròn xuống phút; đồng hồ lệch trước giờ bắt đầu thì coi như dừng ngay lúc bắt đầu
    const stopAt = Math.max(Math.floor(now.getTime() / MINUTE) * MINUTE, new Date(current.start).getTime());
    const delta = stopAt - new Date(queue[0].start).getTime();
    const move = (s: string) => toIso(new Date(new Date(s).getTime() + delta));
    const [next, ...rest] = queue.map((o) => ({ ...o, start: move(o.start), end: move(o.end) }));
    return { current: next, queue: rest };
}

/** "2026-10-28T06:00" -> { time: "06:00", date: "28/10/2026" } */
export function formatDateTime(s?: string) {
    if (!s) return { time: '—', date: '' };
    return { time: s.slice(11, 16), date: `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}` };
}

export function formatDuration(start: string, end: string) {
    const total = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
    if (!(total > 0)) return '—';
    const h = Math.floor(total / 60);
    const m = total % 60;
    return [h && `${h} giờ`, m && `${m} phút`].filter(Boolean).join(' ') || '0 phút';
}
