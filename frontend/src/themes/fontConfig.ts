/**
 * Theme Font Configuration
 * ─────────────────────────────────────────────────────────────
 * Edit the fonts per-theme by changing the family names below.
 * All fonts must be available on Google Fonts (fonts.googleapis.com).
 *
 * font roles:
 *   logo     – village name / brand mark in navbar
 *   heading  – h1, h2, h3, section titles
 *   body     – all paragraph / general text
 */

export interface ThemeFontConfig {
  /** Google Fonts family name (exact, spaces OK) e.g. "Noto Serif Devanagari" */
  logo: string;
  heading: string;
  body: string;
  /** Weight ranges to load for each role, e.g. "400;600;700" */
  logoWeights?: string;
  headingWeights?: string;
  bodyWeights?: string;
}

// ─────────────────────────────────────────
//  CLASSIC THEME
//  Feel: traditional, warm, government
// ─────────────────────────────────────────
export const classicFonts: ThemeFontConfig = {
  logo: "Inknut Antiqua",       // traditional ornate – perfect for GP name
  logoWeights: "400",
  heading: "Noto Serif Devanagari", // rich serif for section headings
  headingWeights: "400;600;700",
  body: "Noto Sans Devanagari",  // clean readable Devanagari body
  bodyWeights: "400;500;600",
};

// ─────────────────────────────────────────
//  MODERN THEME
//  Feel: fresh, bold, contemporary
// ─────────────────────────────────────────
export const modernFonts: ThemeFontConfig = {
  logo: "Baloo 2",               // bold rounded – energetic modern logo
  logoWeights: "700;800",
  heading: "Mukta",              // geometric sans – crisp modern headings
  headingWeights: "600;700;800",
  body: "Noto Sans Devanagari",  // same clean body as classic
  bodyWeights: "400;500;600",
};

/**
 * Builds a single Google Fonts CSS2 URL for all three roles.
 */
export function buildGoogleFontsUrl(fonts: ThemeFontConfig): string {
  const families: string[] = [];

  const add = (name: string, weights?: string) => {
    const encoded = name.replace(/ /g, "+");
    families.push(weights ? `family=${encoded}:wght@${weights}` : `family=${encoded}`);
  };

  // Deduplicate: if body === heading we still only add once
  const seen = new Set<string>();
  const addOnce = (name: string, weights?: string) => {
    if (!seen.has(name)) {
      seen.add(name);
      add(name, weights);
    }
  };

  addOnce(fonts.logo, fonts.logoWeights);
  addOnce(fonts.heading, fonts.headingWeights);
  addOnce(fonts.body, fonts.bodyWeights);

  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}
