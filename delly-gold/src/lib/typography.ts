/**
 * Typography system — fonts and sizes per section.
 * All values are stored as settings keys and applied via CSS variables.
 */

export interface FontOption {
  id: string;       // Google Fonts family name (URL-safe)
  label: string;    // Persian display label
  family: string;   // CSS font-family value
  persian: boolean; // supports Persian/Arabic glyphs
  weights: number[];
}

export const FONT_OPTIONS: FontOption[] = [
  // ── Persian fonts ─────────────────────────────────────────────
  {
    id: "Vazirmatn",
    label: "وزیرمتن (پیش‌فرض)",
    family: "'Vazirmatn', sans-serif",
    persian: true,
    weights: [300, 400, 500, 600, 700, 800, 900],
  },
  {
    id: "Sahel",
    label: "ساحل",
    family: "'Sahel', sans-serif",
    persian: true,
    weights: [400, 700],
  },
  {
    id: "Lalezar",
    label: "لاله‌زار",
    family: "'Lalezar', cursive",
    persian: true,
    weights: [400],
  },
  {
    id: "Estedad",
    label: "استعداد",
    family: "'Estedad', sans-serif",
    persian: true,
    weights: [300, 400, 500, 700, 900],
  },
  {
    id: "Noto+Naskh+Arabic",
    label: "نسخ عربی",
    family: "'Noto Naskh Arabic', serif",
    persian: true,
    weights: [400, 500, 600, 700],
  },
  {
    id: "Amiri",
    label: "امیری (سنتی)",
    family: "'Amiri', serif",
    persian: true,
    weights: [400, 700],
  },
  // ── Latin / decorative ────────────────────────────────────────
  {
    id: "Playfair+Display",
    label: "Playfair Display",
    family: "'Playfair Display', serif",
    persian: false,
    weights: [400, 500, 600, 700, 800, 900],
  },
  {
    id: "Cormorant+Garamond",
    label: "Cormorant Garamond",
    family: "'Cormorant Garamond', serif",
    persian: false,
    weights: [300, 400, 500, 600, 700],
  },
  {
    id: "Cinzel",
    label: "Cinzel",
    family: "'Cinzel', serif",
    persian: false,
    weights: [400, 500, 600, 700, 800, 900],
  },
  {
    id: "Montserrat",
    label: "Montserrat",
    family: "'Montserrat', sans-serif",
    persian: false,
    weights: [300, 400, 500, 600, 700, 800, 900],
  },
  {
    id: "Inter",
    label: "Inter",
    family: "'Inter', sans-serif",
    persian: false,
    weights: [300, 400, 500, 600, 700, 800, 900],
  },
  {
    id: "DM+Serif+Display",
    label: "DM Serif Display",
    family: "'DM Serif Display', serif",
    persian: false,
    weights: [400],
  },
];

/** Typography sections — each maps to a CSS variable pair (font + size) */
export interface TypoSection {
  key: string;         // settings key prefix
  label: string;       // Persian label
  description: string;
  cssFont: string;     // CSS variable name for font-family
  cssSize: string;     // CSS variable name for font-size
  defaultFont: string; // FontOption id
  defaultSize: number; // px
  minSize: number;
  maxSize: number;
  sample: string;      // sample text for preview
}

export const TYPO_SECTIONS: TypoSection[] = [
  {
    key: "typo_body",
    label: "متن اصلی سایت",
    description: "متن‌های معمول، توضیحات، لیست‌ها",
    cssFont: "--font-body",
    cssSize: "--font-size-body",
    defaultFont: "Vazirmatn",
    defaultSize: 14,
    minSize: 12,
    maxSize: 20,
    sample: "دلی گلد — فروشگاه طلا و جواهر با بهترین کیفیت",
  },
  {
    key: "typo_heading",
    label: "عناوین اصلی",
    description: "تیترهای بخش‌ها، h1، h2",
    cssFont: "--font-heading",
    cssSize: "--font-size-heading",
    defaultFont: "Vazirmatn",
    defaultSize: 28,
    minSize: 18,
    maxSize: 60,
    sample: "جدیدترین طلاهای دلی گلد",
  },
  {
    key: "typo_product",
    label: "نام محصولات",
    description: "نام محصول در کارت‌ها و صفحه محصول",
    cssFont: "--font-product",
    cssSize: "--font-size-product",
    defaultFont: "Vazirmatn",
    defaultSize: 13,
    minSize: 11,
    maxSize: 20,
    sample: "گردنبند قلبی طلا ۱۸ عیار",
  },
  {
    key: "typo_price",
    label: "قیمت و اعداد",
    description: "قیمت محصولات، قیمت طلا، ارقام",
    cssFont: "--font-price",
    cssSize: "--font-size-price",
    defaultFont: "Vazirmatn",
    defaultSize: 15,
    minSize: 12,
    maxSize: 24,
    sample: "۱۷٬۵۹۵٬۰۰۰ تومان",
  },
  {
    key: "typo_nav",
    label: "منو و ناوبری",
    description: "لینک‌های هدر، دسته‌بندی‌ها",
    cssFont: "--font-nav",
    cssSize: "--font-size-nav",
    defaultFont: "Vazirmatn",
    defaultSize: 13,
    minSize: 11,
    maxSize: 18,
    sample: "گردنبند · انگشتر · دستبند",
  },
  {
    key: "typo_slider",
    label: "متن اسلایدر",
    description: "تیتر و زیرنویس اسلایدهای صفحه اصلی",
    cssFont: "--font-slider",
    cssSize: "--font-size-slider",
    defaultFont: "Vazirmatn",
    defaultSize: 48,
    minSize: 24,
    maxSize: 80,
    sample: "جدیدترین طلاها",
  },
];

/** Build Google Fonts URL for a set of font IDs */
export function buildGoogleFontsUrl(fontIds: string[]): string {
  const unique = [...new Set(fontIds.filter(Boolean))];
  if (unique.length === 0) return "";
  const families = unique.map(id => {
    const opt = FONT_OPTIONS.find(f => f.id === id);
    if (!opt) return null;
    const wts = opt.weights.join(";");
    return `family=${id}:wght@${wts}`;
  }).filter(Boolean);
  if (families.length === 0) return "";
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}

/** Default settings record */
export function getDefaultTypoSettings(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const s of TYPO_SECTIONS) {
    out[`${s.key}_font`] = s.defaultFont;
    out[`${s.key}_size`] = String(s.defaultSize);
  }
  return out;
}

export function getFontFamily(fontId: string): string {
  return FONT_OPTIONS.find(f => f.id === fontId)?.family ?? "'Vazirmatn', sans-serif";
}
