import { LuClipboardCheck, LuUser } from 'react-icons/lu';
import { type Machine, formatDateTime } from '@/lib/data/machines';
import { cn } from '@/lib/utils';

const timeRange = (o: { start: string; end: string }) =>
    `${formatDateTime(o.start).time} – ${formatDateTime(o.end).time}`;

export function MachineTile({ m, compact }: { m: Machine; compact?: boolean }) {
    const next = m.queue[0];
    return (
        <article
            aria-label={`${m.name}: ${m.running ? 'đang chạy' : 'dừng'}`}
            className={cn(
                'flex flex-col gap-1.5 px-3 py-2.5 border-2 rounded-xl min-w-0 min-h-0 overflow-hidden',
                m.running ? 'bg-card border-line' : 'bg-stop-cell border-stop-line',
            )}
        >
            <div className="flex items-center gap-2 min-w-0">
                <span
                    aria-hidden="true"
                    className={cn('rounded-full size-3 shrink-0', m.running ? 'bg-run' : 'bg-stop')}
                />
                <h3 className={cn('flex-1 min-w-0 font-bold truncate', compact ? 'text-xl' : 'text-2xl')}>{m.name}</h3>
                <span
                    className={cn(
                        'px-2 py-0.5 rounded-full font-semibold text-sm shrink-0',
                        m.queue.length ? 'bg-main-tint text-main' : 'bg-surface text-subText',
                    )}
                >
                    {m.queue.length} chờ
                </span>
            </div>

            {m.current ? (
                <p className="flex items-baseline gap-2 min-w-0">
                    <b className={cn('font-bold text-main', compact ? 'text-lg' : 'text-xl')}>{m.current.code}</b>
                    <span className="tabular-nums text-subText text-base truncate">{timeRange(m.current)}</span>
                </p>
            ) : (
                <p className={cn('font-semibold text-stop-fg', compact ? 'text-lg' : 'text-xl')}>Không có lệnh</p>
            )}

            {!compact && (
                <p className="text-subText text-base truncate">
                    Tiếp theo:{' '}
                    {next ? (
                        <>
                            <b className="font-semibold text-labelText">{next.code}</b> {timeRange(next)}
                        </>
                    ) : (
                        '—'
                    )}
                </p>
            )}

            <p className="flex items-center gap-1.5 min-w-0 text-labelText text-sm">
                <LuUser aria-label="Điều hành" className="size-4 text-iconMuted shrink-0" />
                <span className="truncate">{m.operators.join(', ') || 'Chưa phân công'}</span>
            </p>
            {!compact && (
                <p className="flex items-center gap-1.5 min-w-0 text-labelText text-sm">
                    <LuClipboardCheck aria-label="Kiểm đếm" className="size-4 text-iconMuted shrink-0" />
                    <span className="truncate">{m.counters.join(', ') || 'Chưa phân công'}</span>
                </p>
            )}
        </article>
    );
}
