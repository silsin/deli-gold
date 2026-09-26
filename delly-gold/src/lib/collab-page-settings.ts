export interface CollabCard {
  title: string;
  desc: string;
}

export interface CollabFaqItem {
  q: string;
  a: string;
}

export interface CollabPageSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  introTitle: string;
  introSubtitle: string;
  cards: CollabCard[];
  stepsTitle: string;
  stepsSubtitle: string;
  steps: string[];
  perksTitle: string;
  perksSubtitle: string;
  perks: string[];
  formTitle: string;
  formSubtitle: string;
  faqTitle: string;
  faqSubtitle: string;
  faq: CollabFaqItem[];
}

export const COLLAB_PAGE_SETTING_KEY = "collab_page_json";

export const DEFAULT_COLLAB_PAGE_SETTINGS: CollabPageSettings = {
  heroTitle: "همکاری با ما",
  heroSubtitle: "دلی گلد از همکاری با فروشندگان، بنکداران، طراحان و فعالان حوزه طلا و جواهر استقبال می‌کند",
  heroImage: "",
  introTitle: "روش‌های همکاری",
  introSubtitle: "یکی از مسیرهای زیر را انتخاب کنید و فرم درخواست را ارسال نمایید",
  cards: [
    { title: "فروش عمده", desc: "خرید عمده محصولات دلی گلد با شرایط ویژه برای فروشگاه‌ها و گالری‌ها" },
    { title: "نمایندگی فروش", desc: "نمایندگی رسمی فروش محصولات دلی گلد در شهر خود را دریافت کنید" },
    { title: "تأمین و تولید", desc: "اگر تولیدکننده یا بنکدار طلا هستید، محصولات خود را به ما معرفی کنید" },
    { title: "تبلیغات و معرفی", desc: "همکاری تبلیغاتی با بلاگرها، اینفلوئنسرها و رسانه‌های حوزه طلا و مد" },
  ],
  stepsTitle: "مراحل شروع همکاری",
  stepsSubtitle: "",
  steps: [
    "فرم درخواست همکاری را تکمیل و ارسال کنید",
    "کارشناسان ما درخواست شما را بررسی می‌کنند",
    "در صورت تأیید، برای گفت‌وگو و عقد قرارداد با شما تماس می‌گیریم",
  ],
  perksTitle: "چرا دلی گلد؟",
  perksSubtitle: "",
  perks: [
    "طلای ۱۸ عیار با فاکتور رسمی و ضمانت اصالت",
    "قیمت‌گذاری شفاف بر اساس نرخ روز طلا",
    "پشتیبانی اختصاصی شرکای تجاری",
    "ارسال سریع و بیمه‌شده به سراسر کشور",
  ],
  formTitle: "فرم درخواست همکاری",
  formSubtitle: "مشخصات خود را وارد کنید تا کارشناسان ما با شما تماس بگیرند",
  faqTitle: "سؤالات متداول",
  faqSubtitle: "",
  faq: [
    {
      q: "بررسی درخواست همکاری چقدر طول می‌کشد؟",
      a: "معمولاً ظرف ۲ تا ۳ روز کاری درخواست شما بررسی می‌شود و نتیجه از طریق تماس یا پیامک اطلاع‌رسانی می‌گردد.",
    },
    {
      q: "برای همکاری به چه مدارکی نیاز است؟",
      a: "پس از ثبت درخواست، کارشناسان ما مدارک لازم متناسب با نوع همکاری را به شما اعلام می‌کنند.",
    },
  ],
};

function normalizeCard(item: unknown): CollabCard | null {
  if (!item || typeof item !== "object") return null;
  const o = item as Record<string, unknown>;
  return {
    title: String(o.title ?? "").trim(),
    desc: String(o.desc ?? "").trim(),
  };
}

function normalizeFaq(item: unknown): CollabFaqItem | null {
  if (!item || typeof item !== "object") return null;
  const o = item as Record<string, unknown>;
  return {
    q: String(o.q ?? "").trim(),
    a: String(o.a ?? "").trim(),
  };
}

function pickList<T>(
  data: Record<string, unknown>,
  key: string,
  fallback: T[],
  normalize: (item: unknown) => T | null,
  keepIfAny: (item: T) => boolean
): T[] {
  const raw = data[key];
  if (!Array.isArray(raw)) return fallback.map(v => ({ ...(v as object) })) as T[];
  return raw.map(normalize).filter((v): v is T => !!v && keepIfAny(v));
}

export function parseCollabPageSettings(raw: string | undefined | null): CollabPageSettings {
  const d = DEFAULT_COLLAB_PAGE_SETTINGS;
  const fallback = (): CollabPageSettings => ({
    ...d,
    cards: d.cards.map(c => ({ ...c })),
    steps: [...d.steps],
    perks: [...d.perks],
    faq: d.faq.map(f => ({ ...f })),
  });
  if (!raw?.trim()) return fallback();
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    const str = (key: keyof CollabPageSettings): string =>
      typeof data[key] === "string" ? (data[key] as string).trim() : (d[key] as string);
    return {
      heroTitle: str("heroTitle"),
      heroSubtitle: str("heroSubtitle"),
      heroImage: str("heroImage"),
      introTitle: str("introTitle"),
      introSubtitle: str("introSubtitle"),
      cards: pickList(data, "cards", d.cards, normalizeCard, c => !!(c.title || c.desc)),
      stepsTitle: str("stepsTitle"),
      stepsSubtitle: str("stepsSubtitle"),
      steps: Array.isArray(data.steps)
        ? data.steps.map(v => String(v ?? "").trim()).filter(Boolean)
        : [...d.steps],
      perksTitle: str("perksTitle"),
      perksSubtitle: str("perksSubtitle"),
      perks: Array.isArray(data.perks)
        ? data.perks.map(v => String(v ?? "").trim()).filter(Boolean)
        : [...d.perks],
      formTitle: str("formTitle"),
      formSubtitle: str("formSubtitle"),
      faqTitle: str("faqTitle"),
      faqSubtitle: str("faqSubtitle"),
      faq: pickList(data, "faq", d.faq, normalizeFaq, f => !!(f.q || f.a)),
    };
  } catch {
    return fallback();
  }
}

export function serializeCollabPageSettings(settings: CollabPageSettings): string {
  return JSON.stringify(settings);
}
