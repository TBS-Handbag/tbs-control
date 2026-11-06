import type { Metadata } from 'next';
import { type ReactNode, Suspense } from 'react';
import { TvClock } from '@/app/tv/components/tv-clock';
import { AutoRefresh } from '@/components/auto-refresh';
import { Loading } from '@/components/loading';
import { DASHBOARD_DAYS, type DashboardRow, getDashboard } from '@/lib/data/get-dashboard';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Thống kê lệnh – TV' };

// biểu đồ không chia theo nhóm (theo ngày, theo giờ bắt đầu) là số tổng: màu ấm, tách khỏi dải xanh của nhóm máy
const TONE = {
    orders: { unit: 'lệnh', fill: 'fill-dash-total' },
    hours: { unit: 'giờ', fill: 'fill-dash-total' },
} as const;
// màu theo nhóm máy (thứ tự nhóm = thứ tự sort máy), dùng chung cho cột "giờ chạy theo máy" và tỉ trọng nhóm
const GROUP_TONES = [
    { dot: 'bg-dash-1', fill: 'fill-dash-1' },
    { dot: 'bg-dash-2', fill: 'fill-dash-2' },
    { dot: 'bg-dash-3', fill: 'fill-dash-3' },
    { dot: 'bg-dash-4', fill: 'fill-dash-4' },
];
type Metric = keyof typeof TONE;

// làm tròn số nguyên, phần lẻ từ 0,5 trở lên thì lên (Intl mặc định halfExpand)
const fmt = (n: number) => n.toLocaleString('vi-VN', { maximumFractionDigits: 0 });
/** "2026-11-03" -> "03/11" */
const dayLabel = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;

export default function DashboardPage() {
    return (
        <>
            <Suspense fallback={<Loading />}>
                <DashboardBoard />
            </Suspense>
            <AutoRefresh />
        </>
    );
}

async function DashboardBoard() {
    const { days, machines, groups, startHours } = await getDashboard();
    const orders = days.reduce((n, d) => n + d.orders, 0);
    const hours = days.reduce((n, d) => n + d.hours, 0);
    // days luôn đủ 7 ngày, ngày cuối là hôm nay
    const today = days[days.length - 1].orders;
    const range = `${DASHBOARD_DAYS} ngày gần nhất · ${dayLabel(days[0].label)} – ${dayLabel(days[days.length - 1].label)}`;

    return (
        // fixed để thoát khung max-w-md của root layout; font gốc scale theo viewport 16:9 (globals.css .tv-screen)
        <main className="z-50 fixed inset-0 flex flex-col gap-4 bg-surface p-4 overflow-hidden text-mainText tv-screen">
            <header className="flex items-center gap-6 bg-card px-6 py-4 border-2 border-white/10 rounded-2xl shrink-0">
                <h1 className="font-extrabold text-3xl">Thống kê lệnh</h1>
                <span className="bg-dash-accent px-4 py-1.5 rounded-full font-bold tabular-nums text-lg">{range}</span>
                <div className="ml-auto">
                    <TvClock />
                </div>
            </header>

            <dl className="gap-4 grid grid-cols-4 shrink-0">
                <Kpi label={`Số lệnh ${DASHBOARD_DAYS} ngày`} value={fmt(orders)} />
                <Kpi label={`Giờ chạy ${DASHBOARD_DAYS} ngày`} value={fmt(hours)} unit="giờ" />
                <Kpi label="Lệnh hôm nay" value={fmt(today)} />
                <Kpi
                    label="Trung bình mỗi lệnh"
                    value={orders ? (hours / orders).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) : '—'}
                    unit="giờ"
                />
            </dl>

            {/* viewBox của từng biểu đồ ≈ kích thước khung ở 1920×1080; màn 16:9 khác chỉ scale đều nên không méo */}
            <div className="flex-1 gap-4 grid grid-rows-2 min-h-0">
                <Panel title="Giờ chạy theo máy">
                    <ColumnChart rows={machines} metric="hours" caption="orders" w={1850} h={320} />
                </Panel>
                <div className="gap-4 grid grid-cols-3 min-h-0">
                    <Panel title="Giờ chạy theo ngày">
                        <ColumnChart
                            rows={days.map((d) => ({ ...d, label: dayLabel(d.label) }))}
                            metric="hours"
                            caption="orders"
                            w={590}
                            h={320}
                        />
                    </Panel>
                    <Panel
                        title="Số lệnh theo nhóm máy"
                        aside={
                            <span className="font-extrabold tabular-nums text-2xl">
                                {fmt(groups.reduce((n, g) => n + g.orders, 0))}{' '}
                                <span className="font-semibold text-subText text-xl">lệnh</span>
                            </span>
                        }
                    >
                        <GroupShare rows={groups} />
                    </Panel>
                    <Panel title="Số lệnh theo giờ bắt đầu">
                        <ColumnChart rows={startHours} metric="orders" w={590} h={320} />
                    </Panel>
                </div>
            </div>
        </main>
    );
}

