"use client";
import { useState, useEffect, useRef } from "react";
import { Heart, ShoppingCart, Check, ChevronLeft, ChevronRight, BadgePercent } from "lucide-react";
import Link from "next/link";
import { useCart } from "./CartContext";
import ProductVideoPreview from "./ProductVideoPreview";
import { calcFinalPrice } from "@/lib/pricing";
import { firstMedia } from "@/lib/media";

interface Product {
  id: string; name: string; slug: string; price: number;
  weight: number; karat: number; images: string; videos: string; stock: number;
  ajrat_override: number; ajrat_percent: number | null; ajrat_fixed: number | null;
}
interface Settings { gold_markup_percent: string; gold_fixed_fee: string; }

function getImg(images: string): string | null {
  try { const a = JSON.parse(images); if (a[0]) return a[0]; } catch {}
  return null;
}

/** Carousel autoplay interval — same as SpecialOffers. */
const AUTOPLAY_MS = 3000;
/** Must match the `gap` on `.dg-lw-track`. */
const CARD_GAP = 10;

/**
 * «محصولات کم اُجرت» — same card/carousel design as ExpressShipping (and
 * SpecialOffers) but with a violet panel instead of the teal one, and a
 * «کم اجرت» badge instead of the delivery badge. Products are picked via the
 * «کم اجرت» checkbox on the product form — no separate admin menu.
 */
const CSS = `
.dg-lw-wrap{max-width:1280px;margin:0 auto;padding:0 16px;}
.dg-lw-panel{border-radius:15px;background:linear-gradient(90deg,rgb(91,33,182) 0%,rgb(221,214,254) 50%,rgb(76,29,149) 100%);padding:10px 15px;}
.dg-lw-row{display:flex;flex-wrap:wrap;align-items:stretch;}
.dg-lw-aside{flex:0 0 100%;max-width:100%;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px;padding:4px 0 12px;}
.dg-lw-title,.dg-lw-aside-info,.dg-lw-aside-btn{flex:0 0 33.3333%;max-width:33.3333%;display:flex;align-items:center;justify-content:center;margin:0;}
.dg-lw-title{color:#fff;font-size:15px;font-weight:700;line-height:1.7;text-align:center;}
.dg-lw-shipbox{display:flex;align-items:center;gap:8px;background:#fff;color:#7c3aed;font-weight:700;font-size:13px;padding:10px 16px;border-radius:6px;white-space:nowrap;}
.dg-lw-viewall{display:inline-block;background:#7c3aed;color:#fff;border-radius:4px;padding:8px 18px;font-size:12px;font-weight:600;text-decoration:none;white-space:nowrap;transition:background-color .3s ease;}
.dg-lw-viewall:hover{background:#000;color:#fff;}

/* ── Carousel ── */
.dg-lw-main{flex:0 0 100%;max-width:100%;min-width:0;position:relative;}
.dg-lw-track{display:flex;gap:10px;overflow-x:auto;scroll-behavior:smooth;scrollbar-width:none;-ms-overflow-style:none;padding:2px;}
.dg-lw-track::-webkit-scrollbar{display:none;}
.dg-lw-card{flex:0 0 calc(33.3333% - 7px);max-width:calc(33.3333% - 7px);background:#fff;display:flex;flex-direction:column;text-align:center;overflow:hidden;border-radius:10px;}
.dg-lw-media{position:relative;display:block;background:#d7d7d7;aspect-ratio:1/1;overflow:hidden;}
.dg-lw-img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .4s ease;}
.dg-lw-media:hover .dg-lw-img{transform:scale(1.06);}
.dg-lw-badge{position:absolute;z-index:2;top:10px;right:10px;color:#fff;background:#7c3aed;font-size:11px;font-weight:700;padding:3px 9px;display:flex;align-items:center;gap:4px;border-radius:3px;}
.dg-lw-oos{position:absolute;z-index:2;top:10px;right:10px;color:#fff;background:#bbb;font-size:11px;font-weight:700;padding:3px 9px;}
.dg-lw-noimg{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#999;font-size:11px;}
`;

