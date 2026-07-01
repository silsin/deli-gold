"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Heart, ShoppingCart, Check, ChevronLeft, Shield, Truck, RotateCcw, Info } from "lucide-react";
import PageLayout from "../../components/PageLayout";
import Link from "next/link";
import { useCart } from "../../components/CartContext";
import { calcFinalPrice } from "@/lib/pricing";

interface Product {
  id: string; name: string; slug: string; description: string;
  price: number; weight: number; karat: number; stock: number;
  images: string; featured: number; category_name: string; category_slug: string;
  ajrat_override: number; ajrat_percent: number | null; ajrat_fixed: number | null;
}
interface Settings { gold_markup_percent: string; gold_fixed_fee: string; }

const fallbackImgs = [
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
];

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { add, items } = useCart();

  const [product, setProduct]     = useState<Product | null>(null);
  const [settings, setSettings]   = useState<Settings>({ gold_markup_percent: "5", gold_fixed_fee: "0" });
  const [loading, setLoading]     = useState(true);
  const [liked, setLiked]         = useState(false);
  const [added, setAdded]         = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [related, setRelated]     = useState<Product[]>([]);
  const [showFormula, setShowFormula] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json())
      .then(d => { if (d.success) setSettings(d.data); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/products/${slug}`).then(r => r.json()).then(d => {
      if (d.success) {
        setProduct(d.data);
        fetch(`/api/products?limit=8`).then(r => r.json()).then(rd => {
          if (rd.success) setRelated(rd.data.products.filter((p: Product) => p.slug !== slug).slice(0, 8));
        });
      }
    }).finally(() => setLoading(false));
  }, [slug]);

  function handleAdd() {
    if (!product) return;
    const imgs = getImages(product.images);
    add({ productId: product.id, name: product.name, price: calcFinalPrice(product, settings).finalPrice, weight: product.weight, karat: product.karat, image: imgs[0], stock: product.stock });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  function getImages(raw: string) {
    try { const a = JSON.parse(raw); if (a.length) return a; } catch {}
    return fallbackImgs;
  }

  if (loading) return (
    <PageLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <div style={{ color: "#c8a12a", fontSize: 14 }}>در حال بارگذاری...</div>
      </div>
    </PageLayout>
  );

  if (!product) return (
    <PageLayout>
      <div style={{ textAlign: "center", padding: "80px 16px" }}>
        <p style={{ color: "#888", fontSize: 16, marginBottom: 12 }}>محصول یافت نشد</p>
        <Link href="/products" style={{ color: "#c8a12a", textDecoration: "none", fontSize: 14 }}>← بازگشت به محصولات</Link>
      </div>
    </PageLayout>
  );

  const images   = getImages(product.images);
  const pricing  = calcFinalPrice(product, settings);
  const inCartQty = items.find(i => i.productId === product.id)?.quantity ?? 0;
  const oos      = product.stock === 0;
  const isMaxed  = inCartQty >= product.stock;

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <div style={{ backgroundColor: "#f8f8f8", borderBottom: "1px solid #ebebeb", padding: "10px 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#aaa", flexWrap: "wrap" }}>
          <Link href="/" style={{ color: "#aaa", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#c8a12a"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#aaa"}>
            خانه
          </Link>
          <span>/</span>
          <Link href="/products" style={{ color: "#aaa", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#c8a12a"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#aaa"}>
            محصولات
          </Link>
          <span>/</span>
          <Link href={`/products?category=${product.category_slug}`} style={{ color: "#aaa", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#c8a12a"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#aaa"}>
            {product.category_name}
          </Link>
          <span>/</span>
          <span style={{ color: "#555" }}>{product.name}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "start" }} className="pd-grid">

          {/* ── Left: image gallery ── */}
          <div>
            {/* Main image */}
            <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #ebebeb", marginBottom: 10, aspectRatio: "1/1", position: "relative", backgroundColor: "#f8f8f8" }}>
              <img
                src={images[activeImg]}
                alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "opacity 0.3s" }}
              />
              {product.featured === 1 && (
                <span style={{ position: "absolute", top: 12, right: 12, backgroundColor: "#c8a12a", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>ویژه</span>
              )}
              {oos && (
                <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#dc2626", fontSize: 16, fontWeight: 700, border: "1px solid rgba(220,38,38,0.3)", padding: "8px 20px", borderRadius: 8, backgroundColor: "#fff" }}>ناموجود</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    style={{ width: 68, height: 68, borderRadius: 8, overflow: "hidden", border: `2px solid ${activeImg === i ? "#c8a12a" : "#ebebeb"}`, cursor: "pointer", padding: 0, background: "none", flexShrink: 0, transition: "border-color 0.2s" }}>
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: product info ── */}
          <div>
            {/* Category badge */}
            <Link href={`/products?category=${product.category_slug}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#c8a12a", fontSize: 12, textDecoration: "none", marginBottom: 10, fontWeight: 600 }}>
              <ChevronLeft size={12} /> {product.category_name}
            </Link>

            {/* Title */}
            <h1 style={{ color: "#222", fontSize: 22, fontWeight: 800, marginBottom: 6, lineHeight: 1.4 }}>{product.name}</h1>
            <p style={{ color: "#aaa", fontSize: 12, marginBottom: 18 }}>شناسه محصول: {product.id.slice(0, 8).toUpperCase()}</p>

            {/* Specs row */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { label: "جنس", value: `طلای ${product.karat} عیار (${product.karat === 18 ? "750" : "999"})` },
                { label: "وزن", value: `${product.weight} گرم` },
                { label: "موجودی", value: oos ? "ناموجود" : `${product.stock} عدد`, warn: oos },
              ].map(s => (
                <div key={s.label} style={{ backgroundColor: "#f8f8f8", border: "1px solid #ebebeb", borderRadius: 8, padding: "8px 14px" }}>
                  <p style={{ color: "#aaa", fontSize: 10, marginBottom: 2 }}>{s.label}</p>
                  <p style={{ color: s.warn ? "#dc2626" : "#333", fontSize: 13, fontWeight: 700 }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Price formula toggle — like mio-gold */}
            <button
              onClick={() => setShowFormula(o => !o)}
              style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: "#c8a12a", fontSize: 12, fontFamily: "inherit", marginBottom: 10, padding: 0, fontWeight: 600 }}>
              <Info size={13} /> نحوه محاسبه قیمت؟
            </button>

            {showFormula && (
              <div style={{ backgroundColor: "#fdf8ee", border: "1px solid #f5e4a0", borderRadius: 8, padding: "12px 14px", marginBottom: 14, fontSize: 12, color: "#666", lineHeight: 1.8 }}>
                وزن طلا × (قیمت روز طلا + اجرت) + سود {pricing.markupPct}% + مالیات
                {pricing.isOverride && <span style={{ backgroundColor: "#fef3c7", color: "#92400e", fontSize: 10, borderRadius: 4, padding: "1px 6px", marginRight: 6 }}>اجرت اختصاصی</span>}
              </div>
            )}

            {/* Price block */}
            <div style={{ backgroundColor: "#fdf8ee", border: "1px solid #f5e4a0", borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                <span style={{ color: "#c8a12a", fontSize: 28, fontWeight: 900, lineHeight: 1 }}>
                  {pricing.finalPrice.toLocaleString("fa-IR")}
                </span>
                <span style={{ color: "#aaa", fontSize: 14 }}>تومان</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, borderTop: "1px solid #f5e4a0", paddingTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: "#aaa" }}>قیمت پایه</span>
                  <span style={{ color: "#888" }}>{product.price.toLocaleString("fa-IR")} تومان</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: "#aaa" }}>اجرت ({pricing.markupPct}% + {pricing.fixedFee.toLocaleString("fa-IR")} ت/گرم)</span>
                  <span style={{ color: "#c8a12a" }}>+{pricing.ajrat.toLocaleString("fa-IR")} تومان</span>
                </div>
              </div>
            </div>

            {/* In-cart notice */}
            {inCartQty > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "8px 14px", marginBottom: 14, fontSize: 12, color: "#16a34a" }}>
                <Check size={14} />
                {inCartQty} عدد در سبد خرید شما
                <Link href="/cart" style={{ color: "#c8a12a", marginRight: "auto", fontSize: 11, fontWeight: 600 }}>مشاهده سبد ←</Link>
              </div>
            )}

            {/* CTA buttons */}
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <button
                onClick={handleAdd}
                disabled={oos || isMaxed}
                style={{
                  flex: 1, border: "none", borderRadius: 8, padding: "13px 20px",
                  fontWeight: 700, fontSize: 14, cursor: oos || isMaxed ? "not-allowed" : "pointer",
                  fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  backgroundColor: added ? "#16a34a" : oos || isMaxed ? "#e0e0e0" : "#c8a12a",
                  color: added || oos || isMaxed ? "#fff" : "#fff",
                  transition: "background-color 0.2s",
                }}>
                {added ? <><Check size={16} /> افزوده شد!</>
                  : oos ? "ناموجود"
                  : isMaxed ? "حداکثر موجودی"
                  : <><ShoppingCart size={16} /> افزودن به سبد خرید</>}
              </button>
              <button
                onClick={() => setLiked(l => !l)}
                style={{ width: 50, border: `1px solid ${liked ? "#c8a12a" : "#ddd"}`, borderRadius: 8, backgroundColor: liked ? "#fdf8ee" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: liked ? "#c8a12a" : "#bbb", transition: "all 0.2s" }}>
                <Heart size={18} fill={liked ? "#c8a12a" : "none"} />
              </button>
            </div>

            {!oos && (
              <button
                onClick={() => { handleAdd(); router.push("/cart"); }}
                style={{ width: "100%", backgroundColor: "#fff", color: "#c8a12a", border: "2px solid #c8a12a", borderRadius: 8, padding: "11px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", marginBottom: 20, transition: "all 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#c8a12a"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#fff"; (e.currentTarget as HTMLElement).style.color = "#c8a12a"; }}>
                خرید این محصول
              </button>
            )}

            {/* Description */}
            {product.description && (
              <div style={{ borderTop: "1px solid #ebebeb", paddingTop: 16, marginBottom: 16 }}>
                <h3 style={{ color: "#333", fontSize: 13, fontWeight: 700, marginBottom: 10 }}>مشخصات {product.name}</h3>
                <p style={{ color: "#777", fontSize: 13, lineHeight: 1.9 }}>{product.description}</p>
              </div>
            )}

            {/* Service badges — exactly like mio-gold */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, borderTop: "1px solid #ebebeb", paddingTop: 16 }}>
              {[
                { icon: <RotateCcw size={18} color="#c8a12a" />, title: "بازگشت کالا", sub: "تا ۱۴ روز" },
                { icon: <Truck size={18} color="#c8a12a" />,     title: "ارسال کالا",  sub: "به سراسر ایران" },
                { icon: <Shield size={18} color="#c8a12a" />,    title: "راهنمای خرید", sub: "اطمینان از خرید" },
              ].map((b, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 8px", backgroundColor: "#f8f8f8", borderRadius: 8, border: "1px solid #ebebeb", textAlign: "center" }}>
                  {b.icon}
                  <p style={{ color: "#333", fontSize: 11, fontWeight: 700 }}>{b.title}</p>
                  <p style={{ color: "#aaa", fontSize: 10 }}>{b.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Related products ── */}
        {related.length > 0 && (
          <div style={{ marginTop: 56 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h2 className="section-title">محصولات پیشنهادی</h2>
              <Link href="/products" style={{ color: "#c8a12a", fontSize: 12, textDecoration: "none", fontWeight: 600 }}>مشاهده همه ←</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} className="related-grid">
              {related.map((p, i) => {
                const img = (() => { try { const a = JSON.parse(p.images); if (a[0]) return a[0]; } catch {} return fallbackImgs[i % fallbackImgs.length]; })();
                const fp  = calcFinalPrice(p, settings).finalPrice;
                return (
                  <Link key={p.id} href={`/products/${p.slug}`}
                    style={{ textDecoration: "none", backgroundColor: "#fff", border: "1px solid #ebebeb", borderRadius: 10, overflow: "hidden", display: "block", transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s" }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#c8a12a"; el.style.transform = "translateY(-3px)"; el.style.boxShadow = "0 6px 18px rgba(0,0,0,0.08)"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#ebebeb"; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}>
                    <div style={{ paddingBottom: "100%", position: "relative", backgroundColor: "#f8f8f8" }}>
                      <img src={img} alt={p.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ padding: 12 }}>
                      <p style={{ color: "#333", fontSize: 12, fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>{p.name}</p>
                      <p style={{ color: "#aaa", fontSize: 10, marginBottom: 5 }}>{p.weight}گ · {p.karat} عیار</p>
                      <p style={{ color: "#c8a12a", fontSize: 13, fontWeight: 800 }}>{fp.toLocaleString("fa-IR")} <span style={{ color: "#bbb", fontSize: 10, fontWeight: 400 }}>تومان</span></p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media(max-width:768px){
          .pd-grid{grid-template-columns:1fr!important}
          .related-grid{grid-template-columns:repeat(2,1fr)!important}
        }
      `}</style>
    </PageLayout>
  );
}
