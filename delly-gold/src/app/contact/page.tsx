"use client";
import { useState } from "react";
import { Phone, MapPin, Mail, Clock, Send, CheckCircle } from "lucide-react";
import PageLayout from "../components/PageLayout";

const contactInfo = [
  { icon: <Phone size={20} />, title: "تلفن تماس", lines: ["۰۲۱-۱۳۳۴-۶۵۷۸", "۰۲۱-۹۰۷-۳۴۵۷"] },
  { icon: <Mail size={20} />, title: "ایمیل", lines: ["info@dellygold.com", "support@dellygold.com"] },
  { icon: <MapPin size={20} />, title: "آدرس", lines: ["تهران، پاسداران", "کوچه ۴۴، پلاک ۱۳"] },
  { icon: <Clock size={20} />, title: "ساعات کاری", lines: ["شنبه تا چهارشنبه ۹–۱۸", "پنج‌شنبه ۹–۱۴"] },
];

const faqItems = [
  { q: "چقدر طول می‌کشد سفارشم برسد؟", a: "ارسال به تهران ۱–۲ روز کاری و به سایر شهرها ۳–۵ روز کاری." },
  { q: "آیا امکان مرجوعی وجود دارد؟", a: "بله، تا ۷ روز پس از دریافت کالا با اصالت و بسته‌بندی اولیه قابل مرجوع است." },
  { q: "اصالت طلا را چطور تأیید کنید؟", a: "همه محصولات با فاکتور رسمی و مهر جواهرفروش معتبر ارائه می‌شوند." },
  { q: "آیا امکان سفارش اختصاصی دارید؟", a: "بله، با تیم ما تماس بگیرید تا طراحی اختصاصی برای شما انجام دهیم." },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    // Simulate sending (in production, call an API route)
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    setSending(false);
  }

  return (
    <PageLayout>
      {/* Hero */}
      <div style={{ position: "relative", height: 240, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1400&q=80)`, backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.25)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to left, transparent, rgba(14,14,14,0.7))" }} />
        <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto", padding: "0 16px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 800, marginBottom: 8 }}>تماس با ما</h1>
          <p style={{ color: "#aaa", fontSize: 14 }}>همیشه آماده پاسخگویی به سؤالات شما هستیم</p>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 16px" }}>

        {/* Contact info cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 56 }} className="info-grid">
          {contactInfo.map((c, i) => (
            <div key={i} style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, padding: "20px 16px", textAlign: "center" }}>
              <div style={{ width: 48, height: 48, backgroundColor: "rgba(212,175,55,0.12)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#d4af37" }}>
                {c.icon}
              </div>
              <h3 style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{c.title}</h3>
              {c.lines.map((l, j) => <p key={j} style={{ color: "#888", fontSize: 12, lineHeight: 1.8 }}>{l}</p>)}
            </div>
          ))}
        </div>

        {/* Form + Map */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 64 }} className="form-grid">
          {/* Form */}
          <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, padding: 28 }}>
            <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 20 }}>فرم تماس</h2>

            {sent ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <CheckCircle size={48} color="#10b981" style={{ margin: "0 auto 16px", display: "block" }} />
                <h3 style={{ color: "#fff", fontSize: 18, marginBottom: 8 }}>پیام شما ارسال شد!</h3>
                <p style={{ color: "#888", fontSize: 14 }}>در اسرع وقت پاسخ خواهیم داد.</p>
                <button onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                  style={{ marginTop: 20, backgroundColor: "transparent", color: "#d4af37", border: "1px solid #d4af37", borderRadius: 8, padding: "8px 20px", cursor: "pointer", fontFamily: "inherit" }}>
                  ارسال پیام دیگر
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  {[
                    { name: "name", label: "نام و نام خانوادگی", type: "text", required: true },
                    { name: "phone", label: "شماره تماس", type: "tel", required: false },
                  ].map(f => (
                    <div key={f.name}>
                      <label style={{ color: "#888", fontSize: 12, display: "block", marginBottom: 5 }}>{f.label}{f.required && " *"}</label>
                      <input name={f.name} type={f.type} value={(form as Record<string, string>)[f.name]} onChange={handleChange} required={f.required}
                        style={{ width: "100%", backgroundColor: "#121212", border: "1px solid #2a2a2a", borderRadius: 6, padding: "9px 12px", color: "#fff", fontSize: 13, outline: "none" }} />
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ color: "#888", fontSize: 12, display: "block", marginBottom: 5 }}>ایمیل *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required
                    style={{ width: "100%", backgroundColor: "#121212", border: "1px solid #2a2a2a", borderRadius: 6, padding: "9px 12px", color: "#fff", fontSize: 13, outline: "none", direction: "ltr" }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ color: "#888", fontSize: 12, display: "block", marginBottom: 5 }}>موضوع</label>
                  <select name="subject" value={form.subject} onChange={handleChange}
                    style={{ width: "100%", backgroundColor: "#121212", border: "1px solid #2a2a2a", borderRadius: 6, padding: "9px 12px", color: form.subject ? "#fff" : "#666", fontSize: 13, outline: "none" }}>
                    <option value="">انتخاب کنید</option>
                    <option value="order">پیگیری سفارش</option>
                    <option value="return">مرجوعی</option>
                    <option value="custom">سفارش اختصاصی</option>
                    <option value="other">سایر</option>
                  </select>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ color: "#888", fontSize: 12, display: "block", marginBottom: 5 }}>پیام *</label>
                  <textarea name="message" value={form.message} onChange={handleChange} required rows={5}
                    style={{ width: "100%", backgroundColor: "#121212", border: "1px solid #2a2a2a", borderRadius: 6, padding: "9px 12px", color: "#fff", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
                </div>
                <button type="submit" disabled={sending}
                  style={{ width: "100%", backgroundColor: sending ? "#a08020" : "#d4af37", color: "#000", border: "none", borderRadius: 8, padding: "12px", fontWeight: 700, fontSize: 15, cursor: sending ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Send size={16} />
                  {sending ? "در حال ارسال..." : "ارسال پیام"}
                </button>
              </form>
            )}
          </div>

          {/* Map placeholder + social */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ flex: 1, backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, overflow: "hidden", minHeight: 280, position: "relative" }}>
              <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?w=800&q=80" alt="نقشه" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.4) saturate(0)" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
                <div style={{ width: 48, height: 48, backgroundColor: "#d4af37", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MapPin size={24} color="#000" />
                </div>
                <p style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>تهران، پاسداران، کوچه ۴۴</p>
              </div>
            </div>
            {/* Working hours */}
            <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, padding: 20 }}>
              <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <Clock size={16} color="#d4af37" /> ساعات کاری
              </h3>
              {[
                { day: "شنبه – چهارشنبه", time: "۹:۰۰ – ۱۸:۰۰" },
                { day: "پنج‌شنبه", time: "۹:۰۰ – ۱۴:۰۰" },
                { day: "جمعه", time: "تعطیل" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 2 ? "1px solid #222" : "none" }}>
                  <span style={{ color: "#888", fontSize: 13 }}>{r.day}</span>
                  <span style={{ color: r.time === "تعطیل" ? "#ef4444" : "#d4af37", fontSize: 13, fontWeight: 600 }}>{r.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>سؤالات متداول</h2>
          <p style={{ color: "#666", fontSize: 14, textAlign: "center", marginBottom: 32 }}>پاسخ سؤالات رایج</p>
          <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
            {faqItems.map((item, i) => (
              <div key={i} style={{ backgroundColor: "#1a1a1a", border: `1px solid ${openFaq === i ? "#d4af37" : "#2a2a2a"}`, borderRadius: 10, overflow: "hidden", transition: "border-color 0.2s" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: "inherit", textAlign: "right" }}>
                  {item.q}
                  <span style={{ color: "#d4af37", fontSize: 20, flexShrink: 0, marginRight: 8, transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 20px 16px", color: "#888", fontSize: 13, lineHeight: 1.8 }}>{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .info-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .form-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .info-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PageLayout>
  );
}
