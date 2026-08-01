/**
 * lesson.js — Lesson content + video + completion + interactive quiz.
 */
import { api } from "/js/api.js";
import { renderChrome, icon, escapeHtml, toast, toEmbedUrl } from "/js/ui.js";
import { isLoggedIn } from "/js/auth.js";

renderChrome();
const app = document.getElementById("app");
const id = new URLSearchParams(location.search).get("id");
if (!id) location.href = "/";

let lesson;
let questions = [];

async function load() {
  app.innerHTML = `<section class="section container"><div class="spinner"></div></section>`;
  try {
    lesson = (await api.get(`/api/lessons/${id}`)).lesson;
    questions = (await api.get(`/api/lessons/${id}/quiz`)).questions;
    render();
  } catch (e) {
    app.innerHTML = `<section class="section container"><div class="empty">${escapeHtml(e.message)}</div></section>`;
  }
}

function render() {
  const s = lesson.subject || {};
  document.title = `${lesson.title} — Bilimdon`;
  const embed = toEmbedUrl(lesson.video_url);

  app.innerHTML = `
    <section class="section container">
      <a class="muted" href="/subject.html?id=${s.id}" style="display:inline-flex;gap:.4rem;font-size:.9rem;margin-bottom:1rem">← ${escapeHtml(s.title || "Fan")}</a>
      <div class="lesson-layout">
        <div class="page-head">
          <span class="eyebrow" style="color:${escapeHtml(s.color || "#2563eb")}">${escapeHtml(s.title || "")}</span>
          <h1>${escapeHtml(lesson.title)}</h1>
          ${lesson.summary ? `<p>${escapeHtml(lesson.summary)}</p>` : ""}
        </div>

        ${embed ? `<div class="video-frame"><iframe src="${escapeHtml(embed)}" title="Dars videosi" allowfullscreen loading="lazy"></iframe></div>` : ""}

        <article class="card card--pad lesson-content">${lesson.content || "<p class='muted'>Bu dars uchun matn qo'shilmagan.</p>"}</article>

        <div class="lesson-actions">
          <button class="btn ${lesson.completed ? "btn--ghost" : "btn--primary"}" id="completeBtn">
            ${lesson.completed ? `${icon("check", 18)} Tugatilgan` : "Tugatilgan deb belgilash"}
          </button>
          ${questions.length ? `<a class="btn btn--ghost" href="#test">Testni yechish (${questions.length} savol)</a>` : ""}
        </div>

        ${questions.length ? quizMarkup() : ""}
      </div>
    </section>`;

  document.getElementById("completeBtn").addEventListener("click", toggleComplete);
  const form = document.getElementById("quizForm");
  if (form) form.addEventListener("submit", submitQuiz);
}

function quizMarkup() {
  return `
    <div id="test" class="stack" style="margin-top:1rem">
      <div class="sec-head"><h2>Test</h2><p>Bilimingizni sinab ko'ring. O'tish uchun 60% kerak.</p></div>
      <form id="quizForm" class="quiz">
        ${questions
          .map(
            (q, qi) => `
          <div class="question" data-qid="${q.id}">
            <p class="question__text">${qi + 1}. ${escapeHtml(q.text)}</p>
            <div class="options">
              ${q.options
                .map(
                  (opt, oi) => `
                <label class="option" data-oi="${oi}">
                  <input type="radio" name="q${q.id}" value="${oi}" />
                  <span>${escapeHtml(opt)}</span>
                </label>`
                )
                .join("")}
            </div>
          </div>`
          )
          .join("")}
        <button class="btn btn--primary" type="submit">Javoblarni yuborish</button>
      </form>
      <div id="quizResult"></div>
    </div>`;
}

async function toggleComplete() {
  if (!isLoggedIn()) return promptLogin();
  const btn = document.getElementById("completeBtn");
  btn.disabled = true;
  try {
    if (lesson.completed) {
      await api.del(`/api/lessons/${id}/complete`);
      lesson.completed = false;
      toast({ type: "info", message: "Belgi olib tashlandi." });
    } else {
      await api.post(`/api/lessons/${id}/complete`);
      lesson.completed = true;
      toast({ type: "success", message: "Dars tugatilgan deb belgilandi!" });
    }
    render();
  } catch (e) {
    toast({ type: "error", message: e.message });
    btn.disabled = false;
  }
}

async function submitQuiz(ev) {
  ev.preventDefault();
  if (!isLoggedIn()) return promptLogin();

  const answers = {};
  for (const q of questions) {
    const checked = document.querySelector(`input[name="q${q.id}"]:checked`);
    if (checked) answers[q.id] = Number(checked.value);
  }
  if (Object.keys(answers).length < questions.length) {
    toast({ type: "error", message: "Iltimos, barcha savollarga javob bering." });
    return;
  }

  const btn = ev.target.querySelector('[type="submit"]');
  btn.disabled = true;
  try {
    const res = await api.post(`/api/lessons/${id}/quiz/submit`, { answers });
    showResults(res);
  } catch (e) {
    toast({ type: "error", message: e.message });
    btn.disabled = false;
  }
}

function showResults(res) {
  const byId = Object.fromEntries(res.results.map((r) => [r.id, r]));
  document.querySelectorAll(".question").forEach((qEl) => {
    const qid = Number(qEl.dataset.qid);
    const r = byId[qid];
    qEl.querySelectorAll("input").forEach((i) => (i.disabled = true));
    qEl.querySelectorAll(".option").forEach((opt) => {
      const oi = Number(opt.dataset.oi);
      if (oi === r.correct_index) opt.classList.add("correct");
      else if (oi === r.selected) opt.classList.add("wrong");
    });
  });

  const pass = res.percent >= 60;
  if (pass) lesson.completed = true;
  const box = document.getElementById("quizResult");
  box.innerHTML = `
    <div class="quiz-result">
      <div class="quiz-result__score ${pass ? "pass" : "fail"}">${res.score} / ${res.total}</div>
      <p style="font-weight:600;margin-top:.25rem">${res.percent}% — ${pass ? "Ajoyib, o'tdingiz! 🎉" : "Yana urinib ko'ring."}</p>
      ${pass ? `<p class="muted" style="margin-top:.25rem">Bu dars avtomatik tugatilgan deb belgilandi.</p>` : ""}
    </div>`;
  box.scrollIntoView({ behavior: "smooth", block: "center" });
  const cbtn = document.getElementById("completeBtn");
  if (pass && cbtn) cbtn.outerHTML = `<button class="btn btn--ghost" id="completeBtn">${icon("check", 18)} Tugatilgan</button>`;
}

function promptLogin() {
  toast({ type: "info", title: "Kirish kerak", message: "Davom etish uchun tizimga kiring." });
  setTimeout(() => (location.href = `/login.html?next=${encodeURIComponent(location.pathname + location.search)}`), 1200);
}

load();
