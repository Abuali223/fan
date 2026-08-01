/**
 * http.js — Small HTTP helpers on top of node:http.
 *   • ApiError: typed errors that map to HTTP status codes
 *   • readJsonBody: parse a JSON request body (size-limited)
 *   • sendJson / sendError: JSON responses
 *   • sendFile: static file responses with correct content types
 */
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname } from "node:path";

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const MAX_BODY = 1_000_000; // 1 MB

export function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new ApiError(413, "So'rov hajmi juda katta."));
        req.destroy();
        return;
      }
      raw += chunk;
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new ApiError(400, "Noto'g'ri JSON ma'lumot."));
      }
    });
    req.on("error", () => reject(new ApiError(400, "So'rovni o'qishda xatolik.")));
  });
}

export function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

export function sendError(res, err) {
  const status = err instanceof ApiError ? err.status : 500;
  if (status >= 500) console.error("[server]", err);
  sendJson(res, status, { error: err.message || "Server xatosi." });
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".map": "application/json; charset=utf-8",
};

export async function sendFile(res, filePath, status = 200) {
  const info = await stat(filePath);
  const type = MIME[extname(filePath).toLowerCase()] || "application/octet-stream";
  res.writeHead(status, {
    "Content-Type": type,
    "Content-Length": info.size,
    "Cache-Control": "no-cache",
  });
  createReadStream(filePath).pipe(res);
}
