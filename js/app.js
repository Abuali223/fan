/**
 * app.js — Core UI orchestrator for Nexora.
 *
 * Responsibilities:
 *   • Global namespace + Toast notification system (shared with other modules)
 *   • Loading screen
 *   • Scroll progress bar
 *   • Back-to-top button
 *   • FAQ accordion
 *   • Testimonials slider
 *   • Footer year
 *
 * All scripts are loaded with `defer`, so the DOM is ready on execution.
 * Every feature is guarded by element presence, so the same bundle can run
 * on any page without errors.
 */
(() => {
  "use strict";

  /* Shared namespace — other modules attach to / read from this. */
  const NX = (window.NX = window.NX || {});

  /* ======================================================================
     Small helpers
     ====================================================================== */
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  /** Run a callback at most once per animation frame. */
  const rafThrottle = (callback) => {
    let ticking = false;
    return (...args) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        callback(...args);
        ticking = false;
      });
    };
  };

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Expose helpers for other modules. */
  NX.$ = $;
  NX.$$ = $$;
  NX.rafThrottle = rafThrottle;
  NX.prefersReducedMotion = prefersReducedMotion;

  /* ======================================================================
     Toast notifications
     Usage: NX.toast({ type: "success", title: "Done", message: "…" })
     ====================================================================== */
  const TOAST_ICONS = {
    success:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  };

  const getToastContainer = () => {
    let container = $("#toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container";
      container.setAttribute("aria-live", "polite");
      container.setAttribute("aria-atomic", "false");
      document.body.appendChild(container);
    }
    return container;
  };

  NX.toast = ({ type = "info", title = "", message = "", duration = 4500 } = {}) => {
    const container = getToastContainer();
    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");

    toast.innerHTML = `
      <span class="toast__icon">${TOAST_ICONS[type] || TOAST_ICONS.info}</span>
      <div class="toast__body">
        ${title ? `<p class="toast__title">${title}</p>` : ""}
        ${message ? `<p class="toast__message">${message}</p>` : ""}
      </div>
      <button class="toast__close" type="button" aria-label="Dismiss notification">&times;</button>`;

    const remove = () => {
      toast.classList.add("is-leaving");
      toast.addEventListener("animationend", () => toast.remove(), { once: true });
    };

    toast.querySelector(".toast__close").addEventListener("click", remove);
    container.appendChild(toast);

    if (duration > 0) window.setTimeout(remove, duration);
    return toast;
  };

  /* ======================================================================
     Loading screen — hide once the page (and assets) have loaded
     ====================================================================== */
  const initLoader = () => {
    const loader = $("#loader");
    if (!loader) return;

    const hide = () => {
      loader.classList.add("is-hidden");
      loader.setAttribute("aria-hidden", "true");
      // Remove from the a11y tree + layout after the fade-out completes.
      window.setTimeout(() => {
        loader.style.display = "none";
      }, 700);
    };

    if (document.readyState === "complete") {
      hide();
    } else {
      window.addEventListener("load", hide, { once: true });
      // Safety net in case the `load` event is delayed by a slow asset.
      window.setTimeout(hide, 4000);
    }
  };

  /* ======================================================================
     Scroll progress bar
     ====================================================================== */
  const initScrollProgress = () => {
    const bar = $("#progressBar");
    if (!bar) return;

    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = `${progress}%`;
    };

    update();
    window.addEventListener("scroll", rafThrottle(update), { passive: true });
    window.addEventListener("resize", rafThrottle(update));
  };

  /* ======================================================================
     Back-to-top button
     ====================================================================== */
  const initBackToTop = () => {
    const button = $("#backToTop");
    if (!button) return;

    const toggle = () => {
      button.classList.toggle("is-visible", window.scrollY > 500);
    };

    toggle();
    window.addEventListener("scroll", rafThrottle(toggle), { passive: true });

    button.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    });
  };

  /* ======================================================================
     FAQ accordion (single-open, fully keyboard accessible)
     ====================================================================== */
  const initFaq = () => {
    const items = $$(".faq-item");
    if (!items.length) return;

    items.forEach((item) => {
      const button = $(".faq-item__question", item);
      const answer = $(".faq-item__answer", item);
      if (!button || !answer) return;

      button.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");

        // Close every item first (accordion behaviour).
        items.forEach((other) => {
          other.classList.remove("is-open");
          $(".faq-item__question", other)?.setAttribute("aria-expanded", "false");
        });

        // Then open the clicked one if it was previously closed.
        if (!isOpen) {
          item.classList.add("is-open");
          button.setAttribute("aria-expanded", "true");
        }
      });
    });
  };

  /* ======================================================================
     Testimonials slider
     ====================================================================== */
  const initTestimonials = () => {
    const root = $("#testimonials");
    if (!root) return;

    const track = $(".testimonials__track", root);
    const slides = $$(".testimonial", root);
    const dotsWrap = $(".slider-dots", root);
    const prevBtn = $('[data-dir="prev"]', root);
    const nextBtn = $('[data-dir="next"]', root);
    if (!track || slides.length === 0) return;

    let index = 0;
    let timer = null;
    const AUTOPLAY_MS = 6000;

    // Build the pagination dots.
    const dots = slides.map((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "slider-dot";
      dot.setAttribute("aria-label", `Go to testimonial ${i + 1}`);
      dot.addEventListener("click", () => {
        goTo(i);
        restartAutoplay();
      });
      dotsWrap?.appendChild(dot);
      return dot;
    });

    const goTo = (next) => {
      index = (next + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot, i) => {
        const active = i === index;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-current", active ? "true" : "false");
      });
      slides.forEach((slide, i) =>
        slide.setAttribute("aria-hidden", i === index ? "false" : "true")
      );
    };

    const startAutoplay = () => {
      if (prefersReducedMotion() || slides.length < 2) return;
      timer = window.setInterval(() => goTo(index + 1), AUTOPLAY_MS);
    };
    const stopAutoplay = () => timer && window.clearInterval(timer);
    const restartAutoplay = () => {
      stopAutoplay();
      startAutoplay();
    };

    prevBtn?.addEventListener("click", () => {
      goTo(index - 1);
      restartAutoplay();
    });
    nextBtn?.addEventListener("click", () => {
      goTo(index + 1);
      restartAutoplay();
    });

    // Pause on hover / focus for accessibility.
    root.addEventListener("mouseenter", stopAutoplay);
    root.addEventListener("mouseleave", startAutoplay);
    root.addEventListener("focusin", stopAutoplay);
    root.addEventListener("focusout", startAutoplay);

    // Pause when the tab is not visible.
    document.addEventListener("visibilitychange", () =>
      document.hidden ? stopAutoplay() : startAutoplay()
    );

    // Keyboard navigation.
    root.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        goTo(index - 1);
        restartAutoplay();
      } else if (event.key === "ArrowRight") {
        goTo(index + 1);
        restartAutoplay();
      }
    });

    // Touch swipe.
    let startX = 0;
    root.addEventListener(
      "touchstart",
      (event) => (startX = event.touches[0].clientX),
      { passive: true }
    );
    root.addEventListener(
      "touchend",
      (event) => {
        const delta = event.changedTouches[0].clientX - startX;
        if (Math.abs(delta) > 50) {
          goTo(delta < 0 ? index + 1 : index - 1);
          restartAutoplay();
        }
      },
      { passive: true }
    );

    goTo(0);
    startAutoplay();
  };

  /* ======================================================================
     Footer year
     ====================================================================== */
  const initYear = () => {
    const el = $("#year");
    if (el) el.textContent = new Date().getFullYear();
  };

  /* ======================================================================
     Init all
     ====================================================================== */
  initLoader();
  initScrollProgress();
  initBackToTop();
  initFaq();
  initTestimonials();
  initYear();
})();
