import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { config } from "../src/config.js";

test("configuration rejects invalid IDs and missing token without leaking inputs", () => {
  assert.throws(() => config({}), /Configuration/);
  assert.throws(
    () =>
      config({
        DISCORD_TOKEN: "do-not-print-this-value",
        DISCORD_APPLICATION_ID: "bad",
        DISCORD_GUILD_ID: "111111111111111111",
      }),
    (error) =>
      error instanceof Error && !error.message.includes("do-not-print"),
  );
});
test("unconfigured main/register and noninteractive setup safely exit without network/config writes", () => {
  const temporary = mkdtempSync(join(tmpdir(), "linknest-smoke-"));
  try {
    for (const file of [
      "dist/src/main.js",
      "dist/src/register.js",
      "scripts/setup.mjs",
    ]) {
      const result = spawnSync(process.execPath, [resolve(file)], {
        cwd: temporary,
        env: {
          ...process.env,
          DISCORD_TOKEN: "",
          DISCORD_APPLICATION_ID: "",
          DISCORD_GUILD_ID: "",
        },
        encoding: "utf8",
        timeout: 8000,
      });
      assert.equal(result.status, 1, `${file}: ${result.stderr}`);
      assert(!existsSync(join(temporary, ".env")));
    }
  } finally {
    assert.equal(dirname(resolve(temporary)), resolve(tmpdir()));
    assert(basename(temporary).startsWith("linknest-smoke-"));
    rmSync(temporary, { recursive: true, force: true });
  }
});
