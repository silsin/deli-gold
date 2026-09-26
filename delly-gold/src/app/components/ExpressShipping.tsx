"use client";
import { useState, useEffect, useRef } from "react";
import { Heart, ShoppingCart, Check, ChevronLeft, ChevronRight, Truck } from "lucide-react";
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
/** Must match the `gap` on `.dg-ex-track`. */
const CARD_GAP = 10;

/**
 * Same card/carousel design as SpecialOffers («پیشنهاد شگفت انگیز») but with a
 * teal/emerald panel instead of the gold gradient, and a delivery badge instead
 * of the countdown box. Products are picked via the «ارسال فوری» checkbox on
 * the product form — no separate admin menu.
 */
const CSS = `
.dg-ex-wrap{max-width:1280px;margin:0 auto;padding:0 16px;}
.dg-ex-panel{border-radius:15px;background:linear-gradient(90deg,rgb(13,116,103) 0%,rgb(178,240,222) 50%,rgb(10,99,88) 100%);padding:10px 15px;}
.dg-ex-row{display:flex;flex-wrap:wrap;align-items:stretch;}
.dg-ex-aside{flex:0 0 100%;max-width:100%;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px;padding:4px 0 12px;}
.dg-ex-title,.dg-ex-aside-info,.dg-ex-aside-btn{flex:0 0 33.3333%;max-width:33.3333%;display:flex;align-items:center;justify-content:center;margin:0;}
.dg-ex-title{color:#fff;font-size:15px;font-weight:700;line-height:1.7;text-align:center;}
.dg-ex-shipbox{display:flex;align-items:center;gap:8px;background:#fff;color:#0d9488;font-weight:700;font-size:13px;padding:10px 16px;border-radius:6px;white-space:nowrap;}
.dg-ex-viewall{display:inline-block;background:#0d9488;color:#fff;border-radius:4px;padding:8px 18px;font-size:12px;font-weight:600;text-decoration:none;white-space:nowrap;transition:background-color .3s ease;}
.dg-ex-viewall:hover{background:#000;color:#fff;}

/* ── Carousel ── */
.dg-ex-main{flex:0 0 100%;max-width:100%;min-width:0;position:relative;}
.dg-ex-track{display:flex;gap:10px;overflow-x:auto;scroll-behavior:smooth;scrollbar-width:none;-ms-overflow-style:none;padding:2px;}
.dg-ex-track::-webkit-scrollbar{display:none;}
.dg-ex-card{flex:0 0 calc(33.3333% - 7px);max-width:calc(33.3333% - 7px);background:#fff;display:flex;flex-direction:column;text-align:center;overflow:hidden;border-radius:10px;}
.dg-ex-media{position:relative;display:block;background:#d7d7d7;aspect-ratio:1/1;overflow:hidden;}
.dg-ex-img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .4s ease;}
.dg-ex-media:hover .dg-ex-img{transform:scale(1.06);}
.dg-ex-badge{position:absolute;z-index:2;top:10px;right:10px;color:#fff;background:#0d9488;font-size:11px;font-weight:700;padding:3px 9px;display:flex;align-items:center;gap:4px;border-radius:3px;}
.dg-ex-oos{position:absolute;z-index:2;top:10px;right:10px;color:#fff;background:#bbb;font-size:11px;font-weight:700;padding:3px 9px;}
.dg-ex-noimg{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#999;font-size:11px;}
.dg-ex-wish{position:absolute;z-index:10;top:10px;left:10px;width:30px;height:30px;padding:0;border-radius:50%;background:#fff;color:#0d9488;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;visibility:hidden;opacity:0;transform:translateX(15px);transition:all .35s ease;}
.dg-ex-media:hover .dg-ex-wish{visibility:visible;opacity:1;transform:translateX(0);}
.dg-ex-wish:hover{background:#0d9488;color:#fff;}
.dg-ex-wish.on{visibility:visible;opacity:1;transform:translateX(0);color:#d90000;}
.dg-ex-actions{position:absolute;z-index:10;left:0;right:0;bottom:0;opacity:0;visibility:hidden;transform:translateY(100%);transition:all .35s ease;}
.dg-ex-media:hover .dg-ex-actions,.dg-ex-media:focus-within .dg-ex-actions{opacity:1;visibility:visible;transform:translateY(0);}
@media (hover:none){
  .dg-ex-actions{opacity:1;visibility:visible;transform:none;}
  .dg-ex-wish{visibility:visible;opacity:1;transform:none;}
}
.dg-ex-cart{direction:rtl;width:100%;display:flex;align-items:center;justify-content:center;gap:6px;padding:11px 4px;background:#fff;color:#0d9488;border:none;border-bottom:1px solid #ebebeb;font-family:inherit;font-size:12px;cursor:pointer;transition:all .35s ease;}
.dg-ex-cart:hover:not(:disabled){background:#0d9488;color:#fff;border-bottom-color:#0d9488;}
.dg-ex-cart:disabled{color:#c9c9c9;cursor:not-allowed;}
.dg-ex-cart.added,.dg-ex-cart.added:disabled{background:#0d9488;color:#fff;}
.dg-ex-body{background:#fff;padding:10px 13px 14px;display:flex;flex-direction:column;flex:1;}
.dg-ex-name{height:40px;margin:0;font-size:13px;font-weight:400;line-height:1.6;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;font-family:var(--font-product,inherit);}
.dg-ex-name a{color:#333;text-decoration:none;}
.dg-ex-name a:hover{color:#0d9488;}
.dg-ex-price{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:6px;margin:15px 0 0;direction:rtl;font-family:var(--font-price,inherit);}
.dg-ex-new{color:#0f766e;font-size:15px;font-weight:700;}
.dg-ex-unit{color:#14b8a6;font-size:11px;}
.dg-ex-nav{position:absolute;top:50%;transform:translateY(-50%);width:32px;height:32px;padding:0;border-radius:50%;background:#fff;color:#0f766e;border:1px solid rgba(0,0,0,.06);box-shadow:0 2px 8px rgba(0,0,0,.15);cursor:pointer;display:none;align-items:center;justify-content:center;z-index:5;transition:all .2s ease;}
.dg-ex-nav:hover{background:#0d9488;color:#fff;border-color:#0d9488;}
.dg-ex-nav-left{left:2px;}
.dg-ex-nav-right{right:2px;}

@media (min-width:768px){
  .dg-ex-row{flex-wrap:nowrap;}
  .dg-ex-aside{flex:0 0 16.6667%;max-width:16.6667%;flex-direction:column;flex-wrap:nowrap;align-items:stretch;justify-content:center;gap:0;padding:0 6px;}
  .dg-ex-title,.dg-ex-aside-info,.dg-ex-aside-btn{flex:0 0 auto;max-width:100%;}
  .dg-ex-title{font-size:18px;line-height:40px;margin-bottom:14px;}
  .dg-ex-aside-info{margin-bottom:16px;}
  .dg-ex-main{flex:1 1 0;min-width:0;max-width:none;}
}
@media (min-width:992px){
  .dg-ex-card{flex:0 0 calc(20% - 8px);max-width:calc(20% - 8px);}
  .dg-ex-nav{display:flex;}
}

/* ── Mobile: keep the panel header, card body and every price readable ── */
@media (max-width:767px){
  .dg-ex-wrap{padding:0 10px;}
  .dg-ex-panel{padding:8px 10px;border-radius:12px;}
  .dg-ex-aside{gap:8px;padding:2px 0 10px;}
  .dg-ex-title{font-size:14px;}
  .dg-ex-shipbox{gap:6px;padding:7px 10px;font-size:11px;}
  .dg-ex-viewall{padding:7px 12px;font-size:11px;}
  .dg-ex-track{scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch;}
  .dg-ex-card{scroll-snap-align:start;border-radius:8px;}
  .dg-ex-body{padding:8px 9px 12px;}
  .dg-ex-name{height:auto;min-height:34px;font-size:12px;line-height:1.5;}
  .dg-ex-price{margin-top:10px;gap:4px;}
  .dg-ex-new{font-size:14px;}
  .dg-ex-unit{font-size:10px;}
  .dg-ex-badge{font-size:10px;padding:2px 7px;top:6px;right:6px;}
  .dg-ex-oos{font-size:10px;padding:2px 7px;top:6px;right:6px;}
  .dg-ex-wish{width:26px;height:26px;top:6px;left:6px;}
  .dg-ex-cart{gap:4px;padding:9px 4px;font-size:11px;}
  .dg-ex-nav{display:none;}
}
@media (max-width:575px){
  /* Title on its own line, «ارسال فوری» chip + «مشاهده همه» centered below it */
  .dg-ex-title{flex:0 0 100%;max-width:100%;font-size:15px;}
  .dg-ex-aside-info{flex:0 1 auto;max-width:none;}
  .dg-ex-aside-btn{flex:0 0 auto;max-width:none;}
  /* Two cards per view instead of three so nothing is squeezed out */
  .dg-ex-card{flex:0 0 calc(50% - 5px);max-width:calc(50% - 5px);}
  /* Safety net: the cart label may shrink/ellipsis but never widen the card */
  .dg-ex-cart span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
}
`;

