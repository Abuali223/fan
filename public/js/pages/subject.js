/**
 * subject.js — One subject with its lesson list.
 */
import { api } from "/js/api.js";
import { renderChrome, icon, escapeHtml, toast } from "/js/ui.js";
import { isLoggedIn } from "/js/auth.js";

renderChrome();
const app = document.getElementById("app");
const id = new URLSearchParams(location.search).get("id");

if (!id) location.href = "/";

async function load() {
  app.innerHTML = `<section class="section container"><div class="spinner"></div></section>`;
  try {
    const [{ subject }, { lessons }] = await Promise.all([
      api.get(`/api/subjects/${id}`),
      api.get(`/api/subjects/${id}/lessons`),
    ]);

    let done = new Set();
    if (isLoggedIn()) {
      try {
        const d = await api.get("/api/me/dashboard");
        done = new Set(d.completedLessonIds);
      } catch {
        /* ignore */
      }
    }

    document.title = `${subject.title} — Bilimdon`;
    app.innerHTML = `
      <section class="section container">
        <a class="muted" href="/#fanlar" style="display:inline-flex;gap:.4rem;align-items:center;font-size:.9rem;margin-bottom:1rem">← Barcha fanlar</a>
        <div class="page-head" style="border-left:4px solid ${escapeHtml(subject.color)};padding-left:1rem">
          <span class="eyebrow">${icon(subject.icon, 16)} Fan</span>
          <h1>${escapeHtml(subject.title)}</h1>
          <p>${escapeHtml(subject.description || "")}</p>
        </div>
        ${
          lessons.length
            ? `<div class="lesson-list">${lessons
                .map(
                  (l, i) => `
              <a class="lesson-row" href="/lesson.html?id=${l.id}">
                <span class="lesson-row__num">${i + 1}</span>
                <span class="lesson-row__body">
                  <span class="lesson-row__title">${escapeHtml(l.title)}</span>
                  <span class="lesson-row__sum">${escapeHtml(l.summary || "")}</span>
                </span>
                ${
                  done.has(l.id)
                    ? `<span class="lesson-row__done">${icon("check", 16)} Tugatilgan</span>`
                    : `<span class="muted" style="font-size:.8rem;white-space:nowrap">${l.question_count} ta savol</span>`
                }
              </a>`
                )
                .join("")}</div>`
            : `<div class="empty">Bu fanda hozircha darslar yo'q.</div>`
        }
      </section>`;
  } catch (e) {
    app.innerHTML = `<section class="section container"><div class="empty">${escapeHtml(e.message)}</div></section>`;
  }
}

load();
