/**
 * server.js — HTTP entry point.
 *
 * Serves the static frontend from /public and the JSON API under /api.
 * Zero external dependencies — only Node.js built-ins.
 */
import { createServer } from "node:http";
import { resolve, normalize, sep, extname } from "node:path";
import { config } from "./config.js";
import { Router } from "./router.js";
import { getUserFromRequest } from "./lib/auth.js";
import { readJsonBody, sendJson, sendError, sendFile, ApiError } from "./lib/http.js";
import { seedIfEmpty } from "./seed.js";

// Route modules.
import registerAuth from "./routes/auth.js";
import registerSubjects from "./routes/subjects.js";
import registerLessons from "./routes/lessons.js";
import registerQuizzes from "./routes/quizzes.js";
import registerProgress from "./routes/progress.js";
import registerUsers from "./routes/users.js";
import registerStats from "./routes/stats.js";

// Populate the database with starter content on first run.
seedIfEmpty();

// Build the API router.
const router = new Router();
for (const register of [
  registerAuth,
  registerSubjects,
  registerLessons,
  registerQuizzes,
  registerProgress,
  registerUsers,
  registerStats,
]) {
  register(router);
}

const BASE = resolve(config.publicDir);
const BODY_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** Map a URL path to a safe file path inside /public (or null if unsafe). */
function resolveStatic(pathname) {
  let rel = pathname;
  if (rel.endsWith("/")) rel += "index.html";
  const filePath = resolve(BASE, "." + normalize(rel));
  if (filePath !== BASE && !filePath.startsWith(BASE + sep)) return null;
  return filePath;
}

async function serveStatic(res, pathname) {
  const filePath = resolveStatic(pathname);
  if (!filePath) return sendJson(res, 400, { error: "Noto'g'ri yo'l." });

  try {
    await sendFile(res, filePath);
  } catch {
    // Try appending .html for extensionless routes (e.g. /login → login.html).
    if (!extname(filePath)) {
      try {
        return await sendFile(res, filePath + ".html");
      } catch {
        /* fall through to 404 */
      }
    }
    try {
      await sendFile(res, resolve(BASE, "404.html"), 404);
    } catch {
      sendJson(res, 404, { error: "Sahifa topilmadi." });
    }
  }
}

async function handleApi(req, res, url) {
  const match = router.find(req.method, url.pathname);
  if (!match) throw new ApiError(404, "API manzili topilmadi.");

  const ctx = {
    params: match.params,
    query: Object.fromEntries(url.searchParams),
    body: BODY_METHODS.has(req.method) ? await readJsonBody(req) : {},
    user: getUserFromRequest(req),
    status: 200,
  };

  let result;
  for (const handler of match.handlers) {
    result = await handler(ctx, res);
    if (res.writableEnded) return;
  }
  if (!res.writableEnded) sendJson(res, ctx.status, result ?? {});
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
    } else {
      await serveStatic(res, url.pathname);
    }
  } catch (err) {
    if (!res.writableEnded) sendError(res, err);
  }
});

server.listen(config.port, config.host, () => {
  console.log(`\n  Bilimdon ✦ ta'lim platformasi`);
  console.log(`  ➜  http://localhost:${config.port}`);
  console.log(`  ➜  Admin panel: http://localhost:${config.port}/admin/\n`);
});
