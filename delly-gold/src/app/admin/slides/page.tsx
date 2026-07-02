"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, Pencil, Trash2, X, Upload, GripVertical, Eye, EyeOff } from "lucide-react";
import AdminGuard from "../AdminGuard";

interface Slide {
  id: string; sort_order: number; tag: string;
  title1: string; title2: string; title3: string;
  subtitle: string; cta_label: string; cta_href: string;
  cta2_label: string; cta2_href: string;
  image: string; bg_color: string; accent: string; active: number;
}

const emptyForm: Omit<Slide, "id" | "sort_order"> & { sort_order: string } = {
  tag: "DELLY GOLD · NEW COLLECTION",
  title1: "", title2: "", title3: "",
  subtitle: "",
  cta_label: "مشاهده محصولات", cta_href: "/products",
  cta2_label: "خرید اقساطی",   cta2_href: "/contact",
  image: "", bg_color: "#f2ebe0", accent: "#c8a12a",
  active: 1, sort_order: "0",
};

export default function AdminSlidesPage() {
  const [slides, setSlides]     = useState<Slide[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]     = useState<string | null>(null);
  const [form, setForm]         = useState({ ...emptyForm });
  const [saving, setSaving]     = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError]       = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef                 = useRef<HTMLInputElement>(null);

  const fetchSlides = useCallback(async () => {
    setLoading(true);
    const res  = await fetch("/api/admin/slides");
    const data = await res.json();
    if (data.success) setSlides(data.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSlides(); }, [fetchSlides]);

  function openCreate() {
    setEditId(null);
    setForm({ ...emptyForm });
    setError("");
    setShowModal(true);
  }

  function openEdit(s: Slide) {
    setEditId(s.id);
    setForm({
      tag: s.tag, title1: s.title1, title2: s.title2, title3: s.title3,
      subtitle: s.subtitle, cta_label: s.cta_label, cta_href: s.cta_href,
      cta2_label: s.cta2_label, cta2_href: s.cta2_href,
      image: s.image, bg_color: s.bg_color, accent: s.accent,
      active: s.active, sort_order: String(s.sort_order),
    });
    setError("");
    setShowModal(true);
  }

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) setForm(f => ({ ...f, image: data.data.url }));
      else setError(data.error || "خطا در آپلود");
    } catch { setError("خطای شبکه در آپلود"); }
    finally { setUploading(false); }
  }

  async function handleSave() {
    if (!form.image.trim()) { setError("تصویر اسلاید الزامی است"); return; }
    setSaving(true); setError("");
    try {
      const payload = { ...form, sort_order: parseInt(form.sort_order) || 0 };
      const res  = await fetch(
        editId ? `/api/admin/slides/${editId}` : "/api/admin/slides",
        { method: editId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
      );
      const data = await res.json();
      if (!res.ok) { setError(data.error || "خطا"); return; }
      setShowModal(false);
      fetchSlides();
    } catch { setError("خطای شبکه"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/slides/${id}`, { method: "DELETE" });
    setDeleteId(null);
    fetchSlides();
  }

  async function toggleActive(s: Slide) {
    await fetch(`/api/admin/slides/${s.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: s.active === 1 ? 0 : 1 }),
    });
    fetchSlides();
  }

  const inp: React.CSSProperties = {
    width: "100%", backgroundColor: "#121212", border: "1px solid #333",
    borderRadius: "6px", padding: "8px 12px", color: "#fff",
    fontSize: "13px", outline: "none", fontFamily: "inherit",
  };

  return (
    <AdminGuard>
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: "700" }}>مدیریت اسلایدر</h2>
            <p style={{ color: "#666", fontSize: "12px", marginTop: "4px" }}>اسلایدهای صفحه اصلی را مدیریت کنید</p>
          </div>
          <button onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#d4af37", color: "#000", border: "none", borderRadius: "6px", padding: "8px 16px", fontWeight: "700", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
            <Plus size={16} /> اسلاید جدید
          </button>
        </div>

        {loading ? (
          <p style={{ color: "#555" }}>در حال بارگذاری...</p>
        ) : slides.length === 0 ? (
          <div style={{ backgroundColor: "#1a1a1a", border: "2px dashed #2a2a2a", borderRadius: "12px", padding: "48px", textAlign: "center" }}>
            <p style={{ color: "#555", marginBottom: "16px" }}>هیچ اسلایدی ثبت نشده</p>
            <button onClick={openCreate} style={{ backgroundColor: "#d4af37", color: "#000", border: "none", borderRadius: "6px", padding: "8px 20px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>
              اولین اسلاید را بسازید
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {slides.map(s => (
              <div key={s.id} style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "10px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px" }}>
                <GripVertical size={16} color="#444" style={{ flexShrink: 0, cursor: "grab" }} />

                {/* Preview image */}
                <div style={{ width: "80px", height: "50px", borderRadius: "6px", overflow: "hidden", flexShrink: 0, backgroundColor: s.bg_color }}>
                  {s.image ? (
                    <img src={s.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: "10px" }}>بدون تصویر</div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                    <p style={{ color: "#fff", fontSize: "13px", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {[s.title1, s.title2, s.title3].filter(Boolean).join(" / ")}
                    </p>
                    <span style={{ backgroundColor: s.active ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", color: s.active ? "#10b981" : "#ef4444", fontSize: "10px", fontWeight: "600", padding: "2px 7px", borderRadius: "10px", flexShrink: 0 }}>
                      {s.active ? "فعال" : "غیرفعال"}
                    </span>
                  </div>
                  <p style={{ color: "#666", fontSize: "11px" }}>{s.subtitle}</p>
                  <p style={{ color: "#555", fontSize: "10px", marginTop: "2px", direction: "ltr" }}>
                    CTA: {s.cta_label} → {s.cta_href}
                  </p>
                </div>

                {/* Sort order */}
                <span style={{ color: "#555", fontSize: "11px", flexShrink: 0 }}>ترتیب: {s.sort_order}</span>

                {/* Actions */}
                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  <button onClick={() => toggleActive(s)} title={s.active ? "غیرفعال کن" : "فعال کن"}
                    style={{ backgroundColor: s.active ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", border: `1px solid ${s.active ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`, color: s.active ? "#ef4444" : "#10b981", borderRadius: "6px", padding: "5px 8px", cursor: "pointer" }}>
                    {s.active ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button onClick={() => openEdit(s)} style={{ backgroundColor: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", color: "#d4af37", borderRadius: "6px", padding: "5px 8px", cursor: "pointer" }}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setDeleteId(s.id)} style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: "6px", padding: "5px 8px", cursor: "pointer" }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }}>
            <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", width: "100%", maxWidth: "640px", maxHeight: "92vh", overflowY: "auto" }}>
              <div style={{ padding: "18px 24px", borderBottom: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, backgroundColor: "#1a1a1a", zIndex: 1 }}>
                <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: "700" }}>{editId ? "ویرایش اسلاید" : "اسلاید جدید"}</h3>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#888", cursor: "pointer" }}><X size={18} /></button>
              </div>

              <div style={{ padding: "22px" }}>
                {error && <div style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", padding: "10px", marginBottom: "14px", color: "#f87171", fontSize: "13px" }}>{error}</div>}

                {/* Image upload */}
                <div style={{ marginBottom: "18px" }}>
                  <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "8px", fontWeight: "600" }}>تصویر اسلاید *</label>
                  <input ref={fileRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} style={{ display: "none" }} />

                  {form.image ? (
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <img src={form.image} alt="" style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "8px", border: "1px solid #333", display: "block" }} />
                      <button onClick={() => setForm(f => ({ ...f, image: "" }))}
                        style={{ position: "absolute", top: "6px", right: "6px", backgroundColor: "rgba(239,68,68,0.9)", border: "none", borderRadius: "50%", width: "22px", height: "22px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => fileRef.current?.click()} disabled={uploading}
                      style={{ width: "100%", height: "120px", backgroundColor: "#121212", border: "2px dashed #333", borderRadius: "8px", color: "#666", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "inherit" }}>
                      <Upload size={24} color="#555" />
                      <span style={{ fontSize: "13px" }}>{uploading ? "در حال آپلود..." : "کلیک کنید یا تصویر را بکشید"}</span>
                    </button>
                  )}

                  {/* Or paste URL */}
                  <input style={{ ...inp, marginTop: "8px" }} placeholder="یا آدرس URL تصویر را وارد کنید"
                    value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} />
                </div>

                {/* Titles */}
                <p style={{ color: "#d4af37", fontSize: "11px", fontWeight: "700", letterSpacing: "1px", marginBottom: "10px" }}>عنوان‌ها</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                  {["title1", "title2", "title3"].map((key, i) => (
                    <div key={key}>
                      <label style={{ color: "#888", fontSize: "11px", display: "block", marginBottom: "4px" }}>خط {i + 1} {i === 1 && <span style={{ color: "#d4af37" }}>(طلایی)</span>}</label>
                      <input style={inp} value={(form as Record<string, unknown>)[key] as string}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ color: "#888", fontSize: "11px", display: "block", marginBottom: "4px" }}>زیرعنوان</label>
                  <input style={inp} value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} />
                </div>

                {/* Tag */}
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ color: "#888", fontSize: "11px", display: "block", marginBottom: "4px" }}>تگ (انگلیسی)</label>
                  <input style={{ ...inp, direction: "ltr" }} value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} />
                </div>

                {/* CTAs */}
                <p style={{ color: "#d4af37", fontSize: "11px", fontWeight: "700", letterSpacing: "1px", marginBottom: "10px" }}>دکمه‌ها</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ color: "#888", fontSize: "11px", display: "block", marginBottom: "4px" }}>متن دکمه اول</label>
                    <input style={inp} value={form.cta_label} onChange={e => setForm(f => ({ ...f, cta_label: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ color: "#888", fontSize: "11px", display: "block", marginBottom: "4px" }}>لینک دکمه اول</label>
                    <input style={{ ...inp, direction: "ltr" }} value={form.cta_href} onChange={e => setForm(f => ({ ...f, cta_href: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ color: "#888", fontSize: "11px", display: "block", marginBottom: "4px" }}>متن دکمه دوم</label>
                    <input style={inp} value={form.cta2_label} onChange={e => setForm(f => ({ ...f, cta2_label: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ color: "#888", fontSize: "11px", display: "block", marginBottom: "4px" }}>لینک دکمه دوم</label>
                    <input style={{ ...inp, direction: "ltr" }} value={form.cta2_href} onChange={e => setForm(f => ({ ...f, cta2_href: e.target.value }))} />
                  </div>
                </div>

                {/* Colors + order */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "18px" }}>
                  <div>
                    <label style={{ color: "#888", fontSize: "11px", display: "block", marginBottom: "4px" }}>رنگ پس‌زمینه</label>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <input type="color" value={form.bg_color} onChange={e => setForm(f => ({ ...f, bg_color: e.target.value }))}
                        style={{ width: "36px", height: "32px", border: "1px solid #333", borderRadius: "4px", cursor: "pointer", backgroundColor: "transparent" }} />
                      <input style={{ ...inp, flex: 1, direction: "ltr" }} value={form.bg_color}
                        onChange={e => setForm(f => ({ ...f, bg_color: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label style={{ color: "#888", fontSize: "11px", display: "block", marginBottom: "4px" }}>رنگ تاکید</label>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <input type="color" value={form.accent} onChange={e => setForm(f => ({ ...f, accent: e.target.value }))}
                        style={{ width: "36px", height: "32px", border: "1px solid #333", borderRadius: "4px", cursor: "pointer", backgroundColor: "transparent" }} />
                      <input style={{ ...inp, flex: 1, direction: "ltr" }} value={form.accent}
                        onChange={e => setForm(f => ({ ...f, accent: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label style={{ color: "#888", fontSize: "11px", display: "block", marginBottom: "4px" }}>ترتیب نمایش</label>
                    <input type="number" style={inp} value={form.sort_order} min="0"
                      onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} />
                  </div>
                </div>

                {/* Active toggle */}
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: "20px" }}>
                  <div onClick={() => setForm(f => ({ ...f, active: f.active ? 0 : 1 }))}
                    style={{ width: "36px", height: "20px", borderRadius: "10px", backgroundColor: form.active ? "#d4af37" : "#333", position: "relative", cursor: "pointer", transition: "background-color 0.2s", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: "3px", left: form.active ? "19px" : "3px", width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "#fff", transition: "left 0.2s" }} />
                  </div>
                  <span style={{ color: "#ccc", fontSize: "13px" }}>اسلاید فعال باشد</span>
                </label>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={handleSave} disabled={saving || uploading}
                    style={{ flex: 1, backgroundColor: saving ? "#a08020" : "#d4af37", color: "#000", border: "none", borderRadius: "6px", padding: "11px", fontWeight: "700", fontSize: "14px", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                    {saving ? "در حال ذخیره..." : "ذخیره اسلاید"}
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
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
            <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "24px", maxWidth: "320px", width: "100%", textAlign: "center" }}>
              <Trash2 size={28} color="#ef4444" style={{ margin: "0 auto 12px" }} />
              <p style={{ color: "#fff", marginBottom: "8px", fontWeight: "600" }}>حذف اسلاید؟</p>
              <p style={{ color: "#888", fontSize: "12px", marginBottom: "20px" }}>این عمل قابل بازگشت نیست</p>
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
