export interface PriceBarStyle {
  labelText: string;
  labelColor: string;
  goldText: string;
  goldColor: string;
  amountColor: string;
  currencyText: string;
  currencyColor: string;
}

export const DEFAULT_PRICE_BAR_STYLE: PriceBarStyle = {
  labelText: "قیمت",
  labelColor: "#ffffff",
  goldText: "طلا",
  goldColor: "#f0c040",
  amountColor: "#f0c040",
  currencyText: "تومان",
  currencyColor: "#f0c040",
};

export function parsePriceBarStyle(data: Record<string, string | undefined>): PriceBarStyle {
  return {
    labelText: data.price_bar_label_text?.trim() || DEFAULT_PRICE_BAR_STYLE.labelText,
    labelColor: data.price_bar_label_color?.trim() || DEFAULT_PRICE_BAR_STYLE.labelColor,
    goldText: data.price_bar_gold_text?.trim() || DEFAULT_PRICE_BAR_STYLE.goldText,
    goldColor: data.price_bar_gold_color?.trim() || DEFAULT_PRICE_BAR_STYLE.goldColor,
    amountColor: data.price_bar_amount_color?.trim() || DEFAULT_PRICE_BAR_STYLE.amountColor,
    currencyText: data.price_bar_currency_text?.trim() || DEFAULT_PRICE_BAR_STYLE.currencyText,
    currencyColor: data.price_bar_currency_color?.trim() || DEFAULT_PRICE_BAR_STYLE.currencyColor,
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
  };
}
