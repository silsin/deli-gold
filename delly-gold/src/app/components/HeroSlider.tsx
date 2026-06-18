"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft, ChevronRight, TrendingUp, TrendingDown,
  RefreshCw, Calculator,
} from "lucide-react";

// ── Slide data ─────────────────────────────────────────────────────────────
const slides = [
  {
    id: 1,
    title: "زیبایی، ماندگار مثل طلا",
    subtitle: "مجموعه‌ای از بهترین طلاها و جواهرات",
    cta: "مشاهده محصولات",
    href: "/products",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1400&q=80",
    badge: "جدیدترین کالکشن",
  },
  {
    id: 2,
    title: "کالکشن ویژه بهار",
    subtitle: "طلاهای خاص برای لحظه‌های خاص",
    cta: "مشاهده کالکشن",
    href: "/collections",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1400&q=80",
    badge: "پیشنهاد ویژه",
  },
  {
    id: 3,
    title: "ویترین ویژه دلی گلد",
    subtitle: "بهترین پیشنهادها برای هر بودجه",
    cta: "مشاهده ویترین",
    href: "/showcase",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1400&q=80",
    badge: "محبوب‌ترین",
  },
];

const AUTO_PLAY = 5000;

// ── Sparkline SVG (tiny inline chart) ─────────────────────────────────────
function Sparkline({ data, isUp }: { data: number[]; isUp: boolean }) {
  if (data.length < 2) return null;
  const W = 120; const H = 36;
  const min = Math.min(...data); const max = Math.max(...data);
  const range = max - min || 1;
  const xStep = W / (data.length - 1);
  const toX = (i: number) => i * xStep;
  const toY = (v: number) => H - 4 - ((v - min) / range) * (H - 8);
  const pts = data.map((v, i) => `${toX(i)},${toY(v)}`).join(" L ");
  const area = `M 0,${H} L ${pts} L ${W},${H} Z`;
  const color = isUp ? "#10b981" : "#ef4444";
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sg)" />
      <path d={`M ${pts}`} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={toX(data.length - 1)} cy={toY(data[data.length - 1])} r="2.5" fill={color} />
    </svg>
  );
}

// ── Price Panel (embedded in hero) ────────────────────────────────────────
interface GoldData {
  price: number; high: number; low: number; open: number;
  changePercent: string; isUp: boolean; history: number[]; fallback?: boolean;
}

