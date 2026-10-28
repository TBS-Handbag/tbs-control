import { notFound } from 'next/navigation';
import { DetailSection, cardClass } from '@/components/machines/detail-section';
import { MachineNameEditor } from '@/components/machines/machine-name-editor';
import { OrderQueue } from '@/components/machines/order-queue';
import { PageHeader } from '@/components/machines/page-header';
import { StatusPill } from '@/components/machines/status-pill';
import { WorkerList } from '@/components/machines/worker-list';
import { AREAS, MACHINES, WORKER_ROLES, getMachine } from '@/lib/data/machines';
import { cn } from '@/lib/utils';

export function generateStaticParams() {
    return MACHINES.map((m) => ({ id: m.id }));
}

export default async function MachineDetailPage({ params }: PageProps<'/machines/[id]'>) {
    const { id } = await params;
    const m = getMachine(id);
    if (!m) notFound();

    const area = AREAS[m.area];
    return (
        <>
            <PageHeader title="Chi tiết máy" backHref={area.href} />
            <main className="flex flex-col gap-4 px-4 pb-12">
                <section aria-label="Thông tin máy" className={cn(cardClass, 'flex flex-col gap-3 p-4')}>
                    <MachineNameEditor initialName={m.name} />
                    {/* không wrap cả dòng để vạch ngăn luôn nằm cạnh pill; màn hẹp thì chữ khu vực tự xuống dòng */}
                    <div className="flex items-center gap-3">
                        <StatusPill
                            running={m.running}
                            label={m.running ? 'Đang hoạt động' : 'Dừng'}
                            className="px-3 py-1.5 font-medium text-sm"
                        />
                        <span className="pl-3 border-line border-l min-w-0 text-subText text-sm">
                            {m.area === 'cut' ? `${area.title}` : area.title}
                        </span>
                    </div>
                </section>

                <OrderQueue initialCurrent={m.current} initialQueue={m.queue} />

                <DetailSection title="Công nhân phụ trách">
                    {WORKER_ROLES.map(({ role, title }) => (
                        <WorkerList key={role} role={role} title={title} initialNames={m[role]} />
                    ))}
                </DetailSection>
            </main>
        </>
    );
}
