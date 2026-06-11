import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const staging = join(dist, "aura-extension");
const archive = join(dist, "aura-extension.zip");
const include = ["manifest.json", "README.md", "icons", "src"];
const exclude = new Set(["src/config.js"]);

function copyEntry(entry) {
  const source = join(root, entry);
  const target = join(staging, entry);
  if (!existsSync(source) || exclude.has(entry.replaceAll("\\", "/"))) return;
  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target, {
    recursive: true,
    filter: (path) => !exclude.has(path.replace(root, "").replace(/^[/\\]/, "").replaceAll("\\", "/")),
  });
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(staging, { recursive: true });
include.forEach(copyEntry);

if (process.platform === "win32") {
  execFileSync("powershell", [
    "-NoProfile",
    "-Command",
    `Compress-Archive -Path '${staging}\\*' -DestinationPath '${archive}' -Force`,
  ]);
} else {
  execFileSync("zip", ["-qr", archive, "."], { cwd: staging });
}

console.log(`Packaged extension: ${archive}`);
