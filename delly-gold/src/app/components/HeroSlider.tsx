"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const slides = [
  {
    id: 1,
    tag:    "DELLY GOLD · NEW COLLECTION",
    title:  ["جدیدترین", "گردنبندهای", "دلی‌گلد"],
    sub:    "ظریف‌ترین طرح‌ها برای لحظه‌های خاص",
    cta:    { label: "مشاهده محصولات",    href: "/products" },
    cta2:   { label: "خرید اقساطی",       href: "/contact" },
    image:  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&q=90",
    bg:     "#f2ebe0",
    accent: "#c8a12a",
  },
  {
    id: 2,
    tag:    "DELLY GOLD · BESTSELLERS",
    title:  ["انگشترهای", "ویژه فصل", ""],
    sub:    "طرح‌های کلاسیک و مدرن با بهترین اجرت",
    cta:    { label: "مشاهده انگشترها",   href: "/products?category=rings" },
    cta2:   { label: "پرو مجازی",          href: "/tryon" },
    image:  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=90",
    bg:     "#ede5d8",
    accent: "#b8860b",
  },
  {
    id: 3,
    tag:    "DELLY GOLD · LOW FEE",
    title:  ["طلای", "کم‌اجرت", "دلی‌گلد"],
    sub:    "محصولات با کمترین اجرت ساخت در بازار",
    cta:    { label: "مشاهده دستبندها",   href: "/products?category=bracelets" },
    cta2:   { label: "تماس با ما",         href: "/contact" },
    image:  "https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=1200&q=90",
    bg:     "#e8e0d5",
    accent: "#c8a12a",
  },
];

const INTERVAL = 6000;

