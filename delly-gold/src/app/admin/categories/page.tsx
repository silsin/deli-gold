"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import AdminGuard from "../AdminGuard";

interface Category { id: string; name: string; slug: string; description: string | null; _count: { products: number }; }
const emptyForm = { name: "", slug: "", description: "" };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/categories");
    const data = await res.json();
    if (data.success) setCategories(data.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  function openCreate() { setEditId(null); setForm({ ...emptyForm }); setError(""); setShowModal(true); }
  function openEdit(c: Category) {
    setEditId(c.id);
    setForm({ name: c.name, slug: c.slug, description: c.description || "" });
    setError(""); setShowModal(true);
  }

  async function handleSave() {
    setSaving(true); setError("");
    try {
      const res = await fetch(editId ? `/api/categories/${editId}` : "/api/categories", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "خطا"); return; }
      setShowModal(false);
      fetchCategories();
    } catch { setError("خطای شبکه"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setDeleteId(null);
    fetchCategories();
  }

  return (
    <AdminGuard>
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: "700" }}>مدیریت دسته‌بندی‌ها</h2>
        <button onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#d4af37", color: "#000", border: "none", borderRadius: "6px", padding: "8px 16px", fontWeight: "700", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
          <Plus size={16} /> افزودن دسته‌بندی
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
        {loading ? <p style={{ color: "#555" }}>در حال بارگذاری...</p>
          : categories.length === 0 ? <p style={{ color: "#555" }}>دسته‌بندی‌ای ثبت نشده</p>
          : categories.map(c => (
            <div key={c.id} style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "10px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: "600" }}>{c.name}</h3>
                  <p style={{ color: "#666", fontSize: "11px", direction: "ltr" }}>{c.slug}</p>
                  {c.description && <p style={{ color: "#888", fontSize: "12px", marginTop: "6px" }}>{c.description}</p>}
                  <p style={{ color: "#d4af37", fontSize: "12px", marginTop: "8px" }}>{c._count.products} محصول</p>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => openEdit(c)} style={{ backgroundColor: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", color: "#d4af37", borderRadius: "6px", padding: "5px 8px", cursor: "pointer" }}><Pencil size={13} /></button>
                  <button onClick={() => setDeleteId(c.id)} style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: "6px", padding: "5px 8px", cursor: "pointer" }}><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", width: "100%", maxWidth: "440px" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #2a2a2a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: "600" }}>{editId ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی"}</h3>
              <button onClick={() => setShowModal(false)} style={{ color: "#888", background: "none", border: "none", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div style={{ padding: "24px" }}>
              {error && <div style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", padding: "10px", marginBottom: "12px", color: "#f87171", fontSize: "13px" }}>{error}</div>}
              {[{ key: "name", label: "نام" }, { key: "slug", label: "اسلاگ" }, { key: "description", label: "توضیحات" }].map(f => (
                <div key={f.key} style={{ marginBottom: "14px" }}>
                  <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "5px" }}>{f.label}</label>
                  <input value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: "100%", backgroundColor: "#121212", border: "1px solid #333", borderRadius: "6px", padding: "8px 12px", color: "#fff", fontSize: "13px", outline: "none", direction: f.key === "slug" ? "ltr" : "rtl" }} />
                </div>
              ))}
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={handleSave} disabled={saving} style={{ flex: 1, backgroundColor: "#d4af37", color: "#000", border: "none", borderRadius: "6px", padding: "10px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                  {saving ? "..." : "ذخیره"}
                </button>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, backgroundColor: "transparent", color: "#888", border: "1px solid #333", borderRadius: "6px", padding: "10px", cursor: "pointer", fontFamily: "inherit" }}>انصراف</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "24px", maxWidth: "320px", textAlign: "center" }}>
            <Trash2 size={28} color="#ef4444" style={{ margin: "0 auto 12px" }} />
            <p style={{ color: "#fff", marginBottom: "8px" }}>حذف دسته‌بندی؟</p>
            <p style={{ color: "#888", fontSize: "12px", marginBottom: "20px" }}>محصولات مرتبط بدون دسته‌بندی می‌مانند</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => handleDelete(deleteId)} style={{ flex: 1, backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", padding: "10px", cursor: "pointer", fontFamily: "inherit" }}>حذف</button>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, backgroundColor: "transparent", color: "#888", border: "1px solid #333", borderRadius: "6px", padding: "10px", cursor: "pointer", fontFamily: "inherit" }}>انصراف</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminGuard>
  );
}
