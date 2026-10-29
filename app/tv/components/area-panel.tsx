import type { ReactNode } from 'react';
import { StatusPill } from '@/components/machines/status-pill';
import { AREAS, type Area, machinesByArea, stat } from '@/lib/data/machines';

export function AreaPanel({ area, children }: { area: Area; children: ReactNode }) {
    const list = machinesByArea(area);
    const s = stat(list);
    return (
        <section
            aria-labelledby={`tv-${area}`}
            className="flex flex-col gap-3 bg-card p-4 border-2 border-white/10 rounded-2xl min-w-0 min-h-0"
        >
            <header className="flex items-center gap-3 mb-1 shrink-0">
                <div className="flex flex-col flex-1 min-w-0">
                    <h2
                        id={`tv-${area}`}
                        className="pl-2 border-transparent border-l-4 border-l-zone font-extrabold text-mainText text-3xl truncate leading-tight"
                    >
                        {AREAS[area].title}
                    </h2>
                </div>
                <StatusPill status="run" label={`${s.run} đang Hoạt động`} className="px-3 font-bold text-lg" />
                {/* Hết lệnh chờ / Nhàn rỗi chỉ tô đặc khi có máy, để mắt nhảy vào chỗ cần xử lý */}
                <StatusPill
                    solid={s.idle > 0}
                    status="idle"
                    label={`${s.idle} Hết lệnh chờ`}
                    className="px-3 font-bold text-lg"
                />
                <StatusPill
                    solid={s.stop > 0}
                    status="stop"
                    label={`${s.stop} Nhàn rỗi`}
                    className="px-3 font-bold text-lg"
                />
                <span className="bg-white px-3 py-0.5 rounded-full font-bold text-ink text-lg shrink-0">
                    {s.queued} lệnh chờ
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
