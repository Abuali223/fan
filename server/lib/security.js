/**
 * security.js — Password hashing + JWT, using only Node's built-in crypto.
 *
 *   • Passwords: scrypt with a per-user random salt (stored as "salt:hash").
 *   • Tokens: compact HS256 JWTs signed with an HMAC-SHA256 secret.
 */
import {
  scryptSync,
  randomBytes,
  timingSafeEqual,
  createHmac,
} from "node:crypto";

/* ----------------------------- Passwords ----------------------------- */

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password, stored) {
  if (typeof stored !== "string" || !stored.includes(":")) return false;
  const [salt, key] = stored.split(":");
  const derived = scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(key, "hex");
  return keyBuf.length === derived.length && timingSafeEqual(keyBuf, derived);
}

/* ------------------------------- JWT --------------------------------- */

const b64urlJSON = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");

export function signToken(payload, secret, expiresInSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64urlJSON({ alg: "HS256", typ: "JWT" });
  const body = b64urlJSON({ ...payload, iat: now, exp: now + expiresInSeconds });
  const data = `${head}.${body}`;
  const sig = createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyToken(token, secret) {
  if (typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [head, body, sig] = parts;

  const expected = createHmac("sha256", secret)
    .update(`${head}.${body}`)
    .digest("base64url");

  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let payload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
  return payload;
}
