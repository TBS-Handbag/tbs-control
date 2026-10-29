'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** Tải lại dữ liệu server định kỳ (lệnh tự chuyển theo giờ); state form đang nhập không bị mất. */
export function AutoRefresh({ ms = 60000 }: { ms?: number }) {
    const router = useRouter();
    useEffect(() => {
        const t = setInterval(() => router.refresh(), ms);
        return () => clearInterval(t);
    }, [router, ms]);
    return null;
}
