import Link from 'next/link';
import { Suspense } from 'react';
import { PageHeader } from '@/components/machines/page-header';
import { AREAS, machinesByArea, stat } from '@/lib/data/machines';
import { cn } from '@/lib/utils';
import { StatusPill } from '@/components/machines/status-pill';

const FILTERS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'run', label: 'Đang chạy' },
    { value: 'stop', label: 'Dừng' },
] as const;

type Filter = (typeof FILTERS)[number]['value'];

async function PressGrid({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
    const { status } = await searchParams;
    const filter: Filter = status === 'run' || status === 'stop' ? status : 'all';
    const all = machinesByArea('press');
    const counts = stat(all);
    const countOf = { all: counts.total, run: counts.run, stop: counts.stop };
    const list = all.filter((m) => filter === 'all' || m.running === (filter === 'run'));

    return (
        <>
            <nav aria-label="Lọc theo trạng thái" className="flex flex-wrap gap-2">
                {FILTERS.map((f) => {
                    const active = f.value === filter;
                    return (
                        <Link
                            key={f.value}
                            href={f.value === 'all' ? '?' : `?status=${f.value}`}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                                'flex items-center gap-1.5 px-3 border rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-10 font-semibold text-sm',
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
                <ul className="gap-2.5 grid grid-cols-3">
                    {list.map((m) => (
                        <li key={m.id}>
                            <Link
                                href={`/machines/${m.id}`}
                                className={cn(
                                    'flex flex-col items-start gap-1.5 px-2.5 pt-2 pb-3 border rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full min-h-24',
                                    m.running ? 'bg-card border-line' : 'bg-stop-cell border-stop-line',
                                )}
                            >
                                <StatusPill running={m.running} className="" />
                                <span className="w-full font-bold text-base truncate">{m.name}</span>
                                <span className="mt-auto text-subText text-xs">
                                    <b className="text-main">{m.queue.length}</b> lệnh chờ
                                </span>
                            </Link>
                        </li>
                    ))}
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
