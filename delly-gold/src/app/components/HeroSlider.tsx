"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    title: "زیبایی، ماندگار مثل طلا",
    subtitle: "مجموعه‌ای از بهترین طلاها و جواهرات",
    cta: "مشاهده محصولات",
    href: "/products",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&q=80",
    badge: "جدیدترین کالکشن",
  },
  {
    id: 2,
    title: "کالکشن ویژه بهار",
    subtitle: "طلاهای خاص برای لحظه‌های خاص",
    cta: "مشاهده کالکشن",
    href: "/collections",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80",
    badge: "پیشنهاد ویژه",
  },
  {
    id: 3,
    title: "ویترین ویژه دلی گلد",
    subtitle: "بهترین پیشنهادها برای هر بودجه",
    cta: "مشاهده ویترین",
    href: "/showcase",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=80",
    badge: "محبوب‌ترین",
  },
];

const AUTO_PLAY_INTERVAL = 5000; // 5 seconds

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (idx: number) => {
      if (animating || idx === current) return;
      setAnimating(true);
      setCurrent(idx);
      setProgress(0);
      setTimeout(() => setAnimating(false), 700);
    },
    [animating, current]
  );

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo(current === 0 ? slides.length - 1 : current - 1);
  }, [current, goTo]);

  // Auto-play
  useEffect(() => {
    if (paused) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      return;
    }

    setProgress(0);

    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
      setProgress(0);
    }, AUTO_PLAY_INTERVAL);

    // Progress bar tick every 50ms
    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + 50 / AUTO_PLAY_INTERVAL * 100, 100));
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [paused, current]);

  return (
    <section
      style={{ position: "relative", height: "520px", overflow: "hidden", backgroundColor: "#0e0e0e" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, idx) => {
        const isActive = idx === current;
        return (
          <div
            key={slide.id}
            aria-hidden={!isActive}
            style={{
              position: "absolute",
              inset: 0,
              opacity: isActive ? 1 : 0,
              transform: isActive ? "scale(1)" : "scale(1.04)",
              transition: "opacity 0.8s ease, transform 0.8s ease",
              display: "flex",
              alignItems: "center",
              pointerEvents: isActive ? "auto" : "none",
            }}
          >
            {/* Background image with subtle Ken Burns */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${slide.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "brightness(0.32)",
                transform: isActive ? "scale(1.06)" : "scale(1)",
                transition: "transform 6s ease-out",
              }}
            />

            {/* Gold gradient overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to left, rgba(14,14,14,0.05) 0%, rgba(14,14,14,0.85) 65%)",
              }}
            />

            {/* Content */}
            <div
              style={{
                position: "relative",
                maxWidth: "1280px",
                margin: "0 auto",
                padding: "0 40px",
                width: "100%",
              }}
            >
              <div
                style={{
                  maxWidth: "520px",
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? "translateY(0)" : "translateY(20px)",
                  transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
                }}
              >
                {/* Badge */}
                <span
                  style={{
                    display: "inline-block",
                    backgroundColor: "rgba(212,175,55,0.2)",
                    border: "1px solid #d4af37",
                    color: "#d4af37",
                    fontSize: "12px",
                    padding: "4px 14px",
                    borderRadius: "20px",
                    marginBottom: "18px",
                    letterSpacing: "0.5px",
                  }}
                >
                  {slide.badge}
                </span>

                {/* Title */}
                <h1
                  style={{
                    fontSize: "40px",
                    fontWeight: "800",
                    color: "#fff",
                    marginBottom: "12px",
                    lineHeight: "1.25",
                    textShadow: "0 2px 12px rgba(0,0,0,0.5)",
                  }}
                >
                  {slide.title}
                </h1>

                {/* Subtitle */}
                <p
                  style={{
                    color: "#bbb",
                    fontSize: "16px",
                    marginBottom: "32px",
                    lineHeight: "1.6",
                  }}
                >
                  {slide.subtitle}
                </p>

                {/* CTA */}
                <a
                  href={slide.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "#d4af37",
                    color: "#000",
                    padding: "13px 30px",
                    borderRadius: "6px",
                    fontWeight: "700",
                    fontSize: "15px",
                    textDecoration: "none",
                    boxShadow: "0 4px 20px rgba(212,175,55,0.35)",
                    transition: "background-color 0.2s, box-shadow 0.2s, transform 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.backgroundColor = "#f0d060";
                    el.style.transform = "translateY(-1px)";
                    el.style.boxShadow = "0 6px 24px rgba(212,175,55,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.backgroundColor = "#d4af37";
                    el.style.transform = "translateY(0)";
                    el.style.boxShadow = "0 4px 20px rgba(212,175,55,0.35)";
                  }}
                >
                  <ChevronLeft size={18} />
                  {slide.cta}
                </a>
              </div>
            </div>
          </div>
        );
      })}

      {/* Prev Arrow */}
      <button
        onClick={prev}
        aria-label="قبلی"
        style={{
          position: "absolute",
          right: "20px",
          top: "50%",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(212,175,55,0.12)",
          border: "1px solid rgba(212,175,55,0.35)",
          color: "#d4af37",
          width: "46px",
          height: "46px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 10,
          transition: "background-color 0.2s, transform 0.2s",
          backdropFilter: "blur(4px)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(212,175,55,0.28)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-50%) scale(1.08)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(212,175,55,0.12)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-50%) scale(1)";
        }}
      >
        <ChevronRight size={20} />
      </button>

      {/* Next Arrow */}
      <button
        onClick={next}
        aria-label="بعدی"
        style={{
          position: "absolute",
          left: "20px",
          top: "50%",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(212,175,55,0.12)",
          border: "1px solid rgba(212,175,55,0.35)",
          color: "#d4af37",
          width: "46px",
          height: "46px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 10,
          transition: "background-color 0.2s, transform 0.2s",
          backdropFilter: "blur(4px)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(212,175,55,0.28)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-50%) scale(1.08)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(212,175,55,0.12)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-50%) scale(1)";
        }}
      >
        <ChevronLeft size={20} />
      </button>

      {/* Bottom bar: dots + progress */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          paddingBottom: "20px",
          zIndex: 10,
        }}
      >
        {/* Dots */}
        <div style={{ display: "flex", gap: "8px" }}>
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              aria-label={`اسلاید ${idx + 1}`}
              style={{
                width: idx === current ? "28px" : "8px",
                height: "8px",
                borderRadius: "4px",
                backgroundColor:
                  idx === current ? "#d4af37" : "rgba(212,175,55,0.35)",
                border: "none",
                cursor: "pointer",
                transition: "width 0.4s ease, background-color 0.3s",
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Auto-play progress bar */}
        {!paused && (
          <div
            style={{
              width: "80px",
              height: "2px",
              backgroundColor: "rgba(212,175,55,0.2)",
              borderRadius: "1px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                backgroundColor: "#d4af37",
                borderRadius: "1px",
                transition: "width 0.05s linear",
              }}
            />
          </div>
        )}
        {paused && (
          <span style={{ color: "rgba(212,175,55,0.5)", fontSize: "10px", letterSpacing: "1px" }}>
            ■ متوقف
          </span>
        )}
      </div>

      {/* Slide counter */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          color: "rgba(212,175,55,0.6)",
          fontSize: "12px",
          fontWeight: "600",
          letterSpacing: "1px",
          zIndex: 10,
        }}
      >
        {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
      </div>
    </section>
  );
}
