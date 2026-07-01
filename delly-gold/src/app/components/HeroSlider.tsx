"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const slides = [
  {
    id: 1,
    eyebrow: "کالکشن بهار ۱۴۰۴",
    tag:     "DELLY GOLD  ·  NEW COLLECTION",
    title:   ["جدیدترین", "گردنبندهای", "دلی‌گلد"],
    sub:     "ظریف‌ترین طرح‌ها برای لحظه‌های خاص",
    cta:     { label: "مشاهده محصولات", href: "/products" },
    cta2:    { label: "خرید اقساطی",   href: "/contact" },
    image:   "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1400&q=90",
    bg:      "#f2ebe0",
    accent:  "#c8a12a",
  },
  {
    id: 2,
    eyebrow: "پرفروش‌ترین‌های فصل",
    tag:     "DELLY GOLD  ·  BESTSELLERS",
    title:   ["انگشترهای", "ویژه فصل", ""],
    sub:     "طرح‌های کلاسیک و مدرن با بهترین اجرت",
    cta:     { label: "مشاهده انگشترها", href: "/products?category=rings" },
    cta2:    { label: "پرو مجازی",        href: "/tryon" },
    image:   "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1400&q=90",
    bg:      "#ede5d8",
    accent:  "#b8860b",
  },
  {
    id: 3,
    eyebrow: "کمترین اجرت",
    tag:     "DELLY GOLD  ·  LOW FEE",
    title:   ["طلای", "کم‌اجرت", "دلی‌گلد"],
    sub:     "محصولات با کمترین اجرت ساخت در بازار",
    cta:     { label: "مشاهده دستبندها", href: "/products?category=bracelets" },
    cta2:    { label: "تماس با ما",       href: "/contact" },
    image:   "https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=1400&q=90",
    bg:      "#e8e0d5",
    accent:  "#c8a12a",
  },
];

const INTERVAL = 6000;

