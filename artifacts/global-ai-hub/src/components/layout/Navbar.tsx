import { Link, useLocation } from "wouter";
import { CircuitBoard, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Tools", href: "/tools" },
    { name: "News", href: "/news" },
    { name: "Models", href: "/models" },
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
        <Link href="/" className="flex items-center gap-2 group" data-testid="nav-brand">
          <div className="relative">
            <div className="absolute inset-0 bg-primary blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <CircuitBoard className="relative w-6 h-6 text-primary" />
          </div>
          <span className="font-display font-bold text-lg tracking-wide text-white group-hover:text-primary transition-colors [text-shadow:0_0_10px_rgba(168,85,247,0.3)]">
            Global AI Hub
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary hover:[text-shadow:0_0_8px_rgba(168,85,247,0.4)] ${
                location === link.href ? "text-primary [text-shadow:0_0_8px_rgba(168,85,247,0.4)]" : "text-muted-foreground"
              }`}
              data-testid={`nav-link-${link.name.toLowerCase()}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="outline" className="rounded-full border-primary/50 text-primary hover:bg-primary/10 transition-colors" data-testid="nav-btn-submit">
            Submit Tool
          </Button>
          <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all" data-testid="nav-btn-start">
            Get Started
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          data-testid="nav-mobile-toggle"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-primary/20 absolute w-full py-4 px-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`block text-lg font-medium p-2 ${
                location === link.href ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
            <Button variant="outline" className="w-full rounded-full border-primary/50 text-primary">
              Submit Tool
            </Button>
            <Button className="w-full rounded-full bg-primary text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
