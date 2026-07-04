"use client";
/**
 * ThemeLoader — runs once on mount, fetches settings from API,
 * then applies CSS variables for typography + theme palette.
 * Injects a <link> into <head> for Google Fonts.
 */
import { useEffect } from "react";
import { TYPO_SECTIONS, buildGoogleFontsUrl, getFontFamily, getDefaultTypoSettings } from "@/lib/typography";
import { applyTheme, parseThemeSettings } from "@/lib/theme";

let applied = false; // prevent double-fetch on React strict mode

export default function ThemeLoader() {
  useEffect(() => {
    if (applied) return;
    applied = true;

    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(d => {
        if (!d.success) return;
        const data: Record<string, string> = d.data;

        // ── 1. Apply palette + legacy font sizes ──────────────────────
        const themeSettings = parseThemeSettings(data);
        applyTheme(themeSettings);

        // ── 2. Apply typography CSS variables ────────────────────────
        const root = document.documentElement;
        const defaults = getDefaultTypoSettings();
        const fontIds: string[] = [];

        for (const section of TYPO_SECTIONS) {
          const fontId = data[`${section.key}_font`] || defaults[`${section.key}_font`];
          const size   = data[`${section.key}_size`] || defaults[`${section.key}_size`];

          root.style.setProperty(section.cssFont, getFontFamily(fontId));
          root.style.setProperty(section.cssSize, `${size}px`);
          fontIds.push(fontId);
        }

        // ── 3. Inject Google Fonts ────────────────────────────────────
        const url = buildGoogleFontsUrl(fontIds);
        if (url) {
          // Remove any existing dynamic font link
          const existing = document.getElementById("dynamic-gfonts");
          if (existing) existing.remove();

          const link = document.createElement("link");
          link.id   = "dynamic-gfonts";
          link.rel  = "stylesheet";
          link.href = url;
          document.head.appendChild(link);
        }
      })
      .catch(() => {});
  }, []);

  return null;
}
