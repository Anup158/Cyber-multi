import { RequestHandler } from "express";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB cap

export const handleFetchBinary: RequestHandler = async (req, res) => {
  try {
    const { url } = req.body as { url?: string };
    if (!url) return res.status(400).json({ error: "Missing url" });
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) return res.status(400).json({ error: "Only http/https allowed" });

    const resp = await fetch(u.toString(), { redirect: "follow" });
    if (!resp.ok || !resp.body) return res.status(400).json({ error: `Fetch failed: ${resp.status}` });

    const arrayBuffer = await resp.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_BYTES) return res.status(413).json({ error: "File too large" });

    const ct = resp.headers.get("content-type") || "application/octet-stream";
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    res.json({ base64, contentType: ct, size: arrayBuffer.byteLength });
  } catch (e) {
    res.status(400).json({ error: "Invalid URL" });
  }
};
