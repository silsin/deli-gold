"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

type TawkWindow = Window & {
  Tawk_API?: {
    maximize?: () => void;
    hideWidget?: () => void;
    onLoad?: () => void;
  };
  Tawk_LoadStart?: Date;
};

function isValidTawkPropertyId(id: string): boolean {
  return /^[a-f0-9]{16,}$/i.test(id);
}

function resolveTawkConfig(data: Record<string, string | undefined>) {
  const dbId = data.tawk_property_id?.trim() || "";
  const envId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID?.trim() || "";
  const propertyId = isValidTawkPropertyId(dbId)
    ? dbId
    : isValidTawkPropertyId(envId)
      ? envId
      : "";

  const widgetId =
    data.tawk_widget_id?.trim() ||
    process.env.NEXT_PUBLIC_TAWK_WIDGET_ID?.trim() ||
    "default";

  if (!propertyId || !widgetId) return null;
  return { propertyId, widgetId };
}

/**
 * Loads tawk.to live chat on public storefront pages.
 * Keys: Admin → Settings → چت آنلاین (DB), or NEXT_PUBLIC_TAWK_* env fallback.
 * Shows a fixed «چت آنلاین» button; tawk's default bubble is hidden for a cleaner UI.
 */
export default function TawkToChat() {
  const pathname = usePathname();
  const [config, setConfig] = useState<{ propertyId: string; widgetId: string } | null>(null);
  const [tawkReady, setTawkReady] = useState(false);

  const isAdmin = pathname?.startsWith("/admin") ?? false;

  useEffect(() => {
    if (isAdmin) return;

    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(d => {
        if (!d.success) return;
        const resolved = resolveTawkConfig(d.data);
        if (resolved) setConfig(resolved);
      })
      .catch(() => {});
  }, [isAdmin]);

  useEffect(() => {
    if (!config || isAdmin) return;
    if (document.getElementById("tawk-to-script")) {
      setTawkReady(true);
      return;
    }

    const win = window as TawkWindow;
    win.Tawk_API = win.Tawk_API || {};
    win.Tawk_API.onLoad = function () {
      win.Tawk_API?.hideWidget?.();
      setTawkReady(true);
    };
    win.Tawk_LoadStart = new Date();

    const s1 = document.createElement("script");
    s1.id = "tawk-to-script";
    s1.async = true;
    s1.src = `https://embed.tawk.to/${config.propertyId}/${config.widgetId}`;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    const s0 = document.getElementsByTagName("script")[0];
    s0?.parentNode?.insertBefore(s1, s0);
  }, [config, isAdmin]);

  const openChat = useCallback(() => {
    const api = (window as TawkWindow).Tawk_API;
    if (api?.maximize) {
      api.maximize();
    }
  }, []);

  if (!config || isAdmin) return null;

  return (
    <button
      type="button"
      onClick={openChat}
      disabled={!tawkReady}
      aria-label="چت آنلاین"
      title={tawkReady ? "چت آنلاین" : "در حال بارگذاری چت..."}
      style={{
        position: "fixed",
        bottom: "24px",
        left: "24px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        backgroundColor: tawkReady ? "#c8a12a" : "#999",
        color: "#fff",
        border: "none",
        borderRadius: "999px",
        padding: "12px 20px",
        fontSize: "14px",
        fontWeight: "700",
        cursor: tawkReady ? "pointer" : "wait",
        boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        fontFamily: "inherit",
        transition: "background-color 0.2s, transform 0.2s",
      }}
      onMouseEnter={e => {
        if (tawkReady) (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.04)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
      }}
    >
      <MessageCircle size={20} />
      چت آنلاین
    </button>
  );
}
