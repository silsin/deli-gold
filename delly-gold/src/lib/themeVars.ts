/** CSS variable tokens for inline styles — use instead of hardcoded hex. */
export const c = {
  bg: "var(--theme-bg)",
  bgSecondary: "var(--theme-bg-secondary)",
  card: "var(--theme-card)",
  surface: "var(--theme-surface)",
  border: "var(--theme-border)",
  accent: "var(--theme-accent)",
  accentLight: "var(--theme-accent-light)",
  text: "var(--theme-text)",
  muted: "var(--theme-text-muted)",
} as const;

/** Accent tint for backgrounds/borders (percent = accent opacity). */
export function accentMix(percent: number) {
  return `color-mix(in srgb, var(--theme-accent) ${percent}%, transparent)`;
}

/** Background tint overlay on images. */
export function bgMix(percent: number) {
  return `color-mix(in srgb, var(--theme-bg) ${percent}%, transparent)`;
}
