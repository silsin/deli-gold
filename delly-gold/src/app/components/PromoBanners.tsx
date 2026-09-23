"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

interface Banner {
  id: string;
  title: string; sub: string; href: string; image: string;
  theme: "dark" | "light";
}

export default function PromoBanners() {
  const [banners, setBanners] = useState<Banner[] | null>(null);

  useEffect(() => {
    fetch("/api/promo-banners").then(r => r.json()).then(d => {
      if (d.success) setBanners(d.data);
    }).catch(() => setBanners([]));
  }, []);

  // Before fetch resolves render nothing (avoids flashing hardcoded defaults);
  // if no banner is active the whole section hides itself.
  if (!banners || banners.length === 0) return null;

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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "12px" }} className="pb-grid">
        {banners.map(b => <Card key={b.id} b={b} dark={b.theme === "dark"} />)}
      </div>
      <style>{`@media(max-width:640px){.pb-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}
