"use client";
import { useState, useEffect, useRef } from "react";
import { Heart, ShoppingCart, Check, ChevronLeft, ChevronRight, BadgePercent } from "lucide-react";
import Link from "next/link";
import { useCart } from "./CartContext";
import { calcFinalPrice } from "@/lib/pricing";

interface Product {
  id: string; name: string; slug: string; price: number;
  weight: number; karat: number; images: string; stock: number;
  ajrat_override: number; ajrat_percent: number | null; ajrat_fixed: number | null;
}
interface Offer { id: string; discount_percent: number; sort_order: number; active: number; product_id: string; }
interface OfferWithProduct extends Offer, Product {}
interface Settings { gold_markup_percent: string; gold_fixed_fee: string; }

function getImg(images: string): string | null {
  try { const a = JSON.parse(images); if (a[0]) return a[0]; } catch {}
  return null;
}

export default function SpecialOffers() {
  const [offers, setOffers]         = useState<OfferWithProduct[]>([]);
  const [title, setTitle]           = useState("Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ Ø´Ú¯ÙØª Ø§Ù†Ú¯ÛŒØ²");
  const [viewAll, setViewAll]       = useState("/products");
  const [settings, setSettings]     = useState<Settings>({ gold_markup_percent: "5", gold_fixed_fee: "0" });
  const [liked, setLiked]           = useState<Set<string>>(new Set());
  const [addedId, setAddedId]       = useState<string | null>(null);
  const scrollRef                   = useRef<HTMLDivElement>(null);
  const { add } = useCart();

  useEffect(() => {
    fetch("/api/special-offers").then(r => r.json()).then(d => {
      if (d.success) {
        if (!d.data.enabled) return;
        setOffers(d.data.offers);
        setTitle(d.data.title);
        setViewAll(d.data.view_all_href);
      }
    });
    fetch("/api/admin/settings").then(r => r.json()).then(d => { if (d.success) setSettings(d.data); });
  }, []);

  function toggleLike(id: string) {
    setLiked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function handleAdd(p: OfferWithProduct, img: string, e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    if (p.stock === 0) return;
    const { finalPrice } = calcFinalPrice(p, settings);
    const discounted = Math.round(finalPrice * (1 - p.discount_percent / 100));
    add({ productId: p.id, name: p.name, price: discounted, weight: p.weight, karat: p.karat, image: img, stock: p.stock });
    setAddedId(p.id);
    setTimeout(() => setAddedId(cur => cur === p.id ? null : cur), 1800);
  }

  function scroll(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  }

  if (offers.length === 0) return null;

  return (
    <section style={{ marginBottom: "32px" }}>
      {/* Red gradient header bar */}
      <div style={{
        maxWidth: "1280px", margin: "0 auto", borderRadius: "10px",
        padding: "0 24px", height: "58px", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "linear-gradient(90deg, #e53935 0%, #ef5350 45%, #ff8a80 100%)",
        boxShadow: "0 2px 10px rgba(229,57,53,0.25)",
      }}>
        <Link href={viewAll} style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(255,255,255,0.2)", color: "#fff", textDecoration: "none", fontSize: "12px", fontWeight: "700", padding: "7px 16px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.4)" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.35)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.2)"}>
          Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ù‡Ù…Ù‡
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <BadgePercent size={20} color="#fff" />
          <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: "800", margin: 0 }}>{title}</h2>
        </div>
      </div>
      {/* Scroll row */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px", position: "relative" }}>
        <button onClick={() => scroll("left")} aria-label="Ù‚Ø¨Ù„ÛŒ"
          style={{ position: "absolute", left: "0", top: "50%", transform: "translateY(-50%)", width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#fff", border: "1px solid #e0e0e0", color: "#555", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", transition: "all 0.2s" }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "#e53935"; el.style.color = "#fff"; el.style.borderColor = "#e53935"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "#fff"; el.style.color = "#555"; el.style.borderColor = "#e0e0e0"; }}>
          <ChevronLeft size={18}/>
        </button>
        <button onClick={() => scroll("right")} aria-label="Ø¨Ø¹Ø¯ÛŒ"
          style={{ position: "absolute", right: "0", top: "50%", transform: "translateY(-50%)", width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#fff", border: "1px solid #e0e0e0", color: "#555", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", transition: "all 0.2s" }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "#e53935"; el.style.color = "#fff"; el.style.borderColor = "#e53935"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "#fff"; el.style.color = "#555"; el.style.borderColor = "#e0e0e0"; }}>
          <ChevronRight size={18}/>
        </button>

        <div ref={scrollRef} style={{ display: "flex", overflowX: "auto", scrollbarWidth: "none", padding: "20px 24px", margin: "0 -16px" }}>
          <style>{`::-webkit-scrollbar{display:none}`}</style>
          {offers.map(p => {
            const img       = getImg(p.images);
            const { finalPrice } = calcFinalPrice(p, settings);
            const originalPrice = finalPrice;
            const discounted    = Math.round(finalPrice * (1 - p.discount_percent / 100));
            const hasDiscount   = p.discount_percent > 0;
            const isLiked       = liked.has(p.id);
            const isAdded       = addedId === p.id;
            const oos           = p.stock === 0;
            const code          = `#${p.id.slice(0, 4).toUpperCase()}`;

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
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc", fontSize: "11px" }}>Ø¨Ø¯ÙˆÙ† ØªØµÙˆÛŒØ±</div>
                    )}
                    {hasDiscount && !oos && (
                      <div style={{ position: "absolute", top: "8px", right: "8px", backgroundColor: "#e53935", color: "#fff", fontSize: "11px", fontWeight: "800", padding: "3px 8px", borderRadius: "12px", direction: "ltr" }}>
                        {p.discount_percent}%
                      </div>
                    )}
                    {oos && <span style={{ position: "absolute", top: "8px", left: "8px", backgroundColor: "#f5f5f5", color: "#aaa", fontSize: "9px", fontWeight: "700", padding: "2px 7px", borderRadius: "10px", border: "1px solid #e0e0e0" }}>Ù†Ø§Ù…ÙˆØ¬ÙˆØ¯</span>}
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
                      style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: isAdded ? "#dcfce7" : "#fdeaea", border: `1px solid ${isAdded ? "#86efac" : "#f3b0b0"}`, cursor: oos ? "not-allowed" : "pointer", color: isAdded ? "#16a34a" : "#e53935", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                      {isAdded ? <Check size={11}/> : <ShoppingCart size={11}/>}
                    </button>
                    <button onClick={e => { e.preventDefault(); toggleLike(p.id); }}
                      style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: isLiked ? "#fdeaea" : "#f8f8f8", border: `1px solid ${isLiked ? "#e53935" : "#e8e8e8"}`, cursor: "pointer", color: isLiked ? "#e53935" : "#bbb", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                      <Heart size={11} fill={isLiked ? "#e53935" : "none"}/>
                    </button>
                  </div>
                  <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                    {hasDiscount && (
                      <p style={{ color: "#bbb", fontSize: "10px", textDecoration: "line-through", lineHeight: 1.3, direction: "ltr", textAlign: "right" }}>
                        {originalPrice.toLocaleString("fa-IR")}
                      </p>
                    )}
                    {discounted > 0 ? (
                      <>
                        <p style={{ color: "#e53935", fontSize: "12px", fontWeight: "800", lineHeight: 1.2, direction: "ltr", textAlign: "right" }}>{discounted.toLocaleString("fa-IR")}</p>
                        <p style={{ color: "#bbb", fontSize: "9px" }}>ØªÙˆÙ…Ø§Ù†</p>
                      </>
                    ) : <p style={{ color: "#bbb", fontSize: "11px" }}>ØªÙ…Ø§Ø³ Ø¨Ú¯ÛŒØ±ÛŒØ¯</p>}
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
