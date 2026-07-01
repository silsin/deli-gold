"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, UserPlus, ChevronLeft } from "lucide-react";

type Tab = "login" | "register";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>((searchParams.get("tab") as Tab) || "login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const redirect = searchParams.get("redirect") || "/";

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.success) router.replace(redirect);
    }).catch(() => {});
  }, [redirect, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: loginEmail, password: loginPass }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "خطا در ورود"); return; }
      router.push(redirect); router.refresh();
    } catch { setError("خطای شبکه"); } finally { setLoading(false); }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: regName, email: regEmail, password: regPass }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "خطا در ثبت‌نام"); return; }
      router.push(redirect); router.refresh();
    } catch { setError("خطای شبکه"); } finally { setLoading(false); }
  }

  const inp: React.CSSProperties = { width: "100%", backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "8px", padding: "11px 14px", color: "#222", fontSize: "14px", outline: "none", fontFamily: "inherit" };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f8f8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <Link href="/" style={{ textDecoration: "none", marginBottom: "28px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
          <div style={{ width: "28px", height: "28px", border: "2px solid #c8a12a", transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "9px", height: "9px", backgroundColor: "#c8a12a" }} />
          </div>
          <div>
            <div style={{ color: "#c8a12a", fontSize: "20px", fontWeight: "900", lineHeight: 1 }}>DELLY GOLD</div>
            <div style={{ color: "#bbb", fontSize: "10px", letterSpacing: "1px" }}>فروشگاه طلا و جواهر</div>
          </div>
        </div>
      </Link>

      <div style={{ width: "100%", maxWidth: "420px", backgroundColor: "#fff", border: "1px solid #e8e8e8", borderRadius: "14px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #ebebeb" }}>
          {(["login", "register"] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); }}
              style={{ flex: 1, padding: "15px", backgroundColor: tab === t ? "#fdf8ee" : "#fff", color: tab === t ? "#c8a12a" : "#888", border: "none", borderBottom: tab === t ? "2px solid #c8a12a" : "2px solid transparent", fontSize: "14px", fontWeight: tab === t ? "700" : "400", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              {t === "login" ? <><LogIn size={14} /> ورود</> : <><UserPlus size={14} /> ثبت‌نام</>}
            </button>
          ))}
        </div>

        <div style={{ padding: "26px" }}>
          {error && (
            <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "7px", padding: "10px 14px", color: "#dc2626", fontSize: "13px", marginBottom: "16px" }}>{error}</div>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ color: "#666", fontSize: "12px", display: "block", marginBottom: "6px" }}>ایمیل</label>
                <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="example@email.com" required autoFocus style={{ ...inp, direction: "ltr" }} onFocus={e => (e.target.style.borderColor = "#c8a12a")} onBlur={e => (e.target.style.borderColor = "#ddd")} />
              </div>
              <div style={{ marginBottom: "22px" }}>
                <label style={{ color: "#666", fontSize: "12px", display: "block", marginBottom: "6px" }}>رمز عبور</label>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} value={loginPass} onChange={e => setLoginPass(e.target.value)} required style={{ ...inp, direction: "ltr", paddingLeft: "40px" }} onFocus={e => (e.target.style.borderColor = "#c8a12a")} onBlur={e => (e.target.style.borderColor = "#ddd")} />
                  <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#bbb", cursor: "pointer" }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                style={{ width: "100%", backgroundColor: loading ? "#e8c86a" : "#c8a12a", color: "#fff", border: "none", borderRadius: "8px", padding: "12px", fontWeight: "800", fontSize: "15px", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                {loading ? "در حال ورود..." : <><LogIn size={15} /> ورود به حساب</>}
              </button>
              <p style={{ textAlign: "center", marginTop: "14px", color: "#888", fontSize: "13px" }}>
                حساب ندارید؟{" "}
                <button type="button" onClick={() => { setTab("register"); setError(""); }} style={{ background: "none", border: "none", color: "#c8a12a", cursor: "pointer", fontFamily: "inherit", fontSize: "13px", fontWeight: "700" }}>ثبت‌نام کنید</button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ color: "#666", fontSize: "12px", display: "block", marginBottom: "6px" }}>نام کامل</label>
                <input type="text" value={regName} onChange={e => setRegName(e.target.value)} required autoFocus style={inp} onFocus={e => (e.target.style.borderColor = "#c8a12a")} onBlur={e => (e.target.style.borderColor = "#ddd")} />
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ color: "#666", fontSize: "12px", display: "block", marginBottom: "6px" }}>ایمیل</label>
                <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required style={{ ...inp, direction: "ltr" }} onFocus={e => (e.target.style.borderColor = "#c8a12a")} onBlur={e => (e.target.style.borderColor = "#ddd")} />
              </div>
              <div style={{ marginBottom: "22px" }}>
                <label style={{ color: "#666", fontSize: "12px", display: "block", marginBottom: "6px" }}>رمز عبور</label>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} value={regPass} onChange={e => setRegPass(e.target.value)} required placeholder="حداقل ۸ کاراکتر" style={{ ...inp, direction: "ltr", paddingLeft: "40px" }} onFocus={e => (e.target.style.borderColor = "#c8a12a")} onBlur={e => (e.target.style.borderColor = "#ddd")} />
                  <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#bbb", cursor: "pointer" }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p style={{ color: "#bbb", fontSize: "11px", marginTop: "4px" }}>حداقل ۸ کاراکتر شامل حرف</p>
              </div>
              <button type="submit" disabled={loading}
                style={{ width: "100%", backgroundColor: loading ? "#e8c86a" : "#c8a12a", color: "#fff", border: "none", borderRadius: "8px", padding: "12px", fontWeight: "800", fontSize: "15px", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                {loading ? "در حال ثبت‌نام..." : <><UserPlus size={15} /> ایجاد حساب</>}
              </button>
              <p style={{ textAlign: "center", marginTop: "14px", color: "#888", fontSize: "13px" }}>
                حساب دارید؟{" "}
                <button type="button" onClick={() => { setTab("login"); setError(""); }} style={{ background: "none", border: "none", color: "#c8a12a", cursor: "pointer", fontFamily: "inherit", fontSize: "13px", fontWeight: "700" }}>وارد شوید</button>
              </p>
            </form>
          )}
        </div>
      </div>

      <Link href="/" style={{ color: "#aaa", textDecoration: "none", marginTop: "18px", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}>
        <ChevronLeft size={13} /> بازگشت به صفحه اصلی
      </Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", backgroundColor: "#f8f8f8", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#c8a12a" }}>در حال بارگذاری...</div></div>}>
      <LoginForm />
    </Suspense>
  );
}
