"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search, User, ShoppingCart, Menu, X, ChevronDown,
  LogOut, Package, LogIn,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "./CartContext";

interface AuthUser {
  id: string; name: string; email: string; role: string;
}

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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();

  const checkAuth = useCallback(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        setAuthUser(d.success ? d.data : null);
        setAuthChecked(true);
      })
      .catch(() => { setAuthUser(null); setAuthChecked(true); });
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  // Re-check auth whenever pathname changes (handles login/logout redirects)
  useEffect(() => { checkAuth(); }, [pathname, checkAuth]);

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
  function openUserMenu() {
    if (userMenuTimer.current) clearTimeout(userMenuTimer.current);
    setUserMenuOpen(true);
  }
  function scheduleCloseUser() {
    userMenuTimer.current = setTimeout(() => setUserMenuOpen(false), 180);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthUser(null);
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav style={{ backgroundColor: "var(--theme-bg)", borderBottom: "1px solid var(--theme-border)", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>

        {/* ── Left: icons ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

          {/* Search */}
          <button
            aria-label="جستجو"
            onClick={() => { setSearchOpen(o => !o); setSearchVal(""); }}
            style={{ color: searchOpen ? "#d4af37" : "#ccc", background: "none", border: "none", cursor: "pointer", padding: "4px", transition: "color 0.2s", display: "flex" }}>
            {searchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          {/* Cart */}
          <Link href="/cart" aria-label="سبد خرید"
            style={{ position: "relative", color: "#ccc", display: "flex", lineHeight: 0, transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#d4af37"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#ccc"}>
            <ShoppingCart size={20} />
            {count > 0 && (
              <span style={{ position: "absolute", top: "-7px", left: "-7px", backgroundColor: "#d4af37", color: "#000", fontSize: "10px", fontWeight: "800", borderRadius: "50%", width: "17px", height: "17px", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>

          {/* User menu / Login */}
          {authChecked && (
            authUser ? (
              <div style={{ position: "relative" }}
                onMouseEnter={openUserMenu}
                onMouseLeave={scheduleCloseUser}>
                <button
                  aria-label="حساب کاربری"
                  style={{ display: "flex", alignItems: "center", gap: "5px", backgroundColor: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "20px", padding: "5px 10px 5px 6px", color: "#d4af37", cursor: "pointer", fontSize: "12px", fontFamily: "inherit" }}>
                  <User size={15} />
                  <span style={{ maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {authUser.name.split(" ")[0]}
                  </span>
                  <ChevronDown size={11} style={{ transition: "transform 0.2s", transform: userMenuOpen ? "rotate(180deg)" : "rotate(0)" }} />
                </button>

                {userMenuOpen && (
                  <div
                    onMouseEnter={openUserMenu}
                    onMouseLeave={scheduleCloseUser}
                    style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, minWidth: 180, backgroundColor: "#161616", border: "1px solid #2a2a2a", borderRadius: 10, padding: 6, boxShadow: "0 8px 32px rgba(0,0,0,0.6)", zIndex: 200, animation: "fadeIn 0.15s ease" }}>
                    {/* User info */}
                    <div style={{ padding: "8px 10px 10px", borderBottom: "1px solid #222", marginBottom: 4 }}>
                      <p style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{authUser.name}</p>
                      <p style={{ color: "#555", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis" }}>{authUser.email}</p>
                    </div>
                    <Link href="/account"
                      onClick={() => setUserMenuOpen(false)}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", color: "#ccc", textDecoration: "none", fontSize: 13, borderRadius: 6, transition: "background-color 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(212,175,55,0.1)"; (e.currentTarget as HTMLElement).style.color = "#d4af37"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "#ccc"; }}>
                      <User size={14} /> حساب کاربری
                    </Link>
                    <Link href="/account?tab=orders"
                      onClick={() => setUserMenuOpen(false)}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", color: "#ccc", textDecoration: "none", fontSize: 13, borderRadius: 6, transition: "background-color 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(212,175,55,0.1)"; (e.currentTarget as HTMLElement).style.color = "#d4af37"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "#ccc"; }}>
                      <Package size={14} /> سفارش‌های من
                    </Link>
                    {authUser.role === "ADMIN" && (
                      <Link href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", color: "#d4af37", textDecoration: "none", fontSize: 13, borderRadius: 6, borderTop: "1px solid #222", marginTop: 4, transition: "background-color 0.15s" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(212,175,55,0.1)"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}>
                        پنل مدیریت ←
                      </Link>
                    )}
                    <button onClick={handleLogout}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", color: "#ef4444", background: "none", border: "none", fontSize: 13, borderRadius: 6, cursor: "pointer", fontFamily: "inherit", width: "100%", textAlign: "right", borderTop: "1px solid #222", marginTop: 4, transition: "background-color 0.15s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(239,68,68,0.1)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}>
                      <LogOut size={14} /> خروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login"
                style={{ display: "flex", alignItems: "center", gap: 5, backgroundColor: "#d4af37", color: "#000", textDecoration: "none", borderRadius: "20px", padding: "5px 12px", fontSize: "12px", fontWeight: "700" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "#f0d060"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "#d4af37"}>
                <LogIn size={14} /> ورود
              </Link>
            )
          )}
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

              {link.dropdown && openDropdown === link.label && (
                <div
                  onMouseEnter={() => openMenu(link.label)}
                  onMouseLeave={scheduleClose}
                  style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, minWidth: "180px", backgroundColor: "#161616", border: "1px solid #2a2a2a", borderRadius: "10px", padding: "6px", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", zIndex: 200, animation: "fadeIn 0.15s ease" }}>
                  {link.dropdown.map((item, i) => (
                    <Link key={i} href={item.href}
                      onClick={() => setOpenDropdown(null)}
                      style={{ display: "block", padding: "9px 14px", color: i === 0 ? "#d4af37" : "#ccc", textDecoration: "none", fontSize: "13px", borderRadius: "6px", transition: "background-color 0.15s, color 0.15s", borderBottom: i === 0 ? "1px solid #2a2a2a" : "none", fontWeight: i === 0 ? "600" : "400" }}
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

        {/* ── Right: logo + mobile menu ── */}
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
              </li>
            ))}
            <li style={{ borderBottom: "1px solid #1f1f1f" }}>
              <Link href="/cart" onClick={() => setMenuOpen(false)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "13px 20px", color: "#ccc", textDecoration: "none", fontSize: "14px" }}>
                <ShoppingCart size={16} /> سبد خرید {count > 0 && `(${count})`}
              </Link>
            </li>
            {authUser ? (
              <>
                <li style={{ borderBottom: "1px solid #1f1f1f" }}>
                  <Link href="/account" onClick={() => setMenuOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "13px 20px", color: "#d4af37", textDecoration: "none", fontSize: "14px" }}>
                    <User size={16} /> {authUser.name}
                  </Link>
                </li>
                <li>
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "13px 20px", color: "#ef4444", background: "none", border: "none", fontSize: "14px", cursor: "pointer", fontFamily: "inherit", width: "100%", textAlign: "right" }}>
                    <LogOut size={16} /> خروج
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link href="/login" onClick={() => setMenuOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "13px 20px", color: "#d4af37", textDecoration: "none", fontSize: "14px" }}>
                  <LogIn size={16} /> ورود / ثبت‌نام
                </Link>
              </li>
            )}
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
