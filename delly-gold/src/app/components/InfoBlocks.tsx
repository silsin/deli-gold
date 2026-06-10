"use client";
import { useState, useEffect, useCallback } from "react";
import { Calculator, TrendingUp, TrendingDown, BookOpen, Gift, RefreshCw } from "lucide-react";
import Link from "next/link";

interface GoldData {
  price: number;
  history: number[];
  updatedAt?: string;
  fallback?: boolean;
  stale?: boolean;
}

export default function InfoBlocks() {
  const [grams, setGrams] = useState("");
  const [karat, setKarat] = useState<18 | 24>(18);
  const [goldData, setGoldData] = useState<GoldData | null>(null);
  const [markup, setMarkup] = useState(5); // percent
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPrice = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const [priceRes, settingsRes] = await Promise.all([
        fetch("/api/admin/gold-price"),
        fetch("/api/admin/settings"),
      ]);
      const priceJson = await priceRes.json();
      const settingsJson = await settingsRes.json();

      if (priceJson.success) setGoldData(priceJson.data);
      if (settingsJson.success) {
        const m = parseFloat(settingsJson.data?.gold_markup_percent ?? "5");
        setMarkup(isNaN(m) ? 5 : m);
      }
    } catch {
      // silently fail — fallback price already in state
    } finally {
      setLoadingPrice(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPrice();
    // Refresh every 5 minutes
    const interval = setInterval(() => fetchPrice(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  // Price per gram with markup applied
  const basePrice = goldData?.price ?? 0;
  // Karat adjustment: 18k = base, 24k = base * (24/18)
  const karatMultiplier = karat === 24 ? 24 / 18 : 1;
  const priceWithMarkup = Math.round(basePrice * karatMultiplier * (1 + markup / 100));

  // Calculator result
  const calcResult =
    grams && parseFloat(grams) > 0
      ? Math.round(parseFloat(grams) * priceWithMarkup)
      : null;

  // Chart helpers
  const history = goldData?.history ?? [];
  const maxPrice = history.length ? Math.max(...history) : 1;
  const minPrice = history.length ? Math.min(...history) : 0;
  const priceChange =
    history.length >= 2
      ? history[history.length - 1] - history[history.length - 2]
      : 0;
  const priceChangePercent =
    history.length >= 2 && history[history.length - 2] > 0
      ? ((priceChange / history[history.length - 2]) * 100).toFixed(2)
      : "0.00";
  const isUp = priceChange >= 0;

  return (
    <section style={{ maxWidth: "1280px", margin: "40px auto", padding: "0 16px" }}>
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}
        className="info-grid"
      >
        {/* ── 1. Gold Calculator ── */}
        <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "40px", height: "40px", backgroundColor: "rgba(212,175,55,0.15)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Calculator size={20} color="#d4af37" />
            </div>
            <div>
              <p style={{ color: "#888", fontSize: "11px" }}>محاسبه‌گر طلا</p>
              <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: "700" }}>قیمت‌یابی طلا</h3>
            </div>
          </div>

          {/* Karat selector */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            {([18, 24] as const).map(k => (
              <button key={k} onClick={() => setKarat(k)}
                style={{ flex: 1, backgroundColor: karat === k ? "#d4af37" : "#121212", color: karat === k ? "#000" : "#888", border: `1px solid ${karat === k ? "#d4af37" : "#333"}`, borderRadius: "6px", padding: "7px", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
                {k} عیار
              </button>
            ))}
          </div>

          {/* Weight input */}
          <div style={{ marginBottom: "12px" }}>
            <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "6px" }}>وزن طلا (گرم)</label>
            <input
              type="number"
              value={grams}
              onChange={e => setGrams(e.target.value)}
              placeholder="مثلاً ۲.۵"
              min="0"
              step="0.01"
              style={{ width: "100%", backgroundColor: "#121212", border: "1px solid #333", borderRadius: "6px", padding: "10px 12px", color: "#fff", fontSize: "14px", outline: "none", direction: "ltr" }}
            />
          </div>

          {/* Price per gram */}
          <div style={{ backgroundColor: "#121212", borderRadius: "6px", padding: "8px 12px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#555", fontSize: "11px" }}>قیمت هر گرم ({karat} عیار)</span>
            <span style={{ color: "#d4af37", fontSize: "13px", fontWeight: "700" }}>
              {loadingPrice ? "..." : priceWithMarkup.toLocaleString("fa-IR")} تومان
            </span>
          </div>

          {/* Result */}
          {calcResult !== null && (
            <div style={{ backgroundColor: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "6px", padding: "12px", marginBottom: "12px", textAlign: "center" }}>
              <p style={{ color: "#888", fontSize: "11px", marginBottom: "4px" }}>قیمت تخمینی</p>
              <p style={{ color: "#d4af37", fontSize: "20px", fontWeight: "800" }}>
                {calcResult.toLocaleString("fa-IR")}
              </p>
              <p style={{ color: "#888", fontSize: "11px" }}>تومان</p>
            </div>
          )}

          <Link href="/products" style={{ display: "block", width: "100%", backgroundColor: "#d4af37", color: "#000", borderRadius: "6px", padding: "10px", fontWeight: "700", fontSize: "14px", cursor: "pointer", textAlign: "center", textDecoration: "none" }}>
            مشاهده محصولات
          </Link>
        </div>

        {/* ── 2. Live Gold Price Chart ── */}
        <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "40px", height: "40px", backgroundColor: "rgba(212,175,55,0.15)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isUp ? <TrendingUp size={20} color="#d4af37" /> : <TrendingDown size={20} color="#ef4444" />}
              </div>
              <div>
                <p style={{ color: "#888", fontSize: "11px" }}>بروزرسانی خودکار</p>
                <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: "700" }}>قیمت لحظه‌ای طلا</h3>
              </div>
            </div>
            <button onClick={() => fetchPrice(true)} title="بروزرسانی"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#666", padding: "4px" }}>
              <RefreshCw size={14} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
            </button>
          </div>

          {/* Bar chart */}
          <div style={{ flex: 1, backgroundColor: "#121212", borderRadius: "8px", padding: "12px 8px 4px", marginBottom: "12px", minHeight: "90px", display: "flex", alignItems: "flex-end", gap: "3px" }}>
            {loadingPrice
              ? Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} style={{ flex: 1, height: "40%", backgroundColor: "rgba(212,175,55,0.15)", borderRadius: "2px 2px 0 0" }} />
                ))
              : history.map((p, i) => {
                  const range = maxPrice - minPrice || 1;
                  const heightPct = 20 + ((p - minPrice) / range) * 70;
                  const isLast = i === history.length - 1;
                  return (
                    <div key={i} title={`${p.toLocaleString("fa-IR")} تومان`}
                      style={{ flex: 1, height: `${heightPct}%`, backgroundColor: isLast ? "#d4af37" : isUp ? "rgba(212,175,55,0.35)" : "rgba(239,68,68,0.35)", borderRadius: "2px 2px 0 0", transition: "height 0.5s ease", cursor: "default" }} />
                  );
                })}
          </div>

          {/* Price display */}
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#888", fontSize: "11px", marginBottom: "4px" }}>هر گرم ۱۸ عیار</p>
            {loadingPrice ? (
              <p style={{ color: "#555", fontSize: "20px" }}>در حال بارگذاری...</p>
            ) : (
              <>
                <p style={{ color: "#d4af37", fontSize: "26px", fontWeight: "800", lineHeight: 1 }}>
                  {basePrice.toLocaleString("fa-IR")}
                </p>
                <p style={{ color: "#888", fontSize: "11px", marginBottom: "6px" }}>تومان</p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: isUp ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${isUp ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: "20px", padding: "2px 10px" }}>
                  {isUp ? <TrendingUp size={11} color="#10b981" /> : <TrendingDown size={11} color="#ef4444" />}
                  <span style={{ color: isUp ? "#10b981" : "#ef4444", fontSize: "11px", fontWeight: "600" }}>
                    {isUp ? "+" : ""}{priceChangePercent}%
                  </span>
                </div>
              </>
            )}
            {goldData?.fallback && (
              <p style={{ color: "#555", fontSize: "10px", marginTop: "4px" }}>* قیمت پیش‌فرض (خطا در دریافت)</p>
            )}
          </div>
        </div>

        {/* ── 3. Buy guide + Gift ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link href="/contact" style={{ textDecoration: "none", backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "20px", flex: 1, display: "block", transition: "border-color 0.2s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "#d4af37"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a"}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <div style={{ width: "36px", height: "36px", backgroundColor: "rgba(212,175,55,0.15)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BookOpen size={18} color="#d4af37" />
              </div>
              <div>
                <p style={{ color: "#888", fontSize: "11px" }}>راهنمای خرید</p>
                <h3 style={{ color: "#fff", fontSize: "14px", fontWeight: "700" }}>راهنمای خرید طلا</h3>
              </div>
            </div>
            <p style={{ color: "#888", fontSize: "12px", lineHeight: "1.7", marginBottom: "12px" }}>نکات مهم قبل از خرید از زیبایی و اعتماد</p>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#d4af37", fontSize: "12px", fontWeight: "600", border: "1px solid rgba(212,175,55,0.3)", padding: "6px 12px", borderRadius: "6px", backgroundColor: "rgba(212,175,55,0.08)" }}>
              مطالعه کنید
            </span>
          </Link>

          <Link href="/about" style={{ textDecoration: "none", backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "20px", flex: 1, display: "flex", alignItems: "center", gap: "14px", transition: "border-color 0.2s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "#d4af37"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a"}>
            <div style={{ width: "50px", height: "50px", backgroundColor: "rgba(212,175,55,0.15)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Gift size={24} color="#d4af37" />
            </div>
            <div>
              <h3 style={{ color: "#fff", fontSize: "14px", fontWeight: "700", marginBottom: "4px" }}>بسته‌بندی شیک</h3>
              <p style={{ color: "#888", fontSize: "12px", lineHeight: "1.6" }}>هدیه‌ای به یاد ماندگار</p>
              <span style={{ color: "#d4af37", fontSize: "11px", marginTop: "6px", display: "block" }}>بیشتر بدانید ←</span>
            </div>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .info-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
