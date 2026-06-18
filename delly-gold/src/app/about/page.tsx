import { Shield, Award, Truck, Users } from "lucide-react";
import PageLayout from "../components/PageLayout";

const stats = [
  { value: "۱۰+", label: "سال تجربه" },
  { value: "۵۰۰۰+", label: "مشتری راضی" },
  { value: "۱۰۰۰+", label: "طرح منحصربه‌فرد" },
  { value: "۲۴/۷", label: "پشتیبانی" },
];

const values = [
  { icon: <Shield size={28} />, title: "اصالت تضمین‌شده", desc: "تمامی محصولات با فاکتور رسمی و گارانتی اصالت ارائه می‌شوند." },
  { icon: <Award size={28} />, title: "کیفیت برتر", desc: "استفاده از بهترین مواد اولیه و استادان ماهر در تولید." },
  { icon: <Truck size={28} />, title: "ارسال ایمن", desc: "بسته‌بندی اختصاصی و ارسال بیمه‌شده به سراسر ایران." },
  { icon: <Users size={28} />, title: "رضایت مشتری", desc: "تیم پشتیبانی متخصص همیشه آماده پاسخگویی است." },
];

const team = [
  { name: "علی حسینی", role: "مدیرعامل", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80" },
  { name: "زهرا کریمی", role: "طراح ارشد", image: "https://images.unsplash.com/photo-1494790108755-2616b612b5c5?w=300&q=80" },
  { name: "رضا محمدی", role: "مدیر فروش", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80" },
];

export default function AboutPage() {
  return (
    <PageLayout>
      {/* Hero */}
      <div style={{ position: "relative", height: 320, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1400&q=80)`, backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.25)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, color-mix(in srgb, var(--theme-accent) 15%, transparent), transparent)" }} />
        <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto", padding: "0 16px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          <div style={{ color: "var(--theme-accent)", fontSize: 36, fontWeight: 900, letterSpacing: -2, marginBottom: 8 }}>DG</div>
          <div style={{ color: "var(--theme-accent)", fontSize: 12, letterSpacing: 4, marginBottom: 16 }}>DELLY GOLD</div>
          <h1 style={{ color: "var(--theme-text)", fontSize: 32, fontWeight: 800, marginBottom: 10 }}>درباره دلی گلد</h1>
          <p style={{ color: "var(--theme-text-muted)", fontSize: 15, maxWidth: 500 }}>زیبایی ماندگار در هر لحظه از زندگی شما</p>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "56px 16px" }}>

        {/* Story */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginBottom: 72, alignItems: "center" }} className="story-grid">
          <div>
            <div style={{ width: 40, height: 3, backgroundColor: "var(--theme-accent)", marginBottom: 16 }} />
            <h2 style={{ color: "var(--theme-text)", fontSize: 28, fontWeight: 700, marginBottom: 16 }}>داستان ما</h2>
            <p style={{ color: "var(--theme-text-muted)", fontSize: 14, lineHeight: 2, marginBottom: 16 }}>
              دلی گلد در سال ۱۳۹۴ با یک رویا آغاز شد — رویایی که طلا را به همه دسترس‌پذیر کند. از یک فروشگاه کوچک در تهران، به یک برند معتبر آنلاین تبدیل شدیم.
            </p>
            <p style={{ color: "var(--theme-text-muted)", fontSize: 14, lineHeight: 2 }}>
              امروز با بیش از ۵ هزار مشتری وفادار و صدها طرح منحصربه‌فرد، افتخار می‌کنیم که یکی از معتمدترین فروشگاه‌های طلا آنلاین ایران هستیم.
            </p>
          </div>
          <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--theme-border)" }}>
            <img src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=700&q=80" alt="درباره دلی گلد" style={{ width: "100%", height: 320, objectFit: "cover", display: "block" }} />
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 72 }} className="stats-grid">
          {stats.map((s, i) => (
            <div key={i} style={{ backgroundColor: "var(--theme-card)", border: "1px solid var(--theme-border)", borderRadius: 12, padding: "28px 20px", textAlign: "center" }}>
              <p style={{ color: "var(--theme-accent)", fontSize: 32, fontWeight: 900, marginBottom: 6 }}>{s.value}</p>
              <p style={{ color: "var(--theme-text-muted)", fontSize: 13 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div style={{ marginBottom: 72 }}>
          <h2 style={{ color: "var(--theme-text)", fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>ارزش‌های ما</h2>
          <p style={{ color: "var(--theme-text-muted)", fontSize: 14, textAlign: "center", marginBottom: 36 }}>آنچه ما را متمایز می‌کند</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} className="values-grid">
            {values.map((v, i) => (
              <div key={i} style={{ backgroundColor: "var(--theme-card)", border: "1px solid var(--theme-border)", borderRadius: 12, padding: 24, textAlign: "center" }}>
                <div style={{ width: 56, height: 56, backgroundColor: "color-mix(in srgb, var(--theme-accent) 10%, transparent)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--theme-accent)" }}>
                  {v.icon}
                </div>
                <h3 style={{ color: "var(--theme-text)", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{v.title}</h3>
                <p style={{ color: "var(--theme-text-muted)", fontSize: 12, lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div>
          <h2 style={{ color: "var(--theme-text)", fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>تیم ما</h2>
          <p style={{ color: "var(--theme-text-muted)", fontSize: 14, textAlign: "center", marginBottom: 36 }}>افراد پشت دلی گلد</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, maxWidth: 700, margin: "0 auto" }} className="team-grid">
            {team.map((m, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ width: 100, height: 100, borderRadius: "50%", overflow: "hidden", margin: "0 auto 12px", border: "3px solid var(--theme-accent)" }}>
                  <img src={m.image} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <h3 style={{ color: "var(--theme-text)", fontSize: 15, fontWeight: 700 }}>{m.name}</h3>
                <p style={{ color: "var(--theme-accent)", fontSize: 12 }}>{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .story-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .values-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .team-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PageLayout>
  );
}
