"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, Package, LogOut, Save, Phone, MapPin, Mail,
  ChevronLeft, ChevronDown, ChevronUp, Clock, CheckCircle,
  Truck, XCircle, RefreshCw, ShoppingBag,
} from "lucide-react";
import PageLayout from "../components/PageLayout";

interface UserProfile {
  id: string; name: string; email: string;
  phone: string | null; address: string | null; role: string;
}

interface OrderItem {
  id: string; quantity: number; price: number;
  product_name: string; product_images: string;
}

interface Order {
  id: string; status: string; total: number;
  address: string | null; note: string | null;
  created_at: string; items: OrderItem[];
}

const STATUS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:    { label: "در انتظار بررسی", color: "#f59e0b", icon: <Clock size={13} /> },
  CONFIRMED:  { label: "تأیید شده",       color: "#3b82f6", icon: <CheckCircle size={13} /> },
  PROCESSING: { label: "در حال پردازش",   color: "#8b5cf6", icon: <RefreshCw size={13} /> },
  SHIPPED:    { label: "ارسال شده",        color: "#06b6d4", icon: <Truck size={13} /> },
  DELIVERED:  { label: "تحویل داده شده",  color: "#10b981", icon: <CheckCircle size={13} /> },
  CANCELLED:  { label: "لغو شده",         color: "#ef4444", icon: <XCircle size={13} /> },
};

type Tab = "profile" | "orders";

const fallbackImg = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=100&q=60";

function getImg(images: string): string {
  try { const a = JSON.parse(images); return a[0] || fallbackImg; } catch { return fallbackImg; }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" });
}

