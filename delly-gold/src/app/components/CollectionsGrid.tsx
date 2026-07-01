"use client";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface Category { id: string; name: string; slug: string; product_count: number; }

const catImages: Record<string, string> = {
  necklaces: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80",
  rings:     "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80",
  bracelets: "https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=500&q=80",
  earrings:  "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500&q=80",
};
const fallbacks = [
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&q=80",
  "https://images.unsplash.com/photo-1629134073875-6c8f6b2c7e71?w=500&q=80",
  "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=500&q=80",
];

export default function CollectionsGrid() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories").then(r => r.json())
      .then(d => { if (d.success) setCategories(d.data.slice(0, 4)); });
  }, []);

  const display = categories.length > 0 ? categories : [
    { id: "n", name: "گردنبند", slug: "necklaces", product_count: 0 },
    { id: "r", name: "انگشتر",  slug: "rings",     product_count: 0 },
    { id: "b", name: "دستبند",  slug: "bracelets", product_count: 0 },
    { id: "e", name: "گوشواره", slug: "earrings",  product_count: 0 },
  ];

  return (
    <section style={{ maxWidth: "1280px", margin: "28px auto", padding: "0 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <h2 className="section-title">کالکشن‌های دلی گلد</h2>
        <Link href="/collections" style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#c8a12a", fontSize: "12px", fontWeight: "600", textDecoration: "none" }}>
          <ChevronLeft size={13} /> مشاهده همه
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }} className="cg-grid">
        {display.map((col, i) => {
          const img = catImages[col.slug] || fallbacks[i % fallbacks.length];
          const href = categories.length > 0 ? `/products?category=${col.id}` : `/collections`;
          return (
            <Link key={col.id} href={href} style={{ textDecoration: "none", display: "block", borderRadius: "10px", overflow: "hidden", position: "relative", aspectRatio: "3/4", border: "1px solid #ebebeb", transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#c8a12a"; el.style.transform = "translateY(-3px)"; el.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#ebebeb"; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${img})`, backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.55)", transition: "filter 0.3s" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)" }} />
              <div style={{ position: "absolute", bottom: "12px", right: "12px", left: "12px" }}>
                <p style={{ color: "#fff", fontSize: "14px", fontWeight: "700", marginBottom: "2px" }}>{col.name}</p>
                {col.product_count > 0 && <p style={{ color: "#c8a12a", fontSize: "11px" }}>{col.product_count} محصول</p>}
              </div>
            </Link>
          );
        })}
      </div>

      <style>{`
        @media(max-width:768px){.cg-grid{grid-template-columns:repeat(2,1fr)!important}}
      `}</style>
    </section>
  );
}
