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

const fb = [
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80",
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80",
  "https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=400&q=80",
  "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&q=80",
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80",
];

function getImg(images: string, i: number) {
  try { const a = JSON.parse(images); if (a[0]) return a[0]; } catch {}
  return fb[i % fb.length];
}

export default function FavoriteProducts() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [settings, setSettings]   = useState<Settings>({ gold_markup_percent: "5", gold_fixed_fee: "0" });
  const [liked, setLiked]         = useState<Set<string>>(new Set());
  const [addedId, setAddedId]     = useState<string | null>(null);
  const scrollRef                 = useRef<HTMLDivElement>(null);
  const { add, items } = useCart();

  useEffect(() => {
    fetch("/api/products?limit=12&featured=true")
      .then(r => r.json()).then(d => { if (d.success) setProducts(d.data.products); });
    fetch("/api/admin/settings")
      .then(r => r.json()).then(d => { if (d.success) setSettings(d.data); });
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
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  }

  if (products.length === 0) return null;

  return (
    <section style={{ marginBottom: "32px" }}>
      {/* ── Gold header bar ── */}
      <div style={{
        backgroundColor: "#c8a12a",
        padding: "0 24px",
        height: "58px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: "1280px",
        margin: "0 auto 0",
        borderRadius: "10px",
      }}>
        {/* Left: view all button */}
        <Link href="/products" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          backgroundColor: "rgba(255,255,255,0.2)",
          color: "#fff",
          textDecoration: "none",
          fontSize: "12px",
          fontWeight: "700",
          padding: "7px 16px",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.4)",
          transition: "background-color 0.2s",
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.35)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.2)"}>
          مشاهده همه پرفروش‌ها
        </Link>

        {/* Right: section title */}
        <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: "800", margin: 0 }}>
          پرفروش‌ترین محصولات
        </h2>
      </div>

      {/* ── Product scroll row ── */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px", position: "relative" }}>
        {/* Left arrow */}
        <button onClick={() => scroll("left")} aria-label="قبلی"
          style={{
            position: "absolute", left: "0px", top: "50%", transform: "translateY(-50%)",
            width: "36px", height: "36px", borderRadius: "50%",
            backgroundColor: "#fff", border: "1px solid #e0e0e0",
            color: "#555", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", transition: "all 0.2s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#c8a12a"; (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "#c8a12a"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#fff"; (e.currentTarget as HTMLElement).style.color = "#555"; (e.currentTarget as HTMLElement).style.borderColor = "#e0e0e0"; }}>
          <ChevronLeft size={18} />
        </button>

        {/* Right arrow */}
        <button onClick={() => scroll("right")} aria-label="بعدی"
          style={{
            position: "absolute", right: "0px", top: "50%", transform: "translateY(-50%)",
            width: "36px", height: "36px", borderRadius: "50%",
            backgroundColor: "#fff", border: "1px solid #e0e0e0",
            color: "#555", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", transition: "all 0.2s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#c8a12a"; (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "#c8a12a"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#fff"; (e.currentTarget as HTMLElement).style.color = "#555"; (e.currentTarget as HTMLElement).style.borderColor = "#e0e0e0"; }}>
          <ChevronRight size={18} />
        </button>

        {/* Scrollable row */}
        <div ref={scrollRef} style={{
          display: "flex",
          gap: "0",
          overflowX: "auto",
          scrollbarWidth: "none",
          padding: "20px 24px",
          margin: "0 -16px",
        }}>
          <style>{`::-webkit-scrollbar{display:none}`}</style>

          {products.map((p, i) => {
            const img      = getImg(p.images, i);
            const { finalPrice } = calcFinalPrice(p, settings);
            const isLiked  = liked.has(p.id);
            const inCart   = items.some(it => it.productId === p.id);
            const isAdded  = addedId === p.id;
            const oos      = p.stock === 0;
            // Generate a fake product code like mio-gold: #Z140, #E478 etc.
            const code     = `#${p.id.slice(0, 4).toUpperCase()}`;

            return (
              <div key={p.id} style={{
                flexShrink: 0,
                width: "190px",
                borderLeft: "1px solid #f0f0f0",
                padding: "0 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}>
                {/* Image area — white background, product photo centered */}
                <Link href={`/products/${p.slug}`} style={{ display: "block", textDecoration: "none", width: "100%", position: "relative" }}>
                  <div style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#fff",
                    position: "relative",
                    overflow: "hidden",
                  }}>
                    <img src={img} alt={p.name}
                      style={{
                        maxWidth: "85%",
                        maxHeight: "85%",
                        objectFit: "contain",
                        transition: "transform 0.3s ease",
                        filter: oos ? "grayscale(1) opacity(0.5)" : "none",
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = "scale(1.07)"}
                      onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"}
                    />
                    {oos && (
                      <span style={{ position: "absolute", top: "8px", right: "8px", backgroundColor: "#f5f5f5", color: "#aaa", fontSize: "9px", fontWeight: "700", padding: "2px 7px", borderRadius: "10px", border: "1px solid #e0e0e0" }}>ناموجود</span>
                    )}
                  </div>
                </Link>

                {/* Product code + weight — gray, small, like mio-gold */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: "4px" }}>
                  <span style={{ color: "#bbb", fontSize: "10px" }}>{p.weight} gr gold {p.karat}K</span>
                  <span style={{ color: "#bbb", fontSize: "10px" }}>{code}</span>
                </div>

                {/* Product name */}
                <Link href={`/products/${p.slug}`} style={{ textDecoration: "none", width: "100%" }}>
                  <p style={{
                    color: "#222",
                    fontSize: "12px",
                    fontWeight: "600",
                    textAlign: "right",
                    lineHeight: "1.5",
                    marginBottom: "8px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>
                    {p.name}
                  </p>
                </Link>

                {/* Price + actions */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: "6px" }}>
                  <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                    {/* Cart */}
                    <button onClick={e => handleAdd(p, img, e)} disabled={oos}
                      style={{
                        width: "26px", height: "26px", borderRadius: "50%",
                        backgroundColor: isAdded ? "#dcfce7" : "#fdf8ee",
                        border: `1px solid ${isAdded ? "#86efac" : "#f0e0a0"}`,
                        cursor: oos ? "not-allowed" : "pointer",
                        color: isAdded ? "#16a34a" : "#c8a12a",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s",
                      }}>
                      {isAdded ? <Check size={11} /> : <ShoppingCart size={11} />}
                    </button>
                    {/* Wishlist */}
                    <button onClick={e => { e.preventDefault(); toggleLike(p.id); }}
                      style={{
                        width: "26px", height: "26px", borderRadius: "50%",
                        backgroundColor: isLiked ? "#fdf8ee" : "#f8f8f8",
                        border: `1px solid ${isLiked ? "#c8a12a" : "#e8e8e8"}`,
                        cursor: "pointer", color: isLiked ? "#c8a12a" : "#bbb",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s",
                      }}>
                      <Heart size={11} fill={isLiked ? "#c8a12a" : "none"} />
                    </button>
                  </div>
                  {/* Price */}
                  <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                    {finalPrice > 0 ? (
                      <>
                        <p style={{ color: "#c8a12a", fontSize: "12px", fontWeight: "800", lineHeight: 1 }}>
                          {finalPrice.toLocaleString("fa-IR")}
                        </p>
                        <p style={{ color: "#bbb", fontSize: "9px" }}>تومان</p>
                      </>
                    ) : (
                      <p style={{ color: "#bbb", fontSize: "11px" }}>تماس بگیرید</p>
                    )}
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
