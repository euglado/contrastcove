import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
assert.equal(lock.lockfileVersion, 3);
const approved = new Set([
  "MIT",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "ISC",
  "0BSD",
  "(MIT OR Apache-2.0)",
  "MIT OR Apache-2.0",
]);
let dependencies = 0;
for (const [name, pkg] of Object.entries(lock.packages)) {
  if (!name) continue;
  assert.ok(approved.has(pkg.license), `Unreviewed license: ${name}`);
  assert.ok(
    pkg.resolved?.startsWith("https://registry.npmjs.org/"),
    `Non-registry source: ${name}`,
  );
  assert.match(pkg.integrity ?? "", /^sha512-[A-Za-z0-9+/]+=*$/, `Missing integrity: ${name}`);
  assert.ok(!pkg.hasInstallScript, `Unreviewed lifecycle script: ${name}`);
  dependencies++;
}
const secretPatterns = [
  new RegExp("gh" + "[pousr]_[A-Za-z0-9]{30,}"),
  new RegExp("github_" + "pat_[A-Za-z0-9_]{30,}"),
  /[A-Za-z0-9_-]{23,28}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27,}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /DISCORD_TOKEN[ \t]*=[ \t]*[^\s"'`]{20,}/,
];
const excluded = new Set(["node_modules", ".git", "dist", ".env", "package-lock.json"]);
let sources = 0;
function scan(dir) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    if (excluded.has(item.name) || (item.name.startsWith(".env.") && item.name !== ".env.example"))
      continue;
    const file = join(dir, item.name);
    assert.ok(!item.isSymbolicLink(), "Source symlinks need review");
    if (item.isDirectory()) scan(file);
    else {
      const content = readFileSync(file, "utf8");
      for (const pattern of secretPatterns)
        assert.ok(
          !pattern.test(content),
          `Credential pattern in ${file.slice(root.length + 1)} (value redacted)`,
        );
      sources++;
    }
  }
}
scan(root);
console.log(
  `Supply check: ${dependencies} dependency license/registry/SHA-512/no-install-script records; ${sources} source credential scans passed.`,
);
