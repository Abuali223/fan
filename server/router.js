/**
 * router.js — A tiny pattern-matching router (no dependencies).
 *
 * Supports path params (":id") and a chain of handlers per route:
 *   router.get("/api/lessons/:id", requireAuth, handler)
 *
 * Handlers receive (ctx, res). Guards (auth/role) throw on failure; the final
 * handler returns the data to send as JSON. A handler may also write to `res`
 * directly (e.g. to stream a file), in which case routing stops.
 */
export class Router {
  constructor() {
    this.routes = [];
  }

  add(method, pattern, ...handlers) {
    const keys = [];
    const source = pattern
      .replace(/\/+$/, "") // drop trailing slash
      .split("/")
      .map((seg) => {
        if (seg.startsWith(":")) {
          keys.push(seg.slice(1));
          return "([^/]+)"; // named param
        }
        return seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // escape literals
      })
      .join("/");
    const regex = new RegExp(`^${source || "/"}/?$`);
    this.routes.push({ method, regex, keys, handlers });
    return this;
  }

  get(p, ...h) { return this.add("GET", p, ...h); }
  post(p, ...h) { return this.add("POST", p, ...h); }
  put(p, ...h) { return this.add("PUT", p, ...h); }
  patch(p, ...h) { return this.add("PATCH", p, ...h); }
  delete(p, ...h) { return this.add("DELETE", p, ...h); }

  /** Find a matching route; returns { handlers, params } or null. */
  find(method, pathname) {
    for (const route of this.routes) {
      if (route.method !== method) continue;
      const m = route.regex.exec(pathname);
      if (!m) continue;
      const params = {};
      route.keys.forEach((key, i) => (params[key] = decodeURIComponent(m[i + 1])));
      return { handlers: route.handlers, params };
    }
    return null;
  }
}
