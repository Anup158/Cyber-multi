import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { clearHistory, getHistory, HistoryItem, HistoryType } from "@/lib/history";

function formatItem(item: HistoryItem) {
  switch (item.type) {
    case "phishing": {
      const { url, risk, score } = item.payload as { url: string; risk: string; score: number };
      return `${url} — ${risk} (${score})`;
    }
    case "qr": {
      const { content } = item.payload as { content: string };
      return content.length > 60 ? content.slice(0, 60) + "…" : content;
    }
    case "pdf": {
      const { name, risk, score } = item.payload as { name: string; risk: string; score: number };
      return `${name} — ${risk} (${score})`;
    }
    case "stego": {
      const { name, entropy, risk } = item.payload as { name: string; entropy: number; risk: string };
      return `${name} — H=${entropy.toFixed(2)} • ${risk}`;
    }
    default:
      return "Unknown";
  }
}

export function RecentList({ type }: { type: HistoryType }) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  useEffect(() => {
    setItems(getHistory(type, 6));
  }, [type]);

  if (!items.length) return null;

  return (
    <Card className="mt-6 border-border/60">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Recent</CardTitle>
        <Button size="sm" variant="ghost" onClick={() => { clearHistory(type); setItems([]); }}>Clear</Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((i) => (
          <div key={i.id} className="truncate text-sm text-foreground/80">
            {formatItem(i)}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
