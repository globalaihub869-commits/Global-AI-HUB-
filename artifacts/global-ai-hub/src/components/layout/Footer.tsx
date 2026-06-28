import { Link } from "wouter";
import { CircuitBoard, Twitter, Github, Mail } from "lucide-react";
import { SiDiscord } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="relative bg-background pt-16 pb-8 border-t border-white/5 overflow-hidden">
      {/* Neon Gradient Divider */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2 group mb-4" data-testid="footer-brand">
              <div className="relative">
                <CircuitBoard className="relative w-6 h-6 text-primary" />
              </div>
              <span className="font-display font-bold text-xl text-white [text-shadow:0_0_10px_rgba(168,85,247,0.3)]">
                Global AI Hub
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed" data-testid="footer-tagline">
              Your command center for everything artificial intelligence. Discover, compare, and build the future.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">Explore</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/tools" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-tools">Tools</Link></li>
              <li><Link href="/news" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-news">News</Link></li>
              <li><Link href="/models" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-models">Models</Link></li>
              <li><Link href="/models" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-leaderboard">Leaderboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">Community</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-discord">Discord</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-twitter">Twitter / X</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-newsletter">Newsletter</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-github">GitHub</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-about">About</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-blog">Blog</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-contact">Contact</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-privacy">Privacy</a></li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10">
          <p className="text-xs text-muted-foreground mb-4 md:mb-0" data-testid="footer-copyright">
            &copy; {new Date().getFullYear()} Global AI Hub. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="social-discord">
              <SiDiscord className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="social-twitter">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="social-github">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="social-mail">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
