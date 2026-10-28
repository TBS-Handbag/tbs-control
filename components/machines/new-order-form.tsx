'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { parseDateTime } from '@internationalized/date';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LuPlus } from 'react-icons/lu';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const schema = z
    .object({
        start: z.string().min(1, 'Chọn thời gian bắt đầu'),
        end: z.string().min(1, 'Chọn thời gian kết thúc'),
    })
    // chuỗi ISO cùng định dạng (CalendarDateTime.toString()) nên so sánh chuỗi là đúng thứ tự thời gian
    .refine((v) => v.end > v.start, { message: 'Thời gian kết thúc phải sau thời gian bắt đầu', path: ['end'] });

const FIELDS = [
    { name: 'start', label: 'Thời gian bắt đầu' },
    { name: 'end', label: 'Thời gian kết thúc' },
] as const;

export function NewOrderForm() {
    const [open, setOpen] = useState(false);
    const toggleBtn = useRef<HTMLButtonElement>(null);
    const form = useForm({ resolver: zodResolver(schema), defaultValues: { start: '', end: '' } });

    const close = () => {
        setOpen(false);
        form.reset();
        // form unmount làm mất focus, trả về nút mở cho người dùng bàn phím
        requestAnimationFrame(() => toggleBtn.current?.focus());
    };

    if (!open) {
        return (
            <Button
                ref={toggleBtn}
                type="button"
                aria-expanded={false}
                onClick={() => setOpen(true)}
                className="rounded-2xl h-14 [&_svg]:size-5 font-semibold text-base"
            >
                <LuPlus aria-hidden="true" />
                Tạo lệnh mới
            </Button>
        );
    }

    return (
        <Form {...form}>
            <form
                aria-labelledby="new-order"
                // shortcut: submit hợp lệ chỉ đóng form, chưa lưu lệnh; nối API tạo lệnh khi có data layer.
                onSubmit={form.handleSubmit(close)}
                onKeyDown={(e) => e.key === 'Escape' && close()}
                className="flex flex-col gap-3 bg-card p-4 border border-line rounded-2xl"
            >
                <h2 id="new-order" className="font-bold text-base">
                    Tạo lệnh mới
                </h2>
                {FIELDS.map((f, i) => (
                    <FormField
                        key={f.name}
                        control={form.control}
                        name={f.name}
                        render={({ field, fieldState }) => (
                            <FormItem className="gap-1.5">
                                <FormLabel className="font-semibold text-labelText">{f.label}</FormLabel>
                                <FormControl>
                                    <DatePicker
                                        aria-label={f.label}
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
                <div className="gap-2.5 grid grid-cols-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={close}
                        className="border-line-strong rounded-xl h-12 font-semibold text-base"
                    >
                        Huỷ
                    </Button>
                    <Button type="submit" className="rounded-xl h-12 [&_svg]:size-5 font-semibold text-base">
                        <LuPlus aria-hidden="true" />
                        Tạo lệnh
                    </Button>
                </div>
            </form>
        </Form>
    );
}
