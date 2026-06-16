/**
 * Shared pricing helpers — used on both server (API) and client (components)
 */

export interface AjratSettings {
  gold_markup_percent: string;
  gold_fixed_fee: string;
}

export interface ProductPricingInput {
  price: number;          // base price (total, not per-gram)
  weight: number;         // grams
  ajrat_override: number; // 1 = use product-specific values
  ajrat_percent: number | null;
  ajrat_fixed: number | null;
}

/**
 * Calculate the اجرت (wage/fee) amount for a product.
 * Formula:
 *   ajrat = price × (markupPct / 100) + fixedFeePerGram × weight
 *
 * Returns the final price = base + ajrat.
 */
export function calcFinalPrice(
  product: ProductPricingInput,
  globalSettings: AjratSettings
): { ajrat: number; finalPrice: number; markupPct: number; fixedFee: number; isOverride: boolean } {
  const isOverride = product.ajrat_override === 1;

  const markupPct = isOverride && product.ajrat_percent !== null
    ? product.ajrat_percent
    : parseFloat(globalSettings.gold_markup_percent) || 0;

  const fixedFee = isOverride && product.ajrat_fixed !== null
    ? product.ajrat_fixed
    : parseFloat(globalSettings.gold_fixed_fee) || 0;

  const ajrat = Math.round(product.price * (markupPct / 100) + fixedFee * product.weight);
  const finalPrice = product.price + ajrat;

  return { ajrat, finalPrice, markupPct, fixedFee, isOverride };
}
