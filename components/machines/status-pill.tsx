import { cn } from '@/lib/utils';

type Props = { running: boolean; label?: string; dot?: boolean; className?: string };

export function StatusPill({ running, label, dot, className }: Props) {
    return (
        <span
            className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-xs shrink-0',
                running ? 'bg-run-bg text-run-fg' : 'bg-stop-bg text-stop-fg',
                className,
            )}
        >
            {dot && <span aria-hidden="true" className={cn('rounded-full size-2 shrink-0', running ? 'bg-run' : 'bg-stop')} />}
            {label ?? (running ? 'Đang chạy' : 'Dừng')}
        </span>
    );
}
