export type LangCode =
  | "en" | "es" | "fr" | "de" | "pt" | "it" | "nl" | "ru"
  | "tr" | "id" | "zh" | "ja" | "ko" | "hi" | "bn"
  | "ar" | "ur" | "fa";

export interface LangMeta {
  code: LangCode;
  name: string;
  native: string;
  dir: "ltr" | "rtl";
  flag: string;
}

export const LANGUAGES: LangMeta[] = [
  { code: "en", name: "English",    native: "English",          dir: "ltr", flag: "🇺🇸" },
  { code: "es", name: "Spanish",    native: "Español",          dir: "ltr", flag: "🇪🇸" },
  { code: "fr", name: "French",     native: "Français",         dir: "ltr", flag: "🇫🇷" },
  { code: "de", name: "German",     native: "Deutsch",          dir: "ltr", flag: "🇩🇪" },
  { code: "pt", name: "Portuguese", native: "Português",        dir: "ltr", flag: "🇧🇷" },
  { code: "it", name: "Italian",    native: "Italiano",         dir: "ltr", flag: "🇮🇹" },
  { code: "nl", name: "Dutch",      native: "Nederlands",       dir: "ltr", flag: "🇳🇱" },
  { code: "ru", name: "Russian",    native: "Русский",          dir: "ltr", flag: "🇷🇺" },
  { code: "tr", name: "Turkish",    native: "Türkçe",           dir: "ltr", flag: "🇹🇷" },
  { code: "id", name: "Indonesian", native: "Bahasa Indonesia", dir: "ltr", flag: "🇮🇩" },
  { code: "zh", name: "Chinese",    native: "中文",              dir: "ltr", flag: "🇨🇳" },
  { code: "ja", name: "Japanese",   native: "日本語",            dir: "ltr", flag: "🇯🇵" },
  { code: "ko", name: "Korean",     native: "한국어",            dir: "ltr", flag: "🇰🇷" },
  { code: "hi", name: "Hindi",      native: "हिन्दी",            dir: "ltr", flag: "🇮🇳" },
  { code: "bn", name: "Bengali",    native: "বাংলা",             dir: "ltr", flag: "🇧🇩" },
  { code: "ar", name: "Arabic",     native: "العربية",           dir: "rtl", flag: "🇸🇦" },
  { code: "ur", name: "Urdu",       native: "اردو",              dir: "rtl", flag: "🇵🇰" },
  { code: "fa", name: "Persian",    native: "فارسی",             dir: "rtl", flag: "🇮🇷" },
];

export type TranslationKey = keyof typeof translations["en"];

export type Translations = {
  // Navbar
  "nav.home": string;
  "nav.tools": string;
  "nav.news": string;
  "nav.models": string;
  "nav.submitTool": string;
  "nav.getStarted": string;
  "nav.language": string;
  // Hero
  "hero.badge": string;
  "hero.h1": string;
  "hero.h2": string;
  "hero.h3": string;
  "hero.subtitle": string;
  "hero.exploreCta": string;
  "hero.newsletterCta": string;
  "hero.mediaTitle": string;
  "hero.mediaSubtitle": string;
  "hero.mediaLabel": string;
  // Stats
  "stats.tools": string;
  "stats.countries": string;
  "stats.researchers": string;
  "stats.readers": string;
  // Home sections
  "home.categoriesTitle": string;
  "home.categoriesSubtitle": string;
  "cat.llms": string; "cat.llmsDesc": string;
  "cat.imageGen": string; "cat.imageGenDesc": string;
  "cat.codeAI": string; "cat.codeAIDesc": string;
  "cat.voiceAI": string; "cat.voiceAIDesc": string;
  "cat.agents": string; "cat.agentsDesc": string;
  "cat.dataAI": string; "cat.dataAIDesc": string;
  // FAQ
  "faq.badge": string; "faq.title": string; "faq.subtitle": string;
  // Newsletter
  "newsletter.badge": string;
  "newsletter.title": string;
  "newsletter.titleHighlight": string;
  "newsletter.subtitle": string;
  "newsletter.placeholder": string;
  "newsletter.btnJoin": string;
  "newsletter.btnJoining": string;
  "newsletter.successTitle": string;
  "newsletter.successText": string;
  "newsletter.disclaimer": string;
  // Tools
  "tools.title": string; "tools.subtitle": string;
  "tools.searchPlaceholder": string; "tools.filtersBtn": string;
  "tools.updatedDaily": string; "tools.visit": string;
  "tools.verified": string;
  "tools.submitTitle": string; "tools.submitText": string; "tools.submitBtn": string;
  "tools.emptyTitle": string; "tools.emptyText": string;
  "tools.clearAll": string;
  "tools.showing": string; "tools.of": string; "tools.toolsWord": string;
  "filter.all": string; "filter.free": string; "filter.freemium": string; "filter.premium": string;
  "filter.allPricing": string;
  "filter.text": string; "filter.image": string; "filter.audio": string;
  "filter.code": string; "filter.video": string; "filter.allTypes": string;
  "sort.mostPopular": string; "sort.topRated": string; "sort.az": string;
  // Domain labels
  "domain.all": string; "domain.llms": string; "domain.codeAI": string;
  "domain.imageGen": string; "domain.voiceAI": string; "domain.agents": string;
  "domain.marketing": string; "domain.design": string;
  // News
  "news.title": string; "news.subtitle": string; "news.liveFeed": string;
  "news.searchPlaceholder": string; "news.aiSummary": string;
  "news.featured": string; "news.minRead": string; "news.source": string;
  "news.articles": string; "news.in": string; "news.matching": string; "news.clear": string;
  "news.emptyTitle": string; "news.emptyText": string;
  "news.viewAll": string; "news.newsletterTitle": string;
  "news.newsletterText": string; "news.joinNewsletter": string;
  "news.showFull": string; "news.showLess": string;
  // Models
  "models.title": string; "models.subtitle": string;
  "models.model": string; "models.provider": string;
  "models.type": string; "models.context": string;
  "models.openSource": string; "models.score": string;
  "models.yes": string; "models.no": string;
  // Footer
  "footer.tagline": string;
  "footer.explore": string; "footer.community": string; "footer.company": string;
  "footer.copyright": string;
  "footer.tools": string; "footer.news": string;
  "footer.models": string; "footer.leaderboard": string;
  "footer.discord": string; "footer.twitter": string;
  "footer.newsletter": string; "footer.github": string;
  "footer.about": string; "footer.blog": string;
  "footer.contact": string; "footer.privacy": string;
  // Common
  "common.retry": string; "common.updatedDaily": string;
};

const en: Translations = {
  "nav.home": "Home", "nav.tools": "Tools", "nav.news": "News", "nav.models": "Models",
  "nav.submitTool": "Submit Tool", "nav.getStarted": "Get Started", "nav.language": "Language",
  "hero.badge": "Now tracking 2,400+ AI tools in real-time",
  "hero.h1": "The Entire AI Universe,", "hero.h2": "Personalized for You.",
  "hero.h3": "Discover, Build, and Scale the Future.",
  "hero.subtitle": "Your ultimate destination for AI tools, breaking model news, and curated resources. Whether you're an engineer, researcher, or founder — everything you need to stay ahead lives here.",
  "hero.exploreCta": "Explore Tools", "hero.newsletterCta": "Join Newsletter",
  "hero.mediaTitle": "Watch: The State of AI in 2026", "hero.mediaSubtitle": "3-min overview · Updated June 2026",
  "hero.mediaLabel": "Interactive AI Universe · Live Data · Updated Daily",
  "stats.tools": "AI Tools", "stats.countries": "Countries", "stats.researchers": "Researchers", "stats.readers": "Newsletter Readers",
  "home.categoriesTitle": "Explore by Category", "home.categoriesSubtitle": "Dive deep into specialized domains of artificial intelligence.",
  "cat.llms": "LLMs", "cat.llmsDesc": "Large Language Models & Chatbots",
  "cat.imageGen": "Image Gen", "cat.imageGenDesc": "AI Image Generation & Editing",
  "cat.codeAI": "Code AI", "cat.codeAIDesc": "Copilots & Coding Assistants",
  "cat.voiceAI": "Voice AI", "cat.voiceAIDesc": "Text-to-Speech & Voice Cloning",
  "cat.agents": "Agents", "cat.agentsDesc": "Autonomous AI Agents",
  "cat.dataAI": "Data AI", "cat.dataAIDesc": "Data Analysis & Visualization",
  "faq.badge": "Got Questions?", "faq.title": "Frequently Asked Questions", "faq.subtitle": "Everything you need to know about Global AI Hub.",
  "newsletter.badge": "Weekly AI Intelligence Digest",
  "newsletter.title": "Stay Ahead of the", "newsletter.titleHighlight": "AI Curve",
  "newsletter.subtitle": "Get a curated weekly digest of the biggest AI tool launches, model releases, and research breakthroughs — straight to your inbox. No noise, only signal.",
  "newsletter.placeholder": "you@example.com", "newsletter.btnJoin": "Join Newsletter", "newsletter.btnJoining": "Joining…",
  "newsletter.successTitle": "You're in!", "newsletter.successText": "Welcome to the Global AI Hub community. First digest arrives this week.",
  "newsletter.disclaimer": "No spam. Unsubscribe anytime. 12,000+ subscribers already on board.",
  "tools.title": "AI Tools Directory", "tools.subtitle": "Discover, compare, and launch the best AI tools across every category — curated and verified by the Global AI Hub team.",
  "tools.searchPlaceholder": "Search by name, category, or keyword…", "tools.filtersBtn": "Filters",
  "tools.updatedDaily": "Updated daily", "tools.visit": "Visit",
  "tools.verified": "Verified by Global AI Hub",
  "tools.submitTitle": "Know a tool we're missing?", "tools.submitText": "Submit any AI tool for review. Verified tools get the Global AI Hub badge and priority placement.", "tools.submitBtn": "Submit a Tool",
  "tools.emptyTitle": "No tools found", "tools.emptyText": "No AI tools match your current filters. Try adjusting your search or removing a filter.",
  "tools.clearAll": "Clear all filters", "tools.showing": "Showing", "tools.of": "of", "tools.toolsWord": "tools",
  "filter.all": "All", "filter.free": "Free", "filter.freemium": "Freemium", "filter.premium": "Premium", "filter.allPricing": "All Pricing",
  "filter.text": "Text", "filter.image": "Image", "filter.audio": "Audio", "filter.code": "Code", "filter.video": "Video", "filter.allTypes": "All Types",
  "sort.mostPopular": "Most Popular", "sort.topRated": "Top Rated", "sort.az": "A–Z",
  "domain.all": "All", "domain.llms": "LLMs", "domain.codeAI": "Code AI", "domain.imageGen": "Image Gen",
  "domain.voiceAI": "Voice AI", "domain.agents": "Agents", "domain.marketing": "Marketing", "domain.design": "Design",
  "news.title": "AI News Hub", "news.subtitle": "Every story distilled into exactly 3 bullet points — the signal, not the noise. Each digest links directly to the original source.",
  "news.liveFeed": "Live Feed", "news.searchPlaceholder": "Search news, topics, or sources…",
  "news.aiSummary": "AI Summary", "news.featured": "Featured Story", "news.minRead": "min read", "news.source": "Source",
  "news.articles": "articles", "news.in": "in", "news.matching": "matching", "news.clear": "Clear",
  "news.emptyTitle": "No articles found", "news.emptyText": "Try a different search term or category.",
  "news.viewAll": "View all news", "news.newsletterTitle": "Get digests in your inbox",
  "news.newsletterText": "Weekly AI news — always 3 bullets, always sourced.", "news.joinNewsletter": "Join Newsletter",
  "news.showFull": "Show full summary", "news.showLess": "Show less",
  "models.title": "Models Leaderboard", "models.subtitle": "Comparing the top foundation models by benchmark performance and capabilities.",
  "models.model": "Model", "models.provider": "Provider", "models.type": "Type", "models.context": "Context",
  "models.openSource": "Open Source", "models.score": "Score", "models.yes": "Yes", "models.no": "No",
  "footer.tagline": "Your command center for everything artificial intelligence. Discover, compare, and build the future.",
  "footer.explore": "Explore", "footer.community": "Community", "footer.company": "Company",
  "footer.copyright": "Global AI Hub. All rights reserved.",
  "footer.tools": "Tools", "footer.news": "News", "footer.models": "Models", "footer.leaderboard": "Leaderboard",
  "footer.discord": "Discord", "footer.twitter": "Twitter / X", "footer.newsletter": "Newsletter", "footer.github": "GitHub",
  "footer.about": "About", "footer.blog": "Blog", "footer.contact": "Contact", "footer.privacy": "Privacy",
  "common.retry": "Retry", "common.updatedDaily": "Updated daily",
};

