"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageLayout from "@/app/components/PageLayout";
import {
  GUIDE_PAGES_SETTING_KEY,
  getGuidePageDefinition,
  parseGuidePagesSettings,
  type GuidePageContent,
  type GuidePageSlug,
} from "@/lib/guide-pages-settings";

export default function GuidePage() {
  const params = useParams();
  const slug = String(params.slug ?? "") as GuidePageSlug;
  const definition = getGuidePageDefinition(slug);

  const [content, setContent] = useState<GuidePageContent>({
    heroTitle: "",
    heroSubtitle: "",
    sections: [],
  });

  useEffect(() => {
    if (!definition) return;
    fetch("/api/admin/settings", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const pages = parseGuidePagesSettings(d.data[GUIDE_PAGES_SETTING_KEY]);
          setContent(pages[slug]);
        }
      })
      .catch(() => {});
  }, [slug, definition]);

  if (!definition) {
    return (
      <PageLayout>
        <div style={{ maxWidth: 720, margin: "80px auto", padding: "0 16px", textAlign: "center" }}>
          <h1 style={{ color: "#222", fontSize: 22, fontWeight: 800, marginBottom: 12 }}>صفحه یافت نشد</h1>
          <Link href="/" style={{ color: "#c8a12a", fontSize: 14, textDecoration: "none" }}>بازگشت به صفحه اصلی</Link>
        </div>
      </PageLayout>
    );
  }

  const title = content.heroTitle || definition.label;
  const isFaq = slug === "faq";
  const hasContent = !!(content.heroTitle || content.heroSubtitle || content.sections.length > 0);

  return (
    <PageLayout>
      <div style={{ position: "relative", height: 220, overflow: "hidden", background: "linear-gradient(135deg, #1a1208 0%, #2a2010 100%)" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, color-mix(in srgb, var(--theme-accent) 20%, transparent), transparent)" }} />
        <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto", padding: "0 16px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          <h1 style={{ color: "#fff", fontSize: 30, fontWeight: 800, marginBottom: 10 }}>{title}</h1>
          {content.heroSubtitle && (
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, maxWidth: 560, lineHeight: 1.7 }}>{content.heroSubtitle}</p>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 16px 72px" }}>
        {!hasContent ? (
          <div style={{ backgroundColor: "#f8f8f8", border: "1px dashed #ddd", borderRadius: 12, padding: "32px 24px", textAlign: "center" }}>
            <p style={{ color: "#888", fontSize: 14, lineHeight: 1.8 }}>
              محتوای این صفحه هنوز در پنل مدیریت تنظیم نشده است.
            </p>
          </div>
        ) : isFaq ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {content.sections.map((item, i) => (
              <details
                key={i}
                style={{ backgroundColor: "#fff", border: "1px solid #ebebeb", borderRadius: 10, padding: "14px 18px" }}
              >
                <summary style={{ color: "#222", fontSize: 15, fontWeight: 700, cursor: "pointer", listStyle: "none" }}>
                  {item.title || `سؤال ${i + 1}`}
                </summary>
                {item.body && (
                  <p style={{ color: "#666", fontSize: 14, lineHeight: 2, marginTop: 12, whiteSpace: "pre-wrap" }}>{item.body}</p>
                )}
              </details>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {content.sections.map((section, i) => (
              <div key={i}>
                {section.title && (
                  <h2 style={{ color: "#222", fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{section.title}</h2>
                )}
                {section.body && (
                  <p style={{ color: "#666", fontSize: 14, lineHeight: 2.1, whiteSpace: "pre-wrap" }}>{section.body}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
