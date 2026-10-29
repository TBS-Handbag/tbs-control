'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LuPencil } from 'react-icons/lu';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const schema = z.object({
    name: z.string().trim().min(1, 'Nhập tên máy').max(50, 'Tên máy tối đa 50 ký tự'),
});

export function MachineNameEditor({ initialName }: { initialName: string }) {
    // shortcut: chỉ lưu state cục bộ (reload là mất), thay bằng update Supabase khi có data layer.
    const [name, setName] = useState(initialName);
    const [editing, setEditing] = useState(false);
    const editBtn = useRef<HTMLButtonElement>(null);
    const form = useForm({ resolver: zodResolver(schema), defaultValues: { name } });

    const open = () => {
        form.reset({ name });
        setEditing(true);
    };
    const close = () => {
        setEditing(false);
        // form unmount làm mất focus, trả về nút sửa cho người dùng bàn phím
        requestAnimationFrame(() => editBtn.current?.focus());
    };

    if (!editing) {
        return (
            <div className="flex items-center gap-2">
                <span className="flex-1 min-w-0 font-bold text-xl break-words leading-tight">{name}</span>
                <Button
                    ref={editBtn}
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Sửa tên máy"
                    onClick={open}
                    className="border-line-strong rounded-xl size-9 text-main hover:text-main shrink-0"
                >
                    <LuPencil aria-hidden="true" />
                </Button>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit((v) => {
                    setName(v.name);
                    close();
                })}
                onKeyDown={(e) => e.key === 'Escape' && close()}
                className="flex flex-col gap-2.5"
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="gap-1.5">
                            <FormLabel className="sr-only">Tên máy</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    autoFocus
                                    autoComplete="off"
                                    className="rounded-xl h-12 font-semibold text-base md:text-base"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="gap-2.5 grid grid-cols-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={close}
                        className="border-line-strong"
                    >
                        Huỷ
                    </Button>
                    <Button type="submit" size="lg">
                        Lưu tên
                    </Button>
                </div>
            </form>
        </Form>
    );
}
