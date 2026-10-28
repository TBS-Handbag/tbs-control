import Link from 'next/link';
import { LuChevronRight } from 'react-icons/lu';
import { PageHeader } from '@/components/machines/page-header';
import { StatusPill } from '@/components/machines/status-pill';
import { AREAS, CUT_GROUPS, machinesByArea, statusOf } from '@/lib/data/machines';

export default function CutAreaPage() {
    const machines = machinesByArea('cut');

    return (
        <>
            <PageHeader title={AREAS.cut.title} backHref="/" />
            <main className="flex flex-col gap-5 px-4 pb-8">
                {CUT_GROUPS.map((group) => {
                    const items = machines.filter((m) => m.group === group);
                    return (
                        <section key={group} aria-labelledby={`group-${group}`} className="flex flex-col gap-2">
                            <div className="flex justify-between items-baseline px-1">
                                <h2
                                    id={`group-${group}`}
                                    className="font-bold text-main text-base uppercase tracking-wide"
                                >
                                    {group}
                                </h2>
                                {/* <span className="text-subText text-xs">{items.length} máy</span> */}
                            </div>
                            <ul className="bg-card border border-line rounded-2xl divide-y divide-line-soft overflow-hidden">
                                {items.map((m) => (
                                    <li key={m.id}>
                                        <Link
                                            href={`/machines/${m.id}`}
                                            className="flex items-center gap-3 focus-visible:bg-main-tint py-3 pr-3 pl-4 focus-visible:outline-none min-h-16"
                                        >
                                            <span className="flex flex-col flex-1 gap-0.5 min-w-0">
                                                <span className="font-semibold text-base truncate">{m.name}</span>
                                                <span className="text-subText text-xs">
                                                    {m.queue.length
                                                        ? `${m.queue.length} lệnh chờ`
                                                        : 'Không có lệnh chờ'}
                                                </span>
                                            </span>
                                            <StatusPill status={statusOf(m)} />
                                            <LuChevronRight
                                                aria-hidden="true"
                                                className="size-5 text-iconMuted shrink-0"
                                            />
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
