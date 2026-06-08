"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag,
  LogOut, Menu, X, ChevronLeft,
} from "lucide-react";

const navItems = [
  { label: "داشبورد", href: "/admin", icon: LayoutDashboard },
  { label: "محصولات", href: "/admin/products", icon: Package },
  { label: "سفارش‌ها", href: "/admin/orders", icon: ShoppingBag },
  { label: "کاربران", href: "/admin/users", icon: Users },
  { label: "دسته‌بندی‌ها", href: "/admin/categories", icon: Tag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Don't render sidebar on login page
  if (pathname === "/admin/login") return <>{children}</>;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#0e0e0e", direction: "rtl" }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? "240px" : "64px",
        backgroundColor: "#111",
        borderLeft: "1px solid #2a2a2a",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
        overflow: "hidden",
      }}>
        {/* Sidebar header */}
        <div style={{ padding: "16px", borderBottom: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: "64px" }}>
          {sidebarOpen && (
            <div>
              <div style={{ color: "#d4af37", fontSize: "18px", fontWeight: "900", letterSpacing: "-1px" }}>DG</div>
              <div style={{ color: "#d4af37", fontSize: "9px", letterSpacing: "2px" }}>ADMIN</div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(o => !o)} style={{ color: "#888", background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 16px",
                  color: active ? "#d4af37" : "#888",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: active ? "600" : "400",
                  backgroundColor: active ? "rgba(212,175,55,0.1)" : "transparent",
                  borderRight: active ? "3px solid #d4af37" : "3px solid transparent",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {sidebarOpen && item.label}
              </a>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: "16px", borderTop: "1px solid #2a2a2a" }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#888",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              padding: "8px",
              width: "100%",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            <LogOut size={18} />
            {sidebarOpen && "خروج"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
        {/* Top bar */}
        <header style={{ backgroundColor: "#111", borderBottom: "1px solid #2a2a2a", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ color: "#888", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
            <a href="/" target="_blank" style={{ color: "#d4af37", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}>
              <ChevronLeft size={12} />
              مشاهده سایت
            </a>
          </div>
          <h1 style={{ color: "#fff", fontSize: "16px", fontWeight: "600" }}>
            {navItems.find(n => pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href)))?.label || "پنل مدیریت"}
          </h1>
        </header>

        <div style={{ flex: 1, padding: "24px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
