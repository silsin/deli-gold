"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { TrendingUp, TrendingDown, RefreshCw, Calculator } from "lucide-react";

interface GoldData {
  price: number;
  high: number;
  low: number;
  open: number;
  changePercent: string;
  isUp: boolean;
  fallback?: boolean;
  stale?: boolean;
}

export default function GoldTicker() {
  const [data, setData] = useState<GoldData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [markup, setMarkup] = useState(5);
  // Mini calculator
  const [grams, setGrams] = useState("");
  const [calcOpen, setCalcOpen] = useState(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch_ = useCallback(async (spinner = false) => {
    if (spinner) setRefreshing(true);
    try {
      const [pr, sr] = await Promise.all([
        fetch("/api/admin/gold-price", { cache: "no-store" }),
        fetch("/api/admin/settings"),
      ]);
      const pj = await pr.json();
      const sj = await sr.json();
      if (pj.success) setData(pj.data);
      if (sj.success) setMarkup(parseFloat(sj.data?.gold_markup_percent ?? "5") || 5);
    } catch {}
    finally { setLoading(false); setRefreshing(false); setCountdown(30); }
  }, []);

  useEffect(() => {
    fetch_();
    const iv = setInterval(() => fetch_(), 30_000);
    countdownRef.current = setInterval(() => setCountdown(c => c <= 1 ? 30 : c - 1), 1000);
    return () => { clearInterval(iv); if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [fetch_]);

  const price = data?.price ?? 0;
  const priceWithMarkup = Math.round(price * (1 + markup / 100));
  const calcResult = grams && parseFloat(grams) > 0
    ? Math.round(parseFloat(grams) * priceWithMarkup)
    : null;
  const isUp = data?.isUp ?? true;
  const color = isUp ? "#10b981" : "#ef4444";

  return (
    <div style={{
      backgroundColor: "#111",
      borderBottom: "1px solid #2a2a2a",
      borderTop: "1px solid #1a1a1a",
      position: "relative",
    }}>
      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        gap: "0",
        height: "48px",
        flexWrap: "nowrap",
        overflow: "hidden",
      }}>

        {/* Label */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          paddingLeft: "16px",
          borderLeft: "1px solid #2a2a2a",
          flexShrink: 0,
        }}>
          <div style={{
            width: "6px", height: "6px", borderRadius: "50%",
            backgroundColor: loading ? "#555" : color,
            animation: !loading ? "pulse-dot 2s ease-in-out infinite" : "none",
          }} />
          <span style={{ color: "#888", fontSize: "11px", fontWeight: "600", letterSpacing: "0.5px" }}>
            طلای ۱۸ عیار
          </span>
        </div>

        {/* Price */}
        <div style={{ padding: "0 16px", borderLeft: "1px solid #2a2a2a", flexShrink: 0 }}>
          {loading ? (
            <span style={{ color: "#444", fontSize: "13px" }}>در حال دریافت...</span>
          ) : (
            <span style={{ color: "#d4af37", fontSize: "15px", fontWeight: "800", letterSpacing: "-0.5px" }}>
              {price.toLocaleString("fa-IR")}
              <span style={{ color: "#666", fontSize: "11px", fontWeight: "400", marginRight: "4px" }}>تومان/گرم</span>
            </span>
          )}
        </div>

        {/* Change badge */}
        {!loading && data && (
          <div style={{
            padding: "0 16px",
            borderLeft: "1px solid #2a2a2a",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}>
            {isUp ? <TrendingUp size={12} color={color} /> : <TrendingDown size={12} color={color} />}
            <span style={{ color, fontSize: "12px", fontWeight: "700" }}>
              {isUp ? "+" : "-"}{data.changePercent}%
            </span>
          </div>
        )}

        {/* High / Low */}
        {!loading && data && (
          <div style={{
            padding: "0 16px",
            borderLeft: "1px solid #2a2a2a",
            flexShrink: 0,
            display: "flex",
            gap: "12px",
          }}>
            <span style={{ fontSize: "11px" }}>
              <span style={{ color: "#555" }}>بالا: </span>
              <span style={{ color: "#10b981" }}>{data.high.toLocaleString("fa-IR")}</span>
            </span>
            <span style={{ fontSize: "11px" }}>
              <span style={{ color: "#555" }}>پایین: </span>
              <span style={{ color: "#ef4444" }}>{data.low.toLocaleString("fa-IR")}</span>
            </span>
          </div>
        )}

        {/* Mini calculator toggle */}
        <button
          onClick={() => setCalcOpen(o => !o)}
          style={{
            marginRight: "auto",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            backgroundColor: calcOpen ? "rgba(212,175,55,0.12)" : "transparent",
            border: calcOpen ? "1px solid rgba(212,175,55,0.3)" : "1px solid transparent",
            borderRadius: "6px",
            padding: "4px 10px",
            color: calcOpen ? "#d4af37" : "#666",
            cursor: "pointer",
            fontSize: "12px",
            fontFamily: "inherit",
            transition: "all 0.2s",
            flexShrink: 0,
          }}
        >
          <Calculator size={13} />
          محاسبه
        </button>

        {/* Refresh + countdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px", paddingRight: "8px", flexShrink: 0 }}>
          <button
            onClick={() => fetch_(true)}
            title="بروزرسانی"
            style={{ background: "none", border: "none", cursor: "pointer", color: refreshing ? "#d4af37" : "#444", padding: "2px", display: "flex" }}
          >
            <RefreshCw size={12} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
          </button>
          {!loading && (
            <span style={{ color: "#333", fontSize: "9px" }}>{countdown}s</span>
          )}
        </div>
      </div>

      {/* Mini calculator dropdown */}
      {calcOpen && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#161616",
          border: "1px solid #2a2a2a",
          borderRadius: "10px",
          padding: "16px",
          width: "280px",
          zIndex: 50,
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          animation: "fadeDown 0.15s ease",
        }}>
          <p style={{ color: "#888", fontSize: "11px", marginBottom: "10px" }}>
            قیمت هر گرم (با اجرت {markup}%): <strong style={{ color: "#d4af37" }}>{priceWithMarkup.toLocaleString("fa-IR")} ت</strong>
          </p>
          <div style={{ position: "relative", marginBottom: "10px" }}>
            <input
              type="number"
              value={grams}
              onChange={e => setGrams(e.target.value)}
              placeholder="وزن به گرم..."
              autoFocus
              min="0"
              step="0.01"
              style={{
                width: "100%",
                backgroundColor: "#121212",
                border: "1px solid #333",
                borderRadius: "6px",
                padding: "8px 12px",
                color: "#fff",
                fontSize: "13px",
                outline: "none",
                direction: "ltr",
                fontFamily: "inherit",
              }}
              onFocus={e => (e.target.style.borderColor = "#d4af37")}
              onBlur={e => (e.target.style.borderColor = "#333")}
            />
          </div>
          {calcResult !== null ? (
            <div style={{
              backgroundColor: "rgba(212,175,55,0.1)",
              border: "1px solid rgba(212,175,55,0.25)",
              borderRadius: "6px",
              padding: "10px 12px",
              textAlign: "center",
            }}>
              <p style={{ color: "#888", fontSize: "10px", marginBottom: "3px" }}>قیمت تخمینی</p>
              <p style={{ color: "#d4af37", fontSize: "18px", fontWeight: "800" }}>
                {calcResult.toLocaleString("fa-IR")}
                <span style={{ color: "#666", fontSize: "11px", fontWeight: "400", marginRight: "4px" }}>تومان</span>
              </p>
            </div>
          ) : (
            <p style={{ color: "#555", fontSize: "11px", textAlign: "center" }}>وزن را وارد کنید</p>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
