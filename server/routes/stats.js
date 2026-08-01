/**
 * routes/stats.js — Aggregate counts for the admin/manager dashboard.
 */
import { db } from "../db.js";
import { requireStaff } from "../lib/auth.js";

const stmt = db.prepare(`
  SELECT
    (SELECT COUNT(*) FROM users)                          AS users,
    (SELECT COUNT(*) FROM users WHERE role = 'admin')     AS admins,
    (SELECT COUNT(*) FROM users WHERE role = 'manager')   AS managers,
    (SELECT COUNT(*) FROM users WHERE role = 'student')   AS students,
    (SELECT COUNT(*) FROM subjects)                       AS subjects,
    (SELECT COUNT(*) FROM lessons)                        AS lessons,
    (SELECT COUNT(*) FROM questions)                      AS questions,
    (SELECT COUNT(*) FROM quiz_attempts)                  AS attempts,
    (SELECT COUNT(*) FROM progress)                       AS completions
`);

const recentUsers = db.prepare(
  "SELECT id, name, email, role, created_at FROM users ORDER BY id DESC LIMIT 5"
);

export default function register(router) {
  router.get("/api/stats", requireStaff, () => ({
    counts: stmt.get(),
    recentUsers: recentUsers.all(),
  }));
}
