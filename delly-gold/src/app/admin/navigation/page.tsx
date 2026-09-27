"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { Plus, Trash2, Save, RefreshCw, GripVertical, X, ChevronDown } from "lucide-react";
import AdminGuard from "../AdminGuard";
import { GUIDE_PAGE_DEFINITIONS } from "@/lib/guide-pages-settings";

/** Where a menu/submenu item should point — the admin picks, we build the path. */
type LinkTargetKind =
  | "products"
  | "collections"
  | "showcase"
  | "tryon"
  | "rates"
  | "about"
  | "contact"
  | "collab"
  | "cart"
  | "account"
  | "category"
  | "filter"
  | "guide"
  | "custom";

interface NavLink { label: string; href: string; children?: NavLink[]; }

const inp: React.CSSProperties = {
  backgroundColor: "#121212", border: "1px solid #333", borderRadius: "6px",
  padding: "8px 12px", color: "#fff", fontSize: "13px", outline: "none",
  fontFamily: "inherit", width: "100%",
};

function LinkEditor({
  title, description, links, onChange, allowChildren = false, childrenHint,
}: {
  title: string; description: string;
  links: NavLink[]; onChange: (links: NavLink[]) => void;
  allowChildren?: boolean; childrenHint?: string;
}) {
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [openKids, setOpenKids] = useState<Record<number, boolean>>({});

  // Categories for the «دسته‌بندی» picker. Loaded once — reused by every row.
  useEffect(() => {
    fetch("/api/categories", { cache: "no-store" }).then(r => r.json()).then(d => {
      if (d.success && Array.isArray(d.data)) setCategories(d.data);
    }).catch(() => {});
  }, []);

  function hrefFor(kind: LinkTargetKind, ref: string): string {
    const r = ref.trim();
    switch (kind) {
      case "products":    return "/products";
      case "collections": return "/collections";
      case "rates":       return "/rates-board";
      case "showcase":    return "/showcase";
      case "tryon":       return "/tryon";
      case "about":       return "/about";
      case "contact":     return "/contact";
      case "collab":      return "/collab";
      case "cart":        return "/cart";
      case "account":     return "/account";
      case "category":    return r ? `/products?category=${encodeURIComponent(r)}` : "/products";
      case "filter":      return r ? `/products?${r.replace(/^\?/, "")}` : "/products";
      case "guide":       return r ? `/info/${r.replace(/^\/info\//, "")}` : "/info/faq";
      case "custom":      return r.startsWith("/") ? r : "/products";
      default:            return "/products";
    }
  }

  /**
   * Guess the picker's position from a stored href, so rows saved before this
   * picker existed still open on the right option.
   */
  function kindFor(href: string): { kind: LinkTargetKind; ref: string } {
    const h = (href || "").trim();
    if (!h || h === "/products") return { kind: "products", ref: "" };
    const simple: Record<string, LinkTargetKind> = {
      "/collections": "collections", "/showcase": "showcase", "/tryon": "tryon",
      "/rates-board": "rates",
      "/about": "about", "/contact": "contact", "/collab": "collab",
      "/cart": "cart", "/account": "account",
    };
    if (simple[h]) return { kind: simple[h], ref: "" };
    if (h === "/account?tab=orders") return { kind: "account", ref: "" };
    if (h.startsWith("/products?category=")) return { kind: "category", ref: decodeURIComponent(h.slice("/products?category=".length)) };
    if (h.startsWith("/products?")) return { kind: "filter", ref: decodeURIComponent(h.slice("/products?".length)) };
    if (h.startsWith("/info/")) return { kind: "guide", ref: decodeURIComponent(h.slice("/info/".length)) };
    if (h.startsWith("/")) return { kind: "custom", ref: h };
    return { kind: "products", ref: "" };
  }
  const sel: React.CSSProperties = {
    backgroundColor: "#121212", border: "1px solid #333", borderRadius: "6px",
    padding: "6px 8px", color: "#ffd97a", fontSize: "12px", outline: "none",
    fontFamily: "inherit", maxWidth: "100%",
  };

  /** One link row: title box + «goes to» picker + conditional detail control. */
  function TargetPicker({
    value, onPick, compact,
  }: {
    value: string; onPick: (href: string) => void; compact?: boolean;
  }) {
    const parsed = kindFor(value);
    const [kind, setKindState] = useState<LinkTargetKind>(parsed.kind);
    // Keep the picker in sync when the underlying row changes (e.g. list reload).
    useEffect(() => {
      const p = kindFor(value);
      setKindState(prev => {
        if (prev === p.kind) return prev;
        return p.kind;
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const detail = kind === "category"
      ? (parsed.kind === "category" ? parsed.ref : "")
      : kind === "filter"
        ? (parsed.kind === "filter" ? parsed.ref : FILTER_PRESETS[1].value)
        : kind === "guide"
          ? (parsed.kind === "guide" ? parsed.ref : GUIDE_PAGE_DEFINITIONS[0]?.slug ?? "faq")
          : kind === "custom" ? value : "";

    const pick = (nextKind: LinkTargetKind, nextRef: string) => {
      setKindState(nextKind);
      onPick(hrefFor(nextKind, nextRef));
    };

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: compact ? 1 : undefined, minWidth: 0, flexWrap: "wrap" }}>
        <select
          aria-label="مقصد لینک"
          value={kind}
          onChange={e => {
            const k = e.target.value as LinkTargetKind;
            const ref = k === "category"
              ? (categories[0] ? categories[0].slug || categories[0].id : "")
              : k === "filter" ? FILTER_PRESETS[1].value
              : k === "guide" ? GUIDE_PAGE_DEFINITIONS[0]?.slug ?? "faq"
              : value;
            pick(k, ref);
          }}
          style={{ ...sel, flex: compact ? "1 1 150px" : "0 1 190px", minWidth: 0 }}
        >
          <option value="products">همه محصولات</option>
          <option value="category">دسته‌بندی…</option>
          <option value="filter">فیلتر محصولات…</option>
          <option value="collections">کالکشن‌ها</option>
          <option value="rates">تابلو طلا</option>
          <option value="showcase">ویترین‌ها</option>
          <option value="tryon">پرو مجازی</option>
          <option value="guide">صفحه راهنما…</option>
          <option value="about">درباره ما</option>
          <option value="contact">تماس با ما</option>
          <option value="collab">همکاری با ما</option>
          <option value="cart">سبد خرید</option>
          <option value="account">حساب کاربری</option>
          <option value="custom">آدرس دستی…</option>
        </select>

        {kind === "category" && (
          <select
            aria-label="انتخاب دسته‌بندی"
            value={parsed.kind === "category" ? parsed.ref : (categories[0] ? categories[0].slug || categories[0].id : "")}
            onChange={e => pick("category", e.target.value)}
            style={{ ...sel, flex: compact ? "1 1 130px" : "1 1 170px", minWidth: 0 }}
          >
            {categories.length === 0 && <option value="">در حال بارگذاری…</option>}
            {categories.map(c => (
              <option key={c.id} value={c.slug || c.id}>{c.name}</option>
            ))}
          </select>
        )}

        {kind === "filter" && (
          <select
            aria-label="انتخاب فیلتر"
            value={FILTER_PRESETS.some(p => p.value === detail) ? detail : FILTER_PRESETS[1].value}
            onChange={e => pick("filter", e.target.value)}
            style={{ ...sel, flex: compact ? "1 1 130px" : "1 1 170px", minWidth: 0 }}
          >
            {FILTER_PRESETS.map(p => (
              <option key={p.value || "none"} value={p.value}>{p.label}</option>
            ))}
          </select>
        )}

        {kind === "guide" && (
          <select
            aria-label="انتخاب صفحه راهنما"
            value={GUIDE_PAGE_DEFINITIONS.some(d => d.slug === detail) ? detail : GUIDE_PAGE_DEFINITIONS[0]?.slug ?? "faq"}
            onChange={e => pick("guide", e.target.value)}
            style={{ ...sel, flex: compact ? "1 1 130px" : "1 1 170px", minWidth: 0 }}
          >
            {GUIDE_PAGE_DEFINITIONS.map(d => (
              <option key={d.slug} value={d.slug}>{d.label}</option>
            ))}
          </select>
        )}

        {kind === "custom" && (
          <input
            aria-label="آدرس دستی"
            value={detail}
            dir="ltr"
            onChange={e => pick("custom", e.target.value)}
            placeholder="/products?category=..."
            style={{ ...inp, flex: compact ? "1 1 130px" : "1 1 170px", padding: "6px 10px", fontSize: "12px", minWidth: 0 }}
          />
        )}
      </div>
    );
  }

  const FILTER_PRESETS: { value: string; label: string }[] = [
    { value: "", label: "— انتخاب کنید —" },
    { value: "lowWage=true", label: "کم‌اجرت" },
    { value: "express=true", label: "ارسال فوری" },
    { value: "featured=true", label: "پیشنهاد ویژه" },
    { value: "discount=true", label: "تخفیف‌دار" },
    { value: "coin=true", label: "سکه و آبشده" },
  ];

  function addLink() {
    onChange([...links, { label: "", href: "/products" }]);
  }

  function removeLink(i: number) {
    onChange(links.filter((_, idx) => idx !== i));
    setOpenKids(prev => {
      const next = { ...prev };
      delete next[i];
      return next;
    });
  }
  function updateLink(i: number, field: "label" | "href", val: string) {
    const next = [...links];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  }
  function addChild(i: number) {
    const next = [...links];
    const kids = [...(next[i].children ?? [])];
    kids.push({ label: "", href: "/products" });
    next[i] = { ...next[i], children: kids };
    onChange(next);
  }
  function removeChild(i: number, j: number) {
    const next = [...links];
    const kids = (next[i].children ?? []).filter((_, idx) => idx !== j);
    const { children: _drop, ...rest } = next[i];
    next[i] = kids.length > 0 ? { ...rest, children: kids } : rest;
    onChange(next);
  }
  function updateChild(i: number, j: number, field: "label" | "href", val: string) {
    const next = [...links];
    const kids = [...(next[i].children ?? [])];
    kids[j] = { ...kids[j], [field]: val };
    next[i] = { ...next[i], children: kids };
    onChange(next);
  }

  return (
    <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>{title}</h3>
        <p style={{ color: "#666", fontSize: "12px" }}>{description}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
        {links.map((link, i) => {
          const kids = link.children ?? [];
          const isKidsOpen = openKids[i] !== false; // default open
          return (
            <div key={i} style={{ backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "10px", padding: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <GripVertical size={14} color="#444" style={{ flexShrink: 0 }} />
                <input
                  value={link.label}
                  onChange={e => updateLink(i, "label", e.target.value)}
                  style={{ ...inp, flex: "0 1 160px", minWidth: 120, padding: "7px 10px", direction: "rtl" }}
                  placeholder="عنوان منو (مثلاً طلا)"
                />
                <TargetPicker
                  value={link.href}
                  onPick={href => updateLink(i, "href", href)}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginRight: "auto" }}>
                  {allowChildren && (
                    <button
                      type="button"
                      onClick={() => setOpenKids(prev => ({ ...prev, [i]: !isKidsOpen }))}
                      title={isKidsOpen ? "بستن لیست زیرمنوها" : "مشاهده زیرمنوها"}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        backgroundColor: kids.length > 0 ? "rgba(200,161,42,0.12)" : "transparent",
                        border: `1px solid ${kids.length > 0 ? "rgba(200,161,42,0.4)" : "#333"}`,
                        color: kids.length > 0 ? "#ffd97a" : "#888",
                        borderRadius: "6px", padding: "6px 9px", fontSize: "11px", cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      <ChevronDown size={13} style={{ transform: isKidsOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.18s" }} />
                      <span>زیرمنو ({kids.length})</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeLink(i)}
                    title="حذف منو"
                    style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: "6px", padding: "6px 8px", cursor: "pointer", flexShrink: 0 }}
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              {allowChildren && isKidsOpen && (
                <div style={{ marginRight: 22, paddingRight: 10, borderRight: "2px solid rgba(200,161,42,0.35)", display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                  {kids.map((child, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#0d0f12", borderRadius: "8px", padding: "7px 10px", border: "1px dashed #262a30", flexWrap: "wrap" }}>
                      <span style={{ color: "#c8a12a", fontSize: 10, flexShrink: 0 }}>◆</span>
                      <input
                        value={child.label}
                        onChange={e => updateChild(i, j, "label", e.target.value)}
                        style={{ ...inp, flex: "0 1 140px", minWidth: 100, padding: "6px 9px", direction: "rtl", fontSize: "12px" }}
                        placeholder="عنوان زیرمنو (مثلاً گردنبند)"
                      />
                      <TargetPicker
                        value={child.href}
                        onPick={href => updateChild(i, j, "href", href)}
                        compact
                      />
                      <button
                        type="button"
                        onClick={() => removeChild(i, j)}
                        title="حذف زیرمنو"
                        style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: "6px", padding: "5px 7px", cursor: "pointer", flexShrink: 0, marginRight: "auto" }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <div>
                    <button
                      type="button"
                      onClick={() => addChild(i)}
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "transparent", border: "1px dashed rgba(200,161,42,0.5)", borderRadius: "7px", padding: "6px 12px", color: "#c8a12a", cursor: "pointer", fontSize: "11px", fontFamily: "inherit" }}
                    >
                      <Plus size={12} /> افزودن زیرمنو
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {links.length === 0 && (
          <p style={{ color: "#555", fontSize: "12px", textAlign: "center", padding: "16px" }}>هیچ لینکی تعریف نشده</p>
        )}
      </div>

      <button onClick={addLink}
        style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(212,175,55,0.1)", border: "1px dashed rgba(212,175,55,0.4)", borderRadius: "8px", padding: "8px 14px", color: "#d4af37", cursor: "pointer", fontSize: "12px", fontFamily: "inherit" }}>
        <Plus size={14} /> افزودن لینک
      </button>
      {allowChildren && childrenHint && (
        <p style={{ color: "#555", fontSize: "11px", marginTop: "10px", lineHeight: 1.8 }}>{childrenHint}</p>
      )}
    </div>
  );
}

export default function AdminNavigationPage() {
  const [navLinks, setNavLinks]         = useState<NavLink[]>([]);
  const [promoLinks, setPromoLinks]     = useState<NavLink[]>([]);
  const [loading, setLoading]           = useState(true);
  const [savingNav, setSavingNav]       = useState(false);
  const [savingPromo, setSavingPromo]   = useState(false);
  const [savedNav, setSavedNav]         = useState(false);
  const [savedPromo, setSavedPromo]     = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(d => {
      if (d.success) {
        try { if (d.data.nav_links) setNavLinks(JSON.parse(d.data.nav_links)); } catch {}
        try { if (d.data.promo_strip_links) setPromoLinks(JSON.parse(d.data.promo_strip_links)); } catch {}
      }
      setLoading(false);
    });
  }, []);

  async function saveNavLinks() {
    setSavingNav(true); setSavedNav(false);
    await fetch("/api/admin/settings", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nav_links: JSON.stringify(navLinks) }),
    });
    setSavedNav(true); setTimeout(() => setSavedNav(false), 3000);
    setSavingNav(false);
  }

  async function savePromoLinks() {
    setSavingPromo(true); setSavedPromo(false);
    await fetch("/api/admin/settings", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promo_strip_links: JSON.stringify(promoLinks) }),
    });
    setSavedPromo(true); setTimeout(() => setSavedPromo(false), 3000);
    setSavingPromo(false);
  }

  return (
    <AdminGuard>
      <div style={{ maxWidth: "760px" }}>
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: "700" }}>مدیریت منوها و لینک‌ها</h2>
          <p style={{ color: "#666", fontSize: "12px", marginTop: "4px" }}>منوی ناوبری و نوار اسکرول طلایی را ویرایش کنید</p>
        </div>

        {loading ? (
          <p style={{ color: "#555" }}>در حال بارگذاری...</p>
        ) : (
          <>
            {/* Nav links */}
            <LinkEditor
              title="منوی ناوبری (ردیف دسته‌بندی‌ها)"
              description="لینک‌های ردیف سفید زیر هدر. ترتیب نمایش از راست به چپ است. برای هر آیتم می‌توانید زیرمنو (hover) اضافه کنید."
              links={navLinks}
              onChange={setNavLinks}
              allowChildren
              childrenHint="زیرمنوها روی دسکتاپ با هاور (حرکت موس روی آیتم) باز می‌شوند و در موبایل با دکمه‌ی «باز کردن زیرمنو» نمایش داده می‌شوند."
            />
            {savedNav && <div style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "6px", padding: "10px 14px", marginBottom: "14px", color: "#10b981", fontSize: "13px" }}>✓ منوی ناوبری ذخیره شد</div>}
            <button onClick={saveNavLinks} disabled={savingNav}
              style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: savingNav ? "#a08020" : "#d4af37", color: "#000", border: "none", borderRadius: "8px", padding: "11px 24px", fontWeight: "700", fontSize: "14px", cursor: savingNav ? "not-allowed" : "pointer", fontFamily: "inherit", marginBottom: "32px" }}>
              {savingNav ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
              {savingNav ? "در حال ذخیره..." : "ذخیره منوی ناوبری"}
            </button>

            {/* Promo strip */}
            <LinkEditor
              title="نوار اسکرول طلایی (PromoStrip)"
              description="لینک‌های نوار طلایی زیر هدر که به صورت خودکار اسکرول می‌شوند."
              links={promoLinks}
              onChange={setPromoLinks}
            />
            {savedPromo && <div style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "6px", padding: "10px 14px", marginBottom: "14px", color: "#10b981", fontSize: "13px" }}>✓ نوار اسکرول ذخیره شد</div>}
            <button onClick={savePromoLinks} disabled={savingPromo}
              style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: savingPromo ? "#a08020" : "#d4af37", color: "#000", border: "none", borderRadius: "8px", padding: "11px 24px", fontWeight: "700", fontSize: "14px", cursor: savingPromo ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {savingPromo ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
              {savingPromo ? "در حال ذخیره..." : "ذخیره نوار اسکرول"}
            </button>
          </>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </AdminGuard>
  );
}
