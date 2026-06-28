import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowUpRight } from "lucide-react";

const newsData = [
  { title: "OpenAI Announces GPT-4o with Native Multimodal Capabilities", source: "The Verge", date: "2 hours ago", category: "Models" },
  { title: "Anthropic Raises $4B to Build Next-Gen Claude", source: "TechCrunch", date: "5 hours ago", category: "Funding" },
  { title: "EU AI Act Officially Becomes Law", source: "Reuters", date: "1 day ago", category: "Regulation" },
  { title: "Google DeepMind Unveils AlphaFold 3 for Drug Discovery", source: "Nature", date: "1 day ago", category: "Research" },
  { title: "Midjourney v6 Released with Unprecedented Realism", source: "Wired", date: "2 days ago", category: "Releases" },
  { title: "Mistral AI Open-Sources New 8x22B MoE Model", source: "VentureBeat", date: "3 days ago", category: "Open Source" },
  { title: "Apple integrates Gemini nano into next-gen Pixel devices", source: "Bloomberg", date: "3 days ago", category: "Hardware" },
  { title: "New AI Benchmarks Show Open Source Catching Up to Proprietary Models", source: "Hugging Face Blog", date: "4 days ago", category: "Research" },
  { title: "Sora Video Generator Expanding to All Plus Users", source: "OpenAI Blog", date: "5 days ago", category: "Releases" },
  { title: "Nvidia Announces Blackwell Architecture for Trillion-Parameter Models", source: "Ars Technica", date: "1 week ago", category: "Hardware" },
];

export default function News() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        
        <div className="mb-12 border-b border-white/10 pb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 flex items-center gap-4">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-primary shadow-[0_0_10px_rgba(168,85,247,0.8)]"></span>
            </span>
            Live News Feed
          </h1>
          <p className="text-muted-foreground text-lg">The latest breakthroughs, funding, and releases in AI.</p>
        </div>

        <div className="space-y-6">
          {newsData.map((article, idx) => (
            <motion.div
              key={article.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              data-testid={`news-card-${idx}`}
            >
              <Card className="bg-card/30 border-white/5 hover:bg-card/60 hover:border-primary/30 transition-all group cursor-pointer">
                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline" className="text-xs text-secondary border-secondary/30 bg-secondary/5">
                        {article.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {article.date}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-display font-semibold text-white mb-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium">{article.source}</p>
                  </div>
                  <div className="hidden md:flex w-12 h-12 rounded-full border border-white/10 bg-white/5 items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all">
                    <ArrowUpRight className="w-5 h-5 text-white" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
