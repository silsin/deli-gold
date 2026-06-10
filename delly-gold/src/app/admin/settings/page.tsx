"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { Save, RefreshCw, TrendingUp } from "lucide-react";
import AdminGuard from "../AdminGuard";

interface GoldData {
  price: number;
  history: number[];
  fallback?: boolean;
  stale?: boolean;
}

export default function AdminSettingsPage() {
  const [markup, setMarkup] = useState("5");
  const [fixedFee, setFixedFee] = useState("0");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [goldData, setGoldData] = useState<GoldData | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(true);

  useEffect(() => {
    // Load current settings
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setMarkup(d.data.gold_markup_percent ?? "5");
          setFixedFee(d.data.gold_fixed_fee ?? "0");
        }
      });

    // Load current gold price
    fetch("/api/admin/gold-price")
      .then(r => r.json())
      .then(d => { if (d.success) setGoldData(d.data); })
      .finally(() => setLoadingPrice(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gold_markup_percent: markup,
        gold_fixed_fee: fixedFee,
      }),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    setSaving(false);
  }

  const basePrice = goldData?.price ?? 0;
  const markupNum = parseFloat(markup) || 0;
  const fixedNum = parseFloat(fixedFee) || 0;
  const finalPrice = Math.round(basePrice * (1 + markupNum / 100) + fixedNum);

  return (
    <AdminGuard>
    <div style={{ maxWidth: "640px" }}>
      <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: "700", marginBottom: "24px" }}>تنظیمات قیمت‌گذاری</h2>

      {/* Live gold price preview */}
      <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <TrendingUp size={16} color="#d4af37" />
          <h3 style={{ color: "#fff", fontSize: "14px", fontWeight: "600" }}>قیمت لحظه‌ای طلا (۱۸ عیار)</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          {[
            { label: "قیمت بازار", value: loadingPrice ? "..." : `${basePrice.toLocaleString("fa-IR")} ت` },
            { label: "سود شما", value: `${markupNum}% + ${fixedNum.toLocaleString("fa-IR")} ت` },
            { label: "قیمت فروش", value: loadingPrice ? "..." : `${finalPrice.toLocaleString("fa-IR")} ت`, highlight: true },
          ].map((item, i) => (
            <div key={i} style={{ backgroundColor: item.highlight ? "rgba(212,175,55,0.1)" : "#121212", border: `1px solid ${item.highlight ? "rgba(212,175,55,0.3)" : "#2a2a2a"}`, borderRadius: "8px", padding: "12px", textAlign: "center" }}>
              <p style={{ color: "#888", fontSize: "11px", marginBottom: "4px" }}>{item.label}</p>
              <p style={{ color: item.highlight ? "#d4af37" : "#fff", fontSize: "13px", fontWeight: "700" }}>{item.value}</p>
            </div>
          ))}
        </div>
        {goldData?.fallback && (
          <p style={{ color: "#f59e0b", fontSize: "11px", marginTop: "8px" }}>⚠️ قیمت پیش‌فرض — سرویس خارجی در دسترس نیست</p>
        )}
      </div>

      {/* Markup settings */}
      <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "24px" }}>
        <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: "600", marginBottom: "20px" }}>تنظیم سود و اجرت</h3>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ color: "#888", fontSize: "13px", display: "block", marginBottom: "6px" }}>
            درصد سود (%) <span style={{ color: "#555", fontSize: "11px" }}>— روی قیمت بازار اعمال می‌شود</span>
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="number"
              value={markup}
              onChange={e => setMarkup(e.target.value)}
              min="0"
              max="100"
              step="0.5"
              style={{ flex: 1, backgroundColor: "#121212", border: "1px solid #333", borderRadius: "6px", padding: "10px 12px", color: "#fff", fontSize: "14px", outline: "none", direction: "ltr" }}
            />
            <span style={{ color: "#888", fontSize: "14px", flexShrink: 0 }}>%</span>
          </div>
          {/* Slider */}
          <input type="range" min="0" max="50" step="0.5" value={markup}
            onChange={e => setMarkup(e.target.value)}
            style={{ width: "100%", marginTop: "8px", accentColor: "#d4af37" }} />
          <div style={{ display: "flex", justifyContent: "space-between", color: "#555", fontSize: "10px" }}>
            <span>۰%</span><span>۲۵%</span><span>۵۰%</span>
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ color: "#888", fontSize: "13px", display: "block", marginBottom: "6px" }}>
            اجرت ثابت (تومان) <span style={{ color: "#555", fontSize: "11px" }}>— مبلغ ثابت به هر گرم افزوده می‌شود</span>
          </label>
          <input
            type="number"
            value={fixedFee}
            onChange={e => setFixedFee(e.target.value)}
            min="0"
            step="1000"
            style={{ width: "100%", backgroundColor: "#121212", border: "1px solid #333", borderRadius: "6px", padding: "10px 12px", color: "#fff", fontSize: "14px", outline: "none", direction: "ltr" }}
          />
        </div>

        {saved && (
          <div style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "6px", padding: "10px 14px", marginBottom: "16px", color: "#10b981", fontSize: "13px" }}>
            ✓ تنظیمات ذخیره شد
          </div>
        )}

        <button onClick={handleSave} disabled={saving}
          style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: saving ? "#a08020" : "#d4af37", color: "#000", border: "none", borderRadius: "8px", padding: "11px 24px", fontWeight: "700", fontSize: "14px", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {saving ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
          {saving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
    </AdminGuard>
  );
}
