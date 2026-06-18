"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingCart, ChevronLeft, MapPin, FileText, CheckCircle } from "lucide-react";
import PageLayout from "../components/PageLayout";
import { useCart } from "../components/CartContext";

interface UserProfile {
  name: string;
  address: string | null;
}

export default function CartPage() {
  const { items, count, total, remove, update, clear } = useCart();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"cart" | "checkout">("cart");

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setUser(d.data);
          if (d.data.address) setAddress(d.data.address);
        }
      })
      .catch(() => {});
  }, []);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!user) { router.push("/login?redirect=/cart"); return; }
    if (!address.trim()) { setError("آدرس تحویل الزامی است"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
          address: address.trim(),
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "خطا در ثبت سفارش"); return; }
      setOrderSuccess(data.data.id);
      clear();
    } catch {
      setError("خطای شبکه. دوباره تلاش کنید");
    } finally {
      setSubmitting(false);
    }
  }

  // Order success screen
  if (orderSuccess) {
    return (
      <PageLayout>
        <div style={{ maxWidth: 560, margin: "80px auto", padding: "0 16px", textAlign: "center" }}>
          <div style={{ width: 72, height: 72, backgroundColor: "rgba(16,185,129,0.15)", border: "2px solid #10b981", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <CheckCircle size={36} color="#10b981" />
          </div>
          <h1 style={{ color: "var(--theme-text)", fontSize: 24, fontWeight: 800, marginBottom: 12 }}>سفارش ثبت شد!</h1>
          <p style={{ color: "var(--theme-text-muted)", fontSize: 14, marginBottom: 8 }}>شماره سفارش شما:</p>
          <div style={{ backgroundColor: "var(--theme-card)", border: "1px solid var(--theme-border)", borderRadius: 8, padding: "10px 20px", display: "inline-block", marginBottom: 24 }}>
            <span style={{ color: "var(--theme-accent)", fontFamily: "monospace", fontSize: 14, letterSpacing: 1 }}>{orderSuccess}</span>
          </div>
          <p style={{ color: "var(--theme-text-muted)", fontSize: 13, marginBottom: 32, lineHeight: 1.8 }}>
            سفارش شما با موفقیت ثبت شد و در حال پردازش است.<br />
            می‌توانید وضعیت سفارش را در حساب کاربری خود پیگیری کنید.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/account" style={{ backgroundColor: "var(--theme-accent)", color: "#000", textDecoration: "none", borderRadius: 8, padding: "11px 24px", fontWeight: 700, fontSize: 14 }}>
              مشاهده سفارش‌ها
            </Link>
            <Link href="/products" style={{ backgroundColor: "transparent", color: "var(--theme-text-muted)", textDecoration: "none", borderRadius: 8, padding: "11px 24px", fontWeight: 600, fontSize: 14, border: "1px solid var(--theme-border)" }}>
              ادامه خرید
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <ShoppingCart size={22} color="var(--theme-accent)" />
          <h1 style={{ color: "var(--theme-text)", fontSize: 22, fontWeight: 800 }}>سبد خرید</h1>
          {count > 0 && (
            <span style={{ backgroundColor: "color-mix(in srgb, var(--theme-accent) 15%, transparent)", color: "var(--theme-accent)", border: "1px solid color-mix(in srgb, var(--theme-accent) 30%, transparent)", borderRadius: 20, padding: "2px 10px", fontSize: 13, fontWeight: 700 }}>
              {count} کالا
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <ShoppingCart size={56} color="var(--theme-border)" style={{ margin: "0 auto 16px" }} />
            <p style={{ color: "var(--theme-text-muted)", fontSize: 16, marginBottom: 20 }}>سبد خرید شما خالی است</p>
            <Link href="/products" style={{ backgroundColor: "var(--theme-accent)", color: "#000", textDecoration: "none", borderRadius: 8, padding: "12px 28px", fontWeight: 700, fontSize: 14 }}>
              مشاهده محصولات
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }} className="cart-grid">

            {/* Items list */}
            <div>
              {step === "cart" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {items.map(item => (
                    <div key={item.productId} style={{ backgroundColor: "var(--theme-card)", border: "1px solid var(--theme-border)", borderRadius: 12, padding: 16, display: "flex", gap: 16, alignItems: "center" }}>
                      {/* Image */}
                      <div style={{ width: 80, height: 80, borderRadius: 8, overflow: "hidden", flexShrink: 0, border: "1px solid var(--theme-border)" }}>
                        <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ color: "var(--theme-text)", fontSize: 14, fontWeight: 600, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</h3>
                        <p style={{ color: "var(--theme-text-muted)", fontSize: 12, marginBottom: 8 }}>{item.karat} عیار · {item.weight} گرم</p>
                        <p style={{ color: "var(--theme-accent)", fontSize: 14, fontWeight: 700 }}>
                          {(item.price * item.quantity).toLocaleString("fa-IR")}
                          <span style={{ color: "var(--theme-text-muted)", fontWeight: 400, fontSize: 12, marginRight: 4 }}>تومان</span>
                        </p>
                      </div>
                      {/* Quantity */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <button onClick={() => update(item.productId, item.quantity - 1)}
                          style={{ width: 28, height: 28, backgroundColor: "var(--theme-surface)", border: "1px solid var(--theme-border)", borderRadius: 6, color: "var(--theme-text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Minus size={12} />
                        </button>
                        <span style={{ color: "var(--theme-text)", fontSize: 14, fontWeight: 700, minWidth: 20, textAlign: "center" }}>{item.quantity}</span>
                        <button onClick={() => update(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          style={{ width: 28, height: 28, backgroundColor: item.quantity >= item.stock ? "var(--theme-card)" : "var(--theme-surface)", border: "1px solid var(--theme-border)", borderRadius: 6, color: item.quantity >= item.stock ? "var(--theme-text-muted)" : "var(--theme-text-muted)", cursor: item.quantity >= item.stock ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Plus size={12} />
                        </button>
                        <button onClick={() => remove(item.productId)}
                          style={{ width: 28, height: 28, backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 4 }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {step === "checkout" && (
                <form onSubmit={handleCheckout} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ backgroundColor: "var(--theme-card)", border: "1px solid var(--theme-border)", borderRadius: 12, padding: 20 }}>
                    <h3 style={{ color: "var(--theme-text)", fontSize: 15, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <MapPin size={16} color="var(--theme-accent)" /> اطلاعات تحویل
                    </h3>

                    {!user && (
                      <div style={{ backgroundColor: "color-mix(in srgb, var(--theme-accent) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--theme-accent) 20%, transparent)", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
                        <p style={{ color: "var(--theme-accent)", fontSize: 13 }}>
                          برای ثبت سفارش باید{" "}
                          <Link href="/login?redirect=/cart" style={{ color: "var(--theme-accent)", fontWeight: 700 }}>وارد شوید</Link>
                          {" "}یا{" "}
                          <Link href="/login?tab=register&redirect=/cart" style={{ color: "var(--theme-accent)", fontWeight: 700 }}>ثبت‌نام کنید</Link>
                        </p>
                      </div>
                    )}

                    {user && (
                      <p style={{ color: "var(--theme-text-muted)", fontSize: 13, marginBottom: 14 }}>
                        خوش آمدید، <span style={{ color: "var(--theme-text)", fontWeight: 600 }}>{user.name}</span>
                      </p>
                    )}

                    <div style={{ marginBottom: 14 }}>
                      <label style={{ color: "var(--theme-text-muted)", fontSize: 12, display: "block", marginBottom: 6 }}>آدرس کامل تحویل *</label>
                      <textarea
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="استان، شهر، خیابان، پلاک، واحد..."
                        rows={3}
                        required
                        style={{ width: "100%", backgroundColor: "var(--theme-surface)", border: "1px solid var(--theme-border)", borderRadius: 8, padding: "10px 12px", color: "var(--theme-text)", fontSize: 13, outline: "none", fontFamily: "inherit", resize: "vertical", lineHeight: 1.6 }}
                        onFocus={e => (e.target.style.borderColor = "var(--theme-accent)")}
                        onBlur={e => (e.target.style.borderColor = "var(--theme-border)")}
                      />
                    </div>

                    <div>
                      <label style={{ color: "var(--theme-text-muted)", fontSize: 12, display: "block", marginBottom: 6 }}>
                        <FileText size={12} style={{ display: "inline", marginLeft: 4 }} />
                        یادداشت سفارش (اختیاری)
                      </label>
                      <textarea
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        placeholder="توضیحات اضافی برای سفارش..."
                        rows={2}
                        style={{ width: "100%", backgroundColor: "var(--theme-surface)", border: "1px solid var(--theme-border)", borderRadius: 8, padding: "10px 12px", color: "var(--theme-text)", fontSize: 13, outline: "none", fontFamily: "inherit", resize: "vertical" }}
                        onFocus={e => (e.target.style.borderColor = "var(--theme-accent)")}
                        onBlur={e => (e.target.style.borderColor = "var(--theme-border)")}
                      />
                    </div>
                  </div>

                  {/* Order summary in checkout step */}
                  <div style={{ backgroundColor: "var(--theme-card)", border: "1px solid var(--theme-border)", borderRadius: 12, padding: 16 }}>
                    <h4 style={{ color: "var(--theme-text-muted)", fontSize: 12, marginBottom: 10 }}>خلاصه سفارش</h4>
                    {items.map(item => (
                      <div key={item.productId} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--theme-border)", fontSize: 13 }}>
                        <span style={{ color: "var(--theme-text-muted)" }}>{item.name} × {item.quantity}</span>
                        <span style={{ color: "var(--theme-accent)" }}>{(item.price * item.quantity).toLocaleString("fa-IR")}</span>
                      </div>
                    ))}
                  </div>

                  {error && (
                    <div style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13 }}>
                      {error}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 10 }}>
                    <button type="button" onClick={() => { setStep("cart"); setError(""); }}
                      style={{ flex: 1, backgroundColor: "transparent", color: "var(--theme-text-muted)", border: "1px solid var(--theme-border)", borderRadius: 8, padding: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>
                      ← ویرایش سبد
                    </button>
                    <button type="submit" disabled={submitting || !user}
                      style={{ flex: 2, backgroundColor: submitting || !user ? "var(--theme-accent)" : "var(--theme-accent)", color: "#000", border: "none", borderRadius: 8, padding: "12px", fontWeight: 800, fontSize: 15, cursor: submitting || !user ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                      {submitting ? "در حال ثبت..." : "ثبت سفارش نهایی"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Summary sidebar */}
            {step === "cart" && (
              <div style={{ backgroundColor: "var(--theme-card)", border: "1px solid var(--theme-border)", borderRadius: 12, padding: 20, position: "sticky", top: 80 }}>
                <h3 style={{ color: "var(--theme-text)", fontSize: 15, fontWeight: 700, marginBottom: 16 }}>خلاصه سفارش</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                  {items.map(item => (
                    <div key={item.productId} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "var(--theme-text-muted)" }}>{item.name} × {item.quantity}</span>
                      <span style={{ color: "var(--theme-text-muted)" }}>{(item.price * item.quantity).toLocaleString("fa-IR")}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid var(--theme-border)", paddingTop: 14, marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--theme-text-muted)", fontSize: 13 }}>جمع کل</span>
                    <div style={{ textAlign: "left" }}>
                      <p style={{ color: "var(--theme-accent)", fontSize: 20, fontWeight: 800 }}>{total.toLocaleString("fa-IR")}</p>
                      <p style={{ color: "var(--theme-text-muted)", fontSize: 11 }}>تومان</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!user) { router.push("/login?redirect=/cart"); return; }
                    setStep("checkout");
                    setError("");
                  }}
                  style={{ width: "100%", backgroundColor: "var(--theme-accent)", color: "#000", border: "none", borderRadius: 8, padding: "13px", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
                  ادامه خرید
                </button>

                {!user && (
                  <p style={{ color: "var(--theme-text-muted)", fontSize: 12, textAlign: "center", marginTop: 10 }}>
                    برای ادامه باید <Link href="/login?redirect=/cart" style={{ color: "var(--theme-accent)" }}>وارد شوید</Link>
                  </p>
                )}

                <Link href="/products" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, color: "var(--theme-text-muted)", textDecoration: "none", fontSize: 12, marginTop: 12 }}>
                  <ChevronLeft size={12} /> ادامه خرید
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cart-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PageLayout>
  );
}
