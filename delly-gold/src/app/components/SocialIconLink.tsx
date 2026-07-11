import type { SocialLinkType } from "@/lib/social-links";
import SocialIcon from "./SocialIcon";

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

interface SocialIconLinkProps {
  href: string;
  label: string;
  type: SocialLinkType;
  iconUrl?: string;
  hover: string;
  size?: number;
  variant?: "navbar" | "footer";
}

export default function SocialIconLink({
  href,
  label,
  type,
  iconUrl,
  hover,
  size = 18,
  variant = "navbar",
}: SocialIconLinkProps) {
  const footer = variant === "footer";

  return (
    <a
      href={href}
      aria-label={label}
      target={isExternalHref(href) ? "_blank" : undefined}
      rel={isExternalHref(href) ? "noopener noreferrer" : undefined}
      className={footer ? undefined : "nav-social-icon"}
      style={{
        color: footer ? "#888" : "#999",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: footer ? "32px" : "32px",
        height: footer ? "32px" : "32px",
        backgroundColor: footer ? "#f5f5f5" : "transparent",
        border: footer ? "1px solid #ebebeb" : "none",
        borderRadius: footer ? "7px" : undefined,
        transition: "all 0.2s",
        cursor: "pointer",
        position: "relative",
        zIndex: 1,
        flexShrink: 0,
        textDecoration: "none",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        if (footer) {
          el.style.backgroundColor = "#fdf8ee";
          el.style.borderColor = hover;
        }
        el.style.color = hover;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        if (footer) {
          el.style.backgroundColor = "#f5f5f5";
          el.style.borderColor = "#ebebeb";
          el.style.color = "#888";
        } else {
          el.style.color = "#999";
        }
      }}
    >
      <span style={{ display: "flex", pointerEvents: "none" }}>
        <SocialIcon type={type} size={size} imageUrl={iconUrl} />
      </span>
    </a>
  );
}
