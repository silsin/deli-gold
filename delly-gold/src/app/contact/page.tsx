"use client";

import { useEffect, useMemo, useState } from "react";
import { Phone, MapPin, Mail, Clock, Send, CheckCircle } from "lucide-react";
import PageLayout from "../components/PageLayout";
import {
  CONTACT_PAGE_SETTING_KEY,
  EMPTY_CONTACT_PAGE_SETTINGS,
  parseContactPageSettings,
  type ContactPageSettings,
} from "@/lib/contact-page-settings";

interface SiteContact {
  phone1: string;
  phone2: string;
  email: string;
  address: string;
}

export default function ContactPage() {
  const [content, setContent] = useState<ContactPageSettings>(EMPTY_CONTACT_PAGE_SETTINGS);
  const [site, setSite] = useState<SiteContact>({ phone1: "", phone2: "", email: "", address: "" });
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setContent(parseContactPageSettings(d.data[CONTACT_PAGE_SETTING_KEY]));
          setSite({
            phone1: d.data.site_phone1 ?? "",
            phone2: d.data.site_phone2 ?? "",
            email: d.data.site_email ?? "",
            address: d.data.site_address ?? "",
          });
        }
      })
      .catch(() => {});
  }, []);

  const contactCards = useMemo(() => {
    const cards: { icon: React.ReactNode; title: string; lines: string[] }[] = [];
    const phoneLines = [site.phone1, site.phone2].filter(Boolean);
    if (phoneLines.length) {
      cards.push({ icon: <Phone size={20} />, title: "تلفن تماس", lines: phoneLines });
    }
    const emailLines = [site.email, content.email2].filter(Boolean);
    if (emailLines.length) {
      cards.push({ icon: <Mail size={20} />, title: "ایمیل", lines: emailLines });
    }
    const addressLines = [site.address, content.addressLine2].filter(Boolean);
    if (addressLines.length) {
      cards.push({ icon: <MapPin size={20} />, title: "آدرس", lines: addressLines });
    }
    if (content.hoursCardLines.length) {
      cards.push({ icon: <Clock size={20} />, title: "ساعات کاری", lines: content.hoursCardLines });
    }
    return cards;
  }, [site, content.email2, content.addressLine2, content.hoursCardLines]);

  const hasHero = !!(content.heroTitle || content.heroSubtitle || content.heroImage);
  const hasMapSection = !!(content.mapImage || content.mapLabel || content.hoursTable.length > 0);
  const hasFaq = !!(content.faqTitle || content.faqSubtitle || content.faq.length > 0);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: form.subject,
          message: form.message,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setSent(true);
      }
    } catch {
      // keep silent, UI stays on form
    } finally {
      setSending(false);
    }
  }

  return (
    <PageLayout>
      {hasHero && (
        <div style={{ position: "relative", height: 240, overflow: "hidden" }}>
          {content.heroImage && (
            <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${content.heroImage})`, backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.25)" }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to left, transparent, rgba(14,14,14,0.7))" }} />
          <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto", padding: "0 16px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {content.heroTitle && (
              <h1 style={{ color: "var(--theme-text)", fontSize: 32, fontWeight: 800, marginBottom: 8 }}>{content.heroTitle}</h1>
            )}
            {content.heroSubtitle && (
              <p style={{ color: "var(--theme-text-muted)", fontSize: 14 }}>{content.heroSubtitle}</p>
            )}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 16px" }}>
        {contactCards.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 56 }} className="info-grid">
            {contactCards.map((c, i) => (
              <div key={i} style={{ backgroundColor: "var(--theme-card)", border: "1px solid var(--theme-border)", borderRadius: 12, padding: "20px 16px", textAlign: "center" }}>
                <div style={{ width: 48, height: 48, backgroundColor: "color-mix(in srgb, var(--theme-accent) 12%, transparent)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "var(--theme-accent)" }}>
                  {c.icon}
                </div>
                <h3 style={{ color: "var(--theme-text)", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{c.title}</h3>
                {c.lines.map((l, j) => <p key={j} style={{ color: "var(--theme-text-muted)", fontSize: 12, lineHeight: 1.8 }}>{l}</p>)}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: hasMapSection ? "1fr 1fr" : "1fr", gap: 32, marginBottom: 64, ...(hasMapSection ? {} : { maxWidth: 640, marginLeft: "auto", marginRight: "auto" }) }} className="form-grid">
            <div style={{ backgroundColor: "var(--theme-card)", border: "1px solid var(--theme-border)", borderRadius: 12, padding: 28 }}>
              {content.formTitle && (
                <h2 style={{ color: "var(--theme-text)", fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{content.formTitle}</h2>
              )}

              {sent ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <CheckCircle size={48} color="#10b981" style={{ margin: "0 auto 16px", display: "block" }} />
                  <h3 style={{ color: "var(--theme-text)", fontSize: 18, marginBottom: 8 }}>پیام شما ارسال شد!</h3>
                  <p style={{ color: "var(--theme-text-muted)", fontSize: 14 }}>در اسرع وقت پاسخ خواهیم داد.</p>
                  <button onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                    style={{ marginTop: 20, backgroundColor: "transparent", color: "var(--theme-accent)", border: "1px solid var(--theme-accent)", borderRadius: 8, padding: "8px 20px", cursor: "pointer", fontFamily: "inherit" }}>
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
                        <label style={{ color: "var(--theme-text-muted)", fontSize: 12, display: "block", marginBottom: 5 }}>{f.label}{f.required && " *"}</label>
                        <input name={f.name} type={f.type} value={(form as Record<string, string>)[f.name]} onChange={handleChange} required={f.required}
                          style={{ width: "100%", backgroundColor: "var(--theme-surface)", border: "1px solid var(--theme-border)", borderRadius: 6, padding: "9px 12px", color: "var(--theme-text)", fontSize: 13, outline: "none" }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ color: "var(--theme-text-muted)", fontSize: 12, display: "block", marginBottom: 5 }}>ایمیل *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required
                      style={{ width: "100%", backgroundColor: "var(--theme-surface)", border: "1px solid var(--theme-border)", borderRadius: 6, padding: "9px 12px", color: "var(--theme-text)", fontSize: 13, outline: "none", direction: "ltr" }} />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ color: "var(--theme-text-muted)", fontSize: 12, display: "block", marginBottom: 5 }}>موضوع</label>
                    <select name="subject" value={form.subject} onChange={handleChange}
                      style={{ width: "100%", backgroundColor: "var(--theme-surface)", border: "1px solid var(--theme-border)", borderRadius: 6, padding: "9px 12px", color: form.subject ? "var(--theme-text)" : "var(--theme-text-muted)", fontSize: 13, outline: "none" }}>
                      <option value="">انتخاب کنید</option>
                      <option value="order">پیگیری سفارش</option>
                      <option value="return">مرجوعی</option>
                      <option value="custom">سفارش اختصاصی</option>
                      <option value="other">سایر</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ color: "var(--theme-text-muted)", fontSize: 12, display: "block", marginBottom: 5 }}>پیام *</label>
                    <textarea name="message" value={form.message} onChange={handleChange} required rows={5}
                      style={{ width: "100%", backgroundColor: "var(--theme-surface)", border: "1px solid var(--theme-border)", borderRadius: 6, padding: "9px 12px", color: "var(--theme-text)", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
                  </div>
                  <button type="submit" disabled={sending}
                    style={{ width: "100%", backgroundColor: "var(--theme-accent)", color: "#000", border: "none", borderRadius: 8, padding: "12px", fontWeight: 700, fontSize: 15, cursor: sending ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <Send size={16} />
                    {sending ? "در حال ارسال..." : "ارسال پیام"}
                  </button>
                </form>
              )}
            </div>

            {hasMapSection && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {(content.mapImage || content.mapLabel) && (
                  <div style={{ flex: 1, backgroundColor: "var(--theme-card)", border: "1px solid var(--theme-border)", borderRadius: 12, overflow: "hidden", minHeight: 280, position: "relative" }}>
                    {content.mapImage && (
                      <img src={content.mapImage} alt="نقشه" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.4) saturate(0)" }} />
                    )}
                    {content.mapLabel && (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
                        <div style={{ width: 48, height: 48, backgroundColor: "var(--theme-accent)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <MapPin size={24} color="#000" />
                        </div>
                        <p style={{ color: "var(--theme-text)", fontSize: 14, fontWeight: 600 }}>{content.mapLabel}</p>
                      </div>
                    )}
                  </div>
                )}
                {content.hoursTable.length > 0 && (
                  <div style={{ backgroundColor: "var(--theme-card)", border: "1px solid var(--theme-border)", borderRadius: 12, padding: 20 }}>
                    <h3 style={{ color: "var(--theme-text)", fontSize: 15, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      <Clock size={16} color="var(--theme-accent)" /> ساعات کاری
                    </h3>
                    {content.hoursTable.map((r, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < content.hoursTable.length - 1 ? "1px solid var(--theme-border)" : "none" }}>
                        {r.day && <span style={{ color: "var(--theme-text-muted)", fontSize: 13 }}>{r.day}</span>}
                        {r.time && <span style={{ color: r.time === "تعطیل" ? "#ef4444" : "var(--theme-accent)", fontSize: 13, fontWeight: 600 }}>{r.time}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        {hasFaq && (
          <div>
            {content.faqTitle && (
              <h2 style={{ color: "var(--theme-text)", fontSize: 22, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>{content.faqTitle}</h2>
            )}
            {content.faqSubtitle && (
              <p style={{ color: "var(--theme-text-muted)", fontSize: 14, textAlign: "center", marginBottom: 32 }}>{content.faqSubtitle}</p>
            )}
            {content.faq.length > 0 && (
              <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
                {content.faq.map((item, i) => (
                  <div key={i} style={{ backgroundColor: "var(--theme-card)", border: `1px solid ${openFaq === i ? "var(--theme-accent)" : "var(--theme-border)"}`, borderRadius: 10, overflow: "hidden", transition: "border-color 0.2s" }}>
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", color: "var(--theme-text)", fontSize: 14, fontWeight: 600, fontFamily: "inherit", textAlign: "right" }}>
                      {item.q}
                      <span style={{ color: "var(--theme-accent)", fontSize: 20, flexShrink: 0, marginRight: 8, transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
                    </button>
                    {openFaq === i && item.a && (
                      <div style={{ padding: "0 20px 16px", color: "var(--theme-text-muted)", fontSize: 13, lineHeight: 1.8 }}>{item.a}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
