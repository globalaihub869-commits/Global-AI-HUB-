import { useEffect, useRef, useState } from "react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { LineChart as LineChartIcon, FileDown, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/context/AuthContext";

interface AnalyticsOverview {
  revenueSeries: { date: string; revenueUsdt: number }[];
  conversionSeries: { date: string; conversions: number }[];
  usageSeries: { date: string; executions: number; widgetsCreated: number }[];
}

function shortDate(d: string) {
  const [, m, day] = d.split("-");
  return `${m}/${day}`;
}

/**
 * Premium revenue/usage graphs plus a 1-click "Download Executive Business
 * Report" PDF export, both fed by GET /analytics/overview (admin-only,
 * derived from the same live in-memory stores as the rest of the console).
 */
export default function ExecutiveAnalytics() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = () => apiFetch("/analytics/overview").then(setOverview).catch(() => {});
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleExport = async () => {
    if (!overview) return;
    setExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const marginX = 48;
      let y = 56;

      doc.setFillColor(15, 15, 26);
      doc.rect(0, 0, 595, 842, "F");

      doc.setTextColor(168, 85, 247);
      doc.setFontSize(20);
      doc.text("Global AI Hub — Executive Business Report", marginX, y);
      y += 22;

      doc.setTextColor(180, 180, 200);
      doc.setFontSize(10);
      doc.text(`Generated ${new Date().toLocaleString()}`, marginX, y);
      y += 30;

      const totalRevenue = overview.revenueSeries.reduce((s, p) => s + p.revenueUsdt, 0);
      const totalConversions = overview.conversionSeries.reduce((s, p) => s + p.conversions, 0);
      const totalExecutions = overview.usageSeries.reduce((s, p) => s + p.executions, 0);
      const totalWidgets = overview.usageSeries.reduce((s, p) => s + p.widgetsCreated, 0);

      doc.setTextColor(34, 211, 238);
      doc.setFontSize(13);
      doc.text("14-Day Summary", marginX, y);
      y += 20;

      const summaryRows: [string, string][] = [
        ["Total Revenue (USDT)", totalRevenue.toLocaleString()],
        ["Total Conversions", totalConversions.toLocaleString()],
        ["Sandbox Executions", totalExecutions.toLocaleString()],
        ["Widgets Generated", totalWidgets.toLocaleString()],
      ];
      doc.setFontSize(11);
      for (const [label, value] of summaryRows) {
        doc.setTextColor(200, 200, 215);
        doc.text(label, marginX, y);
        doc.setTextColor(255, 255, 255);
        doc.text(value, marginX + 220, y);
        y += 18;
      }
      y += 12;

      doc.setTextColor(234, 179, 8);
      doc.setFontSize(13);
      doc.text("Daily Revenue (USDT)", marginX, y);
      y += 16;
      doc.setFontSize(9);
      for (const point of overview.revenueSeries) {
        doc.setTextColor(180, 180, 200);
        doc.text(point.date, marginX, y);
        doc.setTextColor(255, 255, 255);
        doc.text(`$${point.revenueUsdt.toLocaleString()}`, marginX + 100, y);
        y += 13;
        if (y > 780) {
          doc.addPage();
          doc.setFillColor(15, 15, 26);
          doc.rect(0, 0, 595, 842, "F");
          y = 56;
        }
      }

      doc.save(`global-ai-hub-executive-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mb-8" data-testid="section-executive-analytics" ref={reportRef}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
          <LineChartIcon className="w-4 h-4 text-cyan-300" /> Revenue &amp; Usage Analytics
        </h2>
        <Button
          onClick={handleExport}
          disabled={!overview || exporting}
          size="sm"
          className="rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-semibold hover:from-yellow-400 hover:to-yellow-300"
          data-testid="btn-download-executive-report"
        >
          {exporting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <FileDown className="w-4 h-4 mr-1.5" />}
          Download Executive Business Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[hsl(240,15%,8%)] border-white/8" data-testid="chart-revenue">
          <CardHeader className="pb-2">
            <div className="text-sm text-muted-foreground">Revenue (USDT) — Last 14 Days</div>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overview?.revenueSeries ?? []}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#facc15" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#facc15" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(240,15%,10%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                  />
                  <Area type="monotone" dataKey="revenueUsdt" stroke="#facc15" fill="url(#revGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(240,15%,8%)] border-white/8" data-testid="chart-usage">
          <CardHeader className="pb-2">
            <div className="text-sm text-muted-foreground">Sandbox Usage — Widgets Created / Day</div>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview?.usageSeries ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(240,15%,10%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                  />
                  <Bar dataKey="widgetsCreated" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
