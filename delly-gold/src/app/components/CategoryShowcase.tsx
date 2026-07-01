"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

interface Category { id: string; name: string; slug: string; product_count: number; }

// Editorial B&W model/jewelry images — tall portrait format
const catMeta: Record<string, { image: string; label: string }> = {
  necklaces: {
    label: "مشاهده همه گردنبندها",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=85",
  },
  rings: {
    label: "مشاهده همه انگشترها",
    image: "https://images.unsplash.com/photo-1512163143273-bde0e3cc7407?w=600&q=85",
  },
  bracelets: {
    label: "مشاهده همه دستبندها",
    image: "https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=85",
  },
  earrings: {
    label: "مشاهده همه گوشواره‌ها",
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=85",
  },
};

// Static editorial cards always shown — matching mio-gold's model photos
const staticCards = [
  {
    id: "s1",
    label: "مشاهده همه آویزهای ساعت",
    slug: "watch-pendant",
    href: "/products",
    image: "https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?w=600&q=85",
  },
  {
    id: "s2",
    label: "مشاهده همه دستبندها",
    slug: "bracelets",
    href: "/products?category=bracelets",
    image: "https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=85",
  },
  {
    id: "s3",
    label: "مشاهده همه گردنبندها",
    slug: "necklaces",
    href: "/products?category=necklaces",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=85",
  },
  {
    id: "s4",
    label: "مشاهده همه انگشترها",
    slug: "rings",
    href: "/products?category=rings",
    image: "https://images.unsplash.com/photo-1512163143273-bde0e3cc7407?w=600&q=85",
  },
  {
    id: "s5",
    label: "مشاهده همه گوشواره‌ها",
    slug: "earrings",
    href: "/products?category=earrings",
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=85",
  },
  {
    id: "s6",
    label: "مشاهده همه ست‌ها",
    slug: "sets",
    href: "/products",
    image: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=85",
  },
];

export default function CategoryShowcase() {
  const [cats, setCats] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then(d => { if (d.success) setCats(d.data); })
      .catch(() => {});
  }, []);

  // Build display cards — use DB categories if available, merge with static
  const cards = cats.length > 0
    ? cats.map(c => ({
        id: c.id,
        label: `مشاهده همه ${c.name}`,
        slug: c.slug,
        href: `/products?category=${c.id}`,
        image: catMeta[c.slug]?.image || staticCards.find(s => s.slug === c.slug)?.image || staticCards[0].image,
      }))
    : staticCards;

  return (
    <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px 32px" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "14px",
      }} className="cat-showcase-grid">
        {cards.slice(0, 6).map(card => (
          <Link
            key={card.id}
            href={card.href}
            style={{ textDecoration: "none", display: "block" }}
          >
            <div
              style={{
                position: "relative",
                borderRadius: "16px",
                overflow: "hidden",
                aspectRatio: "3/4",
                cursor: "pointer",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(-4px)";
                el.style.boxShadow = "0 12px 32px rgba(0,0,0,0.18)";
                const img = el.querySelector(".cs-img") as HTMLElement;
                if (img) img.style.transform = "scale(1.06)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)";
                const img = el.querySelector(".cs-img") as HTMLElement;
                if (img) img.style.transform = "scale(1)";
              }}
            >
              {/* B&W photo */}
              <img
                className="cs-img"
                src={card.image}
                alt={card.label}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center top",
                  filter: "grayscale(100%) contrast(1.05)",
                  transition: "transform 0.5s ease",
                  display: "block",
                }}
              />

              {/* Subtle bottom gradient for button readability */}
              <div style={{
                position: "absolute",
                bottom: 0, left: 0, right: 0,
                height: "40%",
                background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)",
                pointerEvents: "none",
              }} />

              {/* Pill button at bottom — dark with arrow */}
              <div style={{
                position: "absolute",
                bottom: "16px",
                right: "14px",
                left: "14px",
                display: "flex",
                justifyContent: "flex-end",
              }}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "rgba(20,20,20,0.88)",
                  color: "#fff",
                  padding: "9px 16px",
                  borderRadius: "30px",
                  fontSize: "12px",
                  fontWeight: "700",
                  backdropFilter: "blur(6px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.2px",
                }}>
                  <ArrowLeft size={14} strokeWidth={2.5} />
                  {card.label}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        @media(max-width:900px) { .cat-showcase-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media(max-width:480px) { .cat-showcase-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
