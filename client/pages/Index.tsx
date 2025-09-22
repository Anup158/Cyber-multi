import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, QrCode, FileWarning, ImageOff, ChevronRight } from "lucide-react";

export default function Index() {
  return (
    <div className="relative">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(80%_80%_at_50%_-10%,hsl(var(--primary)/0.25),transparent_60%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.25))]" />
      <section className="container relative py-14 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/5 px-3 py-1 text-xs text-foreground/70">
              MERN • Cyber Security • Unified Scanners
            </div>
            <h1 className="mt-4 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
              One platform for phishing, QR, PDF malware and steganography detection
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-foreground/70">
              AegisScan brings enterprise-grade security scans to your MERN apps. Fast, privacy-first analysis for links, files and images — no data resale.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-[0_0_0_2px_theme(colors.background),0_0_30px_theme(colors.cyan.400/40)] hover:from-cyan-400 hover:to-emerald-400">
                <Link to="/tools">Start Scanning</Link>
              </Button>
              <Button asChild variant="secondary" className="border border-border/60 bg-white/5 text-foreground hover:bg-white/10">
                <a href="#features">Explore Features <ChevronRight className="ml-1 h-4 w-4" /></a>
              </Button>
            </div>
            <div className="mt-8 grid max-w-lg grid-cols-2 gap-4 text-sm">
              <div className="inline-flex items-center gap-2 text-foreground/70"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/>Private-by-design</div>
              <div className="inline-flex items-center gap-2 text-foreground/70"><span className="h-1.5 w-1.5 rounded-full bg-cyan-400"/>No vendor lock-in</div>
              <div className="inline-flex items-center gap-2 text-foreground/70"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/>API & UI integrated</div>
              <div className="inline-flex items-center gap-2 text-foreground/70"><span className="h-1.5 w-1.5 rounded-full bg-cyan-400"/>MERN ready</div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 blur-2xl" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-border/60 bg-gradient-to-b from-white/5 to-transparent">
                <CardContent className="p-6">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 text-cyan-400 ring-1 ring-inset ring-cyan-500/30">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="mt-4 font-semibold">Phishing Detection</div>
                  <p className="mt-1 text-sm text-foreground/70">URL and HTML analysis for brand impersonation and credential traps.</p>
                </CardContent>
              </Card>
              <Card className="border-border/60 bg-gradient-to-b from-white/5 to-transparent">
                <CardContent className="p-6">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 text-cyan-400 ring-1 ring-inset ring-cyan-500/30">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div className="mt-4 font-semibold">QR Scanner</div>
                  <p className="mt-1 text-sm text-foreground/70">Decode safely in-browser, block malicious redirects.</p>
                </CardContent>
              </Card>
              <Card className="border-border/60 bg-gradient-to-b from-white/5 to-transparent">
                <CardContent className="p-6">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 text-cyan-400 ring-1 ring-inset ring-cyan-500/30">
                    <FileWarning className="h-5 w-5" />
                  </div>
                  <div className="mt-4 font-semibold">Malicious PDF Scanner</div>
                  <p className="mt-1 text-sm text-foreground/70">Static analysis for embedded JS and exploit signatures.</p>
                </CardContent>
              </Card>
              <Card className="border-border/60 bg-gradient-to-b from-white/5 to-transparent">
                <CardContent className="p-6">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 text-cyan-400 ring-1 ring-inset ring-cyan-500/30">
                    <ImageOff className="h-5 w-5" />
                  </div>
                  <div className="mt-4 font-semibold">Steganography Detection</div>
                  <p className="mt-1 text-sm text-foreground/70">Entropy checks and payload discovery in images.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="container py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Built for production</h2>
          <p className="mt-3 text-foreground/70">Scalable architecture, privacy-first defaults, and a UI that fits seamlessly into any MERN stack app.</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat label="False-positive tuned" value="<1%" />
          <Stat label="Cold start" value="<200ms" />
          <Stat label="Open-source core" value="Yes" />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-border/60 bg-gradient-to-b from-white/5 to-transparent text-center">
      <CardContent className="p-6">
        <div className="text-3xl font-extrabold tracking-tight">{value}</div>
        <div className="mt-1 text-xs text-foreground/70">{label}</div>
      </CardContent>
    </Card>
  );
}