export default function HeroSlider() {
  const [cur, setCur]       = useState(0);
  const [prev_, setPrev]    = useState<number | null>(null);
  const [dir, setDir]       = useState<"next" | "prev">("next");
  const [animating, setAnim] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const tRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number, d: "next" | "prev" = "next") => {
    if (animating || idx === cur) return;
    setDir(d);
    setPrev(cur);
    setAnim(true);
    setCur(idx);
    setProgress(0);
    setTimeout(() => { setAnim(false); setPrev(null); }, 800);
  }, [animating, cur]);

  const next = useCallback(() => goTo((cur + 1) % slides.length, "next"), [cur, goTo]);
  const prev = useCallback(() => goTo(cur === 0 ? slides.length - 1 : cur - 1, "prev"), [cur, goTo]);

  useEffect(() => {
    if (paused) {
      tRef.current && clearInterval(tRef.current);
      pRef.current && clearInterval(pRef.current);
      return;
    }
    setProgress(0);
    tRef.current = setInterval(() => { setCur(c => (c + 1) % slides.length); setPrev(c => { setDir("next"); return c; }); setProgress(0); }, INTERVAL);
    pRef.current = setInterval(() => setProgress(p => Math.min(p + (50 / INTERVAL) * 100, 100)), 50);
    return () => { tRef.current && clearInterval(tRef.current); pRef.current && clearInterval(pRef.current); };
  }, [paused, cur]);

  const s = slides[cur];

  return (
    <section
      style={{ position: "relative", width: "100%", height: "500px", overflow: "hidden", backgroundColor: s.bg, transition: "background-color 1s ease" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Slides ── */}
      {slides.map((slide, idx) => {
        const isActive = idx === cur;
        const isLeaving = idx === prev_;
        const enterFrom = dir === "next" ? "translateX(-40px)" : "translateX(40px)";
        const leaveTo   = dir === "next" ? "translateX(40px)"  : "translateX(-40px)";

        return (
          <div key={slide.id} style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "stretch",
            opacity: isActive ? 1 : isLeaving ? 0 : 0,
            transition: "opacity 0.75s ease",
            pointerEvents: isActive ? "auto" : "none",
          }}>
            {/* Photo side */}
            <div style={{ flex: "0 0 55%", position: "relative", overflow: "hidden" }}>
              <img src={slide.image} alt={slide.title.join(" ")} style={{
                position: "absolute", inset: 0, width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "center top",
                transform: isActive ? "scale(1.05)" : "scale(1)",
                transition: "transform 7s ease-out",
                filter: "brightness(0.95)",
              }} />
              {/* Right fade into bg */}
              <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "35%", background: `linear-gradient(to right, transparent, ${slide.bg})`, pointerEvents: "none" }} />
            </div>

            {/* Text side */}
            <div style={{
              flex: 1,
              display: "flex", flexDirection: "column", justifyContent: "center",
              padding: "0 52px 0 20px",
              position: "relative",
            }}>
              {/* Decorative background circle */}
              <div style={{
                position: "absolute",
                left: "10%", top: "50%", transform: "translate(-50%,-50%)",
                width: "320px", height: "320px",
                borderRadius: "50%",
                backgroundColor: `${slide.accent}10`,
                pointerEvents: "none",
              }} />

              {/* Eyebrow tag */}
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                marginBottom: "14px",
                opacity: isActive ? 1 : 0,
                transform: isActive ? "translateY(0)" : enterFrom,
                transition: "opacity 0.55s ease 0.05s, transform 0.55s ease 0.05s",
              }}>
                <span style={{ display: "block", width: "32px", height: "2px", backgroundColor: slide.accent, borderRadius: "1px", flexShrink: 0 }} />
                <span style={{ color: "#999", fontSize: "11px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                  {slide.tag}
                </span>
              </div>

              {/* Title lines — each line staggers in */}
              <div style={{ marginBottom: "18px" }}>
                {slide.title.filter(Boolean).map((line, li) => (
                  <div key={li} style={{
                    overflow: "hidden",
                    lineHeight: 1.1,
                  }}>
                    <h1 style={{
                      margin: 0, padding: 0,
                      fontSize: li === 0 ? "46px" : li === 1 ? "52px" : "42px",
                      fontWeight: "900",
                      color: li === 1 ? slide.accent : "#1a1a1a",
                      lineHeight: 1.15,
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? "translateY(0)" : "translateY(32px)",
                      transition: `opacity 0.6s ease ${0.12 + li * 0.1}s, transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94) ${0.12 + li * 0.1}s`,
                      whiteSpace: "nowrap",
                    }}>
                      {line}
                    </h1>
                  </div>
                ))}
              </div>

              {/* Subtitle */}
              <p style={{
                color: "#888",
                fontSize: "14px",
                lineHeight: "1.7",
                marginBottom: "32px",
                maxWidth: "320px",
                opacity: isActive ? 1 : 0,
                transform: isActive ? "translateY(0)" : "translateY(16px)",
                transition: "opacity 0.6s ease 0.38s, transform 0.6s ease 0.38s",
              }}>
                {slide.sub}
              </p>

              {/* CTA buttons */}
              <div style={{
                display: "flex", gap: "10px", flexWrap: "wrap",
                opacity: isActive ? 1 : 0,
                transform: isActive ? "translateY(0)" : "translateY(16px)",
                transition: "opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s",
              }}>
                <Link href={slide.cta.href} style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  backgroundColor: "#1a1a1a", color: "#fff",
                  padding: "12px 26px", borderRadius: "8px",
                  fontWeight: "700", fontSize: "13px", textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                  transition: "background-color 0.2s, transform 0.15s, box-shadow 0.2s",
                }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = slide.accent; el.style.transform = "translateY(-2px)"; el.style.boxShadow = `0 8px 20px ${slide.accent}40`; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "#1a1a1a"; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 4px 14px rgba(0,0,0,0.15)"; }}>
                  {slide.cta.label}
                  <ChevronLeft size={15} />
                </Link>
                <Link href={slide.cta2.href} style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  backgroundColor: "transparent", color: "#555",
                  padding: "12px 22px", borderRadius: "8px",
                  fontWeight: "600", fontSize: "13px", textDecoration: "none",
                  border: "1px solid #ccc",
                  transition: "border-color 0.2s, color 0.2s, transform 0.15s",
                }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = slide.accent; el.style.color = slide.accent; el.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#ccc"; el.style.color = "#555"; el.style.transform = "translateY(0)"; }}>
                  {slide.cta2.label}
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {/* ── Left arrow ── */}
      <button onClick={prev} aria-label="قبلی" style={{
        position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)",
        width: "42px", height: "42px", borderRadius: "50%",
        backgroundColor: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.08)",
        color: "#333", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.1)", backdropFilter: "blur(6px)",
        transition: "all 0.2s",
      }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = s.accent; el.style.color = "#fff"; el.style.borderColor = s.accent; el.style.transform = "translateY(-50%) scale(1.08)"; }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "rgba(255,255,255,0.9)"; el.style.color = "#333"; el.style.borderColor = "rgba(0,0,0,0.08)"; el.style.transform = "translateY(-50%) scale(1)"; }}>
        <ChevronRight size={18} strokeWidth={2.5} />
      </button>

      {/* ── Right arrow ── */}
      <button onClick={next} aria-label="بعدی" style={{
        position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)",
        width: "42px", height: "42px", borderRadius: "50%",
        backgroundColor: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.08)",
        color: "#333", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.1)", backdropFilter: "blur(6px)",
        transition: "all 0.2s",
      }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = s.accent; el.style.color = "#fff"; el.style.borderColor = s.accent; el.style.transform = "translateY(-50%) scale(1.08)"; }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "rgba(255,255,255,0.9)"; el.style.color = "#333"; el.style.borderColor = "rgba(0,0,0,0.08)"; el.style.transform = "translateY(-50%) scale(1)"; }}>
        <ChevronLeft size={18} strokeWidth={2.5} />
      </button>

      {/* ── Bottom controls ── */}
      <div style={{ position: "absolute", bottom: "22px", left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", zIndex: 20 }}>
        {/* Slide counter */}
        <span style={{ color: "rgba(0,0,0,0.25)", fontSize: "11px", fontWeight: "700", letterSpacing: "2px", minWidth: "40px" }}>
          {String(cur + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>

        {/* Dot indicators with progress */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {slides.map((_, idx) => (
            <button key={idx} onClick={() => goTo(idx, idx > cur ? "next" : "prev")} aria-label={`اسلاید ${idx + 1}`}
              style={{
                padding: 0, border: "none", cursor: "pointer",
                height: "6px",
                width: idx === cur ? "32px" : "6px",
                borderRadius: "3px",
                backgroundColor: idx === cur ? s.accent : "rgba(0,0,0,0.18)",
                transition: "width 0.4s ease, background-color 0.3s",
                overflow: "hidden",
                position: "relative",
              }}>
              {/* Progress fill on active dot */}
              {idx === cur && !paused && (
                <span style={{
                  position: "absolute", inset: 0,
                  width: `${progress}%`,
                  backgroundColor: "rgba(255,255,255,0.35)",
                  borderRadius: "3px",
                  transition: "width 0.05s linear",
                }} />
              )}
            </button>
          ))}
        </div>

        <span style={{ minWidth: "40px" }} />
      </div>

      <style>{`
        @media(max-width:768px) {
          .hero-section { flex-direction: column !important; height: auto !important; min-height: 420px; }
        }
      `}</style>
    </section>
  );
}
