"use client";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import PageLayout from "../components/PageLayout";
import Link from "next/link";

interface Category { id: string; name: string; slug: string; description: string | null; product_count: number; }

const collectionImages: Record<string, string> = {
  necklaces: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=700&q=80",
  rings: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=700&q=80",
  bracelets: "https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=700&q=80",
  earrings: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=700&q=80",
};
const fallbacks = [
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=700&q=80",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=700&q=80",
  "https://images.unsplash.com/photo-1629134073875-6c8f6b2c7e71?w=700&q=80",
  "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=700&q=80",
];

const highlights = [
  { title: "کالکشن مینیمال", desc: "طرح‌های ساده و زیبا برای روزهای خاص", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80" },
  { title: "کالکشن کلاسیک", desc: "طلاهایی با طراحی کلاسیک و ماندگار", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=80" },
  { title: "کالکشن روزمره", desc: "سبک و راحت برای استفاده روزانه", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=80" },
];

export default function CollectionsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then(d => { if (d.success) setCategories(d.data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageLayout>
      {/* Hero */}
      <div style={{ position: "relative", height: 280, overflow: "hidden", marginBottom: 0 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1400&q=80)`, backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.3)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to left, transparent, rgba(14,14,14,0.7))" }} />
        <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto", padding: "0 16px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <p style={{ color: "var(--theme-accent)", fontSize: 13, marginBottom: 8 }}>دلی گلد</p>
          <h1 style={{ color: "var(--theme-text)", fontSize: 36, fontWeight: 800, marginBottom: 8 }}>کالکشن‌ها</h1>
          <p style={{ color: "var(--theme-text-muted)", fontSize: 15 }}>مجموعه‌ای از بهترین طلاها برای هر سلیقه</p>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 16px" }}>

        {/* Featured collections row */}
        <h2 style={{ color: "var(--theme-text)", fontSize: 22, fontWeight: 700, marginBottom: 24 }}>کالکشن‌های ویژه</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 56 }} className="highlights-grid">
          {highlights.map((h, i) => (
            <Link key={i} href="/products" style={{ textDecoration: "none", display: "block", borderRadius: 12, overflow: "hidden", position: "relative", height: 240, border: "1px solid var(--theme-border)", transition: "border-color 0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--theme-accent)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--theme-border)"}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${h.image})`, backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.45)", transition: "filter 0.3s" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)" }} />
              <div style={{ position: "absolute", bottom: 0, right: 0, left: 0, padding: 20 }}>
                <h3 style={{ color: "var(--theme-text)", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{h.title}</h3>
                <p style={{ color: "var(--theme-text-muted)", fontSize: 12, marginBottom: 10 }}>{h.desc}</p>
                <span style={{ color: "var(--theme-accent)", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}>مشاهده <ChevronLeft size={12} /></span>
              </div>
            </Link>
          ))}
        </div>

        {/* Categories */}
        <h2 style={{ color: "var(--theme-text)", fontSize: 22, fontWeight: 700, marginBottom: 24 }}>دسته‌بندی محصولات</h2>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ backgroundColor: "var(--theme-card)", borderRadius: 12, height: 320, border: "1px solid var(--theme-border)", opacity: 0.4 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
            {categories.map((cat, i) => {
              const img = collectionImages[cat.slug] || fallbacks[i % fallbacks.length];
              return (
                <Link key={cat.id} href={`/products?category=${cat.id}`} style={{ textDecoration: "none", display: "block", borderRadius: 12, overflow: "hidden", position: "relative", height: 320, border: "1px solid var(--theme-border)", transition: "border-color 0.2s, transform 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--theme-accent)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--theme-border)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
                  <img src={img} alt={cat.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.5)" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)" }} />
                  <div style={{ position: "absolute", bottom: 0, right: 0, left: 0, padding: "20px 16px" }}>
                    <span style={{ backgroundColor: "color-mix(in srgb, var(--theme-accent) 20%, transparent)", border: "1px solid color-mix(in srgb, var(--theme-accent) 40%, transparent)", color: "var(--theme-accent)", fontSize: 11, padding: "3px 10px", borderRadius: 20, marginBottom: 8, display: "inline-block" }}>
                      {cat.product_count} محصول
                    </span>
                    <h3 style={{ color: "var(--theme-text)", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{cat.name}</h3>
                    {cat.description && <p style={{ color: "var(--theme-text-muted)", fontSize: 12 }}>{cat.description}</p>}
                    <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 4, color: "var(--theme-accent)", fontSize: 13 }}>
                      مشاهده کالکشن <ChevronLeft size={14} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .highlights-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PageLayout>
  );
}
