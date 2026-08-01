/**
 * routes/subjects.js — Subjects (fanlar).
 * Public: list. Staff (admin/manager): create, update, delete.
 */
import { db } from "../db.js";
import { ApiError } from "../lib/http.js";
import { requireStaff } from "../lib/auth.js";
import * as v from "../lib/validate.js";

const listStmt = db.prepare(`
  SELECT s.*,
         (SELECT COUNT(*) FROM lessons l WHERE l.subject_id = s.id) AS lesson_count
  FROM subjects s
  ORDER BY s.position, s.id
`);
const getStmt = db.prepare("SELECT * FROM subjects WHERE id = ?");
const bySlug = db.prepare("SELECT id FROM subjects WHERE slug = ?");
const insertStmt = db.prepare(
  "INSERT INTO subjects (slug, title, description, icon, color, position) VALUES (?, ?, ?, ?, ?, ?)"
);
const updateStmt = db.prepare(
  "UPDATE subjects SET title = ?, description = ?, icon = ?, color = ?, position = ? WHERE id = ?"
);
const deleteStmt = db.prepare("DELETE FROM subjects WHERE id = ?");

/** Turn a title into a URL-safe, unique slug. */
function makeSlug(title) {
  const base =
    title
      .toLowerCase()
      .replace(/[''`]/g, "")
      .replace(/[^a-z0-9Ѐ-ӿ]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "fan";
  let slug = base;
  let i = 2;
  while (bySlug.get(slug)) slug = `${base}-${i++}`;
  return slug;
}

export default function register(router) {
  router.get("/api/subjects", () => ({ subjects: listStmt.all() }));

  router.get("/api/subjects/:id", (ctx) => {
    const subject = getStmt.get(ctx.params.id);
    if (!subject) throw new ApiError(404, "Fan topilmadi.");
    return { subject };
  });

  router.post("/api/subjects", requireStaff, (ctx) => {
    const title = v.str(ctx.body.title, "Fan nomi", { min: 2, max: 100 });
    const description = v.optionalStr(ctx.body.description, 500);
    const icon = v.optionalStr(ctx.body.icon, 40) || "book";
    const color = v.optionalStr(ctx.body.color, 20) || "#2563eb";
    const position = v.int(ctx.body.position ?? 0, "Tartib", { min: 0, max: 999 });

    const info = insertStmt.run(makeSlug(title), title, description, icon, color, position);
    return { subject: getStmt.get(Number(info.lastInsertRowid)) };
  });

  router.put("/api/subjects/:id", requireStaff, (ctx) => {
    const subject = getStmt.get(ctx.params.id);
    if (!subject) throw new ApiError(404, "Fan topilmadi.");

    const title = v.str(ctx.body.title, "Fan nomi", { min: 2, max: 100 });
    const description = v.optionalStr(ctx.body.description, 500);
    const icon = v.optionalStr(ctx.body.icon, 40) || "book";
    const color = v.optionalStr(ctx.body.color, 20) || "#2563eb";
    const position = v.int(ctx.body.position ?? subject.position, "Tartib", { min: 0, max: 999 });

    updateStmt.run(title, description, icon, color, position, subject.id);
    return { subject: getStmt.get(subject.id) };
  });

  router.delete("/api/subjects/:id", requireStaff, (ctx) => {
    const subject = getStmt.get(ctx.params.id);
    if (!subject) throw new ApiError(404, "Fan topilmadi.");
    deleteStmt.run(subject.id); // cascades to lessons/questions
    return { ok: true };
  });
}
