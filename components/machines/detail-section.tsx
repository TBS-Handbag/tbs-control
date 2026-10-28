import { useId, type ReactNode } from 'react';

export const cardClass = 'bg-card border border-line rounded-2xl shadow-sm shadow-main/5';

/** Một nhóm nội dung trong trang chi tiết: tiêu đề lớn phía trên, nội dung bên dưới. */
export function DetailSection({ title, children }: { title: string; children: ReactNode }) {
    const id = useId();
    return (
        <section aria-labelledby={id} className="flex flex-col gap-3">
            <h2 id={id} className="px-0.5 font-bold text-main text-xl">
                {title}
            </h2>
            {children}
        </section>
    );
}
