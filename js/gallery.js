/**
 * gallery.js — Portfolio gallery filtering + accessible lightbox.
 *
 *   • Category filtering with a smooth reveal animation
 *   • Lightbox with keyboard (Esc / ← / →), swipe, backdrop click,
 *     focus trapping and focus restoration
 */
(() => {
  "use strict";

  const $ = window.NX?.$ || ((s, c = document) => c.querySelector(s));
  const $$ = window.NX?.$$ || ((s, c = document) => [...c.querySelectorAll(s)]);
  const reduceMotion = window.NX?.prefersReducedMotion || (() => false);

  const grid = $("#galleryGrid");
  if (!grid) return;

  const items = $$(".gallery__item", grid);

  /* ======================================================================
     Filtering
     ====================================================================== */
  const filterButtons = $$(".filter-btn");

  const applyFilter = (filter) => {
    items.forEach((item) => {
      const matches = filter === "all" || item.dataset.category === filter;
      item.classList.toggle("is-hidden", !matches);

      // Subtle entrance animation for the items that stay visible.
      if (matches && !reduceMotion()) {
        item.animate(
          [
            { opacity: 0, transform: "translateY(16px) scale(0.98)" },
            { opacity: 1, transform: "translateY(0) scale(1)" },
          ],
          { duration: 400, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
        );
      }
    });
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      button.classList.add("is-active");
      button.setAttribute("aria-selected", "true");
      applyFilter(button.dataset.filter || "all");
    });
  });

  /* ======================================================================
     Lightbox
     ====================================================================== */
  const lightbox = $("#lightbox");
  const lightboxImg = $("#lightboxImg");
  const lightboxCaption = $("#lightboxCaption");
  const closeBtn = $("#lightboxClose");
  const prevBtn = $("#lightboxPrev");
  const nextBtn = $("#lightboxNext");

  // Only wire the lightbox if all of its parts exist.
  if (!lightbox || !lightboxImg) return;

  // Build the slide data from the DOM (keeps HTML the single source of truth).
  const slides = items.map((item) => {
    const img = $(".gallery__img", item);
    return {
      src: img?.currentSrc || img?.src || "",
      alt: img?.getAttribute("alt") || "",
      title: $(".gallery__title", item)?.textContent?.trim() || "",
      category: $(".gallery__category", item)?.textContent?.trim() || "",
    };
  });

  let currentIndex = 0;
  let lastFocused = null;

  const render = () => {
    const slide = slides[currentIndex];
    if (!slide) return;
    lightboxImg.src = slide.src;
    lightboxImg.alt = slide.alt;
    if (lightboxCaption) {
      lightboxCaption.textContent = slide.category
        ? `${slide.title} — ${slide.category}`
        : slide.title;
    }
  };

  const open = (index) => {
    currentIndex = index;
    lastFocused = document.activeElement;
    render();
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    closeBtn?.focus();
  };

  const close = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    if (lastFocused instanceof HTMLElement) lastFocused.focus();
  };

  const show = (step) => {
    currentIndex = (currentIndex + step + slides.length) % slides.length;
    render();
  };

  // Open triggers: click anywhere on the item, or its explicit zoom button.
  items.forEach((item, index) => {
    const zoom = $(".gallery__zoom", item);
    item.addEventListener("click", () => open(index));
    zoom?.addEventListener("click", (event) => {
      event.stopPropagation();
      open(index);
    });
  });

  closeBtn?.addEventListener("click", close);
  prevBtn?.addEventListener("click", () => show(-1));
  nextBtn?.addEventListener("click", () => show(1));

  // Click on the dark backdrop (but not the image) closes the lightbox.
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) close();
  });

  // Keyboard: Esc closes, arrows navigate, Tab is trapped inside.
  lightbox.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "Escape":
        close();
        break;
      case "ArrowLeft":
        show(-1);
        break;
      case "ArrowRight":
        show(1);
        break;
      case "Tab": {
        const focusables = [prevBtn, nextBtn, closeBtn].filter(Boolean);
        if (!focusables.length) break;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
        break;
      }
    }
  });

  // Touch swipe within the lightbox.
  let touchStartX = 0;
  lightbox.addEventListener(
    "touchstart",
    (event) => (touchStartX = event.touches[0].clientX),
    { passive: true }
  );
  lightbox.addEventListener(
    "touchend",
    (event) => {
      const delta = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 50) show(delta < 0 ? 1 : -1);
    },
    { passive: true }
  );
})();
