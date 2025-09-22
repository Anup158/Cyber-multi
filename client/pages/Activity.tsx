import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getHistory, clearHistory, HistoryItem, HistoryType } from "@/lib/history";
import { Download, Trash2, Shield, QrCode, FileWarning, ImageOff, Filter } from "lucide-react";

const TYPES: { key: HistoryType | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "phishing", label: "Phishing" },
  { key: "qr", label: "QR" },
  { key: "pdf", label: "PDF" },
  { key: "stego", label: "Stego" },
];

function iconFor(type: HistoryType) {
  switch (type) {
    case "phishing":
      return <Shield className="h-4 w-4" />;
    case "qr":
      return <QrCode className="h-4 w-4" />;
    case "pdf":
      return <FileWarning className="h-4 w-4" />;
    case "stego":
      return <ImageOff className="h-4 w-4" />;
  }
}

function toCSV(items: HistoryItem[]) {
  const rows = items.map((i) => {
    const payload = typeof i.payload === "string" ? i.payload : JSON.stringify(i.payload);
    return [new Date(i.ts).toISOString(), i.type, payload.replaceAll("\n", " ")];
  });
  return ["timestamp,type,payload", ...rows.map((r) => r.map((v) => `"${v.replaceAll('"', '""')}"`).join(","))].join("\n");
}

export default function Activity() {
  const [filter, setFilter] = useState<HistoryType | "all">("all");
  const items = useMemo(() => getHistory(filter === "all" ? undefined : filter, 100), [filter]);

  function exportJSON() {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `aegisscan-history-${filter}.json`;
    a.click();
  }
  function exportCSV() {
    const blob = new Blob([toCSV(items)], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `aegisscan-history-${filter}.csv`;
    a.click();
  }

  function onClear() {
    if (filter === "all") clearHistory();
    else clearHistory(filter);
    location.reload();
  }

  return (
    <section className="container py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Activity</h1>
            <p className="text-sm text-foreground/70">Recent scans stored locally in your browser. Export or clear at any time.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportCSV}><Download className="mr-2 h-4 w-4"/>CSV</Button>
            <Button variant="secondary" onClick={exportJSON}><Download className="mr-2 h-4 w-4"/>JSON</Button>
            <Button variant="destructive" onClick={onClear}><Trash2 className="mr-2 h-4 w-4"/>Clear</Button>
          </div>
        </div>

        <Card className="mt-6 border-border/60">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base inline-flex items-center gap-2"><Filter className="h-4 w-4"/>Filter</CardTitle>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <Button key={t.key} size="sm" variant={filter === t.key ? "default" : "secondary"} onClick={() => setFilter(t.key as any)}>
                  {t.label}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {!items.length && <div className="text-sm text-foreground/60">No activity yet.</div>}
            <div className="divide-y divide-border/60">
              {items.map((i) => (
                <div key={i.id} className="flex items-center gap-3 py-3">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/5 text-cyan-400 ring-1 ring-inset ring-cyan-500/30">
                    {iconFor(i.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {i.type === "phishing" && (i.payload as any).url}
                      {i.type === "qr" && (i.payload as any).content}
                      {i.type === "pdf" && (i.payload as any).name}
                      {i.type === "stego" && (i.payload as any).name}
                    </div>
                    <div className="truncate text-xs text-foreground/60">
                      {new Date(i.ts).toLocaleString()} • {i.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
