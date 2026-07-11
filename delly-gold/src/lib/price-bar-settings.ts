export type PriceBarAlign = "right" | "center" | "left";

export interface PriceBarStyle {
  labelText: string;
  labelColor: string;
  goldText: string;
  goldColor: string;
  amountColor: string;
  currencyText: string;
  currencyColor: string;
  align: PriceBarAlign;
}

export const PRICE_BAR_ALIGN_OPTIONS: { id: PriceBarAlign; label: string }[] = [
  { id: "right", label: "راست" },
  { id: "center", label: "وسط" },
  { id: "left", label: "چپ" },
];

export const DEFAULT_PRICE_BAR_STYLE: PriceBarStyle = {
  labelText: "قیمت",
  labelColor: "#ffffff",
  goldText: "طلا",
  goldColor: "#f0c040",
  amountColor: "#f0c040",
  currencyText: "تومان",
  currencyColor: "#f0c040",
  align: "center",
};

function parseAlign(value: string | undefined): PriceBarAlign {
  if (value === "right" || value === "left" || value === "center") return value;
  return DEFAULT_PRICE_BAR_STYLE.align;
}

/** Horizontal placement of price bar content on RTL pages. */
export function priceBarJustifyContent(align: PriceBarAlign): "flex-start" | "center" | "flex-end" {
  switch (align) {
    case "right":
      return "flex-start";
    case "left":
      return "flex-end";
    default:
      return "center";
  }
}

export function parsePriceBarStyle(data: Record<string, string | undefined>): PriceBarStyle {
  return {
    labelText: data.price_bar_label_text?.trim() || DEFAULT_PRICE_BAR_STYLE.labelText,
    labelColor: data.price_bar_label_color?.trim() || DEFAULT_PRICE_BAR_STYLE.labelColor,
    goldText: data.price_bar_gold_text?.trim() || DEFAULT_PRICE_BAR_STYLE.goldText,
    goldColor: data.price_bar_gold_color?.trim() || DEFAULT_PRICE_BAR_STYLE.goldColor,
    amountColor: data.price_bar_amount_color?.trim() || DEFAULT_PRICE_BAR_STYLE.amountColor,
    currencyText: data.price_bar_currency_text?.trim() || DEFAULT_PRICE_BAR_STYLE.currencyText,
    currencyColor: data.price_bar_currency_color?.trim() || DEFAULT_PRICE_BAR_STYLE.currencyColor,
    align: parseAlign(data.price_bar_align),
  };
}

export function priceBarStyleToSettings(style: PriceBarStyle): Record<string, string> {
  return {
    price_bar_label_text: style.labelText,
    price_bar_label_color: style.labelColor,
    price_bar_gold_text: style.goldText,
    price_bar_gold_color: style.goldColor,
    price_bar_amount_color: style.amountColor,
    price_bar_currency_text: style.currencyText,
    price_bar_currency_color: style.currencyColor,
    price_bar_align: style.align,
  };
}
