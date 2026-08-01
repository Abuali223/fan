/**
 * validate.js — Tiny input validation helpers. Throw ApiError(400) on failure.
 */
import { ApiError } from "./http.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Required, trimmed string with optional length bounds. */
export function str(value, label, { min = 1, max = 5000 } = {}) {
  if (typeof value !== "string") throw new ApiError(400, `${label} matn bo'lishi kerak.`);
  const v = value.trim();
  if (v.length < min) throw new ApiError(400, `${label} kamida ${min} ta belgidan iborat bo'lishi kerak.`);
  if (v.length > max) throw new ApiError(400, `${label} ${max} ta belgidan oshmasligi kerak.`);
  return v;
}

/** Optional string (may be empty); returns trimmed string or "". */
export function optionalStr(value, max = 20000) {
  if (value == null) return "";
  if (typeof value !== "string") throw new ApiError(400, "Noto'g'ri matn qiymati.");
  const v = value.trim();
  if (v.length > max) throw new ApiError(400, `Matn ${max} ta belgidan oshmasligi kerak.`);
  return v;
}

export function email(value) {
  const v = str(value, "Email", { min: 3, max: 200 }).toLowerCase();
  if (!EMAIL_RE.test(v)) throw new ApiError(400, "Email manzil noto'g'ri.");
  return v;
}

export function password(value) {
  if (typeof value !== "string" || value.length < 6) {
    throw new ApiError(400, "Parol kamida 6 ta belgidan iborat bo'lishi kerak.");
  }
  return value;
}

/** Integer within optional bounds. */
export function int(value, label, { min = -Infinity, max = Infinity } = {}) {
  const n = Number(value);
  if (!Number.isInteger(n)) throw new ApiError(400, `${label} butun son bo'lishi kerak.`);
  if (n < min || n > max) throw new ApiError(400, `${label} qiymati diapazondan tashqarida.`);
  return n;
}

/** One of the allowed values. */
export function oneOf(value, allowed, label) {
  if (!allowed.includes(value)) {
    throw new ApiError(400, `${label} quyidagilardan biri bo'lishi kerak: ${allowed.join(", ")}.`);
  }
  return value;
}
