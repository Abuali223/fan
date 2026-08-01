/**
 * routes/users.js — User & role management (admin only).
 */
import { db } from "../db.js";
import { ApiError } from "../lib/http.js";
import { requireAdmin } from "../lib/auth.js";
import { hashPassword } from "../lib/security.js";
import * as v from "../lib/validate.js";

const ROLES = ["admin", "manager", "student"];

const listStmt = db.prepare(`
  SELECT u.id, u.name, u.email, u.role, u.created_at,
         (SELECT COUNT(*) FROM progress p WHERE p.user_id = u.id) AS completed
  FROM users u ORDER BY u.id
`);
const getStmt = db.prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?");
const byEmail = db.prepare("SELECT id FROM users WHERE email = ?");
const insertStmt = db.prepare(
  "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)"
);
const updateRole = db.prepare("UPDATE users SET role = ? WHERE id = ?");
const deleteStmt = db.prepare("DELETE FROM users WHERE id = ?");
const countAdmins = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'");

export default function register(router) {
  router.get("/api/users", requireAdmin, () => ({ users: listStmt.all() }));

  router.post("/api/users", requireAdmin, (ctx) => {
    const name = v.str(ctx.body.name, "Ism", { min: 2, max: 80 });
    const email = v.email(ctx.body.email);
    const password = v.password(ctx.body.password);
    const role = v.oneOf(ctx.body.role, ROLES, "Rol");
    if (byEmail.get(email)) throw new ApiError(409, "Bu email allaqachon mavjud.");

    const info = insertStmt.run(name, email, hashPassword(password), role);
    return { user: getStmt.get(Number(info.lastInsertRowid)) };
  });

  router.put("/api/users/:id/role", requireAdmin, (ctx) => {
    const target = getStmt.get(ctx.params.id);
    if (!target) throw new ApiError(404, "Foydalanuvchi topilmadi.");
    const role = v.oneOf(ctx.body.role, ROLES, "Rol");

    // Safety: don't let an admin demote themselves, and keep at least one admin.
    if (target.id === ctx.user.id && role !== "admin") {
      throw new ApiError(400, "O'z rolingizni o'zgartira olmaysiz.");
    }
    if (target.role === "admin" && role !== "admin" && countAdmins.get().n <= 1) {
      throw new ApiError(400, "Kamida bitta admin qolishi kerak.");
    }

    updateRole.run(role, target.id);
    return { user: getStmt.get(target.id) };
  });

  router.delete("/api/users/:id", requireAdmin, (ctx) => {
    const target = getStmt.get(ctx.params.id);
    if (!target) throw new ApiError(404, "Foydalanuvchi topilmadi.");
    if (target.id === ctx.user.id) throw new ApiError(400, "O'zingizni o'chira olmaysiz.");
    if (target.role === "admin" && countAdmins.get().n <= 1) {
      throw new ApiError(400, "Oxirgi adminni o'chirib bo'lmaydi.");
    }
    deleteStmt.run(target.id);
    return { ok: true };
  });
}
