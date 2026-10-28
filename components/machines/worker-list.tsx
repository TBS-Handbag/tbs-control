'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LuPlus, LuX } from 'react-icons/lu';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const schema = z.object({
    name: z.string().trim().min(1, 'Nhập tên công nhân').max(50, 'Tên tối đa 50 ký tự'),
});

const normalize = (s: string) => s.trim().replace(/\s+/g, ' ');

type Props = { title: string; initialNames: string[] };

export function WorkerList({ title, initialNames }: Props) {
    // shortcut: chỉ lưu state cục bộ (reload là mất), thay bằng insert/delete Supabase khi có data layer.
    const [names, setNames] = useState(initialNames);
    const [announce, setAnnounce] = useState('');
    const headingId = useId();
    const form = useForm({ resolver: zodResolver(schema), defaultValues: { name: '' } });

    const add = ({ name }: z.infer<typeof schema>) => {
        const value = normalize(name);
        if (names.some((n) => n.toLocaleLowerCase('vi') === value.toLocaleLowerCase('vi'))) {
            form.setError('name', { message: `${value} đã có trong danh sách` });
            return;
        }
        setNames([...names, value]);
        setAnnounce(`Đã thêm ${value}`);
        form.reset();
    };

    const remove = (name: string) => {
        setNames(names.filter((n) => n !== name));
        setAnnounce(`Đã xoá ${name}`);
        // nút xoá biến mất làm mất focus, đưa về ô nhập
        form.setFocus('name');
    };

    return (
        <section aria-labelledby={headingId} className="flex flex-col gap-2.5">
            <div className="flex justify-between items-baseline gap-2">
                <h3 id={headingId} className="font-semibold text-labelText text-sm">
                    {title}
                </h3>
                <span className="text-subText text-xs">{names.length} người</span>
            </div>

            {names.length === 0 ? (
                <p className="text-subText text-sm">Chưa có công nhân nào.</p>
            ) : (
                <ul className="flex flex-wrap gap-2">
                    {names.map((n) => (
                        <li
                            key={n}
                            className="flex items-center gap-1 bg-main-tint py-1 pr-1 pl-3 rounded-full max-w-full font-medium text-main text-sm"
                        >
                            <span className="truncate">{n}</span>
                            <button
                                type="button"
                                aria-label={`Xoá ${n} khỏi ${title.toLowerCase()}`}
                                onClick={() => remove(n)}
                                className="flex justify-center items-center hover:bg-main hover:text-white rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring size-8 shrink-0"
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
                            <FormItem className="flex-1 gap-1.5">
                                <FormLabel className="sr-only">Tên công nhân {title.toLowerCase()}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Nhập tên công nhân"
                                        autoComplete="off"
                                        enterKeyHint="done"
                                        className="rounded-xl h-11 text-base md:text-base"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="rounded-xl h-11 [&_svg]:size-5 font-semibold text-base shrink-0">
                        <LuPlus aria-hidden="true" />
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
