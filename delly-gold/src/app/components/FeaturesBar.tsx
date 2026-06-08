import { Truck, ShieldCheck, Clock, Headphones } from "lucide-react";

const features = [
  {
    icon: <Headphones size={28} color="#d4af37" />,
    title: "خرید آسان و مطمئن",
    desc: "با پشتیبانی ۲۴/۷",
  },
  {
    icon: <ShieldCheck size={28} color="#d4af37" />,
    title: "ضمانت اصالت کالا",
    desc: "همراه با فاکتور معتبر",
  },
  {
    icon: <Truck size={28} color="#d4af37" />,
    title: "ارسال امن و سریع",
    desc: "به سراسر ایران",
  },
  {
    icon: <Clock size={28} color="#d4af37" />,
    title: "قیمت روز طلا",
    desc: "آپدیت لحظه‌ای",
  },
];

export default function FeaturesBar() {
  return (
    <section
      style={{
        backgroundColor: "#161616",
        borderTop: "1px solid #2a2a2a",
        borderBottom: "1px solid #2a2a2a",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 16px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "0",
        }}
      >
        {features.map((f, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "20px 24px",
              borderLeft: i < features.length - 1 ? "1px solid #2a2a2a" : "none",
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: "48px",
                height: "48px",
                backgroundColor: "rgba(212,175,55,0.1)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {f.icon}
            </div>
            <div>
              <p
                style={{
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "14px",
                  marginBottom: "2px",
                }}
              >
                {f.title}
              </p>
              <p style={{ color: "#888", fontSize: "12px" }}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .features-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
