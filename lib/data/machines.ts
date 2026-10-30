// Kiểu + hàm thuần dùng chung server/client. Query Supabase nằm ở `get-machines.ts` (chỉ server).

export type Area = 'cut' | 'press';

/** start/end: "2026-10-28T06:00" theo giờ VN */
export type Order = { id: number; code: string; start: string; end: string };

export type Machine = {
    id: string;
    name: string;
    short: string;
    area: Area;
    group: string;
    /** Lệnh kết thúc gần nhất hôm nay, để thêm giờ khi máy thực tế còn chạy lệnh này. */
    previous: Order | null;
    /** Lệnh đang chạy theo giờ hiện tại; null khi máy Nhàn rỗi. */
    current: Order | null;
    queue: Order[];
    /** Công nhân điều hành máy */
    operators: string[];
    /** Công nhân kiểm đếm sản phẩm */
    counters: string[];
};

export type WorkerRole = 'operators' | 'counters';

/** Tên người: chỉ chữ cái (kể cả dấu tiếng Việt dạng tổ hợp \p{M}) và khoảng trắng. */
export const PERSON_NAME = /^[\p{L}\p{M} ]+$/u;

export const WORKER_ROLES: { role: WorkerRole; title: string }[] = [
    { role: 'operators', title: 'Điều hành máy' },
    { role: 'counters', title: 'Kiểm đếm sản phẩm' },
];

export const AREAS = {
    cut: { index: 1, title: 'Trải-Cắt, Bullmer', href: '/machines/cut' },
    press: { index: 2, title: 'Chặt thủy lực', href: '/machines/press' },
} as const;

export const CUT_GROUPS = ['Trải', 'Bullmer'];

export const machinesByArea = (list: Machine[], area: Area) => list.filter((m) => m.area === area);

/** run: đang Hoạt động và còn lệnh chờ · idle: đang Hoạt động lệnh cuối · stop: không có lệnh */
export type Status = 'run' | 'idle' | 'stop';

export const statusOf = (m: Machine): Status => (!m.current ? 'stop' : m.queue.length ? 'run' : 'idle');

export function stat(list: Machine[]) {
    const count = (s: Status) => list.filter((m) => statusOf(m) === s).length;
    const stop = count('stop');
    const queued = list.reduce((n, m) => n + m.queue.length, 0);
    return { total: list.length, active: list.length - stop, run: count('run'), idle: count('idle'), stop, queued };
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
