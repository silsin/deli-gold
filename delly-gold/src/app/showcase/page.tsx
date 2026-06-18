"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, Star } from "lucide-react";
import PageLayout from "../components/PageLayout";
import Link from "next/link";

interface Product {
  id: string; name: string; slug: string; price: number; weight: number;
  karat: number; stock: number; images: string; category_name: string;
}

const showcases = [
  {
    id: "economic",
    title: "ویترین اقتصادی",
    desc: "طلاهای سبک و مقرون‌به‌صرفه، شروع از ۵۰۰ هزار تومان. مناسب برای هدیه و استفاده روزمره.",
    icon: "💎",
    badge: "اقتصادی",
    color: "#10b981",
    image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80",
    maxPrice: 2000000,
  },
  {
    id: "student",
    title: "ویترین دانشجویی",
    desc: "طرح‌های شیک و مدرن با قیمت مناسب. انتخاب ایده‌آل برای نسل جوان و دانشجویان.",
    icon: "🎓",
    badge: "دانشجویی",
    color: "#3b82f6",
    image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&q=80",
    maxPrice: 3000000,
  },
  {
    id: "special",
    title: "پیشنهاد ویژه",
    desc: "بهترین پیشنهادهای دلی گلد با تخفیف‌های اختصاصی. محدود و با کیفیت استثنایی.",
    icon: "🎁",
    badge: "ویژه",
    color: "var(--theme-accent)",
    image: "https://images.unsplash.com/photo-1629134073875-6c8f6b2c7e71?w=800&q=80",
    maxPrice: 5000000,
  },
];

const goldImages = [
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80",
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80",
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80",
  "https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=400&q=80",
  "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&q=80",
];