const CSS2 = `
.dg-lw-wish{position:absolute;z-index:10;top:10px;left:10px;width:30px;height:30px;padding:0;border-radius:50%;background:#fff;color:#7c3aed;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;visibility:hidden;opacity:0;transform:translateX(15px);transition:all .35s ease;}
.dg-lw-media:hover .dg-lw-wish{visibility:visible;opacity:1;transform:translateX(0);}
.dg-lw-wish:hover{background:#7c3aed;color:#fff;}
.dg-lw-wish.on{visibility:visible;opacity:1;transform:translateX(0);color:#d90000;}
.dg-lw-actions{position:absolute;z-index:10;left:0;right:0;bottom:0;opacity:0;visibility:hidden;transform:translateY(100%);transition:all .35s ease;}
.dg-lw-media:hover .dg-lw-actions,.dg-lw-media:focus-within .dg-lw-actions{opacity:1;visibility:visible;transform:translateY(0);}
@media (hover:none){
  .dg-lw-actions{opacity:1;visibility:visible;transform:none;}
  .dg-lw-wish{visibility:visible;opacity:1;transform:none;}
}
.dg-lw-cart{direction:rtl;width:100%;display:flex;align-items:center;justify-content:center;gap:6px;padding:11px 4px;background:#fff;color:#7c3aed;border:none;border-bottom:1px solid #ebebeb;font-family:inherit;font-size:12px;cursor:pointer;transition:all .35s ease;}
.dg-lw-cart:hover:not(:disabled){background:#7c3aed;color:#fff;border-bottom-color:#7c3aed;}
.dg-lw-cart:disabled{color:#c9c9c9;cursor:not-allowed;}
.dg-lw-cart.added,.dg-lw-cart.added:disabled{background:#7c3aed;color:#fff;}
.dg-lw-body{background:#fff;padding:10px 13px 14px;display:flex;flex-direction:column;flex:1;}
.dg-lw-name{height:40px;margin:0;font-size:13px;font-weight:400;line-height:1.6;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;font-family:var(--font-product,inherit);}
.dg-lw-name a{color:#333;text-decoration:none;}
.dg-lw-name a:hover{color:#7c3aed;}
.dg-lw-price{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:6px;margin:15px 0 0;direction:rtl;font-family:var(--font-price,inherit);}
.dg-lw-new{color:#6d28d9;font-size:15px;font-weight:700;}
.dg-lw-unit{color:#a78bfa;font-size:11px;}
.dg-lw-nav{position:absolute;top:50%;transform:translateY(-50%);width:32px;height:32px;padding:0;border-radius:50%;background:#fff;color:#6d28d9;border:1px solid rgba(0,0,0,.06);box-shadow:0 2px 8px rgba(0,0,0,.15);cursor:pointer;display:none;align-items:center;justify-content:center;z-index:5;transition:all .2s ease;}
.dg-lw-nav:hover{background:#7c3aed;color:#fff;border-color:#7c3aed;}
.dg-lw-nav-left{left:2px;}
.dg-lw-nav-right{right:2px;}

@media (min-width:768px){
  .dg-lw-row{flex-wrap:nowrap;}
  .dg-lw-aside{flex:0 0 16.6667%;max-width:16.6667%;flex-direction:column;flex-wrap:nowrap;align-items:stretch;justify-content:center;gap:0;padding:0 6px;}
  .dg-lw-title,.dg-lw-aside-info,.dg-lw-aside-btn{flex:0 0 auto;max-width:100%;}
  .dg-lw-title{font-size:18px;line-height:40px;margin-bottom:14px;}
  .dg-lw-aside-info{margin-bottom:16px;}
  .dg-lw-main{flex:1 1 0;min-width:0;max-width:none;}
}
@media (min-width:992px){
  .dg-lw-card{flex:0 0 calc(20% - 8px);max-width:calc(20% - 8px);}
  .dg-lw-nav{display:flex;}
}
`;

