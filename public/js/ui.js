/**
 * ui.js — Shared UI: chrome (header/footer), toasts, icons, theme, helpers.
 */
import { auth, getUser, ROLE_LABELS } from "/js/auth.js";

/* ----------------------------- Helpers ------------------------------ */
export const el = (html) => {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

export const escapeHtml = (s) =>
  String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

export const qs = (sel, scope = document) => scope.querySelector(sel);

/* ------------------------------ Icons ------------------------------- */
const PATHS = {
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  flask: '<path d="M9 3h6"/><path d="M10 3v6l-4.5 8.5A2 2 0 0 0 7.3 21h9.4a2 2 0 0 0 1.8-3.5L14 9V3"/><path d="M7 14h10"/>',
  sigma: '<path d="M18 4H6l6 8-6 8h12"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  cap: '<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5"/>',
  dashboard: '<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',
  shield: '<path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  play: '<polygon points="6 4 20 12 6 20 6 4"/>',
  arrow: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.5 13 17 22l-5-3-5 3 1.5-9"/>',
};

export function icon(name, size = 20) {
  const p = PATHS[name] || PATHS.book;
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
}

/* ------------------------------ Toasts ------------------------------ */
const TOAST_ICON = {
  success: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  error: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
};

export function toast({ type = "info", title = "", message = "", duration = 4000 } = {}) {
  let box = qs("#toastContainer");
  if (!box) {
    box = el('<div class="toast-container" id="toastContainer" aria-live="polite"></div>');
    document.body.appendChild(box);
  }
  const t = el(`
    <div class="toast toast--${type}" role="${type === "error" ? "alert" : "status"}">
      <span class="toast__icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${TOAST_ICON[type] || TOAST_ICON.info}</svg></span>
      <div class="toast__body">
        ${title ? `<p class="toast__title">${escapeHtml(title)}</p>` : ""}
        ${message ? `<p class="toast__message">${escapeHtml(message)}</p>` : ""}
      </div>
      <button class="toast__close" aria-label="Yopish">&times;</button>
    </div>`);
  const remove = () => {
    t.classList.add("is-leaving");
    t.addEventListener("animationend", () => t.remove(), { once: true });
  };
  t.querySelector(".toast__close").addEventListener("click", remove);
  box.appendChild(t);
  if (duration > 0) setTimeout(remove, duration);
}

/* ------------------------------ Theme ------------------------------- */
const THEME_KEY = "bilimdon-theme";
export function toggleTheme() {
  const next =
    document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* ignore */
  }
}

/* --------------------------- Header / Footer ------------------------ */
const BRAND = `<a class="brand" href="/">
  <span class="brand__logo">
    <svg viewBox="0 0 48 48" width="34" height="34" aria-hidden="true">
      <defs><linearGradient id="bg-logo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2563eb"/><stop offset="1" stop-color="#38bdf8"/></linearGradient></defs>
      <rect width="48" height="48" rx="12" fill="url(#bg-logo)"/>
      <path d="M24 13 10 20l14 7 14-7-14-7Z" fill="#fff"/>
      <path d="M15 24v5c0 2 4 3.4 9 3.4s9-1.4 9-3.4v-5" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  </span>
  <span class="brand__name">Bilimdon</span>
</a>`;

function navLinks() {
  const u = getUser();
  const path = location.pathname;
  const links = [{ href: "/", label: "Bosh sahifa" }];
  if (u && u.role === "student") links.push({ href: "/dashboard.html", label: "Mening panelim" });
  if (u && (u.role === "admin" || u.role === "manager"))
    links.push({ href: "/admin/", label: "Boshqaruv" });
  return links
    .map((l) => {
      const active = path === l.href || (l.href !== "/" && path.startsWith(l.href));
      return `<a href="${l.href}" class="${active ? "is-active" : ""}">${l.label}</a>`;
    })
    .join("");
}

function authArea() {
  const u = getUser();
  if (!u) {
    return `<a class="btn btn--ghost btn--sm" href="/login.html">Kirish</a>
            <a class="btn btn--primary btn--sm" href="/register.html">Ro'yxatdan o'tish</a>`;
  }
  return `<div class="user-chip">
      <span class="avatar avatar--sm">${escapeHtml((u.name || "?").charAt(0).toUpperCase())}</span>
      <span class="user-chip__meta">
        <span class="user-chip__name">${escapeHtml(u.name)}</span>
        <span class="role-pill role-pill--${u.role}">${ROLE_LABELS[u.role] || u.role}</span>
      </span>
    </div>
    <button class="btn btn--ghost btn--sm" id="logoutBtn">Chiqish</button>`;
}

export function renderChrome() {
  const header = qs("#siteHeader");
  if (header) {
    header.className = "site-header";
    header.innerHTML = `
      <div class="nav container">
        ${BRAND}
        <button class="nav-toggle" id="navToggle" aria-label="Menyu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
        <div class="nav-menu" id="navMenu">
          <nav class="nav-links">${navLinks()}</nav>
          <div class="nav-actions">
            <button class="theme-toggle" id="themeToggle" aria-label="Mavzuni almashtirish">
              <svg class="t-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.2" y1="4.2" x2="5.6" y2="5.6"/><line x1="18.4" y1="18.4" x2="19.8" y2="19.8"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.2" y1="19.8" x2="5.6" y2="18.4"/><line x1="18.4" y1="5.6" x2="19.8" y2="4.2"/></svg>
              <svg class="t-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>
            </button>
            ${authArea()}
          </div>
        </div>
      </div>`;

    qs("#themeToggle", header)?.addEventListener("click", toggleTheme);
    qs("#logoutBtn", header)?.addEventListener("click", () => auth.logout());
    const toggle = qs("#navToggle", header);
    const menu = qs("#navMenu", header);
    toggle?.addEventListener("click", () => {
      const open = header.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    menu?.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => header.classList.remove("nav-open"))
    );
  }

  const footer = qs("#siteFooter");
  if (footer) {
    footer.className = "site-footer";
    footer.innerHTML = `
      <div class="container footer-inner">
        <p class="footer-brand">${icon("cap", 18)} Bilimdon — onlayn ta'lim platformasi</p>
        <p class="footer-copy">&copy; ${new Date().getFullYear()} Bilimdon. Barcha huquqlar himoyalangan.</p>
      </div>`;
  }

  hideLoader();
}

export function hideLoader() {
  const loader = qs("#loader");
  if (!loader) return;
  loader.classList.add("is-hidden");
  setTimeout(() => (loader.style.display = "none"), 400);
}

/** Convert a YouTube URL to an embeddable form (or return as-is). */
export function toEmbedUrl(url) {
  if (!url) return "";
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  return yt ? `https://www.youtube.com/embed/${yt[1]}` : url;
}
