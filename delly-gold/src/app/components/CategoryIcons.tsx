"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Category { id: string; name: string; slug: string; product_count: number; }

// SVG icons for each category — gray circular style like mio-gold
const CatSvg = ({ slug }: { slug: string }) => {
  const icons: Record<string, React.ReactNode> = {
    necklaces: (
      <svg viewBox="0 0 64 64" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36">
        <path d="M32 12 C16 12 8 22 8 34 C8 46 18 54 32 54 C46 54 56 46 56 34 C56 22 48 12 32 12Z"/>
        <circle cx="32" cy="54" r="4" fill="#aaa" stroke="none"/>
        <path d="M24 12 C24 8 28 6 32 6 C36 6 40 8 40 12"/>
      </svg>
    ),
    rings: (
      <svg viewBox="0 0 64 64" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" width="36" height="36">
        <circle cx="32" cy="32" r="18"/>
        <circle cx="32" cy="32" r="10"/>
        <path d="M26 14 C28 10 36 10 38 14"/>
        <circle cx="32" cy="11" r="3" fill="#aaa" stroke="none"/>
      </svg>
    ),
    bracelets: (
      <svg viewBox="0 0 64 64" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" width="36" height="36">
        <path d="M14 32 C14 20 20 14 32 14 C44 14 50 20 50 32 C50 44 44 50 32 50 C20 50 14 44 14 32Z"/>
        <path d="M14 30 L50 30"/>
        <circle cx="32" cy="14" r="3" fill="#aaa" stroke="none"/>
        <circle cx="32" cy="50" r="3" fill="#aaa" stroke="none"/>
      </svg>
    ),
    earrings: (
      <svg viewBox="0 0 64 64" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" width="36" height="36">
        <circle cx="22" cy="18" r="4"/>
        <path d="M22 22 L22 42 L16 50 L28 50 L22 42"/>
        <circle cx="42" cy="18" r="4"/>
        <path d="M42 22 L42 42 L36 50 L48 50 L42 42"/>
      </svg>
    ),
    sets: (
      <svg viewBox="0 0 64 64" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" width="36" height="36">
        <circle cx="32" cy="22" r="8"/>
        <path d="M18 46 C18 38 24 34 32 34 C40 34 46 38 46 46"/>
        <path d="M14 54 L50 54"/>
        <circle cx="32" cy="22" r="3" fill="#aaa" stroke="none"/>
      </svg>
    ),
    anklet: (
      <svg viewBox="0 0 64 64" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" width="36" height="36">
        <path d="M12 36 C12 24 20 16 32 16 C44 16 52 24 52 36"/>
        <path d="M16 36 C16 42 23 48 32 48 C41 48 48 42 48 36"/>
        <circle cx="32" cy="52" r="4" fill="#aaa" stroke="none"/>
        <path d="M28 52 L36 52"/>
      </svg>
    ),
    keychain: (
      <svg viewBox="0 0 64 64" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" width="36" height="36">
        <circle cx="32" cy="22" r="12"/>
        <circle cx="32" cy="22" r="5"/>
        <path d="M32 34 L32 54"/>
        <path d="M26 44 L38 44"/>
        <path d="M26 50 L38 50"/>
      </svg>
    ),
    kids: (
      <svg viewBox="0 0 64 64" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" width="36" height="36">
        <circle cx="32" cy="20" r="10"/>
        <path d="M20 20 C14 20 10 26 10 32 L10 50 L54 50 L54 32 C54 26 50 20 44 20"/>
        <text x="32" y="38" textAnchor="middle" fontSize="14" fontWeight="700" fill="#aaa" stroke="none">کids</text>
      </svg>
    ),
    coin: (
      <svg viewBox="0 0 64 64" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" width="36" height="36">
        <circle cx="32" cy="32" r="20"/>
        <circle cx="32" cy="32" r="14"/>
        <path d="M32 24 L32 26 M32 38 L32 40 M24 32 L26 32 M38 32 L40 32"/>
        <path d="M28 29 C28 27 30 26 32 26 C34 26 36 27 36 29 C36 32 32 32 32 35 M32 37 L32 38"/>
      </svg>
    ),
    accessories: (
      <svg viewBox="0 0 64 64" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" width="36" height="36">
        <rect x="14" y="22" width="36" height="26" rx="4"/>
        <path d="M22 22 L22 18 C22 14 26 12 32 12 C38 12 42 14 42 18 L42 22"/>
        <circle cx="32" cy="35" r="5"/>
        <path d="M32 30 L32 22"/>
      </svg>
    ),
  };

  const defaultIcon = (
    <svg viewBox="0 0 64 64" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" width="36" height="36">
      <circle cx="32" cy="32" r="20"/>
      <path d="M22 32 L30 40 L42 24"/>
    </svg>
  );

  return <>{icons[slug] || defaultIcon}</>;
};