export default function ExpressShipping() {
  const [items, setItems]       = useState<Product[]>([]);
  const [loaded, setLoaded]     = useState(false);
  const [settings, setSettings] = useState<Settings>({ gold_markup_percent: "5", gold_fixed_fee: "0" });
  const [liked, setLiked]       = useState<Set<string>>(new Set());
  const [addedId, setAddedId]   = useState<string | null>(null);
  const scrollRef               = useRef<HTMLDivElement>(null);
  const pausedRef               = useRef(false);
  const { add } = useCart();

  useEffect(() => {
    fetch("/api/products?express=true&limit=20").then(r => r.json()).then(d => {
      if (d.success) setItems(d.data.products);
      setLoaded(true);
    }).catch(() => setLoaded(true));
    fetch("/api/admin/settings").then(r => r.json()).then(d => { if (d.success) setSettings(d.data); }).catch(() => {});
  }, []);

  // Carousel autoplay — pauses while the pointer is over the row (same as SpecialOffers).
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
      <style>{CSS}</style>
      <div className="dg-ex-wrap">
        <div className="dg-ex-panel">
          <div className="dg-ex-row">

            {/* Panel side column: title + delivery note + view-all */}
            <div className="dg-ex-aside">
              <h3 className="dg-ex-title">محصولات ارسال فوری</h3>
              <div className="dg-ex-aside-info">
                <div className="dg-ex-shipbox">
                  <Truck size={20} />
                  <span>تحویل در همان روز</span>
                </div>
              </div>
              <div className="dg-ex-aside-btn">
                <Link href="/products" className="dg-ex-viewall">مشاهده همه</Link>
              </div>
            </div>

            {/* Product carousel */}
            <div className="dg-ex-main">
              <button type="button" className="dg-ex-nav dg-ex-nav-left" onClick={() => scroll("left")} aria-label="قبلی">
                <ChevronLeft size={18} />
              </button>
              <button type="button" className="dg-ex-nav dg-ex-nav-right" onClick={() => scroll("right")} aria-label="بعدی">
                <ChevronRight size={18} />
              </button>

              <div className="dg-ex-track" ref={scrollRef}
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
                    <div key={p.id} className="dg-ex-card">
                      <div className="dg-ex-media">
                        {oos
                          ? <span className="dg-ex-oos">ناموجود</span>
                          : <span className="dg-ex-badge"><Truck size={11} /> ارسال فوری</span>}

                        <Link href={`/products/${p.slug}`} style={{ display: "block", width: "100%", height: "100%" }}>
                          {img
                            ? <img className="dg-ex-img" src={img} alt={p.name} loading="lazy" />
                            : <div className="dg-ex-noimg">بدون تصویر</div>}
                        </Link>

                        {vid && <ProductVideoPreview src={vid} />}

                        <button type="button" className={`dg-ex-wish${isLiked ? " on" : ""}`}
                          aria-label="افزودن به لیست علاقه مندی" onClick={() => toggleLike(p.id)}>
                          <Heart size={14} fill={isLiked ? "#d90000" : "none"} />
                        </button>

                        <div className="dg-ex-actions">
                          <button type="button" className={`dg-ex-cart${isAdded ? " added" : ""}`}
                            disabled={oos || !img}
                            onClick={e => { if (img) handleAdd(p, img, e); }}>
                            {isAdded ? <Check size={14} /> : <ShoppingCart size={14} />}
                            <span>{isAdded ? "افزوده شد" : "افزودن به سبد خرید"}</span>
                          </button>
                        </div>
                      </div>

                      <div className="dg-ex-body">
                        <h6 className="dg-ex-name">
                          <Link href={`/products/${p.slug}`}>{p.name}</Link>
                        </h6>
                        <div className="dg-ex-price">
                          {finalPrice > 0 ? (
                            <>
                              <span className="dg-ex-new">{finalPrice.toLocaleString("fa-IR")}</span>
                              <span className="dg-ex-unit">تومان</span>
                            </>
                          ) : (
                            <span className="dg-ex-new" style={{ fontSize: "13px" }}>تماس بگیرید</span>
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