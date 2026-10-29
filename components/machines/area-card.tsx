import Link from 'next/link';
import type { IconType } from 'react-icons';
import { LuChevronRight } from 'react-icons/lu';
import { STATUS_STYLE, StatusCounts } from '@/components/machines/status-pill';
import type { Status } from '@/lib/data/machines';
import { cn } from '@/lib/utils';

type Props = {
    href: string;
    title: string;
    meta: string;
    icon: IconType;
    counts: Record<Status, number>;
};

const ORDER: Status[] = ['run', 'idle', 'stop'];

export function AreaCard({ href, title, meta, icon: Icon, counts }: Props) {
    // mỗi vạch = 1 máy, xếp theo trạng thái
    const ticks = ORDER.flatMap((s) => Array<Status>(counts[s]).fill(s));

    return (
        <Link
            href={href}
            className="flex flex-col gap-4 bg-card p-4 border border-line rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full"
        >
            <span className="flex items-center gap-3">
                <span className="flex justify-center items-center bg-main rounded-xl size-11 text-white shrink-0">
                    <Icon aria-hidden="true" className="size-5" />
                </span>
                <span className="flex flex-col flex-1 min-w-0">
                    <span className="font-semibold text-mainText text-lg leading-tight">{title}</span>
                    <span className="text-subText text-sm">{meta}</span>
                </span>
                <LuChevronRight aria-hidden="true" className="size-5 text-iconMuted shrink-0" />
            </span>

            <span aria-hidden="true" className="flex gap-0.5">
                {ticks.map((s, i) => (
                    <span key={i} className={cn('flex-1 rounded-full h-1.5', STATUS_STYLE[s].dot)} />
                ))}
            </span>

            <StatusCounts counts={counts} className="text-base" />
        </Link>
    );
}
