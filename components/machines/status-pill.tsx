import { cn } from '@/lib/utils';

type Props = { running: boolean; label?: string; className?: string };

export function StatusPill({ running, label, className }: Props) {
    return (
        <span
            className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-xs shrink-0',
                running ? 'bg-run-bg text-run-fg' : 'bg-stop-bg text-stop-fg',
                className,
            )}
        >
            {label ?? (running ? 'Đang chạy' : 'Dừng')}
        </span>
    );
}
