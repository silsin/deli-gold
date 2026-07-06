"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Loads tawk.to live chat on public storefront pages.
 * Keys are configured in Admin → Settings (stored in DB).
 * Env vars NEXT_PUBLIC_TAWK_* are optional fallbacks.
 */
export default function TawkToChat() {
  const pathname = usePathname();
  const [config, setConfig] = useState<{ propertyId: string; widgetId: string } | null>(null);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(d => {
        if (!d.success) return;
        const propertyId =
          (d.data.tawk_property_id as string | undefined)?.trim() ||
          process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID?.trim() ||
          "";
        const widgetId =
          (d.data.tawk_widget_id as string | undefined)?.trim() ||
          process.env.NEXT_PUBLIC_TAWK_WIDGET_ID?.trim() ||
          "default";
        if (propertyId && widgetId) {
          setConfig({ propertyId, widgetId });
        }
      })
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    if (!config || pathname.startsWith("/admin")) return;
    if (document.getElementById("tawk-to-script")) return;

    const win = window as Window & { Tawk_API?: object; Tawk_LoadStart?: Date };
    win.Tawk_API = win.Tawk_API || {};
    win.Tawk_LoadStart = new Date();

    const s1 = document.createElement("script");
    s1.id = "tawk-to-script";
    s1.async = true;
    s1.src = `https://embed.tawk.to/${config.propertyId}/${config.widgetId}`;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    const s0 = document.getElementsByTagName("script")[0];
    s0?.parentNode?.insertBefore(s1, s0);
  }, [config, pathname]);

  return null;
}
