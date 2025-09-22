/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Phishing Analysis
export interface PhishingAnalyzeRequest {
  url: string;
}
export interface Check {
  id: string;
  label: string;
  passed: boolean;
  details?: string;
}
export interface PhishingAnalyzeResponse {
  risk: "low" | "medium" | "high";
  score: number;
  checks: Check[];
  normalizedUrl?: string;
}

// PDF Analysis
export interface PdfAnalyzeRequest {
  base64: string; // base64 of the PDF file
  name?: string;
}
export interface PdfHit {
  token: string;
  count: number;
}
export interface PdfAnalyzeResponse {
  risk: "low" | "medium" | "high";
  score: number;
  hits: PdfHit[];
  name?: string;
  size?: number;
}
