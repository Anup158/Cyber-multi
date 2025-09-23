import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addHistory } from "@/lib/history";
import { RecentList } from "@/components/history/RecentList";
import { fetchBinary } from "@/lib/proxy";

function shannonEntropy(data: Uint8ClampedArray) {
  const hist = new Array(256).fill(0);
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    hist[v]++;
  }
  const total = data.length / 4;
  let H = 0;
  for (let i = 0; i < 256; i++) {
    if (!hist[i]) continue;
    const p = hist[i] / total;
    H -= p * Math.log2(p);
  }
  return H; // 0..8
}

export default function Stego() {
  const [result, setResult] = useState<{ name: string; entropy: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [url, setUrl] = useState("");

  async function onUpload(e: React.ChangeEvent<HTMLInputElement> | { target: { files?: File[] | null } }) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await img.decode();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const pixels = ctx.getImageData(0, 0, img.width, img.height).data;
    const H = shannonEntropy(pixels);
    setResult({ name: file.name, entropy: H });
    const risk = H > 7.5 ? "high" : H > 7.0 ? "medium" : "low";
    addHistory("stego", { name: file.name, entropy: H, risk });
  }

  const risk = result ? (result.entropy > 7.5 ? "high" : result.entropy > 7.0 ? "medium" : "low") : "low";

  async function scanUrl() {
    if (!url) return;
    try {
      const blob = await fetchBinary(url);
      const file = new File([blob], "remote-image", { type: blob.type });
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
      if (it.type?.startsWith("image/")) {
        const file = it.getAsFile?.();
        if (file) await onUpload({ target: { files: [file] } } as any);
      }
    }
  }

  return (
    <section className="container py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Steganography Detection</h1>
          <p className="text-sm text-foreground/70">Upload an image. We estimate entropy to flag potential hidden payloads.</p>
        </div>
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Analyze Image (Upload/Paste/Drop or URL)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3" onDrop={onDrop} onDragOver={(e)=>e.preventDefault()} onPaste={onPaste}>
            <Input type="file" accept="image/*" onChange={onUpload as any} className="max-w-md" />
            <div className="flex gap-2">
              <Input placeholder="https://...image.png" value={url} onChange={(e)=>setUrl(e.target.value)} />
              <Button variant="secondary" onClick={scanUrl}>Scan URL</Button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
            {result && (
              <div className={`rounded-md border p-3 text-sm ${risk === "high" ? "border-red-500/30 bg-red-500/5 text-red-400" : risk === "medium" ? "border-amber-500/30 bg-amber-500/5 text-amber-400" : "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"}`}>
                Risk: {risk} — Entropy {result.entropy.toFixed(2)} bits per pixel — {result.name}
              </div>
            )}
            <p className="text-xs text-foreground/60">Entropy alone cannot confirm steganography; use alongside format-specific detectors for accuracy.</p>
          </CardContent>
        </Card>
        <RecentList type="stego" />
      </div>
    </section>
  );
}
