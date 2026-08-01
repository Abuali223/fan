/**
 * admin/users.js — User & role management (admin only).
 */
import { api } from "/js/api.js";
import { ROLE_LABELS, getUser } from "/js/auth.js";
import { initAdmin, openModal, confirmAction, field, icon, escapeHtml, toast } from "/js/admin/common.js";

const { content, isAdmin } = initAdmin("users", { subtitle: "Foydalanuvchilar va rollarni boshqaring." });
const me = getUser();

const ROLE_OPTS = [
  { value: "student", label: ROLE_LABELS.student },
  { value: "manager", label: ROLE_LABELS.manager },
  { value: "admin", label: ROLE_LABELS.admin },
];

if (!isAdmin) {
  content.innerHTML = `<div class="empty">Bu bo'lim faqat administrator uchun.</div>`;
} else {
  load();
}

async function load() {
  content.innerHTML = `<div class="spinner"></div>`;
  try {
    const { users } = await api.get("/api/users");
    content.innerHTML = `
      <div class="toolbar">
        <span class="muted">${users.length} ta foydalanuvchi</span>
        <button class="btn btn--primary" id="addBtn">${icon("plus", 18)} Yangi foydalanuvchi</button>
      </div>
      <div class="table-wrap"><table class="table">
        <thead><tr><th>Ism</th><th>Email</th><th>Rol</th><th>Darslar</th><th></th></tr></thead>
        <tbody>${users
          .map((u) => {
            const self = u.id === me.id;
            return `<tr>
              <td><span style="display:inline-flex;align-items:center;gap:.5rem">
                <span class="avatar avatar--sm">${escapeHtml((u.name || "?").charAt(0).toUpperCase())}</span>
                <strong>${escapeHtml(u.name)}</strong>${self ? ' <span class="muted">(siz)</span>' : ""}</span></td>
              <td class="muted">${escapeHtml(u.email)}</td>
              <td>
                <select class="select" data-role="${u.id}" style="width:auto;padding:.35rem .6rem" ${self ? "disabled" : ""}>
                  ${ROLE_OPTS.map((r) => `<option value="${r.value}" ${r.value === u.role ? "selected" : ""}>${r.label}</option>`).join("")}
                </select>
              </td>
              <td>${u.completed}</td>
              <td><div class="actions">
                <button class="icon-btn icon-btn--danger" data-del="${u.id}" ${self ? "disabled" : ""} aria-label="O'chirish">${icon("trash", 16)}</button>
              </div></td>
            </tr>`;
          })
          .join("")}</tbody></table></div>`;

    content.querySelector("#addBtn").addEventListener("click", openAddForm);
    content.querySelectorAll("[data-role]").forEach((sel) =>
      sel.addEventListener("change", () => changeRole(sel.dataset.role, sel.value))
    );
    content.querySelectorAll("[data-del]").forEach((b) =>
      !b.disabled && b.addEventListener("click", () => remove(b.dataset.del))
    );
  } catch (e) {
    content.innerHTML = `<div class="empty">${escapeHtml(e.message)}</div>`;
  }
}

async function changeRole(id, role) {
  try {
    await api.put(`/api/users/${id}/role`, { role });
    toast({ type: "success", message: "Rol yangilandi." });
  } catch (e) {
    toast({ type: "error", message: e.message });
    load(); // revert UI
  }
}

function openAddForm() {
  openModal({
    title: "Yangi foydalanuvchi",
    body:
      field.text("name", "Ism", "") +
      field.text("email", "Email", "", { placeholder: "siz@email.com" }) +
      field.text("password", "Parol", "", { placeholder: "Kamida 6 ta belgi" }) +
      field.select("role", "Rol", ROLE_OPTS, "student"),
    submitLabel: "Qo'shish",
    onSubmit: async (data, close) => {
      await api.post("/api/users", data);
      toast({ type: "success", message: "Foydalanuvchi qo'shildi." });
      close();
      load();
    },
  });
}

function remove(id) {
  confirmAction("Bu foydalanuvchi o'chiriladi. Davom etasizmi?", async () => {
    await api.del(`/api/users/${id}`);
    toast({ type: "success", message: "Foydalanuvchi o'chirildi." });
    load();
  });
}
