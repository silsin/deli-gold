"use client";
import { useEffect, useState, useCallback } from "react";
import { Save, RefreshCw, TrendingUp, Palette, Type, Monitor, Smartphone } from "lucide-react";
import {
  applyTheme,
  THEME_PALETTES,
  DEFAULT_PALETTE_ID,
  DEFAULT_FONT_MOBILE,
  DEFAULT_FONT_DESKTOP,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  parseThemeSettings,
} from "@/lib/theme";

interface GoldData {
  price: number;
  history: number[];
  fallback?: boolean;
  stale?: boolean;
}

const cardStyle: React.CSSProperties = {
  backgroundColor: "#1a1a1a",
  border: "1px solid #2a2a2a",
  borderRadius: "12px",
  padding: "24px",
};

const inp: React.CSSProperties = {
  width: "100%",
  backgroundColor: "#121212",
  border: "1px solid #333",
  borderRadius: "6px",
  padding: "10px 12px",
  color: "#fff",
  fontSize: "14px",
  outline: "none",
  direction: "ltr",
};

export default function AdminSettingsPage() {
  const [markup, setMarkup] = useState("5");
  const [fixedFee, setFixedFee] = useState("0");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [goldData, setGoldData] = useState<GoldData | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [themePalette, setThemePalette] = useState(DEFAULT_PALETTE_ID);
  const [fontMobile, setFontMobile] = useState(DEFAULT_FONT_MOBILE);
  const [fontDesktop, setFontDesktop] = useState(DEFAULT_FONT_DESKTOP);
  const [savingTheme, setSavingTheme] = useState(false);
  const [themeSaved, setThemeSaved] = useState(false);

  // Site info fields
  const [announcement, setAnnouncement] = useState("با اعتماد شما، سال‌ها طلایی ساختیم.");
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("#");
  const [telegram, setTelegram] = useState("#");
  const [whatsapp, setWhatsapp] = useState("#");
  const [brandDesc, setBrandDesc] = useState("");
  const [savingSite, setSavingSite] = useState(false);
  const [siteSaved, setSiteSaved] = useState(false);

  // Promo banners
  const [pb1Title, setPb1Title] = useState("تخفیف‌های دلی‌گلد");
  const [pb1Sub, setPb1Sub]   = useState("محصولات تخفیف‌دار");
  const [pb1Href, setPb1Href] = useState("/products");
  const [pb1Img, setPb1Img]   = useState("");
  const [pb2Title, setPb2Title] = useState("طلای کم اُجرت");
  const [pb2Sub, setPb2Sub]   = useState("محصولات با کمترین اُجرت ساخت");
  const [pb2Href, setPb2Href] = useState("/products");
  const [pb2Img, setPb2Img]   = useState("");
  const [savingBanners, setSavingBanners] = useState(false);
  const [bannersSaved, setBannersSaved] = useState(false);

  const previewTheme = useCallback((palette: string, mobile: string, desktop: string) => {
    applyTheme({
      theme_palette: palette,
      font_size_mobile: mobile,
      font_size_desktop: desktop,
    });
  }, []);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setMarkup(d.data.gold_markup_percent ?? "5");
          setFixedFee(d.data.gold_fixed_fee ?? "0");
          const theme = parseThemeSettings(d.data);
          setThemePalette(theme.theme_palette);
          setFontMobile(theme.font_size_mobile);
          setFontDesktop(theme.font_size_desktop);
          // Site info
          if (d.data.site_announcement) setAnnouncement(d.data.site_announcement);
          if (d.data.site_phone1)       setPhone1(d.data.site_phone1);
          if (d.data.site_phone2)       setPhone2(d.data.site_phone2);
          if (d.data.site_address)      setAddress(d.data.site_address);
          if (d.data.site_email)        setEmail(d.data.site_email);
          if (d.data.site_instagram)    setInstagram(d.data.site_instagram);
          if (d.data.site_telegram)     setTelegram(d.data.site_telegram);
          if (d.data.site_whatsapp)     setWhatsapp(d.data.site_whatsapp);
          if (d.data.site_brand_desc)   setBrandDesc(d.data.site_brand_desc);
          // Promo banners
          if (d.data.promo_b1_title) setPb1Title(d.data.promo_b1_title);
          if (d.data.promo_b1_sub)   setPb1Sub(d.data.promo_b1_sub);
          if (d.data.promo_b1_href)  setPb1Href(d.data.promo_b1_href);
          if (d.data.promo_b1_image) setPb1Img(d.data.promo_b1_image);
          if (d.data.promo_b2_title) setPb2Title(d.data.promo_b2_title);
          if (d.data.promo_b2_sub)   setPb2Sub(d.data.promo_b2_sub);
          if (d.data.promo_b2_href)  setPb2Href(d.data.promo_b2_href);
          if (d.data.promo_b2_image) setPb2Img(d.data.promo_b2_image);
        }
      });

    fetch("/api/admin/gold-price")
      .then(r => r.json())
      .then(d => { if (d.success) setGoldData(d.data); })
      .finally(() => setLoadingPrice(false));
  }, []);

  function handlePaletteChange(id: string) {
    setThemePalette(id);
    previewTheme(id, fontMobile, fontDesktop);
  }

  function handleFontMobileChange(value: string) {
    setFontMobile(value);
    previewTheme(themePalette, value, fontDesktop);
  }

  function handleFontDesktopChange(value: string) {
    setFontDesktop(value);
    previewTheme(themePalette, fontMobile, value);
  }

  async function handleSavePricing() {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gold_markup_percent: markup,
        gold_fixed_fee: fixedFee,
      }),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    setSaving(false);
  }

  async function handleSaveTheme() {
    setSavingTheme(true);
    setThemeSaved(false);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        theme_palette: themePalette,
        font_size_mobile: fontMobile,
        font_size_desktop: fontDesktop,
      }),
    });
    if (res.ok) {
      setThemeSaved(true);
      previewTheme(themePalette, fontMobile, fontDesktop);
      setTimeout(() => setThemeSaved(false), 3000);
    }
    setSavingTheme(false);
  }

  async function handleSaveSiteInfo() {
    setSavingSite(true); setSiteSaved(false);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        site_announcement: announcement,
        site_phone1: phone1,
        site_phone2: phone2,
        site_address: address,
        site_email: email,
        site_instagram: instagram,
        site_telegram: telegram,
        site_whatsapp: whatsapp,
        site_brand_desc: brandDesc,
      }),
    });
    if (res.ok) { setSiteSaved(true); setTimeout(() => setSiteSaved(false), 3000); }
    setSavingSite(false);
  }

  async function handleSaveBanners() {
    setSavingBanners(true); setBannersSaved(false);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        promo_b1_title: pb1Title, promo_b1_sub: pb1Sub,
        promo_b1_href: pb1Href,  promo_b1_image: pb1Img,
        promo_b2_title: pb2Title, promo_b2_sub: pb2Sub,
        promo_b2_href: pb2Href,  promo_b2_image: pb2Img,
      }),
    });
    if (res.ok) { setBannersSaved(true); setTimeout(() => setBannersSaved(false), 3000); }
    setSavingBanners(false);
  }

  const basePrice = goldData?.price ?? 0;
  const markupNum = parseFloat(markup) || 0;
  const fixedNum = parseFloat(fixedFee) || 0;
  const finalPrice = Math.round(basePrice * (1 + markupNum / 100) + fixedNum);
  const activePalette = THEME_PALETTES.find(p => p.id === themePalette) ?? THEME_PALETTES[0];

  return (
    <div style={{ maxWidth: "720px" }}>
      <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: "700", marginBottom: "24px" }}>تنظیمات</h2>

      {/* ── Theme section ── */}
      <div style={{ ...cardStyle, marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <Palette size={18} color="#d4af37" />
          <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: "600" }}>ظاهر و تم سایت</h3>
        </div>

        <p style={{ color: "#888", fontSize: "13px", marginBottom: "16px", lineHeight: 1.6 }}>
          پالت رنگ پس‌زمینه و اندازه فونت را برای موبایل و دسکتاپ انتخاب کنید. تغییرات بلافاصله در پیش‌نمایش اعمال می‌شوند.
        </p>

        {/* Palette grid */}
        <label style={{ color: "#888", fontSize: "13px", display: "block", marginBottom: "10px" }}>پالت رنگ</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "10px", marginBottom: "24px" }}>
          {THEME_PALETTES.map(p => {
            const selected = themePalette === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePaletteChange(p.id)}
                style={{
                  background: "none",
                  border: `2px solid ${selected ? "#d4af37" : "#333"}`,
                  borderRadius: "10px",
                  padding: "10px",
                  cursor: "pointer",
                  textAlign: "center",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s",
                }}
              >
                <div style={{ display: "flex", gap: "4px", marginBottom: "8px", justifyContent: "center" }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: p.bg, border: "1px solid #444" }} />
                  <span style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: p.accent }} />
                  <span style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: p.card, border: "1px solid #444" }} />
                </div>
                <span style={{ color: selected ? "#d4af37" : "#aaa", fontSize: "11px", fontWeight: selected ? "700" : "400" }}>
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Font sizes */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          <div>
            <label style={{ color: "#888", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <Smartphone size={14} /> اندازه فونت موبایل
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="range"
                min={FONT_SIZE_MIN}
                max={FONT_SIZE_MAX}
                value={fontMobile}
                onChange={e => handleFontMobileChange(e.target.value)}
                style={{ flex: 1, accentColor: "#d4af37" }}
              />
              <span style={{ color: "#d4af37", fontSize: "14px", fontWeight: "700", minWidth: "36px", direction: "ltr" }}>
                {fontMobile}px
              </span>
            </div>
          </div>
          <div>
            <label style={{ color: "#888", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <Monitor size={14} /> اندازه فونت دسکتاپ
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="range"
                min={FONT_SIZE_MIN}
                max={FONT_SIZE_MAX}
                value={fontDesktop}
                onChange={e => handleFontDesktopChange(e.target.value)}
                style={{ flex: 1, accentColor: "#d4af37" }}
              />
              <span style={{ color: "#d4af37", fontSize: "14px", fontWeight: "700", minWidth: "36px", direction: "ltr" }}>
                {fontDesktop}px
              </span>
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ color: "#888", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
            <Type size={14} /> پیش‌نمایش
          </label>
          <div
            style={{
              backgroundColor: activePalette.bg,
              border: `1px solid ${activePalette.border}`,
              borderRadius: "10px",
              padding: "16px",
              transition: "background-color 0.25s",
            }}
          >
            <div style={{ backgroundColor: activePalette.card, border: `1px solid ${activePalette.border}`, borderRadius: "8px", padding: "14px" }}>
              <p style={{ color: activePalette.accent, fontWeight: "700", fontSize: `${fontMobile}px`, marginBottom: "6px" }}>
                دلی گلد — نمونه موبایل ({fontMobile}px)
              </p>
              <p style={{ color: activePalette.textMuted, fontSize: `${Math.max(parseInt(fontMobile) - 2, 11)}px`, marginBottom: "10px" }}>
                متن توضیحات با رنگ ثانویه
              </p>
              <p style={{ color: activePalette.text, fontSize: `${fontDesktop}px`, fontWeight: "600" }}>
                نمونه دسکتاپ ({fontDesktop}px)
              </p>
              <button
                type="button"
                style={{
                  marginTop: "12px",
                  backgroundColor: activePalette.accent,
                  color: activePalette.id === "cream-light" ? "#fff" : "#000",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "default",
                }}
              >
                دکمه نمونه
              </button>
            </div>
          </div>
        </div>

        {themeSaved && (
          <div style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "6px", padding: "10px 14px", marginBottom: "16px", color: "#10b981", fontSize: "13px" }}>
            ✓ تنظیمات ظاهر ذخیره شد
          </div>
        )}

        <button
          type="button"
          onClick={handleSaveTheme}
          disabled={savingTheme}
          style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: savingTheme ? "#a08020" : "#d4af37", color: "#000", border: "none", borderRadius: "8px", padding: "11px 24px", fontWeight: "700", fontSize: "14px", cursor: savingTheme ? "not-allowed" : "pointer", fontFamily: "inherit" }}
        >
          {savingTheme ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
          {savingTheme ? "در حال ذخیره..." : "ذخیره ظاهر سایت"}
        </button>
      </div>

      {/* ── Pricing section ── */}
      <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>قیمت‌گذاری</h3>

      <div style={{ ...cardStyle, padding: "20px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <TrendingUp size={16} color="#d4af37" />
          <h3 style={{ color: "#fff", fontSize: "14px", fontWeight: "600" }}>قیمت لحظه‌ای طلا (۱۸ عیار)</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          {[
            { label: "قیمت بازار", value: loadingPrice ? "..." : `${basePrice.toLocaleString("fa-IR")} ت` },
            { label: "سود شما", value: `${markupNum}% + ${fixedNum.toLocaleString("fa-IR")} ت` },
            { label: "قیمت فروش", value: loadingPrice ? "..." : `${finalPrice.toLocaleString("fa-IR")} ت`, highlight: true },
          ].map((item, i) => (
            <div key={i} style={{ backgroundColor: item.highlight ? "rgba(212,175,55,0.1)" : "#121212", border: `1px solid ${item.highlight ? "rgba(212,175,55,0.3)" : "#2a2a2a"}`, borderRadius: "8px", padding: "12px", textAlign: "center" }}>
              <p style={{ color: "#888", fontSize: "11px", marginBottom: "4px" }}>{item.label}</p>
              <p style={{ color: item.highlight ? "#d4af37" : "#fff", fontSize: "13px", fontWeight: "700" }}>{item.value}</p>
            </div>
          ))}
        </div>
        {goldData?.fallback && (
          <p style={{ color: "#f59e0b", fontSize: "11px", marginTop: "8px" }}>⚠️ قیمت پیش‌فرض — سرویس خارجی در دسترس نیست</p>
        )}
      </div>

      <div style={cardStyle}>
        <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: "600", marginBottom: "20px" }}>تنظیم سود و اجرت</h3>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ color: "#888", fontSize: "13px", display: "block", marginBottom: "6px" }}>
            درصد سود (%) <span style={{ color: "#555", fontSize: "11px" }}>— روی قیمت بازار اعمال می‌شود</span>
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input type="number" value={markup} onChange={e => setMarkup(e.target.value)} min="0" max="100" step="0.5" style={{ ...inp, flex: 1 }} />
            <span style={{ color: "#888", fontSize: "14px", flexShrink: 0 }}>%</span>
          </div>
          <input type="range" min="0" max="50" step="0.5" value={markup} onChange={e => setMarkup(e.target.value)} style={{ width: "100%", marginTop: "8px", accentColor: "#d4af37" }} />
          <div style={{ display: "flex", justifyContent: "space-between", color: "#555", fontSize: "10px" }}>
            <span>۰%</span><span>۲۵%</span><span>۵۰%</span>
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ color: "#888", fontSize: "13px", display: "block", marginBottom: "6px" }}>
            اجرت ثابت (تومان) <span style={{ color: "#555", fontSize: "11px" }}>— مبلغ ثابت به هر گرم افزوده می‌شود</span>
          </label>
          <input type="number" value={fixedFee} onChange={e => setFixedFee(e.target.value)} min="0" step="1000" style={inp} />
        </div>

        {saved && (
          <div style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "6px", padding: "10px 14px", marginBottom: "16px", color: "#10b981", fontSize: "13px" }}>
            ✓ تنظیمات قیمت ذخیره شد
          </div>
        )}

        <button type="button" onClick={handleSavePricing} disabled={saving}
          style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: saving ? "#a08020" : "#d4af37", color: "#000", border: "none", borderRadius: "8px", padding: "11px 24px", fontWeight: "700", fontSize: "14px", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {saving ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
          {saving ? "در حال ذخیره..." : "ذخیره قیمت‌گذاری"}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Site Info ── */}
      <div style={{ ...cardStyle, marginTop: "24px" }}>
        <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: "600", marginBottom: "20px" }}>اطلاعات سایت</h3>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "5px" }}>متن نوار اطلاع‌رسانی بالای سایت</label>
          <input value={announcement} onChange={e => setAnnouncement(e.target.value)} style={{ ...inp, direction: "rtl" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <div>
            <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "5px" }}>شماره تلفن ۱</label>
            <input value={phone1} onChange={e => setPhone1(e.target.value)} style={inp} placeholder="021-1234-5678" />
          </div>
          <div>
            <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "5px" }}>شماره تلفن ۲</label>
            <input value={phone2} onChange={e => setPhone2(e.target.value)} style={inp} placeholder="021-9074-3457" />
          </div>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "5px" }}>آدرس</label>
          <input value={address} onChange={e => setAddress(e.target.value)} style={{ ...inp, direction: "rtl" }} placeholder="تهران، ..." />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <div>
            <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "5px" }}>ایمیل</label>
            <input value={email} onChange={e => setEmail(e.target.value)} style={inp} placeholder="info@dellygold.com" />
          </div>
          <div>
            <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "5px" }}>توضیح برند (فوتر)</label>
            <input value={brandDesc} onChange={e => setBrandDesc(e.target.value)} style={{ ...inp, direction: "rtl" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
          {[
            { label: "لینک اینستاگرام", val: instagram, set: setInstagram },
            { label: "لینک تلگرام",     val: telegram,  set: setTelegram  },
            { label: "لینک واتساپ",     val: whatsapp,  set: setWhatsapp  },
          ].map(f => (
            <div key={f.label}>
              <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "5px" }}>{f.label}</label>
              <input value={f.val} onChange={e => f.set(e.target.value)} style={inp} placeholder="https://..." />
            </div>
          ))}
        </div>

        {siteSaved && <div style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "6px", padding: "10px 14px", marginBottom: "14px", color: "#10b981", fontSize: "13px" }}>✓ اطلاعات سایت ذخیره شد</div>}
        <button onClick={handleSaveSiteInfo} disabled={savingSite}
          style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: savingSite ? "#a08020" : "#d4af37", color: "#000", border: "none", borderRadius: "8px", padding: "11px 24px", fontWeight: "700", fontSize: "14px", cursor: savingSite ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {savingSite ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
          {savingSite ? "در حال ذخیره..." : "ذخیره اطلاعات سایت"}
        </button>
      </div>

      {/* ── Promo Banners ── */}
      <div style={{ ...cardStyle, marginTop: "24px" }}>
        <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: "600", marginBottom: "20px" }}>بنرهای تبلیغاتی</h3>

        {[
          { n: "بنر اول (تخفیف)", title: pb1Title, setTitle: setPb1Title, sub: pb1Sub, setSub: setPb1Sub, href: pb1Href, setHref: setPb1Href, img: pb1Img, setImg: setPb1Img },
          { n: "بنر دوم (کم‌اجرت)", title: pb2Title, setTitle: setPb2Title, sub: pb2Sub, setSub: setPb2Sub, href: pb2Href, setHref: setPb2Href, img: pb2Img, setImg: setPb2Img },
        ].map((b, i) => (
          <div key={i} style={{ marginBottom: "24px", padding: "16px", backgroundColor: "#121212", borderRadius: "8px", border: "1px solid #2a2a2a" }}>
            <p style={{ color: "#d4af37", fontSize: "12px", fontWeight: "700", marginBottom: "12px" }}>{b.n}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
              <div>
                <label style={{ color: "#888", fontSize: "11px", display: "block", marginBottom: "4px" }}>عنوان</label>
                <input value={b.title} onChange={e => b.setTitle(e.target.value)} style={{ ...inp, fontSize: "13px", padding: "8px 10px", direction: "rtl" }} />
              </div>
              <div>
                <label style={{ color: "#888", fontSize: "11px", display: "block", marginBottom: "4px" }}>زیرعنوان</label>
                <input value={b.sub} onChange={e => b.setSub(e.target.value)} style={{ ...inp, fontSize: "13px", padding: "8px 10px", direction: "rtl" }} />
              </div>
              <div>
                <label style={{ color: "#888", fontSize: "11px", display: "block", marginBottom: "4px" }}>لینک</label>
                <input value={b.href} onChange={e => b.setHref(e.target.value)} style={{ ...inp, fontSize: "13px", padding: "8px 10px" }} />
              </div>
              <div>
                <label style={{ color: "#888", fontSize: "11px", display: "block", marginBottom: "4px" }}>URL تصویر</label>
                <input value={b.img} onChange={e => b.setImg(e.target.value)} style={{ ...inp, fontSize: "13px", padding: "8px 10px" }} placeholder="https://..." />
              </div>
            </div>
            {b.img && <img src={b.img} alt="" style={{ width: "100%", height: "80px", objectFit: "cover", borderRadius: "6px", border: "1px solid #333" }} />}
          </div>
        ))}

        {bannersSaved && <div style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "6px", padding: "10px 14px", marginBottom: "14px", color: "#10b981", fontSize: "13px" }}>✓ بنرها ذخیره شدند</div>}
        <button onClick={handleSaveBanners} disabled={savingBanners}
          style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: savingBanners ? "#a08020" : "#d4af37", color: "#000", border: "none", borderRadius: "8px", padding: "11px 24px", fontWeight: "700", fontSize: "14px", cursor: savingBanners ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {savingBanners ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
          {savingBanners ? "در حال ذخیره..." : "ذخیره بنرها"}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
