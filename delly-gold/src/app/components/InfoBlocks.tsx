"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Gift,
  RefreshCw,
  Activity,
} from "lucide-react";
import Link from "next/link";

interface GoldData {
  price: number;
  open: number;
  high: number;
  low: number;
  changeAmount: number;
  changePercent: string;
  isUp: boolean;
  history: number[];
  dates: string[];
  updatedAt?: string;
  fallback?: boolean;
  stale?: boolean;
  cached?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(d: string) {
  if (!d) return "";
  try {
    const parts = d.split("/");
    const dt = new Date(
      parseInt(parts[0]),
      parseInt(parts[1]) - 1,
      parseInt(parts[2])
    );
    return dt.toLocaleDateString("fa-IR", { month: "short", day: "numeric" });
  } catch {
    return d;
  }
}

// ── SVG Line/Area Chart ──────────────────────────────────────────────────────
function GoldLineChart({
  history,
  dates,
  isUp,
  loading,
}: {
  history: number[];
  dates: string[];
  isUp: boolean;
  loading: boolean;
}) {
  const W = 320;
  const H = 100;
  const PAD = { top: 8, right: 8, bottom: 20, left: 4 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const prevHistory = useRef<number[]>([]);
  const [animated, setAnimated] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  useEffect(() => {
    if (
      history.length > 0 &&
      JSON.stringify(history) !== JSON.stringify(prevHistory.current)
    ) {
      setAnimated(false);
      const t = setTimeout(() => setAnimated(true), 50);
      prevHistory.current = history;
      return () => clearTimeout(t);
    }
  }, [history]);

  if (loading || history.length < 2) {
    return (
      <div
        style={{
          flex: 1,
          backgroundColor: "#121212",
          borderRadius: "8px",
          marginBottom: "12px",
          minHeight: "110px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "3px",
            alignItems: "flex-end",
            height: "60px",
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: "4px",
                height: `${20 + Math.sin(i * 0.8) * 15 + 20}%`,
                backgroundColor: "rgba(212,175,55,0.12)",
                borderRadius: "2px",
                animation: `pulse 1.5s ease-in-out ${i * 0.1}s infinite alternate`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  const minP = Math.min(...history);
  const maxP = Math.max(...history);
  const range = maxP - minP || 1;

  const xStep = innerW / (history.length - 1);

  const toX = (i: number) => PAD.left + i * xStep;
  const toY = (p: number) =>
    PAD.top + innerH - ((p - minP) / range) * innerH;

  // Build SVG path
  const points = history.map((p, i) => `${toX(i)},${toY(p)}`);
  const linePath = `M ${points.join(" L ")}`;
  const areaPath = `M ${toX(0)},${PAD.top + innerH} L ${points.join(" L ")} L ${toX(history.length - 1)},${PAD.top + innerH} Z`;

  const color = isUp ? "#10b981" : "#ef4444";
  const colorDim = isUp ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.12)";
  const gradId = `goldGrad_${isUp ? "up" : "dn"}`;

  // Show a few date labels (first, middle, last)
  const labelIndices =
    dates.length > 0
      ? [0, Math.floor((history.length - 1) / 2), history.length - 1]
      : [];

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "#121212",
        borderRadius: "8px",
        padding: "6px 4px 0",
        marginBottom: "12px",
        position: "relative",
        userSelect: "none",
      }}
    >
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
          {/* Clip for animation */}
          <clipPath id="chartClip">
            <rect
              x={PAD.left}
              y={0}
              width={animated ? innerW : 0}
              height={H}
              style={{ transition: "width 1s ease-out" }}
            />
          </clipPath>
        </defs>

        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={PAD.left}
            y1={PAD.top + innerH * (1 - t)}
            x2={PAD.left + innerW}
            y2={PAD.top + innerH * (1 - t)}
            stroke="#222"
            strokeWidth="1"
          />
        ))}

        {/* Area fill */}
        <path
          d={areaPath}
          fill={`url(#${gradId})`}
          clipPath="url(#chartClip)"
        />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinejoin="round"
          strokeLinecap="round"
          clipPath="url(#chartClip)"
        />

        {/* Date labels */}
        {labelIndices.map((idx) => (
          <text
            key={idx}
            x={toX(idx)}
            y={H - 3}
            textAnchor={
              idx === 0 ? "start" : idx === history.length - 1 ? "end" : "middle"
            }
            fontSize="7"
            fill="#555"
          >
            {formatDate(dates[idx] ?? "")}
          </text>
        ))}

