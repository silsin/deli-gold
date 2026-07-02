"use client";
import { useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface GoldPrice { price: number; changePercent: string; isUp: boolean; }

const Ig = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
);
const Wa = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.122 1.532 5.853L.057 23.804l6.105-1.601A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.016-1.375l-.36-.213-3.727.977 1.002-3.641-.234-.373A9.818 9.818 0 012.182 12C2.182 6.575 6.575 2.182 12 2.182S21.818 6.575 21.818 12 17.425 21.818 12 21.818z"/>
  </svg>
);

export default function AnnouncementBar() {
  const [gold, setGold]           = useState<GoldPrice | null>(null);
  const [announcement, setAnn]    = useState("با اعتماد شما، سال‌ها طلایی ساختیم.");
  const [phone, setPhone]         = useState("021-1234-5678");
  const [instagram, setInstagram] = useState("#");
  const [whatsapp, setWhatsapp]   = useState("#");

  const fetchGold = useCallback(() => {
    fetch("/api/admin/gold-price", { cache: "no-store" })
      .then(r => r.json()).then(d => { if (d.success) setGold(d.data); }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchGold();
    const iv = setInterval(fetchGold, 60_000);
    // Load site settings
    fetch("/api/admin/settings").then(r => r.json()).then(d => {
      if (d.success) {
        if (d.data.site_announcement) setAnn(d.data.site_announcement);
        if (d.data.site_phone1)       setPhone(d.data.site_phone1);
        if (d.data.site_instagram)    setInstagram(d.data.site_instagram);
        if (d.data.site_whatsapp)     setWhatsapp(d.data.site_whatsapp);
      }
    }).catch(() => {});
    return () => clearInterval(iv);
  }, [fetchGold]);

  const isUp = gold?.isUp ?? true;
  const tc   = isUp ? "#16a34a" : "#dc2626";

  return (
    <div style={{ backgroundColor: "#f8f8f8", borderBottom: "1px solid #e8e8e8", height: "36px", display: "flex", alignItems: "center" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Left: social + phone */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href={instagram} aria-label="Instagram" style={{ color: "#888", display: "flex", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#c8a12a"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#888"}><Ig /></a>
          <a href={whatsapp} aria-label="WhatsApp" style={{ color: "#888", display: "flex", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#c8a12a"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#888"}><Wa /></a>
          <a href={`tel:${phone.replace(/-/g,"")}`} style={{ color: "#888", fontSize: "11px", textDecoration: "none", direction: "ltr" }}>{phone}</a>
        </div>
        {/* Center: announcement */}
        <span style={{ color: "#999", fontSize: "11px" }}>{announcement}</span>
        {/* Right: gold price */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ color: "#888", fontSize: "11px" }}>قیمت طلا:</span>
          {gold ? (
            <>
              <span style={{ color: "#c8a12a", fontSize: "12px", fontWeight: "700", direction: "ltr" }}>{gold.price.toLocaleString("fa-IR")} تومان</span>
              <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                {isUp ? <TrendingUp size={10} color={tc}/> : <TrendingDown size={10} color={tc}/>}
                <span style={{ color: tc, fontSize: "10px", fontWeight: "700" }}>{isUp?"+":"-"}{gold.changePercent}%</span>
              </span>
            </>
          ) : <span style={{ color: "#ccc", fontSize: "11px" }}>در حال دریافت...</span>}
        </div>
      </div>
    </div>
  );
}
