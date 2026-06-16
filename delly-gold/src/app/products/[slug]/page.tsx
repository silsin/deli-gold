"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Heart, ShoppingCart, Shield, Truck, Award, ChevronLeft, Check, Tag } from "lucide-react";
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

const goldImages = [
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
];

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { add, items } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [settings, setSettings] = useState<Settings>({ gold_markup_percent: "5", gold_fixed_fee: "0" });
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(d => {
      if (d.success) setSettings(d.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setProduct(d.data);
          fetch(`/api/products?limit=4`)
            .then(r => r.json())
            .then(rd => {
              if (rd.success) setRelated(rd.data.products.filter((p: Product) => p.slug !== slug).slice(0, 4));
            });
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  function handleAddToCart() {
    if (!product) return;
    const imgs = (() => { try { const a = JSON.parse(product.images); return a.length ? a : goldImages; } catch { return goldImages; } })();
    add({
      productId: product.id,
      name: product.name,
      price: calcFinalPrice(product, settings).finalPrice,
      weight: product.weight,
      karat: product.karat,
      image: imgs[0],
      stock: product.stock,
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push("/cart");
  }

  if (loading) return (
    <PageLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <div style={{ color: "#d4af37" }}>در حال بارگذاری...</div>
      </div>
    </PageLayout>
  );

  if (!product) return (
    <PageLayout>
      <div style={{ textAlign: "center", padding: "80px 16px" }}>
        <p style={{ color: "#888", fontSize: 16 }}>محصول یافت نشد</p>
        <Link href="/products" style={{ color: "#d4af37", textDecoration: "none", fontSize: 14, marginTop: 12, display: "inline-block" }}>← بازگشت به محصولات</Link>
      </div>
    </PageLayout>
  );

  const images = (() => { try { const a = JSON.parse(product.images); return a.length ? a : goldImages; } catch { return goldImages; } })();
  const inCartQty = items.find(i => i.productId === product.id)?.quantity ?? 0;
  const isOutOfStock = product.stock === 0;
  const isMaxed = inCartQty >= product.stock;

  const pricing = calcFinalPrice(product, settings);

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "12px 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#666" }}>
          <Link href="/" style={{ color: "#888", textDecoration: "none" }}>خانه</Link>
          <span>›</span>
          <Link href="/products" style={{ color: "#888", textDecoration: "none" }}>محصولات</Link>
          <span>›</span>
          <span style={{ color: "#d4af37" }}>{product.name}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }} className="product-grid">

          {/* Images */}
          <div>
            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #2a2a2a", marginBottom: 12, aspectRatio: "1/1", position: "relative" }}>
              <img src={images[activeImg]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              {product.featured === 1 && (
                <span style={{ position: "absolute", top: 12, right: 12, backgroundColor: "#d4af37", color: "#000", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>ویژه</span>
              )}
              {isOutOfStock && (
                <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#ef4444", fontSize: 18, fontWeight: 700, backgroundColor: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 8, padding: "8px 20px" }}>ناموجود</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div style={{ display: "flex", gap: 8 }}>
                {images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    style={{ width: 72, height: 72, borderRadius: 8, overflow: "hidden", border: `2px solid ${activeImg === i ? "#d4af37" : "#2a2a2a"}`, cursor: "pointer", padding: 0, background: "none", transition: "border-color 0.2s" }}>
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <Link href="/collections" style={{ color: "#d4af37", fontSize: 12, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
              {product.category_name} <ChevronLeft size={12} />
            </Link>

            <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, marginBottom: 16, lineHeight: 1.3 }}>{product.name}</h1>

            {/* Specs */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { label: "عیار", value: `${product.karat} عیار` },
                { label: "وزن", value: `${product.weight} گرم` },
                { label: "موجودی", value: isOutOfStock ? "ناموجود" : `${product.stock} عدد` },
              ].map(s => (
                <div key={s.label} style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "8px 16px", textAlign: "center" }}>
                  <p style={{ color: "#666", fontSize: 11, marginBottom: 2 }}>{s.label}</p>
                  <p style={{ color: s.label === "موجودی" && isOutOfStock ? "#ef4444" : "#fff", fontSize: 14, fontWeight: 700 }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Price */}
            <div style={{ backgroundColor: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 10, padding: "16px 20px", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                <p style={{ color: "#d4af37", fontSize: 30, fontWeight: 900, lineHeight: 1 }}>
                  {pricing.finalPrice.toLocaleString("fa-IR")}
                </p>
                <span style={{ color: "#888", fontSize: 14 }}>تومان</span>
              </div>

              {/* Breakdown rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, borderTop: "1px solid rgba(212,175,55,0.1)", paddingTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#666" }}>قیمت پایه</span>
                  <span style={{ color: "#aaa" }}>{product.price.toLocaleString("fa-IR")} تومان</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#666" }}>
                    <Tag size={11} color="#d4af37" />
                    اجرت ({pricing.markupPct}% + {pricing.fixedFee.toLocaleString("fa-IR")} ت/گرم)
                    {pricing.isOverride && (
                      <span style={{ backgroundColor: "rgba(245,158,11,0.15)", color: "#f59e0b", fontSize: 10, borderRadius: 4, padding: "1px 5px" }}>اختصاصی</span>
                    )}
                  </span>
                  <span style={{ color: "#d4af37" }}>+{pricing.ajrat.toLocaleString("fa-IR")} تومان</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <p style={{ color: "#888", fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>{product.description}</p>
            )}

            {/* In-cart indicator */}
            {inCartQty > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8, padding: "8px 14px", marginBottom: 14, fontSize: 13, color: "#10b981" }}>
                <Check size={15} />
                {inCartQty} عدد در سبد خرید شما
                <Link href="/cart" style={{ color: "#d4af37", marginRight: "auto", fontSize: 12 }}>مشاهده سبد ←</Link>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isMaxed}
                style={{
                  flex: 1,
                  backgroundColor: addedFeedback ? "#10b981" : isOutOfStock || isMaxed ? "#333" : "#d4af37",
                  color: addedFeedback ? "#fff" : "#000",
                  border: "none", borderRadius: 8, padding: "13px",
                  fontWeight: 700, fontSize: 15,
                  cursor: isOutOfStock || isMaxed ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "background-color 0.25s",
                }}>
                {addedFeedback
                  ? <><Check size={17} /> افزوده شد!</>
                  : isOutOfStock ? "ناموجود"
                  : isMaxed ? "حداکثر موجودی"
                  : <><ShoppingCart size={17} /> افزودن به سبد</>
                }
              </button>
              <button onClick={() => setLiked(l => !l)}
                style={{ width: 52, backgroundColor: liked ? "rgba(212,175,55,0.15)" : "#1a1a1a", border: `1px solid ${liked ? "#d4af37" : "#2a2a2a"}`, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: liked ? "#d4af37" : "#666", transition: "all 0.2s" }}>
                <Heart size={20} fill={liked ? "#d4af37" : "none"} />
              </button>
            </div>

            {!isOutOfStock && (
              <button onClick={handleBuyNow}
                style={{ width: "100%", backgroundColor: "transparent", color: "#d4af37", border: "1px solid rgba(212,175,55,0.4)", borderRadius: 8, padding: "11px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", marginBottom: 20, transition: "background-color 0.2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(212,175,55,0.08)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}>
                خرید سریع ←
              </button>
            )}

            {/* Trust badges */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: <Shield size={15} />, text: "ضمانت اصالت کالا" },
                { icon: <Truck size={15} />, text: "ارسال رایگان بالای ۵۰۰ هزار تومان" },
                { icon: <Award size={15} />, text: "گارانتی ۱ ساله دلی گلد" },
              ].map((b, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, color: "#888", fontSize: 13 }}>
                  <span style={{ color: "#d4af37" }}>{b.icon}</span>{b.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: 64 }}>
            <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 20 }}>محصولات مرتبط</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} className="related-grid">
              {related.map((p, i) => (
                <Link key={p.id} href={`/products/${p.slug}`} style={{ textDecoration: "none", backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, overflow: "hidden", display: "block", transition: "border-color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "#d4af37"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a"}>
                  <div style={{ paddingBottom: "100%", position: "relative" }}>
                    <img src={goldImages[i % goldImages.length]} alt={p.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ padding: 12 }}>
                    <p style={{ color: "#fff", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{p.name}</p>
                    <p style={{ color: "#d4af37", fontSize: 13 }}>{p.price.toLocaleString("fa-IR")} تومان</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .product-grid { grid-template-columns: 1fr !important; }
          .related-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </PageLayout>
  );
}
