// `npm run dev`: starts the Spring Boot backend (if it is not already running) and then Vite.
// Stopping Vite (Ctrl+C) also stops the backend it started.
// SKIP_BACKEND=1 npm run dev  -> frontend only (same as `npm run dev:frontend`).
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const frontendDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const backendDir = resolve(frontendDir, "../backend");
const HEALTH_URL = "http://localhost:8080/api/actuator/health";
const isWindows = process.platform === "win32";
const MAX_ATTEMPTS = 3;

// Lines worth showing from the (very chatty) backend log
const IMPORTANT =
  /Started LmsApplication|Tomcat started|Migrating schema|Successfully applied|ERROR|Caused by: com\.microsoft|not allowed to access|not currently available|Failed to authenticate|APPLICATION FAILED/;

const log = (message) => console.log(`\x1b[36m[backend]\x1b[0m ${message}`);

async function backendIsUp() {
  try {
    const response = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(2000) });
    return response.ok;
  } catch {
    return false;
  }
}

// Same lookup as backend/start-backend.cmd: prefer a JDK 21 in ~/.jdks
function javaHome() {
  const jdks = join(homedir(), ".jdks");
  if (existsSync(jdks)) {
    const jdk21 = readdirSync(jdks).filter((name) => name.startsWith("jdk-21")).sort().pop();
    if (jdk21) return join(jdks, jdk21);
  }
  return process.env.JAVA_HOME;
}

let backend = null;
let stopping = false;

function startBackend(attempt = 1) {
  const env = { ...process.env };
  const home = javaHome();
  if (home) env.JAVA_HOME = home;

  log(attempt === 1 ? "starting… a Microsoft sign-in page may open in your browser." : `retrying (${attempt}/${MAX_ATTEMPTS})…`);
  backend = isWindows
    ? spawn("cmd.exe", ["/c", "mvnw.cmd", "-q", "spring-boot:run"], { cwd: backendDir, env })
    : spawn("./mvnw", ["-q", "spring-boot:run"], { cwd: backendDir, env });

  let sleepingDatabase = false;
  const onOutput = (chunk) => {
    for (const line of chunk.toString().split(/\r?\n/)) {
      if (line.includes("not currently available")) sleepingDatabase = true;
      if (IMPORTANT.test(line)) log(line.replace(/^.*?\]\s+[\w.$]+\s+:\s+/, "").slice(0, 300));
    }
  };
  backend.stdout.on("data", onOutput);
  backend.stderr.on("data", onOutput);

  backend.on("exit", (code) => {
    backend = null;
    if (stopping) return;
    // A paused serverless Azure SQL database rejects the first connections while it wakes up.
    if (sleepingDatabase && attempt < MAX_ATTEMPTS) {
      log("the Azure database is waking up; trying again in 20 seconds.");
      setTimeout(() => startBackend(attempt + 1), 20000);
    } else if (code !== 0) {
      log(`stopped (exit code ${code}). See the messages above; the frontend keeps running.`);
    }
  });
}

function stopBackend() {
  if (!backend) return;
  if (isWindows) spawnSync("taskkill", ["/pid", String(backend.pid), "/T", "/F"], { stdio: "ignore" });
  else backend.kill("SIGTERM");
}

if (process.env.SKIP_BACKEND) {
  log("skipped (SKIP_BACKEND is set).");
} else if (await backendIsUp()) {
  log("already running on http://localhost:8080/api");
} else {
  startBackend();
}

const vite = spawn(process.execPath, [join(frontendDir, "node_modules/vite/bin/vite.js"), ...process.argv.slice(2)], {
  cwd: frontendDir,
  stdio: "inherit",
});

const shutdown = () => {
  stopping = true;
  stopBackend();
};
vite.on("exit", (code) => {
  shutdown();
  process.exit(code ?? 0);
});
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