function PricePanel() {
  const [data, setData] = useState<GoldData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [markup, setMarkup] = useState(5);
  const [grams, setGrams] = useState("");
  const [karat, setKarat] = useState<18 | 24>(18);
  const countRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async (spinner = false) => {
    if (spinner) setRefreshing(true);
    try {
      const [pr, sr] = await Promise.all([
        fetch("/api/admin/gold-price", { cache: "no-store" }),
        fetch("/api/admin/settings"),
      ]);
      const pj = await pr.json(); const sj = await sr.json();
      if (pj.success) setData(pj.data);
      if (sj.success) setMarkup(parseFloat(sj.data?.gold_markup_percent ?? "5") || 5);
    } catch {}
    finally { setLoading(false); setRefreshing(false); setCountdown(30); }
  }, []);

  useEffect(() => {
    fetchData();
    const iv = setInterval(() => fetchData(), 30_000);
    countRef.current = setInterval(() => setCountdown(c => c <= 1 ? 30 : c - 1), 1000);
    return () => { clearInterval(iv); if (countRef.current) clearInterval(countRef.current); };
  }, [fetchData]);

  const price = data?.price ?? 0;
  const karatMul = karat === 24 ? 24 / 18 : 1;
  const pricePerGram = Math.round(price * karatMul * (1 + markup / 100));
  const calcResult = grams && parseFloat(grams) > 0
    ? Math.round(parseFloat(grams) * pricePerGram) : null;
  const isUp = data?.isUp ?? true;
  const trendColor = isUp ? "#10b981" : "#ef4444";

  return (
    <div className="hero-price-panel" style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      // Solid panel — no bleed-through from slider
      backgroundColor: "var(--theme-bg)",
      borderInlineStart: "1px solid color-mix(in srgb, var(--theme-accent) 15%, transparent)",
      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)",
      overflow: "hidden",
    }}>
      {/* Top accent line */}
      <div style={{ height: "2px", background: "linear-gradient(to left, var(--theme-accent), transparent)", flexShrink: 0 }} />

      <div style={{ padding: "18px 20px", overflowY: "auto", flex: 1 }}>

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <div>
            <p style={{ color: "var(--theme-text-muted)", fontSize: "10px", letterSpacing: "0.5px", marginBottom: "2px" }}>قیمت لحظه‌ای · TGJU</p>
            <p style={{ color: "var(--theme-text)", fontSize: "12px", fontWeight: "600" }}>طلای ۱۸ عیار</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {/* Live dot */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: trendColor, animation: "pulse-dot 2s ease-in-out infinite" }} />
              <span style={{ color: "var(--theme-text-muted)", fontSize: "9px" }}>{countdown}s</span>
            </div>
            <button onClick={() => fetchData(true)}
              style={{ background: "none", border: "none", cursor: "pointer", color: refreshing ? "var(--theme-accent)" : "var(--theme-text-muted)", padding: 0, display: "flex" }}>
              <RefreshCw size={11} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
            </button>
          </div>
        </div>

        {/* Price + sparkline */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "10px" }}>
          <div>
            {loading ? (
              <div style={{ color: "var(--theme-text-muted)", fontSize: "13px" }}>در حال دریافت...</div>
            ) : (
              <>
                <div style={{ color: "var(--theme-accent)", fontSize: "26px", fontWeight: "900", lineHeight: 1, letterSpacing: "-1px" }}>
                  {price.toLocaleString("fa-IR")}
                </div>
                <div style={{ color: "var(--theme-text-muted)", fontSize: "11px", marginTop: "2px" }}>تومان / گرم</div>
              </>
            )}
          </div>
          {data?.history && data.history.length > 1 && (
            <Sparkline data={data.history.slice(-12)} isUp={isUp} />
          )}
        </div>

        {/* Change badge + OHLC */}
        {!loading && data && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "3px", backgroundColor: isUp ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${isUp ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: "20px", padding: "3px 9px" }}>
              {isUp ? <TrendingUp size={10} color={trendColor} /> : <TrendingDown size={10} color={trendColor} />}
              <span style={{ color: trendColor, fontSize: "11px", fontWeight: "700" }}>{isUp ? "+" : "-"}{data.changePercent}%</span>
            </div>
            <span style={{ color: "var(--theme-text-muted)", fontSize: "10px" }}>
              <span style={{ color: "#10b981" }}>↑{data.high.toLocaleString("fa-IR")}</span>
              {" "}
              <span style={{ color: "#ef4444" }}>↓{data.low.toLocaleString("fa-IR")}</span>
            </span>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.06)", marginBottom: "14px" }} />

        {/* Calculator */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
          <Calculator size={12} color="var(--theme-accent)" />
          <span style={{ color: "var(--theme-accent)", fontSize: "11px", fontWeight: "700", letterSpacing: "0.3px" }}>محاسبه‌گر سریع</span>
        </div>

        {/* Karat toggle */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
          {([18, 24] as const).map(k => (
            <button key={k} onClick={() => setKarat(k)}
              style={{ flex: 1, backgroundColor: karat === k ? "var(--theme-accent)" : "rgba(255,255,255,0.05)", color: karat === k ? "#000" : "var(--theme-text-muted)", border: `1px solid ${karat === k ? "var(--theme-accent)" : "rgba(255,255,255,0.08)"}`, borderRadius: "6px", padding: "5px", fontSize: "11px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
              {k} عیار
            </button>
          ))}
        </div>

        {/* Weight input */}
        <div style={{ position: "relative", marginBottom: "10px" }}>
          <input
            type="number"
            value={grams}
            onChange={e => setGrams(e.target.value)}
            placeholder="وزن (گرم)"
            min="0" step="0.01"
            style={{
              width: "100%",
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              padding: "8px 12px",
              color: "var(--theme-text)",
              fontSize: "13px",
              outline: "none",
              direction: "ltr",
              fontFamily: "inherit",
              transition: "border-color 0.2s",
            }}
            onFocus={e => (e.target.style.borderColor = "rgba(212,175,55,0.5)")}
            onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
          />
          <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--theme-text-muted)", fontSize: "11px", pointerEvents: "none" }}>گرم</span>
        </div>

        {/* Price per gram row */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ color: "var(--theme-text-muted)", fontSize: "10px" }}>قیمت هر گرم ({karat} عیار)</span>
          <span style={{ color: "var(--theme-text-muted)", fontSize: "11px", fontWeight: "600" }}>
            {loading ? "..." : pricePerGram.toLocaleString("fa-IR")} ت
          </span>
        </div>

        {/* Result */}
        {calcResult !== null ? (
          <div style={{ backgroundColor: "color-mix(in srgb, var(--theme-accent) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--theme-accent) 25%, transparent)", borderRadius: "8px", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "var(--theme-text-muted)", fontSize: "11px" }}>قیمت کل</span>
            <div style={{ textAlign: "left" }}>
              <span style={{ color: "var(--theme-accent)", fontSize: "16px", fontWeight: "900" }}>{calcResult.toLocaleString("fa-IR")}</span>
              <span style={{ color: "var(--theme-text-muted)", fontSize: "10px", marginRight: "4px" }}>تومان</span>
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
            <span style={{ color: "var(--theme-text-muted)", fontSize: "11px" }}>وزن را وارد کنید تا قیمت محاسبه شود</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Hero Slider ───────────────────────────────────────────────────────────
export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number) => {
    if (animating || idx === current) return;
    setAnimating(true);
    setCurrent(idx);
    setProgress(0);
    setTimeout(() => setAnimating(false), 700);
  }, [animating, current]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);
  const prev = useCallback(() => goTo(current === 0 ? slides.length - 1 : current - 1), [current, goTo]);

  useEffect(() => {
    if (paused) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      return;
    }
    setProgress(0);
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % slides.length);
      setProgress(0);
    }, AUTO_PLAY);
    progressRef.current = setInterval(() => {
      setProgress(p => Math.min(p + 50 / AUTO_PLAY * 100, 100));
    }, 50);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [paused, current]);

  return (
    <section
      className="hero-section"
      style={{
        position: "relative",
        height: "560px",
        overflow: "hidden",
        backgroundColor: "var(--theme-bg)",
        display: "grid",
        gridTemplateColumns: "320px minmax(0, 1fr)",
        direction: "rtl",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Price column (RTL: right side) ── */}
      <aside className="hero-price-aside" style={{ position: "relative", zIndex: 30, minHeight: 0 }}>
        <PricePanel />
      </aside>

      {/* ── Slider column ── */}
      <div className="hero-slider-area" style={{ position: "relative", overflow: "hidden", minHeight: 0 }}>
      {slides.map((slide, idx) => {
        const isActive = idx === current;
        return (
          <div key={slide.id} aria-hidden={!isActive} style={{
            position: "absolute", inset: 0,
            opacity: isActive ? 1 : 0,
            transform: isActive ? "scale(1)" : "scale(1.04)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
            pointerEvents: isActive ? "auto" : "none",
          }}>
            {/* BG image */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${slide.image})`,
              backgroundSize: "cover", backgroundPosition: "center",
              filter: "brightness(0.28)",
              transform: isActive ? "scale(1.06)" : "scale(1)",
              transition: "transform 6s ease-out",
            }} />

            {/* Gradient over slider only */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to right, color-mix(in srgb, var(--theme-bg) 85%, transparent) 0%, rgba(10,10,10,0.4) 45%, rgba(10,10,10,0.15) 100%)",
            }} />

            {/* Slide text content */}
            <div className="hero-slide-text" style={{
              position: "relative", maxWidth: "720px",
              margin: "0 auto", padding: "0 48px 0 72px",
              width: "100%", height: "100%",
              display: "flex", alignItems: "center",
            }}>
              <div style={{
                opacity: isActive ? 1 : 0,
                transform: isActive ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
              }}>
                <span style={{
                  display: "inline-block",
                  backgroundColor: "color-mix(in srgb, var(--theme-accent) 20%, transparent)",
                  border: "1px solid var(--theme-accent)",
                  color: "var(--theme-accent)",
                  fontSize: "12px", padding: "4px 14px",
                  borderRadius: "20px", marginBottom: "18px",
                }}>
                  {slide.badge}
                </span>
                <h1 style={{
                  fontSize: "38px", fontWeight: "800",
                  color: "var(--theme-text)", marginBottom: "12px",
                  lineHeight: "1.25", textShadow: "0 2px 16px rgba(0,0,0,0.6)",
                }}>
                  {slide.title}
                </h1>
                <p style={{ color: "var(--theme-text-muted)", fontSize: "15px", marginBottom: "30px", lineHeight: "1.6" }}>
                  {slide.subtitle}
                </p>
                <a href={slide.href} style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  backgroundColor: "var(--theme-accent)", color: "#000",
                  padding: "12px 28px", borderRadius: "6px",
                  fontWeight: "700", fontSize: "15px", textDecoration: "none",
                  boxShadow: "0 4px 20px color-mix(in srgb, var(--theme-accent) 35%, transparent)",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "var(--theme-accent-light)"; el.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "var(--theme-accent)"; el.style.transform = "translateY(0)"; }}>
                  <ChevronLeft size={17} /> {slide.cta}
                </a>
              </div>
            </div>
          </div>
        );
      })}

      {/* ── Arrows (inside slider area only) ── */}
      {[
        { onClick: prev, side: "right", label: "قبلی", icon: <ChevronRight size={20} /> },
        { onClick: next, side: "left",  label: "بعدی", icon: <ChevronLeft size={20} /> },
      ].map(({ onClick, side, label, icon }) => (
        <button key={side} onClick={onClick} aria-label={label}
          style={{
            position: "absolute", [side]: "20px", top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "color-mix(in srgb, var(--theme-accent) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--theme-accent) 35%, transparent)",
            color: "var(--theme-accent)", width: "44px", height: "44px",
            borderRadius: "50%", display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer", zIndex: 10,
            backdropFilter: "blur(4px)", transition: "all 0.2s",
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "color-mix(in srgb, var(--theme-accent) 28%, transparent)"; el.style.transform = "translateY(-50%) scale(1.1)"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "color-mix(in srgb, var(--theme-accent) 12%, transparent)"; el.style.transform = "translateY(-50%) scale(1)"; }}>
          {icon}
        </button>
      ))}

      {/* ── Bottom: dots + progress ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: "10px", paddingBottom: "18px", zIndex: 10,
      }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {slides.map((_, idx) => (
            <button key={idx} onClick={() => goTo(idx)} aria-label={`اسلاید ${idx + 1}`}
              style={{
                width: idx === current ? "28px" : "8px", height: "8px",
                borderRadius: "4px",
                backgroundColor: idx === current ? "var(--theme-accent)" : "color-mix(in srgb, var(--theme-accent) 35%, transparent)",
                border: "none", cursor: "pointer", padding: 0,
                transition: "width 0.4s ease, background-color 0.3s",
              }} />
          ))}
        </div>
        {!paused ? (
          <div style={{ width: "60px", height: "2px", backgroundColor: "color-mix(in srgb, var(--theme-accent) 15%, transparent)", borderRadius: "1px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, backgroundColor: "var(--theme-accent)", transition: "width 0.05s linear" }} />
          </div>
        ) : (
          <span style={{ color: "color-mix(in srgb, var(--theme-accent) 40%, transparent)", fontSize: "10px" }}>■ متوقف</span>
        )}
      </div>

      {/* ── Slide counter ── */}
      <div style={{
        position: "absolute", top: "18px", left: "18px",
        color: "rgba(212,175,55,0.5)", fontSize: "11px",
        fontWeight: "600", letterSpacing: "1px", zIndex: 10,
      }}>
        {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
      </div>
      </div>{/* /hero-slider-area */}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
        @media (max-width: 900px) {
          .hero-section {
            grid-template-columns: 1fr !important;
            height: 480px !important;
          }
          .hero-price-aside {
            display: none !important;
          }
          .hero-slider-area .hero-slide-text {
            padding: 0 24px !important;
          }
        }
      `}</style>
    </section>
  );
}
