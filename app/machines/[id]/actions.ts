'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { PERSON_NAME } from '@/lib/data/machines';
import { createClient } from '@/lib/supabase/server';

type Result = { error?: string };
type DbError = { code: string; message: string } | null;

const name = z.string().trim().min(1).max(50).transform((s) => s.replace(/\s+/g, ' '));
const role = z.enum(['operators', 'counters']);
const time = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/);
const orderInput = z.union([z.object({ start: time, end: time }), z.object({ duration: time })]);

const seconds = (t: string) => {
    const [h, m, s = 0] = t.split(':').map(Number);
    return h * 3600 + m * 60 + s;
};
// "2026-10-29" theo giờ VN
const todayVn = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());

function done(error: DbError, duplicate?: string): Result {
    if (!error) {
        revalidatePath('/', 'layout');
        return {};
    }
    if (error.code === '23505' && duplicate) return { error: duplicate };
    // P0001: lỗi raise từ RPC, message đã là tiếng Việt
    if (error.code === 'P0001') return { error: error.message };
    console.error(error);
    return { error: 'Không lưu được, thử lại sau' };
}

const invalid: Result = { error: 'Dữ liệu không hợp lệ' };

export async function renameMachine(id: string, input: string): Promise<Result> {
    const parsed = name.safeParse(input);
    if (!parsed.success) return invalid;
    const supabase = await createClient();
    const { error } = await supabase.from('machines').update({ name: parsed.data }).eq('id', id);
    return done(error);
}

export async function addWorker(id: string, inputRole: string, input: string): Promise<Result> {
    const r = role.safeParse(inputRole);
    const n = name.safeParse(input);
    if (!r.success || !n.success || !PERSON_NAME.test(n.data)) return invalid;
    const supabase = await createClient();
    const { error } = await supabase.from('machine_workers').insert({ machine_id: id, role: r.data, name: n.data });
    return done(error, `${n.data} đã có trong danh sách`);
}

export async function removeWorker(id: string, inputRole: string, input: string): Promise<Result> {
    const r = role.safeParse(inputRole);
    if (!r.success) return invalid;
    const supabase = await createClient();
    const { error } = await supabase
        .from('machine_workers')
        .delete()
        .match({ machine_id: id, role: r.data, name: input });
    return done(error);
}

/** Máy trống: { start, end } là giờ hôm nay. Máy còn lệnh: { duration } nối sau lệnh cuối. */
export async function createOrder(id: string, input: z.input<typeof orderInput>): Promise<Result> {
    const parsed = orderInput.safeParse(input);
    if (!parsed.success) return invalid;
    const v = parsed.data;
    const range = 'start' in v;
    const duration = range ? seconds(v.end) - seconds(v.start) : seconds(v.duration);
    if (duration <= 0) return { error: range ? 'Giờ kết thúc phải sau giờ bắt đầu' : 'Thời lượng phải lớn hơn 0' };
    const supabase = await createClient();
    const { error } = await supabase.rpc('create_order', {
        p_machine: id,
        p_start: range ? `${todayVn()}T${v.start}+07:00` : null,
        p_duration: `${duration} seconds`,
    });
    return done(error);
}

export async function stopOrder(id: string): Promise<Result> {
    const supabase = await createClient();
    const { error } = await supabase.rpc('stop_order', { p_machine: id });
    return done(error);
}

/** Xoá hẳn 1 lệnh (chờ hoặc đang Hoạt động), các lệnh sau dời lên. */
export async function deleteOrder(id: string, orderId: number): Promise<Result> {
    if (!Number.isSafeInteger(orderId)) return invalid;
    const supabase = await createClient();
    const { error } = await supabase.rpc('delete_order', { p_machine: id, p_order: orderId });
    return done(error);
}
