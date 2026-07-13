"use client";

import { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
import {
  ABOUT_PAGE_SETTING_KEY,
  EMPTY_ABOUT_PAGE_SETTINGS,
  parseAboutPageSettings,
  type AboutPageSettings,
} from "@/lib/about-page-settings";

export default function AboutPage() {
  const [content, setContent] = useState<AboutPageSettings>(EMPTY_ABOUT_PAGE_SETTINGS);

  useEffect(() => {
    fetch("/api/admin/settings", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setContent(parseAboutPageSettings(d.data[ABOUT_PAGE_SETTING_KEY]));
        }
      })
      .catch(() => {});
  }, []);

  const hasHero = !!(content.heroTitle || content.heroSubtitle || content.heroImage);
  const hasStory = !!(content.storyTitle || content.storyParagraph1 || content.storyParagraph2 || content.storyImage);
  const hasStats = content.stats.length > 0;
  const hasValues = !!(content.valuesTitle || content.valuesSubtitle || content.values.length > 0);
  const hasTeam = !!(content.teamTitle || content.teamSubtitle || content.team.length > 0);

  return (
    <PageLayout>
      {hasHero && (
        <div style={{ position: "relative", height: 320, overflow: "hidden" }}>
          {content.heroImage && (
            <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${content.heroImage})`, backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.25)" }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, color-mix(in srgb, var(--theme-accent) 15%, transparent), transparent)" }} />
          <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto", padding: "0 16px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
            {content.heroTitle && (
              <h1 style={{ color: "var(--theme-text)", fontSize: 32, fontWeight: 800, marginBottom: 10 }}>{content.heroTitle}</h1>
            )}
            {content.heroSubtitle && (
              <p style={{ color: "var(--theme-text-muted)", fontSize: 15, maxWidth: 500 }}>{content.heroSubtitle}</p>
            )}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "56px 16px" }}>
        {hasStory && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginBottom: 72, alignItems: "center" }} className="story-grid">
            <div>
              <div style={{ width: 40, height: 3, backgroundColor: "var(--theme-accent)", marginBottom: 16 }} />
              {content.storyTitle && (
                <h2 style={{ color: "var(--theme-text)", fontSize: 28, fontWeight: 700, marginBottom: 16 }}>{content.storyTitle}</h2>
              )}
              {content.storyParagraph1 && (
                <p style={{ color: "var(--theme-text-muted)", fontSize: 14, lineHeight: 2, marginBottom: 16 }}>{content.storyParagraph1}</p>
              )}
              {content.storyParagraph2 && (
                <p style={{ color: "var(--theme-text-muted)", fontSize: 14, lineHeight: 2 }}>{content.storyParagraph2}</p>
              )}
            </div>
            {content.storyImage && (
              <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--theme-border)" }}>
                <img src={content.storyImage} alt={content.storyTitle || ""} style={{ width: "100%", height: 320, objectFit: "cover", display: "block" }} />
              </div>
            )}
          </div>
        )}

        {hasStats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 72 }} className="stats-grid">
            {content.stats.map((s, i) => (
              <div key={i} style={{ backgroundColor: "var(--theme-card)", border: "1px solid var(--theme-border)", borderRadius: 12, padding: "28px 20px", textAlign: "center" }}>
                {s.value && <p style={{ color: "var(--theme-accent)", fontSize: 32, fontWeight: 900, marginBottom: 6 }}>{s.value}</p>}
                {s.label && <p style={{ color: "var(--theme-text-muted)", fontSize: 13 }}>{s.label}</p>}
              </div>
            ))}
          </div>
        )}

        {hasValues && (
          <div style={{ marginBottom: 72 }}>
            {content.valuesTitle && (
              <h2 style={{ color: "var(--theme-text)", fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>{content.valuesTitle}</h2>
            )}
            {content.valuesSubtitle && (
              <p style={{ color: "var(--theme-text-muted)", fontSize: 14, textAlign: "center", marginBottom: 36 }}>{content.valuesSubtitle}</p>
            )}
            {content.values.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} className="values-grid">
                {content.values.map((v, i) => (
                  <div key={i} style={{ backgroundColor: "var(--theme-card)", border: "1px solid var(--theme-border)", borderRadius: 12, padding: 24, textAlign: "center" }}>
                    <div style={{ width: 56, height: 56, backgroundColor: "color-mix(in srgb, var(--theme-accent) 10%, transparent)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--theme-accent)", fontSize: 20, fontWeight: 800 }}>
                      {i + 1}
                    </div>
                    {v.title && <h3 style={{ color: "var(--theme-text)", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{v.title}</h3>}
                    {v.desc && <p style={{ color: "var(--theme-text-muted)", fontSize: 12, lineHeight: 1.7 }}>{v.desc}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {hasTeam && (
          <div>
            {content.teamTitle && (
              <h2 style={{ color: "var(--theme-text)", fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>{content.teamTitle}</h2>
            )}
            {content.teamSubtitle && (
              <p style={{ color: "var(--theme-text-muted)", fontSize: 14, textAlign: "center", marginBottom: 36 }}>{content.teamSubtitle}</p>
            )}
            {content.team.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, maxWidth: 700, margin: "0 auto" }} className="team-grid">
                {content.team.map((m, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    {m.image && (
                      <div style={{ width: 100, height: 100, borderRadius: "50%", overflow: "hidden", margin: "0 auto 12px", border: "3px solid var(--theme-accent)" }}>
                        <img src={m.image} alt={m.name || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                    {m.name && <h3 style={{ color: "var(--theme-text)", fontSize: 15, fontWeight: 700 }}>{m.name}</h3>}
                    {m.role && <p style={{ color: "var(--theme-accent)", fontSize: 12 }}>{m.role}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .story-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .values-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .team-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PageLayout>
  );
}
