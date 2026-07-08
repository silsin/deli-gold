"use client";
import { useState, useEffect } from "react";
import { Send, Phone, MapPin, Mail, Download } from "lucide-react";
import Link from "next/link";
import { resolveSocialHref } from "@/lib/social-links";

const Ig = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
);
const Bale = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.02 5.5c.08 0 .15.03.2.09.05.06.07.14.05.22l-1.1 5.18c-.08.36-.3.45-.6.28l-1.64-1.21-.79.76a.35.35 0 01-.33.16l.12-1.67 3.04-2.75a.12.12 0 00-.02-.2l-3.76 2.37-1.62-.5c-.35-.11-.36-.35.07-.52l4.7-1.81c.29-.11.55.07.48.39z"/>
  </svg>
);
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.014 9.496c-.148.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.877.725z"/>
  </svg>
);
const Wa = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.122 1.532 5.853L.057 23.804l6.105-1.601A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.016-1.375l-.36-.213-3.727.977 1.002-3.641-.234-.373A9.818 9.818 0 012.182 12C2.182 6.575 6.575 2.182 12 2.182S21.818 6.575 21.818 12 17.425 21.818 12 21.818z"/>
  </svg>
);

const footerLinks = {
  "خرید از دلی گلد": [
    { label: "راهنمای خرید",    href: "/about" },
    { label: "راهنمای ارسال",   href: "/about" },
    { label: "راهنمای بازگشت",  href: "/about" },
    { label: "سوالات متداول",   href: "/contact" },
    { label: "قوانین و مقررات", href: "/about" },
  ],
  "حساب کاربری": [
    { label: "وضعیت سفارش‌ها", href: "/account?tab=orders" },
    { label: "علاقه‌مندی‌ها",  href: "/account" },
    { label: "تنظیمات حساب",   href: "/account" },
  ],
  "دلی گلد": [
    { label: "درباره ما",  href: "/about" },
    { label: "تماس با ما", href: "/contact" },
    { label: "محصولات",    href: "/products" },
  ],
};

interface SiteSettings {
  site_phone1: string; site_phone2: string;
  site_address: string; site_email: string;
  site_instagram: string; site_telegram: string; site_bale: string;
  site_whatsapp: string; site_install_url: string;
  site_brand_desc: string;
}

const DEFAULTS: SiteSettings = {
  site_phone1: "", site_phone2: "",
  site_address: "", site_email: "",
  site_instagram: "", site_telegram: "", site_bale: "",
  site_whatsapp: "", site_install_url: "",
  site_brand_desc: "دلی گلد؛ ارائه‌دهنده بهترین طلاها با تضمین کیفیت و اعتماد",
};

