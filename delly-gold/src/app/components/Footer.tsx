"use client";
import { useState, useEffect } from "react";
import { Send, Phone, MapPin, Mail } from "lucide-react";
import Link from "next/link";
import { buildSocialLinks } from "@/lib/social-platforms";
import SocialIconLink from "./SocialIconLink";
import { GUIDE_PAGE_DEFINITIONS } from "@/lib/guide-pages-settings";

const footerLinks = {
  "خرید از دلی گلد": GUIDE_PAGE_DEFINITIONS.map(def => ({
    label: def.label,
    href: def.href,
  })),
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
  site_brand_desc: string;
  [key: string]: string;
}

const DEFAULTS: SiteSettings = {
  site_phone1: "", site_phone2: "",
  site_address: "", site_email: "",
  site_brand_desc: "دلی گلد؛ ارائه‌دهنده بهترین طلاها با تضمین کیفیت و اعتماد",
};

export default function Footer() {
  const [s, setS] = useState<SiteSettings>(DEFAULTS);

  useEffect(() => {
    fetch("/api/admin/settings", { cache: "no-store" }).then(r => r.json()).then(d => {
      if (d.success) setS({ ...DEFAULTS, ...d.data });
    }).catch(() => {});
  }, []);

  const socials = buildSocialLinks(s);

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
              {socials.map(sc => (
                <SocialIconLink
                  key={sc.type}
                  href={sc.href}
                  label={sc.label}
                  type={sc.type}
                  iconUrl={sc.iconUrl}
                  hover={sc.hover}
                  size={16}
                  variant="footer"
                />
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