const es: Translations = {
  "nav.home": "Inicio", "nav.tools": "Herramientas", "nav.news": "Noticias", "nav.models": "Modelos",
  "nav.submitTool": "Enviar Herramienta", "nav.getStarted": "Comenzar", "nav.language": "Idioma",
  "hero.badge": "Rastreando más de 2,400 herramientas de IA en tiempo real",
  "hero.h1": "Todo el Universo de la IA,", "hero.h2": "Personalizado para Ti.",
  "hero.h3": "Descubre, Construye y Escala el Futuro.",
  "hero.subtitle": "Tu destino definitivo para herramientas de IA, noticias y recursos. Ya seas ingeniero, investigador o fundador — todo lo que necesitas está aquí.",
  "hero.exploreCta": "Explorar Herramientas", "hero.newsletterCta": "Unirse al Boletín",
  "hero.mediaTitle": "Ver: El Estado de la IA en 2026", "hero.mediaSubtitle": "3 min · Actualizado junio 2026",
  "hero.mediaLabel": "Universo IA Interactivo · Datos en Vivo · Actualizado Diariamente",
  "stats.tools": "Herramientas IA", "stats.countries": "Países", "stats.researchers": "Investigadores", "stats.readers": "Lectores del Boletín",
  "home.categoriesTitle": "Explorar por Categoría", "home.categoriesSubtitle": "Sumérgete en dominios especializados de inteligencia artificial.",
  "cat.llms": "LLMs", "cat.llmsDesc": "Modelos de Lenguaje y Chatbots",
  "cat.imageGen": "Imagen IA", "cat.imageGenDesc": "Generación y Edición de Imágenes IA",
  "cat.codeAI": "Código IA", "cat.codeAIDesc": "Copilotos y Asistentes de Código",
  "cat.voiceAI": "Voz IA", "cat.voiceAIDesc": "Texto a Voz y Clonación de Voz",
  "cat.agents": "Agentes", "cat.agentsDesc": "Agentes de IA Autónomos",
  "cat.dataAI": "Datos IA", "cat.dataAIDesc": "Análisis de Datos y Visualización",
  "faq.badge": "¿Tienes Preguntas?", "faq.title": "Preguntas Frecuentes", "faq.subtitle": "Todo lo que necesitas saber sobre Global AI Hub.",
  "newsletter.badge": "Resumen Semanal de Inteligencia IA",
  "newsletter.title": "Mantente Adelante de la", "newsletter.titleHighlight": "Curva de IA",
  "newsletter.subtitle": "Recibe un resumen semanal curado de lanzamientos de herramientas de IA, versiones de modelos y avances de investigación — directo a tu bandeja.",
  "newsletter.placeholder": "tu@email.com", "newsletter.btnJoin": "Unirse al Boletín", "newsletter.btnJoining": "Uniéndose…",
  "newsletter.successTitle": "¡Ya estás dentro!", "newsletter.successText": "Bienvenido a la comunidad de Global AI Hub. El primer resumen llega esta semana.",
  "newsletter.disclaimer": "Sin spam. Cancela cuando quieras. Más de 12,000 suscriptores.",
  "tools.title": "Directorio de Herramientas IA", "tools.subtitle": "Descubre, compara y lanza las mejores herramientas de IA en cada categoría.",
  "tools.searchPlaceholder": "Buscar por nombre, categoría o palabra clave…", "tools.filtersBtn": "Filtros",
  "tools.updatedDaily": "Actualizado diariamente", "tools.visit": "Visitar",
  "tools.verified": "Verificado por Global AI Hub",
  "tools.submitTitle": "¿Conoces una herramienta que nos falta?", "tools.submitText": "Envía cualquier herramienta de IA para revisión. Las herramientas verificadas obtienen el distintivo.", "tools.submitBtn": "Enviar Herramienta",
  "tools.emptyTitle": "No se encontraron herramientas", "tools.emptyText": "Ninguna herramienta coincide con tus filtros actuales.",
  "tools.clearAll": "Limpiar filtros", "tools.showing": "Mostrando", "tools.of": "de", "tools.toolsWord": "herramientas",
  "filter.all": "Todos", "filter.free": "Gratis", "filter.freemium": "Freemium", "filter.premium": "Premium", "filter.allPricing": "Todo Precio",
  "filter.text": "Texto", "filter.image": "Imagen", "filter.audio": "Audio", "filter.code": "Código", "filter.video": "Video", "filter.allTypes": "Todos los Tipos",
  "sort.mostPopular": "Más Popular", "sort.topRated": "Mejor Calificado", "sort.az": "A–Z",
  "domain.all": "Todos", "domain.llms": "LLMs", "domain.codeAI": "Código IA", "domain.imageGen": "Imagen IA",
  "domain.voiceAI": "Voz IA", "domain.agents": "Agentes", "domain.marketing": "Marketing", "domain.design": "Diseño",
  "news.title": "Hub de Noticias IA", "news.subtitle": "Cada historia en exactamente 3 puntos — la señal, no el ruido.",
  "news.liveFeed": "Feed en Vivo", "news.searchPlaceholder": "Buscar noticias, temas o fuentes…",
  "news.aiSummary": "Resumen IA", "news.featured": "Historia Destacada", "news.minRead": "min lectura", "news.source": "Fuente",
  "news.articles": "artículos", "news.in": "en", "news.matching": "coincide con", "news.clear": "Limpiar",
  "news.emptyTitle": "No se encontraron artículos", "news.emptyText": "Intenta un término o categoría diferente.",
  "news.viewAll": "Ver todas las noticias", "news.newsletterTitle": "Recibe resúmenes en tu bandeja",
  "news.newsletterText": "Noticias de IA semanales — siempre 3 puntos.", "news.joinNewsletter": "Unirse al Boletín",
  "news.showFull": "Mostrar resumen completo", "news.showLess": "Mostrar menos",
  "models.title": "Clasificación de Modelos", "models.subtitle": "Comparando los mejores modelos fundamentales por rendimiento en benchmarks.",
  "models.model": "Modelo", "models.provider": "Proveedor", "models.type": "Tipo", "models.context": "Contexto",
  "models.openSource": "Código Abierto", "models.score": "Puntuación", "models.yes": "Sí", "models.no": "No",
  "footer.tagline": "Tu centro de mando para toda la inteligencia artificial.",
  "footer.explore": "Explorar", "footer.community": "Comunidad", "footer.company": "Empresa",
  "footer.copyright": "Global AI Hub. Todos los derechos reservados.",
  "footer.tools": "Herramientas", "footer.news": "Noticias", "footer.models": "Modelos", "footer.leaderboard": "Clasificación",
  "footer.discord": "Discord", "footer.twitter": "Twitter / X", "footer.newsletter": "Boletín", "footer.github": "GitHub",
  "footer.about": "Acerca de", "footer.blog": "Blog", "footer.contact": "Contacto", "footer.privacy": "Privacidad",
  "common.retry": "Reintentar", "common.updatedDaily": "Actualizado diariamente",
};

