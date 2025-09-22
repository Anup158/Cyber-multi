import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const SIGNS = ["/JavaScript", "/OpenAction", "/AA", "/JS", "/Launch", "/EmbeddedFile", "/RichMedia"];

export default function PDF() {
  const [report, setReport] = useState<{name: string; size: number; hits: { token: string; count: number }[] } | null>(null);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ab = await file.arrayBuffer();
    const text = new TextDecoder("latin1").decode(new Uint8Array(ab));
    const hits = SIGNS.map((token) => ({ token, count: (text.match(new RegExp(token, "g")) || []).length }));
    setReport({ name: file.name, size: file.size, hits });
    try {
      const base64 = btoa(String.fromCharCode(...new Uint8Array(ab)));
      const resp = await fetch("/api/pdf/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ base64, name: file.name }) });
      if (resp.ok) {
        const data = await resp.json();
        setReport({ name: data.name || file.name, size: data.size || file.size, hits: data.hits });
      }
    } catch {}
  }

  const score = report ? Math.min(100, report.hits.reduce((s, h) => s + (h.count > 0 ? (h.token === "/JavaScript" || h.token === "/Launch" ? 35 : 15) : 0), 0)) : 0;
  const risk = score >= 60 ? "high" : score >= 30 ? "medium" : "low";

  return (
    <section className="container py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Malicious PDF Scanner</h1>
          <p className="text-sm text-foreground/70">Static inspection for risky objects and actions. Upload a PDF to analyze.</p>
        </div>
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Upload PDF</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input type="file" accept="application/pdf" onChange={onUpload} className="max-w-md" />
            {report && (
              <div className="space-y-3">
                <div className={`rounded-md border p-3 text-sm ${risk === "high" ? "border-red-500/30 bg-red-500/5 text-red-400" : risk === "medium" ? "border-amber-500/30 bg-amber-500/5 text-amber-400" : "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"}`}>
                  Risk: {risk} (score {score}) — {report.name} ({Math.round(report.size/1024)} KB)
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {report.hits.map((h) => (
                    <div key={h.token} className={`rounded-md border px-3 py-2 text-sm ${h.count > 0 ? "border-red-500/30 bg-red-500/5 text-red-400" : "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"}`}>
                      <div className="font-medium">{h.token}</div>
                      <div className="text-foreground/70">{h.count} match(es)</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-foreground/60">Heuristic-only, does not execute embedded code. For full analysis, integrate a sandbox.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
