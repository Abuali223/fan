/**
 * admin/dashboard.js — Overview stats + recent users.
 */
import { api } from "/js/api.js";
import { ROLE_LABELS } from "/js/auth.js";
import { initAdmin, icon, escapeHtml, toast } from "/js/admin/common.js";

const { content } = initAdmin("dashboard", {
  subtitle: "Platforma statistikasi va so'nggi faoliyat.",
});

const card = (value, label, ic) => `
  <div class="stat-card"><span class="stat-card__icon">${icon(ic, 22)}</span>
    <div class="stat-card__value">${value}</div>
    <div class="stat-card__label">${label}</div></div>`;

async function load() {
  try {
    const { counts, recentUsers } = await api.get("/api/stats");
    content.innerHTML = `
      <div class="stat-cards">
        ${card(counts.users, "Foydalanuvchilar", "users")}
        ${card(counts.students, "O'quvchilar", "user")}
        ${card(counts.subjects, "Fanlar", "book")}
        ${card(counts.lessons, "Darslar", "code")}
        ${card(counts.questions, "Test savollari", "check")}
        ${card(counts.attempts, "Yechilgan testlar", "award")}
      </div>

      <div class="sec-head" style="margin-top:2.5rem"><h2>So'nggi ro'yxatdan o'tganlar</h2></div>
      ${
        recentUsers.length
          ? `<div class="table-wrap"><table class="table">
              <thead><tr><th>Ism</th><th>Email</th><th>Rol</th><th>Sana</th></tr></thead>
              <tbody>${recentUsers
                .map(
                  (u) => `<tr>
                    <td>${escapeHtml(u.name)}</td>
                    <td class="muted">${escapeHtml(u.email)}</td>
                    <td><span class="role-pill role-pill--${u.role}">${ROLE_LABELS[u.role] || u.role}</span></td>
                    <td class="muted">${escapeHtml(u.created_at)}</td>
                  </tr>`
                )
                .join("")}</tbody></table></div>`
          : `<div class="empty">Foydalanuvchilar yo'q.</div>`
      }`;
  } catch (e) {
    toast({ type: "error", message: e.message });
    content.innerHTML = `<div class="empty">${escapeHtml(e.message)}</div>`;
  }
}

load();
