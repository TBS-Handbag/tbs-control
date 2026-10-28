import type { Status } from '@/lib/data/machines';
import { cn } from '@/lib/utils';

/** Màu theo trạng thái máy. pill/dot/cell: mobile; band/frame: màu đặc cho TV nhìn từ xa. */
export const STATUS_STYLE: Record<
    Status,
    { label: string; pill: string; dot: string; cell: string; band: string; frame: string }
> = {
    run: {
        label: 'Đang chạy',
        pill: 'bg-run-bg text-run-fg',
        dot: 'bg-run',
        cell: 'bg-card border-line',
        band: 'bg-run text-white',
        frame: 'bg-card border-run',
    },
    idle: {
        label: 'Hết lệnh chờ',
        pill: 'bg-idle-bg text-idle-fg',
        dot: 'bg-idle',
        cell: 'bg-idle-cell border-idle-line',
        // vàng sáng: chữ trắng không đọc được nên dùng chữ đậm
        band: 'bg-idle text-mainText',
        frame: 'bg-idle-cell border-idle',
    },
    stop: {
        label: 'Dừng',
        pill: 'bg-stop-bg text-stop-fg',
        dot: 'bg-stop',
        cell: 'bg-stop-cell border-stop-line',
        band: 'bg-stop text-white',
        frame: 'bg-stop-cell border-stop',
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
