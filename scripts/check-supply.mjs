import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
const allowed = new Set([
  "MIT",
  "ISC",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "Apache-2.0",
  "0BSD",
  "Python-2.0",
  "(MIT OR Apache-2.0)",
  "MIT OR Apache-2.0",
]);
let dependencies = 0;
for (const [name, entry] of Object.entries(lock.packages)) {
  if (!name) continue;
  assert(allowed.has(entry.license), `Review license: ${name}`);
  assert(
    entry.resolved?.startsWith("https://registry.npmjs.org/"),
    `Review registry: ${name}`,
  );
  assert(
    /^sha512-[A-Za-z0-9+/]+={0,2}$/.test(entry.integrity ?? ""),
    `Missing SHA-512 integrity: ${name}`,
  );
  assert(!entry.hasInstallScript, `Review lifecycle script: ${name}`);
  dependencies++;
}
const skipped = new Set(["node_modules", ".git", "dist", "coverage"]);
let files = 0;
function scan(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (skipped.has(entry.name)) continue;
    const file = join(directory, entry.name);
    if (entry.isDirectory()) {
      scan(file);
      continue;
    }
    if (!entry.isFile()) continue;
    assert(
      !entry.name.startsWith(".env") || entry.name === ".env.example",
      "Local credential file present; exclude it from release checks",
    );
    const content = readFileSync(file, "utf8");
    const patterns = [
      new RegExp("mfa" + "\\.[A-Za-z0-9_-]{70,}"),
      /[A-Za-z0-9_-]{23,28}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{25,}/,
      new RegExp("gh" + "[pousr]_[A-Za-z0-9]{30,}"),
      new RegExp("github" + "_pat_[A-Za-z0-9_]{40,}"),
      new RegExp("-----BEGIN " + "(?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
      /DISCORD_TOKEN[ \t]*=[ \t]*[^\s#'"`$][^\s]{19,}/,
    ];
    for (const pattern of patterns)
      assert(
        !pattern.test(content),
        `Possible credential in ${relative(".", file)}; inspect locally without printing it`,
      );
    files++;
  }
}
scan(".");
console.log(
  `Supply check passed: ${dependencies} dependency license/registry/SHA-512/script records; ${files} source credential-pattern scans.`,
);
