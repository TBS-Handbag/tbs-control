// Kiểu + hàm thuần dùng chung server/client. Đọc Google Sheet nằm ở `get-machines.ts` (chỉ server).

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

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const VN = 7 * HOUR;
// nghỉ trưa 11:30–12:30 giờ VN, không tính vào thời lượng lệnh
const LUNCH_FROM = 11.5 * HOUR;
const LUNCH_TO = 12.5 * HOUR;

/** ms -> "2026-10-28T06:00" giờ VN (VN không có DST nên cộng cứng +7) */
export const toVn = (ms: number) => new Date(ms + VN).toISOString().slice(0, 16);
/** "2026-10-28T06:00" giờ VN -> ms */
export const fromVn = (s: string) => Date.parse(`${s}+07:00`);
/** 0h giờ VN của ngày chứa `ms` */
const vnDay = (ms: number) => Math.floor((ms + VN) / DAY) * DAY - VN;

/** Phần nghỉ trưa nằm trong [start, end) */
function lunchIn(start: number, end: number) {
    let sum = 0;
    for (let d = vnDay(start); d < end; d += DAY)
        sum += Math.max(0, Math.min(end, d + LUNCH_TO) - Math.max(start, d + LUNCH_FROM));
    return sum;
}

/** Đang trong giờ nghỉ trưa thì dời tới 12:30 */
export const skipLunch = (ms: number) => {
    const t = ms - vnDay(ms);
    return t >= LUNCH_FROM && t < LUNCH_TO ? vnDay(ms) + LUNCH_TO : ms;
};

/** Thời gian làm việc trong [start, end), bỏ nghỉ trưa */
export const workMs = (start: number, end: number) => end - start - lunchIn(start, end);

/** Giờ kết thúc khi chạy `ms` thời gian làm việc từ `start`, bỏ qua nghỉ trưa */
export function addWork(start: number, ms: number) {
    let end = start + ms;
    // ô giờ hỏng trên sheet cho ra NaN; NaN !== NaN nên vòng lặp dưới sẽ chạy mãi
    if (Number.isNaN(end)) return NaN;
    for (let prev = NaN; end !== prev; ) {
        prev = end;
        end = start + ms + lunchIn(start, end);
    }
    return end;
}

export function formatDuration(start: string, end: string) {
    const total = Math.round(workMs(fromVn(start), fromVn(end)) / 60000);
    if (!(total > 0)) return '—';
    const h = Math.floor(total / 60);
    const m = total % 60;
    return [h && `${h} giờ`, m && `${m} phút`].filter(Boolean).join(' ') || '0 phút';
}
