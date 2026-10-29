'use client';

import { useId, useRef, useState } from 'react';
import { LuCircleStop, LuPause, LuPlus } from 'react-icons/lu';
import { cardClass } from '@/components/machines/detail-section';
import { NewOrderForm } from '@/components/machines/new-order-form';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { type Order, formatDateTime, formatDuration, stopEarly } from '@/lib/data/machines';
import { cn } from '@/lib/utils';

// "2026-10-28T06:00" -> "thứ tư, 28/10" (class capitalize viết hoa từng từ)
const dayLabel = (iso: string) =>
    new Date(iso).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' });

type Props = { initialCurrent: Order | null; initialQueue: Order[] };

/** Card "Hàng chờ": lệnh đang chạy + hàng chờ, nút Tạo lệnh và Dừng sớm. */
export function OrderQueue({ initialCurrent, initialQueue }: Props) {
    // shortcut: chỉ lưu state cục bộ (reload là mất, pill trạng thái máy phía trên không đổi theo);
    // thay bằng server action + revalidate khi có data layer.
    const [current, setCurrent] = useState(initialCurrent);
    const [queue, setQueue] = useState(initialQueue);
    const [open, setOpen] = useState(false);
    const [confirming, setConfirming] = useState(false);
    // chụp nội dung lúc mở dialog để chữ không đổi sang lệnh mới trong lúc dialog đang đóng
    const [target, setTarget] = useState<{ code: string; next?: string }>({ code: '' });
    const [announce, setAnnounce] = useState('');
    const headingId = useId();
    const toggleBtn = useRef<HTMLButtonElement>(null);
    const stopBtn = useRef<HTMLButtonElement>(null);

    // lệnh đang chạy đứng đầu, sau đó là hàng chờ theo thứ tự
    const schedule = [
        ...(current ? [{ ...current, running: true }] : []),
        ...queue.map((o) => ({ ...o, running: false })),
    ];

    const close = () => {
        setOpen(false);
        // form unmount làm mất focus, trả về nút mở cho người dùng bàn phím
        requestAnimationFrame(() => toggleBtn.current?.focus());
    };

    const stop = () => {
        if (!current) return;
        const next = stopEarly(current, queue, new Date());
        setCurrent(next.current);
        setQueue(next.queue);
        setAnnounce(
            next.current
                ? `Đã dừng ${current.code}, ${next.current.code} bắt đầu chạy`
                : `Đã dừng ${current.code}, máy chuyển sang dừng`,
        );
    };

    return (
        <section aria-labelledby={headingId} className={cn(cardClass, 'flex flex-col gap-3 p-3')}>
            <div className="flex justify-between items-center gap-3 pl-1 min-h-11">
                <h2 id={headingId} className="font-bold text-xl">
                    Hàng chờ
                </h2>
                {!open && (
                    <Button
                        ref={toggleBtn}
                        type="button"
                        aria-expanded={false}
                        onClick={() => setOpen(true)}
                        className="px-5 rounded-full h-11 [&_svg]:size-5 font-semibold text-base"
                    >
                        <LuPlus aria-hidden="true" />
                        Tạo lệnh
                    </Button>
                )}
            </div>
            {open && <NewOrderForm onClose={close} />}

            <div className="border border-line rounded-xl overflow-hidden">
                {schedule.length === 0 ? (
                    <div className="flex items-center gap-3 p-4">
                        <span className="flex justify-center items-center bg-stop-bg rounded-full size-10 text-stop-fg shrink-0">
                            <LuPause aria-hidden="true" className="size-5" />
                        </span>
                        <div className="flex flex-col gap-0.5">
                            <p className="font-semibold text-sm">Chưa có lệnh nào</p>
                            <p className="text-subText text-xs">Máy tự chuyển sang hoạt động khi có lệnh chạy.</p>
                        </div>
                    </div>
                ) : (
                    <ol>
                        {schedule.map((o, i) => {
                            const st = formatDateTime(o.start);
                            const et = formatDateTime(o.end);
                            const newDay = i === 0 || st.date !== formatDateTime(schedule[i - 1].start).date;
                            const queuePos = current ? i : i + 1;
                            return (
                                <li key={o.code}>
                                    {newDay && (
                                        <p
                                            className={cn(
                                                'bg-surface px-4 py-2.5 border-line border-b font-medium text-subText text-sm capitalize',
                                                i > 0 && 'border-t',
                                            )}
                                        >
                                            {dayLabel(o.start)}
                                        </p>
                                    )}
                                    <div className={cn('px-3', o.running && 'bg-run-bg')}>
                                        <div
                                            className={cn(
                                                'flex items-center gap-2.5 py-3.5',
                                                // dòng đang chạy đã có nền riêng, không cần kẻ ngăn
                                                !newDay && !schedule[i - 1].running && 'border-t border-line-soft',
                                            )}
                                        >
                                            {/* chấm + vạch timeline */}
                                            <span
                                                aria-hidden="true"
                                                className="flex flex-col items-center self-stretch gap-1 pt-1.5 shrink-0"
                                            >
                                                <span
                                                    className={cn(
                                                        'rounded-full size-2',
                                                        o.running ? 'bg-run' : 'bg-line-strong',
                                                    )}
                                                />
                                                <span
                                                    className={cn(
                                                        'flex-1 w-px',
                                                        o.running ? 'bg-run' : 'bg-line-strong',
                                                    )}
                                                />
                                            </span>
                                            <div className="flex flex-col gap-1 w-11 tabular-nums leading-tight shrink-0">
                                                <span className="font-semibold">{st.time}</span>
                                                <span className="sr-only">đến</span>
                                                <span className="text-subText text-sm">{et.time}</span>
                                            </div>
                                            <div className="flex flex-col flex-1 gap-1 pl-2.5 border-line border-l min-w-0 leading-tight">
                                                <span className="font-semibold truncate">{o.code}</span>
                                                <span className="text-subText text-sm">
                                                    {formatDuration(o.start, o.end)}
                                                </span>
                                            </div>
                                            {o.running ? (
                                                <>
                                                    {/* nền xanh của hàng chỉ là tín hiệu nhìn, đọc trạng thái cho trình đọc màn hình */}
                                                    <span className="sr-only">Đang chạy</span>
                                                    <Button
                                                        ref={stopBtn}
                                                        type="button"
                                                        variant="outline"
                                                        aria-label={`Dừng sớm lệnh ${o.code}`}
                                                        onClick={() => {
                                                            setTarget({ code: o.code, next: queue[0]?.code });
                                                            setConfirming(true);
                                                        }}
                                                        className="gap-1.5 bg-card hover:bg-stop-cell px-3 border-stop-line rounded-full h-9 [&_svg]:size-4 font-semibold text-stop-fg hover:text-stop-fg shrink-0"
                                                    >
                                                        <LuCircleStop aria-hidden="true" />
                                                        {/* chữ ngắn để màn 320px không cắt mã lệnh; aria-label đã đủ nghĩa */}
                                                        Dừng
                                                    </Button>
                                                </>
                                            ) : (
                                                <span className="tabular-nums text-subText text-sm shrink-0">
                                                    Chờ #{queuePos}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                )}
            </div>

            <Dialog open={confirming} onOpenChange={setConfirming}>
                <DialogContent
                    showCloseButton={false}
                    className="rounded-2xl"
                    onCloseAutoFocus={(e) => {
                        // nút Dừng sớm cũ đã unmount sau khi dừng: focus nút của lệnh chạy mới, hết lệnh thì về Tạo lệnh
                        e.preventDefault();
                        (stopBtn.current ?? toggleBtn.current)?.focus();
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>Dừng sớm lệnh {target.code}?</DialogTitle>
                        <DialogDescription>
                            {target.next
                                ? `${target.next} sẽ chạy ngay, các lệnh chờ sau được dời lên sớm hơn.`
                                : 'Không còn lệnh chờ, máy sẽ chuyển sang Dừng.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="border-line-strong rounded-xl h-11 font-semibold text-base"
                            >
                                Huỷ
                            </Button>
                        </DialogClose>
                        <Button
                            type="button"
                            onClick={() => {
                                stop();
                                setConfirming(false);
                            }}
                            className="bg-stop hover:bg-stop/90 rounded-xl h-11 font-semibold text-white text-base"
                        >
                            Dừng lệnh
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <span role="status" className="sr-only">
                {announce}
            </span>
        </section>
    );
}
