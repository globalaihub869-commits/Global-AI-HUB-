import { useState } from "react";
import { Languages } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { simulateTranslate, isSimulatedTranslationSupported } from "@/lib/simulatedTranslate";
import { LANGUAGES } from "@/i18n/translations";

interface Props {
  text: string;
  className?: string;
  testId?: string;
}

export default function TranslateToggle({ text, className = "", testId }: Props) {
  const { lang } = useLanguage();
  const [translated, setTranslated] = useState(false);

  if (!isSimulatedTranslationSupported(lang)) return null;

  const langMeta = LANGUAGES.find((l) => l.code === lang);

  return (
    <div className={className}>
      <button
        onClick={() => setTranslated((v) => !v)}
        data-testid={testId}
        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1 border transition-all ${
          translated
            ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-300"
            : "border-white/10 text-muted-foreground hover:border-primary/40 hover:text-primary"
        }`}
      >
        <Languages className="w-3 h-3" />
        {translated ? `Showing ${langMeta?.native ?? lang}` : "Translate Content"}
      </button>
      {translated && (
        <p className="mt-2 text-sm text-cyan-100/90 leading-relaxed" dir={langMeta?.dir} data-testid={testId ? `${testId}-output` : undefined}>
          {simulateTranslate(text, lang)}
        </p>
      )}
    </div>
  );
}
