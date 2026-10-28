import type { Status } from '@/lib/data/machines';
import { cn } from '@/lib/utils';

/** Màu theo trạng thái máy. pill/dot/cell: dùng chung; band/chip: dải tên + đếm lệnh chờ trên ô máy TV. */
export const STATUS_STYLE: Record<
    Status,
    { label: string; pill: string; dot: string; cell: string; band: string; chip: string }
> = {
    run: {
        label: 'Đang chạy',
        pill: 'bg-[#16c45a] text-run-fg',
        dot: 'bg-run',
        cell: 'bg-white/5 border-run-line',
        // máy chạy bình thường không tô đặc, để vàng/đỏ nổi lên
        band: 'bg-[#16c45a] text-run-fg',
        chip: 'bg-white/90 text-[#333]',
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
        label: 'Dừng',
        pill: 'bg-stop-bg text-stop-fg',
        dot: 'bg-stop',
        cell: 'bg-stop-cell border-stop-line',
        band: 'bg-stop text-stop-on',
        chip: 'bg-stop-on text-stop',
    },
};

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
