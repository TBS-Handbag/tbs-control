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

    return (
        // fixed để thoát khung max-w-md của root layout; font gốc scale theo viewport (globals.css .tv-screen)
        <main className="z-50 fixed inset-0 flex flex-col gap-4 bg-surface p-4 overflow-hidden text-mainText tv-screen">
            <header className="flex items-center gap-6 bg-main px-6 py-3 rounded-2xl text-white shrink-0">
                <h1 className="font-bold text-3xl">Bảng ĐH & PP lệnh CUT 1</h1>
                <span className="flex items-center gap-2 bg-main-soft px-4 py-1.5 rounded-full font-medium text-lg">
                    <span aria-hidden="true" className="bg-run-light rounded-full size-2.5" />
                    {total.run}/{total.total} máy đang chạy
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
                                <h3 className="font-semibold text-labelText text-xl shrink-0">{g}</h3>
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
                    {/* shortcut: 3×6 vừa 18 máy, thêm máy thì phải đổi số hàng/cột */}
                    <div className="flex-1 gap-3 grid grid-cols-3 grid-rows-6 min-h-0">
                        {press.map((m) => (
                            <MachineTile key={m.id} m={m} compact />
                        ))}
                    </div>
                </AreaPanel>
            </div>
        </main>
    );
}
