"use client";
import { useState, useEffect, useRef } from "react";
import { Heart, ShoppingCart, Check, ChevronLeft, ChevronRight } from "lucide-react";
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
interface Offer { id: string; discount_percent: number; sort_order: number; active: number; product_id: string; }
interface OfferWithProduct extends Offer, Product {}
interface Settings { gold_markup_percent: string; gold_fixed_fee: string; }

function getImg(images: string): string | null {
  try { const a = JSON.parse(images); if (a[0]) return a[0]; } catch {}
  return null;
}

/** Deadline used when the admin has not set one: end of the current day (local time). */
function endOfToday(): number {
  const d = new Date();
  d.setHours(23, 59, 59, 0);
  return d.getTime();
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Carousel autoplay interval. younesgold uses 1000ms; 3000ms is far more readable. */
const AUTOPLAY_MS = 3000;
/** Must match the `gap` on `.dg-so-track`. */
const CARD_GAP = 10;

/**
 * Styles mirror younesgold.com's «پیشنهاد شگفت انگیز» block 1:1 —
 * `.special-container` (gold gradient panel), the `.countdown` box/colon markup,
 * `.product-label.label-top` (red % badge), `.product-7` buttons and `.product-price`.
 */
const CSS = `
.dg-so-wrap{max-width:1280px;margin:0 auto;padding:0 16px;}
.dg-so-panel{border-radius:15px;background:linear-gradient(90deg,rgb(191,149,63) 0%,rgb(252,246,186) 50%,rgb(179,135,40) 100%);padding:10px 15px;}
.dg-so-row{display:flex;flex-wrap:wrap;align-items:stretch;}
.dg-so-aside{flex:0 0 100%;max-width:100%;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px;padding:4px 0 12px;}
.dg-so-title,.dg-so-aside-cd,.dg-so-aside-btn{flex:0 0 33.3333%;max-width:33.3333%;display:flex;align-items:center;justify-content:center;margin:0;}
.dg-so-title{color:#fff;font-size:15px;font-weight:700;line-height:1.7;text-align:center;}
.dg-so-countdown{display:flex;gap:5px;justify-content:center;align-items:center;direction:rtl;}
.dg-so-box{background:#fff;color:#000;font-weight:bold;font-size:20px;width:45px;height:45px;display:flex;justify-content:center;align-items:center;border-radius:6px;}
.dg-so-colon{color:#fff;font-weight:bold;font-size:22px;}
.dg-so-viewall{display:inline-block;background:#ea0;color:#fff;border-radius:4px;padding:8px 18px;font-size:12px;font-weight:600;text-decoration:none;white-space:nowrap;transition:background-color .3s ease;}
.dg-so-viewall:hover{background:#000;color:#fff;}

/* ── Carousel ── */
.dg-so-main{flex:0 0 100%;max-width:100%;min-width:0;position:relative;}
.dg-so-track{display:flex;gap:10px;overflow-x:auto;scroll-behavior:smooth;scrollbar-width:none;-ms-overflow-style:none;padding:2px;}
.dg-so-track::-webkit-scrollbar{display:none;}
.dg-so-card{flex:0 0 calc(33.3333% - 7px);max-width:calc(33.3333% - 7px);background:#fff;display:flex;flex-direction:column;text-align:center;overflow:hidden;border-radius:10px;}
.dg-so-media{position:relative;display:block;background:#d7d7d7;aspect-ratio:1/1;overflow:hidden;}
.dg-so-img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .4s ease;}
.dg-so-media:hover .dg-so-img{transform:scale(1.06);}
.dg-so-badge{position:absolute;z-index:2;top:10px;right:10px;color:#fff;background:#d90000;font-size:14px;font-weight:400;padding:2px 9px;min-width:20px;text-align:center;direction:ltr;}
.dg-so-oos{position:absolute;z-index:2;top:10px;right:10px;color:#fff;background:#bbb;font-size:11px;font-weight:700;padding:3px 9px;}
.dg-so-noimg{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#999;font-size:11px;}
.dg-so-wish{position:absolute;z-index:10;top:10px;left:10px;width:30px;height:30px;padding:0;border-radius:50%;background:#fff;color:#ea0;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;visibility:hidden;opacity:0;transform:translateX(15px);transition:all .35s ease;}
.dg-so-media:hover .dg-so-wish{visibility:visible;opacity:1;transform:translateX(0);}
.dg-so-wish:hover{background:#ea0;color:#fff;}
.dg-so-wish.on{visibility:visible;opacity:1;transform:translateX(0);color:#d90000;}
.dg-so-actions{position:absolute;z-index:10;left:0;right:0;bottom:0;opacity:0;visibility:hidden;transform:translateY(100%);transition:all .35s ease;}
.dg-so-media:hover .dg-so-actions,.dg-so-media:focus-within .dg-so-actions{opacity:1;visibility:visible;transform:translateY(0);}
@media (hover:none){
  .dg-so-actions{opacity:1;visibility:visible;transform:none;}
  .dg-so-wish{visibility:visible;opacity:1;transform:none;}
}
.dg-so-cart{direction:rtl;width:100%;display:flex;align-items:center;justify-content:center;gap:6px;padding:11px 4px;background:#fff;color:#ea0;border:none;border-bottom:1px solid #ebebeb;font-family:inherit;font-size:12px;cursor:pointer;transition:all .35s ease;}
.dg-so-cart:hover:not(:disabled){background:#ea0;color:#fff;border-bottom-color:#ea0;}
.dg-so-cart:disabled{color:#c9c9c9;cursor:not-allowed;}
.dg-so-cart.added,.dg-so-cart.added:disabled{background:#ea0;color:#fff;}
.dg-so-body{background:#fff;padding:10px 13px 14px;display:flex;flex-direction:column;flex:1;}
.dg-so-name{height:40px;margin:0;font-size:13px;font-weight:400;line-height:1.6;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;font-family:var(--font-product,inherit);}
.dg-so-name a{color:#333;text-decoration:none;}
.dg-so-name a:hover{color:#ea0;}
.dg-so-price{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:6px;margin:15px 0 0;direction:rtl;font-family:var(--font-price,inherit);}
.dg-so-old{color:#dc3545;font-size:12px;padding:3px 6px;border-radius:4px;background:rgba(220,53,69,.08);}
.dg-so-new{color:#fbbf1f;font-size:15px;font-weight:700;}
.dg-so-unit{color:#fbb500;font-size:11px;}
.dg-so-nav{position:absolute;top:50%;transform:translateY(-50%);width:32px;height:32px;padding:0;border-radius:50%;background:#fff;color:#8a6d20;border:1px solid rgba(0,0,0,.06);box-shadow:0 2px 8px rgba(0,0,0,.15);cursor:pointer;display:none;align-items:center;justify-content:center;z-index:5;transition:all .2s ease;}
.dg-so-nav:hover{background:#ea0;color:#fff;border-color:#ea0;}
.dg-so-nav-left{left:2px;}
.dg-so-nav-right{right:2px;}

@media (min-width:768px){
  .dg-so-row{flex-wrap:nowrap;}
  .dg-so-aside{flex:0 0 16.6667%;max-width:16.6667%;flex-direction:column;flex-wrap:nowrap;align-items:stretch;justify-content:center;gap:0;padding:0 6px;}
  .dg-so-title,.dg-so-aside-cd,.dg-so-aside-btn{flex:0 0 auto;max-width:100%;}
  .dg-so-title{font-size:18px;line-height:40px;margin-bottom:14px;}
  .dg-so-aside-cd{margin-bottom:16px;}
  .dg-so-main{flex:1 1 0;min-width:0;max-width:none;}
}
@media (min-width:992px){
  .dg-so-card{flex:0 0 calc(20% - 8px);max-width:calc(20% - 8px);}
  .dg-so-nav{display:flex;}
}
`;
export default function SpecialOffers() {
  const [offers, setOffers]     = useState<OfferWithProduct[]>([]);
  const [enabled, setEnabled]   = useState(false);
  const [title, setTitle]       = useState("پیشنهاد شگفت انگیز");
  const [viewAll, setViewAll]   = useState("/products");
  const [endAt, setEndAt]       = useState("");
  const [settings, setSettings] = useState<Settings>({ gold_markup_percent: "5", gold_fixed_fee: "0" });
  const [liked, setLiked]       = useState<Set<string>>(new Set());
  const [addedId, setAddedId]   = useState<string | null>(null);
  const [time, setTime]         = useState({ h: "00", m: "00", s: "00" });
  const [expired, setExpired]   = useState(false);
  const scrollRef               = useRef<HTMLDivElement>(null);
  const pausedRef               = useRef(false);
  const { add } = useCart();

  useEffect(() => {
    fetch("/api/special-offers").then(r => r.json()).then(d => {
      if (!d.success || !d.data.enabled) return;
      setOffers(d.data.offers);
      setTitle(d.data.title);
      setViewAll(d.data.view_all_href);
      setEndAt(d.data.end_at || "");
      setEnabled(true);
    }).catch(() => {});
    fetch("/api/admin/settings").then(r => r.json()).then(d => { if (d.success) setSettings(d.data); }).catch(() => {});
  }, []);

  // Countdown — same behaviour as younesgold: hours : minutes : seconds, rolling every 24h
  useEffect(() => {
    if (!enabled) return;
    const target = endAt ? new Date(endAt).getTime() : endOfToday();
    if (Number.isNaN(target)) return;
    setExpired(false);
    const tick = () => {
      const distance = target - Date.now();
      if (distance < 0) { setExpired(true); return; }
      setTime({
        h: pad2(Math.floor((distance % 86400000) / 3600000)),
        m: pad2(Math.floor((distance % 3600000) / 60000)),
        s: pad2(Math.floor((distance % 60000) / 1000)),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [enabled, endAt]);

  // Carousel autoplay (younesgold autoplays it) — pauses while the pointer is over the row.
  useEffect(() => {
    if (!enabled || offers.length === 0) return;
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
  }, [enabled, offers.length]);

  function toggleLike(id: string) {
    setLiked(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
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

  if (!enabled || offers.length === 0) return null;

  return (
    <section style={{ marginBottom: "32px" }}>
      <style>{CSS}</style>
      <div className="dg-so-wrap">
        <div className="dg-so-panel">
          <div className="dg-so-row">

            {/* Gold panel side column: title + countdown + view-all */}
            <div className="dg-so-aside">
              <h3 className="dg-so-title">{title}</h3>
              <div className="dg-so-aside-cd">
                <div className="dg-so-countdown">
                  {expired ? (
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: "14px" }}>پایان یافت</span>
                  ) : (
                    <>
                      <div className="dg-so-box">{time.s}</div>
                      <div className="dg-so-colon">:</div>
                      <div className="dg-so-box">{time.m}</div>
                      <div className="dg-so-colon">:</div>
                      <div className="dg-so-box">{time.h}</div>
                    </>
                  )}
                </div>
              </div>
              <div className="dg-so-aside-btn">
                <Link href={viewAll} className="dg-so-viewall">مشاهده همه</Link>
              </div>
            </div>

            {/* Product carousel */}
            <div className="dg-so-main">
              <button type="button" className="dg-so-nav dg-so-nav-left" onClick={() => scroll("left")} aria-label="قبلی">
                <ChevronLeft size={18} />
              </button>
              <button type="button" className="dg-so-nav dg-so-nav-right" onClick={() => scroll("right")} aria-label="بعدی">
                <ChevronRight size={18} />
              </button>

              <div className="dg-so-track" ref={scrollRef}
                onMouseEnter={() => { pausedRef.current = true; }}
                onMouseLeave={() => { pausedRef.current = false; }}
                onTouchStart={() => { pausedRef.current = true; }}
                onTouchEnd={() => { pausedRef.current = false; }}>
                {offers.map(p => {
                  const img         = getImg(p.images);
                  const { finalPrice } = calcFinalPrice(p, settings);
                  const original    = finalPrice;
                  const discounted  = Math.round(finalPrice * (1 - p.discount_percent / 100));
                  const hasDiscount = p.discount_percent > 0 && discounted > 0;
                  const isLiked     = liked.has(p.id);
                  const isAdded     = addedId === p.id;
                  const oos         = p.stock === 0;
                  const vid         = firstMedia(p.videos);

                  return (
                    <div key={p.id} className="dg-so-card">
                      <div className="dg-so-media">
                        {oos
                          ? <span className="dg-so-oos">ناموجود</span>
                          : hasDiscount
                            ? <span className="dg-so-badge">{p.discount_percent}%</span>
                            : null}

                        <Link href={`/products/${p.slug}`} style={{ display: "block", width: "100%", height: "100%" }}>
                          {img
                            ? <img className="dg-so-img" src={img} alt={p.name} loading="lazy" />
                            : <div className="dg-so-noimg">بدون تصویر</div>}
                        </Link>

                        {vid && <ProductVideoPreview src={vid} />}

                        <button type="button" className={`dg-so-wish${isLiked ? " on" : ""}`}
                          aria-label="افزودن به لیست علاقه مندی" onClick={() => toggleLike(p.id)}>
                          <Heart size={14} fill={isLiked ? "#d90000" : "none"} />
                        </button>

                        <div className="dg-so-actions">
                          <button type="button" className={`dg-so-cart${isAdded ? " added" : ""}`}
                            disabled={oos || !img}
                            onClick={e => { if (img) handleAdd(p, img, e); }}>
                            {isAdded ? <Check size={14} /> : <ShoppingCart size={14} />}
                            <span>{isAdded ? "افزوده شد" : "افزودن به سبد خرید"}</span>
                          </button>
                        </div>
                      </div>

                      <div className="dg-so-body">
                        <h6 className="dg-so-name">
                          <Link href={`/products/${p.slug}`}>{p.name}</Link>
                        </h6>
                        <div className="dg-so-price">
                          {hasDiscount && <del className="dg-so-old">{original.toLocaleString("fa-IR")}</del>}
                          {discounted > 0 ? (
                            <>
                              <span className="dg-so-new">{discounted.toLocaleString("fa-IR")}</span>
                              <span className="dg-so-unit">تومان</span>
                            </>
                          ) : (
                            <span className="dg-so-new" style={{ fontSize: "13px" }}>تماس بگیرید</span>
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

