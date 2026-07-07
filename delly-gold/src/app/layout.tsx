import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./components/CartContext";
import ThemeLoader from "./components/ThemeLoader";
import TawkToChat from "./components/TawkToChat";

const kavenegarPushAppId = process.env.NEXT_PUBLIC_KAVENEGAR_PUSH_APP_ID;

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
      <head>
        {kavenegarPushAppId && (
          <script
            src={`https://cdn.kavenegar.com/sdk/page.js?appId=${kavenegarPushAppId}`}
            defer
            charSet="utf-8"
          />
        )}
      </head>
      <body>
        <ThemeLoader />
        <CartProvider>{children}</CartProvider>
        <TawkToChat />
      </body>
    </html>
  );
}
