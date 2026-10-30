import { connection } from 'next/server';
import type { Machine, WorkerRole } from '@/lib/data/machines';
import { fromVn, orderCode, readSheet, toVn, type OrderRow } from '@/lib/data/sheet';

/** Máy kèm lệnh chưa kết thúc (lệnh nối liền nên lệnh đầu là đang chạy, trừ khi nó chưa tới giờ) và lệnh vừa kết thúc hôm nay. */
export async function getMachines(id?: string): Promise<Machine[]> {
    await connection();
    const { machines, orders, workers } = await readSheet();
    const now = Date.now();
    const today = fromVn(`${toVn(now).slice(0, 10)}T00:00`);

    return machines
        .filter((m) => !id || m.id === id)
        .map(({ id, name, short, area, group }) => {
            const toOrder = (o: OrderRow) => ({ id: o.id, code: orderCode(o.seq), start: toVn(o.start), end: toVn(o.end) });
            const all = orders.filter((o) => o.machine === id && o.end > today);
            const ended = all.filter((o) => o.end <= now);
            const pending = all.slice(ended.length);
            const list = pending.map(toOrder);
            const running = pending.length > 0 && pending[0].start <= now;
            const names = (role: WorkerRole) => workers.filter((w) => w.machine === id && w.role === role).map((w) => w.name);
            return {
                id,
                name,
                short,
                area,
                group,
                previous: ended.length ? toOrder(ended[ended.length - 1]) : null,
                current: running ? list[0] : null,
                queue: running ? list.slice(1) : list,
                operators: names('operators'),
                counters: names('counters'),
            };
        });
}

export const getMachine = async (id: string) => (await getMachines(id))[0];
