#!/usr/bin/env node
/**
 * clean-dev.mjs — runs automatically before `npm run dev` (via the `predev`
 * hook) to prevent Turbopack persistent-cache corruption.
 *
 * The "Compaction failed: Another write batch or compaction is already active"
 * errors happen when a stale `next dev` process is still holding a lock on
 * `.next/dev` while a new one starts. This script:
 *
 *   1. Kills any process listening on the dev port (3100).
 *   2. Kills lingering `next-server` / `next dev` processes for THIS project.
 *
 * Pass `--wipe` (used by `npm run dev:fresh`) to also delete the `.next`
 * cache for a guaranteed-clean start.
 */

import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const PORT = 3100;
const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const wipe = process.argv.includes("--wipe");

function sh(cmd) {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "";
  }
}

// 1. Kill whatever is on the dev port.
const portPids = sh(`lsof -ti:${PORT}`).split("\n").filter(Boolean);
for (const pid of portPids) {
  sh(`kill -9 ${pid}`);
  console.log(`[clean-dev] killed process on :${PORT} (pid ${pid})`);
}

// 2. Kill lingering next dev / next-server processes started from THIS project.
//    Match on the project path so we never touch other Next apps.
const escapedRoot = projectRoot.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const stalePids = sh(
  `pgrep -f "next(-server| dev).*${escapedRoot}"`
)
  .split("\n")
  .filter(Boolean)
  .filter((pid) => Number(pid) !== process.pid);

for (const pid of stalePids) {
  sh(`kill -9 ${pid}`);
  console.log(`[clean-dev] killed stale Next process (pid ${pid})`);
}

// 3. Optionally wipe the cache.
if (wipe) {
  try {
    rmSync(join(projectRoot, ".next"), { recursive: true, force: true });
    console.log("[clean-dev] wiped .next cache");
  } catch (err) {
    console.warn("[clean-dev] could not wipe .next:", err.message);
  }
}
