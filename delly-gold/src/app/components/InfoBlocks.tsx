"use client";
import { useState } from "react";
import { Calculator, TrendingUp, BookOpen, Gift } from "lucide-react";
import Link from "next/link";

export default function InfoBlocks() {
  const [grams, setGrams] = useState("");
  const goldPricePerGram = 6185000;

  const calculated = grams
    ? (parseFloat(grams) * goldPricePerGram).toLocaleString("fa-IR")
    : null;

  return (
    <section style={{ maxWidth: "1280px", margin: "40px auto", padding: "0 16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }} className="info-grid">

        {/* Gold Price Calculator */}
        <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "40px", height: "40px", backgroundColor: "rgba(212,175,55,0.15)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Calculator size={20} color="#d4af37" />
            </div>
            <div>
              <p style={{ color: "#888", fontSize: "11px" }}>ماشین حساب طلا</p>
              <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: "700" }}>محاسبه قیمت طلا</h3>
            </div>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "6px" }}>وزن طلا (گرم)</label>
            <input type="number" value={grams} onChange={e => setGrams(e.target.value)} placeholder="مثال: ۲.۵" min="0"
              style={{ width: "100%", backgroundColor: "#121212", border: "1px solid #333", borderRadius: "6px", padding: "10px 12px", color: "#fff", fontSize: "14px", outline: "none", direction: "ltr" }} />
          </div>

          {calculated && (
            <div style={{ backgroundColor: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "6px", padding: "10px 12px", marginBottom: "12px", textAlign: "center" }}>
              <p style={{ color: "#888", fontSize: "11px", marginBottom: "4px" }}>قیمت تخمینی</p>
              <p style={{ color: "#d4af37", fontSize: "16px", fontWeight: "700" }}>{calculated} تومان</p>
            </div>
          )}

          <Link href="/products" style={{ display: "block", width: "100%", backgroundColor: "#d4af37", color: "#000", border: "none", borderRadius: "6px", padding: "10px", fontWeight: "700", fontSize: "14px", cursor: "pointer", textAlign: "center", textDecoration: "none" }}>
            مشاهده محصولات
          </Link>
        </div>

        {/* Live Gold Price */}
        <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "40px", height: "40px", backgroundColor: "rgba(212,175,55,0.15)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={20} color="#d4af37" />
            </div>
            <div>
              <p style={{ color: "#888", fontSize: "11px" }}>آپدیت لحظه‌ای</p>
              <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: "700" }}>قیمت لحظه‌ای طلا</h3>
            </div>
          </div>

          {/* Mini chart */}
          <div style={{ flex: 1, backgroundColor: "#121212", borderRadius: "8px", padding: "12px", marginBottom: "16px", minHeight: "80px", display: "flex", alignItems: "flex-end", gap: "4px" }}>
            {[40, 55, 45, 65, 50, 70, 60, 75, 65, 80, 70, 85].map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${h}%`, backgroundColor: i === 11 ? "#d4af37" : "rgba(212,175,55,0.3)", borderRadius: "2px 2px 0 0" }} />
            ))}
          </div>

          <div style={{ textAlign: "center", marginBottom: "12px" }}>
            <p style={{ color: "#888", fontSize: "12px", marginBottom: "4px" }}>هر گرم ۱۸ عیار</p>
            <p style={{ color: "#d4af37", fontSize: "24px", fontWeight: "800" }}>۶,۱۸۵,۰۰۰</p>
            <p style={{ color: "#888", fontSize: "12px" }}>تومان</p>
          </div>

          <Link href="/products" style={{ display: "block", textAlign: "center", backgroundColor: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", color: "#d4af37", borderRadius: "6px", padding: "8px", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
            خرید طلا با قیمت روز
          </Link>
        </div>

        {/* Buy Guide + Gift */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Buy Guide — links to contact */}
          <Link href="/contact" style={{ textDecoration: "none", backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "20px", flex: 1, display: "block", transition: "border-color 0.2s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "#d4af37"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a"}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <div style={{ width: "36px", height: "36px", backgroundColor: "rgba(212,175,55,0.15)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BookOpen size={18} color="#d4af37" />
              </div>
              <div>
                <p style={{ color: "#888", fontSize: "11px" }}>راهنمای خرید</p>
                <h3 style={{ color: "#fff", fontSize: "14px", fontWeight: "700" }}>راهنمای خرید طلا</h3>
              </div>
            </div>
            <p style={{ color: "#888", fontSize: "12px", lineHeight: "1.7", marginBottom: "12px" }}>نکات مهم قبل از خرید از زیبایی و اعتماد</p>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#d4af37", fontSize: "12px", fontWeight: "600", border: "1px solid rgba(212,175,55,0.3)", padding: "6px 12px", borderRadius: "6px", backgroundColor: "rgba(212,175,55,0.08)" }}>
              مطالعه کنید
            </span>
          </Link>

          {/* Gift packaging — links to about */}
          <Link href="/about" style={{ textDecoration: "none", backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "20px", flex: 1, display: "flex", alignItems: "center", gap: "14px", transition: "border-color 0.2s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "#d4af37"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a"}>
            <div style={{ width: "50px", height: "50px", backgroundColor: "rgba(212,175,55,0.15)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Gift size={24} color="#d4af37" />
            </div>
            <div>
              <h3 style={{ color: "#fff", fontSize: "14px", fontWeight: "700", marginBottom: "4px" }}>بسته‌بندی شیک</h3>
              <p style={{ color: "#888", fontSize: "12px", lineHeight: "1.6" }}>هدیه‌ای به یاد ماندگار</p>
              <span style={{ color: "#d4af37", fontSize: "11px", marginTop: "6px", display: "block" }}>بیشتر بدانید ←</span>
            </div>
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .info-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
