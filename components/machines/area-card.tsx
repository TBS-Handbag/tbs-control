import Link from 'next/link';
import type { IconType } from 'react-icons';
import { LuChevronRight } from 'react-icons/lu';
import { StatusPill } from '@/components/machines/status-pill';

type Props = {
    href: string;
    index: number;
    title: string;
    meta: string;
    icon: IconType;
    run: number;
    stop: number;
};

export function AreaCard({ href, index, title, meta, icon: Icon, run, stop }: Props) {
    return (
        <Link
            href={href}
            className="flex items-center gap-4 bg-card shadow-lg shadow-main/10 py-5 pr-4 pl-5 border border-line rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full min-h-32"
        >
            <span className="flex justify-center items-center bg-main-tint rounded-2xl size-14 text-main shrink-0">
                <Icon aria-hidden="true" className="size-7" />
            </span>
            <span className="flex flex-col flex-1 gap-1.5 min-w-0">
                <span className="font-semibold text-main-muted text-xs tracking-wider">KHU VỰC {index}</span>
                <span className="font-bold text-main text-xl leading-tight">{title}</span>
                <span className="text-sm text-subText">{meta}</span>
                <span className="flex flex-wrap gap-1.5 mt-0.5">
                    <StatusPill running label={`${run} đang chạy`} className="py-0.5" />
                    <StatusPill running={false} label={`${stop} dừng`} className="py-0.5" />
                </span>
            </span>
            <LuChevronRight aria-hidden="true" className="text-iconMuted size-6 shrink-0" />
        </Link>
    );
}
