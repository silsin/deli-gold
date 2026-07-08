"use client";
import { useState, useEffect } from "react";

interface GoldPrice { price: number; }

export default function AnnouncementBar() {
  const [gold, setGold] = useState<GoldPrice | null>(null);

  useEffect(() => {
    const fetchGold = () => {
      fetch("/api/admin/gold-price", { cache: "no-store" })
        .then(r => r.json()).then(d => { if (d.success) setGold(d.data); }).catch(() => {});
    };
    fetchGold();
    const iv = setInterval(fetchGold, 60_000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{
      background: "linear-gradient(135deg, #7b1a1a 0%, #8b2020 40%, #7b1a1a 100%)",
      height: "38px", display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      {/* Subtle shimmer line */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(90deg, transparent 0%, rgba(200,161,42,0.08) 50%, transparent 100%)", pointerEvents: "none" }} />

      <div style={{ display: "flex", alignItems: "center", gap: "10px", zIndex: 1 }}>
        {/* Left heart */}
        <span style={{ color: "#c8a12a", fontSize: "14px", opacity: 0.9 }}>✦</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#c8a12a" opacity={0.85}>
          <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
        </svg>

        <span style={{ color: "#fff", fontSize: "12px", fontWeight: "500", letterSpacing: "0.3px" }}>
          <span>قیمت </span>
          <span style={{ color: "#f0c040", fontWeight: "800", fontSize: "13px" }}>طلا</span>
          <span>: </span>
          <span style={{ color: "#f0c040", fontWeight: "800", fontSize: "13px", direction: "ltr", display: "inline-block" }}>
            {gold ? `${gold.price.toLocaleString("fa-IR")} تومان` : "..."}
          </span>
        </span>

        {/* Right heart */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#c8a12a" opacity={0.85}>
          <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
        </svg>
        <span style={{ color: "#c8a12a", fontSize: "14px", opacity: 0.9 }}>✦</span>
      </div>
    </div>
  );
}
