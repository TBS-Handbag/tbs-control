import { LuClipboardCheck, LuUserCog } from 'react-icons/lu';
import { STATUS_STYLE } from '@/components/machines/status-pill';
import { type Machine, formatDateTime, statusOf } from '@/lib/data/machines';
import { cn } from '@/lib/utils';

const timeRange = (o: { start: string; end: string }) =>
    `${formatDateTime(o.start).time} – ${formatDateTime(o.end).time}`;

function Worker({ icon: Icon, label, names }: { icon: typeof LuClipboardCheck; label: string; names: string[] }) {
    return (
        <p className="flex items-center gap-2 min-w-0 font-semibold text-lg">
            <Icon aria-label={label} className="size-6 text-subText shrink-0" />
            {names.length ? (
                <span className="truncate">{names.join(', ')}</span>
            ) : (
                <span className="text-iconMuted truncate italic">Chưa phân công</span>
            )}
        </p>
    );
}

export function MachineTile({ m, compact }: { m: Machine; compact?: boolean }) {
    const next = m.queue[0];
    const s = STATUS_STYLE[statusOf(m)];
    return (
        <article
            aria-label={`${m.name}: ${s.label.toLowerCase()}`}
            className={cn('flex flex-col rounded-xl min-w-0 min-h-0 overflow-hidden', s.cell)}
        >
            <div className={cn('flex items-center gap-2 px-3 min-w-0 shrink-0', compact ? 'py-1' : 'py-1.5', s.band)}>
                <h3 className="flex-1 min-w-0 font-extrabold text-xl truncate">{m.name}</h3>
                <span className={cn('px-2.5 rounded-full font-extrabold tabular-nums text-lg shrink-0', s.chip)}>
                    {m.queue.length} chờ
                </span>
            </div>

            <div className={cn('flex flex-col px-3 pb-2 min-h-0', compact ? 'gap-2 pt-2' : 'gap-4 pt-4')}>
                {m.current ? (
                    <p className="flex items-baseline gap-2 min-w-0 font-extrabold text-white text-2xl">
                        {m.current.code} :
                        <span className="font-semibold tabular-nums text-white truncate">{timeRange(m.current)}</span>
                    </p>
                ) : (
                    <p className="font-extrabold text-stop-fg text-xl uppercase tracking-wide">Không hoạt động</p>
                )}

                <p className="flex gap-2 font-semibold text-white text-lg truncate">
                    Tiếp:
                    {next ? (
                        <>
                            <b className="font-bold">{next.code} :</b>
                            <span className="tabular-nums">{timeRange(next)}</span>
                        </>
                    ) : (
                        <span>—</span>
                    )}
                </p>

                <div className={cn('grid min-w-0', compact ? 'gap-2 grid-cols-2' : 'gap-4')}>
                    <Worker icon={LuUserCog} label="Điều hành" names={m.operators} />
                    <Worker icon={LuClipboardCheck} label="Kiểm đếm" names={m.counters} />
                </div>
            </div>
        </article>
    );
}
