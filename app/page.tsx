import Image from 'next/image';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { LuLayers, LuStamp } from 'react-icons/lu';
import { AreaCard } from '@/components/machines/area-card';
import { AREAS, CUT_GROUPS, MACHINES, machinesByArea, stat } from '@/lib/data/machines';
import kite from '@/public/images/kite.webp';

async function TodayText() {
    await connection();
    const text = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'Asia/Ho_Chi_Minh',
    });
    return <span className="text-onMainSub text-sm first-letter:uppercase">{text}</span>;
}

export default function Home() {
    const total = stat(MACHINES);
    const cut = stat(machinesByArea('cut'));
    const press = stat(machinesByArea('press'));

    return (
        <main className="flex flex-col pb-8">
            <div className="relative bg-main h-40 [clip-path:ellipse(75%_100%_at_50%_0)]">
                {/* tranh nét đen nền trắng: invert + screen để thành nét sáng trên nền xanh */}
                <Image
                    src={kite}
                    alt=""
                    fill
                    priority
                    sizes="(max-width: 448px) 100vw, 448px"
                    className="opacity-100 invert object-cover mix-blend-screen"
                />
            </div>

            {/* khối tiêu đề nằm giữa mép ảnh: nửa trên đè ảnh, nửa dưới ra nền */}
            <div className="relative flex items-center gap-4 bg-card shadow-lg shadow-main/10 -mt-10 mx-4 px-5 py-4 border border-line rounded-2xl">
                <div className="flex flex-col flex-1 gap-0.5 min-w-0">
                    <h1 className="font-bold text-mainText text-lg leading-tight">Chọn khu vực làm việc</h1>
                    <p className="text-subText text-sm">Chạm để xem danh sách máy</p>
                </div>
                <p className="flex flex-col items-end pl-4 border-line border-l leading-none shrink-0">
                    <span className="font-bold text-main text-3xl">
                        {total.active}
                        <span className="font-medium text-subText text-base">/{total.total}</span>
                    </span>
                    <span className="mt-1 text-subText text-xs">máy đang chạy</span>
                </p>
            </div>

            <div className="flex flex-col gap-3.5 mt-4 px-4">
                <AreaCard
                    href={AREAS.cut.href}
                    title={AREAS.cut.title}
                    meta={`${CUT_GROUPS.length} nhóm · ${cut.total} máy`}
                    icon={LuLayers}
                    run={cut.run}
                    idle={cut.idle}
                    stop={cut.stop}
                />
                <AreaCard
                    href={AREAS.press.href}
                    title={AREAS.press.title}
                    meta={`${press.total} máy`}
                    icon={LuStamp}
                    run={press.run}
                    idle={press.idle}
                    stop={press.stop}
                />
            </div>
        </main>
    );
}
