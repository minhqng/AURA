import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const manifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));
const missing = [];

function assertFile(path) {
  if (!existsSync(join(root, path))) missing.push(path);
}

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (name === "config.js") return [];
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });
}

assertFile(manifest.background.service_worker);
Object.values(manifest.icons || {}).forEach(assertFile);
manifest.content_scripts.forEach((script) => script.js.forEach(assertFile));

const popupHtml = readFileSync(join(root, manifest.action.default_popup), "utf8");
const scripts = Array.from(popupHtml.matchAll(/<script src="([^"]+)"/g));
scripts.forEach((match) => assertFile(`src/popup/${match[1]}`));

if (missing.length) {
  throw new Error(`Missing manifest/popup files: ${missing.join(", ")}`);
}

for (const file of listFiles(join(root, "src"))) {
  if (extname(file) === ".js") {
    execFileSync("node", ["--check", normalize(file)], { stdio: "inherit" });
  }
}

console.log("Extension structure and JavaScript syntax OK.");
