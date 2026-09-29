"use client";

import { useEffect, useState } from "react";

/**
 * Splash screen — covers the very first paint of a hard (full-page) load so the
 * shopper never watches the homepage assemble itself section by section.
 *
 * How it knows when to get out of the way:
 *   1. the document finished loading (fonts, hero images, ...),
 *   2. a short minimum time so the brand moment is actually seen,
 *   3. no component is still fetching — any component that gates its content
 *      renders `<span data-dg-pending />` while it waits (see HomeSections /
 *      HeroSlider), and this polls for those markers.
 *
 * A hard 5s cap guarantees the splash can never trap the user, even if a
 * section never resolves. It is rendered once by the root layout, so
 * client-side navigations never re-run it; re-showing within SESSION_TTL is
 * skipped so a quick refresh does not add friction.
 */

const MIN_MS = 1100;      // let the brand mark breathe
const POLL_MS = 120;      // how often we look for pending markers
const MAX_MS = 5000;      // hard escape hatch
const SESSION_TTL = 30_000;

const LAST_SHOWN_KEY = "dg_splash_shown_at";

export default function SplashScreen() {
  // Rendered in the SSR HTML on purpose: starting mounted means the very first
  // paint is already covered, so the shopper never sees the empty page that the
  // section-by-section fetch would otherwise expose. The effect below decides
  // whether to keep it up or drop it immediately.
  const [mounted, setMounted] = useState(true);
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let freshVisit = true;
    try {
      const last = Number(sessionStorage.getItem(LAST_SHOWN_KEY) || 0);
      freshVisit = Date.now() - last > SESSION_TTL;
    } catch {
      freshVisit = true; // private mode — always show
    }

    // Seen it moments ago (a quick refresh) — drop it without any animation.
    if (freshVisit) {
      try {
        sessionStorage.setItem(LAST_SHOWN_KEY, String(Date.now()));
      } catch { /* ignore */ }
    }

    // Lock scrolling while the splash is up, restore exactly what was there.
    const previousOverflow = document.body.style.overflow;
    if (freshVisit) document.body.style.overflow = "hidden";

    const started = Date.now();
    let done = false;
    const finish = (immediate: boolean) => {
      if (done) return;
      done = true;
      document.body.style.overflow = previousOverflow;
      if (immediate) {
        setVisible(false);
        setMounted(false);
        return;
      }
      setLeaving(true);
      setTimeout(() => {
        setVisible(false);
        setMounted(false);
      }, 450); // let the fade-out play before unmounting
    };

    const check = () => {
      if (done) return;
      if (!freshVisit) {
        finish(true);
        return;
      }
      const elapsed = Date.now() - started;
      const windowLoaded = document.readyState === "complete";
      const stillLoading = document.querySelector("[data-dg-pending]") !== null;

      if (elapsed >= MAX_MS || (windowLoaded && elapsed >= MIN_MS && !stillLoading)) {
        finish(false);
        return;
      }
      setTimeout(check, POLL_MS);
    };

    // Runs on a timer, so the state update is never synchronous inside the effect.
    const timer = setTimeout(check, 0);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!mounted || !visible) return null;

  return (
    <div
      aria-hidden={leaving}
      role="status"
      aria-label="در حال بارگذاری فروشگاه"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 22,
        background:
          "radial-gradient(120% 90% at 50% 0%, #2a241c 0%, #14110d 55%, #0b0907 100%)",
        opacity: leaving ? 0 : 1,
        transition: "opacity 0.45s ease",
        pointerEvents: leaving ? "none" : "auto",
      }}
    >
      <BrandMark />
      <Spinner />
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", letterSpacing: 1 }}>
        در حال آماده‌سازی فروشگاه…
      </div>
      <ProgressBar />
      <SplashStyles />
    </div>
  );
}


function BrandMark() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div
        style={{
          fontFamily: "serif",
          fontSize: 44,
          fontWeight: 900,
          letterSpacing: 1,
          lineHeight: 1,
          background: "linear-gradient(180deg, #ffe9a8 0%, #d4af37 55%, #9c7c1e 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          textShadow: "0 2px 12px rgba(212,175,55,0.18)",
        }}
      >
        دلی گلد
      </div>
      <div
        style={{
          fontFamily: "serif",
          fontSize: 11,
          letterSpacing: 6,
          color: "rgba(212,175,55,0.75)",
          textAlign: "center",
        }}
      >
        DELI GOLD
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div
      style={{
        width: 46,
        height: 46,
        borderRadius: "50%",
        border: "2px solid rgba(212,175,55,0.18)",
        borderTopColor: "#d4af37",
        animation: "dg-splash-spin 0.9s linear infinite",
      }}
    />
  );
}

function ProgressBar() {
  return (
    <div
      style={{
        width: 168,
        height: 3,
        borderRadius: 3,
        background: "rgba(255,255,255,0.1)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: "42%",
          borderRadius: 3,
          background: "linear-gradient(90deg, #9c7c1e, #ffe9a8, #d4af37)",
          animation: "dg-splash-bar 1.15s ease-in-out infinite",
        }}
      />
    </div>
  );
}

function SplashStyles() {
  return (
    <style>{`
      @keyframes dg-splash-spin { to { transform: rotate(360deg); } }
      @keyframes dg-splash-bar {
        0%   { transform: translateX(-120%); }
        100% { transform: translateX(280%); }
      }
      @media (prefers-reduced-motion: reduce) {
        [role="status"] * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
        }
      }
    `}</style>
  );
}
