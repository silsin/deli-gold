"use client";
import { useEffect, useState, useCallback } from "react";
import { Heart, Search, SlidersHorizontal, X, ChevronLeft } from "lucide-react";
import PageLayout from "../components/PageLayout";
import Link from "next/link";

interface Category { id: string; name: string; slug: string; }
interface Product {
  id: string; name: string; slug: string; price: number; weight: number;
  karat: number; stock: number; images: string; featured: number;
  category_name: string;
}

const sortOptions = [
  { value: "newest", label: "جدیدترین" },
  { value: "price_asc", label: "ارزان‌ترین" },
  { value: "price_desc", label: "گران‌ترین" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [sort, setSort] = useState("newest");
  const [liked, setLiked] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "12", page: String(page) });
    if (search) params.set("search", search);
    if (selectedCat) params.set("category", selectedCat);
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    if (data.success) {
      let rows: Product[] = data.data.products;
      if (sort === "price_asc") rows = [...rows].sort((a, b) => a.price - b.price);
      if (sort === "price_desc") rows = [...rows].sort((a, b) => b.price - a.price);
      setProducts(rows);
      setPagination(data.data.pagination);
    }
    setLoading(false);
  }, [search, selectedCat, sort, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(d => { if (d.success) setCategories(d.data); });
  }, []);

  function toggleLike(id: string) {
    setLiked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }

  const imgUrl = (images: string) => {
    try { const arr = JSON.parse(images); return arr[0] || null; } catch { return null; }
  };

  const goldImages = [
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80",
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80",
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80",
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80",
    "https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=400&q=80",
    "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&q=80",
  ];

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "12px 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#666" }}>
          <Link href="/" style={{ color: "#888", textDecoration: "none" }}>خانه</Link>
          <span>›</span>
          <span style={{ color: "#d4af37" }}>محصولات</span>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 16px", display: "flex", gap: 24 }}>
        {/* Sidebar Filter — desktop */}
        <aside style={{ width: 220, flexShrink: 0, display: "none" }} className="desktop-sidebar">
          <FilterPanel categories={categories} selected={selectedCat} onSelect={c => { setSelectedCat(c); setPage(1); }} />
        </aside>

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#888" }} />
              <input
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="جستجو در محصولات..."
                style={{ width: "100%", backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "9px 32px 9px 12px", color: "#fff", fontSize: 13, outline: "none" }}
              />
              {search && <button onClick={() => setSearch("")} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={14} /></button>}
            </div>

            {/* Sort */}
            <select value={sort} onChange={e => setSort(e.target.value)}
              style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "9px 12px", color: "#ccc", fontSize: 13, outline: "none", cursor: "pointer" }}>
              {sortOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            {/* Mobile filter toggle */}
            <button onClick={() => setShowFilter(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "9px 14px", color: "#ccc", fontSize: 13, cursor: "pointer" }}
              className="mobile-filter-btn">
              <SlidersHorizontal size={14} /> فیلتر
            </button>

            <p style={{ color: "#666", fontSize: 12, marginRight: "auto" }}>{pagination.total} محصول</p>
          </div>

          {/* Category chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            <button onClick={() => { setSelectedCat(""); setPage(1); }}
              style={{ backgroundColor: !selectedCat ? "#d4af37" : "#1a1a1a", color: !selectedCat ? "#000" : "#888", border: `1px solid ${!selectedCat ? "#d4af37" : "#2a2a2a"}`, borderRadius: 20, padding: "5px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              همه
            </button>
            {categories.map(c => (
              <button key={c.id} onClick={() => { setSelectedCat(c.id); setPage(1); }}
                style={{ backgroundColor: selectedCat === c.id ? "#d4af37" : "#1a1a1a", color: selectedCat === c.id ? "#000" : "#888", border: `1px solid ${selectedCat === c.id ? "#d4af37" : "#2a2a2a"}`, borderRadius: 20, padding: "5px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                {c.name}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ backgroundColor: "#1a1a1a", borderRadius: 10, height: 280, border: "1px solid #2a2a2a", opacity: 0.5 }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#555" }}>
              <Package />
              <p style={{ marginTop: 12 }}>محصولی یافت نشد</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
              {products.map((p, i) => {
                const image = imgUrl(p.images) || goldImages[i % goldImages.length];
                const isLiked = liked.includes(p.id);
                return (
                  <div key={p.id} style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, overflow: "hidden", transition: "border-color 0.2s, transform 0.2s", cursor: "pointer" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#d4af37"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
                    <Link href={`/products/${p.slug}`} style={{ textDecoration: "none", display: "block" }}>
                      <div style={{ position: "relative", paddingBottom: "100%", overflow: "hidden" }}>
                        <img src={image} alt={p.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                        {p.featured === 1 && (
                          <span style={{ position: "absolute", top: 8, right: 8, backgroundColor: "#d4af37", color: "#000", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>ویژه</span>
                        )}
                        {p.stock === 0 && (
                          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "#ef4444", fontSize: 12, fontWeight: 700 }}>ناموجود</span>
                          </div>
                        )}
                      </div>
                    </Link>
                    <div style={{ padding: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <Link href={`/products/${p.slug}`} style={{ textDecoration: "none" }}>
                          <h3 style={{ color: "#fff", fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{p.name}</h3>
                        </Link>
                        <button onClick={() => toggleLike(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: isLiked ? "#d4af37" : "#555", flexShrink: 0, padding: "0 0 0 4px" }}>
                          <Heart size={15} fill={isLiked ? "#d4af37" : "none"} />
                        </button>
                      </div>
                      <p style={{ color: "#666", fontSize: 11, marginBottom: 8 }}>{p.category_name} · {p.karat} عیار · {p.weight}گ</p>
                      <p style={{ color: "#d4af37", fontSize: 13, fontWeight: 700 }}>
                        {p.price.toLocaleString("fa-IR")} <span style={{ color: "#888", fontSize: 11, fontWeight: 400 }}>تومان</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
              {Array.from({ length: pagination.pages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${page === i + 1 ? "#d4af37" : "#2a2a2a"}`, backgroundColor: page === i + 1 ? "#d4af37" : "transparent", color: page === i + 1 ? "#000" : "#888", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilter && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200 }}>
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.7)" }} onClick={() => setShowFilter(false)} />
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 280, backgroundColor: "#111", borderLeft: "1px solid #2a2a2a", padding: 20, overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ color: "#fff", fontSize: 16 }}>فیلتر</h3>
              <button onClick={() => setShowFilter(false)} style={{ background: "none", border: "none", color: "#888", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <FilterPanel categories={categories} selected={selectedCat} onSelect={c => { setSelectedCat(c); setPage(1); setShowFilter(false); }} />
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-sidebar { display: block !important; }
          .mobile-filter-btn { display: none !important; }
        }
      `}</style>
    </PageLayout>
  );
}

function Package() {
  return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" style={{ margin: "0 auto", display: "block" }}><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
}

function FilterPanel({ categories, selected, onSelect }: { categories: Category[]; selected: string; onSelect: (id: string) => void; }) {
  return (
    <div>
      <h4 style={{ color: "#d4af37", fontSize: 13, fontWeight: 700, marginBottom: 12 }}>دسته‌بندی</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[{ id: "", name: "همه محصولات" }, ...categories].map(c => (
          <button key={c.id} onClick={() => onSelect(c.id)}
            style={{ textAlign: "right", background: "none", border: "none", borderRadius: 6, padding: "8px 10px", color: selected === c.id ? "#d4af37" : "#888", fontSize: 13, cursor: "pointer", fontFamily: "inherit", backgroundColor: selected === c.id ? "rgba(212,175,55,0.1)" : "transparent", borderLeft: selected === c.id ? "3px solid #d4af37" : "3px solid transparent" }}>
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
