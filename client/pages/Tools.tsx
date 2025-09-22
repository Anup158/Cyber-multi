import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, QrCode, FileWarning, ImageOff, Rocket } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    title: "Phishing Detection",
    desc: "Analyze URLs, HTML and headers to detect credential harvesting and brand impersonation.",
    icon: ShieldCheck,
    action: "Scan URL",
    to: "/tools/phishing",
  },
  {
    title: "QR Scanner",
    desc: "Decode QR content safely in-browser and validate for malicious redirects.",
    icon: QrCode,
    action: "Scan QR",
    to: "/tools/qr",
  },
  {
    title: "Malicious PDF Scanner",
    desc: "Static analysis for embedded JavaScript, suspicious objects and known exploit signatures.",
    icon: FileWarning,
    action: "Scan PDF",
    to: "/tools/pdf",
  },
  {
    title: "Steganography Detection",
    desc: "Detect hidden payloads and anomalous entropy in common image formats.",
    icon: ImageOff,
    action: "Scan Image",
    to: "/tools/stego",
  },
];

export default function Tools() {
  return (
    <section className="relative">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,hsl(var(--primary)/0.2),transparent_60%)]" />
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Unified tools. One platform.
          </h1>
          <p className="mt-3 text-foreground/70">
            Start with any module below.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} className="border-border/60 bg-gradient-to-b from-white/5 to-transparent">
              <CardHeader>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 text-cyan-400 ring-1 ring-inset ring-cyan-500/30">
                  <f.icon className="h-5 w-5" />
                </div>
                <CardTitle className="mt-3 text-base">{f.title}</CardTitle>
                <CardDescription className="text-foreground/70">{f.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="secondary" className="w-full justify-center border border-border/60 bg-white/5 text-foreground hover:bg-white/10">
                  <Link to={f.to}><Rocket className="mr-2 h-4 w-4" /> {f.action}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
