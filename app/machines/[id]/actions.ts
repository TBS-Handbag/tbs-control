'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { z } from 'zod';
import { addWork, PERSON_NAME, skipLunch, workMs } from '@/lib/data/machines';
import { commit, fromVn, orderCode, readSheet, toVn, type OrderRow, type Sheet } from '@/lib/data/sheet';

type Result = { error?: string };

const name = z.string().trim().min(1).max(50).transform((s) => s.replace(/\s+/g, ' '));
const role = z.enum(['operators', 'counters']);
const time = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/);
const orderInput = z.union([z.object({ start: time, end: time }), z.object({ duration: time })]);

const MIN = 60_000;
const minutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
};
const floorMin = (ms: number) => Math.floor(ms / MIN) * MIN;
// "2026-10-29" theo giờ VN
const dayVn = (ms: number) => toVn(ms).slice(0, 10);
const hhmm = (ms: number) => toVn(ms).slice(11, 16);
/** Mọi lệnh phải xong trước 22:00 (giờ VN) của ngày bắt đầu */
const deadline = (ms: number) => fromVn(`${dayVn(ms)}T22:00`);
const orderValues = (o: OrderRow) => [o.id, o.machine, o.day, o.seq, toVn(o.start), toVn(o.end)];
const toUpdate = (o: OrderRow) => ({ row: o.row, values: orderValues(o) });
/** Xếp các lệnh liền nhau từ `from`, giữ thời lượng làm việc (bỏ nghỉ trưa) của từng lệnh. */
const rechain = (list: OrderRow[], from: number) =>
    list.map((o) => {
        const start = skipLunch(from);
        from = addWork(start, workMs(o.start, o.end));
        return { ...o, start, end: from };
    });

const invalid: Result = { error: 'Dữ liệu không hợp lệ' };

let queue: Promise<unknown> = Promise.resolve();

/** Đọc sheet -> `fn` kiểm tra + ghi; trả chuỗi là lỗi hiện cho người dùng. */
function mutate(fn: (db: Sheet) => Promise<string | void>): Promise<Result> {
    // shortcut: Sheets không có transaction, khoá này chỉ xếp hàng trong 1 process; deploy nhiều instance
    // (serverless) thì 2 người sửa cùng máy cùng lúc có thể ghi đè nhau, khi đó chuyển sang DB thật.
    const job = queue.then(async (): Promise<Result> => {
        try {
            const error = await fn(await readSheet());
            if (error) return { error };
            updateTag('sheet');
            revalidatePath('/', 'layout');
            return {};
        } catch (e) {
            console.error(e);
            return { error: 'Không lưu được, thử lại sau' };
        }
    });
    queue = job;
    return job;
}

/** Lệnh của máy (đã sắp theo giờ bắt đầu); undefined khi không có máy. */
const machineOrders = (db: Sheet, id: string) =>
    db.machines.some((m) => m.id === id) ? db.orders.filter((o) => o.machine === id) : undefined;

export async function renameMachine(id: string, input: string): Promise<Result> {
    const parsed = name.safeParse(input);
    if (!parsed.success) return invalid;
    return mutate(async (db) => {
        const m = db.machines.find((x) => x.id === id);
        if (!m) return `Không tìm thấy máy ${id}`;
        await commit('machines', { update: [{ row: m.row, values: [m.id, parsed.data, m.short, m.area, m.group, m.sort] }] });
    });
}

export async function addWorker(id: string, inputRole: string, input: string): Promise<Result> {
    const r = role.safeParse(inputRole);
    const n = name.safeParse(input);
    if (!r.success || !n.success || !PERSON_NAME.test(n.data)) return invalid;
    return mutate(async (db) => {
        if (!db.machines.some((m) => m.id === id)) return `Không tìm thấy máy ${id}`;
        const lower = n.data.toLowerCase();
        if (db.workers.some((w) => w.machine === id && w.role === r.data && w.name.toLowerCase() === lower))
            return `${n.data} đã có trong danh sách`;
        await commit('workers', { add: [[id, r.data, n.data]] });
    });
}

export async function removeWorker(id: string, inputRole: string, input: string): Promise<Result> {
    const r = role.safeParse(inputRole);
    if (!r.success) return invalid;
    return mutate(async (db) => {
        const rows = db.workers.filter((w) => w.machine === id && w.role === r.data && w.name === input).map((w) => w.row);
        await commit('workers', { remove: rows });
    });
}

