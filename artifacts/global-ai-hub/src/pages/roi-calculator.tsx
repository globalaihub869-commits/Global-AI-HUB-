import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, TrendingUp, Sparkles, DollarSign, Calendar, Percent } from "lucide-react";

const ANNUAL_ROI_RATE = 0.34; // assumed avg annual return from AI-tool driven productivity gains
const MIN_INVESTMENT = 1_000;
const MAX_INVESTMENT = 500_000;
const MIN_YEARS = 1;
const MAX_YEARS = 10;

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function buildProjection(investment: number, years: number) {
  const points: { year: number; value: number; invested: number }[] = [];
  for (let y = 0; y <= years; y++) {
    points.push({
      year: y,
      value: Math.round(investment * Math.pow(1 + ANNUAL_ROI_RATE, y)),
      invested: investment,
    });
  }
  return points;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-primary/30 bg-[hsl(240,15%,10%)] px-4 py-3 shadow-[0_0_25px_rgba(168,85,247,0.25)]">
      <p className="text-xs text-muted-foreground mb-1">Year {label}</p>
      <p className="text-white font-display font-bold text-lg">{formatCurrency(payload[0]?.value ?? 0)}</p>
    </div>
  );
}

export default function RoiCalculator() {
  const [investment, setInvestment] = useState(25_000);
  const [years, setYears] = useState(5);

  const data = useMemo(() => buildProjection(investment, years), [investment, years]);
  const finalValue = data[data.length - 1]?.value ?? investment;
  const totalGain = finalValue - investment;
  const roiPercent = ((totalGain / investment) * 100).toFixed(0);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="fixed top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-secondary/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-xs font-medium mb-4">
            <Calculator className="w-3 h-3" />
            Interactive ROI Projection
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3 [text-shadow:0_0_30px_rgba(34,211,238,0.2)]">
            AI Investment ROI Calculator
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Estimate the compounding returns of investing in AI tools and infrastructure over time.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="bg-[hsl(240,15%,8%)] border-white/8 h-full">
              <CardContent className="p-6 flex flex-col gap-8">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                      <DollarSign className="w-4 h-4 text-primary" />
                      Investment Amount
                    </label>
                    <span className="text-lg font-display font-bold text-primary" data-testid="text-investment-value">
                      {formatCurrency(investment)}
                    </span>
                  </div>
                  <Slider
                    min={MIN_INVESTMENT}
                    max={MAX_INVESTMENT}
                    step={1000}
                    value={[investment]}
                    onValueChange={([v]) => setInvestment(v ?? investment)}
                    className="[&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-primary [&_.bg-primary]:to-secondary"
                    data-testid="slider-investment"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground/60 mt-2">
                    <span>{formatCurrency(MIN_INVESTMENT)}</span>
                    <span>{formatCurrency(MAX_INVESTMENT)}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                      <Calendar className="w-4 h-4 text-secondary" />
                      Timeline
                    </label>
                    <span className="text-lg font-display font-bold text-secondary" data-testid="text-years-value">
                      {years} {years === 1 ? "year" : "years"}
                    </span>
                  </div>
                  <Slider
                    min={MIN_YEARS}
                    max={MAX_YEARS}
                    step={1}
                    value={[years]}
                    onValueChange={([v]) => setYears(v ?? years)}
                    data-testid="slider-years"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground/60 mt-2">
                    <span>{MIN_YEARS} yr</span>
                    <span>{MAX_YEARS} yrs</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2"><Percent className="w-3.5 h-3.5" />Assumed annual return</span>
                    <span className="text-sm text-white font-semibold">{(ANNUAL_ROI_RATE * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" />Total gain</span>
                    <span className="text-sm text-emerald-400 font-semibold" data-testid="text-total-gain">{formatCurrency(totalGain)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <Card className="bg-[hsl(240,15%,8%)] border-white/8 h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Projected value</p>
                    <p className="text-3xl font-display font-bold text-white [text-shadow:0_0_20px_rgba(168,85,247,0.3)]" data-testid="text-final-value">
                      {formatCurrency(finalValue)}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold" data-testid="badge-roi-percent">
                    <TrendingUp className="w-4 h-4" />
                    +{roiPercent}% ROI
                  </div>
                </div>

                <div className="flex-1 min-h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(168,85,247,0.8)" />
                          <stop offset="100%" stopColor="rgba(34,211,238,0.05)" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis
                        dataKey="year"
                        tickFormatter={(y) => `Y${y}`}
                        stroke="rgba(255,255,255,0.3)"
                        tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={(v) => formatCurrency(v)}
                        stroke="rgba(255,255,255,0.3)"
                        tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        width={64}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#a855f7"
                        strokeWidth={2.5}
                        fill="url(#roiGradient)"
                        isAnimationActive
                        animationDuration={600}
                        data-testid="chart-roi-area"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <p className="text-xs text-muted-foreground/50 text-center mt-4">
                  Projections are illustrative estimates based on a {(ANNUAL_ROI_RATE * 100).toFixed(0)}% assumed annual return and are not financial advice.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
