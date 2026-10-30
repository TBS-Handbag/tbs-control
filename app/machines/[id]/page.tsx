import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Loading } from '@/components/loading';
import { DetailSection, cardClass } from '@/components/machines/detail-section';
import { MachineNameEditor } from '@/components/machines/machine-name-editor';
import { OrderQueue } from '@/components/machines/order-queue';
import { PageHeader } from '@/components/machines/page-header';
import { StatusPill } from '@/components/machines/status-pill';
import { WorkerList } from '@/components/machines/worker-list';
import { getMachine } from '@/lib/data/get-machines';
import { AREAS, WORKER_ROLES, statusOf } from '@/lib/data/machines';
import { cn } from '@/lib/utils';

export default function MachineDetailPage({ params }: PageProps<'/machines/[id]'>) {
    return (
        <Suspense fallback={<Loading />}>
            <MachineDetail params={params} />
        </Suspense>
    );
}

async function MachineDetail({ params }: Pick<PageProps<'/machines/[id]'>, 'params'>) {
    const { id } = await params;
    const m = await getMachine(id);
    if (!m) notFound();

    const area = AREAS[m.area];
    const status = statusOf(m);
    return (
        <>
            <PageHeader title="Chi tiết máy" backHref={area.href} />
            <main className="flex flex-col gap-4 px-4 pb-12">
                <section aria-label="Thông tin máy" className={cn(cardClass, 'flex flex-col gap-3 p-4')}>
                    <MachineNameEditor id={m.id} name={m.name} />
                    {/* không wrap cả dòng để vạch ngăn luôn nằm cạnh pill; màn hẹp thì chữ khu vực tự xuống dòng */}
                    <div className="flex items-center gap-3">
                        <StatusPill
                            status={status}
                            label={status === 'run' ? 'Đang hoạt động' : undefined}
                            className="px-3 py-1.5 font-medium text-sm"
                        />
                        <span className="pl-3 border-line border-l min-w-0 text-subText text-sm">{area.title}</span>
                    </div>
                </section>

                <OrderQueue machineId={m.id} current={m.current} queue={m.queue} />

                <DetailSection title="Công nhân phụ trách">
                    {WORKER_ROLES.map(({ role, title }) => (
                        <WorkerList key={role} machineId={m.id} role={role} title={title} names={m[role]} />
                    ))}
                </DetailSection>
            </main>
        </>
    );
}