export default function HeroSlider() {
  const [cur, setCur]         = useState(0);
  const [animating, setAnim]  = useState(false);
  const [paused, setPaused]   = useState(false);
  const [progress, setProgress] = useState(0);
  const tRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number) => {
    if (animating || idx === cur) return;
    setAnim(true); setCur(idx); setProgress(0);
    setTimeout(() => setAnim(false), 700);
  }, [animating, cur]);

  const next = useCallback(() => goTo((cur + 1) % slides.length), [cur, goTo]);
  const prev = useCallback(() => goTo(cur === 0 ? slides.length - 1 : cur - 1), [cur, goTo]);

  useEffect(() => {
    if (paused) {
      tRef.current && clearInterval(tRef.current);
      pRef.current && clearInterval(pRef.current);
      return;
    }
    setProgress(0);
    tRef.current = setInterval(() => { setCur(c => (c + 1) % slides.length); setProgress(0); }, INTERVAL);
    pRef.current = setInterval(() => setProgress(p => Math.min(p + (50 / INTERVAL) * 100, 100)), 50);
    return () => {
      tRef.current && clearInterval(tRef.current);
      pRef.current && clearInterval(pRef.current);
    };
  }, [paused, cur]);

  const s = slides[cur];

  return (
    <>
      <style>{`
        .hero-wrap {
          position: relative;
          width: 100%;
          height: 500px;
          overflow: hidden;
          transition: background-color 0.9s ease;
        }
        .hero-slide {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: stretch;
          transition: opacity 0.75s ease;
        }
        .hero-photo {
          flex: 0 0 55%;
          position: relative;
          overflow: hidden;
        }
        .hero-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 48px 0 16px;
          position: relative;
        }
        .hero-title-line {
          overflow: hidden;
          line-height: 1.1;
        }
        .hero-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background-color: rgba(255,255,255,0.9);
          border: 1px solid rgba(0,0,0,0.08);
          color: #333;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
          backdrop-filter: blur(6px);
          transition: all 0.2s;
        }
        .hero-arrow:hover {
          transform: translateY(-50%) scale(1.08);
        }

        /* ── MOBILE ── */
        @media (max-width: 700px) {
          .hero-wrap { height: auto !important; min-height: 420px; }
          .hero-slide {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .hero-photo {
            flex: 0 0 220px !important;
            width: 100% !important;
            height: 220px !important;
          }
          .hero-text {
            flex: 1 !important;
            padding: 20px 20px 60px 20px !important;
            justify-content: flex-start !important;
            background: transparent !important;
          }
          .hero-title h1 { font-size: 26px !important; white-space: normal !important; }
          .hero-arrow { width: 34px !important; height: 34px !important; }
          .hero-arrow-prev { right: 10px !important; top: 110px !important; transform: none !important; }
          .hero-arrow-next { left: 10px !important; top: 110px !important; transform: none !important; }
        }
      `}</style>

      <section
        className="hero-wrap"
        style={{ backgroundColor: s.bg }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {slides.map((slide, idx) => {
          const isActive = idx === cur;
          return (
            <div key={slide.id} className="hero-slide"
              aria-hidden={!isActive}
              style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? "auto" : "none" }}>

              {/* Photo */}
              <div className="hero-photo">
                <img src={slide.image} alt={slide.title.filter(Boolean).join(" ")}
                  style={{
                    position: "absolute", inset: 0, width: "100%", height: "100%",
                    objectFit: "cover", objectPosition: "center top",
                    transform: isActive ? "scale(1.05)" : "scale(1)",
                    transition: "transform 7s ease-out",
                  }} />
                {/* Fade edge */}
                <div style={{
                  position: "absolute", top: 0, right: 0, bottom: 0, width: "30%",
                  background: `linear-gradient(to right, transparent, ${slide.bg})`,
                  pointerEvents: "none",
                }} />
              </div>

              {/* Text */}
              <div className="hero-text">
                {/* Decorative circle — desktop only */}
                <div style={{
                  position: "absolute", left: "5%", top: "50%", transform: "translate(-50%,-50%)",
                  width: "280px", height: "280px", borderRadius: "50%",
                  backgroundColor: `${slide.accent}12`, pointerEvents: "none",
                }} />

                {/* Tag */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  marginBottom: "12px",
                  opacity: isActive ? 1 : 0,
                  transition: "opacity 0.55s ease 0.05s",
                }}>
                  <span style={{ display: "block", width: "28px", height: "2px", backgroundColor: slide.accent, borderRadius: "1px", flexShrink: 0 }} />
                  <span style={{ color: "#999", fontSize: "10px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                    {slide.tag}
                  </span>
                </div>

                {/* Title lines */}
                <div className="hero-title" style={{ marginBottom: "14px" }}>
                  {slide.title.filter(Boolean).map((line, li) => (
                    <div key={li} className="hero-title-line">
                      <h1 style={{
                        margin: 0, padding: 0,
                        fontSize: li === 0 ? "44px" : li === 1 ? "50px" : "40px",
                        fontWeight: "900",
                        color: li === 1 ? slide.accent : "#1a1a1a",
                        lineHeight: 1.15,
                        opacity: isActive ? 1 : 0,
                        transform: isActive ? "translateY(0)" : "translateY(28px)",
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
                  color: "#888", fontSize: "13px", lineHeight: "1.7",
                  marginBottom: "24px", maxWidth: "300px",
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? "translateY(0)" : "translateY(14px)",
                  transition: "opacity 0.6s ease 0.38s, transform 0.6s ease 0.38s",
                }}>
                  {slide.sub}
                </p>

                {/* CTA buttons */}
                <div style={{
                  display: "flex", gap: "10px", flexWrap: "wrap",
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? "translateY(0)" : "translateY(14px)",
                  transition: "opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s",
                }}>
                  <Link href={slide.cta.href} style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    backgroundColor: "#1a1a1a", color: "#fff",
                    padding: "11px 24px", borderRadius: "7px",
                    fontWeight: "700", fontSize: "13px", textDecoration: "none",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                    transition: "background-color 0.2s, transform 0.15s",
                  }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = slide.accent; el.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "#1a1a1a"; el.style.transform = "translateY(0)"; }}>
                    {slide.cta.label} <ChevronLeft size={14} />
                  </Link>
                  <Link href={slide.cta2.href} style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    backgroundColor: "transparent", color: "#555",
                    padding: "11px 20px", borderRadius: "7px",
                    fontWeight: "600", fontSize: "13px", textDecoration: "none",
                    border: "1px solid #ccc",
                    transition: "border-color 0.2s, color 0.2s",
                  }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = slide.accent; el.style.color = slide.accent; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#ccc"; el.style.color = "#555"; }}>
                    {slide.cta2.label}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {/* Arrows */}
        <button onClick={prev} aria-label="قبلی" className="hero-arrow hero-arrow-prev" style={{ right: "20px" }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = s.accent; el.style.color = "#fff"; el.style.borderColor = s.accent; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "rgba(255,255,255,0.9)"; el.style.color = "#333"; el.style.borderColor = "rgba(0,0,0,0.08)"; }}>
          <ChevronRight size={18} strokeWidth={2.5} />
        </button>
        <button onClick={next} aria-label="بعدی" className="hero-arrow hero-arrow-next" style={{ left: "20px" }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = s.accent; el.style.color = "#fff"; el.style.borderColor = s.accent; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "rgba(255,255,255,0.9)"; el.style.color = "#333"; el.style.borderColor = "rgba(0,0,0,0.08)"; }}>
          <ChevronLeft size={18} strokeWidth={2.5} />
        </button>

        {/* Bottom dots + progress */}
        <div style={{ position: "absolute", bottom: "18px", left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "18px", zIndex: 20 }}>
          <span style={{ color: "rgba(0,0,0,0.25)", fontSize: "10px", fontWeight: "700", letterSpacing: "2px", minWidth: "36px" }}>
            {String(cur + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
          <div style={{ display: "flex", gap: "7px", alignItems: "center" }}>
            {slides.map((_, idx) => (
              <button key={idx} onClick={() => goTo(idx)} aria-label={`اسلاید ${idx + 1}`}
                style={{
                  padding: 0, border: "none", cursor: "pointer", height: "6px",
                  width: idx === cur ? "28px" : "6px", borderRadius: "3px",
                  backgroundColor: idx === cur ? s.accent : "rgba(0,0,0,0.18)",
                  transition: "width 0.4s ease, background-color 0.3s",
                  overflow: "hidden", position: "relative",
                }}>
                {idx === cur && !paused && (
                  <span style={{
                    position: "absolute", inset: 0, width: `${progress}%`,
                    backgroundColor: "rgba(255,255,255,0.35)",
                    transition: "width 0.05s linear",
                  }} />
                )}
              </button>
            ))}
          </div>
          <span style={{ minWidth: "36px" }} />
        </div>
      </section>
    </>
  );
}
