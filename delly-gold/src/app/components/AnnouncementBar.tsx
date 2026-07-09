"use client";
import { useState, useEffect } from "react";
import { parsePriceBarStyle, DEFAULT_PRICE_BAR_STYLE, type PriceBarStyle } from "@/lib/price-bar-settings";

interface GoldPrice { price: number; }

export default function AnnouncementBar() {
  const [gold, setGold] = useState<GoldPrice | null>(null);
  const [style, setStyle] = useState<PriceBarStyle>(DEFAULT_PRICE_BAR_STYLE);

  useEffect(() => {
    const fetchGold = () => {
      fetch("/api/admin/gold-price", { cache: "no-store" })
        .then(r => r.json()).then(d => { if (d.success) setGold(d.data); }).catch(() => {});
    };
    fetchGold();
    const iv = setInterval(fetchGold, 60_000);

    fetch("/api/admin/settings", { cache: "no-store" })
      .then(r => r.json())
      .then(d => { if (d.success) setStyle(parsePriceBarStyle(d.data)); })
      .catch(() => {});

    return () => clearInterval(iv);
  }, []);

  const amount = gold ? gold.price.toLocaleString("fa-IR") : "...";

  return (
    <div style={{
      background: "linear-gradient(135deg, #7b1a1a 0%, #8b2020 40%, #7b1a1a 100%)",
      height: "38px", display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(90deg, transparent 0%, rgba(200,161,42,0.08) 50%, transparent 100%)", pointerEvents: "none" }} />

      <div style={{ display: "flex", alignItems: "center", gap: "10px", zIndex: 1 }}>
        <span style={{ color: "#c8a12a", fontSize: "14px", opacity: 0.9 }}>✦</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#c8a12a" opacity={0.85}>
          <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
        </svg>

        <span style={{ fontSize: "12px", fontWeight: "500", letterSpacing: "0.3px" }}>
          <span style={{ color: style.labelColor }}>{style.labelText} </span>
          <span style={{ color: style.goldColor, fontWeight: "800", fontSize: "13px" }}>{style.goldText}</span>
          <span style={{ color: style.labelColor }}>: </span>
          <span
            dir="ltr"
            style={{
              display: "inline-flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "4px",
              unicodeBidi: "isolate",
              fontWeight: "800",
              fontSize: "13px",
            }}
          >
            <span style={{ color: style.amountColor }}>{amount}</span>
            <span style={{ color: style.currencyColor }}>{style.currencyText}</span>
          </span>
        </span>

        <svg width="16" height="16" viewBox="0 0 24 24" fill="#c8a12a" opacity={0.85}>
          <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
        </svg>
        <span style={{ color: "#c8a12a", fontSize: "14px", opacity: 0.9 }}>✦</span>
      </div>
    </div>
  );
}
