"use client";
import Link from "next/link";

const items = [
  { label: "جدیدترین محصولات",    href: "/products" },
  { label: "جدیدترین گردنبندها",  href: "/products?category=necklaces" },
  { label: "خرید اقساطی طلا",     href: "/contact" },
  { label: "جدیدترین کالکشن‌ها",  href: "/collections" },
  { label: "پرفروش‌ترین محصولات", href: "/products" },
  { label: "جدیدترین دستبندها",   href: "/products?category=bracelets" },
  { label: "جدیدترین گوشواره‌ها", href: "/products?category=earrings" },
  { label: "محصولات ویژه",         href: "/products" },
];

export default function PromoStrip() {
  return (
    <div style={{ backgroundColor: "#c8a12a", overflow: "hidden", height: "36px", display: "flex", alignItems: "center" }}>
      <div className="ps-track" style={{ display: "flex", whiteSpace: "nowrap" }}>
        {[...items, ...items].map((item, i) => (
          <Link key={i} href={item.href} style={{
            display: "inline-flex", alignItems: "center",
            color: "#fff", textDecoration: "none",
            fontSize: "12px", fontWeight: "600",
            padding: "0 22px", height: "36px",
            borderLeft: "1px solid rgba(255,255,255,0.25)",
            whiteSpace: "nowrap", transition: "background-color 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(0,0,0,0.12)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
          >{item.label}</Link>
        ))}
      </div>
      <style>{`
        .ps-track{animation:psScroll 32s linear infinite}
        .ps-track:hover{animation-play-state:paused}
        @keyframes psScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      `}</style>
    </div>
  );
}
