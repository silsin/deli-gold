"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { Heart, Search, X, ShoppingCart, Check, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import PageLayout from "../components/PageLayout";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "../components/CartContext";
import { calcFinalPrice } from "@/lib/pricing";

interface Category { id: string; name: string; slug: string; }
interface Product {
  id: string; name: string; slug: string; price: number; weight: number;
  karat: number; stock: number; images: string; featured: number;
  category_name: string;
  ajrat_override: number; ajrat_percent: number | null; ajrat_fixed: number | null;
}
interface Settings { gold_markup_percent: string; gold_fixed_fee: string; }

const sortOptions = [
  { value: "newest",     label: "جدیدترین" },
  { value: "price_asc",  label: "ارزان‌ترین" },
  { value: "price_desc", label: "گران‌ترین" },
];

const goldImages = [
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80",
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80",
  "https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=400&q=80",
  "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&q=80",
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80",
];

function getImg(images: string, i: number) {
  try { const a = JSON.parse(images); if (a[0]) return a[0]; } catch {}
  return goldImages[i % goldImages.length];
}

function ProductsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings]     = useState<Settings>({ gold_markup_percent: "5", gold_fixed_fee: "0" });
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState(searchParams.get("search") || "");
  const [selectedCat, setSelectedCat] = useState(searchParams.get("category") || "");
  const [sort, setSort]             = useState("newest");
  const [liked, setLiked]           = useState<Set<string>>(new Set());
  const [addedId, setAddedId]       = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage]             = useState(1);
  const { add, items } = useCart();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "16", page: String(page) });
    if (search) params.set("search", search);
    if (selectedCat) params.set("category", selectedCat);
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    if (data.success) {
      let rows: Product[] = data.data.products;
      if (sort === "price_asc")  rows = [...rows].sort((a, b) => a.price - b.price);
      if (sort === "price_desc") rows = [...rows].sort((a, b) => b.price - a.price);
      setProducts(rows);
      setPagination(data.data.pagination);
    }
    setLoading(false);
  }, [search, selectedCat, sort, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(d => { if (d.success) setCategories(d.data); });
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

  const activeCatName = selectedCat
    ? categories.find(c => c.id === selectedCat)?.name || "محصولات"
    : "همه محصولات";

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <div style={{ backgroundColor: "#fafafa", padding: "9px 0", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#aaa" }}>
          <Link href="/" style={{ color: "#aaa", textDecoration: "none" }}>خانه</Link>
          <span>/</span>
          <span style={{ color: "#555" }}>{activeCatName}</span>
        </div>
      </div>

      {/* Category tabs — like mio-gold's horizontal tab nav */}
      <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px", display: "flex", overflowX: "auto", scrollbarWidth: "none" }}>
          <style>{`::-webkit-scrollbar{display:none}`}</style>
          {[{ id: "", name: "همه" }, ...categories].map(c => {
            const isActive = selectedCat === c.id;
            return (
              <button key={c.id} onClick={() => { setSelectedCat(c.id); setPage(1); }}
                style={{
                  flexShrink: 0,
                  padding: "12px 18px",
                  border: "none",
                  backgroundColor: "transparent",
                  color: isActive ? "#c8a12a" : "#555",
                  fontSize: "13px",
                  fontWeight: isActive ? "700" : "400",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  borderBottom: isActive ? "2px solid #c8a12a" : "2px solid transparent",
                  transition: "color 0.15s, border-color 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "#c8a12a"; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "#555"; }}>
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 16px" }}>

        {/* ── Filter / sort bar ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", gap: "10px", flexWrap: "wrap" }}>
          {/* Right: count + filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => setShowFilter(true)}
              style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid #ddd", borderRadius: "7px", padding: "7px 14px", background: "#fff", fontSize: "13px", cursor: "pointer", color: "#555", fontFamily: "inherit", transition: "all 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#c8a12a"; (e.currentTarget as HTMLElement).style.color = "#c8a12a"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#ddd"; (e.currentTarget as HTMLElement).style.color = "#555"; }}>
              <SlidersHorizontal size={14} />
              فیلتر کردن محصولات ({pagination.total} محصول)
            </button>
          </div>

          {/* Left: sort + search */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <Search size={13} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "#bbb" }} />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="جستجو..."
                style={{ border: "1px solid #ddd", borderRadius: "7px", padding: "7px 30px 7px 10px", fontSize: "13px", outline: "none", color: "#333", width: "160px", fontFamily: "inherit" }}
                onFocus={e => (e.target.style.borderColor = "#c8a12a")}
                onBlur={e => (e.target.style.borderColor = "#ddd")} />
              {search && <button onClick={() => { setSearch(""); setPage(1); }} style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#bbb", cursor: "pointer" }}><X size={12} /></button>}
            </div>
            {/* Sort */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "#888", fontSize: "12px", whiteSpace: "nowrap" }}>مرتب‌سازی</span>
              <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
                style={{ border: "1px solid #ddd", borderRadius: "7px", padding: "7px 10px", fontSize: "13px", outline: "none", cursor: "pointer", color: "#333", backgroundColor: "#fff", fontFamily: "inherit" }}>
                {sortOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Product grid ── */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ backgroundColor: "#f8f8f8", borderRadius: "10px", height: "360px", border: "1px solid #f0f0f0", animation: "shimmer 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
            <p style={{ color: "#888", fontSize: "16px" }}>محصولی یافت نشد</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }} className="prod-grid">
            {products.map((p, i) => {
              const img = getImg(p.images, i);
              const { finalPrice } = calcFinalPrice(p, settings);
              const isLiked = liked.has(p.id);
              const inCart  = items.some(it => it.productId === p.id);
              const isAdded = addedId === p.id;
              const oos     = p.stock === 0;
              const code    = `#${p.id.slice(0, 4).toUpperCase()}`;
              // Fake discount for display (could be real if product has markup override)
              const hasDiscount = p.ajrat_override === 1 && p.ajrat_percent !== null && p.ajrat_percent < 5;
              const discountPct = hasDiscount ? Math.round(5 - (p.ajrat_percent ?? 0)) * 2 : 0;

              return (
                <div key={p.id} style={{ backgroundColor: "#fff", border: "1px solid #f0f0f0", borderRadius: "10px", overflow: "hidden", position: "relative", transition: "box-shadow 0.2s, transform 0.2s" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 6px 24px rgba(0,0,0,0.09)"; el.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "none"; el.style.transform = "translateY(0)"; }}>

                  {/* Discount badge */}
                  {(discountPct > 0 || p.featured === 1) && (
                    <div style={{
                      position: "absolute", top: "10px", right: "10px",
                      backgroundColor: "#e53e3e",
                      color: "#fff",
                      fontSize: "10px", fontWeight: "900",
                      padding: "4px 6px",
                      borderRadius: "5px",
                      lineHeight: 1.2,
                      textAlign: "center",
                      zIndex: 2,
                      direction: "ltr",
                    }}>
                      {p.featured === 1 ? "10%" : `${discountPct}%`}<br />OFF
                    </div>
                  )}

                  {/* Wishlist on top-left */}
                  <button onClick={e => { e.preventDefault(); e.stopPropagation(); toggleLike(p.id); }}
                    style={{ position: "absolute", top: "10px", left: "10px", width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#fff", border: "1px solid #e8e8e8", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: isLiked ? "#c8a12a" : "#ccc", zIndex: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", transition: "all 0.2s" }}>
                    <Heart size={13} fill={isLiked ? "#c8a12a" : "none"} />
                  </button>

                  {/* Product image */}
                  <Link href={`/products/${p.slug}`} style={{ display: "block", textDecoration: "none" }}>
                    <div style={{ padding: "24px 16px 12px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "180px", position: "relative", backgroundColor: "#fff" }}>
                      <img src={img} alt={p.name}
                        style={{ maxWidth: "85%", maxHeight: "140px", objectFit: "contain", transition: "transform 0.35s ease", filter: oos ? "grayscale(1) opacity(0.4)" : "none" }}
                        onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = "scale(1.08)"}
                        onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"}
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div style={{ padding: "0 12px 12px", borderTop: "1px solid #f8f8f8" }}>
                    {/* Name */}
                    <Link href={`/products/${p.slug}`} style={{ textDecoration: "none" }}>
                      <p style={{ color: "#222", fontSize: "12px", fontWeight: "700", marginBottom: "3px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {p.name}
                      </p>
                    </Link>

                    {/* Code + weight */}
                    <p style={{ color: "#bbb", fontSize: "10px", marginBottom: "2px" }}>{code}</p>
                    <p style={{ color: "#bbb", fontSize: "10px", marginBottom: "8px" }}>{p.weight} gr gold {p.karat}K</p>

                    {/* Price */}
                    <div style={{ marginBottom: "10px" }}>
                      {p.price > 0 && finalPrice !== p.price && (
                        <p style={{ color: "#ccc", fontSize: "11px", textDecoration: "line-through", direction: "ltr", textAlign: "right" }}>
                          {p.price.toLocaleString("fa-IR")} تومان
                        </p>
                      )}
                      <p style={{ color: "#c8a12a", fontSize: "13px", fontWeight: "900", direction: "ltr", textAlign: "right" }}>
                        {finalPrice > 0 ? `${finalPrice.toLocaleString("fa-IR")} تومان` : "تماس بگیرید"}
                      </p>
                    </div>

                    {/* Buy button + heart */}
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <button
                        onClick={e => handleAdd(p, img, e)}
                        disabled={oos}
                        style={{
                          flex: 1,
                          padding: "8px 0",
                          backgroundColor: isAdded ? "#c8a12a" : "#fff",
                          color: isAdded ? "#fff" : "#c8a12a",
                          border: "1px solid #c8a12a",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: "700",
                          cursor: oos ? "not-allowed" : "pointer",
                          fontFamily: "inherit",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={e => { if (!oos && !isAdded) { (e.currentTarget as HTMLElement).style.backgroundColor = "#c8a12a"; (e.currentTarget as HTMLElement).style.color = "#fff"; } }}
                        onMouseLeave={e => { if (!isAdded) { (e.currentTarget as HTMLElement).style.backgroundColor = "#fff"; (e.currentTarget as HTMLElement).style.color = "#c8a12a"; } }}>
                        {isAdded ? <><Check size={11} /> افزوده شد</> : oos ? "ناموجود" : <><ShoppingCart size={11} /> خرید این محصول</>}
                      </button>
                      <button onClick={e => { e.preventDefault(); e.stopPropagation(); toggleLike(p.id); }}
                        style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#fff", border: "1px solid #e8e8e8", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: isLiked ? "#c8a12a" : "#ccc", transition: "all 0.2s", flexShrink: 0 }}>
                        <Heart size={13} fill={isLiked ? "#c8a12a" : "none"} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", marginTop: "36px" }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ width: 34, height: 34, borderRadius: 7, border: "1px solid #ddd", backgroundColor: "#fff", color: page === 1 ? "#ccc" : "#555", cursor: page === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(pagination.pages, 7) }).map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                style={{ width: 34, height: 34, borderRadius: 7, border: `1px solid ${page === i + 1 ? "#c8a12a" : "#ddd"}`, backgroundColor: page === i + 1 ? "#c8a12a" : "#fff", color: page === i + 1 ? "#fff" : "#555", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
              style={{ width: 34, height: 34, borderRadius: 7, border: "1px solid #ddd", backgroundColor: "#fff", color: page === pagination.pages ? "#ccc" : "#555", cursor: page === pagination.pages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(180deg)" }}>
              <ChevronLeft size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Filter drawer */}
      {showFilter && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300 }}>
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setShowFilter(false)} />
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 280, backgroundColor: "#fff", padding: 20, overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ color: "#222", fontSize: 16, fontWeight: 700 }}>فیلتر محصولات</h3>
              <button onClick={() => setShowFilter(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#888" }}><X size={18} /></button>
            </div>
            <h4 style={{ color: "#c8a12a", fontSize: "13px", fontWeight: "700", marginBottom: "10px" }}>دسته‌بندی</h4>
            {[{ id: "", name: "همه محصولات" }, ...categories].map(c => (
              <button key={c.id} onClick={() => { setSelectedCat(c.id); setPage(1); setShowFilter(false); }}
                style={{ width: "100%", textAlign: "right", padding: "9px 12px", background: "none", border: "none", cursor: "pointer", fontSize: "13px", fontFamily: "inherit", color: selectedCat === c.id ? "#c8a12a" : "#555", fontWeight: selectedCat === c.id ? "700" : "400", backgroundColor: selectedCat === c.id ? "#fdf8ee" : "transparent", borderRadius: "6px", borderRight: selectedCat === c.id ? "3px solid #c8a12a" : "3px solid transparent", marginBottom: "2px" }}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer { 0%,100%{opacity:0.5} 50%{opacity:0.8} }
        @media(max-width:1100px){.prod-grid{grid-template-columns:repeat(3,1fr)!important}}
        @media(max-width:768px){.prod-grid{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:480px){.prod-grid{grid-template-columns:1fr!important}}
      `}</style>
    </PageLayout>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#c8a12a" }}>در حال بارگذاری...</div>}>
      <ProductsInner />
    </Suspense>
  );
}