const fr: Translations = {
  "nav.home": "Accueil", "nav.tools": "Outils", "nav.news": "Actualités", "nav.models": "Modèles",
  "nav.submitTool": "Soumettre un Outil", "nav.getStarted": "Commencer", "nav.language": "Langue",
  "hero.badge": "Suivi de plus de 2 400 outils d'IA en temps réel",
  "hero.h1": "Tout l'Univers de l'IA,", "hero.h2": "Personnalisé pour Vous.",
  "hero.h3": "Découvrez, Construisez et Façonnez l'Avenir.",
  "hero.subtitle": "Votre destination ultime pour les outils d'IA, les actualités et les ressources. Que vous soyez ingénieur, chercheur ou fondateur — tout ce dont vous avez besoin est ici.",
  "hero.exploreCta": "Explorer les Outils", "hero.newsletterCta": "Rejoindre la Newsletter",
  "hero.mediaTitle": "Voir : L'État de l'IA en 2026", "hero.mediaSubtitle": "Aperçu de 3 min · Mis à jour juin 2026",
  "hero.mediaLabel": "Univers IA Interactif · Données en Direct · Mis à jour Quotidiennement",
  "stats.tools": "Outils IA", "stats.countries": "Pays", "stats.researchers": "Chercheurs", "stats.readers": "Lecteurs Newsletter",
  "home.categoriesTitle": "Explorer par Catégorie", "home.categoriesSubtitle": "Plongez dans les domaines spécialisés de l'intelligence artificielle.",
  "cat.llms": "LLMs", "cat.llmsDesc": "Grands Modèles de Langage et Chatbots",
  "cat.imageGen": "Génération d'Images", "cat.imageGenDesc": "Génération et Édition d'Images IA",
  "cat.codeAI": "Code IA", "cat.codeAIDesc": "Copilotes et Assistants de Code",
  "cat.voiceAI": "Voix IA", "cat.voiceAIDesc": "Synthèse Vocale et Clonage de Voix",
  "cat.agents": "Agents", "cat.agentsDesc": "Agents IA Autonomes",
  "cat.dataAI": "Données IA", "cat.dataAIDesc": "Analyse de Données et Visualisation",
  "faq.badge": "Des Questions?", "faq.title": "Foire aux Questions", "faq.subtitle": "Tout ce que vous devez savoir sur Global AI Hub.",
  "newsletter.badge": "Digest Hebdomadaire Intelligence IA",
  "newsletter.title": "Gardez une Longueur d'Avance sur la", "newsletter.titleHighlight": "Courbe IA",
  "newsletter.subtitle": "Recevez un digest hebdomadaire des plus grands lancements d'outils IA, sorties de modèles et avancées de recherche — directement dans votre boîte mail.",
  "newsletter.placeholder": "vous@exemple.com", "newsletter.btnJoin": "Rejoindre la Newsletter", "newsletter.btnJoining": "Inscription…",
  "newsletter.successTitle": "Vous êtes inscrit!", "newsletter.successText": "Bienvenue dans la communauté Global AI Hub. Le premier digest arrive cette semaine.",
  "newsletter.disclaimer": "Pas de spam. Désinscription à tout moment. Plus de 12 000 abonnés.",
  "tools.title": "Répertoire des Outils IA", "tools.subtitle": "Découvrez, comparez et lancez les meilleurs outils IA de chaque catégorie.",
  "tools.searchPlaceholder": "Rechercher par nom, catégorie ou mot-clé…", "tools.filtersBtn": "Filtres",
  "tools.updatedDaily": "Mis à jour quotidiennement", "tools.visit": "Visiter",
  "tools.verified": "Vérifié par Global AI Hub",
  "tools.submitTitle": "Vous connaissez un outil manquant?", "tools.submitText": "Soumettez n'importe quel outil IA pour examen. Les outils vérifiés reçoivent le badge.", "tools.submitBtn": "Soumettre un Outil",
  "tools.emptyTitle": "Aucun outil trouvé", "tools.emptyText": "Aucun outil IA ne correspond à vos filtres actuels.",
  "tools.clearAll": "Effacer les filtres", "tools.showing": "Affichage", "tools.of": "sur", "tools.toolsWord": "outils",
  "filter.all": "Tous", "filter.free": "Gratuit", "filter.freemium": "Freemium", "filter.premium": "Premium", "filter.allPricing": "Tous les Prix",
  "filter.text": "Texte", "filter.image": "Image", "filter.audio": "Audio", "filter.code": "Code", "filter.video": "Vidéo", "filter.allTypes": "Tous les Types",
  "sort.mostPopular": "Plus Populaire", "sort.topRated": "Mieux Noté", "sort.az": "A–Z",
  "domain.all": "Tous", "domain.llms": "LLMs", "domain.codeAI": "Code IA", "domain.imageGen": "Génération d'Images",
  "domain.voiceAI": "Voix IA", "domain.agents": "Agents", "domain.marketing": "Marketing", "domain.design": "Design",
  "news.title": "Hub Actualités IA", "news.subtitle": "Chaque histoire en exactement 3 points — le signal, pas le bruit.",
  "news.liveFeed": "Flux en Direct", "news.searchPlaceholder": "Rechercher actualités, sujets ou sources…",
  "news.aiSummary": "Résumé IA", "news.featured": "Histoire à la Une", "news.minRead": "min de lecture", "news.source": "Source",
  "news.articles": "articles", "news.in": "dans", "news.matching": "correspondant à", "news.clear": "Effacer",
  "news.emptyTitle": "Aucun article trouvé", "news.emptyText": "Essayez un terme ou une catégorie différente.",
  "news.viewAll": "Voir toutes les actualités", "news.newsletterTitle": "Recevez des digests dans votre boîte mail",
  "news.newsletterText": "Actualités IA hebdomadaires — toujours 3 points.", "news.joinNewsletter": "Rejoindre la Newsletter",
  "news.showFull": "Afficher le résumé complet", "news.showLess": "Afficher moins",
  "models.title": "Classement des Modèles", "models.subtitle": "Comparaison des meilleurs modèles fondamentaux par performance et capacités.",
  "models.model": "Modèle", "models.provider": "Fournisseur", "models.type": "Type", "models.context": "Contexte",
  "models.openSource": "Open Source", "models.score": "Score", "models.yes": "Oui", "models.no": "Non",
  "footer.tagline": "Votre centre de commandement pour toute l'intelligence artificielle.",
  "footer.explore": "Explorer", "footer.community": "Communauté", "footer.company": "Entreprise",
  "footer.copyright": "Global AI Hub. Tous droits réservés.",
  "footer.tools": "Outils", "footer.news": "Actualités", "footer.models": "Modèles", "footer.leaderboard": "Classement",
  "footer.discord": "Discord", "footer.twitter": "Twitter / X", "footer.newsletter": "Newsletter", "footer.github": "GitHub",
  "footer.about": "À propos", "footer.blog": "Blog", "footer.contact": "Contact", "footer.privacy": "Confidentialité",
  "common.retry": "Réessayer", "common.updatedDaily": "Mis à jour quotidiennement",
};

const de: Translations = {
  "nav.home": "Startseite", "nav.tools": "Tools", "nav.news": "Neuigkeiten", "nav.models": "Modelle",
  "nav.submitTool": "Tool einreichen", "nav.getStarted": "Loslegen", "nav.language": "Sprache",
  "hero.badge": "Jetzt über 2.400 KI-Tools in Echtzeit verfolgt",
  "hero.h1": "Das gesamte KI-Universum,", "hero.h2": "Personalisiert für Sie.",
  "hero.h3": "Entdecken, Aufbauen und die Zukunft skalieren.",
  "hero.subtitle": "Ihr ultimatives Ziel für KI-Tools, Modellneuigkeiten und kuratierte Ressourcen. Ob Ingenieur, Forscher oder Gründer — alles was Sie brauchen, um vorne zu bleiben.",
  "hero.exploreCta": "Tools erkunden", "hero.newsletterCta": "Newsletter beitreten",
  "hero.mediaTitle": "Ansehen: Der Stand der KI 2026", "hero.mediaSubtitle": "3-Min-Überblick · Aktualisiert Juni 2026",
  "hero.mediaLabel": "Interaktives KI-Universum · Live-Daten · Täglich aktualisiert",
  "stats.tools": "KI-Tools", "stats.countries": "Länder", "stats.researchers": "Forscher", "stats.readers": "Newsletter-Leser",
  "home.categoriesTitle": "Nach Kategorie erkunden", "home.categoriesSubtitle": "Tauchen Sie tief in spezialisierte Bereiche der künstlichen Intelligenz ein.",
  "cat.llms": "LLMs", "cat.llmsDesc": "Große Sprachmodelle & Chatbots",
  "cat.imageGen": "Bildgenerierung", "cat.imageGenDesc": "KI-Bildgenerierung & -bearbeitung",
  "cat.codeAI": "Code-KI", "cat.codeAIDesc": "Copiloten & Coding-Assistenten",
  "cat.voiceAI": "Sprach-KI", "cat.voiceAIDesc": "Text-zu-Sprache & Stimmklonen",
  "cat.agents": "Agenten", "cat.agentsDesc": "Autonome KI-Agenten",
  "cat.dataAI": "Daten-KI", "cat.dataAIDesc": "Datenanalyse & Visualisierung",
  "faq.badge": "Haben Sie Fragen?", "faq.title": "Häufig gestellte Fragen", "faq.subtitle": "Alles, was Sie über Global AI Hub wissen müssen.",
  "newsletter.badge": "Wöchentlicher KI-Intelligenz-Digest",
  "newsletter.title": "Bleiben Sie der", "newsletter.titleHighlight": "KI-Kurve voraus",
  "newsletter.subtitle": "Erhalten Sie einen wöchentlichen Digest der größten KI-Tool-Launches, Modellveröffentlichungen und Forschungsdurchbrüche — direkt in Ihren Posteingang.",
  "newsletter.placeholder": "sie@beispiel.de", "newsletter.btnJoin": "Newsletter beitreten", "newsletter.btnJoining": "Beitritt…",
  "newsletter.successTitle": "Sie sind dabei!", "newsletter.successText": "Willkommen in der Global AI Hub Community. Erster Digest kommt diese Woche.",
  "newsletter.disclaimer": "Kein Spam. Jederzeit kündbar. Über 12.000 Abonnenten.",
  "tools.title": "KI-Tools-Verzeichnis", "tools.subtitle": "Entdecken, vergleichen und starten Sie die besten KI-Tools jeder Kategorie.",
  "tools.searchPlaceholder": "Nach Name, Kategorie oder Stichwort suchen…", "tools.filtersBtn": "Filter",
  "tools.updatedDaily": "Täglich aktualisiert", "tools.visit": "Besuchen",
  "tools.verified": "Verifiziert von Global AI Hub",
  "tools.submitTitle": "Kennen Sie ein fehlendes Tool?", "tools.submitText": "Reichen Sie ein beliebiges KI-Tool zur Prüfung ein. Verifizierte Tools erhalten das Badge.", "tools.submitBtn": "Tool einreichen",
  "tools.emptyTitle": "Keine Tools gefunden", "tools.emptyText": "Keine KI-Tools entsprechen Ihren aktuellen Filtern.",
  "tools.clearAll": "Alle Filter löschen", "tools.showing": "Zeige", "tools.of": "von", "tools.toolsWord": "Tools",
  "filter.all": "Alle", "filter.free": "Kostenlos", "filter.freemium": "Freemium", "filter.premium": "Premium", "filter.allPricing": "Alle Preise",
  "filter.text": "Text", "filter.image": "Bild", "filter.audio": "Audio", "filter.code": "Code", "filter.video": "Video", "filter.allTypes": "Alle Typen",
  "sort.mostPopular": "Beliebteste", "sort.topRated": "Bestbewertet", "sort.az": "A–Z",
  "domain.all": "Alle", "domain.llms": "LLMs", "domain.codeAI": "Code-KI", "domain.imageGen": "Bildgenerierung",
  "domain.voiceAI": "Sprach-KI", "domain.agents": "Agenten", "domain.marketing": "Marketing", "domain.design": "Design",
  "news.title": "KI-Nachrichten-Hub", "news.subtitle": "Jede Geschichte auf genau 3 Punkte destilliert — das Signal, nicht das Rauschen.",
  "news.liveFeed": "Live-Feed", "news.searchPlaceholder": "Nachrichten, Themen oder Quellen suchen…",
  "news.aiSummary": "KI-Zusammenfassung", "news.featured": "Hauptgeschichte", "news.minRead": "Min. Lesezeit", "news.source": "Quelle",
  "news.articles": "Artikel", "news.in": "in", "news.matching": "passend zu", "news.clear": "Löschen",
  "news.emptyTitle": "Keine Artikel gefunden", "news.emptyText": "Versuchen Sie einen anderen Suchbegriff oder eine andere Kategorie.",
  "news.viewAll": "Alle Nachrichten anzeigen", "news.newsletterTitle": "Erhalten Sie Digests in Ihrem Posteingang",
  "news.newsletterText": "Wöchentliche KI-Nachrichten — immer 3 Punkte.", "news.joinNewsletter": "Newsletter beitreten",
  "news.showFull": "Vollständige Zusammenfassung anzeigen", "news.showLess": "Weniger anzeigen",
  "models.title": "Modell-Bestenliste", "models.subtitle": "Vergleich der besten Foundation-Modelle nach Benchmark-Leistung.",
  "models.model": "Modell", "models.provider": "Anbieter", "models.type": "Typ", "models.context": "Kontext",
  "models.openSource": "Open Source", "models.score": "Punktzahl", "models.yes": "Ja", "models.no": "Nein",
  "footer.tagline": "Ihr Kommandozentrum für alles rund um künstliche Intelligenz.",
  "footer.explore": "Erkunden", "footer.community": "Gemeinschaft", "footer.company": "Unternehmen",
  "footer.copyright": "Global AI Hub. Alle Rechte vorbehalten.",
  "footer.tools": "Tools", "footer.news": "Nachrichten", "footer.models": "Modelle", "footer.leaderboard": "Bestenliste",
  "footer.discord": "Discord", "footer.twitter": "Twitter / X", "footer.newsletter": "Newsletter", "footer.github": "GitHub",
  "footer.about": "Über uns", "footer.blog": "Blog", "footer.contact": "Kontakt", "footer.privacy": "Datenschutz",
  "common.retry": "Wiederholen", "common.updatedDaily": "Täglich aktualisiert",
};

