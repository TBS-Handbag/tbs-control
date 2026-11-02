'use client';

import { useId, useRef, useState, useTransition } from 'react';
import { LuCircleStop, LuPause, LuPlus, LuTrash2 } from 'react-icons/lu';
import { deleteOrder, stopOrder } from '@/app/machines/[id]/actions';
import { cardClass } from '@/components/machines/detail-section';
import { ExtendOrderDialog } from '@/components/machines/extend-order-dialog';
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
import { type Order, formatDateTime, formatDuration } from '@/lib/data/machines';
import { cn } from '@/lib/utils';

// "2026-10-28T06:00" -> "thứ tư, 28/10" (class capitalize viết hoa từng từ)
const dayLabel = (iso: string) =>
    new Date(iso).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' });

type Props = { machineId: string; previous: Order | null; current: Order | null; queue: Order[] };

/** Card "Hàng chờ": lệnh vừa kết thúc, lệnh đang Hoạt động + hàng chờ, nút Tạo lệnh, Thêm giờ, Dừng sớm và Xoá lệnh. */
export function OrderQueue({ machineId, previous, current, queue }: Props) {
    const [pending, startAction] = useTransition();
    const [actionError, setActionError] = useState('');
    const [open, setOpen] = useState(false);
    const [confirming, setConfirming] = useState(false);
    // chụp nội dung lúc mở dialog để chữ không đổi sang lệnh mới trong lúc dialog đang đóng;
    // có id là xoá lệnh đó, không có là dừng lệnh đang Hoạt động; running: lệnh bị xoá đang Hoạt động
    const [target, setTarget] = useState<{ id?: number; code: string; next?: string; running?: boolean }>({
        code: '',
    });
    const [announce, setAnnounce] = useState('');
    const headingId = useId();
    const toggleBtn = useRef<HTMLButtonElement>(null);
    const stopBtn = useRef<HTMLButtonElement>(null);
    const triggerBtn = useRef<HTMLButtonElement | null>(null);

    // lệnh đang Hoạt động đứng đầu, sau đó là hàng chờ theo thứ tự
    const schedule = [
        ...(current ? [{ ...current, running: true }] : []),
        ...queue.map((o) => ({ ...o, running: false })),
    ];

    const close = () => {
        setOpen(false);
        // form unmount làm mất focus, trả về nút mở cho người dùng bàn phím
        requestAnimationFrame(() => toggleBtn.current?.focus());
    };

    const ask = (t: typeof target, btn: HTMLButtonElement) => {
        triggerBtn.current = btn;
        setTarget(t);
        setActionError('');
        setConfirming(true);
    };

    const confirm = () =>
        startAction(async () => {
            const { error } = target.id ? await deleteOrder(machineId, target.id) : await stopOrder(machineId);
            // lỗi thì giữ dialog mở để hiện lỗi và cho bấm lại
            if (error) return setActionError(error);
            setConfirming(false);
            const verb = target.id ? 'xoá' : 'dừng';
            setAnnounce(
                target.id && !target.running
                    ? `Đã xoá ${target.code}`
                    : target.next
                      ? `Đã ${verb} ${target.code}, ${target.next} bắt đầu Hoạt động`
                      : `Đã ${verb} ${target.code}, máy chuyển sang Nhàn rỗi`,
            );
        });

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
            {open && <NewOrderForm machineId={machineId} chainStart={schedule.at(-1)?.end} onClose={close} />}

            <div className="border border-line rounded-xl overflow-hidden">
                {/* app tự chuyển lệnh theo giờ; máy thực tế còn chạy lệnh này thì Thêm giờ để kéo nó lại */}
                {previous && (
                    <div className="flex flex-wrap items-center gap-2.5 bg-surface px-3 py-3 border-line border-b">
                        <span
                            aria-hidden="true"
                            className="self-start bg-line-strong mt-1.5 rounded-full size-2 shrink-0"
                        />
                        <div className="flex flex-col gap-1 w-11 tabular-nums text-subText leading-tight shrink-0">
                            <span className="font-semibold">{formatDateTime(previous.start).time}</span>
                            <span className="sr-only">đến</span>
                            <span className="text-sm">{formatDateTime(previous.end).time}</span>
                        </div>
                        <div className="flex flex-col flex-1 gap-1 pl-2.5 border-line border-l min-w-14 leading-tight">
                            <span className="font-semibold text-subText truncate">{previous.code}</span>
                            <span className="text-subText text-sm">Đã kết thúc</span>
                        </div>
                        <ExtendOrderDialog machineId={machineId} order={previous} />
                    </div>
                )}
                {schedule.length === 0 ? (
                    <div className="flex items-center gap-3 p-4">
                        <span className="flex justify-center items-center bg-stop-bg rounded-full size-10 text-stop-fg shrink-0">
                            <LuPause aria-hidden="true" className="size-5" />
                        </span>
                        <div className="flex flex-col gap-0.5">
                            <p className="font-semibold text-sm">Chưa có lệnh nào</p>
                            <p className="text-subText text-xs">Máy tự chuyển sang hoạt động khi có lệnh Hoạt động.</p>
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
                                <li key={o.id}>
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
                                                'flex flex-wrap items-center gap-2.5 py-3.5',
                                                // dòng đang Hoạt động đã có nền riêng, không cần kẻ ngăn
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
                                            <div className="flex flex-col flex-1 gap-1 pl-2.5 border-line border-l min-w-14 leading-tight">
                                                <span className="font-semibold truncate">{o.code}</span>
                                                <span className="text-subText text-sm">
                                                    {formatDuration(o.start, o.end)}
                                                </span>
                                            </div>
                                            {o.running ? (
                                                <>
                                                    <span className="bg-run px-2.5 py-1 rounded-full font-semibold text-white text-xs shrink-0">
                                                        Hoạt động
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Xoá lệnh ${o.code}`}
                                                        onClick={(e) =>
                                                            ask(
                                                                {
                                                                    id: o.id,
                                                                    code: o.code,
                                                                    next: queue[0]?.code,
                                                                    running: true,
                                                                },
                                                                e.currentTarget,
                                                            )
                                                        }
                                                        className="-mr-1 rounded-full size-9 text-subText hover:text-stop-fg shrink-0"
                                                    >
                                                        <LuTrash2 aria-hidden="true" />
                                                    </Button>
                                                    {/* basis-full đẩy 2 nút chính xuống hàng riêng: to, có chữ, ngón tay to vẫn bấm trúng */}
                                                    <div className="flex gap-2.5 basis-full">
                                                        <Button
                                                            ref={stopBtn}
                                                            type="button"
                                                            aria-label={`Lệnh ${o.code} xong sớm hơn dự kiến, dừng lệnh`}
                                                            onClick={(e) =>
                                                                ask({ code: o.code, next: queue[0]?.code }, e.currentTarget)
                                                            }
                                                            className="flex-1 gap-2 bg-main hover:bg-main/90 rounded-full h-12 [&_svg]:size-5 font-semibold text-white text-base"
                                                        >
                                                            <LuCircleStop aria-hidden="true" />
                                                            Sớm hơn DK
                                                        </Button>
                                                        <ExtendOrderDialog
                                                            machineId={machineId}
                                                            order={o}
                                                            className="flex-1 h-12"
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="tabular-nums text-subText text-sm shrink-0">
                                                        Chờ #{queuePos}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Xoá lệnh ${o.code}`}
                                                        onClick={(e) =>
                                                            ask(
                                                                { id: o.id, code: o.code, next: schedule[i + 1]?.code },
                                                                e.currentTarget,
                                                            )
                                                        }
                                                        className="-mr-1 rounded-full size-9 text-subText hover:text-stop-fg shrink-0"
                                                    >
                                                        <LuTrash2 aria-hidden="true" />
                                                    </Button>
                                                </>
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
                        // Huỷ thì về nút vừa bấm; nút đó unmount (đã dừng/xoá) thì focus nút Dừng của lệnh Hoạt động, Hết lệnh thì về Tạo lệnh
                        e.preventDefault();
                        const btn = triggerBtn.current?.isConnected ? triggerBtn.current : stopBtn.current;
                        (btn ?? toggleBtn.current)?.focus();
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>
                            {target.id ? 'Xoá' : 'Dừng'} lệnh {target.code}?
                        </DialogTitle>
                        <DialogDescription>
                            {target.id && !target.running
                                ? target.next
                                    ? `${target.next} và các lệnh chờ sau được dời lên sớm hơn.`
                                    : 'Lệnh bị xoá khỏi hàng chờ.'
                                : target.next
                                  ? `${target.next} sẽ Hoạt động ngay, các lệnh chờ sau được dời lên sớm hơn.`
                                  : 'Không còn lệnh chờ, máy sẽ chuyển sang Nhàn rỗi.'}
                        </DialogDescription>
                        {actionError && (
                            <p role="alert" className="font-medium text-stop-fg text-sm">
                                {actionError}
                            </p>
                        )}
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" size="lg" className="border-line-strong">
                                Huỷ
                            </Button>
                        </DialogClose>
                        <Button
                            type="button"
                            size="lg"
                            onClick={confirm}
                            disabled={pending}
                            className="bg-stop hover:bg-stop/90 text-white"
                        >
                            {target.id ? 'Xoá' : 'Dừng'} lệnh
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
