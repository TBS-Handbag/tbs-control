'use client';

import { Button } from '@/components/ui/button';

export default function ErrorPage({ reset }: { reset: () => void }) {
    return (
        <main role="alert" className="flex flex-col items-center gap-4 p-8 text-center">
            <p className="font-semibold text-mainText text-lg">Không tải được dữ liệu</p>
            <p className="text-subText text-sm">Kiểm tra kết nối rồi thử lại.</p>
            <Button type="button" size="lg" onClick={reset}>
                Thử lại
            </Button>
        </main>
    );
}
