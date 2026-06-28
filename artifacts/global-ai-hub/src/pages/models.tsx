import { useState } from "react";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDownAZ, ArrowUpZA } from "lucide-react";

const modelsData = [
  { name: "GPT-4o", provider: "OpenAI", type: "Multimodal", context: "128K", open: false, score: 88.7 },
  { name: "Claude 3.5 Sonnet", provider: "Anthropic", type: "Multimodal", context: "200K", open: false, score: 88.3 },
  { name: "Gemini 1.5 Pro", provider: "Google", type: "Multimodal", context: "2M", open: false, score: 87.5 },
  { name: "Llama 3 (70B)", provider: "Meta", type: "LLM", context: "8K", open: true, score: 82.0 },
  { name: "Mixtral 8x22B", provider: "Mistral", type: "LLM", context: "65K", open: true, score: 81.2 },
  { name: "Command R+", provider: "Cohere", type: "LLM", context: "128K", open: true, score: 80.5 },
  { name: "Midjourney v6", provider: "Midjourney", type: "Image", context: "N/A", open: false, score: 95.0 },
  { name: "Stable Diffusion 3", provider: "Stability AI", type: "Image", context: "N/A", open: true, score: 92.5 },
  { name: "Sora", provider: "OpenAI", type: "Video", context: "N/A", open: false, score: 98.0 },
  { name: "Grok-1.5", provider: "xAI", type: "LLM", context: "128K", open: true, score: 81.3 },
  { name: "Qwen 1.5 72B", provider: "Alibaba", type: "LLM", context: "32K", open: true, score: 79.8 },
  { name: "Claude 3 Opus", provider: "Anthropic", type: "Multimodal", context: "200K", open: false, score: 86.8 },
  { name: "DALL-E 3", provider: "OpenAI", type: "Image", context: "N/A", open: false, score: 90.0 },
  { name: "ElevenLabs v2", provider: "ElevenLabs", type: "Audio", context: "N/A", open: false, score: 96.5 },
  { name: "Phi-3-Mini", provider: "Microsoft", type: "LLM", context: "128K", open: true, score: 74.5 },
];

export default function Models() {
  const [sortField, setSortField] = useState<"score" | "name">("score");
  const [sortDesc, setSortDesc] = useState(true);

  const sortedModels = [...modelsData].sort((a, b) => {
    if (sortField === "score") {
      return sortDesc ? b.score - a.score : a.score - b.score;
    }
    return sortDesc 
      ? b.name.localeCompare(a.name) 
      : a.name.localeCompare(b.name);
  });

  const handleSort = (field: "score" | "name") => {
    if (sortField === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortField(field);
      setSortDesc(true);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 [text-shadow:0_0_20px_rgba(185,213,255,0.3)]">Models Leaderboard</h1>
          <p className="text-muted-foreground text-lg">Comparing the top foundation models by benchmark performance and capabilities.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/10 bg-card/30 backdrop-blur-sm overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        >
          <div className="overflow-x-auto">
            <Table data-testid="models-table">
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="w-[250px] cursor-pointer" onClick={() => handleSort("name")} data-testid="th-name">
                    <div className="flex items-center gap-2 text-white font-medium">
                      Model Name {sortField === "name" && (sortDesc ? <ArrowDownAZ className="w-4 h-4 text-primary" /> : <ArrowUpZA className="w-4 h-4 text-primary" />)}
                    </div>
                  </TableHead>
                  <TableHead className="text-white font-medium">Provider</TableHead>
                  <TableHead className="text-white font-medium">Type</TableHead>
                  <TableHead className="text-white font-medium">Context</TableHead>
                  <TableHead className="text-white font-medium">License</TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort("score")} data-testid="th-score">
                    <div className="flex items-center justify-end gap-2 text-white font-medium">
                      Avg Score {sortField === "score" && (sortDesc ? <ArrowDownAZ className="w-4 h-4 text-secondary" /> : <ArrowUpZA className="w-4 h-4 text-secondary" />)}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedModels.map((model, idx) => (
                  <TableRow key={model.name} className="border-white/10 hover:bg-white/5 transition-colors group" data-testid={`row-model-${model.name.replace(/\s+/g, '-').toLowerCase()}`}>
                    <TableCell className="font-display font-bold text-white group-hover:text-primary transition-colors">
                      {model.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{model.provider}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-white/10 text-xs font-normal">
                        {model.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">{model.context}</TableCell>
                    <TableCell>
                      {model.open ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">Open Source</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-white/10 text-muted-foreground hover:bg-white/20">Proprietary</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono font-bold text-secondary [text-shadow:0_0_10px_rgba(34,211,238,0.4)] text-lg">
                        {model.score.toFixed(1)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Scores are aggregated averages from major public benchmarks (MMLU, HumanEval, MATH, etc.) or Elo ratings where applicable.
        </div>

      </div>
    </div>
  );
}
