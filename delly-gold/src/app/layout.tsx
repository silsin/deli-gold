import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./components/CartContext";
import ThemeLoader from "./components/ThemeLoader";

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
      <body>
        <ThemeLoader />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
