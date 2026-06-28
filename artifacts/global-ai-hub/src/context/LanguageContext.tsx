import { createContext, useContext, useEffect, useState } from "react";
import { translations, LANGUAGES } from "@/i18n/translations";
import type { LangCode, TranslationKey } from "@/i18n/translations";

interface LanguageContextValue {
  lang: LangCode;
  setLang: (code: LangCode) => void;
  t: (key: TranslationKey) => string;
  dir: "ltr" | "rtl";
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const RTL_FONTS = `"Segoe UI", "Noto Naskh Arabic", "Tahoma", system-ui, sans-serif`;
const LTR_FONTS = `"Space Grotesk", "Inter", system-ui, sans-serif`;

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(() => {
    const saved = localStorage.getItem("gaih-lang") as LangCode | null;
    if (saved && translations[saved]) return saved;
    const browser = navigator.language.split("-")[0] as LangCode;
    if (translations[browser]) return browser;
    return "en";
  });

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
    <LanguageContext.Provider value={{ lang, setLang, t, dir, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}
