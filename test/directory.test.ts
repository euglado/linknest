import assert from "node:assert/strict";
import { test } from "node:test";
import {
  httpsUrl,
  parseForm,
  readDirectory,
  renderDirectory,
} from "../src/directory.js";
import { command, modal, publicCard, resourceCard } from "../src/views.js";

const lines =
  "Docs | https://discord.com/developers | Official docs\nNode | https://nodejs.org | Runtime guide";
test("canonical English and Turkish cards reopen without stored state", () => {
  for (const language of ["en", "tr"] as const) {
    const directory = parseForm("Community library", lines, language);
    assert.deepEqual(readDirectory(renderDirectory(directory)), directory);
    assert.equal(directory.resources[1]?.url, "https://nodejs.org/");
  }
});
test("CRLF form and whitespace normalize without corrupting card", () => {
  const directory = parseForm(
    "  Kaynaklar  ",
    lines.replace("\n", "\r\n"),
    "tr",
  );
  assert.equal(directory.title, "Kaynaklar");
  assert.deepEqual(readDirectory(renderDirectory(directory)), directory);
});
for (const address of [
  "http://discord.com",
  "javascript:alert(1)",
  "data:text/plain,a",
  "file:///tmp/a",
  "https://user:pass@discord.com",
  "https://127.0.0.1",
  "https://2130706433",
  "https://[::1]",
  "https://localhost",
  "https://machine.local",
  "https://app.internal",
  "https://invalid.test",
  "https://x.onion",
  "https://discord.com:8443",
  "https://discord.com\\@evil.org",
  "https://discord.com/ space",
  "https://xn--bcher-kva.de",
  "https://bücher.de",
  "https://discord.com/\u202eabc",
  "https://discord.com/<a>",
]) {
  test(`rejects unsafe or unsupported URL syntax ${JSON.stringify(address)}`, () =>
    assert.throws(() => httpsUrl(address)));
}
test("normalizes an explicit standard HTTPS port and preserves path/query/hash", () => {
  assert.equal(
    httpsUrl("https://DISCORD.com:443/developers?mode=read#top"),
    "https://discord.com/developers?mode=read#top",
  );
});
for (const title of [
  "",
  "@everyone",
  "[fake](link)",
  "a\nb",
  "a\u200bb",
  "a".repeat(61),
]) {
  test(`rejects ambiguous title ${JSON.stringify(title)}`, () =>
    assert.throws(() => parseForm(title, lines, "en")));
}
test("rejects missing notes, duplicate labels, duplicate normalized URLs and wrong resource counts", () => {
  for (const value of [
    "A | https://discord.com | note",
    "A | https://discord.com",
    "A | https://discord.com | note\na | https://nodejs.org | note",
    "A | https://discord.com | note\nB | https://discord.com/ | note",
    "A | https://discord.com | @everyone\nB | https://nodejs.org | note",
    Array.from(
      { length: 5 },
      (_, i) => `N${i} | https://a${i}.com | note`,
    ).join("\n"),
  ]) {
    assert.throws(() => parseForm("Library", value, "en"));
  }
});
test("rejects malformed, reordered, unsupported and misleading public cards", () => {
  const card = renderDirectory(parseForm("Library", lines, "en"));
  for (const changed of [
    card.replace("v1", "v2"),
    card.replace("1. Docs", "2. Docs"),
    card.replace("<https:", "https:"),
    card.replace("Links selected", "Verified links"),
    `${card}\n`,
    card.replace("[en]", "[fr]"),
    "x".repeat(1851),
  ]) {
    assert.throws(() => readDirectory(changed));
  }
});
test("maximum normal resource fields fit private preview and reconstruct canonically", () => {
  const long = Array.from(
    { length: 4 },
    (_, i) =>
      `${String(i).repeat(40)} | https://discord.com/${String(i).repeat(230)} | ${"n".repeat(80)}`,
  ).join("\n");
  const directory = parseForm("T".repeat(60), long, "en");
  const content = renderDirectory(directory);
  assert(content.length < 1850);
  assert.deepEqual(readDirectory(content), directory);
});
test("command defaults to managers and form uses current Label components", () => {
  assert.equal(command.toJSON().default_member_permissions, "32");
  const form = modal("tr").toJSON();
  assert.equal(form.components.length, 2);
  assert(form.components.every((component) => component.type === 18));
});
test("public select and private link use labels and suppress mentions", () => {
  const directory = parseForm("Library", lines, "en");
  const card = publicCard(directory);
  assert.deepEqual(card.allowedMentions.parse, []);
  assert.equal(card.components[0]?.toJSON().components[0]?.type, 3);
  const resource = directory.resources[0];
  assert(resource);
  const result = resourceCard(resource, "tr");
  assert(result.content.includes("discord.com"));
  assert.equal(result.components[0]?.toJSON().components[0]?.style, 5);
});
