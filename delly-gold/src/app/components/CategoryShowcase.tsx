"use client";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

const categories = [
  {
    title: "ویترین اقتصادی",
    desc: "طلاهای سبک و اقتصادی\nشروع از ۵۰۰,۰۰۰ تومان",
    image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80",
    icon: "💎",
    href: "/showcase#economic",
  },
  {
    title: "ویترین دانشجویی",
    desc: "سبک: شیک، دانشجویی\nمناسب هر سلیقه",
    image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=80",
    icon: "🎓",
    href: "/showcase#student",
  },
  {
    title: "پیشنهاد ویژه",
    desc: "تخفیف‌های محدود\nفرصت رو دست نده",
    image: "https://images.unsplash.com/photo-1629134073875-6c8f6b2c7e71?w=600&q=80",
    icon: "🎁",
    href: "/showcase#special",
  },
];

export default function CategoryShowcase() {
  return (
    <section style={{ maxWidth: "1280px", margin: "40px auto", padding: "0 16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }} className="cat-grid">
        {categories.map((cat, i) => (
          <Link key={i} href={cat.href} style={{ textDecoration: "none", display: "block", position: "relative", borderRadius: "12px", overflow: "hidden", height: "220px", cursor: "pointer", border: "1px solid #2a2a2a", transition: "border-color 0.2s, transform 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#d4af37"; (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>

            <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${cat.image})`, backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.4)", transition: "filter 0.3s" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(14,14,14,0.6) 100%)" }} />

            <div style={{ position: "relative", padding: "24px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", backgroundColor: "rgba(212,175,55,0.2)", border: "1px solid rgba(212,175,55,0.4)", borderRadius: "8px", fontSize: "20px", marginBottom: "12px" }}>
                  {cat.icon}
                </div>
                <h3 style={{ color: "#fff", fontSize: "18px", fontWeight: "700", marginBottom: "6px" }}>{cat.title}</h3>
                <p style={{ color: "#aaa", fontSize: "12px", lineHeight: "1.6", whiteSpace: "pre-line" }}>{cat.desc}</p>
              </div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#d4af37", fontSize: "13px", fontWeight: "600", border: "1px solid rgba(212,175,55,0.4)", padding: "6px 14px", borderRadius: "6px", backgroundColor: "rgba(212,175,55,0.1)", width: "fit-content" }}>
                <ChevronLeft size={14} />
                مشاهده
              </span>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cat-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
