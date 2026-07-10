import type { LangCode } from "@/i18n/translations";

// Lightweight simulated dictionary translator: swaps common English words with
// their equivalent in the target language so translated content looks visibly
// different, without calling any real translation API. Purely a UI demo.
const DICTIONARIES: Partial<Record<LangCode, Record<string, string>>> = {
  ur: {
    the: "یہ", and: "اور", for: "کے لیے", with: "کے ساتھ", your: "آپ کا", is: "ہے", of: "کا",
    ai: "اے آئی", tool: "ٹول", tools: "ٹولز", news: "خبریں", data: "ڈیٹا", model: "ماڈل",
    build: "بنائیں", create: "تخلیق کریں", generate: "پیدا کریں", to: "کو", a: "ایک", an: "ایک",
    new: "نیا", best: "بہترین", using: "استعمال کرتے ہوئے", users: "صارفین", into: "میں",
  },
  ar: {
    the: "ال", and: "و", for: "لـ", with: "مع", your: "لك", is: "هو", of: "من",
    ai: "الذكاء الاصطناعي", tool: "أداة", tools: "أدوات", news: "أخبار", data: "بيانات", model: "نموذج",
    build: "بناء", create: "إنشاء", generate: "توليد", to: "إلى", a: "a", an: "an",
    new: "جديد", best: "الأفضل", using: "باستخدام", users: "المستخدمين", into: "إلى",
  },
  es: {
    the: "el", and: "y", for: "para", with: "con", your: "tu", is: "es", of: "de",
    ai: "IA", tool: "herramienta", tools: "herramientas", news: "noticias", data: "datos", model: "modelo",
    build: "construir", create: "crear", generate: "generar", to: "a", a: "un", an: "un",
    new: "nuevo", best: "mejor", using: "usando", users: "usuarios", into: "en",
  },
  fr: {
    the: "le", and: "et", for: "pour", with: "avec", your: "votre", is: "est", of: "de",
    ai: "IA", tool: "outil", tools: "outils", news: "actualités", data: "données", model: "modèle",
    build: "construire", create: "créer", generate: "générer", to: "à", a: "un", an: "un",
    new: "nouveau", best: "meilleur", using: "en utilisant", users: "utilisateurs", into: "dans",
  },
  zh: {
    the: "这个", and: "和", for: "为", with: "与", your: "你的", is: "是", of: "的",
    ai: "人工智能", tool: "工具", tools: "工具", news: "新闻", data: "数据", model: "模型",
    build: "构建", create: "创建", generate: "生成", to: "到", a: "一个", an: "一个",
    new: "新", best: "最好的", using: "使用", users: "用户", into: "进入",
  },
  hi: {
    the: "यह", and: "और", for: "के लिए", with: "साथ", your: "आपका", is: "है", of: "का",
    ai: "एआई", tool: "टूल", tools: "टूल्स", news: "समाचार", data: "डेटा", model: "मॉडल",
    build: "बनाएं", create: "बनाएं", generate: "उत्पन्न करें", to: "को", a: "एक", an: "एक",
    new: "नया", best: "सर्वश्रेष्ठ", using: "उपयोग करते हुए", users: "उपयोगकर्ता", into: "में",
  },
  de: {
    the: "der", and: "und", for: "für", with: "mit", your: "dein", is: "ist", of: "von",
    ai: "KI", tool: "Werkzeug", tools: "Werkzeuge", news: "Nachrichten", data: "Daten", model: "Modell",
    build: "bauen", create: "erstellen", generate: "generieren", to: "zu", a: "ein", an: "ein",
    new: "neu", best: "beste", using: "mit", users: "Benutzer", into: "in",
  },
  ja: {
    the: "その", and: "と", for: "のため", with: "と一緒に", your: "あなたの", is: "です", of: "の",
    ai: "AI", tool: "ツール", tools: "ツール", news: "ニュース", data: "データ", model: "モデル",
    build: "構築する", create: "作成する", generate: "生成する", to: "に", a: "一つの", an: "一つの",
    new: "新しい", best: "最高の", using: "使用して", users: "ユーザー", into: "の中に",
  },
};

export function isSimulatedTranslationSupported(lang: LangCode): boolean {
  return lang !== "en" && !!DICTIONARIES[lang];
}

export function simulateTranslate(text: string, lang: LangCode): string {
  const dict = DICTIONARIES[lang];
  if (!dict) return text;
  return text.replace(/[A-Za-z']+/g, (word) => {
    const lower = word.toLowerCase();
    const replacement = dict[lower];
    if (!replacement) return word;
    return replacement;
  });
}
