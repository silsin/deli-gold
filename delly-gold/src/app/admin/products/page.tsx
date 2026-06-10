"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import AdminGuard from "../AdminGuard";

interface Category { id: string; name: string; }
interface Product {
  id: string; name: string; slug: string; price: number; weight: number;
  karat: number; stock: number; featured: boolean; published: boolean;
  category: { name: string };
}

const emptyForm = { name: "", slug: "", description: "", price: "", weight: "", karat: "18", stock: "0", categoryId: "", featured: false, published: true, images: "[]" };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const url = search ? `/api/products?search=${encodeURIComponent(search)}&limit=50` : "/api/products?limit=50";
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) setProducts(data.data.products);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(d => { if (d.success) setCategories(d.data); });
  }, []);

  function openCreate() { setEditId(null); setForm({ ...emptyForm }); setError(""); setShowModal(true); }
  function openEdit(p: Product) {
    setEditId(p.id);
    setForm({ name: p.name, slug: p.slug, description: "", price: String(p.price), weight: String(p.weight), karat: String(p.karat), stock: String(p.stock), categoryId: p.category ? (categories.find(c => c.name === p.category.name)?.id || "") : "", featured: p.featured, published: p.published, images: "[]" });
    setError(""); setShowModal(true);
  }

  async function handleSave() {
    setSaving(true); setError("");
    try {
      const payload = { ...form, price: parseFloat(form.price), weight: parseFloat(form.weight), karat: parseInt(form.karat), stock: parseInt(form.stock), images: [] };
      const res = await fetch(editId ? `/api/products/${editId}` : "/api/products", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "خطا"); return; }
      setShowModal(false);
      fetchProducts();
    } catch { setError("خطای شبکه"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setDeleteId(null);
    fetchProducts();
  }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  return (
    <AdminGuard>
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: "700" }}>مدیریت محصولات</h2>
        <button onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#d4af37", color: "#000", border: "none", borderRadius: "6px", padding: "8px 16px", fontWeight: "700", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
          <Plus size={16} /> افزودن محصول
        </button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "16px", maxWidth: "360px" }}>
        <Search size={15} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجو..." style={{ width: "100%", backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "6px", padding: "8px 36px 8px 12px", color: "#fff", fontSize: "13px", outline: "none" }} />
      </div>

      {/* Table */}
      <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "10px", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#161616" }}>
                {["نام", "دسته‌بندی", "قیمت", "وزن", "موجودی", "وضعیت", "عملیات"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", color: "#888", fontSize: "12px", textAlign: "right", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "#555" }}>در حال بارگذاری...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "#555" }}>محصولی یافت نشد</td></tr>
              ) : products.map(p => (
                <tr key={p.id} style={{ borderTop: "1px solid #222" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <p style={{ color: "#fff", fontSize: "13px" }}>{p.name}</p>
                    <p style={{ color: "#555", fontSize: "11px" }}>{p.slug}</p>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#888", fontSize: "12px" }}>{p.category?.name || "—"}</td>
                  <td style={{ padding: "12px 16px", color: "#d4af37", fontSize: "13px", whiteSpace: "nowrap" }}>{p.price.toLocaleString("fa-IR")} ت</td>
                  <td style={{ padding: "12px 16px", color: "#888", fontSize: "12px" }}>{p.weight}گ / {p.karat}ع</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ color: p.stock > 0 ? "#10b981" : "#ef4444", fontSize: "13px", fontWeight: "600" }}>{p.stock}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ backgroundColor: p.published ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", color: p.published ? "#10b981" : "#ef4444", padding: "3px 8px", borderRadius: "20px", fontSize: "11px" }}>
                      {p.published ? "منتشر" : "پنهان"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => openEdit(p)} style={{ backgroundColor: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", color: "#d4af37", borderRadius: "6px", padding: "5px 8px", cursor: "pointer" }}><Pencil size={13} /></button>
                      <button onClick={() => setDeleteId(p.id)} style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: "6px", padding: "5px 8px", cursor: "pointer" }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: "600" }}>{editId ? "ویرایش محصول" : "افزودن محصول"}</h3>
              <button onClick={() => setShowModal(false)} style={{ color: "#888", background: "none", border: "none", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div style={{ padding: "24px" }}>
              {error && <div style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", padding: "10px", marginBottom: "16px", color: "#f87171", fontSize: "13px" }}>{error}</div>}

              {[
                { label: "نام محصول", key: "name", type: "text", onChange: (v: string) => { setForm(f => ({ ...f, name: v, slug: f.slug || autoSlug(v) })); } },
                { label: "اسلاگ (URL)", key: "slug", type: "text" },
                { label: "توضیحات", key: "description", type: "text" },
                { label: "قیمت (تومان)", key: "price", type: "number" },
                { label: "وزن (گرم)", key: "weight", type: "number" },
                { label: "عیار", key: "karat", type: "number" },
                { label: "موجودی", key: "stock", type: "number" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: "14px" }}>
                  <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "5px" }}>{f.label}</label>
                  <input
                    type={f.type}
                    value={(form as Record<string, unknown>)[f.key] as string}
                    onChange={e => f.onChange ? f.onChange(e.target.value) : setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={{ width: "100%", backgroundColor: "#121212", border: "1px solid #333", borderRadius: "6px", padding: "8px 12px", color: "#fff", fontSize: "13px", outline: "none", direction: f.key === "slug" ? "ltr" : "rtl" }}
                  />
                </div>
              ))}

              {/* Category */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "5px" }}>دسته‌بندی</label>
                <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  style={{ width: "100%", backgroundColor: "#121212", border: "1px solid #333", borderRadius: "6px", padding: "8px 12px", color: "#fff", fontSize: "13px", outline: "none" }}>
                  <option value="">انتخاب کنید</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Toggles */}
              <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                {[{ key: "featured", label: "ویژه" }, { key: "published", label: "منتشر شده" }].map(t => (
                  <label key={t.key} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#ccc", fontSize: "13px" }}>
                    <input type="checkbox" checked={(form as Record<string, unknown>)[t.key] as boolean} onChange={e => setForm(f => ({ ...f, [t.key]: e.target.checked }))} />
                    {t.label}
                  </label>
                ))}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={handleSave} disabled={saving} style={{ flex: 1, backgroundColor: "#d4af37", color: "#000", border: "none", borderRadius: "6px", padding: "10px", fontWeight: "700", fontSize: "14px", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                  {saving ? "در حال ذخیره..." : "ذخیره"}
                </button>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, backgroundColor: "transparent", color: "#888", border: "1px solid #333", borderRadius: "6px", padding: "10px", cursor: "pointer", fontFamily: "inherit" }}>انصراف</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "24px", maxWidth: "360px", width: "100%", textAlign: "center" }}>
            <Trash2 size={32} color="#ef4444" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ color: "#fff", fontSize: "16px", marginBottom: "8px" }}>حذف محصول</h3>
            <p style={{ color: "#888", fontSize: "13px", marginBottom: "20px" }}>آیا مطمئن هستید؟ این عمل قابل بازگشت نیست.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => handleDelete(deleteId)} style={{ flex: 1, backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", padding: "10px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>حذف</button>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, backgroundColor: "transparent", color: "#888", border: "1px solid #333", borderRadius: "6px", padding: "10px", cursor: "pointer", fontFamily: "inherit" }}>انصراف</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminGuard>
  );
}