function Kpi({ label, value, unit }: { label: string; value: string; unit?: string }) {
    return (
        <div className="flex flex-col gap-1 bg-card px-6 pt-1.5 pb-3 border-2 border-white/10 rounded-2xl">
            <dt className="font-semibold text-subText text-lg">{label}</dt>
            <dd className="font-extrabold tabular-nums text-5xl">
                {value}
                {unit && <span className="ml-2 font-semibold text-subText text-2xl">{unit}</span>}
            </dd>
        </div>
    );
}

function Panel({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
    return (
        <section className="flex flex-col gap-3 bg-card p-4 border-2 border-white/10 rounded-2xl min-w-0 min-h-0">
            <header className="flex justify-between items-baseline gap-4 shrink-0">
                <h2 className="font-extrabold text-2xl truncate">{title}</h2>
                {aside}
            </header>
            {children}
        </section>
    );
}

const Empty = () => <p className="flex flex-1 justify-center items-center text-subText text-xl">Chưa có dữ liệu.</p>;

/** Bước vạch lưới "tròn" (1, 2, 2.5, 5 × 10^n) cho khoảng 4 vạch. */
function niceStep(max: number) {
    const raw = max / 4;
    const p = 10 ** Math.floor(Math.log10(raw));
    return [1, 2, 2.5, 5].map((m) => m * p).find((s) => s >= raw) ?? 10 * p;
}

/** Biểu đồ cột 1 chỉ số với trục Y thật. `caption`: chỉ số phụ ghi chữ dưới nhãn (vd "3 đơn").
 *  Dòng có `group` thì gom các cột liền nhau cùng nhóm, có tiêu đề nhóm bên dưới. */
function ColumnChart({
    rows,
    metric,
    caption,
    w,
    h,
}: {
    rows: DashboardRow[];
    metric: Metric;
    caption?: Metric;
    w: number;
    h: number;
}) {
    if (!rows.length) return <Empty />;
    const grouped = rows.some((r) => r.group);
    const left = 34;
    const top = 40;
    const base = h - (grouped ? 84 : caption ? 50 : 30);
    const max = Math.max(...rows.map((r) => r[metric]));
    // mọi số hiển thị đều nguyên nên vạch trục cũng phải nguyên
    const step = Math.max(1, Math.ceil(niceStep(max || 1)));
    const axisMax = Math.max(step, Math.ceil(max / step) * step);
    const ticks = Array.from({ length: Math.round(axisMax / step) + 1 }, (_, i) => i * step);
    const y = (v: number) => base - (v / axisMax) * (base - top);
    // các đoạn máy liền nhau cùng nhóm (máy đã xếp theo `sort` nên nhóm nằm liền nhau); runOf[i] = đoạn của cột i
    const runs: { name: string; from: number; to: number }[] = [];
    const runOf: number[] = [];
    if (grouped)
        rows.forEach((r, i) => {
            const last = runs[runs.length - 1];
            if (last?.name === (r.group ?? 'Khác')) last.to = i;
            else runs.push({ name: r.group ?? 'Khác', from: i, to: i });
            runOf.push(runs.length - 1);
        });
    // khe trống giữa các nhóm để ranh giới nhìn rõ
    const GAP = 32;
    const slot = (w - left - GAP * Math.max(0, runs.length - 1)) / rows.length;
    const x0 = (i: number) => left + i * slot + (runOf[i] ?? 0) * GAP;
    const cx = (i: number) => x0(i) + slot / 2;
    const barW = Math.min(slot * 0.6, 72);
    const unit = TONE[metric].unit;
    const summary = rows.map(
        (r) =>
            `${r.group ? `${r.group} ` : ''}${r.label}: ${fmt(r[metric])} ${unit}${caption ? `, ${r[caption]} ${TONE[caption].unit}` : ''}`,
    );

    return (
        <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={summary.join('; ')} className="flex-1 w-full min-h-0">
            {/* trục Y: vạch lưới + số, đơn vị ở đỉnh trục */}
            <text x={left - 8} y={top - 24} textAnchor="end" fontSize={15} className="fill-subText">
                {unit}
            </text>
            {ticks.map((t) => (
                <g key={t}>
                    <line
                        x1={left}
                        x2={w}
                        y1={y(t)}
                        y2={y(t)}
                        strokeWidth={t ? 1 : 2}
                        className={t ? 'stroke-white/10' : 'stroke-white/30'}
                    />
                    <text
                        x={left - 8}
                        y={y(t) + 5}
                        textAnchor="end"
                        fontSize={15}
                        className="fill-subText tabular-nums"
                    >
                        {fmt(t)}
                    </text>
                </g>
            ))}

            {/* vạch đứt ngăn nhóm, nằm giữa khe GAP, kéo từ đỉnh trục xuống hết tên nhóm */}
            {runs.slice(1).map((g) => (
                <line
                    key={g.name}
                    x1={x0(g.from) - GAP / 2}
                    x2={x0(g.from) - GAP / 2}
                    y1={top - 20}
                    y2={h}
                    strokeWidth={3}
                    strokeDasharray="10 6"
                    className="stroke-labelText/70"
                />
            ))}

            {rows.map((r, i) => {
                const v = r[metric];
                return (
                    <g key={`${r.group}-${r.label}`}>
                        {v > 0 ? (
                            <rect
                                x={cx(i) - barW / 2}
                                y={y(v)}
                                width={barW}
                                height={base - y(v)}
                                rx={6}
                                className={grouped ? GROUP_TONES[runOf[i] % GROUP_TONES.length].fill : TONE[metric].fill}
                            >
                                <title>{summary[i]}</title>
                            </rect>
                        ) : (
                            // không có đơn: gạch mờ sát đáy để phân biệt với thiếu dữ liệu
                            <rect
                                x={cx(i) - barW / 2}
                                y={base - 5}
                                width={barW}
                                height={5}
                                rx={2}
                                className="fill-white/25"
                            >
                                <title>{summary[i]}</title>
                            </rect>
                        )}
                        <text
                            x={cx(i)}
                            y={(v > 0 ? y(v) : base - 5) - 8}
                            textAnchor="middle"
                            fontSize={18}
                            fontWeight={700}
                            className={cn('tabular-nums', v > 0 ? 'fill-mainText' : 'fill-subText')}
                        >
                            {fmt(v)}
                        </text>
                        <text
                            x={cx(i)}
                            y={base + 24}
                            textAnchor="middle"
                            fontSize={17}
                            fontWeight={600}
                            className="fill-mainText"
                        >
                            {r.label}
                        </text>
                        {caption && r[caption] > 0 && (
                            <text x={cx(i)} y={base + 45} textAnchor="middle" fontSize={15} className="fill-subText">
                                {`${fmt(r[caption])} ${TONE[caption].unit}`}
                            </text>
                        )}
                    </g>
                );
            })}

            {runs.map((g) => {
                const x1 = x0(g.from) + 8;
                const x2 = x0(g.to) + slot - 8;
                return (
                    <g key={g.name}>
                        <line
                            x1={x1}
                            x2={x2}
                            y1={base + 58}
                            y2={base + 58}
                            strokeWidth={2}
                            className="stroke-white/30"
                        />
                        <text
                            x={(x1 + x2) / 2}
                            y={base + 80}
                            textAnchor="middle"
                            fontSize={16}
                            fontWeight={700}
                            className="fill-mainText uppercase tracking-widest"
                        >
                            {g.name}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

/** Tỉ trọng số đơn theo nhóm máy: 1 thanh xếp chồng chia theo nhóm + mỗi nhóm 1 dòng (tên, thanh %, số đơn, %). */
function GroupShare({ rows }: { rows: DashboardRow[] }) {
    const total = rows.reduce((n, r) => n + r.orders, 0);
    if (!total) return <Empty />;
    const pct = (v: number) => `${Math.round((v / total) * 100)}%`;
    const tone = (i: number) => GROUP_TONES[i % GROUP_TONES.length];
    // thanh xếp chồng: viewBox ≈ bề ngang khung ở 1920×1080, scale đều nên góc bo không méo
    const W = 560;
    const H = 56;
    const GAP = 8;
    const parts = rows.map((r, i) => ({ r, i })).filter((p) => p.r.orders > 0);
    const usable = W - GAP * (parts.length - 1);
    const width = (v: number) => (v / total) * usable;
    const xs = parts.map((_, k) => parts.slice(0, k).reduce((x, p) => x + width(p.r.orders) + GAP, 0));

    return (
        <div className="flex flex-col flex-1 gap-3 min-h-0">
            <svg
                viewBox={`0 0 ${W} ${H}`}
                role="img"
                aria-label={rows.map((r) => `${r.label}: ${r.orders} lệnh (${pct(r.orders)})`).join('; ')}
                className="mt-3 w-full shrink-0"
            >
                {parts.map((p, k) => (
                    <rect
                        key={p.r.label}
                        x={xs[k]}
                        y={0}
                        width={width(p.r.orders)}
                        height={H}
                        rx={8}
                        className={tone(p.i).fill}
                    />
                ))}
            </svg>
            <ul className="flex flex-col flex-1 gap-2 min-h-0">
                {rows.map((r, i) => (
                    <li
                        key={r.label}
                        className="flex flex-1 items-center gap-4 bg-white/5 px-4 border border-white/10 rounded-xl min-h-0 text-xl"
                    >
                        <span className="flex items-center gap-3 w-40 font-semibold truncate shrink-0">
                            <span aria-hidden="true" className={cn('rounded-full size-3 shrink-0', tone(i).dot)} />
                            {r.label}
                        </span>
                        {/* thanh mảnh: chỉ có hình chữ nhật nên kéo giãn (preserveAspectRatio none) không làm méo chữ */}
                        <svg
                            viewBox="0 0 200 8"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                            className="flex-1 rounded-full min-w-0 h-2"
                        >
                            <rect width={200} height={8} className="fill-white/10" />
                            <rect width={(200 * r.orders) / total} height={8} className={tone(i).fill} />
                        </svg>
                        <span className="w-14 font-bold tabular-nums text-right shrink-0">{fmt(r.orders)}</span>
                        <span className="w-14 tabular-nums text-subText text-right shrink-0">{pct(r.orders)}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
