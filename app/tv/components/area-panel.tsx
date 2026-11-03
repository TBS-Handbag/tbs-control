import type { ReactNode } from 'react';
import { StatusPill } from '@/components/machines/status-pill';
import { AREAS, type Area, type Machine, stat } from '@/lib/data/machines';
import { cn } from '@/lib/utils';

export function AreaPanel({
    area,
    list,
    className,
    children,
}: {
    area: Area;
    list: Machine[];
    className?: string;
    children: ReactNode;
}) {
    const s = stat(list);
    return (
        <section
            aria-labelledby={`tv-${area}`}
            className={cn(
                'flex flex-col gap-3 bg-card p-4 border-2 border-white/10 rounded-2xl min-w-0 min-h-0',
                className,
            )}
        >
            {/* panel hẹp: cụm pill rớt xuống dòng dưới thay vì cắt tên khu vực */}
            <header className="flex flex-wrap items-center gap-3 mb-1 shrink-0">
                <div className="flex flex-col max-w-full grow shrink-0">
                    <h2
                        id={`tv-${area}`}
                        className="pl-2 border-transparent border-l-4 border-l-zone font-extrabold text-mainText text-3xl truncate leading-tight"
                    >
                        {AREAS[area].title}
                    </h2>
                </div>
                <div className="flex gap-3">
                    {/* <StatusPill status="run" label={`${s.run} Đang hoạt động`} className="px-3 font-bold text-lg" /> */}
                    {/* Hết lệnh chờ / Nhàn rỗi chỉ tô đặc khi có máy, để mắt nhảy vào chỗ cần xử lý */}
                    {/* <StatusPill
                        solid={s.idle > 0}
                        status="idle"
                        label={`${s.queued} lệnh chờ`}
                        className="px-3 font-bold text-lg"
                    /> */}
                    {/* <StatusPill
                        solid={s.stop > 0}
                        status="stop"
                        label={`${s.stop} Nhàn rỗi`}
                        className="px-3 font-bold text-lg"
                    /> */}
                    <span className="isolate relative bg-zone px-3 py-1 rounded-full font-bold text-mainText text-lg shrink-0">
                        {/* cả khu vực hết lệnh chờ: vệt lan cảnh báo */}
                        {s.queued === 0 && (
                            <span
                                aria-hidden="true"
                                className="-z-10 absolute inset-0 bg-zone rounded-full motion-safe:animate-alert"
                            />
                        )}
                        <span className="mr-1 text-xl">{s.queued}</span> lệnh chờ
                    </span>
                </div>
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
