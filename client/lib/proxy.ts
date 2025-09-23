export async function fetchBinary(url: string): Promise<Blob> {
  const resp = await fetch("/api/proxy/fetch-binary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!resp.ok) throw new Error("Proxy fetch failed");
  const data = await resp.json();
  const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
  return new Blob([bytes], {
    type: data.contentType || "application/octet-stream",
  });
}
