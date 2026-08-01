/**
 * routes/auth.js — Registration, login, current user.
 */
import { db } from "../db.js";
import { ApiError } from "../lib/http.js";
import { hashPassword, verifyPassword, signToken } from "../lib/security.js";
import { requireAuth } from "../lib/auth.js";
import { config } from "../config.js";
import * as v from "../lib/validate.js";

const insertUser = db.prepare(
  "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)"
);
const findByEmail = db.prepare("SELECT * FROM users WHERE email = ?");

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  created_at: u.created_at,
});

const tokenFor = (u) =>
  signToken({ sub: u.id, role: u.role }, config.jwtSecret, config.jwtExpiresIn);

export default function register(router) {
  // Public sign-up always creates a "student" account.
  router.post("/api/auth/register", (ctx) => {
    const name = v.str(ctx.body.name, "Ism", { min: 2, max: 80 });
    const email = v.email(ctx.body.email);
    const password = v.password(ctx.body.password);

    if (findByEmail.get(email)) {
      throw new ApiError(409, "Bu email allaqachon ro'yxatdan o'tgan.");
    }

    const info = insertUser.run(name, email, hashPassword(password), "student");
    const user = {
      id: Number(info.lastInsertRowid),
      name,
      email,
      role: "student",
    };
    return { token: tokenFor(user), user: publicUser(user) };
  });

  router.post("/api/auth/login", (ctx) => {
    const email = v.email(ctx.body.email);
    const password = v.password(ctx.body.password);

    const u = findByEmail.get(email);
    if (!u || !verifyPassword(password, u.password_hash)) {
      throw new ApiError(401, "Email yoki parol noto'g'ri.");
    }
    return { token: tokenFor(u), user: publicUser(u) };
  });

  router.get("/api/auth/me", requireAuth, (ctx) => ({ user: ctx.user }));
}
