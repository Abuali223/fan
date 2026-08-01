/**
 * dashboard.js — Student progress dashboard.
 */
import { api } from "/js/api.js";
import { renderChrome, icon, escapeHtml, toast } from "/js/ui.js";
import { guard, getUser } from "/js/auth.js";

renderChrome();
if (!guard()) throw new Error("redirecting");

const app = document.getElementById("app");
const user = getUser();

function pct(done, total) {
  return total ? Math.round((done / total) * 100) : 0;
}

async function load() {
  app.innerHTML = `<section class="section container"><div class="spinner"></div></section>`;
  try {
    const d = await api.get("/api/me/dashboard");
    const t = d.totals;
    app.innerHTML = `
      <section class="section container">
        <div class="page-head">
          <h1>Salom, ${escapeHtml(user.name)}! 👋</h1>
          <p>Bu yerda o'rganish jarayoningiz va natijalaringiz.</p>
        </div>

        <div class="stat-cards">
          <div class="stat-card"><span class="stat-card__icon">${icon("check", 22)}</span>
            <div class="stat-card__value">${t.completed}<span class="muted" style="font-size:1rem">/${t.lessons}</span></div>
            <div class="stat-card__label">Tugatilgan darslar</div></div>
          <div class="stat-card"><span class="stat-card__icon">${icon("award", 22)}</span>
            <div class="stat-card__value">${t.attempts}</div>
            <div class="stat-card__label">Yechilgan testlar</div></div>
          <div class="stat-card"><span class="stat-card__icon">${icon("sigma", 22)}</span>
            <div class="stat-card__value">${t.avg_percent}%</div>
            <div class="stat-card__label">O'rtacha natija</div></div>
        </div>

        <div class="sec-head" style="margin-top:2.5rem"><h2>Fanlar bo'yicha progress</h2></div>
        <div class="stack">
          ${d.subjects
            .map(
              (s) => `
            <a class="progress-item" href="/subject.html?id=${s.id}" style="--accent:${escapeHtml(s.color)};display:block">
              <div class="progress-item__top">
                <span class="progress-item__name">${escapeHtml(s.title)}</span>
                <span class="progress-item__count">${s.done}/${s.total} • ${pct(s.done, s.total)}%</span>
              </div>
              <div class="bar"><div class="bar__fill" style="width:${pct(s.done, s.total)}%;background:${escapeHtml(s.color)}"></div></div>
            </a>`
            )
            .join("")}
        </div>

        <div class="sec-head" style="margin-top:2.5rem"><h2>So'nggi test natijalari</h2></div>
        ${
          d.recentAttempts.length
            ? `<div class="table-wrap"><table class="table">
                <thead><tr><th>Dars</th><th>Natija</th><th>Foiz</th><th>Sana</th></tr></thead>
                <tbody>${d.recentAttempts
                  .map((a) => {
                    const p = Math.round((a.score / a.total) * 100);
                    return `<tr>
                      <td><a href="/lesson.html?id=${a.lesson_id}" style="color:var(--color-primary)">${escapeHtml(a.lesson_title)}</a></td>
                      <td>${a.score}/${a.total}</td>
                      <td><span class="role-pill role-pill--${p >= 60 ? "student" : "admin"}">${p}%</span></td>
                      <td class="muted">${escapeHtml(a.created_at)}</td>
                    </tr>`;
                  })
                  .join("")}</tbody></table></div>`
            : `<div class="empty">Hali test yechmadingiz. <a href="/" style="color:var(--color-primary)">Darsni boshlang →</a></div>`
        }
      </section>`;
  } catch (e) {
    toast({ type: "error", message: e.message });
    app.innerHTML = `<section class="section container"><div class="empty">${escapeHtml(e.message)}</div></section>`;
  }
}

load();
