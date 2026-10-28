import Link from 'next/link';
import { LuChevronLeft } from 'react-icons/lu';

type Props = { title: string; backHref: string };

export function PageHeader({ title, backHref }: Props) {
    return (
        <header className="top-0 z-10 sticky flex items-center gap-2.5 bg-surface px-3 pt-3 pb-3.5 text-main">
            <Link
                href={backHref}
                aria-label="Quay lại"
                className="flex justify-center items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onMainSub size-11 shrink-0"
            >
                <LuChevronLeft aria-hidden="true" className="size-8" />
            </Link>
            <h1 className="flex-1 min-w-0 font-bold text-lg text-center truncate">{title}</h1>
            {/* spacer bằng nút back để h1 căn giữa đúng theo cả màn hình */}
            <div aria-hidden="true" className="size-11 shrink-0" />
        </header>
    );
}
