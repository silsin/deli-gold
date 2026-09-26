"use client";

import { useEffect, useState } from "react";
import { Handshake, Send, CheckCircle, ListChecks, Gift, ChevronDown } from "lucide-react";
import PageLayout from "../components/PageLayout";
import {
  COLLAB_PAGE_SETTING_KEY,
  DEFAULT_COLLAB_PAGE_SETTINGS,
  parseCollabPageSettings,
  type CollabPageSettings,
} from "@/lib/collab-page-settings";

const COLLAP_TYPES = [
  "فروشگاه آنلاین",
  "عکاسی",
  "تالار عروسی",
  "صنف‌های دیگر",
  "سایر",
];

const inp: React.CSSProperties = {
  width: "100%",
  backgroundColor: "var(--theme-card)",
  border: "1px solid var(--theme-border)",
  borderRadius: "8px",
  padding: "10px 14px",
  color: "var(--theme-text)",
  fontSize: "14px",
  outline: "none",
  fontFamily: "inherit",
  direction: "rtl",
};

export default function CollabPage() {
  const [content, setContent] = useState<CollabPageSettings>(DEFAULT_COLLAB_PAGE_SETTINGS);
  const [form, setForm] = useState({ name: "", phone: "", email: "", type: COLLAP_TYPES[0], message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    fetch("/api/admin/settings", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data?.[COLLAB_PAGE_SETTING_KEY]) {
          setContent(parseCollabPageSettings(d.data[COLLAB_PAGE_SETTING_KEY]));
        }
      })
      .catch(() => {});
  }, []);

  const hasHero = !!(content.heroTitle || content.heroSubtitle || content.heroImage);
  const hasIntro = !!(content.introTitle || content.introSubtitle || content.cards.length > 0);
  const hasSteps = !!(content.stepsTitle || content.stepsSubtitle || content.steps.length > 0);
  const hasPerks = !!(content.perksTitle || content.perksSubtitle || content.perks.length > 0);
  const hasForm = !!(content.formTitle || content.formSubtitle);
  const hasFaq = !!(content.faqTitle || content.faqSubtitle || content.faq.length > 0);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormErr("");
    if (!form.name.trim()) {
      setFormErr("لطفاً نام و نام خانوادگی را وارد کنید");
      return;
    }
    if (!form.phone.trim()) {
      setFormErr("لطفاً شماره تماس را وارد کنید");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim() || "collab@deligold.local",
          phone: form.phone.trim(),
          subject: `درخواست همکاری: ${form.type}`,
          message: `نوع همکاری: ${form.type}\nشماره تماس: ${form.phone.trim()}\n\n${form.message.trim()}`,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setSent(true);
      } else {
        setFormErr(data?.error || "خطا در ارسال درخواست. لطفاً دوباره تلاش کنید");
      }
    } catch {
      setFormErr("خطای شبکه. لطفاً دوباره تلاش کنید");
    } finally {
      setSending(false);
    }
  }


  return (
    <PageLayout>
      {hasHero && (
        <div style={{ position: "relative", height: 300, overflow: "hidden" }}>
          {content.heroImage && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${content.heroImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "brightness(0.3)",
              }}
            />
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, color-mix(in srgb, var(--theme-accent) 15%, transparent), transparent)",
            }}
          />
          <div
            style={{
              position: "relative",
              maxWidth: 1280,
              margin: "0 auto",
              padding: "0 16px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: "color-mix(in srgb, var(--theme-accent) 15%, transparent)",
                border: "1px solid var(--theme-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--theme-accent)",
                marginBottom: 14,
              }}
            >
              <Handshake size={28} />
            </div>
            {content.heroTitle && (
              <h1 style={{ color: "var(--theme-text)", fontSize: 32, fontWeight: 800, marginBottom: 10 }}>{content.heroTitle}</h1>
            )}
            {content.heroSubtitle && (
              <p style={{ color: "var(--theme-text-muted)", fontSize: 15, maxWidth: 560, lineHeight: 1.9 }}>{content.heroSubtitle}</p>
            )}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "52px 16px" }}>
        {hasIntro && (
          <section style={{ marginBottom: 64, textAlign: "center" }}>
            {content.introTitle && (
              <h2 style={{ color: "var(--theme-text)", fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{content.introTitle}</h2>
            )}
            {content.introSubtitle && (
              <p style={{ color: "var(--theme-text-muted)", fontSize: 14, marginBottom: 32 }}>{content.introSubtitle}</p>
            )}
            {content.cards.length > 0 && (
              <div className="collab-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, textAlign: "right" }}>
                {content.cards.map((card, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: "var(--theme-card)",
                      border: "1px solid var(--theme-border)",
                      borderRadius: 14,
                      padding: 24,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor: "color-mix(in srgb, var(--theme-accent) 12%, transparent)",
                        color: "var(--theme-accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        fontWeight: 800,
                        marginBottom: 14,
                      }}
                    >
                      {i + 1}
                    </div>
                    {card.title && (
                      <h3 style={{ color: "var(--theme-text)", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{card.title}</h3>
                    )}
                    {card.desc && (
                      <p style={{ color: "var(--theme-text-muted)", fontSize: 13, lineHeight: 1.9 }}>{card.desc}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {(hasSteps || hasPerks) && (
          <section className="collab-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 64 }}>
            {hasSteps && (
              <div style={{ backgroundColor: "var(--theme-card)", border: "1px solid var(--theme-border)", borderRadius: 14, padding: 28 }}>
                <h2 style={{ color: "var(--theme-text)", fontSize: 18, fontWeight: 800, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                  <ListChecks size={18} color="var(--theme-accent)" /> {content.stepsTitle || "مراحل شروع همکاری"}
                </h2>
                {content.stepsSubtitle && (
                  <p style={{ color: "var(--theme-text-muted)", fontSize: 13, marginBottom: 20 }}>{content.stepsSubtitle}</p>
                )}
                <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                  {content.steps.map((step, i) => (
                    <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "var(--theme-accent)", color: "#fff", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {i + 1}
                      </span>
                      <span style={{ color: "var(--theme-text)", fontSize: 14, lineHeight: 2 }}>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {hasPerks && (
              <div style={{ borderRadius: 14, padding: 28, background: "linear-gradient(135deg, color-mix(in srgb, var(--theme-accent) 14%, transparent), color-mix(in srgb, var(--theme-accent) 4%, transparent))", border: "1px solid color-mix(in srgb, var(--theme-accent) 35%, transparent)" }}>
                <h2 style={{ color: "var(--theme-text)", fontSize: 18, fontWeight: 800, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                  <Gift size={18} color="var(--theme-accent)" /> {content.perksTitle || "چرا دلی گلد؟"}
                </h2>
                {content.perksSubtitle && (
                  <p style={{ color: "var(--theme-text-muted)", fontSize: 13, marginBottom: 20 }}>{content.perksSubtitle}</p>
                )}
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  {content.perks.map((perk, i) => (
                    <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", color: "var(--theme-text)", fontSize: 14, lineHeight: 1.9 }}>
                      <span style={{ color: "var(--theme-accent)", fontWeight: 800, fontSize: 15, lineHeight: 1.9 }}>✓</span>
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}


        {hasForm && (
          <section style={{ marginBottom: 64 }}>
            <div style={{ maxWidth: 680, margin: "0 auto" }}>
              <h2 style={{ color: "var(--theme-text)", fontSize: 22, fontWeight: 800, marginBottom: 8, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Send size={18} color="var(--theme-accent)" /> {content.formTitle}
              </h2>
              {content.formSubtitle && (
                <p style={{ color: "var(--theme-text-muted)", fontSize: 14, textAlign: "center", marginBottom: 28 }}>{content.formSubtitle}</p>
              )}
              {sent ? (
                <div style={{ backgroundColor: "var(--theme-card)", border: "1px solid var(--theme-border)", borderRadius: 14, padding: "48px 32px", textAlign: "center" }}>
                  <CheckCircle size={44} color="var(--theme-accent)" style={{ marginBottom: 12 }} />
                  <h3 style={{ color: "var(--theme-text)", fontSize: 17, fontWeight: 700, marginBottom: 8 }}>درخواست شما با موفقیت ثبت شد</h3>
                  <p style={{ color: "var(--theme-text-muted)", fontSize: 13, lineHeight: 2 }}>
                    از علاقه‌مندی شما به همکاری با دلی گلد سپاسگزاریم.
                    کارشناسان ما پس از بررسی، با شما تماس می‌گیرند.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ backgroundColor: "var(--theme-card)", border: "1px solid var(--theme-border)", borderRadius: 14, padding: 28 }}>
                  <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ display: "block", color: "var(--theme-text)", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>نام و نام خانوادگی *</label>
                      <input name="name" value={form.name} onChange={handleChange} style={inp} placeholder="نام شما" />
                    </div>
                    <div>
                      <label style={{ display: "block", color: "var(--theme-text)", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>شماره تماس *</label>
                      <input name="phone" value={form.phone} onChange={handleChange} style={{ ...inp, direction: "ltr", textAlign: "right" }} placeholder="۰۹۱۲۳۴۵۶۷۸۹" />
                    </div>
                    <div>
                      <label style={{ display: "block", color: "var(--theme-text)", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>ایمیل</label>
                      <input name="email" type="email" dir="ltr" value={form.email} onChange={handleChange} style={inp} placeholder="you@email.com" />
                    </div>
                    <div>
                      <label style={{ display: "block", color: "var(--theme-text)", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>نوع همکاری</label>
                      <select name="type" value={form.type} onChange={handleChange} style={{ ...inp, cursor: "pointer" }}>
                        {COLLAP_TYPES.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", color: "var(--theme-text)", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>توضیحات</label>
                    <textarea name="message" value={form.message} onChange={handleChange} rows={4} style={{ ...inp, resize: "vertical" }} placeholder="درباره کسب‌وکار خود و نوع همکاری موردنظر بنویسید..." />
                  </div>
                  {formErr && (
                    <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{formErr}</p>
                  )}
                  <button
                    type="submit"
                    disabled={sending}
                    style={{
                      width: "100%",
                      backgroundColor: sending ? "#a08020" : "var(--theme-accent)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "12px",
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: sending ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Send size={16} />
                    {sending ? "در حال ارسال..." : "ارسال درخواست همکاری"}
                  </button>
                </form>
              )}
            </div>
          </section>
        )}


        {hasFaq && (
          <section>
            {content.faqTitle && (
              <h2 style={{ color: "var(--theme-text)", fontSize: 22, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>{content.faqTitle}</h2>
            )}
            {content.faqSubtitle && (
              <p style={{ color: "var(--theme-text-muted)", fontSize: 14, textAlign: "center", marginBottom: 32 }}>{content.faqSubtitle}</p>
            )}
            {content.faq.length > 0 && (
              <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
                {content.faq.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: "var(--theme-card)",
                      border: `1px solid ${openFaq === i ? "var(--theme-accent)" : "var(--theme-border)"}`,
                      borderRadius: 10,
                      overflow: "hidden",
                      transition: "border-color 0.2s",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "16px 20px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--theme-text)",
                        fontSize: 14,
                        fontWeight: 600,
                        fontFamily: "inherit",
                        textAlign: "right",
                      }}
                    >
                      {item.q}
                      <ChevronDown
                        size={16}
                        style={{
                          color: "var(--theme-accent)",
                          flexShrink: 0,
                          marginRight: 8,
                          transition: "transform 0.2s",
                          transform: openFaq === i ? "rotate(180deg)" : "rotate(0)",
                        }}
                      />
                    </button>
                    {openFaq === i && item.a && (
                      <div style={{ padding: "0 20px 16px", color: "var(--theme-text-muted)", fontSize: 13, lineHeight: 1.8 }}>{item.a}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .collab-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
          .collab-grid-2 { grid-template-columns: 1fr !important; }
          .form-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .collab-grid-4 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PageLayout>
  );
}

