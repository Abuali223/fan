/**
 * navbar.js — Navigation behaviour.
 *
 *   • Sticky header that gains a solid/blurred background after scrolling
 *   • Accessible mobile menu (toggle, backdrop, Escape, outside click)
 *   • Active-link highlighting (current page + in-page scroll spy)
 */
(() => {
  "use strict";

  const $ = window.NX?.$ || ((s, c = document) => c.querySelector(s));
  const $$ = window.NX?.$$ || ((s, c = document) => [...c.querySelectorAll(s)]);
  const rafThrottle =
    window.NX?.rafThrottle ||
    ((cb) => {
      let t = false;
      return (...a) => {
        if (t) return;
        t = true;
        requestAnimationFrame(() => {
          cb(...a);
          t = false;
        });
      };
    });

  const header = $("#header");
  const toggle = $("#navToggle");
  const menu = $("#navMenu");
  const backdrop = $("#navBackdrop");
  if (!header) return;

  /* ----------------------------------------------------------------------
     Sticky header state
     ---------------------------------------------------------------------- */
  const updateHeaderState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  };
  updateHeaderState();
  window.addEventListener("scroll", rafThrottle(updateHeaderState), {
    passive: true,
  });

  /* ----------------------------------------------------------------------
     Mobile menu
     ---------------------------------------------------------------------- */
  const openMenu = () => {
    menu?.classList.add("is-open");
    backdrop?.classList.add("is-visible");
    toggle?.setAttribute("aria-expanded", "true");
    toggle?.setAttribute("aria-label", "Close menu");
    document.body.classList.add("no-scroll");
  };

  const closeMenu = () => {
    menu?.classList.remove("is-open");
    backdrop?.classList.remove("is-visible");
    toggle?.setAttribute("aria-expanded", "false");
    toggle?.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("no-scroll");
  };

  const toggleMenu = () => {
    const isOpen = toggle?.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  };

  if (toggle && menu) {
    toggle.addEventListener("click", toggleMenu);
    backdrop?.addEventListener("click", closeMenu);

    // Close when a navigation link is clicked.
    $$(".nav__link", menu).forEach((link) =>
      link.addEventListener("click", closeMenu)
    );

    // Close on Escape.
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    // Reset menu state when resizing up to desktop.
    window.addEventListener(
      "resize",
      rafThrottle(() => {
        if (window.innerWidth > 768) closeMenu();
      })
    );
  }

  /* ----------------------------------------------------------------------
     Active-link highlighting
     Marks the link matching the current file, and — on pages that have
     in-page sections — updates the active link as the user scrolls.
     ---------------------------------------------------------------------- */
  const links = $$(".nav__link");
  const currentFile =
    window.location.pathname.split("/").pop() || "index.html";

  // 1) Highlight by current page file name.
  links.forEach((link) => {
    const href = link.getAttribute("href") || "";
    const file = href.split("#")[0];
    if (file === currentFile || (currentFile === "index.html" && file === "")) {
      // Only mark as active if it's not an in-page anchor of another section.
      if (!href.includes("#")) link.classList.add("is-active");
    }
  });

  // 2) Scroll spy for same-page section links (href="index.html#section").
  const sectionLinks = links.filter((link) =>
    (link.getAttribute("href") || "").includes("#")
  );
  const sections = sectionLinks
    .map((link) => {
      const id = (link.getAttribute("href") || "").split("#")[1];
      return id ? document.getElementById(id) : null;
    })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          sectionLinks.forEach((link) =>
            link.classList.toggle(
              "is-active",
              (link.getAttribute("href") || "").endsWith(`#${id}`)
            )
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((section) => spy.observe(section));
  }
})();
