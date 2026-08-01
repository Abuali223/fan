/**
 * auth.js — Session state + guards (client side).
 * The token lives in localStorage; the server always re-checks permissions.
 */
import { api, setToken, getToken } from "/js/api.js";

const USER_KEY = "bilimdon_user";

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

function setUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}

export function isLoggedIn() {
  return !!getToken();
}

export function hasRole(...roles) {
  const u = getUser();
  return !!u && roles.includes(u.role);
}

export const isStaff = () => hasRole("admin", "manager");

export async function login(email, password) {
  const { token, user } = await api.post("/api/auth/login", { email, password });
  setToken(token);
  setUser(user);
  return user;
}

export async function register(name, email, password) {
  const { token, user } = await api.post("/api/auth/register", { name, email, password });
  setToken(token);
  setUser(user);
  return user;
}

export function logout() {
  setToken(null);
  setUser(null);
  location.href = "/";
}

/** Re-validate the stored token and refresh the cached user. */
export async function refresh() {
  if (!getToken()) return null;
  try {
    const { user } = await api.get("/api/auth/me");
    setUser(user);
    return user;
  } catch {
    setToken(null);
    setUser(null);
    return null;
  }
}

/**
 * Page guard. Redirects to /login (or home) if the user lacks access.
 * @returns {boolean} true if allowed to stay on the page.
 */
export function guard(roles) {
  const u = getUser();
  if (!u) {
    const next = encodeURIComponent(location.pathname + location.search);
    location.href = `/login.html?next=${next}`;
    return false;
  }
  if (roles && roles.length && !roles.includes(u.role)) {
    location.href = "/";
    return false;
  }
  return true;
}

export const ROLE_LABELS = {
  admin: "Administrator",
  manager: "Boshqaruvchi",
  student: "O'quvchi",
};

export const auth = {
  getUser,
  isLoggedIn,
  hasRole,
  isStaff,
  login,
  register,
  logout,
  refresh,
  guard,
};
