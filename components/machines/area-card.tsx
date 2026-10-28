import Link from 'next/link';
import type { IconType } from 'react-icons';
import { LuArrowUpRight } from 'react-icons/lu';
import { STATUS_STYLE, StatusPill } from '@/components/machines/status-pill';
import type { Status } from '@/lib/data/machines';
import { cn } from '@/lib/utils';

type Props = {
    href: string;
    index: number;
    title: string;
    meta: string;
    icon: IconType;
    run: number;
    idle: number;
    stop: number;
};

export function AreaCard({ href, index, title, meta, icon: Icon, run, idle, stop }: Props) {
    // mỗi vạch = 1 máy, xếp theo trạng thái để nhìn là thấy tỉ lệ
    const ticks: Status[] = [
        ...Array<Status>(run).fill('run'),
        ...Array<Status>(idle).fill('idle'),
        ...Array<Status>(stop).fill('stop'),
    ];

    return (
        <Link
            href={href}
            className="group relative flex flex-col gap-4 bg-card shadow-main/20 shadow-xl p-5 border border-line rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full overflow-hidden active:scale-[0.98] transition-transform"
        >
            <span
                aria-hidden="true"
                className="-top-5 -right-1 absolute font-black text-main/5 text-9xl leading-none tracking-tighter select-none"
            >
                {String(index).padStart(2, '0')}
            </span>

            <span className="relative flex items-start gap-3">
                <span className="flex justify-center items-center bg-main rounded-2xl size-12 text-white shrink-0">
                    <Icon aria-hidden="true" className="size-6" />
                </span>
                <span className="flex flex-col flex-1 gap-1 min-w-0">
                    <span className="font-semibold text-main-muted text-xs tracking-widest">KHU VỰC {index}</span>
                    <span className="font-bold text-mainText text-xl leading-tight">{title}</span>
                    <span className="text-subText text-sm">{meta}</span>
                </span>
                <span className="flex justify-center items-center border border-line rounded-full size-10 text-main group-hover:rotate-45 group-hover:bg-main group-hover:text-white transition shrink-0">
                    <LuArrowUpRight aria-hidden="true" className="size-5" />
                </span>
            </span>

            <span aria-hidden="true" className="relative flex gap-1">
                {ticks.map((s, i) => (
                    <span key={i} className={cn('flex-1 rounded-full h-2', STATUS_STYLE[s].dot)} />
                ))}
            </span>

            <span className="relative flex flex-wrap gap-1.5">
                <StatusPill status="run" label={`${run} đang chạy`} className="py-0.5" />
                <StatusPill status="idle" label={`${idle} hết lệnh chờ`} className="py-0.5" />
                <StatusPill status="stop" label={`${stop} dừng`} className="py-0.5" />
            </span>
        </Link>
    );
}
