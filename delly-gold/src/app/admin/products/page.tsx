"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, X, Info } from "lucide-react";
import AdminGuard from "../AdminGuard";

interface Category { id: string; name: string; }
interface Product {
  id: string; name: string; slug: string; price: number; weight: number;
  karat: number; stock: number; featured: boolean; published: boolean;
  ajrat_override: number; ajrat_percent: number | null; ajrat_fixed: number | null;
  category: { name: string };
}
interface GlobalSettings { gold_markup_percent: string; gold_fixed_fee: string; }

const emptyForm = {
  name: "", slug: "", description: "", price: "", weight: "", karat: "18",
  stock: "0", categoryId: "", featured: false, published: true, images: "[]",
  ajrat_override: false, ajrat_percent: "", ajrat_fixed: "",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({ gold_markup_percent: "5", gold_fixed_fee: "0" });
  const [goldPrice, setGoldPrice] = useState(0);
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
    const url = search
      ? `/api/products?search=${encodeURIComponent(search)}&limit=50&adminMode=true`
      : "/api/products?limit=50&adminMode=true";
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) setProducts(data.data.products);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(d => { if (d.success) setCategories(d.data); });
    fetch("/api/admin/settings").then(r => r.json()).then(d => { if (d.success) setGlobalSettings(d.data); });
    fetch("/api/admin/gold-price").then(r => r.json()).then(d => { if (d.success) setGoldPrice(d.data.price); });
  }, []);

  function openCreate() {
    setEditId(null);
    setForm({ ...emptyForm });
    setError("");
    setShowModal(true);
  }

  function openEdit(p: Product) {
    setEditId(p.id);
    setForm({
      name: p.name, slug: p.slug, description: "",
      price: String(p.price), weight: String(p.weight),
      karat: String(p.karat), stock: String(p.stock),
      categoryId: p.category ? (categories.find(c => c.name === p.category.name)?.id || "") : "",
      featured: p.featured, published: p.published, images: "[]",
      ajrat_override: p.ajrat_override === 1,
      ajrat_percent: p.ajrat_percent !== null ? String(p.ajrat_percent) : "",
      ajrat_fixed: p.ajrat_fixed !== null ? String(p.ajrat_fixed) : "",
    });
    setError("");
    setShowModal(true);
  }

  // Live price preview calculation
  const weight = parseFloat(form.weight) || 0;
  const basePrice = parseFloat(form.price) || 0;

  // Effective اجرت: use override values if enabled, else global
  const effectiveMarkupPct = form.ajrat_override && form.ajrat_percent !== ""
    ? parseFloat(form.ajrat_percent) || 0
    : parseFloat(globalSettings.gold_markup_percent) || 0;
  const effectiveFixedFee = form.ajrat_override && form.ajrat_fixed !== ""
    ? parseFloat(form.ajrat_fixed) || 0
    : parseFloat(globalSettings.gold_fixed_fee) || 0;

  // Final price = base price per gram × weight × (1 + markup%) + fixed fee per gram × weight
  // If admin entered price already as total, just add اجرت on top
  const ajratAmount = Math.round(basePrice * (effectiveMarkupPct / 100) + effectiveFixedFee * weight);
  const finalPrice = basePrice + ajratAmount;

  async function handleSave() {
    setSaving(true); setError("");
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        weight: parseFloat(form.weight),
        karat: parseInt(form.karat),
        stock: parseInt(form.stock),
        images: [],
        ajrat_override: form.ajrat_override,
        ajrat_percent: form.ajrat_override && form.ajrat_percent !== "" ? parseFloat(form.ajrat_percent) : null,
        ajrat_fixed: form.ajrat_override && form.ajrat_fixed !== "" ? parseFloat(form.ajrat_fixed) : null,
      };
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

  const inp: React.CSSProperties = {
    width: "100%", backgroundColor: "#121212", border: "1px solid #333",
    borderRadius: "6px", padding: "8px 12px", color: "#fff",
    fontSize: "13px", outline: "none",
  };

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

        {/* Global اجرت indicator */}
        <div style={{ backgroundColor: "#161616", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
          <Info size={13} color="#d4af37" />
          <span style={{ color: "#888" }}>اجرت جهانی پیش‌فرض:</span>
          <span style={{ color: "#d4af37", fontWeight: "700" }}>{globalSettings.gold_markup_percent}%</span>
          <span style={{ color: "#555" }}>سود +</span>
          <span style={{ color: "#d4af37", fontWeight: "700" }}>{Number(globalSettings.gold_fixed_fee).toLocaleString("fa-IR")} تومان</span>
          <span style={{ color: "#555" }}>ثابت به هر گرم</span>
          <a href="/admin/settings" style={{ color: "#666", fontSize: "11px", marginRight: "auto", textDecoration: "none" }}>ویرایش تنظیمات ←</a>
        </div>

        {/* Table */}
        <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#161616" }}>
                  {["نام", "دسته‌بندی", "قیمت پایه", "اجرت", "قیمت نهایی", "وزن", "موجودی", "وضعیت", "عملیات"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", color: "#888", fontSize: "12px", textAlign: "right", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} style={{ padding: "32px", textAlign: "center", color: "#555" }}>در حال بارگذاری...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding: "32px", textAlign: "center", color: "#555" }}>محصولی یافت نشد</td></tr>
                ) : products.map(p => {
                  const gMarkup = parseFloat(globalSettings.gold_markup_percent) || 0;
                  const gFixed = parseFloat(globalSettings.gold_fixed_fee) || 0;
                  const usePct = p.ajrat_override === 1 && p.ajrat_percent !== null ? p.ajrat_percent : gMarkup;
                  const useFixed = p.ajrat_override === 1 && p.ajrat_fixed !== null ? p.ajrat_fixed : gFixed;
                  const ajrat = Math.round(p.price * (usePct / 100) + useFixed * p.weight);
                  const final = p.price + ajrat;
                  return (
                    <tr key={p.id} style={{ borderTop: "1px solid #222" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <p style={{ color: "#fff", fontSize: "13px" }}>{p.name}</p>
                        <p style={{ color: "#555", fontSize: "11px" }}>{p.slug}</p>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#888", fontSize: "12px" }}>{p.category?.name || "—"}</td>
                      <td style={{ padding: "12px 16px", color: "#aaa", fontSize: "12px", whiteSpace: "nowrap" }}>{p.price.toLocaleString("fa-IR")} ت</td>
                      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                        {p.ajrat_override === 1
                          ? <span style={{ color: "#f59e0b", fontSize: "11px", backgroundColor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "4px", padding: "2px 6px" }}>اختصاصی</span>
                          : <span style={{ color: "#888", fontSize: "11px" }}>جهانی</span>
                        }
                        <p style={{ color: "#d4af37", fontSize: "11px", marginTop: "2px" }}>+{ajrat.toLocaleString("fa-IR")}</p>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#d4af37", fontSize: "13px", fontWeight: "700", whiteSpace: "nowrap" }}>{final.toLocaleString("fa-IR")} ت</td>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Product Modal ── */}
        {showModal && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
            <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", width: "100%", maxWidth: "600px", maxHeight: "92vh", overflowY: "auto" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, backgroundColor: "#1a1a1a", zIndex: 1 }}>
                <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: "700" }}>{editId ? "ویرایش محصول" : "افزودن محصول"}</h3>
                <button onClick={() => setShowModal(false)} style={{ color: "#888", background: "none", border: "none", cursor: "pointer" }}><X size={18} /></button>
              </div>

              <div style={{ padding: "24px" }}>
                {error && <div style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", padding: "10px", marginBottom: "16px", color: "#f87171", fontSize: "13px" }}>{error}</div>}

                {/* ── Basic info ── */}
                <p style={{ color: "#d4af37", fontSize: "11px", fontWeight: "700", letterSpacing: "1px", marginBottom: "12px", textTransform: "uppercase" }}>اطلاعات پایه</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "4px" }}>نام محصول *</label>
                    <input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: f.slug || autoSlug(e.target.value) }))} />
                  </div>
                  <div>
                    <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "4px" }}>اسلاگ (URL) *</label>
                    <input style={{ ...inp, direction: "ltr" }} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
                  </div>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "4px" }}>توضیحات</label>
                  <input style={inp} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "4px" }}>وزن (گرم) *</label>
                    <input type="number" style={inp} value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} min="0" step="0.01" />
                  </div>
                  <div>
                    <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "4px" }}>عیار</label>
                    <input type="number" style={inp} value={form.karat} onChange={e => setForm(f => ({ ...f, karat: e.target.value }))} min="1" max="24" />
                  </div>
                  <div>
                    <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "4px" }}>موجودی</label>
                    <input type="number" style={inp} value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} min="0" />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "4px" }}>دسته‌بندی *</label>
                    <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} style={inp}>
                      <option value="">انتخاب کنید</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "20px" }}>
                    {[{ key: "featured", label: "محصول ویژه" }, { key: "published", label: "منتشر شده" }].map(t => (
                      <label key={t.key} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#ccc", fontSize: "13px" }}>
                        <input type="checkbox" checked={(form as Record<string, unknown>)[t.key] as boolean} onChange={e => setForm(f => ({ ...f, [t.key]: e.target.checked }))} />
                        {t.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* ── قیمت‌گذاری ── */}
                <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: "20px", marginBottom: "20px" }}>
                  <p style={{ color: "#d4af37", fontSize: "11px", fontWeight: "700", letterSpacing: "1px", marginBottom: "14px", textTransform: "uppercase" }}>قیمت‌گذاری و اجرت</p>

                  {/* Base price */}
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "4px" }}>
                      قیمت پایه (تومان) *
                      <span style={{ color: "#555", fontSize: "11px", marginRight: "6px" }}>— قیمت مواد خام بدون اجرت</span>
                    </label>
                    <input type="number" style={{ ...inp, direction: "ltr" }} value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))} min="0" step="1000" placeholder="مثلاً 2500000" />
                  </div>

                  {/* اجرت toggle */}
                  <div style={{ backgroundColor: "#121212", border: "1px solid #2a2a2a", borderRadius: "10px", padding: "14px 16px", marginBottom: "14px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: form.ajrat_override ? "14px" : "0" }}>
                      <div
                        onClick={() => setForm(f => ({ ...f, ajrat_override: !f.ajrat_override }))}
                        style={{
                          width: "36px", height: "20px", borderRadius: "10px", flexShrink: 0,
                          backgroundColor: form.ajrat_override ? "#d4af37" : "#333",
                          position: "relative", cursor: "pointer", transition: "background-color 0.2s",
                        }}>
                        <div style={{
                          position: "absolute", top: "3px",
                          left: form.ajrat_override ? "19px" : "3px",
                          width: "14px", height: "14px", borderRadius: "50%",
                          backgroundColor: "#fff", transition: "left 0.2s",
                        }} />
                      </div>
                      <div>
                        <p style={{ color: "#fff", fontSize: "13px", fontWeight: "600" }}>اجرت اختصاصی برای این محصول</p>
                        <p style={{ color: "#666", fontSize: "11px" }}>
                          {form.ajrat_override
                            ? "مقادیر زیر جایگزین تنظیمات جهانی می‌شوند"
                            : `از اجرت جهانی استفاده می‌شود: ${globalSettings.gold_markup_percent}% + ${Number(globalSettings.gold_fixed_fee).toLocaleString("fa-IR")} ت/گرم`
                          }
                        </p>
                      </div>
                    </label>

                    {form.ajrat_override && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                          <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "4px" }}>
                            درصد سود اجرت (%)
                          </label>
                          <div style={{ position: "relative" }}>
                            <input type="number" style={{ ...inp, direction: "ltr", paddingLeft: "28px" }}
                              value={form.ajrat_percent}
                              onChange={e => setForm(f => ({ ...f, ajrat_percent: e.target.value }))}
                              min="0" max="100" step="0.5" placeholder={globalSettings.gold_markup_percent} />
                            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#666", fontSize: "12px" }}>%</span>
                          </div>
                        </div>
                        <div>
                          <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "4px" }}>
                            اجرت ثابت (تومان/گرم)
                          </label>
                          <input type="number" style={{ ...inp, direction: "ltr" }}
                            value={form.ajrat_fixed}
                            onChange={e => setForm(f => ({ ...f, ajrat_fixed: e.target.value }))}
                            min="0" step="1000" placeholder={globalSettings.gold_fixed_fee} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Live price preview */}
                  {basePrice > 0 && (
                    <div style={{ backgroundColor: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "10px", padding: "14px 16px" }}>
                      <p style={{ color: "#888", fontSize: "11px", marginBottom: "10px", fontWeight: "600" }}>پیش‌نمایش قیمت نهایی</p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                        {[
                          { label: "قیمت پایه", value: basePrice },
                          { label: "اجرت محاسبه‌شده", value: ajratAmount, highlight: false, sub: form.ajrat_override ? "اختصاصی" : "جهانی" },
                          { label: "قیمت نهایی", value: finalPrice, highlight: true },
                        ].map(item => (
                          <div key={item.label} style={{ backgroundColor: item.highlight ? "rgba(212,175,55,0.12)" : "#121212", border: `1px solid ${item.highlight ? "rgba(212,175,55,0.3)" : "#222"}`, borderRadius: "8px", padding: "10px 12px", textAlign: "center" }}>
                            <p style={{ color: "#666", fontSize: "10px", marginBottom: "4px" }}>{item.label}</p>
                            {("sub" in item && item.sub) && <p style={{ color: "#555", fontSize: "9px", marginBottom: "2px" }}>{item.sub}</p>}
                            <p style={{ color: item.highlight ? "#d4af37" : "#fff", fontSize: "13px", fontWeight: "700" }}>
                              {item.value.toLocaleString("fa-IR")}
                              <span style={{ color: "#555", fontSize: "10px", marginRight: "3px" }}>ت</span>
                            </p>
                          </div>
                        ))}
                      </div>
                      {goldPrice > 0 && weight > 0 && (
                        <p style={{ color: "#555", fontSize: "10px", marginTop: "8px", textAlign: "center" }}>
                          قیمت طلای ۱۸ عیار امروز: {goldPrice.toLocaleString("fa-IR")} ت/گرم
                          {" · "}مبنای محاسبه اجرت: {weight}گ × {effectiveMarkupPct}% + {effectiveFixedFee.toLocaleString("fa-IR")} ت/گرم
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={handleSave} disabled={saving}
                    style={{ flex: 1, backgroundColor: saving ? "#a08020" : "#d4af37", color: "#000", border: "none", borderRadius: "6px", padding: "11px", fontWeight: "700", fontSize: "14px", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                    {saving ? "در حال ذخیره..." : "ذخیره محصول"}
                  </button>
                  <button onClick={() => setShowModal(false)}
                    style={{ flex: 1, backgroundColor: "transparent", color: "#888", border: "1px solid #333", borderRadius: "6px", padding: "11px", cursor: "pointer", fontFamily: "inherit" }}>
                    انصراف
                  </button>
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
