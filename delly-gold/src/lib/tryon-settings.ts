/** Whether virtual try-on (پرو مجازی) is visible on the storefront. */
export function isTryonEnabled(value: string | undefined | null): boolean {
  return value !== "0";
}

export function filterTryonNavLinks<T extends { href: string }>(links: T[], enabled: boolean): T[] {
  if (enabled) return links;
  return links.filter(l => !l.href.startsWith("/tryon"));
}
