"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

interface Category { id: string; name: string; slug: string; product_count: number; banner_image?: string; image?: string; }

// These are only used if a category has NO image set in the DB
const FALLBACK_IMAGES: Record<string, string> = {
  necklaces: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=85",
  rings:     "https://images.unsplash.com/photo-1512163143273-bde0e3cc7407?w=600&q=85",
  bracelets: "https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=85",
  earrings:  "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=85",
  default:   "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=85",
};

function getCatImage(cat: Category, index: number): string {
  // Priority: banner_image field > image field > slug-based fallback > default
  return cat.banner_image || cat.image
    || FALLBACK_IMAGES[cat.slug]
    || Object.values(FALLBACK_IMAGES)[index % Object.values(FALLBACK_IMAGES).length];
}

export default function CategoryShowcase() {
  const [cats, setCats] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then(d => { if (d.success) setCats(d.data); })
      .catch(() => {});
  }, []);

  if (cats.length === 0) return null;

  return (
    <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px 32px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }} className="cat-showcase-grid">
        {cats.slice(0, 6).map((cat, i) => {
          const image = getCatImage(cat, i);
          return (
            <Link key={cat.id} href={`/products?category=${cat.id}`} style={{ textDecoration: "none", display: "block" }}>
              <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", aspectRatio: "3/4", cursor: "pointer", transition: "transform 0.3s ease, box-shadow 0.3s ease", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(-4px)";
                  el.style.boxShadow = "0 12px 32px rgba(0,0,0,0.18)";
                  const img = el.querySelector(".cs-img") as HTMLElement;
                  if (img) img.style.transform = "scale(1.06)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)";
                  const img = el.querySelector(".cs-img") as HTMLElement;
                  if (img) img.style.transform = "scale(1)";
                }}>
                <img className="cs-img" src={image} alt={cat.name}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", filter: "grayscale(100%) contrast(1.05)", transition: "transform 0.5s ease", display: "block" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: "16px", right: "14px", left: "14px", display: "flex", justifyContent: "flex-end" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(20,20,20,0.88)", color: "#fff", padding: "9px 16px", borderRadius: "30px", fontSize: "12px", fontWeight: "700", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.12)", whiteSpace: "nowrap" }}>
                    <ArrowLeft size={14} strokeWidth={2.5} />
                    مشاهده همه {cat.name}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <style>{`@media(max-width:900px){.cat-showcase-grid{grid-template-columns:repeat(2,1fr)!important}}@media(max-width:480px){.cat-showcase-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}