const staticCats = [
  { id: "s1", name: "گردنبند",   slug: "necklaces",   href: "/products?category=necklaces" },
  { id: "s2", name: "انگشتر",    slug: "rings",       href: "/products?category=rings" },
  { id: "s3", name: "دستبند",    slug: "bracelets",   href: "/products?category=bracelets" },
  { id: "s4", name: "گوشواره",   slug: "earrings",    href: "/products?category=earrings" },
  { id: "s5", name: "ست طلا",    slug: "sets",        href: "/products" },
  { id: "s6", name: "پابند",     slug: "anklet",      href: "/products" },
  { id: "s7", name: "جاسوئیچی",  slug: "keychain",    href: "/products" },
  { id: "s8", name: "بچه‌گانه",  slug: "kids",        href: "/products" },
  { id: "s9", name: "سکه",       slug: "coin",        href: "/products" },
  { id: "s10", name: "اکسسوری", slug: "accessories", href: "/products" },
];

export default function CategoryIcons() {
  const [cats, setCats] = useState<Category[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/categories").then(r => r.json())
      .then(d => { if (d.success) setCats(d.data); }).catch(() => {});
  }, []);

  const items = cats.length > 0
    ? cats.map(c => ({ id: c.id, name: c.name, slug: c.slug, href: `/products?category=${c.id}` }))
    : staticCats;

  // Merge DB cats with static extras
  const merged = [
    ...items,
    ...staticCats.filter(s => !items.find(i => i.slug === s.slug)),
  ];

  function scroll(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  }

  return (
    <section style={{ backgroundColor: "#fff", padding: "28px 0 20px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 40px", position: "relative" }}>
        {/* Left arrow */}
        <button onClick={() => scroll("left")} aria-label="قبلی"
          style={{ position: "absolute", left: "8px", top: "40px", transform: "translateY(-50%)", width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#fff", border: "1px solid #e0e0e0", color: "#888", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5, boxShadow: "0 1px 4px rgba(0,0,0,0.1)", transition: "all 0.2s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#c8a12a"; (e.currentTarget as HTMLElement).style.color = "#c8a12a"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#e0e0e0"; (e.currentTarget as HTMLElement).style.color = "#888"; }}>
          <ChevronLeft size={14} />
        </button>

        {/* Right arrow */}
        <button onClick={() => scroll("right")} aria-label="بعدی"
          style={{ position: "absolute", right: "8px", top: "40px", transform: "translateY(-50%)", width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#fff", border: "1px solid #e0e0e0", color: "#888", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5, boxShadow: "0 1px 4px rgba(0,0,0,0.1)", transition: "all 0.2s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#c8a12a"; (e.currentTarget as HTMLElement).style.color = "#c8a12a"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#e0e0e0"; (e.currentTarget as HTMLElement).style.color = "#888"; }}>
          <ChevronRight size={14} />
        </button>

        {/* Scrollable row */}
        <div ref={scrollRef} style={{ display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none", padding: "0 4px" }}>
          <style>{`::-webkit-scrollbar{display:none}`}</style>
          {merged.map(cat => (
            <Link key={cat.id} href={cat.href} style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", flexShrink: 0, width: "88px", padding: "4px 0" }}>
              {/* Gray circle with icon */}
              <div style={{
                width: "72px", height: "72px",
                borderRadius: "50%",
                backgroundColor: "#efefef",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background-color 0.2s, transform 0.2s",
                border: "2px solid transparent",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#fdf8ee";
                  (e.currentTarget as HTMLElement).style.borderColor = "#c8a12a";
                  (e.currentTarget as HTMLElement).style.transform = "scale(1.08)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#efefef";
                  (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                  (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                }}>
                <CatSvg slug={cat.slug} />
              </div>
              <span style={{ color: "#444", fontSize: "11px", fontWeight: "600", textAlign: "center", whiteSpace: "nowrap" }}>
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