const zh: Translations = {
  "nav.home": "首页", "nav.tools": "工具", "nav.news": "新闻", "nav.models": "模型",
  "nav.submitTool": "提交工具", "nav.getStarted": "开始使用", "nav.language": "语言",
  "hero.badge": "实时追踪超过2,400个AI工具",
  "hero.h1": "整个AI宇宙，", "hero.h2": "为您量身定制。",
  "hero.h3": "探索、构建并扩展未来。",
  "hero.subtitle": "您的AI工具、模型新闻和精选资源的终极目的地。无论您是工程师、研究员还是创始人——您需要的一切都在这里。",
  "hero.exploreCta": "探索工具", "hero.newsletterCta": "订阅通讯",
  "hero.mediaTitle": "观看：2026年AI现状", "hero.mediaSubtitle": "3分钟概览 · 2026年6月更新",
  "hero.mediaLabel": "互动AI宇宙 · 实时数据 · 每日更新",
  "stats.tools": "AI工具", "stats.countries": "国家", "stats.researchers": "研究人员", "stats.readers": "通讯读者",
  "home.categoriesTitle": "按类别探索", "home.categoriesSubtitle": "深入探索人工智能的专业领域。",
  "cat.llms": "大语言模型", "cat.llmsDesc": "大型语言模型与聊天机器人",
  "cat.imageGen": "图像生成", "cat.imageGenDesc": "AI图像生成与编辑",
  "cat.codeAI": "代码AI", "cat.codeAIDesc": "代码助手与AI编程",
  "cat.voiceAI": "语音AI", "cat.voiceAIDesc": "文字转语音与声音克隆",
  "cat.agents": "AI智能体", "cat.agentsDesc": "自主AI代理",
  "cat.dataAI": "数据AI", "cat.dataAIDesc": "数据分析与可视化",
  "faq.badge": "有疑问？", "faq.title": "常见问题", "faq.subtitle": "关于Global AI Hub您需要了解的一切。",
  "newsletter.badge": "每周AI智能摘要",
  "newsletter.title": "保持领先于", "newsletter.titleHighlight": "AI发展曲线",
  "newsletter.subtitle": "每周获取精选的最大AI工具发布、模型版本和研究突破摘要——直接发送到您的收件箱。",
  "newsletter.placeholder": "您的邮箱@example.com", "newsletter.btnJoin": "订阅通讯", "newsletter.btnJoining": "订阅中…",
  "newsletter.successTitle": "您已加入！", "newsletter.successText": "欢迎加入Global AI Hub社区。首期摘要本周送达。",
  "newsletter.disclaimer": "无垃圾邮件。随时取消订阅。已有12,000+订阅者。",
  "tools.title": "AI工具目录", "tools.subtitle": "发现、比较并启动各类别最佳AI工具。",
  "tools.searchPlaceholder": "按名称、类别或关键词搜索…", "tools.filtersBtn": "筛选",
  "tools.updatedDaily": "每日更新", "tools.visit": "访问",
  "tools.verified": "由Global AI Hub认证",
  "tools.submitTitle": "知道我们遗漏的工具吗？", "tools.submitText": "提交任何AI工具供审核。已验证的工具将获得徽章。", "tools.submitBtn": "提交工具",
  "tools.emptyTitle": "未找到工具", "tools.emptyText": "没有AI工具匹配您当前的筛选条件。",
  "tools.clearAll": "清除所有筛选", "tools.showing": "显示", "tools.of": "共", "tools.toolsWord": "个工具",
  "filter.all": "全部", "filter.free": "免费", "filter.freemium": "免费增值", "filter.premium": "高级", "filter.allPricing": "所有价格",
  "filter.text": "文本", "filter.image": "图像", "filter.audio": "音频", "filter.code": "代码", "filter.video": "视频", "filter.allTypes": "所有类型",
  "sort.mostPopular": "最受欢迎", "sort.topRated": "评分最高", "sort.az": "A–Z",
  "domain.all": "全部", "domain.llms": "大语言模型", "domain.codeAI": "代码AI", "domain.imageGen": "图像生成",
  "domain.voiceAI": "语音AI", "domain.agents": "AI智能体", "domain.marketing": "营销", "domain.design": "设计",
  "news.title": "AI新闻中心", "news.subtitle": "每个故事精炼为恰好3个要点——信号，而非噪音。",
  "news.liveFeed": "实时动态", "news.searchPlaceholder": "搜索新闻、话题或来源…",
  "news.aiSummary": "AI摘要", "news.featured": "精选故事", "news.minRead": "分钟阅读", "news.source": "来源",
  "news.articles": "篇文章", "news.in": "在", "news.matching": "匹配", "news.clear": "清除",
  "news.emptyTitle": "未找到文章", "news.emptyText": "请尝试不同的搜索词或类别。",
  "news.viewAll": "查看所有新闻", "news.newsletterTitle": "将摘要发送到您的收件箱",
  "news.newsletterText": "每周AI新闻——始终3个要点。", "news.joinNewsletter": "订阅通讯",
  "news.showFull": "显示完整摘要", "news.showLess": "显示更少",
  "models.title": "模型排行榜", "models.subtitle": "按基准测试性能比较顶级基础模型。",
  "models.model": "模型", "models.provider": "提供商", "models.type": "类型", "models.context": "上下文长度",
  "models.openSource": "开源", "models.score": "评分", "models.yes": "是", "models.no": "否",
  "footer.tagline": "您的人工智能全方位指挥中心。",
  "footer.explore": "探索", "footer.community": "社区", "footer.company": "公司",
  "footer.copyright": "Global AI Hub。版权所有。",
  "footer.tools": "工具", "footer.news": "新闻", "footer.models": "模型", "footer.leaderboard": "排行榜",
  "footer.discord": "Discord", "footer.twitter": "Twitter / X", "footer.newsletter": "通讯", "footer.github": "GitHub",
  "footer.about": "关于我们", "footer.blog": "博客", "footer.contact": "联系我们", "footer.privacy": "隐私政策",
  "common.retry": "重试", "common.updatedDaily": "每日更新",
};

