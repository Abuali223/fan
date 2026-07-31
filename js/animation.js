/**
 * animation.js — Motion layer.
 *
 *   • Scroll-reveal via IntersectionObserver (with stagger support)
 *   • Animated statistics counters
 *   • Button ripple effect
 *   • Optional IntersectionObserver lazy-loading for img[data-src]
 *
 * Everything honours `prefers-reduced-motion`.
 */
(() => {
  "use strict";

  const $$ = window.NX?.$$ || ((s, c = document) => [...c.querySelectorAll(s)]);
  const reduceMotion = window.NX?.prefersReducedMotion || (() => false);
  const supportsIO = "IntersectionObserver" in window;

  /* ======================================================================
     Scroll reveal
     Elements with `.reveal` fade/slide in when they enter the viewport.
     Optional `data-delay="150"` (ms) staggers the animation.
     ====================================================================== */
  const initReveal = () => {
    const targets = $$(".reveal");
    if (!targets.length) return;

    // No IO or reduced motion → show everything immediately.
    if (!supportsIO || reduceMotion()) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = Number(el.dataset.delay || 0);
          if (delay) el.style.setProperty("--reveal-delay", `${delay}ms`);
          el.classList.add("is-visible");
          obs.unobserve(el); // reveal once, then stop watching
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    targets.forEach((el) => observer.observe(el));
  };

  /* ======================================================================
     Statistics counters
     <span class="stat__number" data-count="250" data-suffix="+">0</span>
     ====================================================================== */
  const animateCount = (el) => {
    const target = Number(el.dataset.count || 0);
    const suffix = el.dataset.suffix || "";
    const prefix = el.dataset.prefix || "";
    const duration = 1800;

    if (reduceMotion()) {
      el.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
      return;
    }

    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo for a lively finish.
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const value = Math.round(target * eased);
      el.textContent = `${prefix}${value.toLocaleString()}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const initCounters = () => {
    const counters = $$(".stat__number");
    if (!counters.length) return;

    if (!supportsIO) {
      counters.forEach(animateCount);
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => observer.observe(el));
  };

  /* ======================================================================
     Button ripple effect
     ====================================================================== */
  const initRipple = () => {
    if (reduceMotion()) return;

    document.addEventListener("click", (event) => {
      const button = event.target.closest(".btn");
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

      button.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), {
        once: true,
      });
    });
  };

  /* ======================================================================
     Lazy-loading upgrade (progressive enhancement)
     Native loading="lazy" handles most cases; this swaps any img[data-src]
     in as it approaches the viewport, for finer control where needed.
     ====================================================================== */
  const initLazyLoad = () => {
    const lazyImages = $$("img[data-src]");
    if (!lazyImages.length) return;

    const load = (img) => {
      img.src = img.dataset.src;
      if (img.dataset.srcset) img.srcset = img.dataset.srcset;
      img.removeAttribute("data-src");
      img.removeAttribute("data-srcset");
    };

    if (!supportsIO) {
      lazyImages.forEach(load);
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          load(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { rootMargin: "200px 0px" }
    );

    lazyImages.forEach((img) => observer.observe(img));
  };

  /* ---------------------------------------------------------------------- */
  initReveal();
  initCounters();
  initRipple();
  initLazyLoad();
})();
