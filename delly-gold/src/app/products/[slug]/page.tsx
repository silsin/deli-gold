"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart, ShoppingCart, Check, ChevronLeft, ChevronRight, Shield, Truck,
  RotateCcw, Coins, Play, Minus, Plus, Star, CreditCard, Gift,
} from "lucide-react";
import PageLayout from "../../components/PageLayout";
import { useCart, cartLineKey } from "../../components/CartContext";
import ProductVideoPreview from "../../components/ProductVideoPreview";
import { calcFinalPrice } from "@/lib/pricing";
import { parseMedia, firstMedia } from "@/lib/media";
import {
  parseVariants, parseSpecs, buildDefaultSpecs, karatLabel,
  type ProductVariant, type ProductSpec,
} from "@/lib/product-variants";
import {
  parseProductPageSettings, NO_POSTCARD_LABEL, type ProductPageSettings,
} from "@/lib/product-page-settings";

interface Product {
  id: string; name: string; slug: string; description: string | null;
  price: number; weight: number; karat: number; stock: number;
  images: string; videos: string; featured: number; published: number;
  express_shipping: number; low_wage: number; coin: number;
  variants: string; specs: string;
  category_name: string | null; category_slug: string | null;
  ajrat_override: number; ajrat_percent: number | null; ajrat_fixed: number | null;
}
interface Settings {
  gold_markup_percent: string;
  gold_fixed_fee: string;
  gold_tax_percent?: string;
  product_page_json?: string;
}
interface Review { id: string; name: string; rating: number; body: string; createdAt: string; }
interface ReviewSummary { count: number; average: number; }
interface CardProduct {
  id: string; name: string; slug: string; price: number; weight: number;
  karat: number; stock: number; images: string; videos: string;
  ajrat_override: number; ajrat_percent: number | null; ajrat_fixed: number | null;
}

const fallbackImgs = [
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
];

/** Gallery images — falls back to the stock photos when the product has none. */
function imagesOf(raw: string): string[] {
  const list = parseMedia(raw);
  return list.length ? list : fallbackImgs;
}
function firstImgOf(raw: string, i = 0): string {
  return imagesOf(raw)[i % imagesOf(raw).length];
}
function fa(n: number) { return Math.round(n).toLocaleString("fa-IR"); }

/** Rating stars — halves are rounded to the nearest whole star. */
function Stars({ value, size = 13 }: { value: number; size?: number }) {
  const full = Math.round(value);
  return (
    <span className="pd-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} color="#c8a12a" fill={i <= full ? "#c8a12a" : "none"} />
      ))}
    </span>
  );
}

