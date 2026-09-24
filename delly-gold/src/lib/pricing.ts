/**
 * Shared pricing helpers — used on both server (API) and client (components)
 */

export interface AjratSettings {
  gold_markup_percent: string;
  gold_fixed_fee: string;
  /**
   * Tax % charged on the اجرت (wage + profit) part only — the gold-trade rule
   * «مالیات تنها بر روی سود و اجرت اخذ می‌گردد». Optional: when missing/0 the
   * result is identical to the pre-tax formula.
   */
  gold_tax_percent?: string;
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
 *   tax   = ajrat × (taxPct / 100)          — only when gold_tax_percent > 0
 *
 * Returns the final price = base + ajrat + tax.
 */
export function calcFinalPrice(
  product: ProductPricingInput,
  globalSettings: AjratSettings
): { ajrat: number; tax: number; taxPct: number; finalPrice: number; markupPct: number; fixedFee: number; isOverride: boolean } {
  const isOverride = product.ajrat_override === 1;

  const markupPct = isOverride && product.ajrat_percent !== null
    ? product.ajrat_percent
    : parseFloat(globalSettings.gold_markup_percent) || 0;

  const fixedFee = isOverride && product.ajrat_fixed !== null
    ? product.ajrat_fixed
    : parseFloat(globalSettings.gold_fixed_fee) || 0;

  const taxPct = parseFloat(globalSettings.gold_tax_percent ?? "") || 0;

  const ajrat = Math.round(product.price * (markupPct / 100) + fixedFee * product.weight);
  const tax = taxPct > 0 ? Math.round(ajrat * (taxPct / 100)) : 0;
  const finalPrice = product.price + ajrat + tax;

  return { ajrat, tax, taxPct, finalPrice, markupPct, fixedFee, isOverride };
}
