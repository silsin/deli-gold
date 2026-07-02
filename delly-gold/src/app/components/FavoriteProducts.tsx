"use client";
import { useState, useEffect, useRef } from "react";
import { Heart, ShoppingCart, Check, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCart } from "./CartContext";
import { calcFinalPrice } from "@/lib/pricing";

interface Product {
  id: string; name: string; slug: string; price: number;
  weight: number; karat: number; images: string; stock: number;
  ajrat_override: number; ajrat_percent: number | null; ajrat_fixed: number | null;
}
interface Settings { gold_markup_percent: string; gold_fixed_fee: string; }

function getImg(images: string): string | null {
  try { const a = JSON.parse(images); if (a[0]) return a[0]; } catch {}
  return null;
}

export default function FavoriteProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>({ gold_markup_percent: "5", gold_fixed_fee: "0" });
  const [liked, setLiked]       = useState<Set<string>>(new Set());
  const [addedId, setAddedId]   = useState<string | null>(null);
  const scrollRef               = useRef<HTMLDivElement>(null);
  const { add, items } = useCart();

  useEffect(() => {
    fetch("/api/products?limit=20&featured=true").then(r => r.json()).then(d => { if (d.success) setProducts(d.data.products); });
    fetch("/api/admin/settings").then(r => r.json()).then(d => { if (d.success) setSettings(d.data); });
  }, []);

  function toggleLike(id: string) {
    setLiked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function handleAdd(p: Product, img: string, e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    if (p.stock === 0) return;
    const { finalPrice } = calcFinalPrice(p, settings);
    add({ productId: p.id, name: p.name, price: finalPrice, weight: p.weight, karat: p.karat, image: img, stock: p.stock });
    setAddedId(p.id);
    setTimeout(() => setAddedId(cur => cur === p.id ? null : cur), 1800);
  }

  function scroll(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  }

  if (products.length === 0) return null;

  return (
    <section style={{ marginBottom: "32px" }}>
      {/* Gold header bar */}
      <div style={{ backgroundColor: "#c8a12a", padding: "0 24px", height: "58px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "1280px", margin: "0 auto", borderRadius: "10px" }}>
        <Link href="/products" style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(255,255,255,0.2)", color: "#fff", textDecoration: "none", fontSize: "12px", fontWeight: "700", padding: "7px 16px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.4)" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.35)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.2)"}>
          مشاهده همه پرفروش‌ها
        </Link>
        <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: "800", margin: 0 }}>پرفروش‌ترین محصولات</h2>
      </div>

      {/* Scroll row */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px", position: "relative" }}>
        <button onClick={() => scroll("left")} aria-label="قبلی"
          style={{ position: "absolute", left: "0", top: "50%", transform: "translateY(-50%)", width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#fff", border: "1px solid #e0e0e0", color: "#555", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", transition: "all 0.2s" }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "#c8a12a"; el.style.color = "#fff"; el.style.borderColor = "#c8a12a"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "#fff"; el.style.color = "#555"; el.style.borderColor = "#e0e0e0"; }}>
          <ChevronLeft size={18}/>
        </button>
        <button onClick={() => scroll("right")} aria-label="بعدی"
          style={{ position: "absolute", right: "0", top: "50%", transform: "translateY(-50%)", width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#fff", border: "1px solid #e0e0e0", color: "#555", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", transition: "all 0.2s" }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "#c8a12a"; el.style.color = "#fff"; el.style.borderColor = "#c8a12a"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "#fff"; el.style.color = "#555"; el.style.borderColor = "#e0e0e0"; }}>
          <ChevronRight size={18}/>
        </button>

        <div ref={scrollRef} style={{ display: "flex", overflowX: "auto", scrollbarWidth: "none", padding: "20px 24px", margin: "0 -16px" }}>
          <style>{`::-webkit-scrollbar{display:none}`}</style>
          {products.map(p => {
            const img       = getImg(p.images);
            const { finalPrice } = calcFinalPrice(p, settings);
            const isLiked   = liked.has(p.id);
            const isAdded   = addedId === p.id;
            const oos       = p.stock === 0;
            const code      = `#${p.id.slice(0, 4).toUpperCase()}`;

            return (
              <div key={p.id} style={{ flexShrink: 0, width: "190px", borderLeft: "1px solid #f0f0f0", padding: "0 16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Link href={`/products/${p.slug}`} style={{ display: "block", textDecoration: "none", width: "100%" }}>
                  <div style={{ width: "100%", aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8f8f8", position: "relative", overflow: "hidden" }}>
                    {img ? (
                      <img src={img} alt={p.name}
                        style={{ maxWidth: "85%", maxHeight: "85%", objectFit: "contain", transition: "transform 0.3s ease", filter: oos ? "grayscale(1) opacity(0.5)" : "none" }}
                        onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = "scale(1.07)"}
                        onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc", fontSize: "11px" }}>بدون تصویر</div>
                    )}
                    {oos && <span style={{ position: "absolute", top: "8px", right: "8px", backgroundColor: "#f5f5f5", color: "#aaa", fontSize: "9px", fontWeight: "700", padding: "2px 7px", borderRadius: "10px", border: "1px solid #e0e0e0" }}>ناموجود</span>}
                  </div>
                </Link>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "4px" }}>
                  <span style={{ color: "#bbb", fontSize: "10px" }}>{p.weight} gr {p.karat}K</span>
                  <span style={{ color: "#bbb", fontSize: "10px" }}>{code}</span>
                </div>
                <Link href={`/products/${p.slug}`} style={{ textDecoration: "none", width: "100%" }}>
                  <p style={{ color: "#222", fontSize: "12px", fontWeight: "600", textAlign: "right", lineHeight: "1.5", marginBottom: "8px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.name}</p>
                </Link>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: "6px" }}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button onClick={e => img ? handleAdd(p, img, e) : e.preventDefault()} disabled={oos || !img}
                      style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: isAdded ? "#dcfce7" : "#fdf8ee", border: `1px solid ${isAdded ? "#86efac" : "#f0e0a0"}`, cursor: oos ? "not-allowed" : "pointer", color: isAdded ? "#16a34a" : "#c8a12a", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                      {isAdded ? <Check size={11}/> : <ShoppingCart size={11}/>}
                    </button>
                    <button onClick={e => { e.preventDefault(); toggleLike(p.id); }}
                      style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: isLiked ? "#fdf8ee" : "#f8f8f8", border: `1px solid ${isLiked ? "#c8a12a" : "#e8e8e8"}`, cursor: "pointer", color: isLiked ? "#c8a12a" : "#bbb", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                      <Heart size={11} fill={isLiked ? "#c8a12a" : "none"}/>
                    </button>
                  </div>
                  <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                    {finalPrice > 0 ? (
                      <>
                        <p style={{ color: "#c8a12a", fontSize: "12px", fontWeight: "800", lineHeight: 1 }}>{finalPrice.toLocaleString("fa-IR")}</p>
                        <p style={{ color: "#bbb", fontSize: "9px" }}>تومان</p>
                      </>
                    ) : <p style={{ color: "#bbb", fontSize: "11px" }}>تماس بگیرید</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
