/**
 * routes/quizzes.js — Quiz questions, taking & auto-grading, and (staff) editing.
 */
import { db } from "../db.js";
import { ApiError } from "../lib/http.js";
import { requireAuth, requireStaff } from "../lib/auth.js";
import * as v from "../lib/validate.js";

const lessonExists = db.prepare("SELECT id FROM lessons WHERE id = ?");
const questionsByLesson = db.prepare(
  "SELECT * FROM questions WHERE lesson_id = ? ORDER BY position, id"
);
const getQuestion = db.prepare("SELECT * FROM questions WHERE id = ?");
const insertQuestion = db.prepare(
  "INSERT INTO questions (lesson_id, text, options, correct_index, position) VALUES (?, ?, ?, ?, ?)"
);
const updateQuestion = db.prepare(
  "UPDATE questions SET text = ?, options = ?, correct_index = ?, position = ? WHERE id = ?"
);
const deleteQuestion = db.prepare("DELETE FROM questions WHERE id = ?");
const insertAttempt = db.prepare(
  "INSERT INTO quiz_attempts (user_id, lesson_id, score, total) VALUES (?, ?, ?, ?)"
);
const markComplete = db.prepare(
  "INSERT OR IGNORE INTO progress (user_id, lesson_id) VALUES (?, ?)"
);

/** Validate + normalise an options array and correct index from a request. */
function parseOptions(body) {
  if (!Array.isArray(body.options)) throw new ApiError(400, "Variantlar ro'yxat bo'lishi kerak.");
  const options = body.options.map((o, i) => v.str(o, `Variant ${i + 1}`, { min: 1, max: 300 }));
  if (options.length < 2) throw new ApiError(400, "Kamida 2 ta variant kerak.");
  if (options.length > 6) throw new ApiError(400, "Ko'pi bilan 6 ta variant bo'lishi mumkin.");
  const correct_index = v.int(body.correct_index, "To'g'ri javob", { min: 0, max: options.length - 1 });
  return { options, correct_index };
}

export default function register(router) {
  /* ---------- Student: take the quiz (no correct answers exposed) ---------- */
  router.get("/api/lessons/:id/quiz", (ctx) => {
    if (!lessonExists.get(ctx.params.id)) throw new ApiError(404, "Dars topilmadi.");
    const questions = questionsByLesson.all(ctx.params.id);
    return {
      questions: questions.map((q) => ({
        id: q.id,
        text: q.text,
        options: JSON.parse(q.options),
      })),
    };
  });

  router.post("/api/lessons/:id/quiz/submit", requireAuth, (ctx) => {
    const lessonId = Number(ctx.params.id);
    if (!lessonExists.get(lessonId)) throw new ApiError(404, "Dars topilmadi.");
    const questions = questionsByLesson.all(lessonId);
    if (questions.length === 0) throw new ApiError(400, "Bu darsda test yo'q.");

    const answers = ctx.body.answers || {};
    let score = 0;
    const results = questions.map((q) => {
      const selected = Number(answers[q.id]);
      const correct = selected === q.correct_index;
      if (correct) score++;
      return { id: q.id, selected: Number.isInteger(selected) ? selected : null, correct, correct_index: q.correct_index };
    });

    const total = questions.length;
    insertAttempt.run(ctx.user.id, lessonId, score, total);
    // Passing (>= 60%) also marks the lesson as completed.
    if (score / total >= 0.6) markComplete.run(ctx.user.id, lessonId);

    return { score, total, percent: Math.round((score / total) * 100), results };
  });

  /* ---------------- Staff: manage questions (with answers) ---------------- */
  router.get("/api/lessons/:id/questions", requireStaff, (ctx) => {
    if (!lessonExists.get(ctx.params.id)) throw new ApiError(404, "Dars topilmadi.");
    return {
      questions: questionsByLesson.all(ctx.params.id).map((q) => ({
        ...q,
        options: JSON.parse(q.options),
      })),
    };
  });

  router.post("/api/lessons/:id/questions", requireStaff, (ctx) => {
    const lessonId = Number(ctx.params.id);
    if (!lessonExists.get(lessonId)) throw new ApiError(404, "Dars topilmadi.");
    const text = v.str(ctx.body.text, "Savol", { min: 3, max: 500 });
    const { options, correct_index } = parseOptions(ctx.body);
    const position = v.int(ctx.body.position ?? 0, "Tartib", { min: 0, max: 999 });

    const info = insertQuestion.run(lessonId, text, JSON.stringify(options), correct_index, position);
    const q = getQuestion.get(Number(info.lastInsertRowid));
    return { question: { ...q, options: JSON.parse(q.options) } };
  });

  router.put("/api/questions/:id", requireStaff, (ctx) => {
    const q = getQuestion.get(ctx.params.id);
    if (!q) throw new ApiError(404, "Savol topilmadi.");
    const text = v.str(ctx.body.text, "Savol", { min: 3, max: 500 });
    const { options, correct_index } = parseOptions(ctx.body);
    const position = v.int(ctx.body.position ?? q.position, "Tartib", { min: 0, max: 999 });

    updateQuestion.run(text, JSON.stringify(options), correct_index, position, q.id);
    const updated = getQuestion.get(q.id);
    return { question: { ...updated, options: JSON.parse(updated.options) } };
  });

  router.delete("/api/questions/:id", requireStaff, (ctx) => {
    const q = getQuestion.get(ctx.params.id);
    if (!q) throw new ApiError(404, "Savol topilmadi.");
    deleteQuestion.run(q.id);
    return { ok: true };
  });
}
