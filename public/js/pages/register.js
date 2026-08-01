/**
 * register.js — Sign-up form (creates a student account).
 */
import { renderChrome, toast } from "/js/ui.js";
import { register, getUser } from "/js/auth.js";

renderChrome();
const app = document.getElementById("app");
const next = new URLSearchParams(location.search).get("next");

if (getUser()) location.href = next || "/";

app.innerHTML = `
  <div class="auth-wrap">
    <div class="card card--pad auth-card">
      <h1>Ro'yxatdan o'tish</h1>
      <p class="sub">Bepul hisob yarating va o'rganishni boshlang.</p>
      <form id="registerForm" novalidate>
        <div class="field">
          <label for="name">Ism <span class="req">*</span></label>
          <input class="input" id="name" name="name" type="text" autocomplete="name" placeholder="Ismingiz" required />
        </div>
        <div class="field">
          <label for="email">Email <span class="req">*</span></label>
          <input class="input" id="email" name="email" type="email" autocomplete="email" placeholder="siz@email.com" required />
        </div>
        <div class="field">
          <label for="password">Parol <span class="req">*</span></label>
          <input class="input" id="password" name="password" type="password" autocomplete="new-password" placeholder="Kamida 6 ta belgi" required />
        </div>
        <button class="btn btn--primary btn--block" type="submit">Ro'yxatdan o'tish</button>
      </form>
      <p class="auth-alt">Hisobingiz bormi? <a href="/login.html${next ? `?next=${encodeURIComponent(next)}` : ""}">Kiring</a></p>
    </div>
  </div>`;

document.getElementById("registerForm").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const form = ev.target;
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  if (name.length < 2) return toast({ type: "error", message: "Ismni to'liq kiriting." });
  if (password.length < 6) return toast({ type: "error", message: "Parol kamida 6 ta belgi bo'lsin." });

  const btn = form.querySelector('[type="submit"]');
  btn.disabled = true;
  btn.textContent = "Yaratilmoqda…";
  try {
    const user = await register(name, email, password);
    toast({ type: "success", message: `Xush kelibsiz, ${user.name}! Hisob yaratildi.` });
    setTimeout(() => (location.href = next || "/dashboard.html"), 600);
  } catch (e) {
    toast({ type: "error", title: "Ro'yxatdan o'tib bo'lmadi", message: e.message });
    btn.disabled = false;
    btn.textContent = "Ro'yxatdan o'tish";
  }
});
