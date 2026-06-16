"use client";
import { useState, useEffect } from "react";
import { Heart, ChevronLeft, ChevronRight, ShoppingCart, Check } from "lucide-react";
import Link from "next/link";
import { useCart } from "./CartContext";
import { calcFinalPrice } from "@/lib/pricing";

interface Product {
  id: string; name: string; slug: string; price: number;
  weight: number; karat: number; images: string; stock: number;
  ajrat_override: number; ajrat_percent: number | null; ajrat_fixed: number | null;
}
interface Settings { gold_markup_percent: string; gold_fixed_fee: string; }

const fallbackImages = [
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80",
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80",
  "https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=400&q=80",
  "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&q=80",
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80",
];

export default function FavoriteProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>({ gold_markup_percent: "5", gold_fixed_fee: "0" });
  const [liked, setLiked] = useState<string[]>([]);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [start, setStart] = useState(0);
  const visible = 5;
  const { add, items } = useCart();

  useEffect(() => {
    fetch("/api/products?limit=10&featured=true")
      .then(r => r.json())
      .then(d => { if (d.success) setProducts(d.data.products); });
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(d => { if (d.success) setSettings(d.data); });
  }, []);

  const toggleLike = (id: string) =>
    setLiked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  function handleAdd(p: Product, img: string, e: React.MouseEvent) {
    e.preventDefault();
    if (p.stock === 0) return;
    const { finalPrice } = calcFinalPrice(p, settings);
    add({ productId: p.id, name: p.name, price: finalPrice, weight: p.weight, karat: p.karat, image: img, stock: p.stock });
    setAddedId(p.id);
    setTimeout(() => setAddedId(cur => cur === p.id ? null : cur), 1800);
  }

  const canPrev = start > 0;
  const canNext = start + visible < products.length;

  const getImage = (p: Product, i: number) => {
    try { const arr = JSON.parse(p.images); if (arr[0]) return arr[0]; } catch {}
    return fallbackImages[i % fallbackImages.length];
  };

  if (products.length === 0) return null;

  return (
    <section style={{ maxWidth: "1280px", margin: "40px auto", padding: "0 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <Link href="/products" style={{ color: "#d4af37", fontSize: "13px", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
          <ChevronLeft size={14} /> مشاهده همه محصولات
        </Link>
        <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: "700" }}>محصولات محبوب</h2>
      </div>

      <div style={{ position: "relative" }}>
        <button onClick={() => setStart(s => Math.max(0, s - 1))} disabled={!canPrev} aria-label="قبلی"
          style={{ position: "absolute", right: "-20px", top: "50%", transform: "translateY(-50%)", backgroundColor: canPrev ? "rgba(212,175,55,0.15)" : "rgba(50,50,50,0.5)", border: `1px solid ${canPrev ? "rgba(212,175,55,0.4)" : "#333"}`, color: canPrev ? "#d4af37" : "#555", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: canPrev ? "pointer" : "default", zIndex: 10 }}>
          <ChevronRight size={18} />
        </button>
        <button onClick={() => setStart(s => Math.min(products.length - visible, s + 1))} disabled={!canNext} aria-label="بعدی"
          style={{ position: "absolute", left: "-20px", top: "50%", transform: "translateY(-50%)", backgroundColor: canNext ? "rgba(212,175,55,0.15)" : "rgba(50,50,50,0.5)", border: `1px solid ${canNext ? "rgba(212,175,55,0.4)" : "#333"}`, color: canNext ? "#d4af37" : "#555", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: canNext ? "pointer" : "default", zIndex: 10 }}>
          <ChevronLeft size={18} />
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", overflow: "hidden" }}>
          {products.slice(start, start + visible).map((p, i) => {
            const isLiked = liked.includes(p.id);
            const img = getImage(p, start + i);
            const { finalPrice } = calcFinalPrice(p, settings);
            const inCart = items.some(it => it.productId === p.id);
            const isAdded = addedId === p.id;
            return (
              <div key={p.id} style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "10px", overflow: "hidden", transition: "border-color 0.2s, transform 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#d4af37"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
                <Link href={`/products/${p.slug}`} style={{ display: "block", textDecoration: "none", position: "relative" }}>
                  <div style={{ position: "relative", aspectRatio: "1/1" }}>
                    <div style={{ width: "100%", height: "100%", backgroundImage: `url(${img})`, backgroundSize: "cover", backgroundPosition: "center", minHeight: "160px" }} />
                    <button onClick={e => { e.preventDefault(); toggleLike(p.id); }} aria-label="علاقه‌مندی"
                      style={{ position: "absolute", top: "8px", left: "8px", backgroundColor: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: isLiked ? "#d4af37" : "#888" }}>
                      <Heart size={15} fill={isLiked ? "#d4af37" : "none"} />
                    </button>
                  </div>
                </Link>
                <div style={{ padding: "12px" }}>
                  <Link href={`/products/${p.slug}`} style={{ textDecoration: "none" }}>
                    <h3 style={{ color: "#fff", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>{p.name}</h3>
                  </Link>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                    <div>
                      <p style={{ color: "#d4af37", fontSize: "13px", fontWeight: "700" }}>
                        {finalPrice.toLocaleString("fa-IR")} <span style={{ color: "#888", fontSize: "11px", fontWeight: "400" }}>تومان</span>
                      </p>
                      <p style={{ color: "#666", fontSize: "11px" }}>وزن: {p.weight}گ · {p.karat} عیار</p>
                    </div>
                    <button
                      onClick={e => handleAdd(p, img, e)}
                      disabled={p.stock === 0}
                      title={p.stock === 0 ? "ناموجود" : "افزودن به سبد"}
                      style={{ width: 30, height: 30, flexShrink: 0, backgroundColor: isAdded ? "rgba(16,185,129,0.2)" : inCart ? "rgba(212,175,55,0.15)" : "rgba(212,175,55,0.1)", border: `1px solid ${isAdded ? "rgba(16,185,129,0.4)" : "rgba(212,175,55,0.3)"}`, borderRadius: 6, cursor: p.stock === 0 ? "not-allowed" : "pointer", color: isAdded ? "#10b981" : "#d4af37", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                      {isAdded ? <Check size={13} /> : <ShoppingCart size={13} />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {products.length > visible && (
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "20px" }}>
          {Array.from({ length: products.length - visible + 1 }).map((_, i) => (
            <button key={i} onClick={() => setStart(i)} aria-label={`صفحه ${i + 1}`}
              style={{ width: i === start ? "20px" : "8px", height: "8px", borderRadius: "4px", backgroundColor: i === start ? "#d4af37" : "rgba(212,175,55,0.3)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s" }} />
          ))}
        </div>
      )}
    </section>
  );
}
