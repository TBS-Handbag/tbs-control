import Link from 'next/link';
import { PageHeader } from '@/components/machines/page-header';
import { STATUS_STYLE } from '@/components/machines/status-pill';
import { AREAS, type Status, machinesByArea, stat, statusOf } from '@/lib/data/machines';
import { cn } from '@/lib/utils';

// thứ tự ưu tiên: máy cần xử lý lên đầu
const SECTIONS: { status: Status; title: string; summary: string; tile: string; text: string }[] = [
    {
        status: 'stop',
        title: 'Không hoạt động',
        summary: 'không hoạt động',
        tile: STATUS_STYLE.stop.cell,
        text: 'text-stop-fg',
    },
    {
        status: 'idle',
        title: 'Đang chạy, hết lệnh chờ ',
        summary: 'hết lệnh chờ',
        tile: STATUS_STYLE.idle.cell,
        text: 'text-idle-fg',
    },
    {
        status: 'run',
        title: 'Đang chạy, có lệnh chờ',
        summary: 'có lệnh chờ',
        tile: 'bg-card border-line',
        text: 'text-mainText',
    },
];

export default function PressAreaPage() {
    const machines = machinesByArea('press');
    const queued = machines.reduce((sum, m) => sum + m.queue.length, 0);

    return (
        <>
            <PageHeader title={AREAS.press.title} backHref="/" />
            <main className="flex flex-col gap-5 px-4 pb-8">
                <section aria-label="Tổng quan" className="flex flex-col gap-4">
                    <p className="pl-2 border-l-4 border-l-main font-semibold text-main text-base">{queued} lệnh chờ</p>
                    {/* mỗi vạch = 1 máy, xếp theo thứ tự section */}
                    <div aria-hidden="true" className="flex gap-0.5">
                        {SECTIONS.flatMap(({ status }) =>
                            machines
                                .filter((m) => statusOf(m) === status)
                                .map((m) => (
                                    <span
                                        key={m.id}
                                        className={cn('flex-1 rounded-full h-2', STATUS_STYLE[status].dot)}
                                    />
                                )),
                        )}
                    </div>
                </section>

                {SECTIONS.map(({ status, title, tile, text }) => {
                    const items = machines.filter((m) => statusOf(m) === status);
                    if (!items.length) return null;
                    return (
                        <section key={status} aria-labelledby={`sec-${status}`} className="flex flex-col gap-2">
                            <h2
                                id={`sec-${status}`}
                                className="flex items-center gap-2 px-1 font-semibold text-mainText text-lg"
                            >
                                <span
                                    aria-hidden="true"
                                    className={cn('rounded-full size-3.5 shrink-0', STATUS_STYLE[status].dot)}
                                />
                                {title}
                            </h2>
                            <ul className="gap-2 grid grid-cols-3 sm:grid-cols-4">
                                {items.map((m) => (
                                    <li key={m.id}>
                                        <Link
                                            href={`/machines/${m.id}`}
                                            aria-label={`${m.name}, ${STATUS_STYLE[status].label}, ${m.queue.length} lệnh chờ`}
                                            className={cn(
                                                'flex flex-col gap-1 px-3 py-2.5 border rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full min-h-16',
                                                tile,
                                                text,
                                            )}
                                        >
                                            <span className="font-bold text-xl leading-tight">{m.short}</span>
                                            <span
                                                className={cn(
                                                    'font-semibold text-sm',
                                                    status === 'run' && 'text-subText',
                                                )}
                                            >
                                                {status === 'stop' ? 'Nhàn rỗi' : `${m.queue.length} lệnh chờ`}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    );
                })}
            </main>
        </>
    );
}
