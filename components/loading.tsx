export function Loading() {
    return (
        // ẩn 500ms đầu để điều hướng nhanh không bị nháy chữ
        <p
            role="status"
            className="p-8 text-subText text-base text-center animate-in fade-in fill-mode-both delay-500 duration-300"
        >
            Đang tải dữ liệu…
        </p>
    );
}
