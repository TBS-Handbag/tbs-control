import Link from 'next/link';
import { Suspense } from 'react';
import { PageHeader } from '@/components/machines/page-header';
import { AREAS, machinesByArea, stat, statusOf } from '@/lib/data/machines';
import { STATUS_STYLE } from '@/components/machines/status-pill';
import { cn } from '@/lib/utils';

const FILTERS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'run', label: 'Đang chạy' },
    { value: 'idle', label: 'Hết lệnh chờ' },
    { value: 'stop', label: 'Dừng' },
] as const;

type Filter = (typeof FILTERS)[number]['value'];

async function PressGrid({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
    const { status } = await searchParams;
    const filter: Filter = FILTERS.find((f) => f.value === status)?.value ?? 'all';
    const all = machinesByArea('press');
    const counts = stat(all);
    const countOf = { all: counts.total, run: counts.run, idle: counts.idle, stop: counts.stop };
    const list = all.filter((m) => filter === 'all' || statusOf(m) === filter);

    return (
        <>
            {/* màn hẹp không wrap chip, cho vuốt ngang */}
            <nav aria-label="Lọc theo trạng thái" className="flex gap-2 -mx-4 px-4 overflow-x-auto scrollbar-none">
                {FILTERS.map((f) => {
                    const active = f.value === filter;
                    return (
                        <Link
                            key={f.value}
                            href={f.value === 'all' ? '?' : `?status=${f.value}`}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                                'flex items-center gap-1 px-2.5 border rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-10 font-semibold text-sm whitespace-nowrap shrink-0',
                                active
                                    ? 'bg-main border-main text-white'
                                    : 'bg-card border-line-strong text-foreground',
                            )}
                        >
                            {f.label}
                            <span
                                className={cn(
                                    'flex justify-center items-center px-1.5 rounded-full min-w-6 h-6 text-xs',
                                    active ? 'bg-main-soft' : 'bg-main-tint',
                                )}
                            >
                                {countOf[f.value]}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {list.length === 0 ? (
                <p className="my-6 text-subText text-sm text-center">Không có máy nào ở trạng thái này.</p>
            ) : (
                <ul className="gap-2.5 grid grid-cols-2">
                    {list.map((m) => {
                        const status = statusOf(m);
                        return (
                            <li key={m.id}>
                                <Link
                                    href={`/machines/${m.id}`}
                                    className={cn(
                                        'flex flex-col gap-1 px-3 py-2.5 border rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full min-h-16',
                                        STATUS_STYLE[status].cell,
                                        status === 'stop' && 'text-stop-fg',
                                    )}
                                >
                                    <span className="flex items-center gap-2 min-w-0">
                                        <span
                                            aria-hidden="true"
                                            className={cn('rounded-full size-2.5 shrink-0', STATUS_STYLE[status].dot)}
                                        />
                                        <span className="font-bold text-base truncate">
                                            {m.name}
                                            {status !== 'run' && (
                                                <span className="sr-only"> ({STATUS_STYLE[status].label})</span>
                                            )}
                                        </span>
                                    </span>
                                    <span className="flex items-baseline gap-1 pl-4">
                                        <b
                                            className={cn(
                                                'font-bold text-lg leading-none',
                                                m.queue.length === 0 && 'text-subText',
                                            )}
                                        >
                                            {m.queue.length}
                                        </b>
                                        <span className={cn('text-xs', m.running && 'text-subText')}>lệnh chờ</span>
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </>
    );
}

export default function PressAreaPage({ searchParams }: PageProps<'/machines/press'>) {
    return (
        <>
            <PageHeader title={AREAS.press.title} backHref="/" />
            <main className="flex flex-col gap-3.5 px-4 pt-4 pb-8">
                <Suspense fallback={<p className="py-6 text-subText text-sm text-center">Đang tải danh sách máy…</p>}>
                    <PressGrid searchParams={searchParams as Promise<{ status?: string }>} />
                </Suspense>
            </main>
        </>
    );
}
