import { notFound } from 'next/navigation';
import { MachineNameEditor } from '@/components/machines/machine-name-editor';
import { NewOrderForm } from '@/components/machines/new-order-form';
import { PageHeader } from '@/components/machines/page-header';
import { WorkerList } from '@/components/machines/worker-list';
import { AREAS, MACHINES, WORKER_ROLES, formatDateTime, formatDuration, getMachine } from '@/lib/data/machines';
import { cn } from '@/lib/utils';

export function generateStaticParams() {
    return MACHINES.map((m) => ({ id: m.id }));
}

const cardClass = 'flex flex-col bg-card p-4 border border-line rounded-2xl';
const eyebrowClass = 'font-semibold text-subText text-xs tracking-wide';

export default async function MachineDetailPage({ params }: PageProps<'/machines/[id]'>) {
    const { id } = await params;
    const m = getMachine(id);
    if (!m) notFound();

    const area = AREAS[m.area];
    const cur = m.current;
    const finish = formatDateTime(m.queue.at(-1)?.end ?? cur?.end);
    const cs = formatDateTime(cur?.start);
    const ce = formatDateTime(cur?.end);

    return (
        <>
            <PageHeader title="Chi tiết máy" backHref={area.href} />
            <main className="flex flex-col gap-3 px-4 pb-10">
                <section aria-label="Tên máy" className={cn(cardClass, 'gap-2')}>
                    <span className={eyebrowClass}>TÊN MÁY</span>
                    <MachineNameEditor initialName={m.name} />
                    <span className="text-subText text-sm">
                        {m.area === 'cut' ? `${area.title} · Nhóm ${m.group}` : area.title}
                    </span>
                </section>

                <section className={cn(cardClass, 'gap-1 py-3.5')}>
                    <span className={eyebrowClass}>TRẠNG THÁI</span>
                    <span
                        className={cn(
                            'flex items-center gap-2 font-bold text-lg',
                            m.running ? 'text-run-fg' : 'text-stop-fg',
                        )}
                    >
                        {m.running ? 'Đang hoạt động' : 'Không hoạt động'}
                    </span>
                    <span className="text-subText text-xs">Tự cập nhật theo lệnh hiện tại của máy</span>
                </section>

                <section aria-labelledby="workers" className={cn(cardClass, 'gap-4')}>
                    <h2 id="workers" className="font-bold text-base">
                        Công nhân phụ trách
                    </h2>
                    {WORKER_ROLES.map(({ role, title }, i) => (
                        <div key={role} className={cn(i > 0 && 'pt-4 border-t border-line-soft')}>
                            <WorkerList title={title} initialNames={m[role]} />
                        </div>
                    ))}
                </section>

                <div className="gap-3 grid grid-cols-2">
                    <div className="flex flex-col gap-1 bg-main px-4 py-3.5 rounded-2xl text-white">
                        <span className="text-onMainSub text-xs">Lệnh đang chờ</span>
                        <span className="font-bold text-3xl leading-tight">{m.queue.length}</span>
                    </div>
                    <div className={cn(cardClass, 'gap-1 py-3.5')}>
                        <span className="text-subText text-xs">Xong hàng chờ lúc</span>
                        <span className="font-bold text-main text-2xl">{finish.time}</span>
                        <span className="text-subText text-xs">{finish.date || 'Không có lệnh'}</span>
                    </div>
                </div>

                <section aria-labelledby="current-order" className={cn(cardClass, 'gap-3')}>
                    <div className="flex justify-between items-center gap-2">
                        <h2 id="current-order" className="font-bold text-base">
                            Lệnh hiện tại
                        </h2>
                        <span className="bg-main-tint px-2 py-0.5 rounded-lg font-semibold text-main text-sm">
                            {cur ? cur.code : 'Trống'}
                        </span>
                    </div>
                    {cur ? (
                        <>
                            <div className="gap-2.5 grid grid-cols-2">
                                {[
                                    { label: 'Bắt đầu', v: cs },
                                    { label: 'Kết thúc', v: ce },
                                ].map(({ label, v }) => (
                                    <div key={label} className="flex flex-col gap-0.5 bg-surface p-3 rounded-xl">
                                        <span className="text-subText text-xs">{label}</span>
                                        <span className="font-bold text-2xl">{v.time}</span>
                                        <span className="text-subText text-xs">{v.date}</span>
                                    </div>
                                ))}
                            </div>
                            <span className="text-subText text-sm">
                                Thời lượng: <b className="text-foreground">{formatDuration(cur.start, cur.end)}</b>
                            </span>
                        </>
                    ) : (
                        <p className="text-subText text-sm">Máy chưa có lệnh đang chạy.</p>
                    )}
                </section>

                <NewOrderForm />

                <section aria-labelledby="queue" className={cn(cardClass, 'gap-1')}>
                    <h2 id="queue" className="mb-1.5 font-bold text-base">
                        Lệnh đang chờ ({m.queue.length})
                    </h2>
                    {m.queue.length === 0 ? (
                        <p className="text-subText text-sm">Chưa có lệnh chờ.</p>
                    ) : (
                        <ol className="divide-y divide-line-soft">
                            {m.queue.map((o, i) => {
                                const st = formatDateTime(o.start);
                                const et = formatDateTime(o.end);
                                return (
                                    <li key={o.code} className="flex items-center gap-3 py-2.5">
                                        <span className="flex justify-center items-center bg-main-tint rounded-lg size-8 font-bold text-main text-sm shrink-0">
                                            {i + 1}
                                        </span>
                                        <span className="flex flex-col flex-1 min-w-0">
                                            <span className="font-semibold text-base">{o.code}</span>
                                            <span className="text-subText text-xs">{st.date}</span>
                                        </span>
                                        <span className="font-semibold tabular-nums text-sm whitespace-nowrap">
                                            {st.time} → {et.time}
                                        </span>
                                    </li>
                                );
                            })}
                        </ol>
                    )}
                </section>
            </main>
        </>
    );
}
