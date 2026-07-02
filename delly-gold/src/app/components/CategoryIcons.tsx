"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Category { id: string; name: string; slug: string; product_count: number; image?: string; banner_image?: string; }

// SVG icons per slug
const CatSvg = ({ slug }: { slug: string }) => {
  const icons: Record<string, React.ReactNode> = {
    necklaces: <svg viewBox="0 0 64 64" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32"><path d="M32 12C16 12 8 22 8 34c0 12 10 20 24 20s24-8 24-20c0-12-8-22-24-22Z"/><circle cx="32" cy="54" r="4" fill="#aaa" stroke="none"/><path d="M24 12c0-4 4-6 8-6s8 2 8 6"/></svg>,
    rings:     <svg viewBox="0 0 64 64" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" width="32" height="32"><circle cx="32" cy="32" r="18"/><circle cx="32" cy="32" r="10"/><path d="M26 14c2-4 10-4 12 0"/><circle cx="32" cy="11" r="3" fill="#aaa" stroke="none"/></svg>,
    bracelets: <svg viewBox="0 0 64 64" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" width="32" height="32"><path d="M14 32c0-12 6-18 18-18s18 6 18 18-6 18-18 18-18-6-18-18Z"/><path d="M14 30h36"/><circle cx="32" cy="14" r="3" fill="#aaa" stroke="none"/><circle cx="32" cy="50" r="3" fill="#aaa" stroke="none"/></svg>,
    earrings:  <svg viewBox="0 0 64 64" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" width="32" height="32"><circle cx="22" cy="18" r="4"/><path d="M22 22v20l-6 8h12l-6-8"/><circle cx="42" cy="18" r="4"/><path d="M42 22v20l-6 8h12l-6-8"/></svg>,
    coin:      <svg viewBox="0 0 64 64" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" width="32" height="32"><circle cx="32" cy="32" r="20"/><circle cx="32" cy="32" r="13"/><path d="M32 24v2M32 38v2M24 32h2M38 32h2"/></svg>,
    anklet:    <svg viewBox="0 0 64 64" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" width="32" height="32"><path d="M12 36C12 24 20 16 32 16s20 8 20 20"/><path d="M16 36c0 6 7 12 16 12s16-6 16-12"/><circle cx="32" cy="52" r="4" fill="#aaa" stroke="none"/></svg>,
    keychain:  <svg viewBox="0 0 64 64" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" width="32" height="32"><circle cx="32" cy="22" r="12"/><circle cx="32" cy="22" r="5"/><path d="M32 34v20M26 44h12M26 50h12"/></svg>,
    kids:      <svg viewBox="0 0 64 64" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" width="32" height="32"><circle cx="32" cy="20" r="10"/><path d="M20 20C14 20 10 26 10 32v18h44V32c0-6-4-12-10-12"/></svg>,
    sets:      <svg viewBox="0 0 64 64" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" width="32" height="32"><circle cx="32" cy="22" r="8"/><path d="M18 46c0-8 6-12 14-12s14 4 14 12"/><path d="M14 54h36"/></svg>,
    accessories: <svg viewBox="0 0 64 64" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" width="32" height="32"><rect x="14" y="22" width="36" height="26" rx="4"/><path d="M22 22v-4c0-4 4-6 10-6s10 2 10 6v4"/><circle cx="32" cy="35" r="5"/></svg>,
  };
  return <>{icons[slug] || <svg viewBox="0 0 64 64" fill="none" stroke="#888" strokeWidth="2.5" width="32" height="32"><circle cx="32" cy="32" r="20"/><path d="M22 32l8 8 12-16"/></svg>}</>;
};

export default function CategoryIcons() {
  const [cats, setCats] = useState<Category[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/categories").then(r => r.json())
      .then(d => { if (d.success) setCats(d.data); }).catch(() => {});
  }, []);

  function scroll(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  }

  if (cats.length === 0) return null;

  return (
    <section style={{ backgroundColor: "#fff", padding: "28px 0 20px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 40px", position: "relative" }}>
        <button onClick={() => scroll("left")} aria-label="قبلی"
          style={{ position: "absolute", left: "8px", top: "40px", transform: "translateY(-50%)", width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#fff", border: "1px solid #e0e0e0", color: "#888", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5, boxShadow: "0 1px 4px rgba(0,0,0,0.1)", transition: "all 0.2s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#c8a12a"; (e.currentTarget as HTMLElement).style.color = "#c8a12a"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#e0e0e0"; (e.currentTarget as HTMLElement).style.color = "#888"; }}>
          <ChevronLeft size={14}/>
        </button>
        <button onClick={() => scroll("right")} aria-label="بعدی"
          style={{ position: "absolute", right: "8px", top: "40px", transform: "translateY(-50%)", width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#fff", border: "1px solid #e0e0e0", color: "#888", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5, boxShadow: "0 1px 4px rgba(0,0,0,0.1)", transition: "all 0.2s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#c8a12a"; (e.currentTarget as HTMLElement).style.color = "#c8a12a"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#e0e0e0"; (e.currentTarget as HTMLElement).style.color = "#888"; }}>
          <ChevronRight size={14}/>
        </button>

        <div ref={scrollRef} style={{ display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none", padding: "0 4px" }}>
          <style>{`::-webkit-scrollbar{display:none}`}</style>
          {cats.map(cat => {
            const img = cat.banner_image || cat.image || null;
            return (
              <Link key={cat.id} href={`/products?category=${cat.id}`}
                style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", flexShrink: 0, width: "88px", padding: "4px 0" }}>
                <div style={{ width: "72px", height: "72px", borderRadius: "50%", overflow: "hidden", backgroundColor: "#efefef", display: "flex", alignItems: "center", justifyContent: "center", transition: "background-color 0.2s, transform 0.2s, border-color 0.2s", border: "2px solid transparent" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "#fdf8ee"; el.style.borderColor = "#c8a12a"; el.style.transform = "scale(1.08)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "#efefef"; el.style.borderColor = "transparent"; el.style.transform = "scale(1)"; }}>
                  {img
                    ? <img src={img} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                    : <CatSvg slug={cat.slug}/>
                  }
                </div>
                <span style={{ color: "#444", fontSize: "11px", fontWeight: "600", textAlign: "center", whiteSpace: "nowrap" }}>{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
