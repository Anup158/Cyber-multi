export type HistoryType = "phishing" | "qr" | "pdf" | "stego";
export type HistoryItem<T = any> = { id: string; type: HistoryType; ts: number; payload: T };

const KEY = "aegisscan.history.v1";
const LIMIT = 50;

function safeParse<T>(v: string | null): T | null {
  try {
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}

export function getHistory<T = any>(type?: HistoryType, limit = 10): HistoryItem<T>[] {
  const all = safeParse<HistoryItem<T>[]>(localStorage.getItem(KEY)) || [];
  const filtered = type ? all.filter((i) => i.type === type) : all;
  return filtered.sort((a, b) => b.ts - a.ts).slice(0, limit);
}

export function addHistory<T = any>(type: HistoryType, payload: T) {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const item: HistoryItem<T> = { id, type, ts: Date.now(), payload };
  const all = safeParse<HistoryItem<T>[]>(localStorage.getItem(KEY)) || [];
  const next = [item, ...all].slice(0, LIMIT);
  localStorage.setItem(KEY, JSON.stringify(next));
  return item;
}

export function clearHistory(type?: HistoryType) {
  if (!type) return localStorage.removeItem(KEY);
  const all = safeParse<HistoryItem[]>(localStorage.getItem(KEY)) || [];
  const next = all.filter((i) => i.type !== type);
  localStorage.setItem(KEY, JSON.stringify(next));
}
