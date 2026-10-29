'use client';

import { useEffect, useState } from 'react';
import { type Order, formatDateTime, formatDuration } from '@/lib/data/machines';
import { cn } from '@/lib/utils';

/** Lệnh đang chạy: mã · giờ chạy · thời gian còn lại + thanh tiến độ theo thời gian. */
export function OrderProgress({ order }: { order: Order }) {
    // null lúc SSR để tránh lệch giờ server/client khi hydrate
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        setNow(new Date());
        const t = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(t);
    }, []);

    const start = new Date(order.start);
    const end = new Date(order.end);
    const late = now !== null && now > end;

    return (
        <>
            <span className="text-subText text-base truncate">
                {order.code} · {formatDateTime(order.start).time} – {formatDateTime(order.end).time}
            </span>
            {/* <progress> tự kẹp value trong [0, max] nên không cần tự tính phần trăm */}
            <progress
                value={now ? now.getTime() - start.getTime() : 0}
                max={end.getTime() - start.getTime()}
                aria-label={`Tiến độ lệnh ${order.code}`}
                // trễ chỉ báo bằng chữ đỏ, thanh giữ xanh cho đỡ chói
                className="bg-line-soft [&::-moz-progress-bar]:bg-run-light [&::-webkit-progress-bar]:bg-line-soft [&::-webkit-progress-value]:bg-run-light rounded-full [&::-webkit-progress-value]:rounded-full w-full h-1.5 overflow-hidden appearance-none"
            />
        </>
    );
}
