import type { Metadata } from "next";
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
