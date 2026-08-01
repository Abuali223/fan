/**
 * routes/lessons.js — Lessons (darslar).
 * Public: list by subject, get one. Staff: create, update, delete.
 */
import { db } from "../db.js";
import { ApiError } from "../lib/http.js";
import { requireStaff } from "../lib/auth.js";
import * as v from "../lib/validate.js";

const listBySubject = db.prepare(`
  SELECT id, subject_id, title, summary, position, video_url,
         (SELECT COUNT(*) FROM questions q WHERE q.lesson_id = lessons.id) AS question_count
  FROM lessons WHERE subject_id = ? ORDER BY position, id
`);
const getStmt = db.prepare("SELECT * FROM lessons WHERE id = ?");
const subjectOf = db.prepare("SELECT id, slug, title, color FROM subjects WHERE id = ?");
const questionCount = db.prepare("SELECT COUNT(*) AS n FROM questions WHERE lesson_id = ?");
const isCompleted = db.prepare(
  "SELECT 1 FROM progress WHERE user_id = ? AND lesson_id = ?"
);
const insertStmt = db.prepare(
  "INSERT INTO lessons (subject_id, title, summary, content, video_url, position) VALUES (?, ?, ?, ?, ?, ?)"
);
const updateStmt = db.prepare(
  "UPDATE lessons SET title = ?, summary = ?, content = ?, video_url = ?, position = ? WHERE id = ?"
);
const deleteStmt = db.prepare("DELETE FROM lessons WHERE id = ?");

export default function register(router) {
  router.get("/api/subjects/:id/lessons", (ctx) => {
    if (!subjectOf.get(ctx.params.id)) throw new ApiError(404, "Fan topilmadi.");
    return { lessons: listBySubject.all(ctx.params.id) };
  });

  router.get("/api/lessons/:id", (ctx) => {
    const lesson = getStmt.get(ctx.params.id);
    if (!lesson) throw new ApiError(404, "Dars topilmadi.");
    const subject = subjectOf.get(lesson.subject_id);
    const completed = ctx.user
      ? !!isCompleted.get(ctx.user.id, lesson.id)
      : false;
    return {
      lesson: {
        ...lesson,
        subject,
        question_count: questionCount.get(lesson.id).n,
        completed,
      },
    };
  });

  router.post("/api/lessons", requireStaff, (ctx) => {
    const subject_id = v.int(ctx.body.subject_id, "Fan", { min: 1 });
    if (!subjectOf.get(subject_id)) throw new ApiError(404, "Fan topilmadi.");
    const title = v.str(ctx.body.title, "Dars nomi", { min: 2, max: 160 });
    const summary = v.optionalStr(ctx.body.summary, 400);
    const content = v.optionalStr(ctx.body.content, 50000);
    const video_url = v.optionalStr(ctx.body.video_url, 400);
    const position = v.int(ctx.body.position ?? 0, "Tartib", { min: 0, max: 999 });

    const info = insertStmt.run(subject_id, title, summary, content, video_url, position);
    return { lesson: getStmt.get(Number(info.lastInsertRowid)) };
  });

  router.put("/api/lessons/:id", requireStaff, (ctx) => {
    const lesson = getStmt.get(ctx.params.id);
    if (!lesson) throw new ApiError(404, "Dars topilmadi.");
    const title = v.str(ctx.body.title, "Dars nomi", { min: 2, max: 160 });
    const summary = v.optionalStr(ctx.body.summary, 400);
    const content = v.optionalStr(ctx.body.content, 50000);
    const video_url = v.optionalStr(ctx.body.video_url, 400);
    const position = v.int(ctx.body.position ?? lesson.position, "Tartib", { min: 0, max: 999 });

    updateStmt.run(title, summary, content, video_url, position, lesson.id);
    return { lesson: getStmt.get(lesson.id) };
  });

  router.delete("/api/lessons/:id", requireStaff, (ctx) => {
    const lesson = getStmt.get(ctx.params.id);
    if (!lesson) throw new ApiError(404, "Dars topilmadi.");
    deleteStmt.run(lesson.id);
    return { ok: true };
  });
}
