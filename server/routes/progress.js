/**
 * routes/progress.js — Lesson completion + the student dashboard.
 */
import { db } from "../db.js";
import { ApiError } from "../lib/http.js";
import { requireAuth } from "../lib/auth.js";

const lessonExists = db.prepare("SELECT id FROM lessons WHERE id = ?");
const markComplete = db.prepare(
  "INSERT OR IGNORE INTO progress (user_id, lesson_id) VALUES (?, ?)"
);
const unmark = db.prepare("DELETE FROM progress WHERE user_id = ? AND lesson_id = ?");
const completedIds = db.prepare("SELECT lesson_id FROM progress WHERE user_id = ?");

const perSubject = db.prepare(`
  SELECT s.id, s.title, s.slug, s.color, s.icon,
         (SELECT COUNT(*) FROM lessons l WHERE l.subject_id = s.id) AS total,
         (SELECT COUNT(*) FROM lessons l
            JOIN progress p ON p.lesson_id = l.id AND p.user_id = ?
          WHERE l.subject_id = s.id) AS done
  FROM subjects s ORDER BY s.position, s.id
`);
const recentAttempts = db.prepare(`
  SELECT a.id, a.score, a.total, a.created_at, l.title AS lesson_title, l.id AS lesson_id
  FROM quiz_attempts a JOIN lessons l ON l.id = a.lesson_id
  WHERE a.user_id = ? ORDER BY a.id DESC LIMIT 10
`);
const totals = db.prepare(`
  SELECT
    (SELECT COUNT(*) FROM progress WHERE user_id = ?)             AS completed,
    (SELECT COUNT(*) FROM lessons)                                AS lessons,
    (SELECT COUNT(*) FROM quiz_attempts WHERE user_id = ?)        AS attempts,
    (SELECT IFNULL(ROUND(AVG(score * 100.0 / total)), 0)
       FROM quiz_attempts WHERE user_id = ?)                      AS avg_percent
`);

export default function register(router) {
  router.post("/api/lessons/:id/complete", requireAuth, (ctx) => {
    if (!lessonExists.get(ctx.params.id)) throw new ApiError(404, "Dars topilmadi.");
    markComplete.run(ctx.user.id, Number(ctx.params.id));
    return { ok: true, completed: true };
  });

  router.delete("/api/lessons/:id/complete", requireAuth, (ctx) => {
    unmark.run(ctx.user.id, Number(ctx.params.id));
    return { ok: true, completed: false };
  });

  router.get("/api/me/dashboard", requireAuth, (ctx) => {
    const uid = ctx.user.id;
    return {
      completedLessonIds: completedIds.all(uid).map((r) => r.lesson_id),
      subjects: perSubject.all(uid),
      recentAttempts: recentAttempts.all(uid),
      totals: totals.get(uid, uid, uid),
    };
  });
}