export default function ShowcasePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("economic");

  useEffect(() => {
    fetch("/api/products?limit=50")
      .then(r => r.json())
      .then(d => { if (d.success) setProducts(d.data.products); })
      .finally(() => setLoading(false));
  }, []);

  const activeShowcase = showcases.find(s => s.id === active)!;
  const filteredProducts = products.filter(p => p.price <= activeShowcase.maxPrice).slice(0, 6);

  return (
    <PageLayout>
      {/* Hero */}
      <div style={{ position: "relative", height: 260, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${activeShowcase.image})`, backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.3)", transition: "all 0.5s" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to left, transparent, rgba(14,14,14,0.8))" }} />
        <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto", padding: "0 16px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <p style={{ color: "var(--theme-accent)", fontSize: 13, marginBottom: 8 }}>دلی گلد</p>
          <h1 style={{ color: "var(--theme-text)", fontSize: 32, fontWeight: 800, marginBottom: 8 }}>ویترین‌ها</h1>
          <p style={{ color: "var(--theme-text-muted)", fontSize: 14 }}>مجموعه‌های ویژه برای هر بودجه و سلیقه</p>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 16px" }}>

        {/* Tab buttons */}
        <div style={{ display: "flex", gap: 12, marginBottom: 40, flexWrap: "wrap" }}>
          {showcases.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 24px", borderRadius: 10, border: `2px solid ${active === s.id ? s.color : "var(--theme-border)"}`, backgroundColor: active === s.id ? `${s.color}18` : "var(--theme-card)", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div style={{ textAlign: "right" }}>
                <p style={{ color: active === s.id ? s.color : "var(--theme-text)", fontSize: 15, fontWeight: 700 }}>{s.title}</p>
                <p style={{ color: "var(--theme-text-muted)", fontSize: 11 }}>تا {(s.maxPrice / 1000000).toLocaleString("fa-IR")} میلیون</p>
              </div>
            </button>
          ))}
        </div>

        {/* Active showcase info */}
        <div style={{ backgroundColor: "var(--theme-card)", border: `1px solid ${activeShowcase.color}40`, borderRadius: 12, padding: "24px 28px", marginBottom: 36, display: "flex", alignItems: "center", gap: 20 }} className="showcase-info">
          <span style={{ fontSize: 40 }}>{activeShowcase.icon}</span>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <h2 style={{ color: "var(--theme-text)", fontSize: 20, fontWeight: 700 }}>{activeShowcase.title}</h2>
              <span style={{ backgroundColor: `${activeShowcase.color}20`, color: activeShowcase.color, fontSize: 11, padding: "2px 10px", borderRadius: 20, fontWeight: 700 }}>{activeShowcase.badge}</span>
            </div>
            <p style={{ color: "var(--theme-text-muted)", fontSize: 14, lineHeight: 1.7 }}>{activeShowcase.desc}</p>
          </div>
        </div>

        {/* Products */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <Link href="/products" style={{ color: "var(--theme-accent)", fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            مشاهده همه <ChevronLeft size={14} />
          </Link>
          <h3 style={{ color: "var(--theme-text)", fontSize: 18, fontWeight: 700 }}>محصولات این ویترین</h3>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ backgroundColor: "var(--theme-card)", borderRadius: 10, height: 260, opacity: 0.5, border: "1px solid var(--theme-border)" }} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--theme-text-muted)" }}>
            <p>محصولی در این ویترین موجود نیست</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {filteredProducts.map((p, i) => (
              <Link key={p.id} href={`/products/${p.slug}`} style={{ textDecoration: "none", backgroundColor: "var(--theme-card)", border: "1px solid var(--theme-border)", borderRadius: 10, overflow: "hidden", display: "block", transition: "border-color 0.2s, transform 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = activeShowcase.color; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--theme-border)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
                <div style={{ paddingBottom: "100%", position: "relative", overflow: "hidden" }}>
                  <img src={goldImages[i % goldImages.length]} alt={p.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ padding: 12 }}>
                  <p style={{ color: "var(--theme-text)", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{p.name}</p>
                  <p style={{ color: "var(--theme-text-muted)", fontSize: 11, marginBottom: 6 }}>{p.karat} عیار · {p.weight} گرم</p>
                  <p style={{ color: "var(--theme-accent)", fontSize: 13, fontWeight: 700 }}>
                    {p.price.toLocaleString("fa-IR")} <span style={{ color: "var(--theme-text-muted)", fontSize: 11, fontWeight: 400 }}>تومان</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Testimonials */}
        <div style={{ marginTop: 64 }}>
          <h2 style={{ color: "var(--theme-text)", fontSize: 22, fontWeight: 700, marginBottom: 24, textAlign: "center" }}>نظرات مشتریان</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="reviews-grid">
            {[
              { name: "سارا محمدی", text: "کیفیت طلاها فوق‌العاده‌ست. گردنبندم بعد از ۶ ماه هنوز مثل روز اول درخشنده.", stars: 5 },
              { name: "علی رضایی", text: "قیمت‌گذاری منصفانه و ارسال سریع. قطعاً دوباره خرید می‌کنم.", stars: 5 },
              { name: "مریم احمدی", text: "بسته‌بندی شیک و ارزان‌قیمت. هدیه‌ای که همه دوستم داشتن.", stars: 4 },
            ].map((r, i) => (
              <div key={i} style={{ backgroundColor: "var(--theme-card)", border: "1px solid var(--theme-border)", borderRadius: 10, padding: 20 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                  {Array.from({ length: r.stars }).map((_, s) => <Star key={s} size={14} fill="var(--theme-accent)" color="var(--theme-accent)" />)}
                </div>
                <p style={{ color: "var(--theme-text-muted)", fontSize: 13, lineHeight: 1.8, marginBottom: 12 }}>"{r.text}"</p>
                <p style={{ color: "var(--theme-accent)", fontSize: 12, fontWeight: 700 }}>{r.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .reviews-grid { grid-template-columns: 1fr !important; }
          .showcase-info { flex-direction: column; text-align: center; }
        }
      `}</style>
    </PageLayout>
  );
}
