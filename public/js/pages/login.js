/**
 * login.js — Sign-in form.
 */
import { renderChrome, escapeHtml, toast, icon } from "/js/ui.js";
import { login, getUser } from "/js/auth.js";

renderChrome();
const app = document.getElementById("app");
const next = new URLSearchParams(location.search).get("next");

if (getUser()) location.href = next || "/";

app.innerHTML = `
  <div class="auth-wrap">
    <div class="card card--pad auth-card">
      <h1>Xush kelibsiz 👋</h1>
      <p class="sub">Bilimdon hisobingizga kiring.</p>
      <form id="loginForm" novalidate>
        <div class="field">
          <label for="email">Email <span class="req">*</span></label>
          <input class="input" id="email" name="email" type="email" autocomplete="email" placeholder="siz@email.com" required />
          <span class="form-error" data-for="email"></span>
        </div>
        <div class="field">
          <label for="password">Parol <span class="req">*</span></label>
          <input class="input" id="password" name="password" type="password" autocomplete="current-password" placeholder="••••••" required />
          <span class="form-error" data-for="password"></span>
        </div>
        <button class="btn btn--primary btn--block" type="submit">Kirish</button>
      </form>
      <p class="auth-alt">Hisobingiz yo'qmi? <a href="/register.html${next ? `?next=${encodeURIComponent(next)}` : ""}">Ro'yxatdan o'ting</a></p>
      <div class="demo-hint">
        <strong>Sinov uchun:</strong><br />
        Admin: <code>admin@bilimdon.uz</code> / <code>admin123</code><br />
        O'quvchi: <code>student@bilimdon.uz</code> / <code>student123</code>
      </div>
    </div>
  </div>`;

document.getElementById("loginForm").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const form = ev.target;
  const email = form.email.value.trim();
  const password = form.password.value;
  if (!email || !password) {
    toast({ type: "error", message: "Email va parolni kiriting." });
    return;
  }
  const btn = form.querySelector('[type="submit"]');
  btn.disabled = true;
  btn.textContent = "Kirilmoqda…";
  try {
    const user = await login(email, password);
    toast({ type: "success", message: `Xush kelibsiz, ${user.name}!` });
    const target = next || (user.role === "student" ? "/dashboard.html" : "/admin/");
    setTimeout(() => (location.href = target), 500);
  } catch (e) {
    toast({ type: "error", title: "Kirib bo'lmadi", message: e.message });
    btn.disabled = false;
    btn.textContent = "Kirish";
  }
});
