"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const PayIcon = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <rect x="6" y="10" width="40" height="28" rx="3" stroke="#1a1a1a" strokeWidth="2.5"/>
    <line x1="6" y1="20" x2="46" y2="20" stroke="#1a1a1a" strokeWidth="2.5"/>
    <rect x="12" y="25" width="10" height="7" rx="1.5" stroke="#1a1a1a" strokeWidth="2"/>
    <circle cx="38" cy="28.5" r="4" stroke="#1a1a1a" strokeWidth="2"/>
    <text x="38" y="31.5" textAnchor="middle" fontSize="5" fontWeight="900" fill="#1a1a1a">$</text>
  </svg>
);
const HandIcon = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <path d="M14 34V22a3 3 0 016 0v6" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M20 28v-3a3 3 0 016 0v3" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M26 28v-2a3 3 0 016 0v2" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M32 30v-1a3 3 0 016 0v6c0 4-3 7-7 7h-6c-2 0-4-1-5-3l-5-8a2.5 2.5 0 014-3l3 4" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ShopIcon = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <path d="M8 20h36v24H8z" stroke="#1a1a1a" strokeWidth="2.5"/>
    <path d="M15 20v-4a11 11 0 0122 0v4" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round"/>
    <rect x="18" y="28" width="16" height="16" rx="1" stroke="#1a1a1a" strokeWidth="2"/>
    <line x1="26" y1="28" x2="26" y2="44" stroke="#1a1a1a" strokeWidth="2"/>
  </svg>
);
const TruckIcon = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <rect x="4" y="16" width="30" height="22" rx="2" stroke="#1a1a1a" strokeWidth="2.5"/>
    <path d="M34 22h8l6 8v8h-14V22z" stroke="#1a1a1a" strokeWidth="2.5" strokeLinejoin="round"/>
    <circle cx="13" cy="40" r="4" stroke="#1a1a1a" strokeWidth="2.5"/>
    <circle cx="39" cy="40" r="4" stroke="#1a1a1a" strokeWidth="2.5"/>
    <line x1="17" y1="40" x2="35" y2="40" stroke="#1a1a1a" strokeWidth="2"/>
  </svg>
);

const defaultIcons: Record<string, React.ReactNode> = {
  "پرداخت اقساط":  <PayIcon />,
  "دلگرمی مشتری": <HandIcon />,
  "شعب":           <ShopIcon />,
  "ارسال رایگان":  <TruckIcon />,
};
const iconList = [<PayIcon key="p"/>, <HandIcon key="h"/>, <ShopIcon key="s"/>, <TruckIcon key="t"/>];

interface TrustItem { label: string; href: string; }

const DEFAULT_ITEMS: TrustItem[] = [
  { label: "پرداخت اقساط",  href: "/contact" },
  { label: "دلگرمی مشتری", href: "/about" },
  { label: "شعب",           href: "/contact" },
  { label: "ارسال رایگان",  href: "/about" },
];

export default function TrustBar() {
  const [items, setItems] = useState<TrustItem[]>(DEFAULT_ITEMS);

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(d => {
      if (!d.success) return;
      if (d.data.trust_items) {
        try { setItems(JSON.parse(d.data.trust_items)); } catch {}
      }
    }).catch(() => {});
  }, []);

  return (
    <section style={{ backgroundColor: "#fff", padding: "36px 16px 28px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${items.length},1fr)`, gap: "0", maxWidth: "680px", margin: "0 auto" }} className="trust-grid">
          {items.map((item, i) => (
            <Link key={i} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "16px 8px", textDecoration: "none", transition: "transform 0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "translateY(0)"}>
              <div style={{ width: "64px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {defaultIcons[item.label] || iconList[i % iconList.length]}
              </div>
              <span style={{ color: "#333", fontSize: "12px", fontWeight: "600", textAlign: "center", whiteSpace: "nowrap" }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:600px){.trust-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>
    </section>
  );
}