const ar: Translations = {
  "nav.home": "الرئيسية", "nav.tools": "الأدوات", "nav.news": "الأخبار", "nav.models": "النماذج",
  "nav.submitTool": "أضف أداة", "nav.getStarted": "ابدأ الآن", "nav.language": "اللغة",
  "hero.badge": "نتابع الآن أكثر من 2,400 أداة ذكاء اصطناعي في الوقت الفعلي",
  "hero.h1": "كون الذكاء الاصطناعي بأكمله،", "hero.h2": "مخصص لك.",
  "hero.h3": "اكتشف، ابنِ، وقم بتوسيع المستقبل.",
  "hero.subtitle": "وجهتك المثالية لأدوات الذكاء الاصطناعي وأخبار النماذج والموارد المنتقاة. سواء كنت مهندسًا أو باحثًا أو مؤسسًا — كل ما تحتاجه للبقاء في المقدمة موجود هنا.",
  "hero.exploreCta": "استكشف الأدوات", "hero.newsletterCta": "انضم للنشرة",
  "hero.mediaTitle": "شاهد: حالة الذكاء الاصطناعي في 2026", "hero.mediaSubtitle": "نظرة عامة 3 دقائق · محدث يونيو 2026",
  "hero.mediaLabel": "كون ذكاء اصطناعي تفاعلي · بيانات مباشرة · محدث يومياً",
  "stats.tools": "أدوات الذكاء الاصطناعي", "stats.countries": "دولة", "stats.researchers": "باحث", "stats.readers": "قراء النشرة",
  "home.categoriesTitle": "استكشف حسب الفئة", "home.categoriesSubtitle": "تعمق في مجالات الذكاء الاصطناعي المتخصصة.",
  "cat.llms": "نماذج اللغة الكبيرة", "cat.llmsDesc": "نماذج اللغة الكبيرة وروبوتات المحادثة",
  "cat.imageGen": "توليد الصور", "cat.imageGenDesc": "توليد وتحرير الصور بالذكاء الاصطناعي",
  "cat.codeAI": "ذكاء البرمجة", "cat.codeAIDesc": "المساعدون البرمجيون ومساعدو الكود",
  "cat.voiceAI": "ذكاء الصوت", "cat.voiceAIDesc": "تحويل النص إلى كلام واستنساخ الصوت",
  "cat.agents": "الوكلاء", "cat.agentsDesc": "وكلاء الذكاء الاصطناعي المستقلون",
  "cat.dataAI": "ذكاء البيانات", "cat.dataAIDesc": "تحليل البيانات والتصور",
  "faq.badge": "لديك أسئلة؟", "faq.title": "الأسئلة الشائعة", "faq.subtitle": "كل ما تحتاج معرفته عن Global AI Hub.",
  "newsletter.badge": "ملخص ذكاء اصطناعي أسبوعي",
  "newsletter.title": "ابقَ في المقدمة على", "newsletter.titleHighlight": "منحنى الذكاء الاصطناعي",
  "newsletter.subtitle": "احصل على ملخص أسبوعي منتقى لأكبر إطلاقات أدوات الذكاء الاصطناعي وإصدارات النماذج وإنجازات البحث — مباشرة إلى صندوق بريدك.",
  "newsletter.placeholder": "بريدك@example.com", "newsletter.btnJoin": "انضم للنشرة", "newsletter.btnJoining": "جارٍ الاشتراك…",
  "newsletter.successTitle": "أنت الآن مشترك!", "newsletter.successText": "مرحباً بك في مجتمع Global AI Hub. يصل الملخص الأول هذا الأسبوع.",
  "newsletter.disclaimer": "لا رسائل مزعجة. إلغاء الاشتراك في أي وقت. أكثر من 12,000 مشترك.",
  "tools.title": "دليل أدوات الذكاء الاصطناعي", "tools.subtitle": "اكتشف وقارن وأطلق أفضل أدوات الذكاء الاصطناعي في كل فئة.",
  "tools.searchPlaceholder": "البحث بالاسم أو الفئة أو الكلمة الرئيسية…", "tools.filtersBtn": "الفلاتر",
  "tools.updatedDaily": "محدث يومياً", "tools.visit": "زيارة",
  "tools.verified": "موثق من قِبَل Global AI Hub",
  "tools.submitTitle": "هل تعرف أداة نفتقدها؟", "tools.submitText": "أرسل أي أداة ذكاء اصطناعي للمراجعة. الأدوات الموثقة تحصل على شارة التحقق.", "tools.submitBtn": "أضف أداة",
  "tools.emptyTitle": "لم يتم العثور على أدوات", "tools.emptyText": "لا توجد أدوات ذكاء اصطناعي تطابق الفلاتر الحالية.",
  "tools.clearAll": "مسح جميع الفلاتر", "tools.showing": "عرض", "tools.of": "من أصل", "tools.toolsWord": "أداة",
  "filter.all": "الكل", "filter.free": "مجاني", "filter.freemium": "مجاني جزئياً", "filter.premium": "مميز", "filter.allPricing": "جميع الأسعار",
  "filter.text": "نص", "filter.image": "صورة", "filter.audio": "صوت", "filter.code": "كود", "filter.video": "فيديو", "filter.allTypes": "جميع الأنواع",
  "sort.mostPopular": "الأكثر شيوعاً", "sort.topRated": "الأعلى تقييماً", "sort.az": "أ–ي",
  "domain.all": "الكل", "domain.llms": "نماذج اللغة", "domain.codeAI": "ذكاء البرمجة", "domain.imageGen": "توليد الصور",
  "domain.voiceAI": "ذكاء الصوت", "domain.agents": "الوكلاء", "domain.marketing": "التسويق", "domain.design": "التصميم",
  "news.title": "مركز أخبار الذكاء الاصطناعي", "news.subtitle": "كل قصة مُلخَّصة في 3 نقاط بالضبط — الإشارة لا الضجيج.",
  "news.liveFeed": "تغذية مباشرة", "news.searchPlaceholder": "البحث في الأخبار والمواضيع والمصادر…",
  "news.aiSummary": "ملخص الذكاء الاصطناعي", "news.featured": "القصة المميزة", "news.minRead": "د قراءة", "news.source": "المصدر",
  "news.articles": "مقالة", "news.in": "في", "news.matching": "مطابق لـ", "news.clear": "مسح",
  "news.emptyTitle": "لم يتم العثور على مقالات", "news.emptyText": "جرب مصطلح بحث أو فئة مختلفة.",
  "news.viewAll": "عرض جميع الأخبار", "news.newsletterTitle": "احصل على الملخصات في صندوق بريدك",
  "news.newsletterText": "أخبار الذكاء الاصطناعي الأسبوعية — دائماً 3 نقاط.", "news.joinNewsletter": "انضم للنشرة",
  "news.showFull": "عرض الملخص الكامل", "news.showLess": "عرض أقل",
  "models.title": "لوحة صدارة النماذج", "models.subtitle": "مقارنة أفضل النماذج الأساسية حسب أداء المعيار.",
  "models.model": "النموذج", "models.provider": "المزود", "models.type": "النوع", "models.context": "السياق",
  "models.openSource": "مفتوح المصدر", "models.score": "النتيجة", "models.yes": "نعم", "models.no": "لا",
  "footer.tagline": "مركز قيادتك لكل ما يتعلق بالذكاء الاصطناعي.",
  "footer.explore": "استكشف", "footer.community": "المجتمع", "footer.company": "الشركة",
  "footer.copyright": "Global AI Hub. جميع الحقوق محفوظة.",
  "footer.tools": "الأدوات", "footer.news": "الأخبار", "footer.models": "النماذج", "footer.leaderboard": "لوحة الصدارة",
  "footer.discord": "Discord", "footer.twitter": "تويتر / X", "footer.newsletter": "النشرة", "footer.github": "GitHub",
  "footer.about": "معلومات عنا", "footer.blog": "المدونة", "footer.contact": "اتصل بنا", "footer.privacy": "الخصوصية",
  "common.retry": "إعادة المحاولة", "common.updatedDaily": "محدث يومياً",
};

const ur: Translations = {
  "nav.home": "ہوم", "nav.tools": "ٹولز", "nav.news": "خبریں", "nav.models": "ماڈلز",
  "nav.submitTool": "ٹول جمع کریں", "nav.getStarted": "شروع کریں", "nav.language": "زبان",
  "hero.badge": "ابھی 2,400+ AI ٹولز کو ریئل ٹائم میں ٹریک کر رہے ہیں",
  "hero.h1": "مکمل AI کائنات،", "hero.h2": "آپ کے لیے ذاتی۔",
  "hero.h3": "دریافت کریں، بنائیں، اور مستقبل کو پھیلائیں۔",
  "hero.subtitle": "AI ٹولز، ماڈل خبروں اور منتخب وسائل کے لیے آپ کی حتمی منزل۔ چاہے آپ انجینئر ہوں، محقق یا بانی — آگے رہنے کے لیے آپ کو جو کچھ چاہیے وہ یہاں ہے۔",
  "hero.exploreCta": "ٹولز دیکھیں", "hero.newsletterCta": "نیوزلیٹر جوائن کریں",
  "hero.mediaTitle": "دیکھیں: 2026 میں AI کی حالت", "hero.mediaSubtitle": "3 منٹ کا جائزہ · جون 2026 کو اپڈیٹ",
  "hero.mediaLabel": "انٹرایکٹو AI کائنات · لائیو ڈیٹا · روزانہ اپڈیٹ",
  "stats.tools": "AI ٹولز", "stats.countries": "ممالک", "stats.researchers": "محققین", "stats.readers": "نیوزلیٹر قارئین",
  "home.categoriesTitle": "زمرے کے مطابق دیکھیں", "home.categoriesSubtitle": "مصنوعی ذہانت کے خصوصی شعبوں میں گہرائی سے دیکھیں۔",
  "cat.llms": "بڑے زبانی ماڈلز", "cat.llmsDesc": "بڑے زبانی ماڈلز اور چیٹ بوٹس",
  "cat.imageGen": "تصویر ساز", "cat.imageGenDesc": "AI تصویر کی تخلیق اور ترمیم",
  "cat.codeAI": "کوڈ AI", "cat.codeAIDesc": "کوپائلٹس اور کوڈنگ اسسٹنٹس",
  "cat.voiceAI": "آواز AI", "cat.voiceAIDesc": "متن سے تقریر اور آواز کلوننگ",
  "cat.agents": "ایجنٹس", "cat.agentsDesc": "خودمختار AI ایجنٹس",
  "cat.dataAI": "ڈیٹا AI", "cat.dataAIDesc": "ڈیٹا تجزیہ اور ویژوالائزیشن",
  "faq.badge": "سوالات ہیں؟", "faq.title": "اکثر پوچھے جانے والے سوالات", "faq.subtitle": "Global AI Hub کے بارے میں آپ کو جو کچھ جاننا چاہیے۔",
  "newsletter.badge": "ہفتہ وار AI انٹیلیجنس ڈائجسٹ",
  "newsletter.title": "سے آگے رہیں", "newsletter.titleHighlight": "AI کرو",
  "newsletter.subtitle": "سب سے بڑے AI ٹول لانچز، ماڈل ریلیزز اور تحقیقی پیش رفت کا ہفتہ وار ڈائجسٹ براہ راست اپنے ان باکس میں پائیں۔",
  "newsletter.placeholder": "آپ@example.com", "newsletter.btnJoin": "نیوزلیٹر جوائن کریں", "newsletter.btnJoining": "شامل ہو رہے ہیں…",
  "newsletter.successTitle": "آپ شامل ہو گئے!", "newsletter.successText": "Global AI Hub کمیونٹی میں خوش آمدید۔ پہلا ڈائجسٹ اس ہفتے آئے گا۔",
  "newsletter.disclaimer": "کوئی اسپام نہیں۔ کبھی بھی ان سبسکرائب کریں۔ 12,000+ سبسکرائبرز پہلے سے موجود ہیں۔",
  "tools.title": "AI ٹولز ڈائریکٹری", "tools.subtitle": "ہر زمرے میں بہترین AI ٹولز دریافت کریں، موازنہ کریں اور لانچ کریں۔",
  "tools.searchPlaceholder": "نام، زمرے یا کلیدی لفظ سے تلاش کریں…", "tools.filtersBtn": "فلٹرز",
  "tools.updatedDaily": "روزانہ اپڈیٹ", "tools.visit": "دیکھیں",
  "tools.verified": "Global AI Hub کی طرف سے تصدیق شدہ",
  "tools.submitTitle": "کوئی ٹول جو ہم سے چھوٹ گیا؟", "tools.submitText": "کوئی بھی AI ٹول جائزے کے لیے جمع کریں۔ تصدیق شدہ ٹولز کو بیج ملتا ہے۔", "tools.submitBtn": "ٹول جمع کریں",
  "tools.emptyTitle": "کوئی ٹول نہیں ملا", "tools.emptyText": "موجودہ فلٹرز سے کوئی AI ٹول میچ نہیں ہوا۔",
  "tools.clearAll": "تمام فلٹرز صاف کریں", "tools.showing": "دکھا رہے ہیں", "tools.of": "کل", "tools.toolsWord": "ٹولز",
  "filter.all": "سب", "filter.free": "مفت", "filter.freemium": "جزوی مفت", "filter.premium": "پریمیم", "filter.allPricing": "تمام قیمتیں",
  "filter.text": "متن", "filter.image": "تصویر", "filter.audio": "آواز", "filter.code": "کوڈ", "filter.video": "ویڈیو", "filter.allTypes": "تمام اقسام",
  "sort.mostPopular": "سب سے مقبول", "sort.topRated": "سب سے زیادہ درجہ بند", "sort.az": "ا–ی",
  "domain.all": "سب", "domain.llms": "زبانی ماڈلز", "domain.codeAI": "کوڈ AI", "domain.imageGen": "تصویر ساز",
  "domain.voiceAI": "آواز AI", "domain.agents": "ایجنٹس", "domain.marketing": "مارکیٹنگ", "domain.design": "ڈیزائن",
  "news.title": "AI خبریں مرکز", "news.subtitle": "ہر کہانی کو بالکل 3 نکات میں تبدیل کیا گیا — سگنل، شور نہیں۔",
  "news.liveFeed": "لائیو فیڈ", "news.searchPlaceholder": "خبریں، موضوعات یا ذرائع تلاش کریں…",
  "news.aiSummary": "AI خلاصہ", "news.featured": "نمایاں کہانی", "news.minRead": "منٹ مطالعہ", "news.source": "ماخذ",
  "news.articles": "مضامین", "news.in": "میں", "news.matching": "سے ملتا", "news.clear": "صاف کریں",
  "news.emptyTitle": "کوئی مضمون نہیں ملا", "news.emptyText": "کوئی اور تلاش یا زمرہ آزمائیں۔",
  "news.viewAll": "تمام خبریں دیکھیں", "news.newsletterTitle": "اپنے ان باکس میں ڈائجسٹ پائیں",
  "news.newsletterText": "ہفتہ وار AI خبریں — ہمیشہ 3 نکات۔", "news.joinNewsletter": "نیوزلیٹر جوائن کریں",
  "news.showFull": "مکمل خلاصہ دکھائیں", "news.showLess": "کم دکھائیں",
  "models.title": "ماڈلز لیڈربورڈ", "models.subtitle": "بنچ مارک کارکردگی کے مطابق سرفہرست فاؤنڈیشن ماڈلز کا موازنہ۔",
  "models.model": "ماڈل", "models.provider": "فراہم کنندہ", "models.type": "قسم", "models.context": "سیاق",
  "models.openSource": "اوپن سورس", "models.score": "اسکور", "models.yes": "ہاں", "models.no": "نہیں",
  "footer.tagline": "مصنوعی ذہانت کے ہر پہلو کے لیے آپ کا کمانڈ سینٹر۔",
  "footer.explore": "دریافت", "footer.community": "کمیونٹی", "footer.company": "کمپنی",
  "footer.copyright": "Global AI Hub۔ جملہ حقوق محفوظ ہیں۔",
  "footer.tools": "ٹولز", "footer.news": "خبریں", "footer.models": "ماڈلز", "footer.leaderboard": "لیڈربورڈ",
  "footer.discord": "Discord", "footer.twitter": "ٹویٹر / X", "footer.newsletter": "نیوزلیٹر", "footer.github": "GitHub",
  "footer.about": "ہمارے بارے میں", "footer.blog": "بلاگ", "footer.contact": "رابطہ کریں", "footer.privacy": "رازداری",
  "common.retry": "دوبارہ کوشش کریں", "common.updatedDaily": "روزانہ اپڈیٹ",
};

