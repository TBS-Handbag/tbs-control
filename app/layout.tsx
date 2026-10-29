import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Theo dõi máy",
  description: "Theo dõi trạng thái và lệnh chạy của máy theo khu vực",
  // PWA iOS: nội dung vẽ dưới status bar (chữ trắng) để header xanh tràn lên mép trên
  appleWebApp: { capable: true, statusBarStyle: "black-translucent" },
};

// cover: không để iOS chừa dải trống quanh notch; trang nào có chữ sát mép trên tự cộng env(safe-area-inset-top)
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#00402A", // khớp --main
};

const roboto = Roboto({
  variable: "--font-roboto",
  display: "swap",
  subsets: ["latin", "vietnamese"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={roboto.variable} suppressHydrationWarning>
      <body className="antialiased">
        {/* Design chỉ có light mode */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <div className="mx-auto w-full max-w-md min-h-screen bg-surface">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
