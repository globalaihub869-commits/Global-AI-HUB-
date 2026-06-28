import { Link } from "wouter";
import { CircuitBoard, Twitter, Github, Mail } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="relative bg-background pt-16 pb-8 border-t border-white/5 overflow-hidden">
      {/* Neon gradient divider */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2 group mb-4" data-testid="footer-brand">
              <CircuitBoard className="relative w-6 h-6 text-primary" />
              <span className="font-display font-bold text-xl text-white [text-shadow:0_0_10px_rgba(168,85,247,0.3)]">
                Global AI Hub
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed" data-testid="footer-tagline">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4">{t("footer.explore")}</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/tools" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-tools">{t("footer.tools")}</Link></li>
              <li><Link href="/news" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-news">{t("footer.news")}</Link></li>
              <li><Link href="/models" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-models">{t("footer.models")}</Link></li>
              <li><Link href="/models" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-leaderboard">{t("footer.leaderboard")}</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4">{t("footer.community")}</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-discord">{t("footer.discord")}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-twitter">{t("footer.twitter")}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-newsletter">{t("footer.newsletter")}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-github">{t("footer.github")}</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4">{t("footer.company")}</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-about">{t("footer.about")}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-blog">{t("footer.blog")}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-contact">{t("footer.contact")}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-privacy">{t("footer.privacy")}</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10">
          <p className="text-xs text-muted-foreground mb-4 md:mb-0" data-testid="footer-copyright">
            &copy; {new Date().getFullYear()} {t("footer.copyright")}
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="social-discord"><SiDiscord className="w-5 h-5" /></a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="social-twitter"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="social-github"><Github className="w-5 h-5" /></a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="social-mail"><Mail className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
