import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Search, Filter, ExternalLink, Zap, Star } from "lucide-react";

const toolsData = [
  { name: "ChatGPT", category: "LLMs", desc: "OpenAI's flagship conversational AI model, capable of complex reasoning, coding, and creative writing.", popular: true },
  { name: "Claude", category: "LLMs", desc: "Anthropic's helpful, honest, and harmless assistant with a massive context window for document analysis.", popular: true },
  { name: "Midjourney", category: "Image Gen", desc: "Incredible AI image generator producing hyper-realistic and artistic visuals from text prompts.", popular: true },
  { name: "Cursor", category: "Code AI", desc: "The AI-first code editor that deeply understands your codebase and accelerates development.", popular: true },
  { name: "Gemini", category: "LLMs", desc: "Google's most capable and general model, built from the ground up to be multimodal.", popular: false },
  { name: "Stable Diffusion", category: "Image Gen", desc: "Open-source image generation model that runs locally and offers infinite customization.", popular: false },
  { name: "GitHub Copilot", category: "Code AI", desc: "Your AI pair programmer that suggests code and entire functions in real-time.", popular: true },
  { name: "Perplexity", category: "Agents", desc: "AI-powered search engine that provides cited answers and conversational discovery.", popular: true },
  { name: "ElevenLabs", category: "Voice AI", desc: "The most realistic AI voice generator and text-to-speech software available.", popular: false },
  { name: "Runway", category: "Image Gen", desc: "Advance video generation and editing with Gen-2, pushing the boundaries of AI video.", popular: false },
  { name: "Suno", category: "Voice AI", desc: "Make a song about anything. AI music generation with full vocals and instrumentation.", popular: false },
  { name: "Mistral", category: "LLMs", desc: "Powerful, open-weight language models from Europe with exceptional efficiency.", popular: false },
];

const categories = ["All", "LLMs", "Image Gen", "Code AI", "Voice AI", "Agents"];

export default function Tools() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredTools = toolsData.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || tool.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 [text-shadow:0_0_20px_rgba(168,85,247,0.3)]">AI Tools Directory</h1>
            <p className="text-muted-foreground text-lg">Discover and compare the best AI tools across every category.</p>
          </div>
          
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search tools..." 
                className="pl-10 bg-white/5 border-white/10 focus-visible:ring-primary text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-tools"
              />
            </div>
            <Button variant="outline" className="border-white/10 text-white gap-2" data-testid="btn-filters">
              <Filter className="w-4 h-4" /> Filters
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map(cat => (
            <Badge 
              key={cat}
              variant="outline"
              className={`px-4 py-2 text-sm cursor-pointer transition-all ${
                activeCategory === cat 
                  ? "bg-primary text-white border-primary shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                  : "bg-transparent text-muted-foreground border-white/10 hover:border-primary/50"
              }`}
              onClick={() => setActiveCategory(cat)}
              data-testid={`filter-category-${cat.replace(/\s+/g, '-').toLowerCase()}`}
            >
              {cat}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map((tool, idx) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="h-full bg-card/40 border-white/10 hover:border-primary/40 transition-all group flex flex-col" data-testid={`tool-card-${tool.name.replace(/\s+/g, '-').toLowerCase()}`}>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-xl font-display font-bold text-white group-hover:scale-110 transition-transform">
                      {tool.name[0]}
                    </div>
                    {tool.popular && (
                      <Badge variant="secondary" className="bg-secondary/20 text-secondary border-none gap-1 px-2 py-1">
                        <Zap className="w-3 h-3 fill-secondary" /> Hot
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-display font-bold text-white mb-1 group-hover:text-primary transition-colors">{tool.name}</h3>
                  <Badge variant="outline" className="w-fit text-xs border-white/10 text-muted-foreground">{tool.category}</Badge>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground leading-relaxed">{tool.desc}</p>
                </CardContent>
                <CardFooter className="pt-4 border-t border-white/5 mt-auto flex justify-between items-center">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500/20" /> 4.{8 + (idx % 2)}
                  </div>
                  <Button size="sm" className="bg-white/10 text-white hover:bg-primary hover:text-white transition-all group/btn" data-testid={`btn-visit-${tool.name.replace(/\s+/g, '-').toLowerCase()}`}>
                    Visit <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-20" data-testid="empty-tools-state">
            <p className="text-muted-foreground text-lg">No tools found matching your criteria.</p>
            <Button variant="link" className="text-primary mt-4" onClick={() => {setSearchTerm(""); setActiveCategory("All");}} data-testid="btn-clear-filters">
              Clear filters
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
