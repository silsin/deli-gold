import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "دلی گلد | زیبایی، ماندگار مثل طلا",
  description: "فروشگاه اینترنتی طلا و جواهرات دلی گلد - ارسال امن و سریع به سراسر ایران",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
