/**
 * admin/quizzes.js — Manage a lesson's quiz questions (staff).
 */
import { api } from "/js/api.js";
import { initAdmin, openModal, confirmAction, field, icon, escapeHtml, toast } from "/js/admin/common.js";

const { content } = initAdmin("quizzes", { subtitle: "Darslar uchun test savollarini boshqaring." });

let subjects = [];
let lessons = [];
let currentSubject = null;
let currentLesson = null;

async function init() {
  try {
    subjects = (await api.get("/api/subjects")).subjects;
  } catch (e) {
    content.innerHTML = `<div class="empty">${escapeHtml(e.message)}</div>`;
    return;
  }
  if (!subjects.length) {
    content.innerHTML = `<div class="empty">Avval fan va dars qo'shing.</div>`;
    return;
  }

  content.innerHTML = `
    <div class="toolbar">
      <div class="toolbar__filters">
        <select class="select" id="subjSel" style="width:auto">
          ${subjects.map((s) => `<option value="${s.id}">${escapeHtml(s.title)}</option>`).join("")}
        </select>
        <select class="select" id="lessonSel" style="width:auto"></select>
      </div>
      <button class="btn btn--primary" id="addBtn">${icon("plus", 18)} Yangi savol</button>
    </div>
    <div id="qBox"><div class="spinner"></div></div>`;

  const subjSel = content.querySelector("#subjSel");
  const lessonSel = content.querySelector("#lessonSel");

  subjSel.addEventListener("change", () => populateLessons(Number(subjSel.value)));
  lessonSel.addEventListener("change", () => {
    currentLesson = Number(lessonSel.value);
    loadQuestions();
  });
  content.querySelector("#addBtn").addEventListener("click", () => {
    if (!currentLesson) return toast({ type: "error", message: "Avval dars tanlang." });
    openForm();
  });

  // Optional preselect via ?lesson=ID
  const pre = Number(new URLSearchParams(location.search).get("lesson"));
  if (pre) {
    try {
      const l = (await api.get(`/api/lessons/${pre}`)).lesson;
      currentSubject = l.subject.id;
      subjSel.value = String(currentSubject);
      await populateLessons(currentSubject, pre);
      return;
    } catch {
      /* fall through */
    }
  }
  currentSubject = subjects[0].id;
  await populateLessons(currentSubject);
}

async function populateLessons(subjectId, preselectLesson) {
  currentSubject = subjectId;
  const lessonSel = content.querySelector("#lessonSel");
  lessons = (await api.get(`/api/subjects/${subjectId}/lessons`)).lessons;
  if (!lessons.length) {
    lessonSel.innerHTML = `<option value="">— dars yo'q —</option>`;
    currentLesson = null;
    content.querySelector("#qBox").innerHTML = `<div class="empty">Bu fanda dars yo'q. <a href="/admin/lessons.html" style="color:var(--color-primary)">Dars qo'shing →</a></div>`;
    return;
  }
  lessonSel.innerHTML = lessons.map((l) => `<option value="${l.id}">${escapeHtml(l.title)}</option>`).join("");
  currentLesson = preselectLesson || lessons[0].id;
  lessonSel.value = String(currentLesson);
  loadQuestions();
}

async function loadQuestions() {
  const box = content.querySelector("#qBox");
  box.innerHTML = `<div class="spinner"></div>`;
  try {
    const { questions } = await api.get(`/api/lessons/${currentLesson}/questions`);
    box.innerHTML = questions.length
      ? `<div class="stack">${questions
          .map(
            (q, i) => `
          <div class="question">
            <div style="display:flex;justify-content:space-between;gap:1rem">
              <p class="question__text">${i + 1}. ${escapeHtml(q.text)}</p>
              <div class="actions">
                <button class="icon-btn" data-edit="${q.id}" aria-label="Tahrirlash">${icon("edit", 16)}</button>
                <button class="icon-btn icon-btn--danger" data-del="${q.id}" aria-label="O'chirish">${icon("trash", 16)}</button>
              </div>
            </div>
            <div class="options">${q.options
              .map(
                (o, oi) => `<div class="option ${oi === q.correct_index ? "correct" : ""}" style="cursor:default">
                  <span style="font-weight:700;color:var(--color-muted)">${String.fromCharCode(65 + oi)}.</span> <span>${escapeHtml(o)}</span>
                  ${oi === q.correct_index ? `<span style="margin-left:auto;color:var(--color-success)">${icon("check", 16)}</span>` : ""}
                </div>`
              )
              .join("")}</div>
          </div>`
          )
          .join("")}</div>`
      : `<div class="empty">Bu darsda savol yo'q. Yangi savol qo'shing.</div>`;

    box.querySelectorAll("[data-edit]").forEach((b) =>
      b.addEventListener("click", () => openForm(questions.find((q) => q.id == b.dataset.edit)))
    );
    box.querySelectorAll("[data-del]").forEach((b) =>
      b.addEventListener("click", () => remove(b.dataset.del))
    );
  } catch (e) {
    box.innerHTML = `<div class="empty">${escapeHtml(e.message)}</div>`;
  }
}

function openForm(q) {
  const opts = q?.options || ["", "", "", ""];
  openModal({
    title: q ? "Savolni tahrirlash" : "Yangi savol",
    body:
      field.textarea("text", "Savol matni", q?.text || "", { required: true }) +
      field.text("opt0", "Variant A", opts[0] || "") +
      field.text("opt1", "Variant B", opts[1] || "") +
      field.text("opt2", "Variant C", opts[2] || "") +
      field.text("opt3", "Variant D", opts[3] || "") +
      field.select(
        "correct_index",
        "To'g'ri javob",
        [
          { value: 0, label: "A" },
          { value: 1, label: "B" },
          { value: 2, label: "C" },
          { value: 3, label: "D" },
        ],
        q?.correct_index ?? 0
      ),
    onSubmit: async (data, close) => {
      const options = [data.opt0, data.opt1, data.opt2, data.opt3].map((s) => (s || "").trim());
      if (options.some((o) => !o)) throw new Error("Barcha 4 ta variantni to'ldiring.");
      const body = { text: data.text, options, correct_index: Number(data.correct_index) };
      if (q) await api.put(`/api/questions/${q.id}`, body);
      else await api.post(`/api/lessons/${currentLesson}/questions`, body);
      toast({ type: "success", message: q ? "Savol yangilandi." : "Savol qo'shildi." });
      close();
      loadQuestions();
    },
  });
}

function remove(id) {
  confirmAction("Bu savol o'chiriladi. Davom etasizmi?", async () => {
    await api.del(`/api/questions/${id}`);
    toast({ type: "success", message: "Savol o'chirildi." });
    loadQuestions();
  });
}

init();
