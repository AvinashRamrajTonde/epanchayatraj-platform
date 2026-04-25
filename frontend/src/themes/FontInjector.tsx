import { useEffect } from "react";
import { buildGoogleFontsUrl, type ThemeFontConfig } from "./fontConfig";

interface Props {
  fonts: ThemeFontConfig;
}

/**
 * FontInjector
 * ─────────────────────────────────────────────────────────────
 * Renders nothing. On mount it:
 *   1. Injects a <link> to Google Fonts for all three roles.
 *   2. Sets three CSS custom properties on <html>:
 *        --font-logo     → logo / brand text
 *        --font-heading  → h1 / h2 / h3 / section titles
 *        --font-body     → paragraphs, cards, general UI
 *
 * Place once inside each theme Layout so fonts switch automatically
 * when the user changes theme.
 */
export default function FontInjector({ fonts }: Props) {
  useEffect(() => {
    const linkId = "theme-google-fonts";

    // Remove any previously injected link (theme switch)
    const existing = document.getElementById(linkId);
    if (existing) existing.remove();

    // Inject Google Fonts <link>
    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = buildGoogleFontsUrl(fonts);
    document.head.appendChild(link);

    // Set CSS custom properties on <html> root
    const root = document.documentElement;
    root.style.setProperty(
      "--font-logo",
      `"${fonts.logo}", "Noto Sans Devanagari", sans-serif`
    );
    root.style.setProperty(
      "--font-heading",
      `"${fonts.heading}", "Noto Sans Devanagari", sans-serif`
    );
    root.style.setProperty(
      "--font-body",
      `"${fonts.body}", "Noto Sans Devanagari", sans-serif`
    );

    return () => {
      // Clean up on unmount so old fonts don't linger when layout unmounts
      document.getElementById(linkId)?.remove();
    };
  }, [fonts.logo, fonts.heading, fonts.body]);

  return null;
}
