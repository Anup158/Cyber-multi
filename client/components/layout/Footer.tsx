export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-20 md:flex-row">
        <p className="text-sm text-foreground/60">© {new Date().getFullYear()} AegisScan — Unified Threat Scanning</p>
        <div className="text-xs text-foreground/60">
          Built for MERN • Privacy-first • No data resale
        </div>
      </div>
    </footer>
  );
}
