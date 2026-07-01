"use client";
import Link from "next/link";
import { Zap } from "lucide-react";

export default function PromoBanners() {
  return (
    <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px 32px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }} className="pb-grid">

        {/* ── LEFT: Discount (dark card) ── */}
        <Link href="/products" style={{ textDecoration: "none", display: "block" }}>
          <div style={{
            position: "relative",
            height: "190px",
            borderRadius: "12px",
            overflow: "hidden",
            backgroundColor: "#111",
            cursor: "pointer",
            transition: "transform 0.25s",
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "translateY(0)"}>
            {/* BG image — dark soil/gravel with gold % */}
            <div style={{
              position: "absolute",
              left: 0, top: 0, bottom: 0,
              width: "50%",
              backgroundImage: "url(https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&q=80)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.55)",
            }} />
            {/* Big % overlay on image */}
            <div style={{
              position: "absolute",
              left: "6%",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#c8a12a",
              fontSize: "80px",
              fontWeight: "900",
              lineHeight: 1,
              textShadow: "0 4px 20px rgba(0,0,0,0.8)",
              userSelect: "none",
            }}>%</div>

            {/* Dark overlay on right half */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(17,17,17,0.75) 42%, #111 58%)" }} />

            {/* Text content */}
            <div style={{
              position: "absolute",
              right: "24px",
              top: "50%",
              transform: "translateY(-50%)",
              textAlign: "right",
              maxWidth: "52%",
            }}>
              <h3 style={{ color: "#c8a12a", fontSize: "22px", fontWeight: "900", marginBottom: "6px", lineHeight: 1.2 }}>
                تخفیف‌های دلی‌گلد
              </h3>
              <p style={{ color: "#ccc", fontSize: "13px", marginBottom: "16px", lineHeight: 1.5 }}>
                محصولات تخفیف‌دار میوگلد
              </p>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#c8a12a",
                color: "#000",
                padding: "8px 18px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "800",
              }}>
                <Zap size={13} />
                مشاهده محصولات
              </span>
            </div>
          </div>
        </Link>

        {/* ── RIGHT: Low fee (light/beige card) ── */}
        <Link href="/products" style={{ textDecoration: "none", display: "block" }}>
          <div style={{
            position: "relative",
            height: "190px",
            borderRadius: "12px",
            overflow: "hidden",
            backgroundColor: "#f5f0e8",
            cursor: "pointer",
            transition: "transform 0.25s",
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "translateY(0)"}>
            {/* BG image — gold ring on sand */}
            <div style={{
              position: "absolute",
              left: 0, top: 0, bottom: 0,
              width: "50%",
              backgroundImage: "url(https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=500&q=80)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.85)",
            }} />
            {/* Light fade to right */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(245,240,232,0) 0%, rgba(245,240,232,0.7) 40%, #f5f0e8 60%)" }} />

            {/* Text content */}
            <div style={{
              position: "absolute",
              right: "24px",
              top: "50%",
              transform: "translateY(-50%)",
              textAlign: "right",
              maxWidth: "52%",
            }}>
              <h3 style={{ color: "#c8a12a", fontSize: "22px", fontWeight: "900", marginBottom: "6px", lineHeight: 1.2 }}>
                طلای کم اُجرت
              </h3>
              <p style={{ color: "#666", fontSize: "13px", marginBottom: "16px", lineHeight: 1.5 }}>
                محصولات با کمترین اُجرت ساخت
              </p>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#1a1a1a",
                color: "#fff",
                padding: "8px 18px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "800",
              }}>
                <Zap size={13} />
                مشاهده محصولات
              </span>
            </div>
          </div>
        </Link>

      </div>
      <style>{`@media(max-width:640px){.pb-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}
