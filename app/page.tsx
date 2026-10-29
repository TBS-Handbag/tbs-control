import type { Viewport } from 'next';
import Image from 'next/image';
import { LuLayers, LuStamp } from 'react-icons/lu';
import { AreaCard } from '@/components/machines/area-card';
import { StatusCounts } from '@/components/machines/status-pill';
import { AREAS, CUT_GROUPS, MACHINES, machinesByArea, stat } from '@/lib/data/machines';
import kite from '@/public/images/kite.webp';

export const viewport: Viewport = { themeColor: '#00402A' }; // khớp header bg-main

export default function Home() {
    const total = stat(MACHINES);
    const cut = stat(machinesByArea('cut'));
    const press = stat(machinesByArea('press'));

    return (
        <main className="flex flex-col pb-8">
            <div className="relative bg-main pb-52 h-60 [clip-path:ellipse(95%_100%_at_50%_0)]">
                {/* chừa đáy cho khối tiêu đề đè lên để không che chân tụi nhỏ trong tranh */}
                <div className="top-0 bottom-8 absolute inset-x-0">
                    {/* tranh nét đen nền trắng: invert + screen để thành nét sáng trên nền xanh */}
                    <Image
                        src={kite}
                        alt=""
                        fill
                        priority
                        sizes="(max-width: 448px) 100vw, 448px"
                        className="opacity-100 invert object-bottom object-cover mix-blend-screen"
                    />
                </div>
            </div>

            {/* khối tiêu đề nằm giữa mép ảnh: nửa trên đè ảnh, nửa dưới ra nền */}
            <div className="relative flex flex-col gap-3 bg-card shadow-lg shadow-main/10 mx-4 -mt-14 px-5 py-4 border border-line rounded-2xl">
                <div className="flex justify-between items-center gap-4">
                    <h1 className="font-bold text-mainText text-2xl tracking-wide">Chọn khu vực</h1>
                    <p className="flex flex-col items-end leading-none shrink-0">
                        <span className="font-bold tabular-nums text-main text-4xl">
                            {total.active}
                            <span className="font-medium text-subText text-2xl"> / {total.total}</span>
                        </span>
                        <span className="mt-1 font-semibold text-subText text-sm">máy đang Hoạt động</span>
                    </p>
                </div>

                <StatusCounts counts={total} className="pt-3 border-line-soft border-t text-sm" />
            </div>

            <div className="flex flex-col gap-3.5 mt-4 px-4">
                <AreaCard
                    href={AREAS.cut.href}
                    title={AREAS.cut.title}
                    meta={`${CUT_GROUPS.length} nhóm · ${cut.total} máy`}
                    icon={LuLayers}
                    counts={cut}
                />
                <AreaCard
                    href={AREAS.press.href}
                    title={AREAS.press.title}
                    meta={`${press.total} máy`}
                    icon={LuStamp}
                    counts={press}
                />
            </div>
        </main>
    );
}
