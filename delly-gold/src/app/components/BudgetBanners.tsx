"use client";
import Link from "next/link";

const budgets = [
  { range: "+15",  label: "بالای ۱۵ میلیون تومان", href: "/products" },
  { range: "8-15", label: "از ۸ تا ۱۵ میلیون تومان", href: "/products" },
  { range: "3-8",  label: "از ۳ تا ۸ میلیون تومان",  href: "/products" },
  { range: "1-3",  label: "از ۱ تا ۳ میلیون تومان",  href: "/products" },
];

export default function BudgetBanners() {
  return (
    <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px 32px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }} className="bb-grid">
        {budgets.map((b, i) => (
          <Link key={i} href={b.href} style={{ textDecoration: "none", display: "block" }}>
            <div style={{
              borderRadius: "12px",
              overflow: "hidden",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              position: "relative",
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(-4px)";
                el.style.boxShadow = "0 12px 28px rgba(180,20,20,0.3)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "none";
              }}
            >
              {/* Red gradient background */}
              <div style={{
                background: "linear-gradient(145deg, #c0392b 0%, #96281b 40%, #7b1c12 100%)",
                padding: "28px 16px 16px",
                minHeight: "150px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Decorative sparkle dots */}
                <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
                  {[
                    { top: "10%", left: "8%",  size: 3 },
                    { top: "20%", right: "10%", size: 2 },
                    { top: "60%", left: "15%",  size: 2 },
                    { top: "75%", right: "8%",  size: 3 },
                    { top: "40%", left: "5%",   size: 1.5 },
                    { top: "85%", left: "40%",  size: 2 },
                  ].map((dot, j) => (
                    <div key={j} style={{
                      position: "absolute",
                      top: dot.top,
                      left: (dot as { left?: string }).left,
                      right: (dot as { right?: string }).right,
                      width: `${dot.size * 2}px`,
                      height: `${dot.size * 2}px`,
                      borderRadius: "50%",
                      backgroundColor: "rgba(255,215,100,0.6)",
                    }} />
                  ))}
                </div>

                {/* 3D gold number */}
                <div style={{
                  fontSize: b.range.length > 3 ? "42px" : "56px",
                  fontWeight: "900",
                  lineHeight: 1,
                  marginBottom: "4px",
                  // Gold 3D text effect using text-shadow layers
                  color: "#ffd700",
                  textShadow: [
                    "0 1px 0 #c8a12a",
                    "0 2px 0 #b8921f",
                    "0 3px 0 #a8821a",
                    "0 4px 0 #987215",
                    "0 5px 0 #886210",
                    "0 6px 1px rgba(0,0,0,0.1)",
                    "0 0 5px rgba(0,0,0,0.1)",
                    "0 1px 3px rgba(0,0,0,0.3)",
                    "0 3px 5px rgba(0,0,0,0.2)",
                    "0 5px 10px rgba(0,0,0,0.25)",
                    "0 10px 10px rgba(0,0,0,0.2)",
                    "0 20px 20px rgba(0,0,0,0.15)",
                  ].join(", "),
                  direction: "ltr",
                  letterSpacing: "-2px",
                }}>
                  {b.range}
                </div>
              </div>

              {/* Label below — white/light background */}
              <div style={{
                backgroundColor: "#f8f4f4",
                padding: "10px 14px",
                textAlign: "center",
                borderTop: "1px solid #e8e0e0",
              }}>
                <span style={{ color: "#333", fontSize: "12px", fontWeight: "700" }}>
                  {b.label}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <style>{`
        @media(max-width:768px){.bb-grid{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:420px){.bb-grid{grid-template-columns:1fr!important}}
      `}</style>
    </section>
  );
}
