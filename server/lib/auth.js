/**
 * auth.js — Request authentication + role guards.
 */
import { verifyToken } from "./security.js";
import { ApiError } from "./http.js";
import { config } from "../config.js";
import { db } from "../db.js";

const findUserById = db.prepare(
  "SELECT id, name, email, role, created_at FROM users WHERE id = ?"
);

/** Resolve the current user from the Authorization: Bearer header (or null). */
export function getUserFromRequest(req) {
  const header = req.headers["authorization"] || "";
  if (!header.startsWith("Bearer ")) return null;
  const payload = verifyToken(header.slice(7), config.jwtSecret);
  if (!payload) return null;
  return findUserById.get(payload.sub) || null;
}

/** Guard: requires a logged-in user. */
export function requireAuth(ctx) {
  if (!ctx.user) {
    throw new ApiError(401, "Avtorizatsiya talab qilinadi. Iltimos, tizimga kiring.");
  }
}

/** Guard factory: requires one of the given roles. */
export function requireRole(...roles) {
  return (ctx) => {
    requireAuth(ctx);
    if (!roles.includes(ctx.user.role)) {
      throw new ApiError(403, "Bu amalni bajarish uchun ruxsatingiz yo'q.");
    }
  };
}

// Convenience guards.
export const requireStaff = requireRole("admin", "manager"); // content managers
export const requireAdmin = requireRole("admin");
