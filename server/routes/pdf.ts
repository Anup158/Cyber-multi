import { RequestHandler } from "express";
import { PdfAnalyzeRequest, PdfAnalyzeResponse } from "@shared/api";

const SIGNS = ["/JavaScript", "/OpenAction", "/AA", "/JS", "/Launch", "/EmbeddedFile", "/RichMedia"];

export const handlePdfAnalyze: RequestHandler = async (req, res) => {
  const body = req.body as PdfAnalyzeRequest;
  if (!body?.base64) return res.status(400).json({ error: "Missing base64" });
  try {
    const buffer = Buffer.from(body.base64, "base64");
    const text = buffer.toString("latin1");
    const hits = SIGNS.map((token) => ({ token, count: (text.match(new RegExp(token, "g")) || []).length }));
    const score = Math.min(
      100,
      hits.reduce((s, h) => s + (h.count > 0 ? (h.token === "/JavaScript" || h.token === "/Launch" ? 35 : 15) : 0), 0),
    );
    const risk: PdfAnalyzeResponse["risk"] = score >= 60 ? "high" : score >= 30 ? "medium" : "low";
    const response: PdfAnalyzeResponse = { hits, score, risk, name: body.name, size: buffer.length };
    res.status(200).json(response);
  } catch (e) {
    res.status(400).json({ error: "Invalid base64" });
  }
};
