/**
 * config.js — Application configuration.
 *
 * Loads values from a local `.env` file (if present) and the process
 * environment, with sensible defaults. No external dependency: the tiny
 * parser below understands `KEY=value` lines and `#` comments.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

/** Minimal .env loader (KEY=value per line). */
function loadEnv() {
  const envPath = join(rootDir, ".env");
  if (!existsSync(envPath)) return;
  for (const rawLine of readFileSync(envPath, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    // Strip surrounding quotes if present.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnv();

export const config = {
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || "0.0.0.0",
  // IMPORTANT: set a strong JWT_SECRET in production (see .env.example).
  jwtSecret: process.env.JWT_SECRET || "bilimdon-dev-secret-change-me",
  jwtExpiresIn: Number(process.env.JWT_EXPIRES_IN) || 60 * 60 * 24 * 7, // 7 days (seconds)
  dbPath: process.env.DB_PATH || join(rootDir, "server", "data", "bilimdon.db"),
  rootDir,
  publicDir: join(rootDir, "public"),
  isProd: process.env.NODE_ENV === "production",
};
