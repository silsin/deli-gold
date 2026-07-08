"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { ShoppingCart, Menu, X, LogOut, Package, LogIn, User, ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "./CartContext";

interface AuthUser { id: string; name: string; email: string; role: string; }

const IgIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
);
const WaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51A11.945 11.945 0 0 0 12 0C5.373 0 0 5.373 0 12c0 2.122.555 4.112 1.525 5.84L0 24l6.335-1.652A11.955 11.955 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.016-1.375l-.36-.213-3.727.977 1.002-3.641-.234-.373A9.818 9.818 0 0 1 2.182 12C2.182 6.575 6.575 2.182 12 2.182S21.818 6.575 21.818 12 17.425 21.818 12 21.818z"/>
  </svg>
);

interface NavLink { label: string; href: string; }

const DEFAULT_CAT_LINKS: NavLink[] = [
  { label: "هدیه",         href: "/products" },
  { label: "کالکشن",       href: "/collections" },
  { label: "تخفیف‌دار",    href: "/products" },
  { label: "✨ پرو مجازی", href: "/tryon" },
  { label: "گردنبند",      href: "/products?category=necklaces" },
  { label: "گوشواره",      href: "/products?category=earrings" },
  { label: "انگشتر",       href: "/products?category=rings" },
  { label: "دستبند",       href: "/products?category=bracelets" },
  { label: "ست و نیم‌ست", href: "/products" },
  { label: "پابند",        href: "/products" },
  { label: "جاسوئیچی",    href: "/products" },
  { label: "بچه‌گانه",     href: "/products" },
  { label: "سکه",          href: "/products" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal]   = useState("");
  const [userOpen, setUserOpen]     = useState(false);
  const [authUser, setAuthUser]     = useState<AuthUser | null>(null);
  const [authDone, setAuthDone]     = useState(false);
  const [phone, setPhone]           = useState("");
  const [wa, setWa]                 = useState("");
  const [ig, setIg]                 = useState("");
  const [catLinks, setCatLinks]     = useState<NavLink[]>(DEFAULT_CAT_LINKS);

  const uT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const router   = useRouter();
  const { count } = useCart();

  const checkAuth = useCallback(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then(r => r.json())
      .then(d => { setAuthUser(d.success ? d.data : null); setAuthDone(true); })
      .catch(() => { setAuthUser(null); setAuthDone(true); });
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth, pathname]);

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(d => {
      if (!d.success) return;
      if (d.data.site_phone1)      setPhone(d.data.site_phone1);
      if (d.data.site_whatsapp)    setWa(d.data.site_whatsapp);
      if (d.data.site_instagram)   setIg(d.data.site_instagram);
      if (d.data.nav_links) {
        try { const parsed = JSON.parse(d.data.nav_links); if (Array.isArray(parsed) && parsed.length > 0) setCatLinks(parsed); } catch {}
      }
    }).catch(() => {});
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchVal.trim()) return;
    setSearchOpen(false);
    router.push(`/products?search=${encodeURIComponent(searchVal.trim())}`);
    setSearchVal("");
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthUser(null); setUserOpen(false);
    router.push("/"); router.refresh();
  }

  const active = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100 }}>

      {/* ── Row 2: Main nav ── */}
      <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #ebebeb", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 20px", height: "66px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* LEFT: social icons + phone — desktop only */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1 }}>
            {wa && (
              <a href={wa} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer" className="nav-social-icon"
                style={{ color: "#999", display: "flex", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#25d366"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#999"}>
                <WaIcon />
              </a>
            )}
            {ig && (
              <a href={ig} aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="nav-social-icon"
                style={{ color: "#999", display: "flex", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#e1306c"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#999"}>
                <IgIcon />
              </a>
            )}
            {phone && (
              <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="nav-phone-link"
                style={{ display: "flex", alignItems: "center", gap: "5px", color: "#555", textDecoration: "none", fontSize: "13px", direction: "ltr", borderRight: (wa || ig) ? "1px solid #e8e8e8" : "none", paddingRight: (wa || ig) ? "14px" : "0", marginRight: "2px" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.72A2 2 0 012 .18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.09-1.09a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/></svg>
                {phone}
              </a>
            )}
            {/* mobile: cart + user + hamburger */}
            <div className="nav-mobile-icons" style={{ display: "none", alignItems: "center", gap: "10px" }}>
              <Link href="/cart" style={{ position: "relative", color: "#555", display: "flex", textDecoration: "none" }}>
                <ShoppingCart size={20} />
                {count > 0 && <span style={{ position: "absolute", top: "-6px", left: "-6px", backgroundColor: "#c8a12a", color: "#fff", fontSize: "9px", fontWeight: "900", borderRadius: "50%", width: "15px", height: "15px", display: "flex", alignItems: "center", justifyContent: "center" }}>{count > 9 ? "9+" : count}</span>}
              </Link>
              {authDone && !authUser && (
                <Link href="/login" style={{ display: "flex", alignItems: "center", gap: "4px", color: "#555", textDecoration: "none", fontSize: "12px", fontWeight: "600" }}>
                  <User size={16} /> عضویت/ورود
                </Link>
              )}
              {authDone && authUser && (
                <Link href="/account" style={{ display: "flex", alignItems: "center", gap: "4px", color: "#c8a12a", textDecoration: "none", fontSize: "12px", fontWeight: "600" }}>
                  <User size={16} />
                </Link>
              )}
              <button aria-label="منو" onClick={() => setMenuOpen(o => !o)}
                style={{ color: "#c8a12a", background: "none", border: "1px solid #e0d4b0", borderRadius: "7px", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* RIGHT: logo + desktop actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, justifyContent: "flex-end" }}>

            {/* Desktop actions: search, cart, user */}
            <div className="nav-desktop-actions" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button onClick={() => { setSearchOpen(o => !o); setSearchVal(""); }}
                style={{ color: "#888", background: "none", border: "none", cursor: "pointer", display: "flex", padding: "4px", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#c8a12a"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#888"}>
                {searchOpen ? <X size={18} /> : <Search size={18} />}
              </button>
              <Link href="/cart" style={{ position: "relative", color: "#555", display: "flex", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#c8a12a"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#555"}>
                <ShoppingCart size={20} />
                {count > 0 && <span style={{ position: "absolute", top: "-6px", left: "-6px", backgroundColor: "#c8a12a", color: "#fff", fontSize: "9px", fontWeight: "900", borderRadius: "50%", width: "15px", height: "15px", display: "flex", alignItems: "center", justifyContent: "center" }}>{count > 9 ? "9+" : count}</span>}
              </Link>
              {/* User dropdown */}
              {authDone && (
                authUser ? (
                  <div style={{ position: "relative" }}
                    onMouseEnter={() => { uT.current && clearTimeout(uT.current); setUserOpen(true); }}
                    onMouseLeave={() => { uT.current = setTimeout(() => setUserOpen(false), 180); }}>
                    <button style={{ display: "flex", alignItems: "center", gap: "5px", backgroundColor: "#fdf8ee", border: "1px solid #c8a12a", borderRadius: "20px", padding: "5px 12px", color: "#c8a12a", cursor: "pointer", fontSize: "12px", fontFamily: "inherit", fontWeight: "600" }}>
                      <User size={13} />
                      <span style={{ maxWidth: "70px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{authUser.name.split(" ")[0]}</span>
                      <ChevronDown size={10} style={{ transform: userOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
                    </button>
                    {userOpen && (
                      <div onMouseEnter={() => { uT.current && clearTimeout(uT.current); setUserOpen(true); }}
                        onMouseLeave={() => { uT.current = setTimeout(() => setUserOpen(false), 180); }}
                        style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, minWidth: "190px", backgroundColor: "#fff", border: "1px solid #e8e8e8", borderRadius: "10px", padding: "6px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 200, animation: "ddIn 0.15s ease" }}>
                        <div style={{ padding: "8px 12px 10px", borderBottom: "1px solid #f0f0f0", marginBottom: "4px" }}>
                          <p style={{ color: "#222", fontSize: "13px", fontWeight: "700" }}>{authUser.name}</p>
                          <p style={{ color: "#aaa", fontSize: "11px" }}>{authUser.email}</p>
                        </div>
                        {[{ href: "/account", icon: <User size={13} />, label: "حساب کاربری" }, { href: "/account?tab=orders", icon: <Package size={13} />, label: "سفارش‌های من" }].map(item => (
                          <Link key={item.href} href={item.href} onClick={() => setUserOpen(false)}
                            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", color: "#444", textDecoration: "none", fontSize: "13px", borderRadius: "6px", transition: "background-color 0.15s" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#fdf8ee"; (e.currentTarget as HTMLElement).style.color = "#c8a12a"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "#444"; }}>
                            {item.icon} {item.label}
                          </Link>
                        ))}
                        {authUser.role === "ADMIN" && (
                          <Link href="/admin" onClick={() => setUserOpen(false)}
                            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", color: "#c8a12a", textDecoration: "none", fontSize: "13px", borderRadius: "6px", borderTop: "1px solid #f0f0f0", marginTop: "4px", fontWeight: "600" }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "#fdf8ee"}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}>
                            پنل مدیریت ←
                          </Link>
                        )}
                        <button onClick={handleLogout}
                          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", color: "#dc2626", background: "none", border: "none", fontSize: "13px", borderRadius: "6px", cursor: "pointer", fontFamily: "inherit", width: "100%", textAlign: "right", borderTop: "1px solid #f0f0f0", marginTop: "4px" }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "#fff1f1"}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}>
                          <LogOut size={13} /> خروج
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href="/login" style={{ display: "flex", alignItems: "center", gap: "5px", color: "#555", textDecoration: "none", fontSize: "12px", fontWeight: "600", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#c8a12a"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#555"}>
                    <LogIn size={14} /> عضویت/ورود
                  </Link>
                )
              )}
            </div>

            {/* Logo */}
            <Link href="/" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontFamily: "serif", fontSize: "26px", fontWeight: "900", letterSpacing: "1px", lineHeight: 1 }}>
                <span style={{ color: "#c8a12a" }}>D</span>
                <span style={{ color: "#222" }}>ELLY</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "16px", height: "1px", backgroundColor: "#c8a12a", display: "block" }}></span>
                <span style={{ color: "#c8a12a", fontSize: "8px", fontWeight: "700", letterSpacing: "2.5px" }}>GOLD</span>
                <span style={{ width: "16px", height: "1px", backgroundColor: "#c8a12a", display: "block" }}></span>
              </div>
              <div style={{ color: "#bbb", fontSize: "8px", letterSpacing: "1px" }}>دلی گلد</div>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Search bar ── */}
      {searchOpen && (
        <div style={{ backgroundColor: "#fafafa", borderBottom: "1px solid #ebebeb", padding: "10px 16px" }}>
          <form onSubmit={handleSearch} style={{ maxWidth: "600px", margin: "0 auto", display: "flex", gap: "8px" }}>
            <input autoFocus value={searchVal} onChange={e => setSearchVal(e.target.value)} placeholder="جستجو در محصولات دلی گلد..."
              style={{ flex: 1, backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "8px", padding: "9px 14px", color: "#222", fontSize: "14px", outline: "none" }}
              onFocus={e => (e.target.style.borderColor = "#c8a12a")} onBlur={e => (e.target.style.borderColor = "#ddd")} />
            <button type="submit" style={{ backgroundColor: "#c8a12a", color: "#fff", border: "none", borderRadius: "8px", padding: "9px 22px", fontWeight: "700", fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>جستجو</button>
          </form>
        </div>
      )}

      {/* ── Category links row ── */}
      <nav style={{ backgroundColor: "#fff", borderBottom: "1px solid #f0f0f0" }} className="cat-nav-row">
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px", overflowX: "auto", scrollbarWidth: "none" }}>
          <div style={{ display: "flex", alignItems: "center", height: "40px", minWidth: "max-content" }}>
            {catLinks.map((link, i) => (
              <Link key={i} href={link.href}
                style={{ display: "flex", alignItems: "center", height: "100%", padding: "0 16px",
                  color: active(link.href) && link.href !== "/products" ? "#c8a12a" : "#444",
                  textDecoration: "none", fontSize: "13px", fontWeight: "500",
                  borderLeft: i < catLinks.length - 1 ? "1px solid #f0f0f0" : "none",
                  whiteSpace: "nowrap", transition: "color 0.2s, background-color 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#c8a12a"; (e.currentTarget as HTMLElement).style.backgroundColor = "#fdf8ee"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#444"; (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Mobile slide-down menu ── */}
      {menuOpen && (
        <div style={{ backgroundColor: "#fff", borderTop: "1px solid #ebebeb", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {authUser ? (
              <>
                <li style={{ borderBottom: "1px solid #f5f5f5", backgroundColor: "#fdf8ee" }}>
                  <Link href="/account" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "13px 20px", color: "#c8a12a", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
                    <User size={16} /> {authUser.name}
                  </Link>
                </li>
                <li style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <Link href="/account?tab=orders" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "13px 20px", color: "#555", textDecoration: "none", fontSize: "14px" }}>
                    <Package size={16} /> سفارش‌های من
                  </Link>
                </li>
              </>
            ) : (
              <li style={{ borderBottom: "1px solid #f5f5f5", backgroundColor: "#fdf8ee" }}>
                <Link href="/login" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "13px 20px", color: "#c8a12a", textDecoration: "none", fontSize: "14px", fontWeight: "700" }}>
                  <LogIn size={16} /> ورود / ثبت‌نام
                </Link>
              </li>
            )}
            <li style={{ borderBottom: "1px solid #f5f5f5" }}>
              <Link href="/cart" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "13px 20px", color: "#333", textDecoration: "none", fontSize: "14px" }}>
                <ShoppingCart size={16} /> سبد خرید {count > 0 && <span style={{ backgroundColor: "#c8a12a", color: "#fff", borderRadius: "10px", padding: "1px 7px", fontSize: "11px", fontWeight: "700" }}>{count}</span>}
              </Link>
            </li>
            {catLinks.map((link, i) => (
              <li key={i} style={{ borderBottom: "1px solid #f5f5f5" }}>
                <Link href={link.href} onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "12px 20px", color: active(link.href) && link.href !== "/products" ? "#c8a12a" : "#333", textDecoration: "none", fontSize: "13px" }}>
                  {link.label}
                </Link>
              </li>
            ))}
            {authUser && (
              <li>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "13px 20px", color: "#dc2626", background: "none", border: "none", fontSize: "14px", cursor: "pointer", fontFamily: "inherit", width: "100%", textAlign: "right" }}>
                  <LogOut size={16} /> خروج
                </button>
              </li>
            )}
          </ul>
        </div>
      )}

      <style>{`
        @keyframes ddIn { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:translateY(0)} }
        .cat-nav-row ::-webkit-scrollbar { display: none; }

        /* Desktop defaults */
        .nav-social-icon   { display: flex !important; }
        .nav-phone-link    { display: flex !important; }
        .nav-desktop-actions { display: flex !important; }
        .nav-mobile-icons  { display: none !important; }
        .cat-nav-row       { display: block !important; }

        @media(max-width: 900px) {
          .nav-social-icon   { display: none !important; }
          .nav-phone-link    { display: none !important; }
          .nav-desktop-actions { display: none !important; }
          .nav-mobile-icons  { display: flex !important; }
          .cat-nav-row       { display: none !important; }
        }
      `}</style>
    </header>
  );
}
