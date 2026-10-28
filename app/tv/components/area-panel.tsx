import type { ReactNode } from 'react';
import { StatusPill } from '@/components/machines/status-pill';
import { AREAS, type Area, machinesByArea, stat } from '@/lib/data/machines';

export function AreaPanel({ area, children }: { area: Area; children: ReactNode }) {
    const list = machinesByArea(area);
    const s = stat(list);
    const queued = list.reduce((n, m) => n + m.queue.length, 0);
    return (
        <section
            aria-labelledby={`tv-${area}`}
            className="flex flex-col gap-3 bg-card shadow-lg shadow-main/10 p-4 border border-line rounded-2xl min-w-0 min-h-0"
        >
            <header className="flex items-center gap-3 shrink-0">
                <div className="flex flex-col flex-1 min-w-0">
                    {/* <span className="font-bold text-main-muted text-sm tracking-wider">
                        KHU VỰC {AREAS[area].index}
                    </span> */}
                    <h2 id={`tv-${area}`} className="font-bold text-main text-3xl truncate leading-tight">
                        {AREAS[area].title}
                    </h2>
                </div>
                <StatusPill running label={`${s.run} đang chạy`} className="px-3 text-lg" />
                <StatusPill running={false} label={`${s.stop} dừng`} className="px-3 text-lg" />
                <span className="bg-main-tint px-3 py-1 rounded-full font-semibold text-main text-lg shrink-0">
                    {queued} lệnh chờ
                </span>
            </header>
            {list.length === 0 ? (
                <p className="flex flex-1 justify-center items-center text-subText text-xl">
                    Chưa có máy trong khu vực.
                </p>
            ) : (
                children
            )}
        </section>
    );
}