const fa: Translations = {
  "nav.home": "خانه", "nav.tools": "ابزارها", "nav.news": "اخبار", "nav.models": "مدل‌ها",
  "nav.submitTool": "ارسال ابزار", "nav.getStarted": "شروع کنید", "nav.language": "زبان",
  "hero.badge": "در حال ردیابی بیش از ۲٬۴۰۰ ابزار هوش مصنوعی در زمان واقعی",
  "hero.h1": "کل جهان هوش مصنوعی،", "hero.h2": "شخصی‌سازی شده برای شما.",
  "hero.h3": "کشف کنید، بسازید و آینده را گسترش دهید.",
  "hero.subtitle": "مقصد نهایی شما برای ابزارهای هوش مصنوعی، اخبار مدل‌ها و منابع ویرایش شده. چه مهندس باشید، چه محقق یا بنیان‌گذار — هر آنچه برای پیشرفت نیاز دارید اینجاست.",
  "hero.exploreCta": "کاوش ابزارها", "hero.newsletterCta": "عضویت در خبرنامه",
  "hero.mediaTitle": "تماشا: وضعیت هوش مصنوعی در ۲۰۲۶", "hero.mediaSubtitle": "مرور ۳ دقیقه‌ای · به‌روز شده ژوئن ۲۰۲۶",
  "hero.mediaLabel": "جهان تعاملی هوش مصنوعی · داده‌های زنده · به‌روزرسانی روزانه",
  "stats.tools": "ابزارهای هوش مصنوعی", "stats.countries": "کشور", "stats.researchers": "محقق", "stats.readers": "خوانندگان خبرنامه",
  "home.categoriesTitle": "کاوش بر اساس دسته‌بندی", "home.categoriesSubtitle": "در حوزه‌های تخصصی هوش مصنوعی عمیق شوید.",
  "cat.llms": "مدل‌های زبانی بزرگ", "cat.llmsDesc": "مدل‌های زبانی بزرگ و چت‌بات‌ها",
  "cat.imageGen": "تولید تصویر", "cat.imageGenDesc": "تولید و ویرایش تصویر با هوش مصنوعی",
  "cat.codeAI": "هوش مصنوعی برای کد", "cat.codeAIDesc": "دستیارهای برنامه‌نویسی",
  "cat.voiceAI": "هوش مصنوعی صوتی", "cat.voiceAIDesc": "تبدیل متن به گفتار و شبیه‌سازی صدا",
  "cat.agents": "عوامل", "cat.agentsDesc": "عوامل مستقل هوش مصنوعی",
  "cat.dataAI": "هوش مصنوعی داده", "cat.dataAIDesc": "تحلیل داده و تجسم",
  "faq.badge": "سؤال دارید؟", "faq.title": "سؤالات متداول", "faq.subtitle": "هر آنچه باید درباره Global AI Hub بدانید.",
  "newsletter.badge": "خلاصه هفتگی هوش مصنوعی",
  "newsletter.title": "از", "newsletter.titleHighlight": "منحنی هوش مصنوعی جلوتر باشید",
  "newsletter.subtitle": "خلاصه هفتگی بزرگ‌ترین راه‌اندازی‌های ابزار هوش مصنوعی، انتشار مدل‌ها و پیشرفت‌های تحقیقاتی را مستقیم در صندوق ورودی خود دریافت کنید.",
  "newsletter.placeholder": "شما@example.com", "newsletter.btnJoin": "عضویت در خبرنامه", "newsletter.btnJoining": "در حال عضویت…",
  "newsletter.successTitle": "عضو شدید!", "newsletter.successText": "به جامعه Global AI Hub خوش آمدید. اولین خلاصه این هفته می‌رسد.",
  "newsletter.disclaimer": "بدون هرزنامه. لغو عضویت در هر زمان. بیش از ۱۲٬۰۰۰ عضو.",
  "tools.title": "فهرست ابزارهای هوش مصنوعی", "tools.subtitle": "بهترین ابزارهای هوش مصنوعی را در هر دسته‌بندی کشف، مقایسه و راه‌اندازی کنید.",
  "tools.searchPlaceholder": "جستجو بر اساس نام، دسته‌بندی یا کلیدواژه…", "tools.filtersBtn": "فیلترها",
  "tools.updatedDaily": "به‌روزرسانی روزانه", "tools.visit": "بازدید",
  "tools.verified": "تأیید شده توسط Global AI Hub",
  "tools.submitTitle": "ابزاری می‌شناسید که نداریم؟", "tools.submitText": "هر ابزار هوش مصنوعی را برای بررسی ارسال کنید.", "tools.submitBtn": "ارسال ابزار",
  "tools.emptyTitle": "هیچ ابزاری پیدا نشد", "tools.emptyText": "هیچ ابزار هوش مصنوعی با فیلترهای فعلی مطابقت ندارد.",
  "tools.clearAll": "پاک کردن همه فیلترها", "tools.showing": "نمایش", "tools.of": "از", "tools.toolsWord": "ابزار",
  "filter.all": "همه", "filter.free": "رایگان", "filter.freemium": "فریمیوم", "filter.premium": "پریمیوم", "filter.allPricing": "همه قیمت‌ها",
  "filter.text": "متن", "filter.image": "تصویر", "filter.audio": "صوت", "filter.code": "کد", "filter.video": "ویدیو", "filter.allTypes": "همه انواع",
  "sort.mostPopular": "محبوب‌ترین", "sort.topRated": "بالاترین امتیاز", "sort.az": "الف–ی",
  "domain.all": "همه", "domain.llms": "مدل‌های زبانی", "domain.codeAI": "هوش مصنوعی کد", "domain.imageGen": "تولید تصویر",
  "domain.voiceAI": "هوش مصنوعی صوتی", "domain.agents": "عوامل", "domain.marketing": "بازاریابی", "domain.design": "طراحی",
  "news.title": "مرکز اخبار هوش مصنوعی", "news.subtitle": "هر خبر به دقیقاً ۳ نکته تبدیل شده — سیگنال، نه نویز.",
  "news.liveFeed": "فید زنده", "news.searchPlaceholder": "جستجوی اخبار، موضوعات یا منابع…",
  "news.aiSummary": "خلاصه هوش مصنوعی", "news.featured": "خبر ویژه", "news.minRead": "دقیقه مطالعه", "news.source": "منبع",
  "news.articles": "مقاله", "news.in": "در", "news.matching": "مطابق با", "news.clear": "پاک کردن",
  "news.emptyTitle": "هیچ مقاله‌ای پیدا نشد", "news.emptyText": "عبارت جستجو یا دسته‌بندی دیگری را امتحان کنید.",
  "news.viewAll": "مشاهده همه اخبار", "news.newsletterTitle": "خلاصه‌ها را در صندوق ورودی دریافت کنید",
  "news.newsletterText": "اخبار هفتگی هوش مصنوعی — همیشه ۳ نکته.", "news.joinNewsletter": "عضویت در خبرنامه",
  "news.showFull": "نمایش خلاصه کامل", "news.showLess": "نمایش کمتر",
  "models.title": "جدول رتبه‌بندی مدل‌ها", "models.subtitle": "مقایسه مدل‌های پایه برتر بر اساس عملکرد معیار.",
  "models.model": "مدل", "models.provider": "ارائه‌دهنده", "models.type": "نوع", "models.context": "زمینه",
  "models.openSource": "متن‌باز", "models.score": "امتیاز", "models.yes": "بله", "models.no": "خیر",
  "footer.tagline": "مرکز فرمان شما برای همه چیز در مورد هوش مصنوعی.",
  "footer.explore": "کاوش", "footer.community": "جامعه", "footer.company": "شرکت",
  "footer.copyright": "Global AI Hub. تمام حقوق محفوظ است.",
  "footer.tools": "ابزارها", "footer.news": "اخبار", "footer.models": "مدل‌ها", "footer.leaderboard": "جدول رتبه‌بندی",
  "footer.discord": "Discord", "footer.twitter": "توییتر / X", "footer.newsletter": "خبرنامه", "footer.github": "GitHub",
  "footer.about": "درباره ما", "footer.blog": "وبلاگ", "footer.contact": "تماس با ما", "footer.privacy": "حریم خصوصی",
  "common.retry": "تلاش مجدد", "common.updatedDaily": "به‌روزرسانی روزانه",
};

