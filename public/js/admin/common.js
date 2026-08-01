/**
 * common.js — Shared admin shell: guard, tabs, and a modal helper.
 */
import { renderChrome, icon, escapeHtml, toast, el } from "/js/ui.js";
import { guard, getUser } from "/js/auth.js";

/** Render chrome, guard staff access, and paint the admin shell + tabs. */
export function initAdmin(activeKey, { title = "Boshqaruv paneli", subtitle = "" } = {}) {
  renderChrome();
  if (!guard(["admin", "manager"])) throw new Error("redirecting");

  const isAdmin = getUser().role === "admin";
  const tabs = [
    { key: "dashboard", href: "/admin/", label: "Umumiy" },
    { key: "subjects", href: "/admin/subjects.html", label: "Fanlar" },
    { key: "lessons", href: "/admin/lessons.html", label: "Darslar" },
    { key: "quizzes", href: "/admin/quizzes.html", label: "Testlar" },
  ];
  if (isAdmin) tabs.push({ key: "users", href: "/admin/users.html", label: "Foydalanuvchilar" });

  const app = document.getElementById("app");
  app.innerHTML = `
    <section class="section container">
      <div class="page-head">
        <span class="eyebrow">${icon("shield", 16)} ${getUser().role === "admin" ? "Administrator" : "Boshqaruvchi"}</span>
        <h1>${escapeHtml(title)}</h1>
        ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
      </div>
      <nav class="admin-tabs">
        ${tabs.map((t) => `<a href="${t.href}" class="${t.key === activeKey ? "is-active" : ""}">${t.label}</a>`).join("")}
      </nav>
      <div id="adminContent"><div class="spinner"></div></div>
    </section>`;

  return { content: document.getElementById("adminContent"), isAdmin };
}

/** Open a modal with a form. onSubmit receives (formData, close). */
export function openModal({ title, body, submitLabel = "Saqlash", danger = false, onSubmit }) {
  const overlay = el(`
    <div class="modal-overlay">
      <div class="modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
        <div class="modal__head">
          <h3>${escapeHtml(title)}</h3>
          <button class="icon-btn" type="button" data-close aria-label="Yopish">✕</button>
        </div>
        <form class="modal__body" id="modalForm">${body}</form>
        <div class="modal__foot">
          <button class="btn btn--ghost" type="button" data-close>Bekor qilish</button>
          <button class="btn ${danger ? "btn--danger" : "btn--primary"}" type="submit" form="modalForm">${escapeHtml(submitLabel)}</button>
        </div>
      </div>
    </div>`);

  document.body.appendChild(overlay);
  document.body.classList.add("no-scroll");
  requestAnimationFrame(() => overlay.classList.add("is-open"));

  const close = () => {
    overlay.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    setTimeout(() => overlay.remove(), 250);
  };
  overlay.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", close));
  overlay.addEventListener("click", (e) => e.target === overlay && close());
  document.addEventListener("keydown", function esc(e) {
    if (e.key === "Escape") { close(); document.removeEventListener("keydown", esc); }
  });

  const form = overlay.querySelector("#modalForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const btn = overlay.querySelector('[type="submit"]');
    btn.disabled = true;
    try {
      await onSubmit(data, close, form);
    } catch (err) {
      toast({ type: "error", message: err.message });
      btn.disabled = false;
    }
  });

  form.querySelector("input, textarea, select")?.focus();
  return { close, overlay, form };
}

/** Simple confirm dialog for destructive actions. */
export function confirmAction(message, onYes, yesLabel = "Ha, o'chirish") {
  openModal({
    title: "Tasdiqlang",
    body: `<p style="color:var(--color-muted)">${escapeHtml(message)}</p>`,
    submitLabel: yesLabel,
    danger: true,
    onSubmit: async (_data, close) => {
      await onYes();
      close();
    },
  });
}

/** Field helpers for modal forms. */
export const field = {
  text: (name, label, value = "", { required = true, placeholder = "" } = {}) => `
    <div class="field"><label>${escapeHtml(label)}${required ? ' <span class="req">*</span>' : ""}</label>
    <input class="input" name="${name}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" ${required ? "required" : ""} /></div>`,
  textarea: (name, label, value = "", { required = false } = {}) => `
    <div class="field"><label>${escapeHtml(label)}</label>
    <textarea class="textarea" name="${name}" ${required ? "required" : ""}>${escapeHtml(value)}</textarea></div>`,
  select: (name, label, options, value = "") => `
    <div class="field"><label>${escapeHtml(label)}</label>
    <select class="select" name="${name}">${options
      .map((o) => `<option value="${escapeHtml(o.value)}" ${String(o.value) === String(value) ? "selected" : ""}>${escapeHtml(o.label)}</option>`)
      .join("")}</select></div>`,
  number: (name, label, value = 0) => `
    <div class="field"><label>${escapeHtml(label)}</label>
    <input class="input" type="number" name="${name}" value="${escapeHtml(String(value))}" min="0" /></div>`,
};

export { icon, escapeHtml, toast };
