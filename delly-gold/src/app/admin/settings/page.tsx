"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { Save, RefreshCw, TrendingUp, Palette, Type, Monitor, Smartphone, Upload, Phone, MapPin, Mail, Globe, X, MessageCircle, Sparkles } from "lucide-react";
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
import {
  FONT_OPTIONS,
  TYPO_SECTIONS,
  getDefaultTypoSettings,
  getFontFamily,
  buildGoogleFontsUrl,
} from "@/lib/typography";
import {
  DEFAULT_PRICE_BAR_STYLE,
  parsePriceBarStyle,
  priceBarStyleToSettings,
  type PriceBarStyle,
} from "@/lib/price-bar-settings";

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
  const [priceBar, setPriceBar] = useState<PriceBarStyle>(DEFAULT_PRICE_BAR_STYLE);
  const [savingPriceBar, setSavingPriceBar] = useState(false);
  const [priceBarSaved, setPriceBarSaved] = useState(false);
  const [goldData, setGoldData] = useState<GoldData | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [themePalette, setThemePalette] = useState(DEFAULT_PALETTE_ID);
  const [fontMobile, setFontMobile] = useState(DEFAULT_FONT_MOBILE);
  const [fontDesktop, setFontDesktop] = useState(DEFAULT_FONT_DESKTOP);
  const [savingTheme, setSavingTheme] = useState(false);
  const [themeSaved, setThemeSaved] = useState(false);

  // Site info fields
  const [announcement, setAnnouncement] = useState("");
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [telegram, setTelegram] = useState("");
  const [bale, setBale] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [installUrl, setInstallUrl] = useState("");
  const [brandDesc, setBrandDesc] = useState("");
  const [savingSite, setSavingSite] = useState(false);
  const [siteSaved, setSiteSaved] = useState(false);

  // tawk.to live chat
  const [tawkPropertyId, setTawkPropertyId] = useState("");
  const [tawkWidgetId, setTawkWidgetId] = useState("default");
  const [savingTawk, setSavingTawk] = useState(false);
  const [tawkSaved, setTawkSaved] = useState(false);

  // Hugging Face (virtual try-on AI)
  const [huggingfaceToken, setHuggingfaceToken] = useState("");
  const [tryonEnabled, setTryonEnabled] = useState(true);
  const [savingHf, setSavingHf] = useState(false);
  const [hfSaved, setHfSaved] = useState(false);

  // Promo banners
  const [pb1Title, setPb1Title] = useState("");
  const [pb1Sub, setPb1Sub]   = useState("");
  const [pb1Href, setPb1Href] = useState("/products");
  const [pb1Img, setPb1Img]   = useState("");
  const [pb2Title, setPb2Title] = useState("");
  const [pb2Sub, setPb2Sub]   = useState("");
  const [pb2Href, setPb2Href] = useState("/products");
  const [pb2Img, setPb2Img]   = useState("");
  const [savingBanners, setSavingBanners] = useState(false);
  const [bannersSaved, setBannersSaved] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState<number | null>(null);
  const bannerRef1 = useRef<HTMLInputElement>(null);
  const bannerRef2 = useRef<HTMLInputElement>(null);

  // Typography
  const defaults = getDefaultTypoSettings();
  const [typo, setTypo] = useState<Record<string, string>>(defaults);
  const [savingTypo, setSavingTypo] = useState(false);
  const [savedTypo, setSavedTypo] = useState(false);

  async function uploadBannerImage(bannerNum: 1 | 2, file: File) {
    setUploadingBanner(bannerNum);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        if (bannerNum === 1) setPb1Img(data.data.url);
        else setPb2Img(data.data.url);
      }
    } catch {}
    finally { setUploadingBanner(null); }
  }

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
          setPriceBar(parsePriceBarStyle(d.data));
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
          setInstagram(d.data.site_instagram ?? "");
          setTelegram(d.data.site_telegram ?? "");
          setBale(d.data.site_bale ?? "");
          setWhatsapp(d.data.site_whatsapp ?? "");
          setInstallUrl(d.data.site_install_url ?? "");
          if (d.data.site_brand_desc)   setBrandDesc(d.data.site_brand_desc);
          setTawkPropertyId(d.data.tawk_property_id ?? "");
          setTawkWidgetId(d.data.tawk_widget_id ?? "default");
          setHuggingfaceToken(d.data.huggingface_api_token ?? "");
          setTryonEnabled((d.data.tryon_enabled ?? "1") !== "0");
          // Promo banners
          if (d.data.promo_b1_title) setPb1Title(d.data.promo_b1_title);
          if (d.data.promo_b1_sub)   setPb1Sub(d.data.promo_b1_sub);
          if (d.data.promo_b1_href)  setPb1Href(d.data.promo_b1_href);
          if (d.data.promo_b1_image) setPb1Img(d.data.promo_b1_image);
          if (d.data.promo_b2_title) setPb2Title(d.data.promo_b2_title);
          if (d.data.promo_b2_sub)   setPb2Sub(d.data.promo_b2_sub);
          if (d.data.promo_b2_href)  setPb2Href(d.data.promo_b2_href);
          if (d.data.promo_b2_image) setPb2Img(d.data.promo_b2_image);
          // Typography
          const typoUpdate: Record<string, string> = { ...getDefaultTypoSettings() };
          for (const s of TYPO_SECTIONS) {
            if (d.data[`${s.key}_font`]) typoUpdate[`${s.key}_font`] = d.data[`${s.key}_font`];
            if (d.data[`${s.key}_size`]) typoUpdate[`${s.key}_size`] = d.data[`${s.key}_size`];
          }
          setTypo(typoUpdate);
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

  async function handleSavePriceBar() {
    setSavingPriceBar(true);
    setPriceBarSaved(false);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(priceBarStyleToSettings(priceBar)),
    });
    if (res.ok) {
      setPriceBarSaved(true);
      setTimeout(() => setPriceBarSaved(false), 3000);
    }
    setSavingPriceBar(false);
  }

  function updatePriceBar<K extends keyof PriceBarStyle>(key: K, value: PriceBarStyle[K]) {
    setPriceBar(prev => ({ ...prev, [key]: value }));
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

  async function handleSaveHuggingface() {
    setSavingHf(true);
    setHfSaved(false);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        huggingface_api_token: huggingfaceToken.trim(),
        tryon_enabled: tryonEnabled ? "1" : "0",
      }),
    });
    if (res.ok) {
      setHfSaved(true);
      setTimeout(() => setHfSaved(false), 3000);
    }
    setSavingHf(false);
  }

  async function handleSaveTawk() {
    setSavingTawk(true);
    setTawkSaved(false);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tawk_property_id: tawkPropertyId.trim(),
        tawk_widget_id: tawkWidgetId.trim() || "default",
      }),
    });
    if (res.ok) {
      setTawkSaved(true);
      setTimeout(() => setTawkSaved(false), 3000);
    }
    setSavingTawk(false);
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
        site_bale: bale,
        site_whatsapp: whatsapp,
        site_install_url: installUrl,
        site_brand_desc: brandDesc,
      }),
    });
    if (res.ok) { setSiteSaved(true); setTimeout(() => setSiteSaved(false), 3000); }
    setSavingSite(false);
  }

  async function handleSaveTypography() {
    setSavingTypo(true); setSavedTypo(false);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(typo),
    });
    // Apply immediately to the page
    const root = document.documentElement;
    for (const s of TYPO_SECTIONS) {
      const fontId = typo[`${s.key}_font`] || s.defaultFont;
      const size   = typo[`${s.key}_size`] || String(s.defaultSize);
      root.style.setProperty(s.cssFont, getFontFamily(fontId));
      root.style.setProperty(s.cssSize, `${size}px`);
    }
    // Reload fonts
    const url = buildGoogleFontsUrl(TYPO_SECTIONS.map(s => typo[`${s.key}_font`] || s.defaultFont));
    if (url) {
      const existing = document.getElementById("dynamic-gfonts");
      if (existing) existing.remove();
      const link = document.createElement("link");
      link.id = "dynamic-gfonts"; link.rel = "stylesheet"; link.href = url;
      document.head.appendChild(link);
    }
    setSavedTypo(true); setTimeout(() => setSavedTypo(false), 3000);
    setSavingTypo(false);
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

      {/* ── Site Info — FIRST ── */}
      <div style={{ ...cardStyle, marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <Globe size={18} color="#d4af37" />
          <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: "600" }}>اطلاعات تماس و سایت</h3>
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "5px" }}>متن نوار اطلاع‌رسانی بالای سایت</label>
          <input value={announcement} onChange={e => setAnnouncement(e.target.value)} style={{ ...inp, direction: "rtl" }} placeholder="مثال: با اعتماد شما، سال‌ها طلایی ساختیم." />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
          <div>
            <label style={{ color: "#888", fontSize: "12px", display: "flex", alignItems: "center", gap: "5px", marginBottom: "5px" }}>
              <Phone size={12} /> شماره تلفن ۱
            </label>
            <input value={phone1} onChange={e => setPhone1(e.target.value)} style={inp} placeholder="021-1234-5678" />
          </div>
          <div>
            <label style={{ color: "#888", fontSize: "12px", display: "flex", alignItems: "center", gap: "5px", marginBottom: "5px" }}>
              <Phone size={12} /> شماره تلفن ۲
            </label>
            <input value={phone2} onChange={e => setPhone2(e.target.value)} style={inp} placeholder="021-9074-3457" />
          </div>
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label style={{ color: "#888", fontSize: "12px", display: "flex", alignItems: "center", gap: "5px", marginBottom: "5px" }}>
            <MapPin size={12} /> آدرس فیزیکی
          </label>
          <input value={address} onChange={e => setAddress(e.target.value)} style={{ ...inp, direction: "rtl" }} placeholder="تهران، ..." />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
          <div>
            <label style={{ color: "#888", fontSize: "12px", display: "flex", alignItems: "center", gap: "5px", marginBottom: "5px" }}>
              <Mail size={12} /> ایمیل
            </label>
            <input value={email} onChange={e => setEmail(e.target.value)} style={inp} placeholder="info@dellygold.com" />
          </div>
          <div>
            <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "5px" }}>توضیح برند (فوتر)</label>
            <input value={brandDesc} onChange={e => setBrandDesc(e.target.value)} style={{ ...inp, direction: "rtl" }} placeholder="معرفی کوتاه برند..." />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
          {[
            { label: "اینستاگرام", icon: "📸", val: instagram, set: setInstagram, ph: "https://instagram.com/..." },
            { label: "تلگرام",     icon: "✈️", val: telegram,  set: setTelegram,  ph: "@username یا https://t.me/..." },
            { label: "بله",        icon: "💚", val: bale,      set: setBale,      ph: "@username یا https://ble.ir/..." },
            { label: "واتساپ",     icon: "💬", val: whatsapp,  set: setWhatsapp,  ph: "0912... یا https://wa.me/..." },
          ].map(f => (
            <div key={f.label}>
              <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "5px" }}>{f.icon} {f.label}</label>
              <input value={f.val} onChange={e => f.set(e.target.value)} style={inp} placeholder={f.ph} />
            </div>
          ))}
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "5px" }}>📲 لینک نصب اپ (آیکن بالای سایت)</label>
          <input value={installUrl} onChange={e => setInstallUrl(e.target.value)} style={inp} placeholder="https://... یا /install" />
        </div>

        {siteSaved && <div style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "6px", padding: "10px 14px", marginBottom: "14px", color: "#10b981", fontSize: "13px" }}>✓ اطلاعات سایت ذخیره شد</div>}
        <button onClick={handleSaveSiteInfo} disabled={savingSite}
          style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: savingSite ? "#a08020" : "#d4af37", color: "#000", border: "none", borderRadius: "8px", padding: "11px 24px", fontWeight: "700", fontSize: "14px", cursor: savingSite ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {savingSite ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
          {savingSite ? "در حال ذخیره..." : "ذخیره اطلاعات تماس"}
        </button>
      </div>

      {/* ── Live Chat (tawk.to) ── */}
      <div style={{ ...cardStyle, marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <MessageCircle size={18} color="#d4af37" />
          <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: "600" }}>چت آنلاین (tawk.to)</h3>
        </div>

        <p style={{ color: "#888", fontSize: "13px", marginBottom: "16px", lineHeight: 1.6 }}>
          پس از ثبت‌نام در{" "}
          <a href="https://www.tawk.to" target="_blank" rel="noopener noreferrer" style={{ color: "#d4af37" }}>
            tawk.to
          </a>
          ، از بخش Administration → Channels → Chat Widget شناسه Property ID و Widget ID را کپی کنید.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
          <div>
            <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "5px" }}>Property ID</label>
            <input
              value={tawkPropertyId}
              onChange={e => setTawkPropertyId(e.target.value)}
              style={inp}
              placeholder="مثال: 1234567890abcdef"
            />
          </div>
          <div>
            <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "5px" }}>Widget ID</label>
            <input
              value={tawkWidgetId}
              onChange={e => setTawkWidgetId(e.target.value)}
              style={inp}
              placeholder="default"
            />
          </div>
        </div>

        {tawkSaved && (
          <div style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "6px", padding: "10px 14px", marginBottom: "14px", color: "#10b981", fontSize: "13px" }}>
            ✓ تنظیمات چت آنلاین ذخیره شد
          </div>
        )}

        <button
          type="button"
          onClick={handleSaveTawk}
          disabled={savingTawk}
          style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: savingTawk ? "#a08020" : "#d4af37", color: "#000", border: "none", borderRadius: "8px", padding: "11px 24px", fontWeight: "700", fontSize: "14px", cursor: savingTawk ? "not-allowed" : "pointer", fontFamily: "inherit" }}
        >
          {savingTawk ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
          {savingTawk ? "در حال ذخیره..." : "ذخیره چت آنلاین"}
        </button>
      </div>

      {/* ── Hugging Face (Virtual Try-On AI) ── */}
      <div style={{ ...cardStyle, marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <Sparkles size={18} color="#d4af37" />
          <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: "600" }}>پرو مجازی (Hugging Face)</h3>
        </div>

        <p style={{ color: "#888", fontSize: "13px", marginBottom: "16px", lineHeight: 1.6 }}>
          توکن رایگان از{" "}
          <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" style={{ color: "#d4af37" }}>
            huggingface.co/settings/tokens
          </a>
          {" "}بسازید. هنگام ساخت توکن، حتماً دسترسی <strong style={{ color: "#ccc" }}>Make calls to Inference Providers</strong> را فعال کنید.
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "20px", padding: "14px 16px", backgroundColor: "#121212", border: "1px solid #333", borderRadius: "8px" }}>
          <div>
            <p style={{ color: "#fff", fontSize: "14px", fontWeight: "600", marginBottom: "4px" }}>نمایش پرو مجازی در سایت</p>
            <p style={{ color: "#666", fontSize: "12px", lineHeight: 1.5 }}>با غیرفعال کردن، لینک منو و صفحه پرو مجازی برای مشتریان مخفی می‌شود.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={tryonEnabled}
            aria-label="نمایش پرو مجازی در سایت"
            onClick={() => setTryonEnabled(v => !v)}
            style={{
              flexShrink: 0,
              width: "52px",
              height: "28px",
              borderRadius: "14px",
              border: "none",
              cursor: "pointer",
              backgroundColor: tryonEnabled ? "#10b981" : "#444",
              position: "relative",
              transition: "background-color 0.2s",
            }}
          >
            <span style={{
              position: "absolute",
              top: "3px",
              left: tryonEnabled ? "27px" : "3px",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              backgroundColor: "#fff",
              transition: "left 0.2s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
            }} />
          </button>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "5px" }}>API Token</label>
          <input
            type="password"
            value={huggingfaceToken}
            onChange={e => setHuggingfaceToken(e.target.value)}
            style={inp}
            placeholder="hf_xxxxxxxxxxxxxxxx"
            autoComplete="off"
          />
        </div>

        {hfSaved && (
          <div style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "6px", padding: "10px 14px", marginBottom: "14px", color: "#10b981", fontSize: "13px" }}>
            ✓ تنظیمات پرو مجازی ذخیره شد
          </div>
        )}

        <button
          type="button"
          onClick={handleSaveHuggingface}
          disabled={savingHf}
          style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: savingHf ? "#a08020" : "#d4af37", color: "#000", border: "none", borderRadius: "8px", padding: "11px 24px", fontWeight: "700", fontSize: "14px", cursor: savingHf ? "not-allowed" : "pointer", fontFamily: "inherit" }}
        >
          {savingHf ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
          {savingHf ? "در حال ذخیره..." : "ذخیره تنظیمات پرو مجازی"}
        </button>
      </div>

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

      <div style={{ ...cardStyle, padding: "20px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <TrendingUp size={16} color="#d4af37" />
          <h3 style={{ color: "#fff", fontSize: "14px", fontWeight: "600" }}>ظاهر نوار قیمت بالای سایت</h3>
        </div>
        <p style={{ color: "#666", fontSize: "12px", marginBottom: "14px", lineHeight: 1.6 }}>
          متن و رنگ هر بخش را جداگانه تنظیم کنید. عدد قیمت همیشه قبل از «تومان» نمایش داده می‌شود.
        </p>

        <div style={{
          background: "linear-gradient(135deg, #7b1a1a 0%, #8b2020 40%, #7b1a1a 100%)",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "18px",
          textAlign: "center",
        }}>
          <span style={{ fontSize: "12px", fontWeight: "500" }}>
            <span style={{ color: priceBar.labelColor }}>{priceBar.labelText} </span>
            <span style={{ color: priceBar.goldColor, fontWeight: "800" }}>{priceBar.goldText}</span>
            <span style={{ color: priceBar.labelColor }}>: </span>
            <span dir="ltr" style={{ display: "inline-flex", flexDirection: "row", gap: "4px", unicodeBidi: "isolate", fontWeight: "800" }}>
              <span style={{ color: priceBar.amountColor }}>{finalPrice.toLocaleString("fa-IR")}</span>
              <span style={{ color: priceBar.currencyColor }}>{priceBar.currencyText}</span>
            </span>
          </span>
        </div>

        {[
          { key: "labelText" as const, colorKey: "labelColor" as const, title: "متن اول (مثلاً قیمت)", hasText: true },
          { key: "goldText" as const, colorKey: "goldColor" as const, title: "متن دوم (مثلاً طلا)", hasText: true },
          { key: null, colorKey: "amountColor" as const, title: "رنگ عدد قیمت", hasText: false },
          { key: "currencyText" as const, colorKey: "currencyColor" as const, title: "متن واحد (مثلاً تومان)", hasText: true },
        ].map((row, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: row.hasText ? "1fr 110px 48px" : "1fr 110px 48px", gap: "10px", alignItems: "end", marginBottom: "12px" }}>
            <div>
              <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "5px" }}>{row.title}</label>
              {row.hasText && row.key ? (
                <input
                  value={priceBar[row.key]}
                  onChange={e => updatePriceBar(row.key!, e.target.value)}
                  style={{ ...inp, direction: "rtl" }}
                />
              ) : (
                <div style={{ ...inp, color: "#555", display: "flex", alignItems: "center" }}>از API قیمت لحظه‌ای</div>
              )}
            </div>
            <div>
              <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "5px" }}>رنگ</label>
              <input
                value={priceBar[row.colorKey]}
                onChange={e => updatePriceBar(row.colorKey, e.target.value)}
                style={inp}
                placeholder="#ffffff"
              />
            </div>
            <div>
              <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "5px" }}>&nbsp;</label>
              <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(priceBar[row.colorKey]) ? priceBar[row.colorKey] : "#ffffff"}
                onChange={e => updatePriceBar(row.colorKey, e.target.value)}
                style={{ width: "48px", height: "42px", padding: "2px", border: "1px solid #333", borderRadius: "6px", backgroundColor: "#121212", cursor: "pointer" }}
                aria-label={`انتخاب ${row.title}`}
              />
            </div>
          </div>
        ))}

        {priceBarSaved && (
          <div style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "6px", padding: "10px 14px", marginBottom: "14px", color: "#10b981", fontSize: "13px" }}>
            ✓ ظاهر نوار قیمت ذخیره شد
          </div>
        )}

        <button
          type="button"
          onClick={handleSavePriceBar}
          disabled={savingPriceBar}
          style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: savingPriceBar ? "#a08020" : "#d4af37", color: "#000", border: "none", borderRadius: "8px", padding: "11px 24px", fontWeight: "700", fontSize: "14px", cursor: savingPriceBar ? "not-allowed" : "pointer", fontFamily: "inherit" }}
        >
          {savingPriceBar ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
          {savingPriceBar ? "در حال ذخیره..." : "ذخیره ظاهر نوار قیمت"}
        </button>
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

      {/* ── Promo Banners ── */}
      <div style={{ ...cardStyle, marginTop: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <span style={{ fontSize: "18px" }}>🖼️</span>
          <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: "600" }}>بنرهای تبلیغاتی</h3>
        </div>

        {[
          { n: "بنر اول", num: 1 as const, title: pb1Title, setTitle: setPb1Title, sub: pb1Sub, setSub: setPb1Sub, href: pb1Href, setHref: setPb1Href, img: pb1Img, setImg: setPb1Img, ref: bannerRef1 },
          { n: "بنر دوم", num: 2 as const, title: pb2Title, setTitle: setPb2Title, sub: pb2Sub, setSub: setPb2Sub, href: pb2Href, setHref: setPb2Href, img: pb2Img, setImg: setPb2Img, ref: bannerRef2 },
        ].map((b, i) => (
          <div key={i} style={{ marginBottom: "24px", padding: "16px", backgroundColor: "#121212", borderRadius: "8px", border: "1px solid #2a2a2a" }}>
            <p style={{ color: "#d4af37", fontSize: "12px", fontWeight: "700", marginBottom: "12px" }}>{b.n}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              <div>
                <label style={{ color: "#888", fontSize: "11px", display: "block", marginBottom: "4px" }}>عنوان</label>
                <input value={b.title} onChange={e => b.setTitle(e.target.value)} style={{ ...inp, fontSize: "13px", padding: "8px 10px", direction: "rtl" }} />
              </div>
              <div>
                <label style={{ color: "#888", fontSize: "11px", display: "block", marginBottom: "4px" }}>زیرعنوان</label>
                <input value={b.sub} onChange={e => b.setSub(e.target.value)} style={{ ...inp, fontSize: "13px", padding: "8px 10px", direction: "rtl" }} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ color: "#888", fontSize: "11px", display: "block", marginBottom: "4px" }}>لینک</label>
                <input value={b.href} onChange={e => b.setHref(e.target.value)} style={{ ...inp, fontSize: "13px", padding: "8px 10px" }} />
              </div>
            </div>
            <label style={{ color: "#888", fontSize: "11px", display: "block", marginBottom: "6px" }}>تصویر بنر</label>
            <input ref={b.ref} type="file" accept="image/*" style={{ display: "none" }}
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadBannerImage(b.num, f); }} />
            {b.img ? (
              <div style={{ position: "relative", width: "100%" }}>
                <img src={b.img} alt="" style={{ width: "100%", height: "90px", objectFit: "cover", borderRadius: "6px", border: "1px solid #333", display: "block" }} />
                <button onClick={() => b.setImg("")}
                  style={{ position: "absolute", top: "6px", right: "6px", backgroundColor: "rgba(239,68,68,0.9)", border: "none", borderRadius: "50%", width: "22px", height: "22px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X size={12} />
                </button>
                <button onClick={() => b.ref.current?.click()}
                  style={{ position: "absolute", bottom: "6px", left: "6px", backgroundColor: "rgba(0,0,0,0.7)", color: "#fff", border: "none", borderRadius: "5px", padding: "4px 10px", fontSize: "11px", cursor: "pointer", fontFamily: "inherit" }}>
                  تغییر تصویر
                </button>
              </div>
            ) : (
              <button onClick={() => b.ref.current?.click()} disabled={uploadingBanner === b.num}
                style={{ width: "100%", height: "70px", backgroundColor: "#121212", border: "2px dashed #333", borderRadius: "8px", color: "#666", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "inherit", fontSize: "12px" }}>
                <Upload size={16} color="#555" />
                {uploadingBanner === b.num ? "در حال آپلود..." : "آپلود تصویر"}
              </button>
            )}
            <input value={b.img} onChange={e => b.setImg(e.target.value)}
              style={{ ...inp, fontSize: "12px", padding: "7px 10px", marginTop: "6px" }} placeholder="یا آدرس URL تصویر را وارد کنید" />
          </div>
        ))}

        {bannersSaved && <div style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "6px", padding: "10px 14px", marginBottom: "14px", color: "#10b981", fontSize: "13px" }}>✓ بنرها ذخیره شدند</div>}
        <button onClick={handleSaveBanners} disabled={savingBanners}
          style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: savingBanners ? "#a08020" : "#d4af37", color: "#000", border: "none", borderRadius: "8px", padding: "11px 24px", fontWeight: "700", fontSize: "14px", cursor: savingBanners ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {savingBanners ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
          {savingBanners ? "در حال ذخیره..." : "ذخیره بنرها"}
        </button>
      </div>

      {/* ── Typography ── */}
      <div style={{ ...cardStyle, marginTop: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <Type size={18} color="#d4af37" />
          <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: "600" }}>تایپوگرافی و فونت</h3>
        </div>
        <p style={{ color: "#666", fontSize: "12px", marginBottom: "22px" }}>
          فونت و اندازه متن را برای هر بخش از سایت جداگانه تنظیم کنید. تغییرات بلافاصله اعمال می‌شوند.
        </p>

        {TYPO_SECTIONS.map(section => {
          const fontKey = `${section.key}_font`;
          const sizeKey = `${section.key}_size`;
          const currentFont = typo[fontKey] || section.defaultFont;
          const currentSize = parseInt(typo[sizeKey] || String(section.defaultSize), 10);
          const fontObj = FONT_OPTIONS.find(f => f.id === currentFont) ?? FONT_OPTIONS[0];

          return (
            <div key={section.key} style={{ marginBottom: "24px", padding: "16px", backgroundColor: "#121212", borderRadius: "10px", border: "1px solid #2a2a2a" }}>
              {/* Section header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <div>
                  <p style={{ color: "#d4af37", fontSize: "12px", fontWeight: "700" }}>{section.label}</p>
                  <p style={{ color: "#555", fontSize: "10px", marginTop: "2px" }}>{section.description}</p>
                </div>
                <span style={{ color: "#444", fontSize: "10px", direction: "ltr" }}>{section.cssFont}</span>
              </div>

              {/* Font picker */}
              <div style={{ marginBottom: "12px" }}>
                <label style={{ color: "#888", fontSize: "11px", display: "block", marginBottom: "6px" }}>انتخاب فونت فارسی</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "6px" }}>
                  {FONT_OPTIONS.map(font => {
                    const isSelected = currentFont === font.id;
                    return (
                      <button key={font.id} type="button"
                        onClick={() => setTypo(t => ({ ...t, [fontKey]: font.id }))}
                        style={{
                          padding: "9px 8px", borderRadius: "7px",
                          border: `1px solid ${isSelected ? "#d4af37" : "#2a2a2a"}`,
                          backgroundColor: isSelected ? "rgba(212,175,55,0.12)" : "#1a1a1a",
                          cursor: "pointer", fontFamily: font.family, textAlign: "center",
                          transition: "border-color 0.15s, background-color 0.15s",
                        }}>
                        {/* Font name rendered IN that font */}
                        <p style={{ color: isSelected ? "#d4af37" : "#e0e0e0", fontSize: "14px", fontWeight: "700", marginBottom: "3px", fontFamily: font.family }}>
                          {font.label}
                        </p>
                        <p style={{ color: "#555", fontSize: "9px", fontFamily: "'Vazirmatn',sans-serif" }}>{font.style}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size slider */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <label style={{ color: "#888", fontSize: "11px", flexShrink: 0 }}>اندازه:</label>
                <input type="range" min={section.minSize} max={section.maxSize} value={currentSize}
                  onChange={e => setTypo(t => ({ ...t, [sizeKey]: e.target.value }))}
                  style={{ flex: 1, accentColor: "#d4af37" }} />
                <span style={{ color: "#d4af37", fontSize: "13px", fontWeight: "700", minWidth: "40px", direction: "ltr" }}>
                  {currentSize}px
                </span>
                <input type="number" min={section.minSize} max={section.maxSize} value={currentSize}
                  onChange={e => setTypo(t => ({ ...t, [sizeKey]: e.target.value }))}
                  style={{ width: "60px", backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "5px", padding: "4px 8px", color: "#fff", fontSize: "12px", outline: "none", direction: "ltr", textAlign: "center" }} />
              </div>

              {/* Live preview */}
              <div style={{ backgroundColor: "#0a0a0a", borderRadius: "6px", padding: "12px 16px", border: "1px solid #1e1e1e" }}>
                <p style={{ color: "#555", fontSize: "9px", marginBottom: "6px" }}>پیش‌نمایش:</p>
                <p style={{
                  fontFamily: fontObj.family,
                  fontSize: `${Math.min(currentSize, 32)}px`,
                  color: "#e0d4a0",
                  lineHeight: 1.4,
                  wordBreak: "break-word",
                }}>
                  {section.sample}
                </p>
              </div>
            </div>
          );
        })}

        {savedTypo && <div style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "6px", padding: "10px 14px", marginBottom: "14px", color: "#10b981", fontSize: "13px" }}>✓ تایپوگرافی ذخیره شد و اعمال گردید</div>}
        <button onClick={handleSaveTypography} disabled={savingTypo}
          style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: savingTypo ? "#a08020" : "#d4af37", color: "#000", border: "none", borderRadius: "8px", padding: "11px 24px", fontWeight: "700", fontSize: "14px", cursor: savingTypo ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {savingTypo ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
          {savingTypo ? "در حال ذخیره..." : "ذخیره و اعمال فونت‌ها"}
        </button>
      </div>

    </div>
  );
}
