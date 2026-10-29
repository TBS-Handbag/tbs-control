import type { Metadata } from 'next';
import { CUT_GROUPS, MACHINES, machinesByArea, stat } from '@/lib/data/machines';
import { AreaPanel } from './components/area-panel';
import { MachineTile } from './components/machine-tile';
import { TvClock } from './components/tv-clock';

export const metadata: Metadata = { title: 'Bảng điều hành – TV' };

export default function TvPage() {
    const total = stat(MACHINES);
    const cut = machinesByArea('cut');
    const press = machinesByArea('press');
    // shortcut: 12 máy đầu + khung 6 máy cuối theo mock 18 máy, thêm máy thì đổi số hàng/cột
    const [pressMain, pressZone] = [press.slice(0, 12), press.slice(12)];

    return (
        // fixed để thoát khung max-w-md của root layout; font gốc scale theo viewport (globals.css .tv-screen)
        <main className="z-50 fixed inset-0 flex flex-col gap-4 bg-surface p-4 overflow-hidden text-mainText tv-screen">
            <header className="flex items-center gap-6 bg-card px-6 py-4 border-2 border-white/10 rounded-2xl text-white shrink-0">
                <h1 className="font-extrabold text-3xl">Bảng ĐH & PP lệnh CUT 1</h1>
                <span className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full font-bold text-ink text-lg">
                    <span aria-hidden="true" className="bg-run-light rounded-full size-2.5" />
                    {total.active}/{total.total} máy đang Hoạt động
                </span>
                <div className="ml-auto">
                    <TvClock />
                </div>
            </header>

            <div className="flex-1 gap-4 grid grid-cols-2 min-h-0">
                <AreaPanel area="cut">
                    {/* shortcut: lưới cố định 3 nhóm × 3 cột theo mock data, đổi sang tính động khi số máy thay đổi */}
                    <div className="flex-1 gap-3 grid grid-rows-3 min-h-0">
                        {CUT_GROUPS.map((g) => (
                            <div key={g} className="flex flex-col gap-1.5 min-h-0">
                                <h3 className="font-bold text-lg uppercase tracking-widest shrink-0">{g}</h3>
                                <div className="flex-1 gap-3 grid grid-cols-3 min-h-0">
                                    {cut
                                        .filter((m) => m.group === g)
                                        .map((m) => (
                                            <MachineTile key={m.id} m={m} />
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </AreaPanel>

                <AreaPanel area="press">
                    <div className="flex-[7_1_0] gap-2.5 grid grid-cols-3 grid-rows-4 min-h-0">
                        {pressMain.map((m) => (
                            <MachineTile key={m.id} m={m} compact />
                        ))}
                    </div>
                    {pressZone.length > 0 && (
                        <section className="flex flex-col flex-[4_1_0] gap-2 bg-zone/5 p-2.5 border-2 border-zone rounded-2xl min-h-0">
                            <span className="self-start bg-zone px-3 py-0.5 rounded-lg font-extrabold text-zone-on text-lg tracking-wider">
                                MÁY TĂNG CƯỜNG
                            </span>
                            <div className="flex-1 gap-2.5 grid grid-cols-3 grid-rows-2 min-h-0">
                                {pressZone.map((m) => (
                                    <MachineTile key={m.id} m={m} compact />
                                ))}
                            </div>
                        </section>
                    )}
                </AreaPanel>
            </div>
        </main>
    );
}