// Remaining languages — shorter but complete for all keys
function buildLang(overrides: Partial<Translations>): Translations {
  return { ...en, ...overrides };
}

const pt = buildLang({
  "nav.home": "Início", "nav.tools": "Ferramentas", "nav.news": "Notícias", "nav.models": "Modelos",
  "nav.submitTool": "Enviar Ferramenta", "nav.getStarted": "Começar", "nav.language": "Idioma",
  "hero.h1": "Todo o Universo da IA,", "hero.h2": "Personalizado para Você.",
  "hero.h3": "Descubra, Construa e Escale o Futuro.",
  "hero.subtitle": "Seu destino definitivo para ferramentas de IA, notícias de modelos e recursos curados.",
  "hero.exploreCta": "Explorar Ferramentas", "hero.newsletterCta": "Assinar Newsletter",
  "stats.tools": "Ferramentas IA", "stats.countries": "Países", "stats.researchers": "Pesquisadores", "stats.readers": "Leitores da Newsletter",
  "home.categoriesTitle": "Explorar por Categoria", "home.categoriesSubtitle": "Mergulhe em domínios especializados da inteligência artificial.",
  "tools.title": "Diretório de Ferramentas IA", "tools.searchPlaceholder": "Pesquisar por nome, categoria ou palavra-chave…",
  "tools.visit": "Visitar", "tools.verified": "Verificado pelo Global AI Hub",
  "filter.all": "Todos", "filter.free": "Grátis", "filter.premium": "Premium",
  "news.title": "Hub de Notícias IA", "news.liveFeed": "Feed ao Vivo", "news.source": "Fonte",
  "models.title": "Classificação de Modelos", "models.yes": "Sim", "models.no": "Não",
  "footer.explore": "Explorar", "footer.community": "Comunidade", "footer.company": "Empresa",
  "footer.copyright": "Global AI Hub. Todos os direitos reservados.",
  "footer.about": "Sobre", "footer.contact": "Contato", "footer.privacy": "Privacidade",
});

const it = buildLang({
  "nav.home": "Home", "nav.tools": "Strumenti", "nav.news": "Notizie", "nav.models": "Modelli",
  "nav.submitTool": "Invia Strumento", "nav.getStarted": "Inizia", "nav.language": "Lingua",
  "hero.h1": "Tutto l'Universo dell'IA,", "hero.h2": "Personalizzato per Te.",
  "hero.h3": "Scopri, Costruisci e Scala il Futuro.",
  "hero.subtitle": "La tua destinazione definitiva per strumenti IA, notizie e risorse curate.",
  "hero.exploreCta": "Esplora Strumenti", "hero.newsletterCta": "Iscriviti alla Newsletter",
  "stats.tools": "Strumenti IA", "stats.countries": "Paesi", "stats.researchers": "Ricercatori", "stats.readers": "Lettori Newsletter",
  "home.categoriesTitle": "Esplora per Categoria", "home.categoriesSubtitle": "Approfondisci i domini specializzati dell'intelligenza artificiale.",
  "tools.title": "Directory Strumenti IA", "tools.searchPlaceholder": "Cerca per nome, categoria o parola chiave…",
  "tools.visit": "Visita", "tools.verified": "Verificato da Global AI Hub",
  "filter.all": "Tutti", "filter.free": "Gratuito", "filter.premium": "Premium",
  "news.title": "Hub Notizie IA", "news.liveFeed": "Feed Live", "news.source": "Fonte",
  "models.title": "Classifica Modelli", "models.yes": "Sì", "models.no": "No",
  "footer.explore": "Esplora", "footer.community": "Comunità", "footer.company": "Azienda",
  "footer.copyright": "Global AI Hub. Tutti i diritti riservati.",
  "footer.about": "Chi Siamo", "footer.contact": "Contatto", "footer.privacy": "Privacy",
});

const nl = buildLang({
  "nav.home": "Home", "nav.tools": "Tools", "nav.news": "Nieuws", "nav.models": "Modellen",
  "nav.submitTool": "Tool Indienen", "nav.getStarted": "Aan de slag", "nav.language": "Taal",
  "hero.h1": "Het Volledige AI-Universum,", "hero.h2": "Gepersonaliseerd voor U.",
  "hero.h3": "Ontdek, Bouw en Schaal de Toekomst.",
  "hero.subtitle": "Uw ultieme bestemming voor AI-tools, modelnieuws en gecureerde resources.",
  "hero.exploreCta": "Verken Tools", "hero.newsletterCta": "Abonneer op Nieuwsbrief",
  "stats.tools": "AI Tools", "stats.countries": "Landen", "stats.researchers": "Onderzoekers", "stats.readers": "Nieuwsbrief Lezers",
  "home.categoriesTitle": "Verkennen per Categorie", "home.categoriesSubtitle": "Duik diep in gespecialiseerde domeinen van kunstmatige intelligentie.",
  "tools.title": "AI Tools Directory", "tools.searchPlaceholder": "Zoeken op naam, categorie of trefwoord…",
  "tools.visit": "Bezoeken", "tools.verified": "Geverifieerd door Global AI Hub",
  "filter.all": "Alle", "filter.free": "Gratis", "filter.premium": "Premium",
  "news.title": "AI Nieuws Hub", "news.liveFeed": "Live Feed", "news.source": "Bron",
  "models.title": "Modellen Ranglijst", "models.yes": "Ja", "models.no": "Nee",
  "footer.explore": "Verkennen", "footer.community": "Gemeenschap", "footer.company": "Bedrijf",
  "footer.copyright": "Global AI Hub. Alle rechten voorbehouden.",
  "footer.about": "Over Ons", "footer.contact": "Contact", "footer.privacy": "Privacy",
});

const ru = buildLang({
  "nav.home": "Главная", "nav.tools": "Инструменты", "nav.news": "Новости", "nav.models": "Модели",
  "nav.submitTool": "Добавить инструмент", "nav.getStarted": "Начать", "nav.language": "Язык",
  "hero.h1": "Весь Вселенная ИИ,", "hero.h2": "Персонализирована для Вас.",
  "hero.h3": "Откройте, стройте и масштабируйте будущее.",
  "hero.subtitle": "Ваш главный ресурс для инструментов ИИ, новостей о моделях и тщательно подобранных материалов.",
  "hero.exploreCta": "Изучить инструменты", "hero.newsletterCta": "Подписаться на рассылку",
  "stats.tools": "Инструменты ИИ", "stats.countries": "Стран", "stats.researchers": "Исследователей", "stats.readers": "Читателей рассылки",
  "home.categoriesTitle": "Исследовать по категориям", "home.categoriesSubtitle": "Углубитесь в специализированные области искусственного интеллекта.",
  "tools.title": "Каталог инструментов ИИ", "tools.searchPlaceholder": "Поиск по названию, категории или ключевому слову…",
  "tools.visit": "Посетить", "tools.verified": "Проверено Global AI Hub",
  "filter.all": "Все", "filter.free": "Бесплатно", "filter.premium": "Премиум",
  "news.title": "Хаб новостей ИИ", "news.liveFeed": "Прямой эфир", "news.source": "Источник",
  "models.title": "Таблица лидеров моделей", "models.yes": "Да", "models.no": "Нет",
  "footer.explore": "Исследовать", "footer.community": "Сообщество", "footer.company": "Компания",
  "footer.copyright": "Global AI Hub. Все права защищены.",
  "footer.about": "О нас", "footer.contact": "Контакт", "footer.privacy": "Конфиденциальность",
});

const tr = buildLang({
  "nav.home": "Ana Sayfa", "nav.tools": "Araçlar", "nav.news": "Haberler", "nav.models": "Modeller",
  "nav.submitTool": "Araç Gönder", "nav.getStarted": "Başla", "nav.language": "Dil",
  "hero.h1": "Tüm Yapay Zeka Evreni,", "hero.h2": "Sizin İçin Kişiselleştirilmiş.",
  "hero.h3": "Keşfedin, İnşa Edin ve Geleceği Ölçeklendirin.",
  "hero.subtitle": "Yapay zeka araçları, model haberleri ve özenle seçilmiş kaynaklar için nihai destinasyonunuz.",
  "hero.exploreCta": "Araçları Keşfet", "hero.newsletterCta": "Bültene Katıl",
  "stats.tools": "Yapay Zeka Aracı", "stats.countries": "Ülke", "stats.researchers": "Araştırmacı", "stats.readers": "Bülten Okuyucuları",
  "home.categoriesTitle": "Kategoriye Göre Keşfet", "home.categoriesSubtitle": "Yapay zekanın özel alanlarına derinlemesine dalın.",
  "tools.title": "Yapay Zeka Araçları Dizini", "tools.searchPlaceholder": "Ad, kategori veya anahtar kelimeyle ara…",
  "tools.visit": "Ziyaret Et", "tools.verified": "Global AI Hub Tarafından Doğrulandı",
  "filter.all": "Tümü", "filter.free": "Ücretsiz", "filter.premium": "Premium",
  "news.title": "Yapay Zeka Haber Merkezi", "news.liveFeed": "Canlı Akış", "news.source": "Kaynak",
  "models.title": "Model Sıralaması", "models.yes": "Evet", "models.no": "Hayır",
  "footer.explore": "Keşfet", "footer.community": "Topluluk", "footer.company": "Şirket",
  "footer.copyright": "Global AI Hub. Tüm hakları saklıdır.",
  "footer.about": "Hakkında", "footer.contact": "İletişim", "footer.privacy": "Gizlilik",
});