/** Máy trống: { start, end } là giờ hôm nay. Máy còn lệnh: { duration } nối sau lệnh cuối. */
export async function createOrder(id: string, input: z.input<typeof orderInput>): Promise<Result> {
    const parsed = orderInput.safeParse(input);
    if (!parsed.success) return invalid;
    const v = parsed.data;
    const range = 'start' in v;
    const duration = (range ? minutes(v.end) - minutes(v.start) : minutes(v.duration)) * MIN;
    if (duration <= 0) return { error: range ? 'Giờ kết thúc phải sau giờ bắt đầu' : 'Thời lượng phải lớn hơn 0' };

    return mutate(async (db) => {
        const mine = machineOrders(db, id);
        if (!mine) return `Không tìm thấy máy ${id}`;
        const now = Date.now();
        // Lệnh nối liền: máy còn lệnh thì bắt đầu ngay khi lệnh cuối kết thúc, máy trống thì ở giờ người dùng chọn.
        const last = mine.filter((o) => o.end > now).at(-1);
        const base = last ? last.end : floorMin(range ? fromVn(`${dayVn(now)}T${v.start.slice(0, 5)}`) : now);
        // chọn giờ thì giữ đúng giờ người dùng nhập; nhập thời lượng thì không tính nghỉ trưa
        const start = range ? base : skipLunch(base);
        const end = range ? start + duration : addWork(start, duration);
        if (end <= now) return 'Giờ kết thúc đã qua, chọn giờ muộn hơn';

        const dl = deadline(start);
        if (start >= dl) return 'Đã quá 22:00, không tạo thêm lệnh trong ngày';
        if (end > dl) {
            const max = workMs(start, dl) / MIN;
            return `Lệnh phải kết thúc trước 22:00, thời lượng tối đa ${Math.floor(max / 60)}:${String(max % 60).padStart(2, '0')}`;
        }

        const overlap = mine.filter((o) => o.start < end && o.end > start).sort((a, b) => b.end - a.end)[0];
        if (overlap)
            return `Trùng giờ với lệnh ${orderCode(overlap.seq)} đã chạy, chọn giờ bắt đầu từ ${hhmm(overlap.end)} trở đi`;

        // mã lệnh đếm lại từ L01 mỗi ngày (giờ VN) cho từng máy
        const day = dayVn(now);
        const seq = Math.max(0, ...mine.filter((o) => o.day === day).map((o) => o.seq)) + 1;
        const orderId = Math.max(0, ...db.orders.map((o) => o.id)) + 1;
        await commit('orders', { add: [orderValues({ row: 0, id: orderId, machine: id, day, seq, start, end })] });
    });
}

/** Dừng sớm lệnh đang chạy: kết thúc ở phút hiện tại, cả hàng chờ dời lên cùng độ lệch. */
export async function stopOrder(id: string): Promise<Result> {
    return mutate(async (db) => {
        const mine = machineOrders(db, id) ?? [];
        const now = Date.now();
        const cur = mine.find((o) => o.start <= now && o.end > now);
        if (!cur) return;
        const stop = Math.max(floorMin(now), cur.start);
        const after = rechain(mine.filter((o) => o.start >= cur.end), stop).map(toUpdate);
        await commit(
            'orders',
            stop === cur.start
                ? { update: after, remove: [cur.row] }
                : { update: [...after, { row: cur.row, values: orderValues({ ...cur, end: stop }) }] },
        );
    });
}

/** Lệnh đang Hoạt động / vừa kết thúc chạy quá giờ: dời giờ kết thúc tới `end` (HH:mm), hàng chờ lùi theo. */
export async function extendOrder(id: string, orderId: number, end: string): Promise<Result> {
    if (!Number.isSafeInteger(orderId) || !time.safeParse(end).success) return invalid;
    return mutate(async (db) => {
        const mine = machineOrders(db, id) ?? [];
        const now = Date.now();
        const o = mine.find((x) => x.id === orderId);
        if (!o) return 'Không tìm thấy lệnh';
        // chỉ lệnh đang Hoạt động hoặc lệnh kết thúc gần nhất: đã bắt đầu và không có lệnh nào kết thúc sau nó
        if (o.start > now || mine.some((x) => x.end <= now && x.start > o.start))
            return 'Chỉ thêm giờ được cho lệnh đang Hoạt động hoặc lệnh vừa kết thúc';

        const newEnd = fromVn(`${dayVn(o.end)}T${end.slice(0, 5)}`);
        if (newEnd <= o.end) return `Giờ kết thúc mới phải sau ${hhmm(o.end)}`;

        const after = mine.filter((x) => x.start >= o.end);
        // lệnh sau cách một khoảng trống thì chỉ lùi khi bị đè
        const moved = after.length && newEnd > after[0].start ? rechain(after, newEnd) : [];
        const dl = deadline(o.start);
        if (Math.max(newEnd, ...moved.map((x) => x.end)) > dl) {
            // shortcut: không cộng lại nghỉ trưa nếu giờ muộn nhất lùi về trước 12:30, hàng chờ dài cỡ đó thì tính lùi chính xác
            const work = after.reduce((n, x) => n + workMs(x.start, x.end), 0);
            return `Cả hàng chờ phải xong trước 22:00, giờ kết thúc muộn nhất ${hhmm(dl - work)}`;
        }

        await commit('orders', { update: [...moved.map(toUpdate), toUpdate({ ...o, end: newEnd })] });
    });
}

/** Xoá hẳn 1 lệnh (chờ hoặc đang Hoạt động), các lệnh sau dời lên. */
export async function deleteOrder(id: string, orderId: number): Promise<Result> {
    if (!Number.isSafeInteger(orderId)) return invalid;
    return mutate(async (db) => {
        const mine = machineOrders(db, id) ?? [];
        const now = Date.now();
        const o = mine.find((x) => x.id === orderId);
        if (!o) return;
        if (o.end <= now) return `Lệnh ${orderCode(o.seq)} đã kết thúc`;
        // lệnh đang Hoạt động thì lệnh sau bắt đầu từ phút hiện tại, lệnh chờ thì từ giờ bắt đầu của nó
        const from = Math.max(floorMin(now), o.start);
        const after = rechain(mine.filter((x) => x.start >= o.end), from).map(toUpdate);
        await commit('orders', { update: after, remove: [o.row] });
    });
}
