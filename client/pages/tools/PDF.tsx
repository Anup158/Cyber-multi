import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addHistory } from "@/lib/history";
import { RecentList } from "@/components/history/RecentList";
import { fetchBinary } from "@/lib/proxy";

const SIGNS = ["/JavaScript", "/OpenAction", "/AA", "/JS", "/Launch", "/EmbeddedFile", "/RichMedia"];

export default function PDF() {
  const [report, setReport] = useState<{name: string; size: number; hits: { token: string; count: number }[] } | null>(null);
  const [url, setUrl] = useState("");

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
        if (typeof data.score === "number" && data.risk) {
          addHistory("pdf", { name: data.name || file.name, score: data.score, risk: data.risk });
        }
      }
    } catch {}
  }

  const score = report ? Math.min(100, report.hits.reduce((s, h) => s + (h.count > 0 ? (h.token === "/JavaScript" || h.token === "/Launch" ? 35 : 15) : 0), 0)) : 0;
  const risk = score >= 60 ? "high" : score >= 30 ? "medium" : "low";

  async function scanUrl() {
    if (!url) return;
    try {
      const blob = await fetchBinary(url);
      const file = new File([blob], "remote.pdf", { type: blob.type });
      await onUpload({ target: { files: [file] } } as any);
    } catch (e) { console.error(e); }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onUpload({ target: { files: [file] } } as any);
    else { const text = e.dataTransfer.getData("text"); if (text) { setUrl(text); scanUrl(); } }
  }

  async function onPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const t = e.clipboardData.getData("text");
    if (t) { setUrl(t); await scanUrl(); return; }
    const items = e.clipboardData.items as any;
    for (const it of items) {
      if (it.type === "application/pdf") {
        const file = it.getAsFile?.();
        if (file) await onUpload({ target: { files: [file] } } as any);
      }
    }
  }

  return (
    <section className="container py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Malicious PDF Scanner</h1>
          <p className="text-sm text-foreground/70">Static inspection for risky objects and actions. Upload a PDF to analyze.</p>
        </div>
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Upload/Paste/Drop or Scan by URL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3" onDrop={onDrop} onDragOver={(e)=>e.preventDefault()} onPaste={onPaste}>
            <Input type="file" accept="application/pdf" onChange={onUpload} className="max-w-md" />
            <div className="flex gap-2">
              <Input placeholder="https://...file.pdf" value={url} onChange={(e)=>setUrl(e.target.value)} />
              <Button variant="secondary" onClick={scanUrl}>Scan URL</Button>
            </div>
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
        <RecentList type="pdf" />
      </div>
    </section>
  );
}