        {/* Hover dots + invisible hit targets */}
        {history.map((p, i) => (
          <g key={i}>
            <rect
              x={toX(i) - xStep / 2}
              y={0}
              width={xStep}
              height={H}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{ cursor: "crosshair" }}
            />
            {hoverIdx === i && (
              <>
                <line
                  x1={toX(i)}
                  y1={PAD.top}
                  x2={toX(i)}
                  y2={PAD.top + innerH}
                  stroke={color}
                  strokeWidth="1"
                  strokeDasharray="3,3"
                  opacity="0.6"
                />
                <circle
                  cx={toX(i)}
                  cy={toY(p)}
                  r="3.5"
                  fill={color}
                  stroke="#121212"
                  strokeWidth="1.5"
                />
              </>
            )}
          </g>
        ))}

        {/* Latest dot */}
        {hoverIdx === null && history.length > 0 && (
          <circle
            cx={toX(history.length - 1)}
            cy={toY(history[history.length - 1])}
            r="3"
            fill={color}
            stroke="#121212"
            strokeWidth="1.5"
          />
        )}
      </svg>

      {/* Tooltip */}
      {hoverIdx !== null && (
        <div
          style={{
            position: "absolute",
            top: "6px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#1a1a1a",
            border: `1px solid ${colorDim}`,
            borderRadius: "6px",
            padding: "4px 8px",
            fontSize: "10px",
            color: "#fff",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          <span style={{ color }}>
            {history[hoverIdx].toLocaleString("fa-IR")}
          </span>
          <span style={{ color: "#666", marginRight: "4px" }}> تومان</span>
          {dates[hoverIdx] && (
            <span style={{ color: "#555", marginRight: "4px" }}>
              {" "}
              · {formatDate(dates[hoverIdx])}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function InfoBlocks() {
  const [grams, setGrams] = useState("");
  const [karat, setKarat] = useState<18 | 24>(18);
  const [goldData, setGoldData] = useState<GoldData | null>(null);
  const [markup, setMarkup] = useState(5);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [countdown, setCountdown] = useState(30);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPrice = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const [priceRes, settingsRes] = await Promise.all([
        fetch("/api/admin/gold-price", { cache: "no-store" }),
        fetch("/api/admin/settings"),
      ]);
      const priceJson = await priceRes.json();
      const settingsJson = await settingsRes.json();

      if (priceJson.success) {
        setGoldData(priceJson.data);
        setLastUpdated(new Date().toLocaleTimeString("fa-IR"));
      }
      if (settingsJson.success) {
        const m = parseFloat(settingsJson.data?.gold_markup_percent ?? "5");
        setMarkup(isNaN(m) ? 5 : m);
      }
    } catch {
      // keep current data
    } finally {
      setLoadingPrice(false);
      setRefreshing(false);
      setCountdown(30);
    }
  }, []);

  useEffect(() => {
    fetchPrice();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchPrice(), 30 * 1000);

    // Countdown ticker
    countdownRef.current = setInterval(() => {
      setCountdown((c) => (c <= 1 ? 30 : c - 1));
    }, 1000);

    return () => {
      clearInterval(interval);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [fetchPrice]);

  // Price calculations
  const basePrice = goldData?.price ?? 0;
  const karatMultiplier = karat === 24 ? 24 / 18 : 1;
  const priceWithMarkup = Math.round(
    basePrice * karatMultiplier * (1 + markup / 100)
  );
  const calcResult =
    grams && parseFloat(grams) > 0
      ? Math.round(parseFloat(grams) * priceWithMarkup)
      : null;

  const history = goldData?.history ?? [];
  const dates = goldData?.dates ?? [];
  const isUp = goldData?.isUp ?? true;
  const changePercent = goldData?.changePercent ?? "0";
  const changeAmount = goldData?.changeAmount ?? 0;
  const high = goldData?.high ?? 0;
  const low = goldData?.low ?? 0;
  const open = goldData?.open ?? 0;

  return (
    <section
      style={{ maxWidth: "1280px", margin: "40px auto", padding: "0 16px" }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
        }}
        className="info-grid"
      >
        {/* ── 1. Gold Calculator ── */}
        <div
          style={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "rgba(212,175,55,0.15)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Calculator size={20} color="#d4af37" />
            </div>
            <div>
              <p style={{ color: "#888", fontSize: "11px" }}>محاسبه‌گر طلا</p>
              <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: "700" }}>
                قیمت‌یابی طلا
              </h3>
            </div>
          </div>

          {/* Karat selector */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            {([18, 24] as const).map((k) => (
              <button
                key={k}
                onClick={() => setKarat(k)}
                style={{
                  flex: 1,
                  backgroundColor: karat === k ? "#d4af37" : "#121212",
                  color: karat === k ? "#000" : "#888",
                  border: `1px solid ${karat === k ? "#d4af37" : "#333"}`,
                  borderRadius: "6px",
                  padding: "7px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              >
                {k} عیار
              </button>
            ))}
          </div>

          {/* Weight input */}
          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                color: "#888",
                fontSize: "12px",
                display: "block",
                marginBottom: "6px",
              }}
            >
              وزن طلا (گرم)
            </label>
            <input
              type="number"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              placeholder="مثلاً ۲.۵"
              min="0"
              step="0.01"
              style={{
                width: "100%",
                backgroundColor: "#121212",
                border: "1px solid #333",
                borderRadius: "6px",
                padding: "10px 12px",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                direction: "ltr",
              }}
            />
          </div>

          {/* Price per gram */}
          <div
            style={{
              backgroundColor: "#121212",
              borderRadius: "6px",
              padding: "8px 12px",
              marginBottom: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#555", fontSize: "11px" }}>
              قیمت هر گرم ({karat} عیار)
            </span>
            <span
              style={{ color: "#d4af37", fontSize: "13px", fontWeight: "700" }}
            >
              {loadingPrice ? "..." : priceWithMarkup.toLocaleString("fa-IR")}{" "}
              تومان
            </span>
          </div>

          {/* Result */}
          {calcResult !== null && (
            <div
              style={{
                backgroundColor: "rgba(212,175,55,0.1)",
                border: "1px solid rgba(212,175,55,0.3)",
                borderRadius: "6px",
                padding: "12px",
                marginBottom: "12px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  color: "#888",
                  fontSize: "11px",
                  marginBottom: "4px",
                }}
              >
                قیمت تخمینی
              </p>
              <p
                style={{
                  color: "#d4af37",
                  fontSize: "20px",
                  fontWeight: "800",
                }}
              >
                {calcResult.toLocaleString("fa-IR")}
              </p>
              <p style={{ color: "#888", fontSize: "11px" }}>تومان</p>
            </div>
          )}

          <Link
            href="/products"
            style={{
              display: "block",
              width: "100%",
              backgroundColor: "#d4af37",
              color: "#000",
              borderRadius: "6px",
              padding: "10px",
              fontWeight: "700",
              fontSize: "14px",
              cursor: "pointer",
              textAlign: "center",
              textDecoration: "none",
            }}
          >
            مشاهده محصولات
          </Link>
        </div>

        {/* ── 2. Live Gold Price Chart ── */}
        <div
          style={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "12px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "rgba(212,175,55,0.15)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Activity size={20} color="#d4af37" />
              </div>
              <div>
                <p style={{ color: "#888", fontSize: "11px" }}>
                  داده از TGJU · بروز هر ۳۰ ثانیه
                </p>
                <h3
                  style={{ color: "#fff", fontSize: "15px", fontWeight: "700" }}
                >
                  قیمت لحظه‌ای طلا ۱۸ عیار
                </h3>
              </div>
            </div>

            {/* Refresh + countdown */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
              }}
            >
              <button
                onClick={() => fetchPrice(true)}
                title="بروزرسانی دستی"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: refreshing ? "#d4af37" : "#555",
                  padding: "4px",
                  transition: "color 0.2s",
                }}
              >
                <RefreshCw
                  size={14}
                  style={{
                    animation: refreshing ? "spin 1s linear infinite" : "none",
                  }}
                />
              </button>
              {!loadingPrice && (
                <span style={{ color: "#444", fontSize: "9px" }}>
                  {countdown}s
                </span>
              )}
            </div>
          </div>

          {/* Current price + change badge */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            {loadingPrice ? (
              <span style={{ color: "#555", fontSize: "22px" }}>
                در حال بارگذاری...
              </span>
            ) : (
              <>
                <span
                  style={{
                    color: "#d4af37",
                    fontSize: "28px",
                    fontWeight: "800",
                    lineHeight: 1,
                  }}
                >
                  {basePrice.toLocaleString("fa-IR")}
                </span>
                <span style={{ color: "#888", fontSize: "12px" }}>تومان/گرم</span>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px",
                    backgroundColor: isUp
                      ? "rgba(16,185,129,0.15)"
                      : "rgba(239,68,68,0.15)",
                    border: `1px solid ${isUp ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                    borderRadius: "20px",
                    padding: "2px 8px",
                  }}
                >
                  {isUp ? (
                    <TrendingUp size={10} color="#10b981" />
                  ) : (
                    <TrendingDown size={10} color="#ef4444" />
                  )}
                  <span
                    style={{
                      color: isUp ? "#10b981" : "#ef4444",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                  >
                    {isUp ? "+" : "-"}
                    {changePercent}%
                  </span>
                </div>
              </>
            )}
          </div>

          {/* OHLC mini-row */}
          {!loadingPrice && basePrice > 0 && (
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "10px",
                flexWrap: "wrap",
              }}
            >
              {[
                { label: "باز", value: open },
                { label: "بالا", value: high, color: "#10b981" },
                { label: "پایین", value: low, color: "#ef4444" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    backgroundColor: "#121212",
                    borderRadius: "4px",
                    padding: "3px 7px",
                    fontSize: "10px",
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  <span style={{ color: "#555" }}>{item.label}: </span>
                  <span style={{ color: item.color ?? "#aaa", fontWeight: "600" }}>
                    {item.value.toLocaleString("fa-IR")}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* SVG Chart */}
          <GoldLineChart
            history={history}
            dates={dates}
            isUp={isUp}
            loading={loadingPrice}
          />

          {/* Footer meta */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#444", fontSize: "10px" }}>
              {history.length > 0 ? `${history.length} روز گذشته` : ""}
            </span>
            <span style={{ color: "#444", fontSize: "10px" }}>
              {lastUpdated ? `آخرین بروز: ${lastUpdated}` : ""}
            </span>
          </div>

          {goldData?.fallback && (
            <p
              style={{ color: "#555", fontSize: "10px", marginTop: "4px", textAlign: "center" }}
            >
              * قیمت پیش‌فرض (خطا در اتصال به TGJU)
            </p>
          )}
          {goldData?.stale && (
            <p
              style={{ color: "#555", fontSize: "10px", marginTop: "4px", textAlign: "center" }}
            >
              * آخرین داده ذخیره‌شده
            </p>
          )}
        </div>

        {/* ── 3. Buy guide + Gift ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link
            href="/contact"
            style={{
              textDecoration: "none",
              backgroundColor: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: "12px",
              padding: "20px",
              flex: 1,
              display: "block",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = "#d4af37")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a")
            }
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  backgroundColor: "rgba(212,175,55,0.15)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BookOpen size={18} color="#d4af37" />
              </div>
              <div>
                <p style={{ color: "#888", fontSize: "11px" }}>راهنمای خرید</p>
                <h3
                  style={{ color: "#fff", fontSize: "14px", fontWeight: "700" }}
                >
                  راهنمای خرید طلا
                </h3>
              </div>
            </div>
            <p
              style={{
                color: "#888",
                fontSize: "12px",
                lineHeight: "1.7",
                marginBottom: "12px",
              }}
            >
              نکات مهم قبل از خرید از زیبایی و اعتماد
            </p>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                color: "#d4af37",
                fontSize: "12px",
                fontWeight: "600",
                border: "1px solid rgba(212,175,55,0.3)",
                padding: "6px 12px",
                borderRadius: "6px",
                backgroundColor: "rgba(212,175,55,0.08)",
              }}
            >
              مطالعه کنید
            </span>
          </Link>

          <Link
            href="/about"
            style={{
              textDecoration: "none",
              backgroundColor: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: "12px",
              padding: "20px",
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "14px",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = "#d4af37")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a")
            }
          >
            <div
              style={{
                width: "50px",
                height: "50px",
                backgroundColor: "rgba(212,175,55,0.15)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Gift size={24} color="#d4af37" />
            </div>
            <div>
              <h3
                style={{
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "700",
                  marginBottom: "4px",
                }}
              >
                بسته‌بندی شیک
              </h3>
              <p style={{ color: "#888", fontSize: "12px", lineHeight: "1.6" }}>
                هدیه‌ای به یاد ماندگار
              </p>
              <span
                style={{
                  color: "#d4af37",
                  fontSize: "11px",
                  marginTop: "6px",
                  display: "block",
                }}
              >
                بیشتر بدانید ←
              </span>
            </div>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          from { opacity: 0.3; }
          to   { opacity: 0.7; }
        }
        @media (max-width: 900px) {
          .info-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