export default function LowWageProducts() {
  const [items, setItems]       = useState<Product[]>([]);
  const [loaded, setLoaded]     = useState(false);
  const [settings, setSettings] = useState<Settings>({ gold_markup_percent: "5", gold_fixed_fee: "0" });
  const [liked, setLiked]       = useState<Set<string>>(new Set());
  const [addedId, setAddedId]   = useState<string | null>(null);
  const scrollRef               = useRef<HTMLDivElement>(null);
  const pausedRef               = useRef(false);
  const { add } = useCart();

  useEffect(() => {
    fetch("/api/products?lowWage=true&limit=20").then(r => r.json()).then(d => {
      if (d.success) setItems(d.data.products);
      setLoaded(true);
    }).catch(() => setLoaded(true));
    fetch("/api/admin/settings").then(r => r.json()).then(d => { if (d.success) setSettings(d.data); }).catch(() => {});
  }, []);

  // Carousel autoplay — pauses while the pointer is over the row (same as ExpressShipping).
  useEffect(() => {
    if (!loaded || items.length === 0) return;
    const id = setInterval(() => {
      const el = scrollRef.current;
      if (!el || pausedRef.current) return;

      const max = el.scrollWidth - el.clientWidth;
      if (max <= 4) return;                                   // everything already fits

      const card = el.firstElementChild as HTMLElement | null;
      const step = card ? card.offsetWidth + CARD_GAP : 280;
      const rtl  = getComputedStyle(el).direction === "rtl";
      // In RTL the track starts at scrollLeft 0 and goes negative as it advances.
      const travelled = rtl ? -el.scrollLeft : el.scrollLeft;

      if (travelled >= max - 4) el.scrollTo({ left: 0, behavior: "smooth" });   // loop to the start
      else el.scrollBy({ left: rtl ? -step : step, behavior: "smooth" });
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [loaded, items.length]);

  function toggleLike(id: string) {
    setLiked(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
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

  if (!loaded || items.length === 0) return null;

  return (
    <section style={{ marginBottom: "32px" }}>
      <style>{CSS + CSS2}</style>
      <div className="dg-lw-wrap">
        <div className="dg-lw-panel">
          <div className="dg-lw-row">

            {/* Panel side column: title + low-wage note + view-all */}
            <div className="dg-lw-aside">
              <h3 className="dg-lw-title">محصولات کم اُجرت</h3>
              <div className="dg-lw-aside-info">
                <div className="dg-lw-shipbox">
                  <BadgePercent size={20} />
                  <span>کمترین اجرت ساخت</span>
                </div>
              </div>
              <div className="dg-lw-aside-btn">
                <Link href="/products?lowWage=true" className="dg-lw-viewall">مشاهده همه</Link>
              </div>
            </div>

            {/* Product carousel */}
            <div className="dg-lw-main">
              <button type="button" className="dg-lw-nav dg-lw-nav-left" onClick={() => scroll("left")} aria-label="قبلی">
                <ChevronLeft size={18} />
              </button>
              <button type="button" className="dg-lw-nav dg-lw-nav-right" onClick={() => scroll("right")} aria-label="بعدی">
                <ChevronRight size={18} />
              </button>

              <div className="dg-lw-track" ref={scrollRef}
                onMouseEnter={() => { pausedRef.current = true; }}
                onMouseLeave={() => { pausedRef.current = false; }}
                onTouchStart={() => { pausedRef.current = true; }}
                onTouchEnd={() => { pausedRef.current = false; }}>
                {items.map(p => {
                  const img          = getImg(p.images);
                  const { finalPrice } = calcFinalPrice(p, settings);
                  const isLiked      = liked.has(p.id);
                  const isAdded      = addedId === p.id;
                  const oos          = p.stock === 0;
                  const vid          = firstMedia(p.videos);

                  return (
                    <div key={p.id} className="dg-lw-card">
                      <div className="dg-lw-media">
                        {oos
                          ? <span className="dg-lw-oos">ناموجود</span>
                          : <span className="dg-lw-badge"><BadgePercent size={11} /> کم اجرت</span>}

                        <Link href={`/products/${p.slug}`} style={{ display: "block", width: "100%", height: "100%" }}>
                          {img
                            ? <img className="dg-lw-img" src={img} alt={p.name} loading="lazy" />
                            : <div className="dg-lw-noimg">بدون تصویر</div>}
                        </Link>

                        {vid && <ProductVideoPreview src={vid} />}

                        <button type="button" className={`dg-lw-wish${isLiked ? " on" : ""}`}
                          aria-label="افزودن به لیست علاقه مندی" onClick={() => toggleLike(p.id)}>
                          <Heart size={14} fill={isLiked ? "#d90000" : "none"} />
                        </button>

                        <div className="dg-lw-actions">
                          <button type="button" className={`dg-lw-cart${isAdded ? " added" : ""}`}
                            disabled={oos || !img}
                            onClick={e => { if (img) handleAdd(p, img, e); }}>
                            {isAdded ? <Check size={14} /> : <ShoppingCart size={14} />}
                            <span>{isAdded ? "افزوده شد" : "افزودن به سبد خرید"}</span>
                          </button>
                        </div>
                      </div>

                      <div className="dg-lw-body">
                        <h6 className="dg-lw-name">
                          <Link href={`/products/${p.slug}`}>{p.name}</Link>
                        </h6>
                        <div className="dg-lw-price">
                          {finalPrice > 0 ? (
                            <>
                              <span className="dg-lw-new">{finalPrice.toLocaleString("fa-IR")}</span>
                              <span className="dg-lw-unit">تومان</span>
                            </>
                          ) : (
                            <span className="dg-lw-new" style={{ fontSize: "13px" }}>تماس بگیرید</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
