"use client";
import { Send, Phone, MapPin, Mail } from "lucide-react";

const quickLinks = ["محصولات", "کالکشن‌ها", "ویترین‌ها", "تماس با ما"];

// SVG social icons (lucide-react v1 doesn't have Instagram/WhatsApp)
const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const TelegramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.014 9.496c-.148.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.877.725z" />
  </svg>
);

const WhatsappIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.122 1.532 5.853L.057 23.804l6.105-1.601A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.016-1.375l-.36-.213-3.727.977 1.002-3.641-.234-.373A9.818 9.818 0 012.182 12C2.182 6.575 6.575 2.182 12 2.182S21.818 6.575 21.818 12 17.425 21.818 12 21.818z" />
  </svg>
);

export default function Footer() {
  const socialLinks = [
    { icon: <InstagramIcon />, label: "اینستاگرام" },
    { icon: <TelegramIcon />, label: "تلگرام" },
    { icon: <WhatsappIcon />, label: "واتساپ" },
  ];

  const contactInfo = [
    { icon: <Phone size={14} />, text: "۰۲۱-۱۳۳۴-۶۵۷۸" },
    { icon: <Phone size={14} />, text: "۰۲۱-۹۰۷-۳۴۵۷" },
    { icon: <MapPin size={14} />, text: "تهران، پاسداران، کوچه ۴۴" },
    { icon: <Mail size={14} />, text: "info@dellygold.com" },
  ];

  return (
    <footer
      style={{
        backgroundColor: "#111",
        borderTop: "1px solid #2a2a2a",
        marginTop: "60px",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "48px 16px 24px",
        }}
      >
        {/* Top grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
            gap: "40px",
            marginBottom: "40px",
          }}
        >
          {/* Social + Newsletter */}
          <div>
            <h4 style={{ color: "#d4af37", fontSize: "14px", fontWeight: "700", marginBottom: "16px" }}>
              ما را دنبال کنید
            </h4>
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              {socialLinks.map((s, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label={s.label}
                  style={{
                    width: "36px",
                    height: "36px",
                    backgroundColor: "rgba(212,175,55,0.1)",
                    border: "1px solid rgba(212,175,55,0.25)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#d4af37",
                    textDecoration: "none",
                    transition: "background-color 0.2s",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor =
                      "rgba(212,175,55,0.25)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor =
                      "rgba(212,175,55,0.1)")
                  }
                >
                  {s.icon}
                </a>
              ))}
            </div>

            <p style={{ color: "#666", fontSize: "12px", lineHeight: "1.7", marginBottom: "12px" }}>
              از جدیدترین محصولات و تخفیف‌ها با خبر شوید
            </p>

            {/* Newsletter */}
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                style={{
                  backgroundColor: "#d4af37",
                  color: "#000",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 14px",
                  fontWeight: "700",
                  fontSize: "12px",
                  cursor: "pointer",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Send size={12} />
                ثبت
              </button>
              <input
                type="email"
                placeholder="ایمیل شما"
                style={{
                  flex: 1,
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "6px",
                  padding: "8px 10px",
                  color: "#fff",
                  fontSize: "12px",
                  outline: "none",
                  direction: "ltr",
                  minWidth: 0,
                }}
              />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: "#d4af37", fontSize: "14px", fontWeight: "700", marginBottom: "16px" }}>
              دسترسی سریع
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {quickLinks.map((link) => (
                <li key={link} style={{ marginBottom: "10px" }}>
                  <a
                    href="#"
                    style={{
                      color: "#888",
                      textDecoration: "none",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = "#d4af37")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = "#888")
                    }
                  >
                    <span style={{ color: "#d4af37", fontSize: "10px" }}>◆</span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Logo + About */}
          <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: "14px" }}>
              {/* Diamond */}
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  border: "2px solid #d4af37",
                  transform: "rotate(45deg)",
                  margin: "0 auto 10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ width: "12px", height: "12px", backgroundColor: "#d4af37", transform: "rotate(0deg)" }} />
              </div>
              <div style={{ color: "#d4af37", fontSize: "28px", fontWeight: "900", letterSpacing: "-1px" }}>
                DG
              </div>
              <div style={{ color: "#d4af37", fontSize: "11px", fontWeight: "600", letterSpacing: "3px" }}>
                DELLY GOLD
              </div>
            </div>
            <p style={{ color: "#666", fontSize: "12px", lineHeight: "1.8" }}>
              دلی گلد؛ ارائه‌دهنده بهترین
              <br />
              طلاها با تضمین کیفیت و اعتماد
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: "#d4af37", fontSize: "14px", fontWeight: "700", marginBottom: "16px" }}>
              اطلاعات تماس
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {contactInfo.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    color: "#888",
                    fontSize: "12px",
                    lineHeight: "1.5",
                  }}
                >
                  <span style={{ color: "#d4af37", flexShrink: 0, marginTop: "2px" }}>{c.icon}</span>
                  {c.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid #2a2a2a",
            paddingTop: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ color: "#555", fontSize: "12px", textAlign: "center" }}>
            تمامی حقوق این سایت متعلق به دلی گلد است. ۱۴۰۴
          </p>
        </div>
      </div>
    </footer>
  );
}
