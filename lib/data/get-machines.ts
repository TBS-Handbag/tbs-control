import type { Area, Machine, WorkerRole } from '@/lib/data/machines';
import { createClient } from '@/lib/supabase/server';

type Row = {
    id: string;
    name: string;
    short: string;
    area: Area;
    group: string;
    orders: { id: number; code: string; start_at: string; end_at: string }[];
    machine_workers: { role: WorkerRole; name: string }[];
};

const vnFormat = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
});
// timestamptz -> "2026-10-28T06:00" giờ VN, cùng định dạng formatDateTime/formatDuration đang đọc
const toVn = (s: string) => vnFormat.format(new Date(s)).replace(' ', 'T');

/** Máy kèm lệnh chưa kết thúc (lệnh nối liền nên lệnh đầu là đang chạy, trừ khi nó chưa tới giờ) và lệnh vừa kết thúc hôm nay. */
export async function getMachines(id?: string): Promise<Machine[]> {
    const supabase = await createClient();
    const now = new Date();
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(now);
    let query = supabase
        .from('machines')
        .select('id, name, short, area, group, orders(id, code, start_at, end_at), machine_workers(role, name)')
        .gt('orders.end_at', `${today}T00:00:00+07:00`)
        .order('sort')
        .order('start_at', { referencedTable: 'orders' })
        .order('id', { referencedTable: 'machine_workers' });
    if (id) query = query.eq('id', id);
    const { data, error } = await query.overrideTypes<Row[], { merge: false }>();
    if (error) throw error;

    return data.map(({ orders: all, machine_workers, ...m }) => {
        const toOrder = (o: Row['orders'][number]) => ({
            id: o.id,
            code: o.code,
            start: toVn(o.start_at),
            end: toVn(o.end_at),
        });
        const ended = all.filter((o) => new Date(o.end_at) <= now);
        const orders = all.slice(ended.length);
        const list = orders.map(toOrder);
        const running = orders.length > 0 && new Date(orders[0].start_at) <= now;
        const names = (role: WorkerRole) => machine_workers.filter((w) => w.role === role).map((w) => w.name);
        return {
            ...m,
            previous: ended.length ? toOrder(ended[ended.length - 1]) : null,
            current: running ? list[0] : null,
            queue: running ? list.slice(1) : list,
            operators: names('operators'),
            counters: names('counters'),
        };
    });
}

export const getMachine = async (id: string) => (await getMachines(id))[0];
