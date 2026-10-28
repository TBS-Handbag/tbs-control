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
            <div className="relative flex flex-col gap-3.5 bg-main px-5 pt-7 pb-16 rounded-b-3xl overflow-hidden text-white">
                {/* tranh nét đen nền trắng: invert + screen để thành nét sáng trên nền xanh */}
                <Image
                    src={kite}
                    alt=""
                    fill
                    priority
                    sizes="(max-width: 448px) 100vw, 448px"
                    className="opacity-100 invert object-cover mix-blend-screen"
                />
                <div className="relative flex flex-col gap-1">
                    <h1 className="font-bold text-2xl leading-tight">Chọn khu vực làm việc</h1>
                </div>
                <span className="relative flex items-center self-start gap-2 bg-main-soft px-3 py-1.5 rounded-full font-medium text-sm">
                    <span aria-hidden="true" className="bg-run-light rounded-full size-2" />
                    {total.active}/{total.total} máy đang chạy
                </span>
            </div>

            <div className="relative flex flex-col gap-3.5 -mt-9 px-4">
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
                <p className="mx-1 mt-1.5 text-subText text-sm text-center leading-normal">
                    Chạm vào một khu vực để xem danh sách máy
                </p>
            </div>
        </main>
    );
}
