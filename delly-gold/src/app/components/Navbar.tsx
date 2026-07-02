"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Search, User, ShoppingCart, Menu, X, LogOut, Package, LogIn, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "./CartContext";

interface AuthUser { id: string; name: string; email: string; role: string; }
interface GoldPrice { price: number; changePercent: string; isUp: boolean; }

const Ig = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
);
const Wa = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.016-1.375l-.36-.213-3.727.977 1.002-3.641-.234-.373A9.818 9.818 0 012.182 12C2.182 6.575 6.575 2.182 12 2.182S21.818 6.575 21.818 12 17.425 21.818 12 21.818z"/>
  </svg>
);

const catLinks = [
  { label: "هدیه",          href: "/products" },
  { label: "کالکشن",        href: "/collections" },
  { label: "تخفیف‌دار",     href: "/products" },
  { label: "✨ پرو مجازی",  href: "/tryon" },
  { label: "گردنبند",       href: "/products?category=necklaces" },
  { label: "گوشواره",       href: "/products?category=earrings" },
  { label: "انگشتر",        href: "/products?category=rings" },
  { label: "دستبند",        href: "/products?category=bracelets" },
  { label: "آویز ساعت",     href: "/products" },
  { label: "ست و نیم‌ست",  href: "/products" },
  { label: "پابند",         href: "/products" },
  { label: "جاسوئیچی",     href: "/products" },
  { label: "بچه‌گانه",      href: "/products" },
  { label: "سکه",           href: "/products" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [userOpen, setUserOpen]   = useState(false);
  const [authUser, setAuthUser]   = useState<AuthUser | null>(null);
  const [authDone, setAuthDone]   = useState(false);
  const [gold, setGold]           = useState<GoldPrice | null>(null);
  const [phone, setPhone]         = useState("021-1234-5678");
  const [wa, setWa]               = useState("#");
  const [ig, setIg]               = useState("#");

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
    const fetchGold = () => {
      fetch("/api/admin/gold-price", { cache: "no-store" })
        .then(r => r.json()).then(d => { if (d.success) setGold(d.data); }).catch(() => {});
    };
    fetchGold();
    const iv = setInterval(fetchGold, 60_000);
    // Load phone/social from settings
    fetch("/api/admin/settings").then(r => r.json()).then(d => {
      if (!d.success) return;
      if (d.data.site_phone1)   setPhone(d.data.site_phone1);
      if (d.data.site_whatsapp) setWa(d.data.site_whatsapp);
      if (d.data.site_instagram) setIg(d.data.site_instagram);
    }).catch(() => {});
    return () => clearInterval(iv);
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
    <header style={{ backgroundColor: "#fff", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>

      {/* ── Main nav row ── */}
      <div style={{ borderBottom: "1px solid #ebebeb" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px", height: "62px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* LEFT: social + phone + cart + login */}
          <div className="nav-left-group" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* Social — hide on mobile */}
            <a href={wa} aria-label="WhatsApp" className="nav-social" style={{ color: "#aaa", display: "flex", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#25d366"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#aaa"}><Wa /></a>
            <a href={ig} aria-label="Instagram" className="nav-social" style={{ color: "#aaa", display: "flex", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#e1306c"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#aaa"}><Ig /></a>
            {/* Phone — hide on mobile */}
            <a href={`tel:${phone.replace(/[^0-9]/g, "")}`} className="nav-phone" style={{ display: "flex", alignItems: "center", gap: "5px", color: "#555", textDecoration: "none", fontSize: "12px", direction: "ltr", borderRight: "1px solid #e8e8e8", paddingRight: "14px" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.72A2 2 0 012 .18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.09-1.09a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/></svg>
              {phone}
            </a>
            {/* Cart — always visible */}
            <Link href="/cart" style={{ position: "relative", color: "#555", display: "flex", transition: "color 0.2s", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#c8a12a"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#555"}>
              <ShoppingCart size={20} />
              {count > 0 && <span style={{ position: "absolute", top: "-6px", left: "-6px", backgroundColor: "#c8a12a", color: "#fff", fontSize: "9px", fontWeight: "900", borderRadius: "50%", width: "15px", height: "15px", display: "flex", alignItems: "center", justifyContent: "center" }}>{count > 9 ? "9+" : count}</span>}
            </Link>
            {/* User — hide dropdown on mobile, show compact */}
            {authDone && (
              authUser ? (
                <div className="nav-user-full" style={{ position: "relative" }}
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
                      style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, minWidth: "180px", backgroundColor: "#fff", border: "1px solid #e8e8e8", borderRadius: "10px", padding: "6px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 200, animation: "ddIn 0.15s ease" }}>
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
                          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", color: "#c8a12a", textDecoration: "none", fontSize: "13px", borderRadius: "6px", borderTop: "1px solid #f0f0f0", marginTop: "4px", fontWeight: "600", transition: "background-color 0.15s" }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "#fdf8ee"}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}>
                          پنل مدیریت ←
                        </Link>
                      )}
                      <button onClick={handleLogout}
                        style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", color: "#dc2626", background: "none", border: "none", fontSize: "13px", borderRadius: "6px", cursor: "pointer", fontFamily: "inherit", width: "100%", textAlign: "right", borderTop: "1px solid #f0f0f0", marginTop: "4px", transition: "background-color 0.15s" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "#fff1f1"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}>
                        <LogOut size={13} /> خروج
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="nav-user-full" style={{ display: "flex", alignItems: "center", gap: "5px", color: "#555", textDecoration: "none", fontSize: "12px", fontWeight: "600", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#c8a12a"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#555"}>
                  <LogIn size={14} /> عضویت/ورود
                </Link>
              )
            )}
            {/* Search icon */}
            <button onClick={() => { setSearchOpen(o => !o); setSearchVal(""); }}
              style={{ color: searchOpen ? "#c8a12a" : "#aaa", background: "none", border: "none", cursor: "pointer", padding: "2px", display: "flex", transition: "color 0.2s" }}>
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>
          </div>

          {/* CENTER: live gold price pill — hidden on mobile */}
          <div className="nav-gold-pill" style={{
            backgroundColor: "#c8a12a",
            borderRadius: "24px",
            padding: "6px 20px",
            alignItems: "center",
            gap: "8px",
          }}>
            <span style={{ color: "#fff", fontSize: "12px", fontWeight: "600" }}>قیمت طلا :</span>
            <span style={{ color: "#fff", fontSize: "13px", fontWeight: "900", direction: "ltr" }}>
              {gold ? `${gold.price.toLocaleString("fa-IR")} تومان` : "در حال دریافت..."}
            </span>
          </div>

          {/* RIGHT: Logo + hamburger */}
          <div className="nav-right-group" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button aria-label="منو" onClick={() => setMenuOpen(o => !o)} className="hamburger"
              style={{ color: "#c8a12a", background: "none", border: "1px solid #ddd", borderRadius: "7px", width: "34px", height: "34px", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <Link href="/" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div style={{ color: "#c8a12a", fontSize: "22px", fontWeight: "900", lineHeight: 1, letterSpacing: "-0.5px" }}>DELLY GOLD</div>
              <div style={{ color: "#bbb", fontSize: "9px", letterSpacing: "2px" }}>دلی گلد</div>
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
      <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #f0f0f0" }} className="cat-nav-row">
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px", overflowX: "auto", scrollbarWidth: "none" }}>
          <div style={{ display: "flex", alignItems: "center", height: "40px", gap: "0", minWidth: "max-content" }}>
            {catLinks.map((link, i) => (
              <Link key={i} href={link.href}
                style={{
                  display: "flex", alignItems: "center", height: "100%",
                  padding: "0 16px", color: active(link.href) && link.href !== "/products" ? "#c8a12a" : "#444",
                  textDecoration: "none", fontSize: "13px", fontWeight: "500",
                  borderLeft: i < catLinks.length - 1 ? "1px solid #f0f0f0" : "none",
                  whiteSpace: "nowrap", transition: "color 0.2s, background-color 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#c8a12a"; (e.currentTarget as HTMLElement).style.backgroundColor = "#fdf8ee"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#444"; (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div style={{ backgroundColor: "#fff", borderTop: "1px solid #ebebeb", maxHeight: "80vh", overflowY: "auto" }}>
          {/* Gold price on mobile */}
          <div style={{ backgroundColor: "#c8a12a", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "#fff", fontSize: "12px", fontWeight: "600" }}>قیمت طلا:</span>
            <span style={{ color: "#fff", fontSize: "13px", fontWeight: "900", direction: "ltr" }}>
              {gold ? `${gold.price.toLocaleString("fa-IR")} تومان` : "..."}
            </span>
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {/* Account/login */}
            {authUser ? (
              <>
                <li style={{ borderBottom: "1px solid #f5f5f5", backgroundColor: "#fdf8ee" }}>
                  <Link href="/account" onClick={() => setMenuOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "13px 20px", color: "#c8a12a", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
                    <User size={16} /> {authUser.name}
                  </Link>
                </li>
                <li style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <Link href="/account?tab=orders" onClick={() => setMenuOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "13px 20px", color: "#555", textDecoration: "none", fontSize: "14px" }}>
                    <Package size={16} /> سفارش‌های من
                  </Link>
                </li>
              </>
            ) : (
              <li style={{ borderBottom: "1px solid #f5f5f5", backgroundColor: "#fdf8ee" }}>
                <Link href="/login" onClick={() => setMenuOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "13px 20px", color: "#c8a12a", textDecoration: "none", fontSize: "14px", fontWeight: "700" }}>
                  <LogIn size={16} /> ورود / ثبت‌نام
                </Link>
              </li>
            )}
            {/* Cart */}
            <li style={{ borderBottom: "1px solid #f5f5f5" }}>
              <Link href="/cart" onClick={() => setMenuOpen(false)}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "13px 20px", color: "#333", textDecoration: "none", fontSize: "14px" }}>
                <ShoppingCart size={16} /> سبد خرید {count > 0 && <span style={{ backgroundColor: "#c8a12a", color: "#fff", borderRadius: "10px", padding: "1px 7px", fontSize: "11px", fontWeight: "700" }}>{count}</span>}
              </Link>
            </li>
            {/* Category links */}
            {catLinks.map((link, i) => (
              <li key={i} style={{ borderBottom: "1px solid #f5f5f5" }}>
                <Link href={link.href} onClick={() => setMenuOpen(false)}
                  style={{ display: "block", padding: "12px 20px", color: active(link.href) && link.href !== "/products" ? "#c8a12a" : "#333", textDecoration: "none", fontSize: "13px", fontWeight: active(link.href) && link.href !== "/products" ? "700" : "400" }}>
                  {link.label}
                </Link>
              </li>
            ))}
            {authUser && (
              <li>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "13px 20px", color: "#dc2626", background: "none", border: "none", fontSize: "14px", cursor: "pointer", fontFamily: "inherit", width: "100%", textAlign: "right" }}>
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

        /* ── DESKTOP: normal 3-col layout ── */
        .nav-left-group  { display: flex; }
        .nav-gold-pill   { display: flex; }
        .nav-right-group { display: flex; }
        .hamburger       { display: none !important; }

        @media(max-width:900px) {
          /* Hide cat nav row */
          .cat-nav-row { display: none !important; }

          /* Hide desktop-only elements */
          .nav-social    { display: none !important; }
          .nav-phone     { display: none !important; }
          .nav-user-full { display: none !important; }
          .nav-gold-pill { display: none !important; }

          /* Show hamburger */
          .hamburger { display: flex !important; }

          /* Mobile nav row: logo right, icons left */
          .nav-left-group {
            gap: 10px !important;
          }
          .nav-right-group {
            flex: 1 !important;
          }
        }
      `}</style>
    </header>
  );
}
