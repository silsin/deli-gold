"use client";
import { useEffect, useState, useCallback, useRef, useMemo, Suspense } from "react";
import { Heart, Search, X, ShoppingCart, Check, SlidersHorizontal, ChevronLeft, ChevronRight, Coins, ChevronDown, Tags, FolderTree } from "lucide-react";
import PageLayout from "../components/PageLayout";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "../components/CartContext";
import ProductVideoPreview from "../components/ProductVideoPreview";
import { calcFinalPrice } from "@/lib/pricing";
import { firstMedia } from "@/lib/media";

interface Category { id: string; name: string; slug: string; parent_id?: string | null; parent_name?: string | null; child_count?: number; product_count?: number; }
interface Product {
  id: string; name: string; slug: string; price: number; weight: number;
  karat: number; stock: number; images: string; videos: string; featured: number;
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

/** Row style inside the category dropdown (active state gets the gold accent). */
function catOptionStyle(active: boolean, hasKids = false): React.CSSProperties {
  return {
    width: "100%", display: "flex", alignItems: "center", gap: 8,
    textAlign: "right", padding: "9px 12px", border: "none", cursor: "pointer",
    fontSize: 13, fontFamily: "inherit", background: "none",
    color: active ? "#c8a12a" : "#555", fontWeight: active ? 700 : hasKids ? 600 : 400,
    backgroundColor: active ? "#fdf8ee" : "transparent",
    borderRadius: 8, marginBottom: 2,
  };
}

interface CategoryTreeProps {
  nodes: Category[];
  childMap: Map<string, Category[]>;
  counts: Map<string, number>;
  expanded: Set<string>;
  selected: string;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}

/**
 * «منو و زیرمنو» tree — parents with a chevron, children indented under a
 * guide line. Recurses so any nesting depth renders correctly.
 */
function CategoryTree({ nodes, childMap, counts, expanded, selected, onSelect, onToggle }: CategoryTreeProps) {
  return (
    <>
      {nodes.map(cat => {
        const kids = childMap.get(cat.id) ?? [];
        const isOpen = expanded.has(cat.id);
        const isActive = selected === cat.id || selected === cat.slug;
        const count = counts.get(cat.id) ?? 0;
        return (
          <div key={cat.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {kids.length > 0 ? (
                <button
                  type="button"
                  onClick={() => onToggle(cat.id)}
                  aria-label={isOpen ? `بستن ${cat.name}` : `باز کردن ${cat.name}`}
                  aria-expanded={isOpen}
                  className="cat-twisty"
                  style={{
                    width: 22, height: 22, flexShrink: 0, display: "inline-flex",
                    alignItems: "center", justifyContent: "center", border: "none",
                    background: "none", cursor: "pointer", color: "#bbb", borderRadius: 6,
                  }}
                >
                  <ChevronRight
                    size={14}
                    style={{ transform: isOpen ? "rotate(-90deg)" : "none", transition: "transform .15s" }}
                  />
                </button>
              ) : (
                <span style={{ width: 22, flexShrink: 0 }} />
              )}

              <button
                type="button"
                onClick={() => onSelect(cat.id)}
                className="cat-option"
                style={catOptionStyle(isActive, kids.length > 0)}
              >
                {kids.length > 0 && <FolderTree size={13} color={isActive ? "#c8a12a" : "#bbb"} style={{ flexShrink: 0 }} />}
                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {cat.name}
                </span>
                {count > 0 && (
                  <span style={{ fontSize: 10, color: "#bbb", flexShrink: 0 }}>
                    {count.toLocaleString("fa-IR")}
                  </span>
                )}
                {isActive && <Check size={14} style={{ flexShrink: 0 }} />}
              </button>
            </div>

            {kids.length > 0 && isOpen && (
              <div
                className="cat-branch"
                style={{
                  marginRight: 21, paddingRight: 6,
                  borderRight: "1px dashed #e2e2e2",
                }}
              >
                <CategoryTree
                  nodes={kids}
                  childMap={childMap}
                  counts={counts}
                  expanded={expanded}
                  selected={selected}
                  onSelect={onSelect}
                  onToggle={onToggle}
                />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
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
  const lowWage = searchParams.get("lowWage") === "true";
  const coin = searchParams.get("coin") === "true";
  const express = searchParams.get("express") === "true";
  const featured = searchParams.get("featured") === "true";
  const discount = searchParams.get("discount") === "true";
  const [sort, setSort]             = useState("newest");
  const [liked, setLiked]           = useState<Set<string>>(new Set());
  const [addedId, setAddedId]       = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [drawerQuery, setDrawerQuery] = useState("");
  const [expanded, setExpanded]   = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage]             = useState(1);
  const { add, items } = useCart();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "16", page: String(page) });
    if (search) params.set("search", search);
    if (selectedCat) params.set("category", selectedCat);
    if (lowWage) params.set("lowWage", "true");
    if (coin) params.set("coin", "true");
    if (express) params.set("express", "true");
    if (featured) params.set("featured", "true");
    if (discount) params.set("discount", "true");
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
  }, [search, selectedCat, sort, page, lowWage, coin, express, featured, discount]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /**
   * The top menu / footer link to `/products?category=…` and `/products?search=…`.
   * On a same-route navigation Next.js keeps this component mounted, so the
   * useState initialisers above never re-run — read the URL whenever it changes.
   * The ref guard makes sure we only react to a real URL change, so a category
   * picked from the tab row (which updates state only) is never overwritten.
   */
  const urlFilterKey = useRef<string | null>(null);
  useEffect(() => {
    const key = ["search", "category", "lowWage", "coin", "express", "featured", "discount"]
      .map(k => searchParams.get(k) ?? "")
      .join("\u0000");
    if (urlFilterKey.current === key) return;
    urlFilterKey.current = key;
    setSearch(searchParams.get("search") || "");
    setSelectedCat(searchParams.get("category") || "");
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(d => { if (d.success) setCategories(d.data); });
    fetch("/api/admin/settings").then(r => r.json()).then(d => { if (d.success) setSettings(d.data); });
  }, []);

  // Close the tree on Escape (drawer is dismissible with the X / backdrop too)
  useEffect(() => {
    if (!showFilter) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setShowFilter(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showFilter]);

  /** Type-ahead over the catalog — keeps 100+ categories navigable. */
  function matchCats(list: Category[], q: string): Category[] {
    const needle = q.trim().toLowerCase();
    if (!needle) return list;
    return list.filter(c =>
      c.name.toLowerCase().includes(needle) || (c.slug || "").toLowerCase().includes(needle)
    );
  }
  const drawerCats = matchCats(categories, drawerQuery);
  const TABS_VISIBLE_MAX = 8;

  /** Children keyed by parent id — the source for the tree. */
  const childMap = useMemo(() => {
    const m = new Map<string, Category[]>();
    for (const c of categories) {
      if (!c.parent_id) continue;
      const arr = m.get(c.parent_id);
      if (arr) arr.push(c);
      else m.set(c.parent_id, [c]);
    }
    return m;
  }, [categories]);

  /** Top-level rows; an orphan (missing parent) is promoted to the root. */
  const rootCats = useMemo(() => {
    const ids = new Set(categories.map(c => c.id));
    return categories.filter(c => !c.parent_id || !ids.has(c.parent_id));
  }, [categories]);

  /** Product count per category, rolled up over its sub-categories. */
  const catCounts = useMemo(() => {
    const own = new Map<string, number>();
    for (const c of categories) own.set(c.id, c.product_count ?? 0);
    const rolled = new Map(own);
    // Deepest first so a parent sums the already-rolled children.
    const depth = (id: string, guard = 0): number => {
      if (guard > 20) return 0;
      const c = categories.find(x => x.id === id);
      if (!c?.parent_id) return 0;
      return 1 + depth(c.parent_id, guard + 1);
    };
    const sorted = [...categories].sort((a, b) => depth(b.id) - depth(a.id));
    for (const c of sorted) {
      if (!c.parent_id) continue;
      rolled.set(c.parent_id, (rolled.get(c.parent_id) ?? 0) + (own.get(c.id) ?? 0));
    }
    return rolled;
  }, [categories]);

  // Open every ancestor of the active category so it stays visible.
  useEffect(() => {
    if (!selectedCat || categories.length === 0) return;
    const byId = new Map(categories.map(c => [c.id, c]));
    const active = byId.get(selectedCat) ?? categories.find(c => c.slug === selectedCat);
    if (!active?.parent_id) return;
    const next = new Set(expanded);
    let cursor: Category | undefined = active;
    let guard = 0;
    while (cursor?.parent_id && guard++ < 20) {
      next.add(cursor.parent_id);
      cursor = byId.get(cursor.parent_id);
    }
    setExpanded(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCat, categories]);

  const toggleCat = (id: string) =>
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const pickCat = (id: string, close?: () => void) => {
    setSelectedCat(id);
    setPage(1);
    close?.();
  };

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

  const activeCatName = coin
    ? "سکه و آبشده"
    : lowWage
    ? "محصولات کم اُجرت"
    : express
    ? "ارسال فوری"
    : featured
    ? "پیشنهادهای ویژه"
    : discount
    ? "تخفیف‌دار"
    : selectedCat
      ? categories.find(c => c.id === selectedCat || c.slug === selectedCat)?.name || "محصولات"
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

      {/* Category bar: quick tabs for a small catalog, otherwise a drawer trigger */}
      <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #f0f0f0" }}>
        <div
          className="cat-bar"
          style={{ maxWidth: 1280, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}
        >
          {/* One category UI only — the tree lives in the filter drawer */}
          {categories.length > 0 && categories.length > TABS_VISIBLE_MAX && (
            <button
              type="button"
              onClick={() => setShowFilter(true)}
              className="cat-filter-trigger"
              style={{
                display: "flex", alignItems: "center", gap: 8, border: "1px solid #e0e0e0",
                borderRadius: "10px", padding: "9px 14px", background: "#fff", fontSize: 13,
                color: "#333", cursor: "pointer", fontFamily: "inherit", minWidth: 230,
                justifyContent: "space-between",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <Tags size={14} color="#c8a12a" />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>
                  {activeCatName}
                </span>
              </span>
              <ChevronDown size={15} color="#999" style={{ transform: "rotate(90deg)", flexShrink: 0 }} />
            </button>
          )}

          {/* Quick tabs stay only while the catalog is small enough to scan */}
          {categories.length > 0 && categories.length <= TABS_VISIBLE_MAX && (
            <div className="cat-tabs" style={{ display: "flex", alignItems: "center", gap: 2, overflowX: "auto", scrollbarWidth: "none" }}>
              <style>{`.cat-tabs::-webkit-scrollbar{display:none}`}</style>
              {[{ id: "", name: "همه" }, ...categories].map(c => {
                const isActive = selectedCat === c.id || ("slug" in c && selectedCat === c.slug);
                return (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCat(c.id); setPage(1); }}
                    className="cat-tab"
                    style={{
                      flexShrink: 0, padding: "8px 14px", border: "none",
                      background: isActive ? "#fdf8ee" : "transparent",
                      color: isActive ? "#c8a12a" : "#555", fontSize: 13,
                      fontWeight: isActive ? 700 : 400, cursor: "pointer", fontFamily: "inherit",
                      whiteSpace: "nowrap", borderRadius: 8,
                    }}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Coin hero banner (plain, gradient-free) — only on the «سکه و آبشده» listing */}
      {coin && (
        <div style={{ background: "#fafafa", borderBottom: "1px solid #f0f0f0", padding: "30px 0" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", backgroundColor: "rgba(200,161,42,0.12)", border: "1px solid rgba(200,161,42,0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c8a12a", flexShrink: 0 }}>
              <Coins size={26} />
            </div>
            <div>
              <h1 style={{ color: "#c8a12a", fontSize: 20, fontWeight: 700, margin: 0 }}>سکه و آبشده</h1>
              <p style={{ color: "#888", fontSize: 12, margin: "5px 0 0" }}>خرید سکه و طلای آبشده بر اساس قیمت لحظه‌ای طلا</p>
            </div>
          </div>
        </div>
      )}

      <div className="products-body" style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 16px" }}>

        {/* ── Filter / sort bar ── */}
        <div className="filter-search-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", gap: "10px", flexWrap: "wrap" }}>
          {/* Right: count + filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => setShowFilter(true)}
              className="filter-open-btn"
              style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid #ddd", borderRadius: "7px", padding: "7px 14px", background: "#fff", fontSize: "13px", cursor: "pointer", color: "#555", fontFamily: "inherit", transition: "all 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#c8a12a"; (e.currentTarget as HTMLElement).style.color = "#c8a12a"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#ddd"; (e.currentTarget as HTMLElement).style.color = "#555"; }}>
              <SlidersHorizontal size={14} />
              {selectedCat ? `دسته: ${activeCatName}` : "فیلتر دسته‌بندی"} ({pagination.total.toLocaleString("fa-IR")} محصول)
            </button>
          </div>

          {/* Left: sort + search */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <Search size={13} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "#bbb" }} />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="جستجو..."
                className="filter-search-input"
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }} className="prod-grid prod-skeleton">
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
              const vid = firstMedia(p.videos);
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
                    <div className="prod-card-media" style={{ padding: "24px 16px 12px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "180px", position: "relative", backgroundColor: "#fff" }}>
                      <img src={img} alt={p.name}
                        style={{ maxWidth: "85%", maxHeight: "140px", objectFit: "contain", transition: "transform 0.35s ease", filter: oos ? "grayscale(1) opacity(0.4)" : "none" }}
                        onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = "scale(1.08)"}
                        onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"}
                      />
                      {vid && <ProductVideoPreview src={vid} fit="contain" />}
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
            <h4 style={{ color: "#c8a12a", fontSize: "13px", fontWeight: "700", marginBottom: "10px" }}>
              دسته‌بندی ({categories.length.toLocaleString("fa-IR")})
            </h4>

            {categories.length > 6 && (
              <div style={{ position: "relative", marginBottom: 10 }}>
                <Search size={13} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#bbb" }} />
                <input
                  value={drawerQuery}
                  onChange={e => setDrawerQuery(e.target.value)}
                  placeholder="جستجوی دسته‌بندی…"
                  style={{
                    width: "100%", boxSizing: "border-box", border: "1px solid #e5e5e5", borderRadius: 8,
                    padding: "9px 28px 9px 10px", fontSize: 12.5, outline: "none", fontFamily: "inherit",
                    color: "#333", background: "#fafafa",
                  }}
                />
              </div>
            )}

            <div style={{ maxHeight: "calc(100vh - 220px)", overflowY: "auto" }}>
              <button onClick={() => pickCat("", () => setShowFilter(false))}
                style={catOptionStyle(selectedCat === "")}>
                <FolderTree size={13} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>همه محصولات</span>
                {selectedCat === "" && <Check size={14} />}
              </button>

              {drawerQuery.trim() ? (
                drawerCats.map(c => {
                  const isActive = selectedCat === c.id || selectedCat === c.slug;
                  return (
                    <button key={c.id} onClick={() => pickCat(c.id, () => setShowFilter(false))}
                      style={catOptionStyle(isActive)}>
                      <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.name}
                        {c.parent_name && <span style={{ color: "#bbb", fontSize: 11 }}> · {c.parent_name}</span>}
                      </span>
                      {isActive && <Check size={14} />}
                    </button>
                  );
                })
              ) : (
                <CategoryTree
                  nodes={rootCats}
                  childMap={childMap}
                  counts={catCounts}
                  expanded={expanded}
                  selected={selectedCat}
                  onSelect={id => pickCat(id, () => setShowFilter(false))}
                  onToggle={toggleCat}
                />
              )}

              {drawerCats.length === 0 && !drawerQuery.trim() && (
                <p style={{ color: "#aaa", fontSize: 12, textAlign: "center", padding: "16px 0" }}>
                  دسته‌بندی یافت نشد
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer { 0%,100%{opacity:0.5} 50%{opacity:0.8} }
        @media(max-width:1100px){.prod-grid{grid-template-columns:repeat(3,1fr)!important}}
        @media(max-width:768px){
          .prod-grid{grid-template-columns:repeat(2,1fr)!important}
          .products-body{padding:16px 12px !important;}
          .cat-bar{padding:10px 12px !important;}
          .cat-filter-trigger{width:100% !important;min-width:0 !important;}
          .cat-tabs{width:100% !important;}
        }
        @media(max-width:480px){
          .prod-grid,.prod-skeleton{grid-template-columns:repeat(2,1fr)!important;gap:10px !important;}
          .filter-search-row{flex-direction:column !important;align-items:stretch !important;}
          .filter-search-row > div{width:100% !important;justify-content:space-between !important;}
          .filter-search-input{width:100% !important;}
          .filter-open-btn{width:100% !important;justify-content:center !important;font-size:12px !important;padding:8px 10px !important;}
          .prod-card-media{min-height:140px !important;padding:14px 10px 8px !important;}
        }
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
