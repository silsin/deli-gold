"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

interface Banner {
  title: string; sub: string; href: string; image: string;
}

export default function PromoBanners() {
  const [b1, setB1] = useState<Banner>({ title: "تخفیف‌های دلی‌گلد", sub: "محصولات تخفیف‌دار", href: "/products", image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&q=80" });
  const [b2, setB2] = useState<Banner>({ title: "طلای کم اُجرت", sub: "محصولات با کمترین اُجرت ساخت", href: "/products", image: "https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=500&q=80" });

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(d => {
      if (!d.success) return;
      const s = d.data;
      if (s.promo_b1_title) setB1({ title: s.promo_b1_title, sub: s.promo_b1_sub || "", href: s.promo_b1_href || "/products", image: s.promo_b1_image || b1.image });
      if (s.promo_b2_title) setB2({ title: s.promo_b2_title, sub: s.promo_b2_sub || "", href: s.promo_b2_href || "/products", image: s.promo_b2_image || b2.image });
    }).catch(() => {});
  }, []);

  const Card = ({ b, dark }: { b: Banner; dark: boolean }) => (
    <Link href={b.href} style={{ textDecoration: "none", display: "block" }}>
      <div style={{ position: "relative", height: "190px", borderRadius: "12px", overflow: "hidden", backgroundColor: dark ? "#111" : "#f5f0e8", cursor: "pointer", transition: "transform 0.25s" }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "translateY(0)"}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "50%", backgroundImage: `url(${b.image})`, backgroundSize: "cover", backgroundPosition: "center", filter: dark ? "brightness(0.55)" : "brightness(0.85)" }} />
        {dark ? (
          <>
            <div style={{ position: "absolute", left: "6%", top: "50%", transform: "translateY(-50%)", color: "#c8a12a", fontSize: "80px", fontWeight: "900", lineHeight: 1, textShadow: "0 4px 20px rgba(0,0,0,0.8)", userSelect: "none" }}>%</div>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(17,17,17,0.75) 42%, #111 58%)" }} />
          </>
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(245,240,232,0) 0%, rgba(245,240,232,0.7) 40%, #f5f0e8 60%)" }} />
        )}
        <div style={{ position: "absolute", right: "24px", top: "50%", transform: "translateY(-50%)", textAlign: "right", maxWidth: "52%" }}>
          <h3 style={{ color: dark ? "#c8a12a" : "#c8a12a", fontSize: "22px", fontWeight: "900", marginBottom: "6px", lineHeight: 1.2 }}>{b.title}</h3>
          <p style={{ color: dark ? "#ccc" : "#666", fontSize: "13px", marginBottom: "16px", lineHeight: 1.5 }}>{b.sub}</p>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: dark ? "#c8a12a" : "#1a1a1a", color: dark ? "#000" : "#fff", padding: "8px 18px", borderRadius: "6px", fontSize: "12px", fontWeight: "800" }}>
            <Zap size={13}/> مشاهده محصولات
          </span>
        </div>
      </div>
    </Link>
  );

  return (
    <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px 32px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }} className="pb-grid">
        <Card b={b1} dark={true} />
        <Card b={b2} dark={false} />
      </div>
      <style>{`@media(max-width:640px){.pb-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}
