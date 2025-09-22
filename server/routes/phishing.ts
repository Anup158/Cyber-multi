import { RequestHandler } from "express";
import { PhishingAnalyzeRequest, PhishingAnalyzeResponse } from "@shared/api";
import { analyzeUrl } from "../../shared/security";

const parseList = (v?: string) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);

export const handlePhishingAnalyze: RequestHandler = (req, res) => {
  const body = req.body as PhishingAnalyzeRequest;
  if (!body?.url) return res.status(400).json({ error: "Missing url" });

  const allowlist = parseList(process.env.ALLOW_DOMAINS);
  const blocklist = parseList(process.env.BLOCK_DOMAINS);
  const result = analyzeUrl(body.url, { allowlist, blocklist });
  const response: PhishingAnalyzeResponse = result;
  res.status(200).json(response);
};
