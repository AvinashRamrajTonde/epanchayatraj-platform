import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "gpmh_lang";

/**
 * Reads the current Google Translate language from the googtrans cookie.
 * Cookie format is: /mr/en  or  /mr/mr
 */
function getLangFromCookie(): "mr" | "en" {
  const m = document.cookie.match(/googtrans=\/mr\/(\w+)/);
  return m && m[1] === "en" ? "en" : "mr";
}

/**
 * Set the googtrans cookie (both on current domain and root domain)
 * Google Translate reads this to decide which language to show.
 */
function setGoogTransCookie(lang: "mr" | "en") {
  const value = `/mr/${lang}`;
  // Set for current domain + root domain + path=/
  document.cookie = `googtrans=${value};path=/`;
  // Also set on root domain for subdomains
  const host = window.location.hostname;
  const parts = host.split(".");
  if (parts.length >= 2) {
    const rootDomain = parts.slice(-2).join(".");
    document.cookie = `googtrans=${value};path=/;domain=.${rootDomain}`;
  }
}

/**
 * Programmatically trigger Google Translate to change language.
 * Finds the hidden <select> inside the widget and simulates a change.
 */
function doTranslate(lang: "mr" | "en") {
  const sel = document.querySelector<HTMLSelectElement>(
    "#google_translate_element select"
  );
  if (sel) {
    sel.value = lang;
    sel.dispatchEvent(new Event("change"));
  }
}

/**
 * Custom React hook for Google Translate integration.
 * Returns { lang, toggleLang, setLang } with localStorage persistence.
 */
export function useGoogleTranslate() {
  const [lang, setLangState] = useState<"mr" | "en">(() => {
    // 1. Check localStorage first
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "mr") return saved;
    // 2. Fall back to cookie
    return getLangFromCookie();
  });

  // On mount: apply saved language once Google Translate widget is ready
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as "mr" | "en" | null;
    if (!saved || saved === "mr") return; // default is Marathi, nothing to do

    // Set cookie before widget loads so it picks up the preference
    setGoogTransCookie(saved);

    // Wait for widget to fully load, then trigger translate
    const interval = setInterval(() => {
      const sel = document.querySelector<HTMLSelectElement>(
        "#google_translate_element select"
      );
      if (sel) {
        clearInterval(interval);
        // Small delay to ensure Google Translate is fully initialized
        setTimeout(() => doTranslate(saved), 300);
      }
    }, 200);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = useCallback((newLang: "mr" | "en") => {
    localStorage.setItem(STORAGE_KEY, newLang);
    setGoogTransCookie(newLang);
    setLangState(newLang);

    if (newLang === "mr") {
      // To go back to original, we remove the cookie and reload
      // (Google Translate doesn't cleanly switch back to the page language)
      document.cookie = "googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
      const host = window.location.hostname;
      const parts = host.split(".");
      if (parts.length >= 2) {
        const rootDomain = parts.slice(-2).join(".");
        document.cookie = `googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.${rootDomain}`;
      }
      window.location.reload();
    } else {
      doTranslate(newLang);
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "mr" ? "en" : "mr");
  }, [lang, setLang]);

  return { lang, toggleLang, setLang } as const;
}
