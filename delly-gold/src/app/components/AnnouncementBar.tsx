"use client";

export default function AnnouncementBar() {
  return (
    <div style={{
      backgroundColor: "#c0392b",
      height: "42px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative lines */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 40px)", pointerEvents: "none" }} />

      <p style={{
        color: "#fff",
        fontSize: "14px",
        fontWeight: "700",
        letterSpacing: "0.3px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        zIndex: 1,
      }}>
        <span style={{ color: "#f5c6c0", fontSize: "16px" }}>♥</span>
        با اعتماد شما، سال‌ها طلایی ساختیم.
        <span style={{ color: "#f5c6c0", fontSize: "16px" }}>♥</span>
      </p>
    </div>
  );
}
