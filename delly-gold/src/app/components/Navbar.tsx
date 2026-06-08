"use client";
import { useState, useRef } from "react";
import { Search, User, Heart, ShoppingCart, Menu, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navLinks = [
  { label: "صفحه اصلی", href: "/" },
  { label: "محصولات", href: "/products" },
  {
    label: "کالکشن‌ها",
    href: "/collections",
    dropdown: [
      { label: "همه کالکشن‌ها", href: "/collections" },
      { label: "گردنبند", href: "/products?category=necklaces" },
      { label: "انگشتر", href: "/products?category=rings" },
      { label: "دستبند", href: "/products?category=bracelets" },
      { label: "گوشواره", href: "/products?category=earrings" },
    ],
  },
  {
    label: "ویترین‌ها",
    href: "/showcase",
    dropdown: [
      { label: "همه ویترین‌ها", href: "/showcase" },
      { label: "ویترین اقتصادی", href: "/showcase" },
      { label: "ویترین دانشجویی", href: "/showcase" },
      { label: "پیشنهاد ویژه", href: "/showcase" },
    ],
  },
  { label: "درباره ما", href: "/about" },
  { label: "تماس با ما", href: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchVal.trim()) {
      setSearchOpen(false);
      router.push(`/products?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal("");
    }
  }

  function openMenu(label: string) {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
    setOpenDropdown(label);
  }

  function scheduleClose() {
    dropdownTimer.current = setTimeout(() => setOpenDropdown(null), 150);
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav style={{ backgroundColor: "#0e0e0e", borderBottom: "1px solid #2a2a2a", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>

        {/* ── Left: icons ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            aria-label="جستجو"
            onClick={() => { setSearchOpen(o => !o); setSearchVal(""); }}
            style={{ color: searchOpen ? "#d4af37" : "#ccc", background: "none", border: "none", cursor: "pointer", padding: "4px", transition: "color 0.2s", display: "flex" }}>
            {searchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          <Link href="/contact" aria-label="تماس"
            style={{ color: "#ccc", display: "flex", lineHeight: 0, transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#d4af37"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#ccc"}>
            <User size={20} />
          </Link>

          <Link href="/products" aria-label="علاقه‌مندی‌ها"
            style={{ color: "#ccc", display: "flex", lineHeight: 0, transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#d4af37"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#ccc"}>
            <Heart size={20} />
          </Link>

          <Link href="/products" aria-label="سبد خرید"
            style={{ position: "relative", color: "#ccc", display: "flex", lineHeight: 0, transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#d4af37"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#ccc"}>
            <ShoppingCart size={20} />
            <span style={{ position: "absolute", top: "-6px", left: "-6px", backgroundColor: "#d4af37", color: "#000", fontSize: "10px", fontWeight: "bold", borderRadius: "50%", width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              ۰
            </span>
          </Link>
        </div>

        {/* ── Center: nav links ── */}
        <ul style={{ display: "flex", alignItems: "center", gap: "4px", listStyle: "none", margin: 0, padding: 0 }} className="desktop-nav">
          {navLinks.map(link => (
            <li key={link.href} style={{ position: "relative" }}
              onMouseEnter={() => link.dropdown && openMenu(link.label)}
              onMouseLeave={() => link.dropdown && scheduleClose()}>
              <Link
                href={link.href}
                style={{
                  color: isActive(link.href) ? "#d4af37" : "#ccc",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: isActive(link.href) ? "700" : "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  transition: "color 0.2s, background-color 0.2s",
                  backgroundColor: isActive(link.href) ? "rgba(212,175,55,0.08)" : "transparent",
                }}
                onMouseEnter={e => { if (!isActive(link.href)) (e.currentTarget as HTMLElement).style.color = "#d4af37"; }}
                onMouseLeave={e => { if (!isActive(link.href)) (e.currentTarget as HTMLElement).style.color = "#ccc"; }}>
                {link.label}
                {link.dropdown && (
                  <ChevronDown size={12} style={{ transition: "transform 0.2s", transform: openDropdown === link.label ? "rotate(180deg)" : "rotate(0)" }} />
                )}
              </Link>

              {/* Dropdown panel */}
              {link.dropdown && openDropdown === link.label && (
                <div
                  onMouseEnter={() => openMenu(link.label)}
                  onMouseLeave={scheduleClose}
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    right: 0,
                    minWidth: "180px",
                    backgroundColor: "#161616",
                    border: "1px solid #2a2a2a",
                    borderRadius: "10px",
                    padding: "6px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                    zIndex: 200,
                    animation: "fadeIn 0.15s ease",
                  }}>
                  {link.dropdown.map((item, i) => (
                    <Link key={i} href={item.href}
                      onClick={() => setOpenDropdown(null)}
                      style={{
                        display: "block",
                        padding: "9px 14px",
                        color: i === 0 ? "#d4af37" : "#ccc",
                        textDecoration: "none",
                        fontSize: "13px",
                        borderRadius: "6px",
                        transition: "background-color 0.15s, color 0.15s",
                        borderBottom: i === 0 ? "1px solid #2a2a2a" : "none",
                        fontWeight: i === 0 ? "600" : "400",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(212,175,55,0.1)"; (e.currentTarget as HTMLElement).style.color = "#d4af37"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = i === 0 ? "#d4af37" : "#ccc"; }}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* ── Right: logo ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button aria-label="منو" onClick={() => setMenuOpen(!menuOpen)}
            style={{ display: "none", color: "#d4af37", background: "none", border: "none", cursor: "pointer" }}
            className="mobile-menu-btn">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div>
                <div style={{ color: "#d4af37", fontSize: "22px", fontWeight: "900", lineHeight: 1, letterSpacing: "-1px" }}>DG</div>
                <div style={{ color: "#d4af37", fontSize: "11px", fontWeight: "600", letterSpacing: "2px" }}>DELLY GOLD</div>
              </div>
              <div style={{ width: "28px", height: "28px", border: "2px solid #d4af37", transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "10px", height: "10px", backgroundColor: "#d4af37" }} />
              </div>
            </div>
          </Link>

          <div style={{ color: "#888", fontSize: "12px", borderRight: "1px solid #333", paddingRight: "12px" }}>
            به دلی گلد خوش آمدید
          </div>
        </div>
      </div>

      {/* ── Search bar ── */}
      {searchOpen && (
        <div style={{ backgroundColor: "#111", borderTop: "1px solid #1a1a1a", padding: "12px 16px" }}>
          <form onSubmit={handleSearch} style={{ maxWidth: "560px", margin: "0 auto", display: "flex", gap: "8px" }}>
            <input
              autoFocus
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="جستجو در محصولات دلی گلد..."
              style={{ flex: 1, backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", padding: "10px 14px", color: "#fff", fontSize: "14px", outline: "none" }}
            />
            <button type="submit"
              style={{ backgroundColor: "#d4af37", color: "#000", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: "700", fontSize: "14px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              جستجو
            </button>
          </form>
        </div>
      )}

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div style={{ backgroundColor: "#161616", borderTop: "1px solid #2a2a2a", padding: "8px 0" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {navLinks.map(link => (
              <li key={link.href} style={{ borderBottom: "1px solid #1f1f1f" }}>
                <Link href={link.href} onClick={() => setMenuOpen(false)}
                  style={{ display: "block", padding: "13px 20px", color: isActive(link.href) ? "#d4af37" : "#ccc", textDecoration: "none", fontSize: "14px", fontWeight: isActive(link.href) ? "700" : "400" }}>
                  {link.label}
                </Link>
                {/* Mobile sub-items */}
                {link.dropdown && (
                  <div style={{ backgroundColor: "#111", paddingRight: "20px" }}>
                    {link.dropdown.slice(1).map((item, i) => (
                      <Link key={i} href={item.href} onClick={() => setMenuOpen(false)}
                        style={{ display: "block", padding: "9px 20px", color: "#666", textDecoration: "none", fontSize: "12px", borderTop: "1px solid #1a1a1a" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#d4af37"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#666"}>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
