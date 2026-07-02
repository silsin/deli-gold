"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, Pencil, Trash2, Search, X, Info, Upload } from "lucide-react";
import AdminGuard from "../AdminGuard";

interface Category { id: string; name: string; }
interface Product {
  id: string; name: string; slug: string; price: number; weight: number;
  karat: number; stock: number; featured: boolean; published: boolean;
  ajrat_override: number; ajrat_percent: number | null; ajrat_fixed: number | null;
  images: string; category: { name: string };
}
interface GlobalSettings { gold_markup_percent: string; gold_fixed_fee: string; }

const empty = {
  name: "", slug: "", description: "", price: "", weight: "", karat: "18",
  stock: "0", categoryId: "", featured: false, published: true,
  images: [] as string[],
  ajrat_override: false, ajrat_percent: "", ajrat_fixed: "",
};

export default function AdminProductsPage() {
  const [products, setProducts]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [gs, setGs] = useState<GlobalSettings>({ gold_markup_percent: "5", gold_fixed_fee: "0" });
  const [goldPrice, setGoldPrice]   = useState(0);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [showModal, setShowModal]   = useState(false);
  const [editId, setEditId]         = useState<string | null>(null);
  const [form, setForm]             = useState({ ...empty });
  const [saving, setSaving]         = useState(false);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [err, setErr]               = useState("");
  const [uploading, setUploading]   = useState(false);
  const fileRef                     = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const url = search
      ? `/api/products?search=${encodeURIComponent(search)}&limit=50&adminMode=true`
      : "/api/products?limit=50&adminMode=true";
    const res = await fetch(url);
    const d   = await res.json();
    if (d.success) setProducts(d.data.products);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(d => { if (d.success) setCategories(d.data); });
    fetch("/api/admin/settings").then(r => r.json()).then(d => { if (d.success) setGs(d.data); });
    fetch("/api/admin/gold-price").then(r => r.json()).then(d => { if (d.success) setGoldPrice(d.data.price); });
  }, []);

  function openCreate() { setEditId(null); setForm({ ...empty }); setErr(""); setShowModal(true); }

  function openEdit(p: Product) {
    let imgs: string[] = [];
    try { imgs = JSON.parse(p.images); } catch {}
    setEditId(p.id);
    setForm({
      name: p.name, slug: p.slug, description: "",
      price: String(p.price), weight: String(p.weight),
      karat: String(p.karat), stock: String(p.stock),
      categoryId: p.category ? (categories.find(c => c.name === p.category.name)?.id || "") : "",
      featured: p.featured, published: p.published,
      images: imgs,
      ajrat_override: p.ajrat_override === 1,
      ajrat_percent: p.ajrat_percent !== null ? String(p.ajrat_percent) : "",
      ajrat_fixed:   p.ajrat_fixed   !== null ? String(p.ajrat_fixed)   : "",
    });
    setErr(""); setShowModal(true);
  }

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const d   = await res.json();
      if (d.success) setForm(f => ({ ...f, images: [...f.images, d.data.url] }));
      else setErr(d.error || "خطا در آپلود");
    } catch { setErr("خطای شبکه در آپلود"); }
    finally { setUploading(false); }
  }

  function removeImage(idx: number) { setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) })); }

  async function handleSave() {
    setSaving(true); setErr("");
    try {
      const payload = {
        ...form,
        price:  parseFloat(form.price),
        weight: parseFloat(form.weight),
        karat:  parseInt(form.karat),
        stock:  parseInt(form.stock),
        images: form.images,
        ajrat_override: form.ajrat_override,
        ajrat_percent: form.ajrat_override && form.ajrat_percent !== "" ? parseFloat(form.ajrat_percent) : null,
        ajrat_fixed:   form.ajrat_override && form.ajrat_fixed   !== "" ? parseFloat(form.ajrat_fixed)   : null,
      };
      const res = await fetch(editId ? `/api/products/${editId}` : "/api/products", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!res.ok) { setErr(d.error || "خطا"); return; }
      setShowModal(false); fetchProducts();
    } catch { setErr("خطای شبکه"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setDeleteId(null); fetchProducts();
  }

  function autoSlug(n: string) { return n.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""); }

  const markupPct  = form.ajrat_override && form.ajrat_percent !== "" ? parseFloat(form.ajrat_percent) || 0 : parseFloat(gs.gold_markup_percent) || 0;
  const fixedFee   = form.ajrat_override && form.ajrat_fixed   !== "" ? parseFloat(form.ajrat_fixed)   || 0 : parseFloat(gs.gold_fixed_fee)     || 0;
  const basePrice  = parseFloat(form.price) || 0;
  const wt         = parseFloat(form.weight) || 0;
  const ajrat      = Math.round(basePrice * (markupPct / 100) + fixedFee * wt);
  const finalPrice = basePrice + ajrat;

  const inp: React.CSSProperties = {
    width: "100%", backgroundColor: "#121212", border: "1px solid #333",
    borderRadius: "6px", padding: "8px 12px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit",
  };

  return (
    <AdminGuard>
      <div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"24px" }}>
          <h2 style={{ color:"#fff", fontSize:"20px", fontWeight:"700" }}>مدیریت محصولات</h2>
          <button onClick={openCreate} style={{ display:"flex", alignItems:"center", gap:"6px", backgroundColor:"#d4af37", color:"#000", border:"none", borderRadius:"6px", padding:"8px 16px", fontWeight:"700", fontSize:"13px", cursor:"pointer", fontFamily:"inherit" }}>
            <Plus size={16}/> افزودن محصول
          </button>
        </div>

        {/* Search */}
        <div style={{ position:"relative", marginBottom:"14px", maxWidth:"360px" }}>
          <Search size={14} style={{ position:"absolute", right:"11px", top:"50%", transform:"translateY(-50%)", color:"#888" }}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="جستجو..." style={{ width:"100%", backgroundColor:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:"6px", padding:"8px 34px 8px 12px", color:"#fff", fontSize:"13px", outline:"none" }}/>
        </div>

        {/* Global اجرت info */}
        <div style={{ backgroundColor:"#161616", border:"1px solid #2a2a2a", borderRadius:"8px", padding:"9px 14px", marginBottom:"14px", display:"flex", alignItems:"center", gap:"8px", fontSize:"12px" }}>
          <Info size={13} color="#d4af37"/>
          <span style={{ color:"#888" }}>اجرت جهانی:</span>
          <span style={{ color:"#d4af37", fontWeight:"700" }}>{gs.gold_markup_percent}%</span>
          <span style={{ color:"#555" }}>+</span>
          <span style={{ color:"#d4af37", fontWeight:"700" }}>{Number(gs.gold_fixed_fee).toLocaleString("fa-IR")} ت/گرم</span>
          <a href="/admin/settings" style={{ color:"#555", fontSize:"11px", marginRight:"auto", textDecoration:"none" }}>ویرایش ←</a>
        </div>

        {/* Table */}
        <div style={{ backgroundColor:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:"10px", overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ backgroundColor:"#161616" }}>
                  {["تصویر","نام","دسته","قیمت پایه","اجرت","قیمت نهایی","موجودی","وضعیت","عملیات"].map(h=>(
                    <th key={h} style={{ padding:"10px 14px", color:"#888", fontSize:"12px", textAlign:"right", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} style={{ padding:"32px", textAlign:"center", color:"#555" }}>در حال بارگذاری...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding:"32px", textAlign:"center", color:"#555" }}>محصولی یافت نشد</td></tr>
                ) : products.map(p => {
                  const imgs = (() => { try { return JSON.parse(p.images); } catch { return []; } })();
                  const gM = parseFloat(gs.gold_markup_percent)||0, gF = parseFloat(gs.gold_fixed_fee)||0;
                  const uP = p.ajrat_override===1 && p.ajrat_percent!==null ? p.ajrat_percent : gM;
                  const uF = p.ajrat_override===1 && p.ajrat_fixed!==null   ? p.ajrat_fixed   : gF;
                  const aj = Math.round(p.price*(uP/100)+uF*p.weight);
                  return (
                    <tr key={p.id} style={{ borderTop:"1px solid #222" }}>
                      <td style={{ padding:"10px 14px" }}>
                        {imgs[0] ? (
                          <img src={imgs[0]} alt="" style={{ width:"44px", height:"44px", objectFit:"cover", borderRadius:"6px", border:"1px solid #333" }}/>
                        ) : (
                          <div style={{ width:"44px", height:"44px", backgroundColor:"#121212", borderRadius:"6px", border:"1px solid #333", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <Upload size={14} color="#444"/>
                          </div>
                        )}
                      </td>
                      <td style={{ padding:"10px 14px" }}>
                        <p style={{ color:"#fff", fontSize:"13px" }}>{p.name}</p>
                        <p style={{ color:"#555", fontSize:"11px" }}>{p.slug}</p>
                      </td>
                      <td style={{ padding:"10px 14px", color:"#888", fontSize:"12px" }}>{p.category?.name||"—"}</td>
                      <td style={{ padding:"10px 14px", color:"#aaa", fontSize:"12px", whiteSpace:"nowrap" }}>{p.price.toLocaleString("fa-IR")} ت</td>
                      <td style={{ padding:"10px 14px", whiteSpace:"nowrap" }}>
                        <span style={{ color: p.ajrat_override===1?"#f59e0b":"#888", fontSize:"11px" }}>{p.ajrat_override===1?"اختصاصی":"جهانی"}</span>
                        <p style={{ color:"#d4af37", fontSize:"11px" }}>+{aj.toLocaleString("fa-IR")}</p>
                      </td>
                      <td style={{ padding:"10px 14px", color:"#d4af37", fontSize:"13px", fontWeight:"700", whiteSpace:"nowrap" }}>{(p.price+aj).toLocaleString("fa-IR")} ت</td>
                      <td style={{ padding:"10px 14px" }}>
                        <span style={{ color: p.stock>0?"#10b981":"#ef4444", fontSize:"13px", fontWeight:"600" }}>{p.stock}</span>
                      </td>
                      <td style={{ padding:"10px 14px" }}>
                        <span style={{ backgroundColor: p.published?"rgba(16,185,129,0.15)":"rgba(239,68,68,0.15)", color: p.published?"#10b981":"#ef4444", padding:"3px 8px", borderRadius:"20px", fontSize:"11px" }}>
                          {p.published?"منتشر":"پنهان"}
                        </span>
                      </td>
                      <td style={{ padding:"10px 14px" }}>
                        <div style={{ display:"flex", gap:"6px" }}>
                          <button onClick={()=>openEdit(p)} style={{ backgroundColor:"rgba(212,175,55,0.1)", border:"1px solid rgba(212,175,55,0.3)", color:"#d4af37", borderRadius:"6px", padding:"5px 8px", cursor:"pointer" }}><Pencil size={13}/></button>
                          <button onClick={()=>setDeleteId(p.id)} style={{ backgroundColor:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", color:"#ef4444", borderRadius:"6px", padding:"5px 8px", cursor:"pointer" }}><Trash2 size={13}/></button>
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
          <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:"20px" }}>
            <div style={{ backgroundColor:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:"12px", width:"100%", maxWidth:"620px", maxHeight:"92vh", overflowY:"auto" }}>
              <div style={{ padding:"18px 24px", borderBottom:"1px solid #2a2a2a", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, backgroundColor:"#1a1a1a", zIndex:1 }}>
                <h3 style={{ color:"#fff", fontSize:"15px", fontWeight:"700" }}>{editId?"ویرایش محصول":"افزودن محصول"}</h3>
                <button onClick={()=>setShowModal(false)} style={{ background:"none", border:"none", color:"#888", cursor:"pointer" }}><X size={18}/></button>
              </div>

              <div style={{ padding:"22px" }}>
                {err && <div style={{ backgroundColor:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:"6px", padding:"10px", marginBottom:"14px", color:"#f87171", fontSize:"13px" }}>{err}</div>}

                {/* ── Images ── */}
                <p style={{ color:"#d4af37", fontSize:"11px", fontWeight:"700", letterSpacing:"1px", marginBottom:"10px" }}>تصاویر محصول</p>
                <input ref={fileRef} type="file" accept="image/*" multiple onChange={e=>{ Array.from(e.target.files||[]).forEach(f=>uploadImage(f)); e.target.value=""; }} style={{ display:"none" }}/>
                <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"12px" }}>
                  {form.images.map((img,i)=>(
                    <div key={i} style={{ position:"relative", width:"72px", height:"72px" }}>
                      <img src={img} alt="" style={{ width:"72px", height:"72px", objectFit:"cover", borderRadius:"7px", border:"1px solid #333" }}/>
                      <button onClick={()=>removeImage(i)} style={{ position:"absolute", top:"-6px", right:"-6px", width:"18px", height:"18px", borderRadius:"50%", backgroundColor:"#ef4444", border:"none", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px" }}>
                        <X size={10}/>
                      </button>
                    </div>
                  ))}
                  <button onClick={()=>fileRef.current?.click()} disabled={uploading}
                    style={{ width:"72px", height:"72px", backgroundColor:"#121212", border:"2px dashed #333", borderRadius:"7px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"4px", color:"#555" }}>
                    <Upload size={18} color="#555"/>
                    <span style={{ fontSize:"9px" }}>{uploading?"آپلود...":"افزودن"}</span>
                  </button>
                </div>
                {/* Or URL */}
                <input style={{ ...inp, marginBottom:"18px" }} placeholder="یا URL تصویر را وارد کنید و Enter بزنید"
                  onKeyDown={e=>{ if(e.key==="Enter"&&(e.target as HTMLInputElement).value.trim()){ setForm(f=>({...f,images:[...f.images,(e.target as HTMLInputElement).value.trim()]})); (e.target as HTMLInputElement).value=""; }}}/>

                {/* ── Basic info ── */}
                <p style={{ color:"#d4af37", fontSize:"11px", fontWeight:"700", letterSpacing:"1px", marginBottom:"10px" }}>اطلاعات پایه</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px" }}>
                  <div>
                    <label style={{ color:"#888", fontSize:"12px", display:"block", marginBottom:"4px" }}>نام محصول *</label>
                    <input style={inp} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value,slug:f.slug||autoSlug(e.target.value)}))}/>
                  </div>
                  <div>
                    <label style={{ color:"#888", fontSize:"12px", display:"block", marginBottom:"4px" }}>اسلاگ *</label>
                    <input style={{...inp,direction:"ltr"}} value={form.slug} onChange={e=>setForm(f=>({...f,slug:e.target.value}))}/>
                  </div>
                </div>
                <div style={{ marginBottom:"10px" }}>
                  <label style={{ color:"#888", fontSize:"12px", display:"block", marginBottom:"4px" }}>توضیحات</label>
                  <input style={inp} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px", marginBottom:"10px" }}>
                  {[{k:"weight",l:"وزن (گرم)"},{k:"karat",l:"عیار"},{k:"stock",l:"موجودی"}].map(f=>(
                    <div key={f.k}>
                      <label style={{ color:"#888", fontSize:"12px", display:"block", marginBottom:"4px" }}>{f.l}</label>
                      <input type="number" style={inp} value={(form as Record<string,unknown>)[f.k] as string} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} min="0" step={f.k==="weight"?"0.01":"1"}/>
                    </div>
                  ))}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"18px" }}>
                  <div>
                    <label style={{ color:"#888", fontSize:"12px", display:"block", marginBottom:"4px" }}>دسته‌بندی *</label>
                    <select value={form.categoryId} onChange={e=>setForm(f=>({...f,categoryId:e.target.value}))} style={inp}>
                      <option value="">انتخاب کنید</option>
                      {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div style={{ display:"flex", gap:"14px", paddingTop:"20px" }}>
                    {[{k:"featured",l:"ویژه"},{k:"published",l:"منتشر"}].map(t=>(
                      <label key={t.k} style={{ display:"flex", alignItems:"center", gap:"6px", cursor:"pointer", color:"#ccc", fontSize:"13px" }}>
                        <input type="checkbox" checked={(form as Record<string,unknown>)[t.k] as boolean} onChange={e=>setForm(f=>({...f,[t.k]:e.target.checked}))}/>
                        {t.l}
                      </label>
                    ))}
                  </div>
                </div>

                {/* ── Pricing ── */}
                <p style={{ color:"#d4af37", fontSize:"11px", fontWeight:"700", letterSpacing:"1px", marginBottom:"10px" }}>قیمت‌گذاری و اجرت</p>
                <div style={{ marginBottom:"12px" }}>
                  <label style={{ color:"#888", fontSize:"12px", display:"block", marginBottom:"4px" }}>قیمت پایه (تومان) *</label>
                  <input type="number" style={{...inp,direction:"ltr"}} value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} min="0" step="1000"/>
                </div>
                <div style={{ backgroundColor:"#121212", border:"1px solid #2a2a2a", borderRadius:"8px", padding:"12px 14px", marginBottom:"12px" }}>
                  <label style={{ display:"flex", alignItems:"center", gap:"8px", cursor:"pointer", marginBottom: form.ajrat_override?"12px":"0" }}>
                    <div onClick={()=>setForm(f=>({...f,ajrat_override:!f.ajrat_override}))}
                      style={{ width:"34px", height:"19px", borderRadius:"10px", backgroundColor:form.ajrat_override?"#d4af37":"#333", position:"relative", cursor:"pointer", transition:"background-color 0.2s", flexShrink:0 }}>
                      <div style={{ position:"absolute", top:"2.5px", left:form.ajrat_override?"18px":"2.5px", width:"14px", height:"14px", borderRadius:"50%", backgroundColor:"#fff", transition:"left 0.2s" }}/>
                    </div>
                    <div>
                      <p style={{ color:"#fff", fontSize:"13px", fontWeight:"600" }}>اجرت اختصاصی</p>
                      <p style={{ color:"#666", fontSize:"11px" }}>{form.ajrat_override?`مقادیر زیر جایگزین می‌شوند`:`جهانی: ${gs.gold_markup_percent}% + ${Number(gs.gold_fixed_fee).toLocaleString("fa-IR")} ت/گرم`}</p>
                    </div>
                  </label>
                  {form.ajrat_override && (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                      <div>
                        <label style={{ color:"#888", fontSize:"12px", display:"block", marginBottom:"4px" }}>درصد اجرت (%)</label>
                        <input type="number" style={{...inp,direction:"ltr"}} value={form.ajrat_percent} onChange={e=>setForm(f=>({...f,ajrat_percent:e.target.value}))} min="0" max="100" step="0.5" placeholder={gs.gold_markup_percent}/>
                      </div>
                      <div>
                        <label style={{ color:"#888", fontSize:"12px", display:"block", marginBottom:"4px" }}>اجرت ثابت (ت/گرم)</label>
                        <input type="number" style={{...inp,direction:"ltr"}} value={form.ajrat_fixed} onChange={e=>setForm(f=>({...f,ajrat_fixed:e.target.value}))} min="0" step="1000" placeholder={gs.gold_fixed_fee}/>
                      </div>
                    </div>
                  )}
                </div>
                {basePrice>0&&(
                  <div style={{ backgroundColor:"rgba(212,175,55,0.05)", border:"1px solid rgba(212,175,55,0.2)", borderRadius:"8px", padding:"12px 14px", marginBottom:"18px" }}>
                    <p style={{ color:"#888", fontSize:"11px", marginBottom:"8px", fontWeight:"600" }}>پیش‌نمایش قیمت</p>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"6px" }}>
                      {[{l:"قیمت پایه",v:basePrice},{l:`اجرت (${markupPct}%)`,v:ajrat},{l:"قیمت نهایی",v:finalPrice,h:true}].map(it=>(
                        <div key={it.l} style={{ backgroundColor:it.h?"rgba(212,175,55,0.12)":"#121212", border:`1px solid ${it.h?"rgba(212,175,55,0.3)":"#222"}`, borderRadius:"6px", padding:"8px 10px", textAlign:"center" }}>
                          <p style={{ color:"#666", fontSize:"9px", marginBottom:"3px" }}>{it.l}</p>
                          <p style={{ color:it.h?"#d4af37":"#fff", fontSize:"12px", fontWeight:"700" }}>{it.v.toLocaleString("fa-IR")}<span style={{ color:"#555", fontSize:"9px", marginRight:"2px" }}>ت</span></p>
                        </div>
                      ))}
                    </div>
                    {goldPrice>0&&wt>0&&<p style={{ color:"#555", fontSize:"9px", marginTop:"6px", textAlign:"center" }}>طلای ۱۸ع: {goldPrice.toLocaleString("fa-IR")} ت/گرم</p>}
                  </div>
                )}

                <div style={{ display:"flex", gap:"10px" }}>
                  <button onClick={handleSave} disabled={saving||uploading}
                    style={{ flex:1, backgroundColor:saving?"#a08020":"#d4af37", color:"#000", border:"none", borderRadius:"6px", padding:"11px", fontWeight:"700", fontSize:"14px", cursor:saving?"not-allowed":"pointer", fontFamily:"inherit" }}>
                    {saving?"در حال ذخیره...":"ذخیره محصول"}
                  </button>
                  <button onClick={()=>setShowModal(false)} style={{ flex:1, backgroundColor:"transparent", color:"#888", border:"1px solid #333", borderRadius:"6px", padding:"11px", cursor:"pointer", fontFamily:"inherit" }}>انصراف</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirm */}
        {deleteId&&(
          <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
            <div style={{ backgroundColor:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:"12px", padding:"24px", maxWidth:"320px", width:"100%", textAlign:"center" }}>
              <Trash2 size={28} color="#ef4444" style={{ margin:"0 auto 10px" }}/>
              <p style={{ color:"#fff", marginBottom:"6px", fontWeight:"600" }}>حذف محصول؟</p>
              <p style={{ color:"#888", fontSize:"12px", marginBottom:"18px" }}>این عمل قابل بازگشت نیست</p>
              <div style={{ display:"flex", gap:"10px" }}>
                <button onClick={()=>handleDelete(deleteId)} style={{ flex:1, backgroundColor:"#ef4444", color:"#fff", border:"none", borderRadius:"6px", padding:"10px", cursor:"pointer", fontFamily:"inherit" }}>حذف</button>
                <button onClick={()=>setDeleteId(null)} style={{ flex:1, backgroundColor:"transparent", color:"#888", border:"1px solid #333", borderRadius:"6px", padding:"10px", cursor:"pointer", fontFamily:"inherit" }}>انصراف</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
