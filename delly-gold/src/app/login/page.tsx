"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, UserPlus, ChevronLeft } from "lucide-react";

type Tab = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>((searchParams.get("tab") as Tab) || "login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Register form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");

  const redirect = searchParams.get("redirect") || "/";

  // Check if already logged in
  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.success) router.replace(redirect);
    }).catch(() => {});
  }, [redirect, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "خطا در ورود"); return; }
      router.push(redirect);
      router.refresh();
    } catch {
      setError("خطای شبکه. دوباره تلاش کنید");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPass }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "خطا در ثبت‌نام"); return; }
      router.push(redirect);
      router.refresh();
    } catch {
      setError("خطای شبکه. دوباره تلاش کنید");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: "#121212",
    border: "1px solid #333",
    borderRadius: "8px",
    padding: "11px 14px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0e0e0e",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: "none", marginBottom: "32px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
          <div style={{ width: "32px", height: "32px", border: "2px solid #d4af37", transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "11px", height: "11px", backgroundColor: "#d4af37" }} />
          </div>
          <div>
            <div style={{ color: "#d4af37", fontSize: "22px", fontWeight: "900", letterSpacing: "-1px", lineHeight: 1 }}>DELLY GOLD</div>
            <div style={{ color: "#888", fontSize: "11px", letterSpacing: "1px" }}>فروشگاه طلا و جواهر</div>
          </div>
        </div>
      </Link>

      <div style={{
        width: "100%",
        maxWidth: "420px",
        backgroundColor: "#1a1a1a",
        border: "1px solid #2a2a2a",
        borderRadius: "16px",
        overflow: "hidden",
      }}>
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #2a2a2a" }}>
          {(["login", "register"] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); }}
              style={{
                flex: 1,
                padding: "16px",
                backgroundColor: tab === t ? "rgba(212,175,55,0.08)" : "transparent",
                color: tab === t ? "#d4af37" : "#666",
                border: "none",
                borderBottom: tab === t ? "2px solid #d4af37" : "2px solid transparent",
                fontSize: "14px",
                fontWeight: tab === t ? "700" : "400",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}>
              {t === "login" ? <><LogIn size={15} /> ورود</> : <><UserPlus size={15} /> ثبت‌نام</>}
            </button>
          ))}
        </div>

        <div style={{ padding: "28px" }}>
          {error && (
            <div style={{
              backgroundColor: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "8px",
              padding: "10px 14px",
              color: "#f87171",
              fontSize: "13px",
              marginBottom: "16px",
            }}>
              {error}
            </div>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "6px" }}>ایمیل</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  autoFocus
                  style={{ ...inputStyle, direction: "ltr" }}
                  onFocus={e => (e.target.style.borderColor = "#d4af37")}
                  onBlur={e => (e.target.style.borderColor = "#333")}
                />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "6px" }}>رمز عبور</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    value={loginPass}
                    onChange={e => setLoginPass(e.target.value)}
                    placeholder="رمز عبور خود را وارد کنید"
                    required
                    style={{ ...inputStyle, direction: "ltr", paddingLeft: "42px" }}
                    onFocus={e => (e.target.style.borderColor = "#d4af37")}
                    onBlur={e => (e.target.style.borderColor = "#333")}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#666", cursor: "pointer" }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                style={{
                  width: "100%",
                  backgroundColor: loading ? "#a08020" : "#d4af37",
                  color: "#000",
                  border: "none",
                  borderRadius: "8px",
                  padding: "13px",
                  fontWeight: "800",
                  fontSize: "15px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "background-color 0.2s",
                }}>
                {loading ? "در حال ورود..." : <><LogIn size={16} /> ورود به حساب</>}
              </button>
              <p style={{ textAlign: "center", marginTop: "16px", color: "#666", fontSize: "13px" }}>
                حساب ندارید؟{" "}
                <button type="button" onClick={() => { setTab("register"); setError(""); }}
                  style={{ background: "none", border: "none", color: "#d4af37", cursor: "pointer", fontFamily: "inherit", fontSize: "13px", fontWeight: "600" }}>
                  ثبت‌نام کنید
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "6px" }}>نام کامل</label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="نام و نام خانوادگی"
                  required
                  autoFocus
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#d4af37")}
                  onBlur={e => (e.target.style.borderColor = "#333")}
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "6px" }}>ایمیل</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  style={{ ...inputStyle, direction: "ltr" }}
                  onFocus={e => (e.target.style.borderColor = "#d4af37")}
                  onBlur={e => (e.target.style.borderColor = "#333")}
                />
              </div>
              <div style={{ marginBottom: "8px" }}>
                <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "6px" }}>رمز عبور</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    value={regPass}
                    onChange={e => setRegPass(e.target.value)}
                    placeholder="حداقل ۸ کاراکتر"
                    required
                    style={{ ...inputStyle, direction: "ltr", paddingLeft: "42px" }}
                    onFocus={e => (e.target.style.borderColor = "#d4af37")}
                    onBlur={e => (e.target.style.borderColor = "#333")}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#666", cursor: "pointer" }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p style={{ color: "#555", fontSize: "11px", marginTop: "5px" }}>حداقل ۸ کاراکتر شامل حرف</p>
              </div>
              <div style={{ marginBottom: "24px" }} />
              <button type="submit" disabled={loading}
                style={{
                  width: "100%",
                  backgroundColor: loading ? "#a08020" : "#d4af37",
                  color: "#000",
                  border: "none",
                  borderRadius: "8px",
                  padding: "13px",
                  fontWeight: "800",
                  fontSize: "15px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}>
                {loading ? "در حال ثبت‌نام..." : <><UserPlus size={16} /> ایجاد حساب</>}
              </button>
              <p style={{ textAlign: "center", marginTop: "16px", color: "#666", fontSize: "13px" }}>
                حساب دارید؟{" "}
                <button type="button" onClick={() => { setTab("login"); setError(""); }}
                  style={{ background: "none", border: "none", color: "#d4af37", cursor: "pointer", fontFamily: "inherit", fontSize: "13px", fontWeight: "600" }}>
                  وارد شوید
                </button>
              </p>
            </form>
          )}
        </div>
      </div>

      <Link href="/" style={{ color: "#555", textDecoration: "none", marginTop: "20px", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}>
        <ChevronLeft size={13} /> بازگشت به صفحه اصلی
      </Link>
    </div>
  );
}
