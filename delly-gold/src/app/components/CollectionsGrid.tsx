"use client";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface Category { id: string; name: string; slug: string; product_count: number; }

const collectionImages: Record<string, string> = {
  necklaces: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80",
  rings: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80",
  bracelets: "https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=500&q=80",
  earrings: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500&q=80",
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
    fetch("/api/categories")
      .then(r => r.json())
      .then(d => { if (d.success) setCategories(d.data.slice(0, 4)); });
  }, []);

  return (
    <section style={{ maxWidth: "1280px", margin: "40px auto", padding: "0 16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "16px", alignItems: "stretch" }} className="collections-wrapper">

        {/* Intro card */}
        <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "28px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ width: "40px", height: "3px", backgroundColor: "#d4af37", marginBottom: "16px" }} />
            <h2 style={{ color: "#fff", fontSize: "24px", fontWeight: "700", marginBottom: "12px" }}>کالکشن‌ها</h2>
            <p style={{ color: "#888", fontSize: "14px", lineHeight: "1.7" }}>
              دنبالی از هنر و طرح‌های شاخص<br />برای هر سلیقه
            </p>
            {categories.length > 0 && (
              <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {categories.map(c => (
                  <Link key={c.id} href={`/products?category=${c.id}`} style={{ color: "#888", fontSize: "12px", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #222" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#d4af37"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#888"}>
                    <span>{c.name}</span>
                    <span style={{ color: "#555", fontSize: "11px" }}>{c.product_count} محصول</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/collections" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#d4af37", fontSize: "13px", fontWeight: "600", textDecoration: "none", border: "1px solid rgba(212,175,55,0.4)", padding: "8px 16px", borderRadius: "6px", backgroundColor: "rgba(212,175,55,0.1)", width: "fit-content", marginTop: "20px" }}>
            <ChevronLeft size={14} />
            مشاهده همه
          </Link>
        </div>

        {/* 4 collection cards — linked to category-filtered products */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }} className="collections-sub">
          {(categories.length > 0 ? categories : Array.from({ length: 4 }, (_, i) => ({ id: String(i), name: ["گردنبند", "انگشتر", "دستبند", "گوشواره"][i], slug: ["necklaces", "rings", "bracelets", "earrings"][i], product_count: 0 }))).map((col, i) => (
            <Link key={col.id} href={categories.length > 0 ? `/products?category=${col.id}` : "/collections"} style={{ textDecoration: "none", display: "block", borderRadius: "10px", overflow: "hidden", position: "relative", aspectRatio: "3/4", border: "1px solid #2a2a2a", transition: "border-color 0.2s, transform 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#d4af37"; (e.currentTarget as HTMLElement).style.transform = "scale(1.02)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a"; (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${collectionImages[col.slug] || fallbacks[i % fallbacks.length]})`, backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.5)", transition: "filter 0.3s" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)" }} />
              <div style={{ position: "absolute", bottom: "12px", right: "12px", left: "12px" }}>
                <p style={{ color: "#fff", fontSize: "13px", fontWeight: "600", marginBottom: "2px" }}>{col.name}</p>
                {col.product_count > 0 && <p style={{ color: "#d4af37", fontSize: "11px" }}>{col.product_count} محصول</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .collections-wrapper { grid-template-columns: 1fr !important; }
          .collections-sub { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}
