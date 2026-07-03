"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { Plus, Trash2, Save, RefreshCw, GripVertical, X } from "lucide-react";
import AdminGuard from "../AdminGuard";

interface NavLink { label: string; href: string; }

const inp: React.CSSProperties = {
  backgroundColor: "#121212", border: "1px solid #333", borderRadius: "6px",
  padding: "8px 12px", color: "#fff", fontSize: "13px", outline: "none",
  fontFamily: "inherit", width: "100%",
};

function LinkEditor({
  title, description, links, onChange,
}: {
  title: string; description: string;
  links: NavLink[]; onChange: (links: NavLink[]) => void;
}) {
  function addLink() {
    onChange([...links, { label: "", href: "/products" }]);
  }
  function removeLink(i: number) {
    onChange(links.filter((_, idx) => idx !== i));
  }
  function updateLink(i: number, field: "label" | "href", val: string) {
    const next = [...links];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  }

  return (
    <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>{title}</h3>
        <p style={{ color: "#666", fontSize: "12px" }}>{description}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
        {links.map((link, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#121212", borderRadius: "8px", padding: "8px 10px", border: "1px solid #2a2a2a" }}>
            <GripVertical size={14} color="#444" style={{ flexShrink: 0 }} />
            <input value={link.label} onChange={e => updateLink(i, "label", e.target.value)}
              style={{ ...inp, flex: "0 0 160px", padding: "6px 10px", direction: "rtl" }} placeholder="عنوان لینک" />
            <input value={link.href} onChange={e => updateLink(i, "href", e.target.value)}
              style={{ ...inp, flex: 1, padding: "6px 10px", direction: "ltr", fontSize: "12px" }} placeholder="/products" />
            <button onClick={() => removeLink(i)}
              style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: "6px", padding: "5px 7px", cursor: "pointer", flexShrink: 0 }}>
              <X size={13} />
            </button>
          </div>
        ))}
        {links.length === 0 && (
          <p style={{ color: "#555", fontSize: "12px", textAlign: "center", padding: "16px" }}>هیچ لینکی تعریف نشده</p>
        )}
      </div>

      <button onClick={addLink}
        style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(212,175,55,0.1)", border: "1px dashed rgba(212,175,55,0.4)", borderRadius: "8px", padding: "8px 14px", color: "#d4af37", cursor: "pointer", fontSize: "12px", fontFamily: "inherit" }}>
        <Plus size={14} /> افزودن لینک
      </button>
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
              description="لینک‌های ردیف سفید زیر هدر. ترتیب نمایش از راست به چپ است."
              links={navLinks}
              onChange={setNavLinks}
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
