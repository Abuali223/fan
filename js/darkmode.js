/**
 * darkmode.js — Dark / light theme switching.
 *
 * The initial theme is applied by a tiny inline script in <head> (to avoid a
 * flash of the wrong theme). This module wires up the toggle button, persists
 * the user's choice in localStorage, and follows the OS preference until the
 * user makes an explicit choice.
 */
(() => {
  "use strict";

  const STORAGE_KEY = "nx-theme";
  const root = document.documentElement;
  const toggle = document.getElementById("themeToggle");

  const media = window.matchMedia("(prefers-color-scheme: dark)");

  /** Read the persisted choice, if any (null = follow the system). */
  const getStored = () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  };

  const store = (theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* Storage may be unavailable (private mode) — fail silently. */
    }
  };

  const currentTheme = () =>
    root.getAttribute("data-theme") ||
    (media.matches ? "dark" : "light");

  /** Apply a theme and keep the toggle button's ARIA state in sync. */
  const applyTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    if (toggle) {
      toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      toggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    }
  };

  // Sync UI with whatever the inline script already set.
  applyTheme(currentTheme());

  /* Toggle on click and persist the explicit choice. */
  toggle?.addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
    store(next);
  });

  /* Follow the OS preference only while the user has not chosen explicitly. */
  const onSystemChange = (event) => {
    if (!getStored()) applyTheme(event.matches ? "dark" : "light");
  };
  // addEventListener is the modern API; some Safari versions need addListener.
  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", onSystemChange);
  } else if (typeof media.addListener === "function") {
    media.addListener(onSystemChange);
  }
})();