const CSS = `
.pd-wrap{max-width:1280px;margin:0 auto;padding:28px 16px 40px;}
.pd-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:40px;align-items:start;}
.pd-sticky{position:sticky;top:20px;}
.pd-gallery{display:flex;gap:12px;align-items:flex-start;}
.pd-thumbs{display:flex;flex-direction:column;gap:8px;max-height:520px;overflow-y:auto;flex-shrink:0;}
.pd-thumb{width:64px;height:64px;border-radius:8px;overflow:hidden;border:2px solid #ebebeb;padding:0;background:none;cursor:pointer;position:relative;flex-shrink:0;transition:border-color .2s;}
.pd-thumb.on{border-color:#c8a12a;}
.pd-main{position:relative;flex:1;min-width:0;border:1px solid #ebebeb;border-radius:12px;overflow:hidden;background:#f8f8f8;aspect-ratio:1/1;}
.pd-main img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .25s ease;}
.pd-main.zoom img{transform:scale(1.8);}
.pd-badge{position:absolute;z-index:2;top:12px;right:12px;background:#c8a12a;color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;}
.pd-oos{position:absolute;inset:0;z-index:3;background:rgba(255,255,255,.82);display:flex;align-items:center;justify-content:center;}
.pd-oos span{color:#dc2626;font-size:16px;font-weight:700;border:1px solid rgba(220,38,38,.3);padding:8px 20px;border-radius:8px;background:#fff;}
.pd-cat{display:inline-flex;align-items:center;gap:4px;color:#c8a12a;font-size:12px;font-weight:600;text-decoration:none;margin-bottom:8px;}
.pd-title{color:#222;font-size:22px;font-weight:800;line-height:1.5;margin:0 0 8px;}
.pd-stars{display:inline-flex;align-items:center;gap:2px;}
.pd-review-link{color:#888;font-size:12px;text-decoration:none;}
.pd-review-link:hover{color:#c8a12a;}
.pd-meta{display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-size:11.5px;color:#999;margin-bottom:16px;}
.pd-chip{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:5px;font-weight:700;}
.pd-chip.in{color:#16a34a;background:#f0fdf4;border:1px solid #bbf7d0;}
.pd-chip.out{color:#dc2626;background:#fef2f2;border:1px solid #fecaca;}
.pd-chip.exp{color:#0f766e;background:#f0fdfa;border:1px solid #99f6e4;}
.pd-opt{margin-bottom:14px;}
.pd-opt-label{display:flex;align-items:center;gap:6px;color:#333;font-size:12px;font-weight:700;margin-bottom:6px;}
.pd-free{color:#16a34a;font-size:10px;font-weight:700;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:4px;padding:1px 6px;}
.pd-select{width:100%;border:1px solid #ddd;border-radius:8px;padding:9px 12px;font-size:13px;color:#333;background:#fff;font-family:inherit;outline:none;cursor:pointer;}
.pd-select:focus{border-color:#c8a12a;}
.pd-weights{display:flex;flex-wrap:wrap;gap:6px;}
.pd-weight{border:1px solid #ddd;background:#fff;color:#444;font-size:12px;padding:6px 10px;border-radius:6px;cursor:pointer;font-family:inherit;transition:all .15s;}
.pd-weight:hover:not(:disabled){border-color:#c8a12a;color:#c8a12a;}
.pd-weight.on{background:#c8a12a;border-color:#c8a12a;color:#fff;font-weight:700;}
.pd-weight:disabled{opacity:.45;cursor:not-allowed;text-decoration:line-through;}
.pd-price{border:1px solid #f5e4a0;background:#fdf8ee;border-radius:12px;padding:16px 20px;margin-bottom:16px;}
.pd-price-total{display:flex;align-items:baseline;gap:8px;}
.pd-price-num{color:#c8a12a;font-size:28px;font-weight:900;line-height:1;}
.pd-price-unit{color:#aaa;font-size:13px;}
.pd-price-rows{display:flex;flex-direction:column;gap:5px;border-top:1px solid #f5e4a0;margin-top:10px;padding-top:10px;}
.pd-price-row{display:flex;justify-content:space-between;gap:8px;font-size:11px;color:#999;}
.pd-price-row b{color:#666;font-weight:600;}
.pd-formula{border:1px solid #eee;background:#fafafa;border-radius:10px;padding:12px 14px;font-size:11.5px;color:#666;line-height:2;margin-bottom:16px;}
.pd-formula b{color:#333;}
.pd-qty-row{display:flex;gap:8px;align-items:stretch;margin-bottom:10px;}
.pd-qty{display:flex;align-items:center;gap:4px;border:1px solid #ddd;border-radius:8px;padding:3px;}
.pd-qty button{width:30px;height:30px;border:none;background:#f5f5f5;border-radius:6px;cursor:pointer;color:#555;display:flex;align-items:center;justify-content:center;}
.pd-qty button:disabled{opacity:.4;cursor:not-allowed;}
.pd-qty span{min-width:26px;text-align:center;font-size:14px;font-weight:700;color:#333;}
.pd-add{flex:1;border:none;border-radius:8px;padding:12px 20px;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;background:#c8a12a;color:#fff;transition:background-color .2s;}
.pd-add:hover:not(:disabled){background:#b08f22;}
.pd-add.added{background:#16a34a;}
.pd-add:disabled{background:#e0e0e0;cursor:not-allowed;color:#fff;}
.pd-wish{width:50px;border:1px solid #ddd;border-radius:8px;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#bbb;transition:all .2s;}
.pd-wish.on{border-color:#c8a12a;background:#fdf8ee;color:#c8a12a;}
.pd-buy{width:100%;background:#fff;color:#c8a12a;border:2px solid #c8a12a;border-radius:8px;padding:11px;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit;margin-bottom:16px;transition:all .2s;}
.pd-buy:hover{background:#c8a12a;color:#fff;}
.pd-incart{display:flex;align-items:center;gap:8px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 14px;margin-bottom:12px;font-size:12px;color:#16a34a;}
.pd-trust{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:16px;}
.pd-trust-item{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 8px;background:#f8f8f8;border:1px solid #ebebeb;border-radius:8px;text-align:center;}
.pd-trust-item p{color:#333;font-size:11px;font-weight:700;}
.pd-trust-item small{color:#aaa;font-size:10px;}
.pd-section{margin-top:56px;}
.pd-h2{color:#222;font-size:18px;font-weight:800;margin:0 0 18px;display:flex;align-items:center;gap:8px;}
.pd-table{width:100%;border-collapse:collapse;border:1px solid #ebebeb;border-radius:12px;overflow:hidden;}
.pd-table th,.pd-table td{padding:11px 16px;font-size:12.5px;text-align:right;border-bottom:1px solid #f0f0f0;}
.pd-table tr:last-child th,.pd-table tr:last-child td{border-bottom:none;}
.pd-table th{width:220px;color:#777;font-weight:600;background:#fafafa;}
.pd-table td{color:#333;}
.pd-desc{color:#777;font-size:13px;line-height:2;}
.pd-summary{display:flex;align-items:center;gap:14px;flex-wrap:wrap;background:#fafafa;border:1px solid #f0f0f0;border-radius:12px;padding:14px 18px;margin-bottom:16px;}
.pd-summary strong{color:#c8a12a;font-size:22px;font-weight:900;}
.pd-summary span{color:#888;font-size:12px;}
.pd-review{border:1px solid #f0f0f0;border-radius:10px;padding:14px 16px;margin-bottom:10px;}
.pd-review header{display:flex;align-items:center;gap:10px;margin-bottom:8px;}
.pd-review header p{color:#333;font-size:12.5px;font-weight:700;}
.pd-review header aside{color:#aaa;font-size:11px;margin-right:auto;}
.pd-review>p{color:#666;font-size:12.5px;line-height:1.9;}
.pd-form{border:1px solid #ebebeb;border-radius:12px;padding:16px;background:#fafafa;}
.pd-textarea{width:100%;border:1px solid #ddd;border-radius:8px;padding:10px 12px;font-size:13px;font-family:inherit;color:#333;outline:none;resize:vertical;min-height:90px;background:#fff;}
.pd-textarea:focus{border-color:#c8a12a;}
.pd-pick{display:flex;align-items:center;gap:4px;margin-bottom:10px;}
.pd-pick button{background:none;border:none;padding:0;cursor:pointer;display:flex;}
.pd-muted{color:#999;font-size:12px;line-height:1.9;}
.pd-faq-item{border:1px solid #ebebeb;border-radius:10px;margin-bottom:8px;overflow:hidden;background:#fff;}
.pd-faq-q{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 16px;background:none;border:none;cursor:pointer;font-family:inherit;font-size:13px;font-weight:700;color:#333;text-align:right;}
.pd-faq-a{padding:0 16px 14px;color:#777;font-size:12.5px;line-height:1.9;}
.pd-rail-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px;}
.pd-rail-nav{display:flex;gap:6px;}
.pd-rail-nav button{width:30px;height:30px;border-radius:50%;border:1px solid #eee;background:#fff;color:#c8a12a;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;}
.pd-rail-nav button:hover{background:#c8a12a;color:#fff;border-color:#c8a12a;}
.pd-carousel{display:flex;gap:12px;overflow-x:auto;scroll-behavior:smooth;padding:2px;scrollbar-width:none;-ms-overflow-style:none;}
.pd-carousel::-webkit-scrollbar{display:none;}
.pd-card{flex:0 0 calc(25% - 9px);max-width:calc(25% - 9px);background:#fff;border:1px solid #f0f0f0;border-radius:10px;overflow:hidden;text-decoration:none;transition:box-shadow .2s,transform .2s,border-color .2s;}
.pd-card:hover{border-color:#c8a12a;transform:translateY(-3px);box-shadow:0 6px 18px rgba(0,0,0,.08);}
.pd-card-media{position:relative;padding-bottom:100%;background:#f8f8f8;}
.pd-card-media img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.pd-card-body{padding:12px;}
.pd-card-body h4{color:#333;font-size:12px;font-weight:600;line-height:1.5;margin:0 0 4px;height:36px;overflow:hidden;}
.pd-card-body small{color:#aaa;font-size:10px;display:block;margin-bottom:5px;}
.pd-card-body strong{color:#c8a12a;font-size:13px;font-weight:800;}
.pd-card-body strong span{color:#bbb;font-size:10px;font-weight:400;}
.pd-card-oos{position:absolute;top:8px;right:8px;z-index:2;background:#bbb;color:#fff;font-size:10px;font-weight:700;padding:3px 8px;border-radius:3px;}
.pd-bar{position:fixed;left:0;right:0;bottom:0;z-index:60;background:#fff;border-top:1px solid #eee;box-shadow:0 -4px 20px rgba(0,0,0,.08);transform:translateY(110%);transition:transform .25s ease;}
.pd-bar.show{transform:translateY(0);}
.pd-bar-inner{max-width:1280px;margin:0 auto;padding:10px 16px;display:flex;align-items:center;gap:14px;}
.pd-bar-thumb{width:46px;height:46px;border-radius:8px;object-fit:cover;border:1px solid #eee;flex-shrink:0;}
.pd-bar-name{color:#333;font-size:13px;font-weight:600;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.pd-bar-price{color:#c8a12a;font-size:15px;font-weight:800;}
.pd-bar-btn{background:#c8a12a;color:#fff;border:none;border-radius:8px;padding:10px 22px;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;display:flex;align-items:center;gap:6px;flex-shrink:0;}
.pd-bar-btn:disabled{background:#e0e0e0;cursor:not-allowed;}
@media (max-width:900px){.pd-card{flex:0 0 calc(40% - 8px);max-width:calc(40% - 8px);}}
@media (max-width:768px){
  .pd-grid{grid-template-columns:1fr;gap:20px;}
  .pd-sticky{position:static;}
  .pd-gallery{flex-direction:column-reverse;}
  .pd-thumbs{flex-direction:row;max-height:none;width:100%;overflow-x:auto;overflow-y:hidden;padding-bottom:2px;}
  .pd-main.zoom img{transform:none;}
  .pd-trust{grid-template-columns:repeat(2,1fr);}
  .pd-table th{width:110px;padding:9px 10px;}
  .pd-table td{padding:9px 10px;}
  .pd-card{flex:0 0 calc(62% - 6px);max-width:calc(62% - 6px);}
  .pd-h2{font-size:16px;}
}
`;
/** Horizontal product rail — used for «محصولات مرتبط» and «محصولاتی که شاید بپسندید». */
function Rail({ title, href, items, settings }: {
  title: string; href: string; items: CardProduct[]; settings: Settings;
}) {
  const ref = useRef<HTMLDivElement>(null);
  if (items.length === 0) return null;
  return (
    <section className="pd-section">
      <div className="pd-rail-head">
        <h2 className="pd-h2" style={{ margin: 0 }}>{title}</h2>
        <div className="pd-rail-nav">
          <Link href={href} className="pd-review-link" style={{ alignSelf: "center", marginLeft: 6, fontWeight: 600 }}>
            مشاهده همه
          </Link>
          <button type="button" aria-label="قبلی"
            onClick={() => ref.current?.scrollBy({ left: 320, behavior: "smooth" })}>
            <ChevronRight size={16} />
          </button>
          <button type="button" aria-label="بعدی"
            onClick={() => ref.current?.scrollBy({ left: -320, behavior: "smooth" })}>
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>
      <div className="pd-carousel" ref={ref}>
        {items.map(p => {
          const fp  = calcFinalPrice(p, settings).finalPrice;
          const vid = firstMedia(p.videos);
          return (
            <Link key={p.id} href={`/products/${p.slug}`} className="pd-card">
              <div className="pd-card-media">
                {p.stock === 0 && <span className="pd-card-oos">ناموجود</span>}
                <img src={firstImgOf(p.images)} alt={p.name} loading="lazy" />
                {vid && <ProductVideoPreview src={vid} />}
              </div>
              <div className="pd-card-body">
                <h4>{p.name}</h4>
                <small>{p.karat} عیار · {p.weight} گرم</small>
                <strong>{fa(fp)} <span>تومان</span></strong>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { add, update, items } = useCart();

  const [product, setProduct]     = useState<Product | null>(null);
  const [settings, setSettings]   = useState<Settings>({ gold_markup_percent: "5", gold_fixed_fee: "0" });
  const [loading, setLoading]     = useState(true);
  const [liked, setLiked]         = useState(false);
  const [added, setAdded]         = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [related, setRelated]     = useState<CardProduct[]>([]);
  const [alsoLike, setAlsoLike]   = useState<CardProduct[]>([]);
  const [qty, setQty]             = useState(1);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [giftPack, setGiftPack]   = useState("");
  const [postcard, setPostcard]   = useState(NO_POSTCARD_LABEL);
  const [zoom, setZoom]           = useState({ active: false, x: 50, y: 50 });
  const [openFaq, setOpenFaq]     = useState<number | null>(0);
  const [reviews, setReviews]     = useState<Review[]>([]);
  const [summary, setSummary]     = useState<ReviewSummary>({ count: 0, average: 0 });
  const [myRating, setMyRating]   = useState(5);
  const [myReview, setMyReview]   = useState("");
  const [reviewMsg, setReviewMsg] = useState("");
  const [sending, setSending]     = useState(false);
  const [loggedIn, setLoggedIn]   = useState(false);
  const [dayRate, setDayRate]     = useState(0);
  const [showBar, setShowBar]     = useState(false);
  const buyRef = useRef<HTMLDivElement>(null);

  // Store settings (اجرت/سود/مالیات + product-page JSON), today's gold rate and auth state.
  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json())
      .then(d => { if (d.success) setSettings(d.data); }).catch(() => {});
    fetch("/api/admin/gold-price").then(r => r.json())
      .then(d => { if (d.success && d.data.price > 0) setDayRate(d.data.price); }).catch(() => {});
    fetch("/api/auth/me").then(r => r.json())
      .then(d => setLoggedIn(!!d.success)).catch(() => {});
  }, []);

  // Product, its approved reviews and the two product rails.
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/products/${slug}`).then(r => r.json()).then(d => {
      if (!d.success || !d.data) return;
      const p = d.data as Product;
      setProduct(p);
      setVariantId(parseVariants(p.variants)[0]?.id ?? null);

      fetch(`/api/products/${p.slug}/reviews`).then(r => r.json())
        .then(rd => { if (rd.success) { setReviews(rd.data.reviews); setSummary(rd.data.summary); } })
        .catch(() => {});

      const catQuery = p.category_slug ? `category=${p.category_slug}&` : "";
      fetch(`/api/products?${catQuery}limit=12`).then(r => r.json())
        .then(rd => {
          if (!rd.success) return;
          setRelated((rd.data.products as CardProduct[]).filter(x => x.slug !== p.slug).slice(0, 8));
        }).catch(() => {});

      fetch("/api/products?featured=true&limit=12").then(r => r.json())
        .then(rd => {
          if (!rd.success) return;
          setAlsoLike((rd.data.products as CardProduct[]).filter(x => x.slug !== p.slug).slice(0, 8));
        }).catch(() => {});
    }).finally(() => setLoading(false));
  }, [slug]);

  // Sticky buy bar — appears once the buy column scrolls out of view.
  useEffect(() => {
    const el = buyRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(entries => setShowBar(!entries[0].isIntersecting));
    obs.observe(el);
    return () => obs.disconnect();
  }, [product]);

  const pps      = useMemo(() => parseProductPageSettings(settings.product_page_json), [settings.product_page_json]);
  const variants = useMemo(() => (product ? parseVariants(product.variants) : []), [product]);
  const selectedVariant: ProductVariant | null = variants.find(v => v.id === variantId) ?? variants[0] ?? null;
  const weight         = selectedVariant ? selectedVariant.weight : product?.weight ?? 0;
  const basePrice      = selectedVariant ? selectedVariant.price : product?.price ?? 0;
  const availableStock = selectedVariant ? selectedVariant.stock : product?.stock ?? 0;

  const pricing = useMemo(() => calcFinalPrice({
    price: basePrice,
    weight,
    ajrat_override: product?.ajrat_override ?? 0,
    ajrat_percent: product?.ajrat_percent ?? null,
    ajrat_fixed: product?.ajrat_fixed ?? null,
  }, settings), [basePrice, weight, product, settings]);

  const specs = useMemo<ProductSpec[]>(() => {
    if (!product) return [];
    const custom = parseSpecs(product.specs);
    return custom.length
      ? custom
      : buildDefaultSpecs({
          karat: product.karat,
          weight,
          categoryName: product.category_name,
          packaging: pps.packaging,
        });
  }, [product, weight, pps.packaging]);

  const images = useMemo(() => (product ? imagesOf(product.images) : []), [product]);
  const media  = useMemo(() => (product ? [
    ...parseMedia(product.videos).map(src => ({ type: "video" as const, src })),
    ...images.map(src => ({ type: "image" as const, src })),
  ] : []), [product, images]);

  const lineKey   = product ? cartLineKey({ productId: product.id, variantWeight: selectedVariant?.weight }) : "";
  const inCartQty = items.find(i => cartLineKey(i) === lineKey)?.quantity ?? 0;
  const oos       = availableStock === 0;
  const isMaxed   = inCartQty >= availableStock;
  const perGram   = weight > 0 ? Math.round(pricing.finalPrice / weight) : 0;
  const goldGram  = weight > 0 ? Math.round(basePrice / weight) : 0;
  const packName  = giftPack || pps.packs[0];

  const handleAdd = useCallback(() => {
    if (!product || oos) return;
    const payload = {
      productId: product.id,
      name: product.name,
      price: pricing.finalPrice,
      weight,
      karat: product.karat,
      image: images[0],
      stock: availableStock,
      variantWeight: selectedVariant ? selectedVariant.weight : undefined,
      giftPack: packName || undefined,
      postcard: postcard && postcard !== NO_POSTCARD_LABEL ? postcard : undefined,
    };
    add(payload);
    if (qty > 1) update(cartLineKey(payload), inCartQty + qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }, [product, oos, pricing.finalPrice, weight, images, availableStock, selectedVariant, packName, postcard, add, qty, update, inCartQty]);

  async function submitReview() {
    if (!product || sending) return;
    setSending(true); setReviewMsg("");
    try {
      const res = await fetch(`/api/products/${product.slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: myRating, body: myReview }),
      });
      const d = await res.json();
      if (d.success) {
        setMyReview("");
        setReviewMsg("دیدگاه شما ثبت شد و پس از تأیید مدیر نمایش داده می‌شود.");
      } else {
        setReviewMsg(d.error || "خطا در ثبت دیدگاه");
      }
    } catch {
      setReviewMsg("خطای شبکه. دوباره تلاش کنید");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
          <div style={{ color: "#c8a12a", fontSize: 14 }}>در حال بارگذاری...</div>
        </div>
      </PageLayout>
    );
  }

  if (!product) {
    return (
      <PageLayout>
        <div style={{ textAlign: "center", padding: "80px 16px" }}>
          <p style={{ color: "#888", fontSize: 16, marginBottom: 12 }}>محصول یافت نشد</p>
          <Link href="/products" style={{ color: "#c8a12a", textDecoration: "none", fontSize: 14 }}>← بازگشت به محصولات</Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <style>{CSS}</style>

      {/* Breadcrumb */}
      <div style={{ backgroundColor: "#fafafa", borderBottom: "1px solid #f0f0f0", padding: "10px 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#aaa", flexWrap: "wrap" }}>
          <Link href="/" style={{ color: "#aaa", textDecoration: "none" }}>خانه</Link>
          <span>/</span>
          <Link href="/products" style={{ color: "#aaa", textDecoration: "none" }}>محصولات</Link>
          {product.category_name && (
            <>
              <span>/</span>
              <Link href={`/products?category=${product.category_slug}`} style={{ color: "#aaa", textDecoration: "none" }}>{product.category_name}</Link>
            </>
          )}
          <span>/</span>
          <span style={{ color: "#555" }}>{product.name}</span>
        </div>
      </div>

      <div className="pd-wrap">
        <div className="pd-grid">

          {/* ── Gallery (sticky on desktop) ── */}
          <div className="pd-sticky">
            <div className="pd-gallery">
              {media.length > 1 && (
                <div className="pd-thumbs">
                  {media.map((m, i) => (
                    <button key={i} type="button" aria-label={`تصویر ${i + 1}`}
                      className={`pd-thumb${activeImg === i ? " on" : ""}`}
                      onClick={() => setActiveImg(i)}>
                      {m.type === "video" ? (
                        <>
                          <video src={m.src} muted playsInline preload="metadata"
                            style={{ width: "100%", height: "100%", objectFit: "cover", backgroundColor: "#000" }} />
                          <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.35)", color: "#fff" }}>
                            <Play size={16} fill="#fff" />
                          </span>
                        </>
                      ) : (
                        <img src={m.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div
                className={`pd-main${zoom.active && media[activeImg]?.type === "image" ? " zoom" : ""}`}
                onMouseEnter={() => setZoom(z => ({ ...z, active: true }))}
                onMouseLeave={() => setZoom(z => ({ ...z, active: false }))}
                onMouseMove={e => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setZoom({
                    active: true,
                    x: ((e.clientX - r.left) / r.width) * 100,
                    y: ((e.clientY - r.top) / r.height) * 100,
                  });
                }}>
                {media[activeImg]?.type === "video" ? (
                  <video key={media[activeImg].src} src={media[activeImg].src} controls autoPlay playsInline
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", backgroundColor: "#000" }} />
                ) : media[activeImg] ? (
                  <img src={media[activeImg].src} alt={product.name}
                    style={{ transformOrigin: `${zoom.x}% ${zoom.y}%` }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc" }}>
                    <Coins size={34} />
                  </div>
                )}
                {product.featured === 1 && <span className="pd-badge">ویژه</span>}
                {oos && <div className="pd-oos"><span>ناموجود</span></div>}
              </div>
            </div>
          </div>

          {/* ── Buy column ── */}
          <div ref={buyRef}>
            {product.category_name && (
              <Link href={`/products?category=${product.category_slug}`} className="pd-cat">
                <ChevronLeft size={12} /> {product.category_name}
              </Link>
            )}

            <h1 className="pd-title">{product.name}</h1>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <Stars value={summary.average || 5} />
              <a href="#pd-reviews" className="pd-review-link">
                ({fa(summary.count)} دیدگاه)
              </a>
            </div>

            <div className="pd-meta">
              <span>کد محصول: {product.id.slice(0, 8).toUpperCase()}</span>
              <span aria-hidden>·</span>
              <span>{karatLabel(product.karat)}</span>
              <span aria-hidden>·</span>
              <span>{weight} گرم</span>
              {!oos && <span className="pd-chip in"><Check size={11} /> موجود در انبار</span>}
              {product.express_shipping === 1 && !oos && <span className="pd-chip exp">ارسال فوری</span>}
            </div>

            {/* Weight variants — price and stock follow the picked weight */}
            {variants.length > 0 && (
              <div className="pd-opt">
                <p className="pd-opt-label">وزن :</p>
                <div className="pd-weights">
                  {variants.map(v => (
                    <button key={v.id} type="button"
                      className={`pd-weight${selectedVariant?.id === v.id ? " on" : ""}`}
                      disabled={v.stock === 0}
                      onClick={() => { setVariantId(v.id); setQty(1); }}>
                      {v.weight} گرم
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Free gift options — like the reference shop’s pre-purchase selects */}
            {pps.packs.length > 0 && (
              <div className="pd-opt">
                <p className="pd-opt-label">بسته بندی <span className="pd-free">رایگان</span></p>
                <select className="pd-select" value={giftPack || pps.packs[0]}
                  onChange={e => setGiftPack(e.target.value)}>
                  {pps.packs.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            )}

            {pps.postcards.length > 0 && (
              <div className="pd-opt">
                <p className="pd-opt-label">هدیه کارت پستال <span className="pd-free">رایگان</span></p>
                <select className="pd-select" value={postcard}
                  onChange={e => setPostcard(e.target.value)}>
                  <option value={NO_POSTCARD_LABEL}>{NO_POSTCARD_LABEL}</option>
                  {pps.postcards.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}

            {/* Price block — full breakdown */}
            <div className="pd-price">
              <div className="pd-price-total">
                <span className="pd-price-num">{fa(pricing.finalPrice)}</span>
                <span className="pd-price-unit">تومان</span>
              </div>
              <div className="pd-price-rows">
                <div className="pd-price-row">
                  <span>ارزش طلا ({weight} گرم{goldGram > 0 ? ` × ${fa(goldGram)}` : ""})</span>
                  <b>{fa(basePrice)} تومان</b>
                </div>
                <div className="pd-price-row">
                  <span>اجرت و سود ({pricing.markupPct}%{pricing.fixedFee > 0 ? ` + ${fa(pricing.fixedFee)} ت/گرم` : ""})</span>
                  <b>+{fa(pricing.ajrat)} تومان</b>
                </div>
                {pricing.taxPct > 0 && (
                  <div className="pd-price-row">
                    <span>مالیات ({pricing.taxPct}%)</span>
                    <b>+{fa(pricing.tax)} تومان</b>
                  </div>
                )}
                <div className="pd-price-row">
                  <span>قیمت هر گرم (با اجرت و سود)</span>
                  <b>{fa(perGram)} تومان</b>
                </div>
              </div>
            </div>

            {/* How the price is calculated — always visible, like the reference */}
            <div className="pd-formula">
              <b>نحوه محاسبه قیمت</b><br />
              فرمول : (نرخ طلای روز + اجرت + سود + مالیات) × وزن
              {dayRate > 0 && (
                <>
                  <br />
                  نرخ روز طلای ۱۸ عیار: <b>{fa(dayRate)}</b> تومان
                </>
              )}
              <br />
              <span className="pd-muted">
                مالیات تنها بر روی سود و اجرت محاسبه می‌شود
                {pricing.taxPct === 0 ? " (در حال حاضر مالیات اعمال نمی‌شود)" : ""}.
              </span>
            </div>

            {inCartQty > 0 && (
              <div className="pd-incart">
                <Check size={14} />
                {fa(inCartQty)} عدد در سبد خرید شما
                <Link href="/cart" style={{ color: "#c8a12a", marginRight: "auto", fontSize: 11, fontWeight: 700 }}>مشاهده سبد ←</Link>
              </div>
            )}

            {/* Quantity + add to cart */}
            <div className="pd-qty-row">
              <div className="pd-qty">
                <button type="button" aria-label="کاهش"
                  disabled={qty <= 1} onClick={() => setQty(q => Math.max(1, q - 1))}>
                  <Minus size={13} />
                </button>
                <span>{fa(qty)}</span>
                <button type="button" aria-label="افزایش"
                  disabled={qty >= availableStock} onClick={() => setQty(q => Math.min(availableStock, q + 1))}>
                  <Plus size={13} />
                </button>
              </div>

              <button type="button" className={`pd-add${added ? " added" : ""}`}
                disabled={oos || isMaxed}
                onClick={handleAdd}>
                {added ? <><Check size={16} /> افزوده شد!</>
                  : oos ? "ناموجود"
                  : <><ShoppingCart size={16} /> افزودن به سبد خرید</>}
              </button>

              <button type="button" aria-label="افزودن به علاقه‌مندی"
                className={`pd-wish${liked ? " on" : ""}`}
                onClick={() => setLiked(l => !l)}>
                <Heart size={18} fill={liked ? "#c8a12a" : "none"} />
              </button>
            </div>

            {isMaxed && !oos && (
              <p className="pd-muted" style={{ marginBottom: 10 }}>حداکثر موجودی این وزن در سبد شما است.</p>
            )}

            {!oos && (
              <button type="button" className="pd-buy"
                onClick={() => { handleAdd(); router.push("/cart"); }}>
                خرید این محصول
              </button>
            )}

            {/* Trust strip */}
            <div className="pd-trust">
              {[
                { icon: <RotateCcw size={18} color="#c8a12a" />, title: "بازگشت کالا", sub: "تا ۱۴ روز" },
                { icon: <Truck size={18} color="#c8a12a" />, title: "ارسال کالا", sub: "به سراسر ایران" },
                { icon: <CreditCard size={18} color="#c8a12a" />, title: "خرید اقساطی", sub: "بدون سود و کارمزد" },
                { icon: <Gift size={18} color="#c8a12a" />, title: "بسته بندی", sub: "کادویی و رایگان" },
              ].map((b, i) => (
                <div key={i} className="pd-trust-item">
                  {b.icon}
                  <p>{b.title}</p>
                  <small>{b.sub}</small>
                </div>
              ))}
            </div>

            <p className="pd-muted" style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
              <Shield size={13} color="#c8a12a" /> همراه با فاکتور معتبر و ضمانت اصالت کالا
            </p>
          </div>
        </div>

        {/* ── «خصوصیات محصولات طلا» ── */}
        <section className="pd-section">
          <h2 className="pd-h2"><Coins size={18} color="#c8a12a" /> خصوصیات محصولات طلا</h2>
          <table className="pd-table">
            <tbody>
              {specs.map(s => (
                <tr key={s.label}>
                  <th>{s.label}</th>
                  <td>{s.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── Description ── */}
        {product.description && (
          <section className="pd-section">
            <h2 className="pd-h2">مشخصات {product.name}</h2>
            <p className="pd-desc">{product.description}</p>
          </section>
        )}

        {/* ── «دیدگاه‌ها» ── */}
        <section className="pd-section" id="pd-reviews">
          <h2 className="pd-h2">دیدگاه‌ها</h2>

          <div className="pd-summary">
            <Stars value={summary.average || 5} size={16} />
            <strong>{summary.average ? `${summary.average} از ۵` : "بدون امتیاز"}</strong>
            <span>({fa(summary.count)} دیدگاه ثبت‌شده)</span>
          </div>

          {reviews.length === 0 ? (
            <p className="pd-muted" style={{ marginBottom: 16 }}>
              هنوز دیدگاهی برای این محصول ثبت نشده است — اولین نفر باشید!
            </p>
          ) : (
            reviews.map(r => (
              <div key={r.id} className="pd-review">
                <header>
                  <p>{r.name}</p>
                  <Stars value={r.rating} size={12} />
                  <aside>{new Date(r.createdAt).toLocaleDateString("fa-IR")}</aside>
                </header>
                <p>{r.body}</p>
              </div>
            ))
          )}

          <div className="pd-form">
            <p className="pd-opt-label" style={{ marginBottom: 10 }}>ثبت دیدگاه</p>
            {!loggedIn ? (
              <p className="pd-muted">
                برای ثبت دیدگاه ابتدا{" "}
                <Link href={`/login?redirect=/products/${product.slug}`} style={{ color: "#c8a12a", fontWeight: 700 }}>وارد شوید</Link>
                {" "}یا{" "}
                <Link href={`/login?tab=register&redirect=/products/${product.slug}`} style={{ color: "#c8a12a", fontWeight: 700 }}>ثبت‌نام کنید</Link>.
              </p>
            ) : (
              <>
                <div className="pd-pick">
                  <span className="pd-muted" style={{ marginLeft: 6 }}>امتیاز شما:</span>
                  {[1, 2, 3, 4, 5].map(i => (
                    <button key={i} type="button" aria-label={`${i} ستاره`} onClick={() => setMyRating(i)}>
                      <Star size={20} color="#c8a12a" fill={i <= myRating ? "#c8a12a" : "none"} />
                    </button>
                  ))}
                </div>
                <textarea className="pd-textarea" value={myReview} placeholder="تجربه خود از این محصول را بنویسید..."
                  onChange={e => setMyReview(e.target.value)} />
                {reviewMsg && <p className="pd-muted" style={{ marginTop: 8 }}>{reviewMsg}</p>}
                <button type="button" className="pd-bar-btn" disabled={sending}
                  style={{ marginTop: 10, borderRadius: 8, padding: "10px 24px" }}
                  onClick={submitReview}>
                  {sending ? "در حال ارسال..." : "ثبت دیدگاه"}
                </button>
              </>
            )}
          </div>
        </section>

        {/* ── «سوالات متداول» ── */}
        {pps.faq.length > 0 && (
          <section className="pd-section">
            <h2 className="pd-h2">سوالات متداول</h2>
            {pps.faq.map((item, i) => (
              <div key={i} className="pd-faq-item">
                <button type="button" className="pd-faq-q"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{item.q}</span>
                  <ChevronLeft size={16} style={{ transform: openFaq === i ? "rotate(-90deg)" : "none", transition: "transform .2s" }} />
                </button>
                {openFaq === i && <p className="pd-faq-a">{item.a}</p>}
              </div>
            ))}
          </section>
        )}

        {/* ── «محصولات مرتبط» + «محصولاتی که شاید بپسندید» ── */}
        <Rail
          title="محصولات مرتبط"
          href={product.category_slug ? `/products?category=${product.category_slug}` : "/products"}
          items={related}
          settings={settings}
        />
        <Rail title="محصولاتی که شاید بپسندید" href="/products" items={alsoLike} settings={settings} />
      </div>

      {/* ── Sticky buy bar — shows once the buy column scrolls out of view ── */}
      <div className={`pd-bar${showBar && !oos ? " show" : ""}`}>
        <div className="pd-bar-inner">
          <img className="pd-bar-thumb" src={images[0]} alt="" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="pd-bar-name">{product.name}</p>
            <span className="pd-bar-price">{fa(pricing.finalPrice)} تومان</span>
          </div>
          <button type="button" className="pd-bar-btn" disabled={isMaxed} onClick={handleAdd}>
            {added
              ? <><Check size={15} /> افزوده شد</>
              : <><ShoppingCart size={15} /> افزودن به سبد خرید</>}
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
