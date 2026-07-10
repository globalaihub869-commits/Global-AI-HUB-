import { createContext, useContext, useEffect, useState } from "react";
import { translations, LANGUAGES } from "@/i18n/translations";
import type { LangCode, TranslationKey } from "@/i18n/translations";

interface LanguageContextValue {
  lang: LangCode;
  setLang: (code: LangCode) => void;
  t: (key: TranslationKey) => string;
  dir: "ltr" | "rtl";
  isRTL: boolean;
  geoNotice: { lang: LangCode; country: string } | null;
  dismissGeoNotice: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const RTL_FONTS = `"Segoe UI", "Noto Naskh Arabic", "Tahoma", system-ui, sans-serif`;
const LTR_FONTS = `"Space Grotesk", "Inter", system-ui, sans-serif`;

// Simulated geo-based detection: maps a visitor's IANA timezone to a plausible
// country and default language, standing in for a real IP-geolocation lookup.
const TIMEZONE_GEO_MAP: { match: string; country: string; lang: LangCode }[] = [
  { match: "Asia/Karachi", country: "Pakistan", lang: "ur" },
  { match: "Asia/Dubai", country: "United Arab Emirates", lang: "ar" },
  { match: "Asia/Riyadh", country: "Saudi Arabia", lang: "ar" },
  { match: "Asia/Qatar", country: "Qatar", lang: "ar" },
  { match: "Asia/Kuwait", country: "Kuwait", lang: "ar" },
  { match: "Asia/Kolkata", country: "India", lang: "hi" },
  { match: "Asia/Dhaka", country: "Bangladesh", lang: "bn" },
  { match: "Asia/Tehran", country: "Iran", lang: "fa" },
  { match: "Asia/Shanghai", country: "China", lang: "zh" },
  { match: "Asia/Tokyo", country: "Japan", lang: "ja" },
  { match: "Asia/Seoul", country: "South Korea", lang: "ko" },
  { match: "Asia/Jakarta", country: "Indonesia", lang: "id" },
  { match: "Europe/Madrid", country: "Spain", lang: "es" },
  { match: "America/Mexico_City", country: "Mexico", lang: "es" },
  { match: "America/Sao_Paulo", country: "Brazil", lang: "pt" },
  { match: "Europe/Paris", country: "France", lang: "fr" },
  { match: "Europe/Berlin", country: "Germany", lang: "de" },
  { match: "Europe/Rome", country: "Italy", lang: "it" },
  { match: "Europe/Amsterdam", country: "Netherlands", lang: "nl" },
  { match: "Europe/Moscow", country: "Russia", lang: "ru" },
  { match: "Europe/Istanbul", country: "Turkey", lang: "tr" },
];

export function detectGeoLanguage(): { lang: LangCode; country: string } | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const hit = TIMEZONE_GEO_MAP.find((entry) => entry.match === tz);
    return hit ? { lang: hit.lang, country: hit.country } : null;
  } catch {
    return null;
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [autoDetected, setAutoDetected] = useState<{ lang: LangCode; country: string } | null>(null);
  const [lang, setLangState] = useState<LangCode>(() => {
    const saved = localStorage.getItem("gaih-lang") as LangCode | null;
    if (saved && translations[saved]) return saved;

    const geo = detectGeoLanguage();
    if (geo && translations[geo.lang]) return geo.lang;

    const browser = navigator.language.split("-")[0] as LangCode;
    if (translations[browser]) return browser;
    return "en";
  });

  useEffect(() => {
    const saved = localStorage.getItem("gaih-lang");
    if (saved) return;
    const geo = detectGeoLanguage();
    if (geo && translations[geo.lang]) setAutoDetected(geo);
  }, []);

  const meta = LANGUAGES.find((l) => l.code === lang)!;
  const dir = meta.dir;
  const isRTL = dir === "rtl";

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("dir", dir);
    html.setAttribute("lang", lang);
    // Switch font for RTL scripts that need non-Latin glyphs
    document.body.style.fontFamily = isRTL ? RTL_FONTS : "";
    localStorage.setItem("gaih-lang", lang);
  }, [lang, dir, isRTL]);

  const setLang = (code: LangCode) => {
    if (translations[code]) setLangState(code);
  };

  const t = (key: TranslationKey): string => {
    const dict = translations[lang] ?? translations["en"];
    return (dict as Record<string, string>)[key] ?? (translations["en"] as Record<string, string>)[key] ?? key;
  };

  return (
    <LanguageContext.Provider
      value={{ lang, setLang, t, dir, isRTL, geoNotice: autoDetected, dismissGeoNotice: () => setAutoDetected(null) }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}
