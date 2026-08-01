/**
 * admin/lessons.js — Manage lessons, filtered by subject (staff).
 */
import { api } from "/js/api.js";
import { initAdmin, openModal, confirmAction, field, icon, escapeHtml, toast } from "/js/admin/common.js";

const { content } = initAdmin("lessons", { subtitle: "Darslarni fan bo'yicha boshqaring." });

let subjects = [];
let currentId = null;

const subjectOptions = () => subjects.map((s) => ({ value: s.id, label: s.title }));

async function init() {
  try {
    subjects = (await api.get("/api/subjects")).subjects;
  } catch (e) {
    content.innerHTML = `<div class="empty">${escapeHtml(e.message)}</div>`;
    return;
  }
  if (!subjects.length) {
    content.innerHTML = `<div class="empty">Avval kamida bitta fan qo'shing. <a href="/admin/subjects.html" style="color:var(--color-primary)">Fanlar →</a></div>`;
    return;
  }
  currentId = subjects[0].id;
  content.innerHTML = `
    <div class="toolbar">
      <div class="toolbar__filters">
        <label class="muted" for="subjectFilter">Fan:</label>
        <select class="select" id="subjectFilter" style="width:auto">
          ${subjects.map((s) => `<option value="${s.id}">${escapeHtml(s.title)}</option>`).join("")}
        </select>
      </div>
      <button class="btn btn--primary" id="addBtn">${icon("plus", 18)} Yangi dars</button>
    </div>
    <div id="lessonRows"><div class="spinner"></div></div>`;

  content.querySelector("#subjectFilter").addEventListener("change", (e) => {
    currentId = Number(e.target.value);
    loadLessons();
  });
  content.querySelector("#addBtn").addEventListener("click", () => openForm());
  loadLessons();
}

async function loadLessons() {
  const box = content.querySelector("#lessonRows");
  box.innerHTML = `<div class="spinner"></div>`;
  try {
    const { lessons } = await api.get(`/api/subjects/${currentId}/lessons`);
    box.innerHTML = lessons.length
      ? `<div class="table-wrap"><table class="table">
          <thead><tr><th>#</th><th>Dars</th><th>Savollar</th><th></th></tr></thead>
          <tbody>${lessons
            .map(
              (l, i) => `<tr>
                <td class="muted">${i + 1}</td>
                <td><strong>${escapeHtml(l.title)}</strong><br /><span class="muted" style="font-size:.82rem">${escapeHtml(l.summary || "")}</span></td>
                <td>${l.question_count}</td>
                <td><div class="actions">
                  <a class="icon-btn" href="/admin/quizzes.html?lesson=${l.id}" aria-label="Testlar" title="Testlar">${icon("check", 16)}</a>
                  <button class="icon-btn" data-edit="${l.id}" aria-label="Tahrirlash">${icon("edit", 16)}</button>
                  <button class="icon-btn icon-btn--danger" data-del="${l.id}" aria-label="O'chirish">${icon("trash", 16)}</button>
                </div></td>
              </tr>`
            )
            .join("")}</tbody></table></div>`
      : `<div class="empty">Bu fanda dars yo'q. Yangi dars qo'shing.</div>`;

    box.querySelectorAll("[data-edit]").forEach((b) =>
      b.addEventListener("click", async () => {
        const lesson = (await api.get(`/api/lessons/${b.dataset.edit}`)).lesson;
        openForm(lesson);
      })
    );
    box.querySelectorAll("[data-del]").forEach((b) =>
      b.addEventListener("click", () => remove(b.dataset.del))
    );
  } catch (e) {
    box.innerHTML = `<div class="empty">${escapeHtml(e.message)}</div>`;
  }
}

function openForm(lesson) {
  openModal({
    title: lesson ? "Darsni tahrirlash" : "Yangi dars",
    body:
      field.select("subject_id", "Fan", subjectOptions(), lesson?.subject_id ?? currentId) +
      field.text("title", "Dars nomi", lesson?.title || "") +
      field.text("summary", "Qisqa tavsif", lesson?.summary || "", { required: false }) +
      field.textarea("content", "Matn (HTML mumkin)", lesson?.content || "") +
      field.text("video_url", "Video havolasi (YouTube, ixtiyoriy)", lesson?.video_url || "", { required: false }) +
      field.number("position", "Tartib", lesson?.position ?? 0),
    onSubmit: async (data, close) => {
      if (lesson) await api.put(`/api/lessons/${lesson.id}`, data);
      else await api.post("/api/lessons", data);
      toast({ type: "success", message: lesson ? "Dars yangilandi." : "Dars qo'shildi." });
      close();
      loadLessons();
    },
  });
}

function remove(id) {
  confirmAction("Bu dars va uning barcha test savollari o'chiriladi. Davom etasizmi?", async () => {
    await api.del(`/api/lessons/${id}`);
    toast({ type: "success", message: "Dars o'chirildi." });
    loadLessons();
  });
}

init();
