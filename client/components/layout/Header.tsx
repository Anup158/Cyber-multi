import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Shield, QrCode, FileWarning, ImageOff } from "lucide-react";

export function SiteHeader() {
  const { pathname } = useLocation();
  const nav = [
    { to: "/", label: "Home" },
    { to: "/tools", label: "Tools" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="group inline-flex items-center gap-2">
          <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-cyan-400 to-emerald-400 text-background shadow-[0_0_0_2px_theme(colors.background),0_0_20px_theme(colors.cyan.400/50)]">
            <Shield className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            AegisScan
          </span>
        </Link>

        <nav className="hidden gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground/90",
                pathname === item.to ? "text-foreground" : "text-foreground/70",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="ghost" className="hidden md:inline-flex">
            <Link to="/tools">Explore Tools</Link>
          </Button>
          <Button asChild size="sm" className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-[0_0_0_2px_theme(colors.background),0_0_24px_theme(colors.cyan.400/40)] hover:from-cyan-400 hover:to-emerald-400">
            <Link to="/tools">Start Scanning</Link>
          </Button>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="container flex items-center gap-4 overflow-x-auto py-2 text-xs text-foreground/70 md:justify-end">
          <div className="inline-flex items-center gap-1"><QrCode className="h-3.5 w-3.5"/>QR Scanner</div>
          <div className="inline-flex items-center gap-1"><FileWarning className="h-3.5 w-3.5"/>PDF Malware</div>
          <div className="inline-flex items-center gap-1"><ImageOff className="h-3.5 w-3.5"/>Stego Detector</div>
        </div>
      </div>
    </header>
  );
}
