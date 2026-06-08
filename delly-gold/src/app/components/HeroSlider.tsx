"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    title: "زیبایی، ماندگار مثل طلا",
    subtitle: "مجموعه‌ای از بهترین طلاها و جواهرات",
    cta: "مشاهده محصولات",
    href: "/products",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80",
    badge: "جدیدترین کالکشن",
  },
  {
    id: 2,
    title: "کالکشن ویژه بهار",
    subtitle: "طلاهای خاص برای لحظه‌های خاص",
    cta: "مشاهده کالکشن",
    href: "/collections",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
    badge: "پیشنهاد ویژه",
  },
  {
    id: 3,
    title: "ویترین ویژه دلی گلد",
    subtitle: "بهترین پیشنهادها برای هر بودجه",
    cta: "مشاهده ویترین",
    href: "/showcase",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
    badge: "محبوب‌ترین",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1));

  return (
    <section
      style={{
        position: "relative",
        height: "520px",
        overflow: "hidden",
        backgroundColor: "#0e0e0e",
      }}
    >
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          style={{
            position: "absolute",
            inset: 0,
            opacity: idx === current ? 1 : 0,
            transition: "opacity 0.7s ease",
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Background image */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${slide.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.35)",
            }}
          />

          {/* Gold overlay gradient */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to left, rgba(14,14,14,0.1) 0%, rgba(14,14,14,0.8) 60%)",
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
            <div style={{ maxWidth: "480px" }}>
              {/* Badge */}
              <span
                style={{
                  display: "inline-block",
                  backgroundColor: "rgba(212,175,55,0.2)",
                  border: "1px solid #d4af37",
                  color: "#d4af37",
                  fontSize: "12px",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  marginBottom: "16px",
                }}
              >
                {slide.badge}
              </span>

              {/* Title */}
              <h1
                style={{
                  fontSize: "36px",
                  fontWeight: "700",
                  color: "#fff",
                  marginBottom: "8px",
                  lineHeight: "1.3",
                }}
              >
                {slide.title}
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  color: "#aaa",
                  fontSize: "16px",
                  marginBottom: "28px",
                }}
              >
                {slide.subtitle}
              </p>

              {/* CTA Button */}
              <a
                href={slide.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "#d4af37",
                  color: "#000",
                  padding: "12px 28px",
                  borderRadius: "6px",
                  fontWeight: "700",
                  fontSize: "15px",
                  textDecoration: "none",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor =
                    "#f0d060")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor =
                    "#d4af37")
                }
              >
                <ChevronLeft size={18} />
                {slide.cta}
              </a>
            </div>
          </div>
        </div>
      ))}

      {/* Prev Arrow */}
      <button
        onClick={prev}
        aria-label="قبلی"
        style={{
          position: "absolute",
          right: "16px",
          top: "50%",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(212,175,55,0.15)",
          border: "1px solid rgba(212,175,55,0.4)",
          color: "#d4af37",
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 10,
          transition: "background-color 0.2s",
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
          left: "16px",
          top: "50%",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(212,175,55,0.15)",
          border: "1px solid rgba(212,175,55,0.4)",
          color: "#d4af37",
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 10,
        }}
      >
        <ChevronLeft size={20} />
      </button>

      {/* Dots */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "8px",
          zIndex: 10,
        }}
      >
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            aria-label={`اسلاید ${idx + 1}`}
            style={{
              width: idx === current ? "24px" : "8px",
              height: "8px",
              borderRadius: "4px",
              backgroundColor: idx === current ? "#d4af37" : "rgba(212,175,55,0.4)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s",
              padding: 0,
            }}
          />
        ))}
      </div>
    </section>
  );
}
