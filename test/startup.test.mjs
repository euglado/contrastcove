import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { command } from "../dist/command.js";
import { config } from "../dist/config.js";

test("missing config fails without disclosing input", () => {
  assert.throws(
    () => config({ DISCORD_TOKEN: "sensitive-invalid-input" }),
    (e) => !e.message.includes("sensitive-invalid-input") && e.message.includes("setup"),
  );
});
test("command schema only has bounded color and language options", () => {
  const data = command.toJSON();
  assert.equal(data.name, "contrast");
  assert.equal(data.options.length, 3);
  for (const o of data.options.slice(0, 2)) {
    assert.equal(o.required, true);
    assert.equal(o.max_length, 7);
  }
});
for (const script of ["dist/main.js", "dist/register.js", "scripts/setup.mjs"]) {
  test(`unconfigured ${script} safely exits without writing settings`, () => {
    const project = resolve(dirname(fileURLToPath(import.meta.url)), "..");
    const dir = mkdtempSync(join(tmpdir(), "contrastcove-test-"));
    const env = { ...process.env };
    for (const k of ["DISCORD_TOKEN", "APPLICATION_ID", "GUILD_ID"]) delete env[k];
    try {
      const result = spawnSync(process.execPath, [join(project, script)], {
        cwd: dir,
        env,
        encoding: "utf8",
        timeout: 10000,
      });
      assert.equal(result.status, 1, result.stderr);
      assert.equal(existsSync(join(dir, ".env")), false);
      assert.match(result.stderr, script.includes("setup") ? /interactive/ : /setup/);
    } finally {
      const absolute = resolve(dir);
      assert.ok(
        absolute.startsWith(resolve(tmpdir()) + sep) && absolute.includes("contrastcove-test-"),
      );
      rmSync(absolute, { recursive: true, force: true });
    }
  });
}
