"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn, UserPlus, ChevronLeft, Phone, MessageSquare, ArrowRight } from "lucide-react";

type Tab = "login" | "register";
type Step = "phone" | "otp";

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab]         = useState<Tab>((searchParams.get("tab") as Tab) || "login");
  const [step, setStep]       = useState<Step>("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [countdown, setCountdown] = useState(0);

  const [phone, setPhone] = useState("");
  const [name, setName]   = useState("");
  const [otp, setOtp]     = useState("");

  const redirect = searchParams.get("redirect") || "/";

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.success) router.replace(redirect);
    }).catch(() => {});
  }, [redirect, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function resetToPhone() {
    setStep("phone");
    setOtp("");
    setError("");
  }

  function switchTab(next: Tab) {
    setTab(next);
    resetToPhone();
  }

  async function handleSendOtp(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "خطا در ارسال کد"); return; }
      setStep("otp");
      setCountdown(60);
      setOtp("");
    } catch {
      setError("خطای شبکه");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          code: otp,
          ...(tab === "register" ? { name } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "خطا در تأیید کد"); return; }
      router.push(redirect);
      router.refresh();
    } catch {
      setError("خطای شبکه");
    } finally {
      setLoading(false);
    }
  }

  const inp: React.CSSProperties = {
    width: "100%", backgroundColor: "#fff", border: "1px solid #ddd",
    borderRadius: "8px", padding: "11px 14px", color: "#222",
    fontSize: "14px", outline: "none", fontFamily: "inherit",
  };

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

        <div style={{ display: "flex", borderBottom: "1px solid #ebebeb" }}>
          {(["login", "register"] as Tab[]).map(t => (
            <button key={t} onClick={() => switchTab(t)}
              style={{ flex: 1, padding: "15px", backgroundColor: tab === t ? "#fdf8ee" : "#fff", color: tab === t ? "#c8a12a" : "#888", border: "none", borderBottom: tab === t ? "2px solid #c8a12a" : "2px solid transparent", fontSize: "14px", fontWeight: tab === t ? "700" : "400", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              {t === "login" ? <><LogIn size={14} /> ورود</> : <><UserPlus size={14} /> ثبت‌نام</>}
            </button>
          ))}
        </div>

        <div style={{ padding: "26px" }}>
          {error && (
            <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "7px", padding: "10px 14px", color: "#dc2626", fontSize: "13px", marginBottom: "16px" }}>
              {error}
            </div>
          )}

          {step === "phone" && (
            <form onSubmit={handleSendOtp}>
              {tab === "register" && (
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ color: "#666", fontSize: "12px", display: "block", marginBottom: "6px" }}>نام کامل</label>
                  <input
                    type="text" value={name} onChange={e => setName(e.target.value)}
                    required autoFocus placeholder="نام و نام خانوادگی"
                    style={inp}
                    onFocus={e => (e.target.style.borderColor = "#c8a12a")}
                    onBlur={e => (e.target.style.borderColor = "#ddd")}
                  />
                </div>
              )}
              <div style={{ marginBottom: "22px" }}>
                <label style={{ color: "#666", fontSize: "12px", display: "flex", alignItems: "center", gap: "5px", marginBottom: "6px" }}>
                  <Phone size={12} color="#c8a12a" /> شماره موبایل
                </label>
                <input
                  type="tel" inputMode="numeric" value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="09123456789" required autoFocus={tab === "login"}
                  style={{ ...inp, direction: "ltr", letterSpacing: "1px" }}
                  onFocus={e => (e.target.style.borderColor = "#c8a12a")}
                  onBlur={e => (e.target.style.borderColor = "#ddd")}
                />
                <p style={{ color: "#bbb", fontSize: "11px", marginTop: "4px" }}>
                  {tab === "login"
                    ? "کد تأیید به این شماره پیامک می‌شود"
                    : "شماره موبایل شناسه ورود شما خواهد بود"}
                </p>
              </div>
              <button type="submit" disabled={loading}
                style={{ width: "100%", backgroundColor: loading ? "#e8c86a" : "#c8a12a", color: "#fff", border: "none", borderRadius: "8px", padding: "12px", fontWeight: "800", fontSize: "15px", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                {loading ? "در حال ارسال..." : <><MessageSquare size={15} /> دریافت کد تأیید</>}
              </button>
              <p style={{ textAlign: "center", marginTop: "14px", color: "#888", fontSize: "13px" }}>
                {tab === "login" ? "حساب ندارید؟ " : "حساب دارید؟ "}
                <button type="button" onClick={() => switchTab(tab === "login" ? "register" : "login")}
                  style={{ background: "none", border: "none", color: "#c8a12a", cursor: "pointer", fontFamily: "inherit", fontSize: "13px", fontWeight: "700" }}>
                  {tab === "login" ? "ثبت‌نام کنید" : "وارد شوید"}
                </button>
              </p>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp}>
              <button type="button" onClick={resetToPhone}
                style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontFamily: "inherit", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px", marginBottom: "16px", padding: 0 }}>
                <ArrowRight size={13} /> تغییر شماره ({phone})
              </button>
              <div style={{ marginBottom: "22px" }}>
                <label style={{ color: "#666", fontSize: "12px", display: "flex", alignItems: "center", gap: "5px", marginBottom: "6px" }}>
                  <MessageSquare size={12} color="#c8a12a" /> کد تأیید ۵ رقمی
                </label>
                <input
                  type="text" inputMode="numeric" value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  placeholder="12345" required autoFocus maxLength={5}
                  style={{ ...inp, direction: "ltr", letterSpacing: "8px", textAlign: "center", fontSize: "20px", fontWeight: "700" }}
                  onFocus={e => (e.target.style.borderColor = "#c8a12a")}
                  onBlur={e => (e.target.style.borderColor = "#ddd")}
                />
                <p style={{ color: "#bbb", fontSize: "11px", marginTop: "8px", textAlign: "center" }}>
                  {countdown > 0 ? (
                    <>ارسال مجدد تا {countdown} ثانیه دیگر</>
                  ) : (
                    <button type="button" onClick={() => handleSendOtp()} disabled={loading}
                      style={{ background: "none", border: "none", color: "#c8a12a", cursor: "pointer", fontFamily: "inherit", fontSize: "11px", fontWeight: "700" }}>
                      ارسال مجدد کد
                    </button>
                  )}
                </p>
              </div>
              <button type="submit" disabled={loading || otp.length !== 5}
                style={{ width: "100%", backgroundColor: loading || otp.length !== 5 ? "#e8c86a" : "#c8a12a", color: "#fff", border: "none", borderRadius: "8px", padding: "12px", fontWeight: "800", fontSize: "15px", cursor: loading || otp.length !== 5 ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                {loading ? "در حال تأیید..." : <><LogIn size={15} /> {tab === "login" ? "ورود به حساب" : "تأیید و ایجاد حساب"}</>}
              </button>
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
    <Suspense fallback={
      <div style={{ minHeight: "100vh", backgroundColor: "#f8f8f8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#c8a12a" }}>در حال بارگذاری...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
