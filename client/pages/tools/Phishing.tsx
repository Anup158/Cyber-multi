import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { analyzeUrl, normalizeUrl } from "@/lib/security";
import { ShieldAlert, ShieldCheck, Link as LinkIcon } from "lucide-react";

export default function Phishing() {
  const [url, setUrl] = useState("");
  const analysis = useMemo(() => (url ? analyzeUrl(url) : null), [url]);

  const color = analysis?.risk === "high" ? "text-red-400" : analysis?.risk === "medium" ? "text-amber-400" : "text-emerald-400";

  return (
    <section className="container py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 text-cyan-400 ring-1 ring-inset ring-cyan-500/30">
            <LinkIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Phishing URL Analysis</h1>
            <p className="text-sm text-foreground/70">Paste a URL to evaluate risk using static heuristics. Runs completely in your browser.</p>
          </div>
        </div>

        <Card className="mt-6 border-border/60">
          <CardHeader>
            <CardTitle>Analyze URL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/login"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                autoFocus
              />
              <Button onClick={() => setUrl((v) => v.trim())}>Run</Button>
            </div>
            {analysis && (
              <div className="space-y-4">
                <Alert className="border-border/60">
                  {analysis.risk === "high" ? (
                    <ShieldAlert className="h-4 w-4" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  <AlertTitle className="capitalize">{analysis.risk} risk — score {analysis.score}</AlertTitle>
                  <AlertDescription>
                    <div className="text-sm text-foreground/70">URL: {normalizeUrl(url) ?? url}</div>
                  </AlertDescription>
                </Alert>

                <div className="grid gap-2 sm:grid-cols-2">
                  {analysis.checks.map((c) => (
                    <div
                      key={c.id}
                      className={`rounded-md border px-3 py-2 text-sm ${c.passed ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" : "border-red-500/30 bg-red-500/5 text-red-400"}`}
                    >
                      <div className="font-medium">{c.label}</div>
                      {c.details && <div className="text-foreground/70">{c.details}</div>}
                    </div>
                  ))}
                </div>

                <p className="text-xs text-foreground/60">This is a heuristic analysis and not a guarantee. Combine with network and reputation intelligence for best results.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
