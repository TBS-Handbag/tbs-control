'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { getLocalTimeZone, now, parseTime, toTime, today } from '@internationalized/date';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { LuX } from 'react-icons/lu';
import { z } from 'zod';
import { createOrder } from '@/app/machines/[id]/actions';
import { cardClass } from '@/components/machines/detail-section';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { TimeField } from '@/components/ui/time-field';
import { formatDateTime } from '@/lib/data/machines';
import { cn } from '@/lib/utils';

// máy còn lệnh: chỉ nhập thời lượng (nối sau lệnh cuối); máy trống: chọn giờ bắt đầu/kết thúc hôm nay
const makeSchema = (chained: boolean) =>
    z.object({ start: z.string(), end: z.string(), duration: z.string() }).superRefine((v, ctx) => {
        const issue = (path: keyof typeof v, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
        if (chained) {
            if (!v.duration) issue('duration', 'Nhập thời lượng');
            else if (v.duration === '00:00:00') issue('duration', 'Thời lượng phải lớn hơn 0');
            return;
        }
        if (!v.start) issue('start', 'Nhập giờ bắt đầu');
        if (!v.end) issue('end', 'Nhập giờ kết thúc');
        // chuỗi HH:mm:ss cùng định dạng (Time.toString()) nên so sánh chuỗi là đúng thứ tự thời gian
        else if (v.start && v.end <= v.start) issue('end', 'Giờ kết thúc phải sau giờ bắt đầu');
    });

const RANGE_FIELDS = [
    { name: 'start', label: 'Bắt đầu' },
    { name: 'end', label: 'Kết thúc' },
] as const;
const DURATION_FIELDS = [{ name: 'duration', label: 'Thời lượng' }] as const;

type Props = {
    machineId: string;
    /** Giờ kết thúc lệnh cuối ("2026-10-28T06:00"); có thì lệnh mới nối ngay sau đó. */
    chainStart?: string;
    onClose: () => void;
};

export function NewOrderForm({ machineId, chainStart, onClose }: Props) {
    const titleId = useId();
    const form = useForm({
        resolver: zodResolver(makeSchema(!!chainStart)),
        // máy trống: giờ bắt đầu mặc định là phút hiện tại, người dùng sửa được
        defaultValues: {
            start: chainStart ? '' : toTime(now(getLocalTimeZone())).set({ second: 0, millisecond: 0 }).toString(),
            end: '',
            duration: '',
        },
    });
    const date = today(getLocalTimeZone());
    const chain = formatDateTime(chainStart);
    const fields = chainStart ? DURATION_FIELDS : RANGE_FIELDS;

    const submit = form.handleSubmit(async (v) => {
        const { error } = await createOrder(
            machineId,
            chainStart ? { duration: v.duration } : { start: v.start, end: v.end },
        );
        if (error) form.setError(chainStart ? 'duration' : 'end', { message: error });
        else onClose();
    });

    return (
        <Form {...form}>
            <form
                aria-labelledby={titleId}
                onSubmit={submit}
                onKeyDown={(e) => e.key === 'Escape' && onClose()}
                className={cn(cardClass, 'flex flex-col gap-4 p-4 border-main/30')}
            >
                <div className="flex justify-between items-center gap-2 -mt-1 -mr-1">
                    <div>
                        <h3 id={titleId} className="font-semibold text-base">
                            Tạo lệnh mới
                        </h3>
                        <p className="text-subText text-sm">
                            {chainStart
                                ? `Bắt đầu ${chain.time} ngày ${chain.date}, nối tiếp lệnh cuối`
                                : `Hôm nay, ${date.toDate(getLocalTimeZone()).toLocaleDateString('vi-VN')}`}
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Đóng"
                        onClick={onClose}
                        className="rounded-full size-9 text-subText"
                    >
                        <LuX aria-hidden="true" />
                    </Button>
                </div>
                {fields.map((f, i) => (
                    <FormField
                        key={f.name}
                        control={form.control}
                        name={f.name}
                        render={({ field, fieldState }) => (
                            <FormItem className="gap-1.5">
                                <FormLabel className="font-medium text-labelText">{f.label}</FormLabel>
                                <FormControl>
                                    <TimeField
                                        aria-label={chainStart ? 'Thời lượng (giờ:phút)' : `Giờ ${f.label.toLowerCase()}`}
                                        autoFocus={i === 0}
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
                ))}
                <div className="gap-2.5 grid grid-cols-2 pt-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={onClose}
                        className="border-line-strong"
                    >
                        Huỷ
                    </Button>
                    <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                        Tạo lệnh
                    </Button>
                </div>
            </form>
        </Form>
    );
}
