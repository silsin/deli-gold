"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Slide {
  id: string; tag: string;
  title1: string; title2: string; title3: string;
  subtitle: string;
  cta_label: string; cta_href: string;
  cta2_label: string; cta2_href: string;
  cta3_label: string; cta3_href: string;
  content_position: string;
  image_fit: string;
  image: string; bg_color: string; accent: string;
}

const INTERVAL = 6000;

export default function HeroSlider() {
  const [slides, setSlides]     = useState<Slide[]>([]);
  const [loaded, setLoaded]     = useState(false);
  const [cur, setCur]           = useState(0);
  const [animating, setAnim]    = useState(false);
  const [paused, setPaused]     = useState(false);
  const [progress, setProgress] = useState(0);
  const tRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/slides").then(r => r.json()).then(d => {
      if (d.success && d.data.length > 0) { setSlides(d.data); setCur(0); }
      setLoaded(true);
    }).catch(() => { setLoaded(true); });
  }, []);

  const goTo = useCallback((idx: number) => {
    if (animating || idx === cur) return;
    setAnim(true); setCur(idx); setProgress(0);
    setTimeout(() => setAnim(false), 800);
  }, [animating, cur]);

  const next = useCallback(() => goTo((cur + 1) % slides.length), [cur, goTo, slides.length]);
  const prev = useCallback(() => goTo(cur === 0 ? slides.length - 1 : cur - 1), [cur, goTo, slides.length]);

  useEffect(() => {
    if (paused || slides.length === 0) {
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
  }, [paused, cur, slides.length]);

  if (!loaded) return <div style={{ width: "100%", height: "520px", backgroundColor: "#f0ebe0" }} />;

  if (loaded && slides.length === 0) {
    return (
      <section style={{ width: "100%", height: "420px", backgroundColor: "#f8f5ee", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px" }}>
        <p style={{ color: "#bbb", fontSize: "14px" }}>به‌زودی</p>
      </section>
    );
  }

  const slide = slides[cur];
  if (!slide) return null;

  return (
    <>
      <style>{`
        .hs-wrap {
          position: relative;
          width: 100%;
          height: 560px;
          overflow: hidden;
          background: #1a1a1a;
        }
        .hs-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.85s ease;
          pointer-events: none;
        }
        .hs-slide.active {
          opacity: 1;
          pointer-events: auto;
        }
        .hs-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 7s ease-out;
        }
        .hs-slide.active .hs-img {
          transform: scale(1.06);
        }
        .hs-slide:not(.active) .hs-img {
          transform: scale(1);
        }
        /* dark gradient overlay — bottom and right side for RTL text */
        .hs-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to left,
            rgba(0,0,0,0.72) 0%,
            rgba(0,0,0,0.45) 45%,
            rgba(0,0,0,0.08) 100%
          );
        }
        /* content sits on the right side (RTL) */
        .hs-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 7% 60px 40px;
          text-align: right;
        }
        .hs-content.pos-right  { align-items: flex-end; padding: 0 7% 60px 40px; text-align: right; }
        .hs-content.pos-center { align-items: center;   padding: 0 10% 60px;     text-align: center; }
        .hs-content.pos-left   { align-items: flex-start; padding: 0 40px 60px 7%; text-align: left; }
        .hs-tag {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.55s ease 0.05s, transform 0.55s ease 0.05s;
        }
        .hs-slide.active .hs-tag { opacity: 1; transform: translateY(0); }

        .hs-title-line { overflow: hidden; }
        .hs-title-inner {
          display: block;
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.65s ease, transform 0.65s cubic-bezier(.25,.46,.45,.94);
        }
        .hs-slide.active .hs-title-inner { opacity: 1; transform: translateY(0); }

        .hs-subtitle {
          max-width: 380px;
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.6s ease 0.38s, transform 0.6s ease 0.38s;
        }
        .hs-slide.active .hs-subtitle { opacity: 1; transform: translateY(0); }

        .hs-btns {
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.6s ease 0.52s, transform 0.6s ease 0.52s;
        }
        .hs-slide.active .hs-btns { opacity: 1; transform: translateY(0); }

        .hs-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px; height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          color: #fff;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          z-index: 20;
          backdrop-filter: blur(8px);
          transition: background 0.2s, transform 0.2s;
        }
        .hs-arrow:hover {
          background: rgba(255,255,255,0.28);
          transform: translateY(-50%) scale(1.08);
        }

        /* dots bar */
        .hs-dots {
          position: absolute;
          bottom: 22px;
          left: 0; right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          z-index: 20;
        }

        @media (max-width: 700px) {
          .hs-wrap { height: 420px; }
          .hs-overlay {
            background: linear-gradient(
              to top,
              rgba(0,0,0,0.80) 0%,
              rgba(0,0,0,0.35) 55%,
              rgba(0,0,0,0.05) 100%
            );
          }
          .hs-content,
          .hs-content.pos-right,
          .hs-content.pos-center,
          .hs-content.pos-left {
            justify-content: flex-end;
            align-items: flex-start;
            padding: 0 20px 72px;
            text-align: right;
          }
          .hs-arrow { width: 36px; height: 36px; }
        }
      `}</style>

      <section
        className="hs-wrap"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {slides.map((s, idx) => {
          const isActive = idx === cur;
          const titles = [s.title1, s.title2, s.title3].filter(Boolean);
          const delays = [0.1, 0.22, 0.34];

          return (
            <div key={s.id} className={`hs-slide${isActive ? " active" : ""}`} aria-hidden={!isActive}>

              {/* Full-width background image */}
              {s.image && (
                <img
                  className="hs-img"
                  src={s.image}
                  alt={titles.join(" ")}
                  style={{
                    objectFit: (s.image_fit || "cover") as React.CSSProperties["objectFit"],
                    // Ken Burns zoom only makes sense for cover/fill
                    animation: (s.image_fit === "cover" || s.image_fit === "fill") ? undefined : "none",
                  }}
                />
              )}
              {!s.image && (
                <div style={{ position: "absolute", inset: 0, backgroundColor: s.bg_color || "#2a1a0a" }} />
              )}

              {/* Gradient overlay */}
              <div className="hs-overlay" />

              {/* Text + buttons overlaid on image */}
              <div className={`hs-content pos-${s.content_position || "right"}`}>

                {/* Tag line */}
                {s.tag && (
                  <div className="hs-tag">
                    <span style={{ display: "block", width: "28px", height: "2px", backgroundColor: s.accent || "#c8a12a", borderRadius: "1px" }} />
                    <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "10px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase" }}>
                      {s.tag}
                    </span>
                  </div>
                )}

                {/* Title lines — size/font from CSS vars (--font-size-slider / --font-slider) */}
                <div style={{ marginBottom: "16px" }}>
                  {titles.map((line, li) => (
                    <div key={li} className="hs-title-line">
                      <span
                        className={`hs-title-inner${li === 1 ? " hs-title-accent" : ""}`}
                        style={{
                          fontWeight: "900",
                          lineHeight: 1.15,
                          color: li === 1 ? (s.accent || "#c8a12a") : "#ffffff",
                          transitionDelay: `${delays[li]}s`,
                          display: "block",
                          textShadow: "0 2px 12px rgba(0,0,0,0.4)",
                        }}
                      >
                        {line}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtitle — same typography section as slider title */}
                {s.subtitle && (
                  <p className="hs-subtitle" style={{ color: "rgba(255,255,255,0.75)", lineHeight: "1.7", marginBottom: "28px" }}>
                    {s.subtitle}
                  </p>
                )}

                {/* CTA buttons — on the image */}
                {(s.cta_label || s.cta2_label || s.cta3_label) && (
                  <div className="hs-btns" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    {s.cta_label && (
                      <Link
                        href={s.cta_href || "/products"}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "6px",
                          backgroundColor: s.accent || "#c8a12a",
                          color: "#fff",
                          padding: "12px 28px",
                          borderRadius: "8px",
                          fontWeight: "800",
                          fontSize: "14px",
                          textDecoration: "none",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                          transition: "transform 0.2s, box-shadow 0.2s",
                        }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.4)"; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)"; }}
                      >
                        {s.cta_label} <ChevronLeft size={15} />
                      </Link>
                    )}
                    {s.cta2_label && (
                      <Link
                        href={s.cta2_href || "/products"}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "6px",
                          backgroundColor: "rgba(255,255,255,0.15)",
                          color: "#fff",
                          padding: "12px 24px",
                          borderRadius: "8px",
                          fontWeight: "600",
                          fontSize: "14px",
                          textDecoration: "none",
                          border: "1px solid rgba(255,255,255,0.4)",
                          backdropFilter: "blur(6px)",
                          transition: "background 0.2s, transform 0.2s",
                        }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "rgba(255,255,255,0.25)"; el.style.transform = "translateY(-2px)"; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "rgba(255,255,255,0.15)"; el.style.transform = "translateY(0)"; }}
                      >
                        {s.cta2_label}
                      </Link>
                    )}
                    {s.cta3_label && (
                      <Link
                        href={s.cta3_href || "/products"}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "6px",
                          backgroundColor: "transparent",
                          color: s.accent || "#c8a12a",
                          padding: "11px 22px",
                          borderRadius: "8px",
                          fontWeight: "600",
                          fontSize: "14px",
                          textDecoration: "none",
                          border: `1px solid ${s.accent || "#c8a12a"}`,
                          transition: "background 0.2s, transform 0.2s",
                        }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "rgba(200,161,42,0.15)"; el.style.transform = "translateY(-2px)"; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "transparent"; el.style.transform = "translateY(0)"; }}
                      >
                        {s.cta3_label}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Prev arrow */}
        <button onClick={prev} aria-label="قبلی" className="hs-arrow" style={{ right: "20px" }}>
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>

        {/* Next arrow */}
        <button onClick={next} aria-label="بعدی" className="hs-arrow" style={{ left: "20px" }}>
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>

        {/* Dots + progress */}
        <div className="hs-dots">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              aria-label={`اسلاید ${idx + 1}`}
              style={{
                padding: 0, border: "none", cursor: "pointer",
                height: "4px",
                width: idx === cur ? "32px" : "8px",
                borderRadius: "2px",
                backgroundColor: idx === cur ? (slide.accent || "#c8a12a") : "rgba(255,255,255,0.4)",
                transition: "width 0.4s, background-color 0.3s",
                overflow: "hidden", position: "relative",
              }}
            >
              {idx === cur && !paused && (
                <span style={{ position: "absolute", inset: 0, width: `${progress}%`, backgroundColor: "rgba(255,255,255,0.5)", transition: "width 0.05s linear" }} />
              )}
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