const id = buildLang({
  "nav.home": "Beranda", "nav.tools": "Alat", "nav.news": "Berita", "nav.models": "Model",
  "nav.submitTool": "Kirim Alat", "nav.getStarted": "Mulai", "nav.language": "Bahasa",
  "hero.h1": "Seluruh Semesta AI,", "hero.h2": "Dipersonalisasi untuk Anda.",
  "hero.h3": "Temukan, Bangun, dan Skalakan Masa Depan.",
  "hero.subtitle": "Destinasi utama Anda untuk alat AI, berita model, dan sumber daya yang dikurasi.",
  "hero.exploreCta": "Jelajahi Alat", "hero.newsletterCta": "Bergabung Newsletter",
  "stats.tools": "Alat AI", "stats.countries": "Negara", "stats.researchers": "Peneliti", "stats.readers": "Pembaca Newsletter",
  "home.categoriesTitle": "Jelajahi berdasarkan Kategori", "home.categoriesSubtitle": "Selami domain khusus kecerdasan buatan.",
  "tools.title": "Direktori Alat AI", "tools.searchPlaceholder": "Cari berdasarkan nama, kategori, atau kata kunci…",
  "tools.visit": "Kunjungi", "tools.verified": "Diverifikasi oleh Global AI Hub",
  "filter.all": "Semua", "filter.free": "Gratis", "filter.premium": "Premium",
  "news.title": "Hub Berita AI", "news.liveFeed": "Umpan Langsung", "news.source": "Sumber",
  "models.title": "Papan Peringkat Model", "models.yes": "Ya", "models.no": "Tidak",
  "footer.explore": "Jelajahi", "footer.community": "Komunitas", "footer.company": "Perusahaan",
  "footer.copyright": "Global AI Hub. Semua hak dilindungi.",
  "footer.about": "Tentang", "footer.contact": "Kontak", "footer.privacy": "Privasi",
});

const ja = buildLang({
  "nav.home": "ホーム", "nav.tools": "ツール", "nav.news": "ニュース", "nav.models": "モデル",
  "nav.submitTool": "ツールを提出", "nav.getStarted": "始める", "nav.language": "言語",
  "hero.h1": "AIの全宇宙を、", "hero.h2": "あなたのために。",
  "hero.h3": "発見し、構築し、未来を拡大する。",
  "hero.subtitle": "AIツール、モデルニュース、厳選されたリソースの究極の目的地。エンジニア、研究者、創業者を問わず、ここに必要なすべてがあります。",
  "hero.exploreCta": "ツールを探す", "hero.newsletterCta": "ニュースレターに登録",
  "stats.tools": "AIツール", "stats.countries": "カ国", "stats.researchers": "研究者", "stats.readers": "読者",
  "home.categoriesTitle": "カテゴリ別に探る", "home.categoriesSubtitle": "人工知能の専門分野を深く掘り下げましょう。",
  "tools.title": "AIツールディレクトリ", "tools.searchPlaceholder": "名前、カテゴリ、またはキーワードで検索…",
  "tools.visit": "訪問", "tools.verified": "Global AI Hubにより認証済み",
  "filter.all": "すべて", "filter.free": "無料", "filter.premium": "プレミアム",
  "news.title": "AIニュースハブ", "news.liveFeed": "ライブフィード", "news.source": "ソース",
  "models.title": "モデルリーダーボード", "models.yes": "はい", "models.no": "いいえ",
  "footer.explore": "探索", "footer.community": "コミュニティ", "footer.company": "会社",
  "footer.copyright": "Global AI Hub。全著作権所有。",
  "footer.about": "について", "footer.contact": "連絡先", "footer.privacy": "プライバシー",
});

const ko = buildLang({
  "nav.home": "홈", "nav.tools": "도구", "nav.news": "뉴스", "nav.models": "모델",
  "nav.submitTool": "도구 제출", "nav.getStarted": "시작하기", "nav.language": "언어",
  "hero.h1": "전체 AI 우주를,", "hero.h2": "당신을 위해 개인화했습니다.",
  "hero.h3": "발견하고, 구축하고, 미래를 확장하세요.",
  "hero.subtitle": "AI 도구, 모델 뉴스, 큐레이션된 리소스를 위한 궁극의 목적지.",
  "hero.exploreCta": "도구 탐색", "hero.newsletterCta": "뉴스레터 구독",
  "stats.tools": "AI 도구", "stats.countries": "국가", "stats.researchers": "연구자", "stats.readers": "뉴스레터 독자",
  "home.categoriesTitle": "카테고리별 탐색", "home.categoriesSubtitle": "인공 지능의 전문 분야를 깊이 탐구하세요.",
  "tools.title": "AI 도구 디렉터리", "tools.searchPlaceholder": "이름, 카테고리 또는 키워드로 검색…",
  "tools.visit": "방문", "tools.verified": "Global AI Hub에서 인증됨",
  "filter.all": "전체", "filter.free": "무료", "filter.premium": "프리미엄",
  "news.title": "AI 뉴스 허브", "news.liveFeed": "라이브 피드", "news.source": "출처",
  "models.title": "모델 리더보드", "models.yes": "예", "models.no": "아니오",
  "footer.explore": "탐색", "footer.community": "커뮤니티", "footer.company": "회사",
  "footer.copyright": "Global AI Hub. 모든 권리 보유.",
  "footer.about": "소개", "footer.contact": "연락처", "footer.privacy": "개인정보",
});

const hi = buildLang({
  "nav.home": "होम", "nav.tools": "उपकरण", "nav.news": "समाचार", "nav.models": "मॉडल",
  "nav.submitTool": "उपकरण सबमिट करें", "nav.getStarted": "शुरू करें", "nav.language": "भाषा",
  "hero.h1": "संपूर्ण AI ब्रह्मांड,", "hero.h2": "आपके लिए व्यक्तिगत।",
  "hero.h3": "खोजें, बनाएं और भविष्य को स्केल करें।",
  "hero.subtitle": "AI उपकरणों, मॉडल समाचारों और क्यूरेटेड संसाधनों के लिए आपका अंतिम गंतव्य।",
  "hero.exploreCta": "उपकरण देखें", "hero.newsletterCta": "न्यूज़लेटर जुड़ें",
  "stats.tools": "AI उपकरण", "stats.countries": "देश", "stats.researchers": "शोधकर्ता", "stats.readers": "न्यूज़लेटर पाठक",
  "home.categoriesTitle": "श्रेणी के अनुसार खोजें", "home.categoriesSubtitle": "कृत्रिम बुद्धिमत्ता के विशेष क्षेत्रों में गहराई से जाएं।",
  "tools.title": "AI उपकरण निर्देशिका", "tools.searchPlaceholder": "नाम, श्रेणी या कीवर्ड से खोजें…",
  "tools.visit": "देखें", "tools.verified": "Global AI Hub द्वारा सत्यापित",
  "filter.all": "सभी", "filter.free": "मुफ्त", "filter.premium": "प्रीमियम",
  "news.title": "AI समाचार हब", "news.liveFeed": "लाइव फीड", "news.source": "स्रोत",
  "models.title": "मॉडल लीडरबोर्ड", "models.yes": "हाँ", "models.no": "नहीं",
  "footer.explore": "खोजें", "footer.community": "समुदाय", "footer.company": "कंपनी",
  "footer.copyright": "Global AI Hub. सर्वाधिकार सुरक्षित।",
  "footer.about": "के बारे में", "footer.contact": "संपर्क", "footer.privacy": "गोपनीयता",
});

const bn = buildLang({
  "nav.home": "হোম", "nav.tools": "টুলস", "nav.news": "সংবাদ", "nav.models": "মডেল",
  "nav.submitTool": "টুল জমা দিন", "nav.getStarted": "শুরু করুন", "nav.language": "ভাষা",
  "hero.h1": "সম্পূর্ণ AI মহাবিশ্ব,", "hero.h2": "আপনার জন্য ব্যক্তিগতকৃত।",
  "hero.h3": "আবিষ্কার করুন, তৈরি করুন এবং ভবিষ্যৎ স্কেল করুন।",
  "hero.subtitle": "AI টুলস, মডেল সংবাদ এবং কিউরেটেড রিসোর্সের চূড়ান্ত গন্তব্য।",
  "hero.exploreCta": "টুলস দেখুন", "hero.newsletterCta": "নিউজলেটারে যোগ দিন",
  "stats.tools": "AI টুলস", "stats.countries": "দেশ", "stats.researchers": "গবেষক", "stats.readers": "নিউজলেটার পাঠক",
  "home.categoriesTitle": "বিভাগ অনুযায়ী অন্বেষণ করুন", "home.categoriesSubtitle": "কৃত্রিম বুদ্ধিমত্তার বিশেষ ক্ষেত্রে গভীরে যান।",
  "tools.title": "AI টুলস ডিরেক্টরি", "tools.searchPlaceholder": "নাম, বিভাগ বা কীওয়ার্ড দিয়ে অনুসন্ধান করুন…",
  "tools.visit": "দেখুন", "tools.verified": "Global AI Hub দ্বারা যাচাইকৃত",
  "filter.all": "সব", "filter.free": "বিনামূল্যে", "filter.premium": "প্রিমিয়াম",
  "news.title": "AI সংবাদ হাব", "news.liveFeed": "লাইভ ফিড", "news.source": "উৎস",
  "models.title": "মডেল লিডারবোর্ড", "models.yes": "হ্যাঁ", "models.no": "না",
  "footer.explore": "অন্বেষণ", "footer.community": "সম্প্রদায়", "footer.company": "কোম্পানি",
  "footer.copyright": "Global AI Hub. সর্বস্বত্ব সংরক্ষিত।",
  "footer.about": "সম্পর্কে", "footer.contact": "যোগাযোগ", "footer.privacy": "গোপনীয়তা",
});

export const translations = { en, es, fr, de, pt, it, nl, ru, tr, id, zh, ja, ko, hi, bn, ar, ur, fa };
