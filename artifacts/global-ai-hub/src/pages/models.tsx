import { useState } from "react";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDownAZ, ArrowUpZA } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

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
  const { t } = useLanguage();
  const [sortField, setSortField] = useState<"score" | "name">("score");
  const [sortDesc, setSortDesc] = useState(true);

  const sortedModels = [...modelsData].sort((a, b) => {
    if (sortField === "score") return sortDesc ? b.score - a.score : a.score - b.score;
    return sortDesc ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
  });

  const handleSort = (field: "score" | "name") => {
    if (sortField === field) setSortDesc(!sortDesc);
    else { setSortField(field); setSortDesc(true); }
  };

  const SortIcon = ({ field }: { field: "score" | "name" }) =>
    sortField === field
      ? sortDesc
        ? <ArrowDownAZ className="inline w-4 h-4 ms-1 text-primary" />
        : <ArrowUpZA className="inline w-4 h-4 ms-1 text-primary" />
      : <ArrowDownAZ className="inline w-4 h-4 ms-1 text-white/20" />;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="fixed top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="container mx-auto px-4 max-w-6xl">

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 [text-shadow:0_0_20px_rgba(185,213,255,0.3)]" data-testid="models-title">
            {t("models.title")}
          </h1>
          <p className="text-muted-foreground text-lg" data-testid="models-subtitle">{t("models.subtitle")}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/10 bg-card/30 backdrop-blur-sm overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        >
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/10 hover:bg-transparent">
                <TableHead className="text-muted-foreground font-semibold w-8 ps-4">#</TableHead>
                <TableHead
                  className="text-muted-foreground font-semibold cursor-pointer hover:text-white transition-colors select-none"
                  onClick={() => handleSort("name")}
                  data-testid="sort-by-name"
                >
                  {t("models.model")}<SortIcon field="name" />
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold hidden sm:table-cell">{t("models.provider")}</TableHead>
                <TableHead className="text-muted-foreground font-semibold hidden md:table-cell">{t("models.type")}</TableHead>
                <TableHead className="text-muted-foreground font-semibold hidden lg:table-cell">{t("models.context")}</TableHead>
                <TableHead className="text-muted-foreground font-semibold hidden md:table-cell">{t("models.openSource")}</TableHead>
                <TableHead
                  className="text-muted-foreground font-semibold cursor-pointer hover:text-white transition-colors select-none text-end pe-4"
                  onClick={() => handleSort("score")}
                  data-testid="sort-by-score"
                >
                  {t("models.score")}<SortIcon field="score" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedModels.map((model, idx) => (
                <TableRow
                  key={model.name}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  data-testid={`model-row-${model.name.replace(/\s+/g, "-").toLowerCase()}`}
                >
                  <TableCell className="text-muted-foreground/50 text-sm font-mono ps-4">{idx + 1}</TableCell>
                  <TableCell className="font-display font-semibold text-white">{model.name}</TableCell>
                  <TableCell className="text-muted-foreground hidden sm:table-cell">{model.provider}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className={`text-xs border ${
                      model.type === "LLM" ? "border-primary/30 text-primary bg-primary/5" :
                      model.type === "Image" ? "border-secondary/30 text-secondary bg-secondary/5" :
                      model.type === "Video" ? "border-orange-500/30 text-orange-400 bg-orange-500/5" :
                      model.type === "Audio" ? "border-yellow-500/30 text-yellow-400 bg-yellow-500/5" :
                      "border-white/20 text-muted-foreground"
                    }`}>
                      {model.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm hidden lg:table-cell">{model.context}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${model.open ? "text-emerald-400" : "text-muted-foreground/50"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${model.open ? "bg-emerald-400" : "bg-white/20"}`} />
                      {model.open ? t("models.yes") : t("models.no")}
                    </span>
                  </TableCell>
                  <TableCell className="text-end pe-4">
                    <span className={`font-mono font-bold text-lg ${
                      model.score >= 95 ? "text-primary [text-shadow:0_0_8px_rgba(168,85,247,0.6)]" :
                      model.score >= 88 ? "text-secondary" :
                      model.score >= 80 ? "text-white" : "text-muted-foreground"
                    }`}>
                      {model.score.toFixed(1)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      </div>
    </div>
  );
}
