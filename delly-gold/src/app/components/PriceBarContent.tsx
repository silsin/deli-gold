import PriceBarAmount from "./PriceBarAmount";
import {
  priceBarJustifyContent,
  type PriceBarStyle,
} from "@/lib/price-bar-settings";

export default function PriceBarContent({
  style,
  amount,
  fontSize = "12px",
  showDecorations = true,
}: {
  style: PriceBarStyle;
  amount: string;
  fontSize?: string;
  showDecorations?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: priceBarJustifyContent(style.align),
        direction: "rtl",
        width: "100%",
        gap: "10px",
        zIndex: 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {showDecorations && (
          <>
            <span style={{ color: "#c8a12a", fontSize: "14px", opacity: 0.9 }}>✦</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#c8a12a" opacity={0.85} aria-hidden>
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
            </svg>
          </>
        )}

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            flexDirection: "row",
            direction: "rtl",
            gap: "4px",
            fontSize,
            fontWeight: "500",
            letterSpacing: "0.3px",
          }}
        >
          <span style={{ color: style.labelColor }}>{style.labelText}</span>
          <span style={{ color: style.goldColor, fontWeight: "800", fontSize: "13px" }}>{style.goldText}</span>
          <PriceBarAmount amount={amount} style={style} fontSize={fontSize === "12px" ? "12px" : fontSize} />
        </span>

        {showDecorations && (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#c8a12a" opacity={0.85} aria-hidden>
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
            </svg>
            <span style={{ color: "#c8a12a", fontSize: "14px", opacity: 0.9 }}>✦</span>
          </>
        )}
      </div>
    </div>
  );
}
