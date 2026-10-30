import Link from 'next/link';
import { Suspense } from 'react';
import { Loading } from '@/components/loading';
import { PageHeader } from '@/components/machines/page-header';
import { STATUS_STYLE } from '@/components/machines/status-pill';
import { getMachines } from '@/lib/data/get-machines';
import { AREAS, type Status, machinesByArea, stat, statusOf } from '@/lib/data/machines';
import { cn } from '@/lib/utils';

// màu theo trạng thái; máy giữ vị trí cố định theo `sort`
const LEGEND: { status: Status; title: string; tile: string; text: string }[] = [
    {
        status: 'stop',
        title: 'Không hoạt động',
        tile: STATUS_STYLE.stop.cell,
        text: 'text-stop-fg',
    },
    {
        status: 'idle',
        title: 'Hết lệnh chờ',
        // nền nhạt, viền đậm màu band TV
        tile: 'bg-idle-bg border-2 border-idle',
        text: 'text-idle-fg',
    },
    {
        status: 'run',
        title: 'Có lệnh chờ',
        tile: 'bg-run-bg border-2 border-run-band',
        text: 'text-run-fg',
    },
];

const STYLE = Object.fromEntries(LEGEND.map((l) => [l.status, l])) as Record<Status, (typeof LEGEND)[number]>;

export default function PressAreaPage() {
    return (
        <Suspense fallback={<Loading />}>
            <PressArea />
        </Suspense>
    );
}

async function PressArea() {
    const machines = machinesByArea(await getMachines(), 'press');
    const { queued } = stat(machines);

    return (
        <>
            <PageHeader title={AREAS.press.title} backHref="/" />
            <main className="flex flex-col gap-4 px-4 pb-8">
                <section aria-label="Tổng quan" className="flex flex-col gap-4">
                    <p className="pl-2 border-l-4 border-l-main font-semibold text-main text-base">{queued} lệnh chờ</p>
                    {/* mỗi vạch = 1 máy, cùng thứ tự với lưới */}
                    <div aria-hidden="true" className="flex gap-0.5">
                        {machines.map((m) => (
                            <span key={m.id} className={cn('flex-1 rounded-full h-2', STATUS_STYLE[statusOf(m)].dot)} />
                        ))}
                    </div>
                    <ul aria-label="Chú thích màu" className="flex flex-wrap gap-x-4 gap-y-1">
                        {LEGEND.map(({ status, title }) => (
                            <li key={status} className="flex items-center gap-1.5 font-medium text-mainText text-sm">
                                <span
                                    aria-hidden="true"
                                    className={cn('rounded-full size-3 shrink-0', STATUS_STYLE[status].dot)}
                                />
                                {title}
                            </li>
                        ))}
                    </ul>
                </section>

                <ul className="gap-2 grid grid-cols-3">
                    {machines.map((m) => {
                        const status = statusOf(m);
                        return (
                            <li key={m.id}>
                                <Link
                                    href={`/machines/${m.id}`}
                                    aria-label={`${m.name}, ${STATUS_STYLE[status].label}, ${m.queue.length} lệnh chờ`}
                                    className={cn(
                                        'flex flex-col gap-1 px-3 py-2.5 border rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full min-h-16',
                                        STYLE[status].tile,
                                        STYLE[status].text,
                                    )}
                                >
                                    <span className="font-bold text-xl leading-tight">{m.short}</span>
                                    <span className="font-semibold text-sm">
                                        {status === 'stop' ? 'Nhàn rỗi' : `${m.queue.length} lệnh chờ`}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </main>
        </>
    );
}
