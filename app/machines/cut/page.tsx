import Link from 'next/link';
import { LuLightbulb } from 'react-icons/lu';
import { OrderProgress } from '@/components/machines/order-progress';
import { PageHeader } from '@/components/machines/page-header';
import { STATUS_STYLE } from '@/components/machines/status-pill';
import { AREAS, CUT_GROUPS, type Machine, machinesByArea, statusOf } from '@/lib/data/machines';
import { cn } from '@/lib/utils';

/**
 * Gợi ý cân tải: nhóm nào có máy rảnh thì chuyển nửa hàng chờ của máy dồn nhiều nhất nhóm đó sang.
 * Chỉ trả về gợi ý dồn nặng nhất toàn khu, null nếu không có.
 */
function suggestRebalance(machines: Machine[]) {
    let best: { from: Machine; to: Machine; count: number } | null = null;

    for (const group of new Set(machines.map((m) => m.group))) {
        const inGroup = machines.filter((m) => m.group === group);
        const free = inGroup.find((m) => !m.current);
        if (!free) continue;

        const busiest = inGroup.reduce((a, b) => (b.queue.length > a.queue.length ? b : a));
        const count = Math.floor(busiest.queue.length / 2);
        if (count === 0) continue;

        if (!best || busiest.queue.length > best.from.queue.length) best = { from: busiest, to: free, count };
    }

    return best;
}

export default function CutAreaPage() {
    const machines = machinesByArea('cut');
    const hint = suggestRebalance(machines);

    return (
        <>
            <PageHeader title={AREAS.cut.title} backHref="/" />
            <main className="flex flex-col gap-5 px-4 pb-8">
                {hint && (
                    <p
                        role="note"
                        className="flex gap-2.5 bg-idle-bg p-3 border border-idle-line rounded-2xl text-idle-fg text-sm"
                    >
                        <LuLightbulb aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
                        <span>
                            {hint.from.name} đang dồn {hint.from.queue.length} lệnh trong khi {hint.to.name} rảnh.{' '}
                            <Link
                                href={`/machines/${hint.from.id}`}
                                className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-semibold underline underline-offset-2"
                            >
                                Chuyển {hint.count} lệnh
                            </Link>
                        </span>
                    </p>
                )}

                {CUT_GROUPS.map((group) => {
                    const items = machines.filter((m) => m.group === group);
                    return (
                        <section key={group} aria-labelledby={`group-${group}`} className="flex flex-col gap-2">
                            <div className="flex justify-between items-baseline px-1">
                                <h2 id={`group-${group}`} className="font-semibold text-mainText text-base">
                                    {group}
                                </h2>
                            </div>
                            <ul className="bg-card border border-line rounded-2xl divide-y divide-line-soft overflow-hidden">
                                {items.map((m) => (
                                    <MachineRow key={m.id} m={m} />
                                ))}
                            </ul>
                        </section>
                    );
                })}
            </main>
        </>
    );
}

function MachineRow({ m }: { m: Machine }) {
    const status = statusOf(m);
    // bg-run (xanh đậm) gần như đen trên nền trắng nên chấm máy chạy dùng xanh sáng
    const dot = status === 'run' ? 'bg-run-light' : STATUS_STYLE[status].dot;
    // đang chạy lệnh cuối (0 chờ) thì tô vàng để báo sắp hết lệnh
    const queuePill = m.queue.length ? 'bg-surface text-mainText' : STATUS_STYLE.idle.pill;

    return (
        <li>
            <Link
                href={`/machines/${m.id}`}
                className={cn(
                    'flex flex-col gap-1.5 focus-visible:bg-main-tint shadow px-4 py-3 focus-visible:outline-none min-h-16',
                    // máy rảnh: nền đỏ nhạt + vạch trái để nổi giữa danh sách; pl-3 + viền 4px = px-4 cho thẳng hàng chữ
                    !m.current && 'bg-stop-cell border-l-4 border-l-stop pl-3',
                )}
            >
                <span className="flex items-center gap-2 min-w-0">
                    <span aria-hidden="true" className={cn('rounded-full size-2.5 shrink-0', dot)} />
                    <span className="flex-1 min-w-0 font-bold text-mainText text-lg truncate">
                        {m.name}
                        <span className="sr-only"> ({STATUS_STYLE[status].label})</span>
                    </span>
                    {m.current ? (
                        <span className={cn('px-2.5 py-0.5 rounded-full font-semibold text-sm shrink-0', queuePill)}>
                            {m.queue.length} chờ
                        </span>
                    ) : (
                        <span
                            className={cn(
                                'px-2.5 py-0.5 rounded-full font-semibold text-sm shrink-0',
                                STATUS_STYLE.stop.band,
                            )}
                        >
                            Rảnh
                        </span>
                    )}
                </span>

                {m.current ? (
                    <OrderProgress order={m.current} />
                ) : (
                    <span className="text-stop-fg text-sm">Không có lệnh </span>
                )}
            </Link>
        </li>
    );
}