export default function Footer() {
  const [s, setS] = useState<SiteSettings>(DEFAULTS);

  useEffect(() => {
    fetch("/api/admin/settings", { cache: "no-store" }).then(r => r.json()).then(d => {
      if (d.success) setS({ ...DEFAULTS, ...d.data });
    }).catch(() => {});
  }, []);

  const socials = [
    { icon: <Ig />, label: "Instagram", href: resolveSocialHref("instagram", s.site_instagram) },
    { icon: <Tg />, label: "Telegram",  href: resolveSocialHref("telegram", s.site_telegram) },
    { icon: <Bale />, label: "Bale",    href: resolveSocialHref("bale", s.site_bale) },
    { icon: <Wa />, label: "WhatsApp",  href: resolveSocialHref("whatsapp", s.site_whatsapp) },
    { icon: <Download size={15} />, label: "Install", href: resolveSocialHref("install", s.site_install_url) },
  ].filter(sc => sc.href);

  const contacts = [
    s.site_phone1  && { icon: <Phone  size={13}/>, text: s.site_phone1 },
    s.site_phone2  && { icon: <Phone  size={13}/>, text: s.site_phone2 },
    s.site_address && { icon: <MapPin size={13}/>, text: s.site_address },
    s.site_email   && { icon: <Mail   size={13}/>, text: s.site_email },
  ].filter(Boolean) as { icon: React.ReactNode; text: string }[];

  return (
    <footer style={{ backgroundColor: "#fff", borderTop: "1px solid #ebebeb", marginTop: "28px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 16px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1.2fr", gap: "32px", marginBottom: "32px" }} className="footer-grid">

          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <div style={{ width: "28px", height: "28px", border: "2px solid #c8a12a", transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "9px", height: "9px", backgroundColor: "#c8a12a" }} />
              </div>
              <div>
                <div style={{ color: "#c8a12a", fontSize: "16px", fontWeight: "900", lineHeight: 1 }}>DELLY GOLD</div>
                <div style={{ color: "#aaa", fontSize: "9px", letterSpacing: "1px" }}>دلی گلد</div>
              </div>
            </div>
            <p style={{ color: "#888", fontSize: "12px", lineHeight: "1.8", marginBottom: "14px" }}>{s.site_brand_desc}</p>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              {socials.map((sc, i) => (
                <a key={i} href={sc.href} aria-label={sc.label} style={{ width: "32px", height: "32px", backgroundColor: "#f5f5f5", border: "1px solid #ebebeb", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", textDecoration: "none", transition: "all 0.2s" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "#fdf8ee"; el.style.borderColor = "#c8a12a"; el.style.color = "#c8a12a"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "#f5f5f5"; el.style.borderColor = "#ebebeb"; el.style.color = "#888"; }}>
                  {sc.icon}
                </a>
              ))}
            </div>
            <p style={{ color: "#aaa", fontSize: "11px", marginBottom: "8px" }}>در خبرنامه ما عضو شوید</p>
            <div style={{ display: "flex", gap: "6px" }}>
              <input type="email" placeholder="ایمیل شما" style={{ flex: 1, backgroundColor: "#f8f8f8", border: "1px solid #e0e0e0", borderRadius: "6px", padding: "7px 10px", color: "#333", fontSize: "12px", outline: "none", direction: "ltr", minWidth: 0 }}
                onFocus={e => (e.target.style.borderColor = "#c8a12a")} onBlur={e => (e.target.style.borderColor = "#e0e0e0")} />
              <button style={{ backgroundColor: "#c8a12a", color: "#fff", border: "none", borderRadius: "6px", padding: "7px 12px", fontWeight: "700", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                <Send size={11}/> ثبت
              </button>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 style={{ color: "#222", fontSize: "13px", fontWeight: "700", marginBottom: "14px", paddingBottom: "8px", borderBottom: "2px solid #c8a12a", display: "inline-block" }}>{title}</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {links.map(link => (
                  <li key={link.label} style={{ marginBottom: "8px" }}>
                    <Link href={link.href} style={{ color: "#888", textDecoration: "none", fontSize: "12px", display: "flex", alignItems: "center", gap: "5px", transition: "color 0.2s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#c8a12a"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#888"}>
                      <span style={{ color: "#c8a12a", fontSize: "8px" }}>◆</span> {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 style={{ color: "#222", fontSize: "13px", fontWeight: "700", marginBottom: "14px", paddingBottom: "8px", borderBottom: "2px solid #c8a12a", display: "inline-block" }}>اطلاعات تماس</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {contacts.length > 0 ? contacts.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "7px", color: "#888", fontSize: "12px" }}>
                  <span style={{ color: "#c8a12a", flexShrink: 0, marginTop: "2px" }}>{c.icon}</span>
                  {c.text}
                </div>
              )) : (
                <p style={{ color: "#ccc", fontSize: "12px" }}>به‌زودی</p>
              )}
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #ebebeb", paddingTop: "18px", textAlign: "center" }}>
          <p style={{ color: "#bbb", fontSize: "12px" }}>تمامی حقوق این سایت متعلق به دلی گلد است · ۱۴۰۴</p>
        </div>
      </div>
      <style>{`@media(max-width:900px){.footer-grid{grid-template-columns:1fr 1fr!important}}@media(max-width:540px){.footer-grid{grid-template-columns:1fr!important}}`}</style>
    </footer>
  );
}
