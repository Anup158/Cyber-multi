export type Check = { id: string; label: string; passed: boolean; details?: string };
export type Analysis = { risk: "low" | "medium" | "high"; score: number; checks: Check[]; normalizedUrl?: string };

export type AnalyzeOptions = {
  allowlist?: string[]; // domains, e.g. "example.com"
  blocklist?: string[]; // domains
};

const SUSPICIOUS_TLDS = [
  "zip",
  "xyz",
  "top",
  "click",
  "country",
  "work",
  "live",
  "lol",
  "kim",
  "fit",
];

export function normalizeUrl(input: string): string | null {
  try {
    const hasProtocol = /^(https?:)?\/\//i.test(input);
    const url = new URL(hasProtocol ? input : `https://${input}`);
    return url.toString();
  } catch {
    return null;
  }
}

function domainMatches(host: string, test: string): boolean {
  const h = host.toLowerCase();
  const t = test.toLowerCase();
  return h === t || h.endsWith(`.${t}`);
}

export function analyzeUrl(raw: string, opts: AnalyzeOptions = {}): Analysis {
  const checks: Check[] = [];
  const normalized = normalizeUrl(raw);
  if (!normalized) {
    return { risk: "high", score: 90, checks: [{ id: "invalid", label: "Valid URL", passed: false, details: "Input is not a valid URL" }] };
  }
  const u = new URL(normalized);
  const host = u.hostname;
  const hostParts = host.split(".");

  // Allow/Block lists
  let allow = false;
  if (opts.allowlist?.length) allow = opts.allowlist.some((d) => domainMatches(host, d));
  const blocked = opts.blocklist?.some((d) => domainMatches(host, d)) ?? false;
  checks.push({ id: "allowlist", label: "Allowlist match", passed: !allow, details: allow ? `Allowlisted domain ${host}` : undefined });
  checks.push({ id: "blocklist", label: "Blocklist match", passed: !blocked, details: blocked ? `Blocklisted domain ${host}` : undefined });

  // Basic signals
  const isIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
  checks.push({ id: "ip", label: "Hostname is IP address", passed: !isIP, details: isIP ? "IP literals often used to evade filters" : undefined });

  const hasAt = normalized.includes("@");
  checks.push({ id: "at", label: "No @ in URL", passed: !hasAt, details: hasAt ? "@ can hide real destination" : undefined });

  const xn = host.includes("xn--");
  checks.push({ id: "idn", label: "No IDN/punycode tricks", passed: !xn, details: xn ? "Potential homograph attack via IDN" : undefined });

  const nonAscii = /[^\x00-\x7F]/.test(host);
  checks.push({ id: "unicode", label: "ASCII hostname", passed: !nonAscii, details: nonAscii ? "Unicode in hostname can impersonate brands" : undefined });

  const subdomains = hostParts.length - 2;
  checks.push({ id: "subs", label: "Reasonable subdomains", passed: subdomains <= 3, details: subdomains > 3 ? `${subdomains} subdomains detected` : undefined });

  const tld = hostParts[hostParts.length - 1]?.toLowerCase();
  const susTld = SUSPICIOUS_TLDS.includes(tld);
  checks.push({ id: "tld", label: "Trusted TLD", passed: !susTld, details: susTld ? `TLD .${tld} is frequently abused` : undefined });

  const weirdPort = !!u.port && !["80", "443"].includes(u.port);
  checks.push({ id: "port", label: "Standard port", passed: !weirdPort, details: weirdPort ? `Non-standard port :${u.port}` : undefined });

  const longQuery = (u.search || "").length > 100;
  checks.push({ id: "query", label: "Reasonable query length", passed: !longQuery, details: longQuery ? "Very long query string" : undefined });

  const manyHyphens = (host.match(/-/g) || []).length >= 3;
  checks.push({ id: "hyphens", label: "Domain not overly hyphenated", passed: !manyHyphens, details: manyHyphens ? "Excessive hyphens in domain" : undefined });

  const baitWords = /(login|verify|update|secure|account|wallet|reset|bonus|prize)/i.test(u.pathname + u.search + u.hash);
  checks.push({ id: "bait", label: "No bait keywords", passed: !baitWords, details: baitWords ? "Contains high-risk keywords" : undefined });

  // Scoring
  const failed = checks.filter((c) => !c.passed);
  let score = 0;
  for (const c of failed) {
    switch (c.id) {
      case "ip":
      case "idn":
      case "unicode":
      case "blocklist":
        score += 25;
        break;
      case "tld":
      case "at":
      case "port":
        score += 15;
        break;
      default:
        score += 8;
    }
  }
  if (allow) score = Math.max(0, score - 25);
  score = Math.min(100, score);
  const risk = score >= 60 ? "high" : score >= 30 ? "medium" : "low";
  return { risk, score, checks, normalizedUrl: normalized };
}
