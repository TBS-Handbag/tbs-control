'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useId, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { LuX } from 'react-icons/lu';
import { z } from 'zod';
import { addWorker, removeWorker } from '@/app/machines/[id]/actions';
import { cardClass } from '@/components/machines/detail-section';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PERSON_NAME, type WorkerRole } from '@/lib/data/machines';
import { cn } from '@/lib/utils';

const schema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Nhập tên công nhân')
        .max(50, 'Tên tối đa 50 ký tự')
        .regex(PERSON_NAME, 'Tên chỉ gồm chữ cái, không có số hay ký tự đặc biệt'),
});

// "  nguyễn VĂN nam " -> "Nguyễn Văn Nam"
const normalize = (s: string) =>
    s
        .trim()
        .split(/\s+/)
        .map((w) => w.charAt(0).toLocaleUpperCase('vi') + w.slice(1).toLocaleLowerCase('vi'))
        .join(' ');

type Props = { machineId: string; role: WorkerRole; title: string; names: string[] };

export function WorkerList({ machineId, role, title, names }: Props) {
    const [removing, startRemove] = useTransition();
    const [announce, setAnnounce] = useState('');
    const headingId = useId();
    const form = useForm({ resolver: zodResolver(schema), defaultValues: { name: '' } });
    const roleLabel = title.toLowerCase();

    const add = async ({ name }: z.infer<typeof schema>) => {
        const value = normalize(name);
        if (names.some((n) => n.toLocaleLowerCase('vi') === value.toLocaleLowerCase('vi'))) {
            form.setError('name', { message: `${value} đã có trong danh sách` });
            return;
        }
        const { error } = await addWorker(machineId, role, value);
        if (error) {
            form.setError('name', { message: error });
            return;
        }
        setAnnounce(`Đã thêm ${value} vào ${roleLabel}`);
        form.reset();
    };

    const remove = (name: string) =>
        startRemove(async () => {
            const { error } = await removeWorker(machineId, role, name);
            if (error) {
                form.setError('name', { message: error });
                return;
            }
            setAnnounce(`Đã xoá ${name} khỏi ${roleLabel}`);
            // nút xoá biến mất làm mất focus, đưa về ô nhập
            form.setFocus('name');
        });

    return (
        <section aria-labelledby={headingId} className={cn(cardClass, 'flex flex-col gap-3 p-3')}>
            <div className="flex items-center gap-3">
                <h3 id={headingId} className="flex-1 min-w-0 font-bold text-labelText text-base leading-tight">
                    {title}
                </h3>
                <span className="font-semibold text-subText text-sm shrink-0">{names.length} người</span>
            </div>

            {names.length === 0 ? (
                <p className="text-subText text-sm">Chưa phân công.</p>
            ) : (
                <ul className="flex flex-wrap gap-2">
                    {names.map((n) => (
                        <li
                            key={n}
                            className="flex items-center gap-1 bg-main-tint py-1 pr-1 pl-3.5 rounded-full max-w-full font-medium text-main-text text-sm"
                        >
                            <span className="truncate">{n}</span>
                            <button
                                type="button"
                                aria-label={`Xoá ${n} khỏi ${roleLabel}`}
                                onClick={() => remove(n)}
                                disabled={removing}
                                className="flex justify-center items-center hover:bg-line rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 size-8 text-labelText shrink-0"
                            >
                                <LuX aria-hidden="true" className="size-4" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(add)} className="flex items-start gap-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            // gap-0: label sr-only có lúc vẫn chiếm 1 hàng grid làm input tụt xuống lệch nút Thêm
                            <FormItem className="flex-1 gap-0 min-w-0">
                                <FormLabel className="sr-only">Tên công nhân {roleLabel}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Nhập tên công nhân"
                                        autoComplete="off"
                                        autoCapitalize="words"
                                        // "done" trên Android chỉ đóng bàn phím, không submit form
                                        enterKeyHint="go"
                                        // Chrome Android + Gboard gửi keydown Enter nhưng không tự submit form, phải tự gọi
                                        onKeyDown={(e) => {
                                            if (e.key !== 'Enter') return;
                                            e.preventDefault();
                                            form.handleSubmit(add)();
                                        }}
                                        // chỉ viết hoa khi hiển thị lúc gõ (đổi value giữa chừng làm loạn bộ gõ tiếng Việt), normalize lúc thêm mới viết hoa thật
                                        className="border-line-strong rounded-xl h-11 text-base md:text-base capitalize placeholder:normal-case"
                                    />
                                </FormControl>
                                <FormMessage className="mt-1.5" />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        aria-label={`Thêm công nhân ${roleLabel}`}
                        size="lg"
                        disabled={form.formState.isSubmitting}
                        className="shrink-0"
                    >
                        Thêm
                    </Button>
                </form>
            </Form>

            <span role="status" className="sr-only">
                {announce}
            </span>
        </section>
    );
}
