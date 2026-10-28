import { LuClipboardCheck } from 'react-icons/lu';
import { MdManageAccounts } from 'react-icons/md';
import { STATUS_STYLE } from '@/components/machines/status-pill';
import { type Machine, formatDateTime, statusOf } from '@/lib/data/machines';
import { cn } from '@/lib/utils';

const timeRange = (o: { start: string; end: string }) =>
    `${formatDateTime(o.start).time} – ${formatDateTime(o.end).time}`;

export function MachineTile({ m, compact }: { m: Machine; compact?: boolean }) {
    const next = m.queue[0];
    const s = STATUS_STYLE[statusOf(m)];
    return (
        <article
            aria-label={`${m.name}: ${s.label.toLowerCase()}`}
            className={cn('flex flex-col border-4 rounded-xl min-w-0 min-h-0 overflow-hidden', s.frame)}
        >
            {/* dải màu đặc theo trạng thái: nhìn xa vẫn phân biệt được máy chạy / sắp hết lệnh / dừng */}
            <div className={cn('flex items-center gap-2 px-3 py-1.5 min-w-0 shrink-0', s.band)}>
                <h3 className={cn('flex-1 min-w-0 font-extrabold truncate', compact ? 'text-xl' : 'text-2xl')}>
                    {m.name}
                </h3>
                <span className="bg-white/30 px-2 py-0.5 rounded-full font-bold text-lg tabular-nums shrink-0">
                    {m.queue.length} chờ
                </span>
            </div>

            <div className="flex flex-col gap-2 px-3 py-2 min-h-0">
                {m.current ? (
                    <p className="flex items-baseline gap-2 min-w-0 font-extrabold text-xl">
                        <b className="text-main">{m.current.code}</b>
                        <span className="tabular-nums text-mainText truncate">{timeRange(m.current)}</span>
                    </p>
                ) : (
                    <p className={cn('font-extrabold text-stop-fg', compact ? 'text-lg' : 'text-xl')}>
                        Không có lệnh
                    </p>
                )}

                {!compact && (
                    <p className="flex gap-2 font-semibold text-labelText text-base truncate">
                        <span className="text-main">Tiếp theo:</span>
                        {next ? (
                            <>
                                <b className="font-bold text-mainText">{next.code}</b> {timeRange(next)}
                            </>
                        ) : (
                            '—'
                        )}
                    </p>
                )}

                <p className="flex items-center gap-1.5 min-w-0 font-semibold text-labelText text-base">
                    <MdManageAccounts aria-label="Điều hành" className="size-6 text-labelText shrink-0" />
                    <span className="truncate">{m.operators.join(', ') || 'Chưa phân công'}</span>
                </p>
                {!compact && (
                    <p className="flex items-center gap-1.5 min-w-0 font-semibold text-labelText text-base">
                        <LuClipboardCheck aria-label="Kiểm đếm" className="size-6 text-labelText shrink-0" />
                        <span className="truncate">{m.counters.join(', ') || 'Chưa phân công'}</span>
                    </p>
                )}
            </div>
        </article>
    );
}
