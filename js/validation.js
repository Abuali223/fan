/**
 * validation.js — Accessible form validation.
 *
 *   • Contact form: per-field rules, real-time feedback, submit handling
 *   • Draft autosave/restore via localStorage
 *   • Newsletter (footer) email validation
 *
 * There is no backend in this template, so submissions are validated and
 * acknowledged with a toast. Wire the fetch() call where indicated to go live.
 */
(() => {
  "use strict";

  const toast =
    window.NX?.toast ||
    (({ message }) => window.alert(message)); // graceful fallback

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* Per-field validation rules, keyed by the input's `name`. */
  const RULES = {
    name: {
      test: (v) => v.trim().length >= 2,
      message: "Iltimos, ismingizni kiriting (kamida 2 ta belgi).",
    },
    email: {
      test: (v) => EMAIL_RE.test(v.trim()),
      message: "Iltimos, to'g'ri email manzil kiriting.",
    },
    subject: {
      test: (v) => v.trim().length >= 3,
      message: "Iltimos, qisqa mavzu qo'shing.",
    },
    message: {
      test: (v) => v.trim().length >= 10,
      message: "Xabaringiz kamida 10 ta belgidan iborat bo'lishi kerak.",
    },
  };

  /**
   * Validate a single field and reflect the result in the UI.
   * @returns {boolean} whether the field is valid
   */
  const validateField = (field) => {
    const rule = RULES[field.name];
    if (!rule) return true;

    const group = field.closest(".form-group");
    const errorEl = group?.querySelector(".form-error");
    const value = field.value;

    let valid = true;
    let message = "";

    if (field.hasAttribute("required") && !value.trim()) {
      valid = false;
      message = "Bu maydon to'ldirilishi shart.";
    } else if (!rule.test(value)) {
      valid = false;
      message = rule.message;
    }

    group?.classList.toggle("is-invalid", !valid);
    group?.classList.toggle("is-valid", valid && value.trim() !== "");
    field.setAttribute("aria-invalid", valid ? "false" : "true");
    if (errorEl) errorEl.textContent = message;

    return valid;
  };

  /* ======================================================================
     Contact form
     ====================================================================== */
  const initContactForm = () => {
    const form = document.getElementById("contactForm");
    if (!form) return;

    const fields = [...form.elements].filter((el) => RULES[el.name]);
    const DRAFT_KEY = "nx-contact-draft";

    /* --- Draft autosave / restore ------------------------------------- */
    const saveDraft = () => {
      try {
        const draft = {};
        fields.forEach((f) => (draft[f.name] = f.value));
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch {
        /* ignore storage errors */
      }
    };

    const restoreDraft = () => {
      try {
        const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
        fields.forEach((f) => {
          if (draft[f.name]) f.value = draft[f.name];
        });
      } catch {
        /* ignore malformed drafts */
      }
    };

    const clearDraft = () => {
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
    };

    restoreDraft();

    /* --- Real-time feedback ------------------------------------------- */
    fields.forEach((field) => {
      // Validate on blur, then live-update once the user has interacted.
      field.addEventListener("blur", () => validateField(field));
      field.addEventListener("input", () => {
        if (field.closest(".form-group")?.classList.contains("is-invalid")) {
          validateField(field);
        }
        saveDraft();
      });
    });

    /* --- Submit -------------------------------------------------------- */
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const allValid = fields
        .map((field) => validateField(field))
        .every(Boolean);

      if (!allValid) {
        toast({
          type: "error",
          title: "Formani tekshiring",
          message: "Ba'zi maydonlarga e'tibor bering.",
        });
        form.querySelector(".is-invalid .form-control")?.focus();
        return;
      }

      // --- Simulated send. Replace with your API call: -----------------
      // await fetch("/api/contact", { method: "POST", body: new FormData(form) });
      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.label = submitBtn.textContent;
        submitBtn.textContent = "Yuborilmoqda…";
      }

      window.setTimeout(() => {
        toast({
          type: "success",
          title: "Xabar yuborildi!",
          message: "Murojaatingiz uchun rahmat — 24 soat ichida javob beramiz.",
        });
        form.reset();
        fields.forEach((f) =>
          f.closest(".form-group")?.classList.remove("is-valid", "is-invalid")
        );
        clearDraft();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.label || "Xabar yuborish";
        }
      }, 900);
    });
  };

  /* ======================================================================
     Newsletter form (footer)
     ====================================================================== */
  const initNewsletter = () => {
    const form = document.getElementById("newsletterForm");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const value = input?.value.trim() || "";

      if (!EMAIL_RE.test(value)) {
        toast({
          type: "error",
          title: "Noto'g'ri email",
          message: "Obuna bo'lish uchun to'g'ri email manzil kiriting.",
        });
        input?.focus();
        return;
      }

      toast({
        type: "success",
        title: "Obuna bo'ldingiz!",
        message: "Siz ro'yxatdasiz. Yangiliklar uchun pochtangizni kuzating.",
      });
      form.reset();
    });
  };

  initContactForm();
  initNewsletter();
})();
