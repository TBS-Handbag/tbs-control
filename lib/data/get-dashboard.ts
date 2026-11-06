import { connection } from 'next/server';
import { workMs } from '@/lib/data/machines';
import { readSheetCached, toVn } from '@/lib/data/sheet';

/** group: chỉ có ở dòng máy, để biểu đồ gom cột theo nhóm */
export type DashboardRow = { label: string; orders: number; hours: number; group?: string };

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
export const DASHBOARD_DAYS = 7;

/** Thống kê lệnh chạy trong 7 ngày lịch gần nhất (hôm nay + 6 ngày trước, cả lệnh đã chạy lẫn kế hoạch):
 *  số đơn + giờ chạy theo ngày, máy, nhóm máy, giờ bắt đầu. Mọi phần cùng phạm vi này.
 *  Ngày/giờ lấy theo `start` giờ VN; giờ chạy bỏ nghỉ trưa giống thời lượng lệnh ở các màn khác. */
export async function getDashboard() {
    await connection();
    const { machines, orders } = await readSheetCached();
    const now = Date.now();
    // gieo sẵn đủ 7 ngày để ngày không có đơn vẫn có cột 0 (VN không có DST nên trừ đúng 24h)
    const dayKeys = Array.from({ length: DASHBOARD_DAYS }, (_, i) =>
        toVn(now - (DASHBOARD_DAYS - 1 - i) * DAY).slice(0, 10),
    );
    const byDay = new Map(dayKeys.map((d) => [d, { label: d, orders: 0, hours: 0 }]));
    const byHour = new Map<string, DashboardRow>();
    // gieo sẵn theo thứ tự `sort` để máy chưa có đơn vẫn hiện cột 0 và đúng thứ tự như màn TV
    // tên ngắn ("01", "TĐ 2") vì biểu đồ đã có tiêu đề nhóm bên dưới
    const byMachine = new Map<string, DashboardRow>(
        machines.map((m) => [m.id, { label: m.short, group: m.group, orders: 0, hours: 0 }]),
    );
    const byGroup = new Map(machines.map((m) => [m.group, { label: m.group, orders: 0, hours: 0 }]));
    const groupOf = new Map(machines.map((m) => [m.id, m.group]));

    const add = (map: Map<string, DashboardRow>, key: string, hours: number) => {
        let r = map.get(key);
        if (!r) map.set(key, (r = { label: key, orders: 0, hours: 0 }));
        r.orders += 1;
        r.hours += hours;
    };

    for (const o of orders) {
        // ô giờ hỏng trên sheet cho ra NaN; bỏ qua để không làm NaN cả tổng và toVn không ném lỗi
        if (Number.isNaN(o.start) || Number.isNaN(o.end)) continue;
        const start = toVn(o.start);
        // ngoài 7 ngày (cũ hơn, hoặc lệnh kế hoạch từ ngày mai trở đi) thì không tính
        if (!byDay.has(start.slice(0, 10))) continue;
        const hours = workMs(o.start, o.end) / HOUR;
        add(byDay, start.slice(0, 10), hours);
        add(byHour, `${start.slice(11, 13)}h`, hours);
        add(byMachine, o.machine, hours);
        add(byGroup, groupOf.get(o.machine) ?? 'Khác', hours);
    }

    const sorted = (map: Map<string, DashboardRow>) => [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
    return {
        days: [...byDay.values()],
        machines: [...byMachine.values()],
        // không lọc nhóm 0 đơn: thứ tự nhóm phải khớp thứ tự cụm máy để 2 biểu đồ cùng màu theo nhóm
        groups: [...byGroup.values()],
        startHours: sorted(byHour),
    };
}
