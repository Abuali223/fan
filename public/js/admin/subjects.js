/**
 * admin/subjects.js — Manage subjects (staff).
 */
import { api } from "/js/api.js";
import { initAdmin, openModal, confirmAction, field, icon, escapeHtml, toast } from "/js/admin/common.js";

const { content } = initAdmin("subjects", { subtitle: "Fanlarni qo'shish, tahrirlash va o'chirish." });

const ICON_OPTS = [
  { value: "book", label: "Kitob" },
  { value: "code", label: "Kod" },
  { value: "flask", label: "Kolba" },
  { value: "sigma", label: "Sigma" },
  { value: "cap", label: "Qalpoq" },
];

async function load() {
  content.innerHTML = `<div class="spinner"></div>`;
  try {
    const { subjects } = await api.get("/api/subjects");
    content.innerHTML = `
      <div class="toolbar">
        <span class="muted">${subjects.length} ta fan</span>
        <button class="btn btn--primary" id="addBtn">${icon("plus", 18)} Yangi fan</button>
      </div>
      ${
        subjects.length
          ? `<div class="table-wrap"><table class="table">
              <thead><tr><th>Fan</th><th>Slug</th><th>Darslar</th><th></th></tr></thead>
              <tbody>${subjects
                .map(
                  (s) => `<tr>
                    <td><span style="display:inline-flex;align-items:center;gap:.5rem">
                      <span style="width:12px;height:12px;border-radius:4px;background:${escapeHtml(s.color)}"></span>
                      <strong>${escapeHtml(s.title)}</strong></span></td>
                    <td class="muted">${escapeHtml(s.slug)}</td>
                    <td>${s.lesson_count}</td>
                    <td><div class="actions">
                      <button class="icon-btn" data-edit="${s.id}" aria-label="Tahrirlash">${icon("edit", 16)}</button>
                      <button class="icon-btn icon-btn--danger" data-del="${s.id}" aria-label="O'chirish">${icon("trash", 16)}</button>
                    </div></td>
                  </tr>`
                )
                .join("")}</tbody></table></div>`
          : `<div class="empty">Hozircha fan yo'q. Yangi fan qo'shing.</div>`
      }`;

    content.querySelector("#addBtn").addEventListener("click", () => openForm());
    content.querySelectorAll("[data-edit]").forEach((b) =>
      b.addEventListener("click", () => openForm(subjects.find((s) => s.id == b.dataset.edit)))
    );
    content.querySelectorAll("[data-del]").forEach((b) =>
      b.addEventListener("click", () => remove(subjects.find((s) => s.id == b.dataset.del)))
    );
  } catch (e) {
    content.innerHTML = `<div class="empty">${escapeHtml(e.message)}</div>`;
  }
}

function openForm(subject) {
  openModal({
    title: subject ? "Fanni tahrirlash" : "Yangi fan",
    body:
      field.text("title", "Fan nomi", subject?.title || "") +
      field.textarea("description", "Tavsif", subject?.description || "") +
      field.select("icon", "Ikona", ICON_OPTS, subject?.icon || "book") +
      field.text("color", "Rang (hex)", subject?.color || "#2563eb", { placeholder: "#2563eb" }) +
      field.number("position", "Tartib", subject?.position ?? 0),
    onSubmit: async (data, close) => {
      if (subject) await api.put(`/api/subjects/${subject.id}`, data);
      else await api.post("/api/subjects", data);
      toast({ type: "success", message: subject ? "Fan yangilandi." : "Fan qo'shildi." });
      close();
      load();
    },
  });
}

function remove(subject) {
  confirmAction(
    `"${subject.title}" fani o'chiriladi. Uning barcha darslari va testlari ham o'chadi. Davom etasizmi?`,
    async () => {
      await api.del(`/api/subjects/${subject.id}`);
      toast({ type: "success", message: "Fan o'chirildi." });
      load();
    }
  );
}

load();
