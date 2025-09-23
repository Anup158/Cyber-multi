import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { analyzeUrl } from "@shared/security";
import { addHistory } from "@/lib/history";
import { RecentList } from "@/components/history/RecentList";
import { fetchBinary } from "@/lib/proxy";

export default function QR() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [decoded, setDecoded] = useState<string>("");
  const [supported, setSupported] = useState<boolean>(false);
  const [streaming, setStreaming] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    // @ts-ignore
    setSupported(!!window.BarcodeDetector);
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreaming(true);
        scanLoop();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function scanLoop() {
    // @ts-ignore
    const Detector = window.BarcodeDetector;
    if (!Detector || !videoRef.current) return;
    // @ts-ignore
    const detector = new Detector({ formats: ["qr_code"] });
    const v = videoRef.current;
    const tick = async () => {
      if (!v || v.readyState !== 4) return requestAnimationFrame(tick);
      try {
        // @ts-ignore
        const results = await detector.detect(v);
        if (results && results[0]) {
          const value = results[0].rawValue || "";
          setDecoded(value);
          addHistory("qr", { content: value });
        }
      } catch {}
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      // Try BarcodeDetector on still image
      // @ts-ignore
      if (window.BarcodeDetector) {
        // @ts-ignore
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        const bmp = await createImageBitmap(file);
        const rs = await detector.detect(bmp as any);
        if (rs && rs[0]) { const v = rs[0].rawValue || ""; setDecoded(v); addHistory("qr", { content: v }); }
      }
    } catch (err) {
      console.error(err);
    }
  }

  const insight = decoded && /^(https?:)?\//.test(decoded) ? analyzeUrl(decoded) : null;

  async function scanUrlImage() {
    if (!imageUrl) return;
    try {
      const blob = await fetchBinary(imageUrl);
      // @ts-ignore
      if (window.BarcodeDetector) {
        // @ts-ignore
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        const bmp = await createImageBitmap(await blob);
        const rs = await detector.detect(bmp as any);
        if (rs && rs[0]) { const v = rs[0].rawValue || ""; setDecoded(v); addHistory("qr", { content: v }); }
      }
    } catch (e) { console.error(e); }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onUpload({ target: { files: [file] } } as any);
    else {
      const text = e.dataTransfer.getData("text");
      if (text) { setImageUrl(text); scanUrlImage(); }
    }
  }

  async function onPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const t = e.clipboardData.getData("text");
    if (t) { setImageUrl(t); await scanUrlImage(); return; }
    const items = e.clipboardData.items;
    for (const it of items as any) {
      if (it.type && it.type.startsWith("image/")) {
        const file = it.getAsFile?.();
        if (file) await onUpload({ target: { files: [file] } } as any);
      }
    }
  }

  return (
    <section className="container py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">QR Scanner</h1>
          <p className="text-sm text-foreground/70">Scan QR codes using your camera or upload an image. If the content is a URL, we’ll analyze it for phishing risk.</p>
        </div>
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Scan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3" onDrop={onDrop} onDragOver={(e)=>e.preventDefault()} onPaste={onPaste}>
            <div className="flex flex-wrap items-center gap-2">
              {supported && (
                <Button onClick={startCamera}>{streaming ? "Scanning…" : "Start Camera"}</Button>
              )}
              <div className="text-sm text-foreground/60">upload/paste/drag image • or scan by image URL</div>
              <Input type="file" accept="image/*" onChange={onUpload} className="max-w-xs" />
              <Input placeholder="https://...image.png" value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} className="max-w-sm" />
              <Button variant="secondary" onClick={scanUrlImage}>Scan URL</Button>
            </div>
            <video ref={videoRef} className="mt-2 w-full rounded-md border border-border/60" muted playsInline />
            {decoded && (
              <div className="rounded-md border border-border/60 bg-white/5 p-3 text-sm">
                <div className="font-medium">Decoded</div>
                <div className="break-all text-foreground/80">{decoded}</div>
              </div>
            )}
            {insight && (
              <div className={`rounded-md border p-3 text-sm ${insight.risk === "high" ? "border-red-500/30 bg-red-500/5 text-red-400" : insight.risk === "medium" ? "border-amber-500/30 bg-amber-500/5 text-amber-400" : "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"}`}>
                URL risk: {insight.risk} (score {insight.score})
              </div>
            )}
            {!supported && (
              <div className="text-xs text-foreground/60">BarcodeDetector is not supported in this browser. Upload an image instead.</div>
            )}
          </CardContent>
        </Card>
      <RecentList type="qr" />
      </div>
    </section>
  );
}
