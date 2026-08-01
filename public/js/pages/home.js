/**
 * home.js — Landing page: hero + subject grid.
 */
import { api } from "/js/api.js";
import { renderChrome, icon, escapeHtml, toast } from "/js/ui.js";
import { isLoggedIn } from "/js/auth.js";

renderChrome();
const app = document.getElementById("app");

app.innerHTML = `
  <section class="hero">
    <div class="container hero__inner">
      <span class="eyebrow">${icon("cap", 16)} Onlayn ta'lim platformasi</span>
      <h1>Bilim — <span class="text-gradient">kelajak kaliti</span></h1>
      <p>IT, Kimyo, Matematika va Ona tili fanlarini bosqichma-bosqich o'rganing.
         Darslarni o'qing, videolarni ko'ring va testlar bilan bilimingizni sinang.</p>
      <div class="hero__actions">
        ${
          isLoggedIn()
            ? `<a class="btn btn--primary btn--lg" href="#fanlar">Fanlarni ko'rish</a>`
            : `<a class="btn btn--primary btn--lg" href="/register.html">Bepul boshlash</a>
               <a class="btn btn--ghost btn--lg" href="#fanlar">Fanlar</a>`
        }
      </div>
    </div>
  </section>

  <section class="section container" id="fanlar">
    <div class="sec-head">
      <h2>Fanlar</h2>
      <p>O'rganmoqchi bo'lgan faningizni tanlang.</p>
    </div>
    <div class="subject-grid" id="subjectGrid"><div class="spinner"></div></div>
  </section>`;

async function loadSubjects() {
  const grid = document.getElementById("subjectGrid");
  try {
    const { subjects } = await api.get("/api/subjects");
    if (!subjects.length) {
      grid.innerHTML = `<div class="empty">Hozircha fanlar qo'shilmagan.</div>`;
      return;
    }
    grid.innerHTML = subjects
      .map(
        (s) => `
      <a class="subject-card" href="/subject.html?id=${s.id}" style="--accent:${escapeHtml(s.color)}">
        <span class="subject-card__icon" style="background:${escapeHtml(s.color)}">${icon(s.icon, 26)}</span>
        <h3>${escapeHtml(s.title)}</h3>
        <p>${escapeHtml(s.description || "")}</p>
        <span class="subject-card__meta">${icon("book", 16)} ${s.lesson_count} ta dars</span>
      </a>`
      )
      .join("");
  } catch (e) {
    grid.innerHTML = `<div class="empty">Fanlarni yuklashda xatolik yuz berdi.</div>`;
    toast({ type: "error", message: e.message });
  }
}

loadSubjects();
