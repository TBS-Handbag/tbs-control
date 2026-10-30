import type { Status } from '@/lib/data/machines';
import { cn } from '@/lib/utils';

/** Màu theo trạng thái máy. pill/dot/cell: dùng chung; band/chip: dải tên + đếm lệnh chờ trên ô máy TV. */
export const STATUS_STYLE: Record<
    Status,
    { label: string; pill: string; dot: string; cell: string; band: string; chip: string }
> = {
    run: {
        label: 'Đang Hoạt động',
        pill: 'bg-run-bg text-run-fg',
        dot: 'bg-run',
        cell: 'bg-white/5 border-run-line',
        // máy Hoạt động bình thường không tô đặc, để vàng/đỏ nổi lên
        band: 'bg-run-band text-run-fg',
        // TV: chip trắng bị lóa trên tivi, dùng nền tối trong suốt
        chip: 'bg-ink/40 text-white',
    },
    idle: {
        label: 'Hết lệnh chờ',
        pill: 'bg-idle-bg text-idle-fg',
        dot: 'bg-idle',
        cell: 'bg-idle-cell border-idle-line',
        band: 'bg-idle text-idle-on',
        chip: 'bg-idle-on text-idle-fg',
    },
    stop: {
        label: 'Nhàn rỗi',
        pill: 'bg-stop-bg text-stop-fg',
        dot: 'bg-stop',
        cell: 'bg-stop-cell border-stop-line',
        band: 'bg-stop text-stop-on',
        chip: 'bg-ink/40 text-white',
    },
};

const COUNT_LABELS: [Status, string][] = [
    ['run', 'Hoạt động'],
    ['idle', 'Hết lệnh'],
    ['stop', 'Nhàn rỗi'],
];

/** Dòng đếm máy theo trạng thái: "● 12 Hoạt động  ● 3 Hết lệnh  ● 2 Nhàn rỗi". */
export function StatusCounts({ counts, className }: { counts: Record<Status, number>; className?: string }) {
    return (
        <span className={cn('flex gap-4 text-subText', className)}>
            {COUNT_LABELS.map(([s, label]) => (
                <span key={s} className="flex items-center gap-1.5 font-semibold">
                    <span aria-hidden="true" className={cn('rounded-full size-2', STATUS_STYLE[s].dot)} />
                    <span className="font-semibold tabular-nums text-mainText">{counts[s]}</span> {label}
                </span>
            ))}
        </span>
    );
}

type Props = { status: Status; label?: string; dot?: boolean; solid?: boolean; className?: string };

export function StatusPill({ status, label, dot, solid, className }: Props) {
    const s = STATUS_STYLE[status];
    return (
        <span
            className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-xs shrink-0',
                solid ? s.band : s.pill,
                className,
            )}
        >
            {dot && <span aria-hidden="true" className={cn('rounded-full size-2 shrink-0', s.dot)} />}
            {label ?? s.label}
        </span>
    );
}
