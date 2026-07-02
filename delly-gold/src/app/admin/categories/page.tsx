"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, Pencil, Trash2, X, Upload } from "lucide-react";
import AdminGuard from "../AdminGuard";

interface Category { id: string; name: string; slug: string; description: string | null; _count: { products: number }; banner_image?: string; image?: string; }

const emptyForm = { name: "", slug: "", description: "", banner_image: "" };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editId, setEditId]         = useState<string | null>(null);
  const [form, setForm]             = useState({ ...emptyForm });
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [uploading, setUploading]   = useState(false);
  const fileRef                     = useRef<HTMLInputElement>(null);

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
    setForm({ name: c.name, slug: c.slug, description: c.description || "", banner_image: c.banner_image || c.image || "" });
    setError(""); setShowModal(true);
  }

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res  = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) setForm(f => ({ ...f, banner_image: data.data.url }));
      else setError(data.error || "خطا در آپلود");
    } catch { setError("خطای شبکه در آپلود"); }
    finally { setUploading(false); }
  }

  async function handleSave() {
    setSaving(true); setError("");
    try {
      const res = await fetch(editId ? `/api/categories/${editId}` : "/api/categories", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, image: form.banner_image }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "خطا"); return; }
      setShowModal(false); fetchCategories();
    } catch { setError("خطای شبکه"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setDeleteId(null); fetchCategories();
  }

  const inp: React.CSSProperties = { width: "100%", backgroundColor: "#121212", border: "1px solid #333", borderRadius: "6px", padding: "8px 12px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit" };

  return (
    <AdminGuard>
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: "700" }}>مدیریت دسته‌بندی‌ها</h2>
          <button onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#d4af37", color: "#000", border: "none", borderRadius: "6px", padding: "8px 16px", fontWeight: "700", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
            <Plus size={16}/> افزودن دسته‌بندی
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "12px" }}>
          {loading ? <p style={{ color: "#555" }}>در حال بارگذاری...</p>
            : categories.length === 0 ? <p style={{ color: "#555" }}>دسته‌بندی‌ای ثبت نشده</p>
            : categories.map(c => (
              <div key={c.id} style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "10px", overflow: "hidden" }}>
                {/* Image */}
                {(c.banner_image || c.image) ? (
                  <div style={{ height: "120px", backgroundImage: `url(${c.banner_image || c.image})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }} />
                  </div>
                ) : (
                  <div style={{ height: "80px", backgroundColor: "#121212", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#444", fontSize: "12px" }}>بدون تصویر</span>
                  </div>
                )}
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: "600", marginBottom: "2px" }}>{c.name}</h3>
                      <p style={{ color: "#666", fontSize: "11px", direction: "ltr" }}>{c.slug}</p>
                      {c.description && <p style={{ color: "#888", fontSize: "12px", marginTop: "6px" }}>{c.description}</p>}
                      <p style={{ color: "#d4af37", fontSize: "12px", marginTop: "8px" }}>{c._count.products} محصول</p>
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexShrink: 0, marginRight: "10px" }}>
                      <button onClick={() => openEdit(c)} style={{ backgroundColor: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", color: "#d4af37", borderRadius: "6px", padding: "5px 8px", cursor: "pointer" }}><Pencil size={13}/></button>
                      <button onClick={() => setDeleteId(c.id)} style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: "6px", padding: "5px 8px", cursor: "pointer" }}><Trash2 size={13}/></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {showModal && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
            <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", width: "100%", maxWidth: "480px" }}>
              <div style={{ padding: "18px 22px", borderBottom: "1px solid #2a2a2a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: "600" }}>{editId ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی"}</h3>
                <button onClick={() => setShowModal(false)} style={{ color: "#888", background: "none", border: "none", cursor: "pointer" }}><X size={18}/></button>
              </div>
              <div style={{ padding: "22px" }}>
                {error && <div style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", padding: "10px", marginBottom: "14px", color: "#f87171", fontSize: "13px" }}>{error}</div>}

                {/* Image upload */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "7px" }}>تصویر دسته‌بندی</label>
                  <input ref={fileRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} style={{ display: "none" }} />
                  {form.banner_image ? (
                    <div style={{ position: "relative", marginBottom: "8px" }}>
                      <img src={form.banner_image} alt="" style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "7px", border: "1px solid #333" }} />
                      <button onClick={() => setForm(f => ({ ...f, banner_image: "" }))}
                        style={{ position: "absolute", top: "6px", right: "6px", backgroundColor: "rgba(239,68,68,0.9)", border: "none", borderRadius: "50%", width: "22px", height: "22px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <X size={12}/>
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => fileRef.current?.click()} disabled={uploading}
                      style={{ width: "100%", height: "80px", backgroundColor: "#121212", border: "2px dashed #333", borderRadius: "7px", color: "#666", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "inherit" }}>
                      <Upload size={18} color="#555"/>
                      <span style={{ fontSize: "12px" }}>{uploading ? "در حال آپلود..." : "آپلود تصویر دسته‌بندی"}</span>
                    </button>
                  )}
                  <input style={{ ...inp, marginTop: "6px" }} placeholder="یا URL تصویر را وارد کنید"
                    value={form.banner_image} onChange={e => setForm(f => ({ ...f, banner_image: e.target.value }))} />
                </div>

                {[{ k: "name", l: "نام" }, { k: "slug", l: "اسلاگ" }, { k: "description", l: "توضیحات" }].map(f => (
                  <div key={f.k} style={{ marginBottom: "14px" }}>
                    <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "5px" }}>{f.l}</label>
                    <input value={(form as Record<string, string>)[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                      style={{ ...inp, direction: f.k === "slug" ? "ltr" : "rtl" }} />
                  </div>
                ))}

                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={handleSave} disabled={saving || uploading}
                    style={{ flex: 1, backgroundColor: saving ? "#a08020" : "#d4af37", color: "#000", border: "none", borderRadius: "6px", padding: "10px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                    {saving ? "در حال ذخیره..." : "ذخیره"}
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
