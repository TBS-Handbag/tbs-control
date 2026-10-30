'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { parseTime } from '@internationalized/date';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LuAlarmClockPlus } from 'react-icons/lu';
import { z } from 'zod';
import { extendOrder } from '@/app/machines/[id]/actions';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { TimeField } from '@/components/ui/time-field';
import { type Order, formatDateTime } from '@/lib/data/machines';

// lệnh phải xong trước 22:00; phần hàng chờ bị lùi theo thì server (extend_order) kiểm và báo giờ muộn nhất
const DEADLINE = 22 * 60;
// "HH:mm..." -> số phút
const minutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const hhmm = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;

type Props = {
    machineId: string;
    /** Lệnh đang Hoạt động hoặc lệnh vừa kết thúc */
    order: Order;
};

/** Nút + dialog "Thêm giờ": lệnh chạy quá giờ dự kiến thì dời giờ kết thúc, hàng chờ lùi theo. */
export function ExtendOrderDialog({ machineId, order }: Props) {
    const [open, setOpen] = useState(false);
    const [announce, setAnnounce] = useState('');
    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Thêm giờ lệnh ${order.code}`}
                        className="rounded-full size-9 text-main hover:text-main shrink-0"
                    >
                        <LuAlarmClockPlus aria-hidden="true" />
                    </Button>
                </DialogTrigger>
                <DialogContent showCloseButton={false} className="rounded-2xl">
                    {/* form nằm trong DialogContent nên mỗi lần mở là form mới, giá trị mặc định đúng lệnh hiện tại */}
                    <ExtendForm
                        machineId={machineId}
                        order={order}
                        onDone={(end) => {
                            setOpen(false);
                            setAnnounce(`Đã dời giờ kết thúc ${order.code} tới ${end}`);
                        }}
                    />
                </DialogContent>
            </Dialog>
            <span role="status" className="sr-only">
                {announce}
            </span>
        </>
    );
}

function ExtendForm({ machineId, order, onDone }: Props & { onDone: (end: string) => void }) {
    const oldEnd = minutes(formatDateTime(order.end).time);
    const form = useForm({
        resolver: zodResolver(
            z.object({ end: z.string() }).superRefine((v, ctx) => {
                const issue = (message: string) => ctx.addIssue({ code: 'custom', path: ['end'], message });
                if (!v.end) issue('Nhập giờ kết thúc mới');
                else if (minutes(v.end) <= oldEnd) issue(`Giờ kết thúc mới phải sau ${hhmm(oldEnd)}`);
                else if (minutes(v.end) > DEADLINE) issue('Giờ kết thúc muộn nhất là 22:00');
            }),
        ),
        defaultValues: { end: `${formatDateTime(order.end).time}:00` },
    });

    const submit = form.handleSubmit(async (v) => {
        const end = v.end.slice(0, 5);
        const { error } = await extendOrder(machineId, order.id, end);
        if (error) form.setError('end', { message: error });
        else onDone(end);
    });

    return (
        <Form {...form}>
            <form onSubmit={submit} className="flex flex-col gap-4">
                <DialogHeader>
                    <DialogTitle>Thêm giờ lệnh {order.code}</DialogTitle>
                    <DialogDescription>
                        Dự kiến kết thúc {hhmm(oldEnd)}. Lệnh sau bị đè giờ thì cả hàng chờ lùi theo.
                    </DialogDescription>
                </DialogHeader>
                <FormField
                    control={form.control}
                    name="end"
                    render={({ field, fieldState }) => (
                        <FormItem className="gap-1.5">
                            <FormLabel className="font-medium text-labelText">Kết thúc lúc</FormLabel>
                            <FormControl>
                                <TimeField
                                    aria-label="Giờ kết thúc mới"
                                    autoFocus
                                    isInvalid={!!fieldState.error}
                                    value={field.value ? parseTime(field.value) : null}
                                    onChange={(v) => field.onChange(v?.toString() ?? '')}
                                    onBlur={field.onBlur}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" size="lg" className="border-line-strong">
                            Huỷ
                        </Button>
                    </DialogClose>
                    <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                        Lưu giờ mới
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}
