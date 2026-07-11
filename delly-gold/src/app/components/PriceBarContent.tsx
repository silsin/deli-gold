import {
  priceBarJustifyContent,
  type PriceBarPartId,
  type PriceBarStyle,
} from "@/lib/price-bar-settings";

function renderPart(
  part: PriceBarPartId,
  style: PriceBarStyle,
  amount: string,
  fontSize: string,
) {
  switch (part) {
    case "label":
      return (
        <span key="label" style={{ color: style.labelColor }}>
          {style.labelText}
        </span>
      );
    case "gold":
      return (
        <span key="gold" style={{ color: style.goldColor, fontWeight: 800, fontSize: "13px" }}>
          {style.goldText}
        </span>
      );
    case "amount":
      return (
        <span
          key="amount"
          dir="ltr"
          style={{
            display: "inline-flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "4px",
            direction: "ltr",
            unicodeBidi: "isolate",
            fontWeight: 800,
            fontSize,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: style.labelColor }}>:</span>
          <span style={{ color: style.amountColor }}>{amount}</span>
        </span>
      );
    case "currency":
      return (
        <span key="currency" style={{ color: style.currencyColor, fontWeight: 800, fontSize }}>
          {style.currencyText}
        </span>
      );
    default:
      return null;
  }
}

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
            flexWrap: "wrap",
          }}
        >
          {style.partOrder.map(part => renderPart(part, style, amount, fontSize))}
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
