/** Normalize Iranian phone numbers to 11-digit format starting with 09 */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (/^09\d{9}$/.test(digits)) return digits;
  if (/^98\d{10}$/.test(digits)) return "0" + digits.slice(2);
  return null;
}
