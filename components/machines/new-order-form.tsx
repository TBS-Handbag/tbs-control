'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { getLocalTimeZone, parseTime, today } from '@internationalized/date';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { LuX } from 'react-icons/lu';
import { z } from 'zod';
import { cardClass } from '@/components/machines/detail-section';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { TimeField } from '@/components/ui/time-field';
import { cn } from '@/lib/utils';

const schema = z
    .object({
        start: z.string().min(1, 'Nhập giờ bắt đầu'),
        end: z.string().min(1, 'Nhập giờ kết thúc'),
    })
    // chuỗi HH:mm:ss cùng định dạng (Time.toString()) nên so sánh chuỗi là đúng thứ tự thời gian
    .refine((v) => v.end > v.start, { message: 'Giờ kết thúc phải sau giờ bắt đầu', path: ['end'] });

const FIELDS = [
    { name: 'start', label: 'Bắt đầu' },
    { name: 'end', label: 'Kết thúc' },
] as const;

export function NewOrderForm({ onClose }: { onClose: () => void }) {
    const titleId = useId();
    const form = useForm({ resolver: zodResolver(schema), defaultValues: { start: '', end: '' } });
    // ngày của lệnh luôn là hôm nay; khi lưu: date.toCalendarDateTime(parseTime(start))
    const date = today(getLocalTimeZone());

    return (
        <Form {...form}>
            <form
                aria-labelledby={titleId}
                // shortcut: submit hợp lệ chỉ đóng form, chưa lưu lệnh; nối API tạo lệnh khi có data layer.
                onSubmit={form.handleSubmit(onClose)}
                onKeyDown={(e) => e.key === 'Escape' && onClose()}
                className={cn(cardClass, 'flex flex-col gap-4 p-4 border-main/30')}
            >
                <div className="flex justify-between items-center gap-2 -mt-1 -mr-1">
                    <div>
                        <h3 id={titleId} className="font-semibold text-base">
                            Tạo lệnh mới
                        </h3>
                        <p className="text-subText text-sm">
                            Hôm nay, {date.toDate(getLocalTimeZone()).toLocaleDateString('vi-VN')}
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
                {FIELDS.map((f, i) => (
                    <FormField
                        key={f.name}
                        control={form.control}
                        name={f.name}
                        render={({ field, fieldState }) => (
                            <FormItem className="gap-1.5">
                                <FormLabel className="font-medium text-labelText">{f.label}</FormLabel>
                                <FormControl>
                                    <TimeField
                                        aria-label={`Giờ ${f.label.toLowerCase()}`}
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
                    <Button type="submit" size="lg">
                        Tạo lệnh
                    </Button>
                </div>
            </form>
        </Form>
    );
}
