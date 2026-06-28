import { Link, useLocation } from "wouter";
import { CircuitBoard, Menu, X, Globe, ChevronDown, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { LANGUAGES } from "@/i18n/translations";

function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === lang)!;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const ltrLangs = LANGUAGES.filter((l) => l.dir === "ltr");
  const rtlLangs = LANGUAGES.filter((l) => l.dir === "rtl");

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        data-testid="btn-language-switcher"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 hover:border-primary/40 transition-all text-sm text-white"
        aria-label={t("nav.language")}
        aria-expanded={open}
      >
        <Globe className="w-3.5 h-3.5 text-primary" />
        <span className="hidden sm:inline">{current.flag}</span>
        <span className="hidden md:inline text-xs font-medium">{current.native}</span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 end-0 w-56 max-h-80 overflow-y-auto rounded-2xl bg-[hsl(240,15%,9%)] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-50 py-1"
            data-testid="language-dropdown"
          >
            {/* LTR group */}
            <div className="px-3 py-1.5 text-[10px] text-muted-foreground/60 uppercase tracking-widest font-medium">
              Left-to-Right
            </div>
            {ltrLangs.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false); }}
                data-testid={`lang-option-${l.code}`}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-start hover:bg-primary/10 ${lang === l.code ? "text-primary" : "text-muted-foreground hover:text-white"}`}
              >
                <span className="text-base leading-none">{l.flag}</span>
                <span className="flex-1 font-medium">{l.native}</span>
                <span className="text-xs text-muted-foreground/50">{l.name}</span>
                {lang === l.code && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
              </button>
            ))}

            {/* RTL group */}
            <div className="px-3 py-1.5 mt-1 text-[10px] text-secondary/60 uppercase tracking-widest font-medium border-t border-white/5">
              Right-to-Left ←
            </div>
            {rtlLangs.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false); }}
                data-testid={`lang-option-${l.code}`}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-start hover:bg-secondary/10 ${lang === l.code ? "text-secondary" : "text-muted-foreground hover:text-white"}`}
              >
                <span className="text-base leading-none">{l.flag}</span>
                <span className="flex-1 font-medium" dir="rtl">{l.native}</span>
                <span className="text-xs text-muted-foreground/50">{l.name}</span>
                {lang === l.code && <Check className="w-3.5 h-3.5 text-secondary flex-shrink-0" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsMobileMenuOpen(false); }, [location]);

  const navLinks = [
    { key: "nav.home" as const, href: "/" },
    { key: "nav.tools" as const, href: "/tools" },
    { key: "nav.news" as const, href: "/news" },
    { key: "nav.models" as const, href: "/models" },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-primary/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group" data-testid="nav-brand">
          <div className="relative">
            <div className="absolute inset-0 bg-primary blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
            <CircuitBoard className="relative w-6 h-6 text-primary" />
          </div>
          <span className="font-display font-bold text-lg tracking-wide text-white group-hover:text-primary transition-colors [text-shadow:0_0_10px_rgba(168,85,247,0.3)]">
            Global AI Hub
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary hover:[text-shadow:0_0_8px_rgba(168,85,247,0.4)] ${
                location === link.href ? "text-primary [text-shadow:0_0_8px_rgba(168,85,247,0.4)]" : "text-muted-foreground"
              }`}
              data-testid={`nav-link-${link.href.replace("/", "") || "home"}`}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <Button
            variant="outline"
            className="rounded-full border-primary/50 text-primary hover:bg-primary/10 transition-colors"
            data-testid="nav-btn-submit"
          >
            {t("nav.submitTool")}
          </Button>
          <Button
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all"
            data-testid="nav-btn-start"
          >
            {t("nav.getStarted")}
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          data-testid="nav-mobile-toggle"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-primary/20 overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block text-lg font-medium p-2 rounded-lg transition-colors ${
                    location === link.href ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-white"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t(link.key)}
                </Link>
              ))}
              <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
                <div className="mb-2">
                  <LanguageSwitcher />
                </div>
                <Button variant="outline" className="w-full rounded-full border-primary/50 text-primary">
                  {t("nav.submitTool")}
                </Button>
                <Button className="w-full rounded-full bg-primary text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                  {t("nav.getStarted")}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
