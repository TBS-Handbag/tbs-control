import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Theo dõi máy',
        short_name: 'TBS Control',
        description: 'Theo dõi trạng thái và lệnh Hoạt động của máy theo khu vực',
        start_url: '/',
        display: 'standalone',
        // Manifest chỉ nhận hex, khớp --surface và --main trong globals.css
        background_color: '#F3F6F4',
        theme_color: '#00402A',
        // shortcut: chỉ có PNG 256 tách từ favicon, cần ảnh gốc to hơn nếu muốn thêm 512
        icons: [{ src: '/icon-256.png', sizes: '256x256', type: 'image/png', purpose: 'any' }],
    };
}
