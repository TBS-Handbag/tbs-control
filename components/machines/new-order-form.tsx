'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { parseDateTime } from '@internationalized/date';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { LuX } from 'react-icons/lu';
import { z } from 'zod';
import { cardClass } from '@/components/machines/detail-section';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';

const schema = z
    .object({
        start: z.string().min(1, 'Chọn thời gian bắt đầu'),
        end: z.string().min(1, 'Chọn thời gian kết thúc'),
    })
    // chuỗi ISO cùng định dạng (CalendarDateTime.toString()) nên so sánh chuỗi là đúng thứ tự thời gian
    .refine((v) => v.end > v.start, { message: 'Thời gian kết thúc phải sau thời gian bắt đầu', path: ['end'] });

const FIELDS = [
    { name: 'start', label: 'Bắt đầu' },
    { name: 'end', label: 'Kết thúc' },
] as const;

export function NewOrderForm({ onClose }: { onClose: () => void }) {
    const titleId = useId();
    const form = useForm({ resolver: zodResolver(schema), defaultValues: { start: '', end: '' } });

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
                    <h3 id={titleId} className="font-semibold text-base">
                        Tạo lệnh mới
                    </h3>
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
                                    <DatePicker
                                        aria-label={`Thời gian ${f.label.toLowerCase()}`}
                                        granularity="minute"
                                        autoFocus={i === 0}
                                        isInvalid={!!fieldState.error}
                                        value={field.value ? parseDateTime(field.value) : null}
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
                        onClick={onClose}
                        className="border-line-strong rounded-xl h-11 font-semibold text-base"
                    >
                        Huỷ
                    </Button>
                    <Button type="submit" className="rounded-xl h-11 font-semibold text-base">
                        Tạo lệnh
                    </Button>
                </div>
            </form>
        </Form>
    );
}