// ── Invoice Modal ──────────────────────────────────────────────────────────
function InvoiceModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const st = STATUS[order.status] ?? STATUS.PENDING;
  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 16 }}>
      <div style={{ backgroundColor: "var(--theme-surface)", border: "1px solid var(--theme-border)", borderRadius: 14, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--theme-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: "var(--theme-text-muted)", fontSize: 11, marginBottom: 2 }}>فاکتور سفارش</p>
            <p style={{ color: "var(--theme-text)", fontSize: 15, fontWeight: 700, fontFamily: "monospace" }}>#{order.id.slice(0, 12)}</p>
          </div>
          <button onClick={onClose} style={{ color: "var(--theme-text-muted)", background: "none", border: "none", cursor: "pointer", fontSize: 22, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: "20px 22px" }}>
          {/* Status + date */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: `${st.color}18`, border: `1px solid ${st.color}50`, borderRadius: 20, padding: "4px 12px" }}>
              <span style={{ color: st.color }}>{st.icon}</span>
              <span style={{ color: st.color, fontSize: 12, fontWeight: 600 }}>{st.label}</span>
            </div>
            <span style={{ color: "var(--theme-text-muted)", fontSize: 12 }}>{formatDate(order.created_at)}</span>
          </div>

          {/* Items */}
          <div style={{ backgroundColor: "var(--theme-surface)", borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--theme-border)" }}>
              <p style={{ color: "var(--theme-text-muted)", fontSize: 11, fontWeight: 600, letterSpacing: "0.5px" }}>اقلام سفارش</p>
            </div>
            {order.items.map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderBottom: "1px solid var(--theme-card)" }}>
                <img src={getImg(item.product_images)} alt="" style={{ width: 44, height: 44, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "var(--theme-text)", fontSize: 13, fontWeight: 600, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.product_name}</p>
                  <p style={{ color: "var(--theme-text-muted)", fontSize: 11 }}>{item.quantity} عدد × {item.price.toLocaleString("fa-IR")} تومان</p>
                </div>
                <p style={{ color: "var(--theme-accent)", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                  {(item.price * item.quantity).toLocaleString("fa-IR")}
                </p>
              </div>
            ))}
          </div>

          {/* Address */}
          {order.address && (
            <div style={{ backgroundColor: "var(--theme-surface)", borderRadius: 10, padding: "12px 14px", marginBottom: 16, display: "flex", gap: 8 }}>
              <MapPin size={14} color="var(--theme-accent)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ color: "var(--theme-text-muted)", fontSize: 11, marginBottom: 3 }}>آدرس تحویل</p>
                <p style={{ color: "var(--theme-text-muted)", fontSize: 13, lineHeight: 1.6 }}>{order.address}</p>
              </div>
            </div>
          )}

          {/* Note */}
          {order.note && (
            <div style={{ backgroundColor: "var(--theme-surface)", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
              <p style={{ color: "var(--theme-text-muted)", fontSize: 11, marginBottom: 3 }}>یادداشت</p>
              <p style={{ color: "var(--theme-text-muted)", fontSize: 13 }}>{order.note}</p>
            </div>
          )}

          {/* Total */}
          <div style={{ backgroundColor: "color-mix(in srgb, var(--theme-accent) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--theme-accent) 20%, transparent)", borderRadius: 10, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "var(--theme-text-muted)", fontSize: 14 }}>جمع کل</span>
            <div style={{ textAlign: "left" }}>
              <span style={{ color: "var(--theme-accent)", fontSize: 22, fontWeight: 900 }}>{order.total.toLocaleString("fa-IR")}</span>
              <span style={{ color: "var(--theme-text-muted)", fontSize: 12, marginRight: 6 }}>تومان</span>
            </div>
          </div>

          {/* Payment notice */}
          {(order.status === "PENDING" || order.status === "CONFIRMED") && (
            <div style={{ marginTop: 14, backgroundColor: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 8, padding: "10px 14px" }}>
              <p style={{ color: "#f59e0b", fontSize: 12 }}>
                💳 پرداخت این سفارش پس از تأیید توسط فروشگاه انجام می‌شود. منتظر تماس ما باشید.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AccountPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Profile form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveErr, setSaveErr] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => {
        if (!d.success) { router.push("/login?redirect=/account"); return; }
        setProfile(d.data);
        setName(d.data.name || "");
        setPhone(d.data.phone || "");
        setAddress(d.data.address || "");
      })
      .catch(() => router.push("/login?redirect=/account"))
      .finally(() => setLoading(false));
  }, [router]);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/orders?limit=50");
      const data = await res.json();
      if (data.success) setOrders(data.data.orders);
    } catch {}
    finally { setOrdersLoading(false); }
  }, []);

  useEffect(() => {
    if (tab === "orders") fetchOrders();
  }, [tab, fetchOrders]);

  async function fetchOrderDetail(orderId: string) {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.success) setSelectedOrder(data.data);
    } catch {}
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaveMsg(""); setSaveErr("");
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address }),
      });
      const data = await res.json();
      if (!res.ok) { setSaveErr(data.error || "خطا"); return; }
      setProfile(data.data);
      setSaveMsg("اطلاعات با موفقیت ذخیره شد");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch { setSaveErr("خطای شبکه"); }
    finally { setSaving(false); }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (loading) return (
    <PageLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <div style={{ color: "var(--theme-accent)", fontSize: 15 }}>در حال بارگذاری...</div>
      </div>
    </PageLayout>
  );

  if (!profile) return null;

  const inputStyle: React.CSSProperties = {
    width: "100%", backgroundColor: "var(--theme-surface)", border: "1px solid var(--theme-border)",
    borderRadius: 8, padding: "10px 14px", color: "var(--theme-text)", fontSize: 14,
    outline: "none", fontFamily: "inherit",
  };

  return (
    <PageLayout>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>

        {/* Profile header */}
        <div style={{ backgroundColor: "var(--theme-card)", border: "1px solid var(--theme-border)", borderRadius: 14, padding: "22px 24px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, backgroundColor: "color-mix(in srgb, var(--theme-accent) 15%, transparent)", border: "2px solid color-mix(in srgb, var(--theme-accent) 30%, transparent)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={24} color="var(--theme-accent)" />
            </div>
            <div>
              <h1 style={{ color: "var(--theme-text)", fontSize: 18, fontWeight: 800, marginBottom: 2 }}>{profile.name}</h1>
              <p style={{ color: "var(--theme-text-muted)", fontSize: 13 }}>{profile.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "8px 14px", color: "#ef4444", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
            <LogOut size={14} /> خروج از حساب
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, backgroundColor: "var(--theme-surface)", border: "1px solid var(--theme-border)", borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {([
            { key: "profile", label: "اطلاعات حساب", icon: <User size={15} /> },
            { key: "orders",  label: "سفارش‌های من",  icon: <Package size={15} /> },
          ] as { key: Tab; label: string; icon: React.ReactNode }[]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: tab === t.key ? "var(--theme-card)" : "transparent", color: tab === t.key ? "var(--theme-accent)" : "var(--theme-text-muted)", border: tab === t.key ? "1px solid var(--theme-border)" : "1px solid transparent", borderRadius: 7, padding: "10px", fontWeight: tab === t.key ? 700 : 400, fontSize: 14, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── Profile Tab ── */}
        {tab === "profile" && (
          <form onSubmit={handleSaveProfile}>
            <div style={{ backgroundColor: "var(--theme-card)", border: "1px solid var(--theme-border)", borderRadius: 14, padding: 24 }}>
              <h2 style={{ color: "var(--theme-text)", fontSize: 16, fontWeight: 700, marginBottom: 22 }}>ویرایش اطلاعات شخصی</h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }} className="profile-grid">
                <div>
                  <label style={{ color: "var(--theme-text-muted)", fontSize: 12, display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                    <User size={12} color="var(--theme-accent)" /> نام کامل
                  </label>
                  <input value={name} onChange={e => setName(e.target.value)} required style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "var(--theme-accent)")}
                    onBlur={e => (e.target.style.borderColor = "var(--theme-border)")} />
                </div>
                <div>
                  <label style={{ color: "var(--theme-text-muted)", fontSize: 12, display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                    <Mail size={12} color="var(--theme-accent)" /> ایمیل
                  </label>
                  <input value={profile.email} readOnly style={{ ...inputStyle, color: "var(--theme-text-muted)", cursor: "not-allowed" }} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ color: "var(--theme-text-muted)", fontSize: 12, display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                  <Phone size={12} color="var(--theme-accent)" /> شماره تماس
                </label>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="09xxxxxxxxx"
                  style={{ ...inputStyle, direction: "ltr", maxWidth: 240 }}
                  onFocus={e => (e.target.style.borderColor = "var(--theme-accent)")}
                  onBlur={e => (e.target.style.borderColor = "var(--theme-border)")} />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ color: "var(--theme-text-muted)", fontSize: 12, display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                  <MapPin size={12} color="var(--theme-accent)" /> آدرس پیش‌فرض
                </label>
                <textarea value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="آدرس پیش‌فرض برای سفارش‌ها..."
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                  onFocus={e => (e.target.style.borderColor = "var(--theme-accent)")}
                  onBlur={e => (e.target.style.borderColor = "var(--theme-border)")} />
              </div>

              {saveMsg && (
                <div style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, padding: "10px 14px", color: "#10b981", fontSize: 13, marginBottom: 14 }}>
                  ✓ {saveMsg}
                </div>
              )}
              {saveErr && (
                <div style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13, marginBottom: 14 }}>
                  {saveErr}
                </div>
              )}

              <button type="submit" disabled={saving}
                style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: saving ? "var(--theme-accent)" : "var(--theme-accent)", color: "#000", border: "none", borderRadius: 8, padding: "11px 24px", fontWeight: 800, fontSize: 14, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                <Save size={15} /> {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </button>
            </div>
          </form>
        )}

        {/* ── Orders Tab ── */}
        {tab === "orders" && (
          <div>
            {ordersLoading ? (
              <div style={{ textAlign: "center", padding: 60, color: "var(--theme-text-muted)" }}>در حال بارگذاری...</div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <ShoppingBag size={52} color="var(--theme-border)" style={{ margin: "0 auto 16px" }} />
                <p style={{ color: "var(--theme-text-muted)", fontSize: 15, marginBottom: 20 }}>هنوز سفارشی ندارید</p>
                <Link href="/products" style={{ backgroundColor: "var(--theme-accent)", color: "#000", textDecoration: "none", borderRadius: 8, padding: "11px 24px", fontWeight: 700, fontSize: 14 }}>
                  شروع خرید
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {orders.map(order => {
                  const st = STATUS[order.status] ?? STATUS.PENDING;
                  const isExpanded = expandedOrder === order.id;
                  return (
                    <div key={order.id} style={{ backgroundColor: "var(--theme-card)", border: "1px solid var(--theme-border)", borderRadius: 12, overflow: "hidden", transition: "border-color 0.2s" }}>
                      {/* Order row */}
                      <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
                          <Package size={15} color="var(--theme-accent)" style={{ flexShrink: 0 }} />
                          <span style={{ color: "var(--theme-text-muted)", fontSize: 12, fontFamily: "monospace" }}>#{order.id.slice(0, 10)}</span>
                        </div>
                        <span style={{ color: "var(--theme-text-muted)", fontSize: 12 }}>{formatDate(order.created_at)}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, backgroundColor: `${st.color}18`, border: `1px solid ${st.color}40`, borderRadius: 20, padding: "3px 10px" }}>
                          <span style={{ color: st.color }}>{st.icon}</span>
                          <span style={{ color: st.color, fontSize: 11, fontWeight: 600 }}>{st.label}</span>
                        </div>
                        <span style={{ color: "var(--theme-accent)", fontSize: 14, fontWeight: 700 }}>
                          {order.total.toLocaleString("fa-IR")} ت
                        </span>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => fetchOrderDetail(order.id)}
                            style={{ display: "flex", alignItems: "center", gap: 4, backgroundColor: "color-mix(in srgb, var(--theme-accent) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--theme-accent) 25%, transparent)", borderRadius: 6, padding: "5px 10px", color: "var(--theme-accent)", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>
                            فاکتور
                          </button>
                          <button
                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                            style={{ width: 28, height: 28, backgroundColor: "var(--theme-surface)", border: "1px solid var(--theme-border)", borderRadius: 6, color: "var(--theme-text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded items */}
                      {isExpanded && (
                        <div style={{ borderTop: "1px solid var(--theme-border)", padding: "12px 18px", backgroundColor: "var(--theme-surface)" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {(order as Order & { items?: OrderItem[] }).items?.length ? (
                              (order as Order & { items: OrderItem[] }).items.map(item => (
                                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <img src={getImg(item.product_images)} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
                                  <span style={{ color: "var(--theme-text-muted)", fontSize: 13, flex: 1 }}>{item.product_name}</span>
                                  <span style={{ color: "var(--theme-text-muted)", fontSize: 12 }}>× {item.quantity}</span>
                                  <span style={{ color: "var(--theme-accent)", fontSize: 12, fontWeight: 700 }}>{(item.price * item.quantity).toLocaleString("fa-IR")}</span>
                                </div>
                              ))
                            ) : (
                              <button onClick={() => fetchOrderDetail(order.id)}
                                style={{ background: "none", border: "none", color: "var(--theme-accent)", cursor: "pointer", fontSize: 12, textAlign: "right", fontFamily: "inherit" }}>
                                بارگذاری جزئیات...
                              </button>
                            )}
                          </div>
                          {order.address && (
                            <div style={{ marginTop: 10, display: "flex", gap: 6, color: "var(--theme-text-muted)", fontSize: 12 }}>
                              <MapPin size={12} color="var(--theme-accent)" style={{ flexShrink: 0, marginTop: 1 }} />
                              <span>{order.address}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invoice modal */}
      {selectedOrder && (
        <InvoiceModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}

      <style>{`
        @media (max-width: 600px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PageLayout>
  );
}
