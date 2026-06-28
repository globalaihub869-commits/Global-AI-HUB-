import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Image as ImageIcon, Code2, Mic, Bot, Database, ArrowRight } from "lucide-react";

export default function Home() {
  const categories = [
    { name: "LLMs", icon: <Brain className="w-8 h-8" />, desc: "Large Language Models & Chatbots" },
    { name: "Image Gen", icon: <ImageIcon className="w-8 h-8" />, desc: "AI Image Generation & Editing" },
    { name: "Code AI", icon: <Code2 className="w-8 h-8" />, desc: "Copilots & Coding Assistants" },
    { name: "Voice AI", icon: <Mic className="w-8 h-8" />, desc: "Text-to-Speech & Voice Cloning" },
    { name: "Agents", icon: <Bot className="w-8 h-8" />, desc: "Autonomous AI Agents" },
    { name: "Data AI", icon: <Database className="w-8 h-8" />, desc: "Data Analysis & Visualization" },
  ];

  return (
    <div className="min-h-screen pt-20 pb-20 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="py-24 md:py-32 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-8 backdrop-blur-sm shadow-[0_0_15px_rgba(168,85,247,0.2)]" data-testid="hero-badge">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Live: GPT-4o Model Update
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white tracking-tight mb-6" data-testid="hero-title">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary [text-shadow:0_0_30px_rgba(168,85,247,0.3)]">Global AI Hub</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 font-light" data-testid="hero-subtitle">
              Your command center for everything artificial intelligence. Discover tools, track models, and stay on the bleeding edge.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/tools" data-testid="hero-btn-explore">
                <Button size="lg" className="h-14 px-8 text-lg bg-primary text-white hover:bg-primary/90 shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_35px_rgba(168,85,247,0.7)] transition-all">
                  Explore AI Tools
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/models" data-testid="hero-btn-leaderboard">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/20 hover:bg-white/5 hover:border-white/40">
                  View Leaderboard
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-20 w-full max-w-4xl mx-auto p-[1px] rounded-2xl bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            data-testid="stats-bar"
          >
            <div className="bg-background/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-around gap-8 border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <div className="text-center" data-testid="stat-tools">
                <div className="text-3xl md:text-4xl font-display font-bold text-white mb-1 [text-shadow:0_0_10px_rgba(255,255,255,0.3)]">2,400+</div>
                <div className="text-sm text-secondary font-medium tracking-wider uppercase">AI Tools</div>
              </div>
              <div className="hidden md:block w-px h-12 bg-white/10"></div>
              <div className="text-center" data-testid="stat-countries">
                <div className="text-3xl md:text-4xl font-display font-bold text-white mb-1 [text-shadow:0_0_10px_rgba(255,255,255,0.3)]">180</div>
                <div className="text-sm text-secondary font-medium tracking-wider uppercase">Countries</div>
              </div>
              <div className="hidden md:block w-px h-12 bg-white/10"></div>
              <div className="text-center" data-testid="stat-researchers">
                <div className="text-3xl md:text-4xl font-display font-bold text-white mb-1 [text-shadow:0_0_10px_rgba(255,255,255,0.3)]">50K+</div>
                <div className="text-sm text-secondary font-medium tracking-wider uppercase">Researchers</div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Categories Section */}
        <section className="py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Explore by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Dive deep into specialized domains of artificial intelligence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                data-testid={`category-card-${cat.name.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <Link href="/tools">
                  <Card className="h-full bg-card/50 backdrop-blur-sm border-white/10 hover:border-primary/50 hover:bg-card transition-all cursor-pointer group shadow-lg hover:shadow-[0_0_25px_rgba(168,85,247,0.2)]">
                    <CardContent className="p-8 flex flex-col items-center text-center">
                      <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-primary/20 text-white group-hover:text-primary transition-colors mb-6 ring-1 ring-white/10 group-hover:ring-primary/50">
                        {cat.icon}
                      </div>
                      <h3 className="text-xl font-display font-bold text-white mb-2">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground">{cat.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
