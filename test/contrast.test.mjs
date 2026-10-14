import assert from "node:assert/strict";
import test from "node:test";
import { color, grades, luminance, ratio, report } from "../dist/contrast.js";

for (const [input, expected] of [
  ["abcdef", "#ABCDEF"],
  ["#aBc123", "#ABC123"],
  [" #000000 ", "#000000"],
]) {
  test(`normalizes ${input}`, () => assert.equal(color(input), expected));
}
for (const input of [
  "",
  "#123",
  "red",
  "#12345678",
  "rgb(1,2,3)",
  "12ABEG",
  "#123456\n@everyone",
  "１２３４５６",
  "##123456",
  "0x123456",
]) {
  test(`rejects invalid opaque hex: ${JSON.stringify(input)}`, () =>
    assert.throws(() => color(input)));
}
for (const [fg, bg, expected] of [
  ["#000000", "#FFFFFF", 21],
  ["#123456", "#123456", 1],
  ["#FF0000", "#FFFFFF", 3.9984767707539985],
  ["#00FF00", "#000000", 15.303999999999998],
  ["#0000FF", "#FFFFFF", 8.592471358428805],
  ["#777777", "#FFFFFF", 4.478089453577214],
  ["#767676", "#FFFFFF", 4.542224959605253],
]) {
  test(`reference contrast ${fg}/${bg}`, () =>
    assert.ok(Math.abs(ratio(fg, bg) - expected) < 1e-12));
}
test("sRGB linear branch around the byte cutoff", () => {
  assert.ok(Math.abs(luminance("#0A0A0A") - 10 / 255 / 12.92) < 1e-15);
  assert.ok(Math.abs(luminance("#0B0B0B") - ((11 / 255 + 0.055) / 1.055) ** 2.4) < 1e-15);
});
test("luminance primary weights and extrema", () => {
  assert.equal(luminance("#000000"), 0);
  assert.equal(luminance("#FFFFFF"), 1);
  assert.equal(luminance("#FF0000"), 0.2126);
  assert.equal(luminance("#00FF00"), 0.7152);
  assert.equal(luminance("#0000FF"), 0.0722);
});
for (const [value, expected] of [
  [2.99999, { aaNormal: false, aaLarge: false, aaaNormal: false, aaaLarge: false }],
  [3, { aaNormal: false, aaLarge: true, aaaNormal: false, aaaLarge: false }],
  [4.49999, { aaNormal: false, aaLarge: true, aaaNormal: false, aaaLarge: false }],
  [4.5, { aaNormal: true, aaLarge: true, aaaNormal: false, aaaLarge: true }],
  [6.99999, { aaNormal: true, aaLarge: true, aaaNormal: false, aaaLarge: true }],
  [7, { aaNormal: true, aaLarge: true, aaaNormal: true, aaaLarge: true }],
]) {
  test(`unrounded grade at ${value}`, () => assert.deepEqual(grades(value), expected));
}
for (const value of [NaN, Infinity, 0, 22])
  test(`invalid ratio ${value}`, () => assert.throws(() => grades(value)));
test("symmetry and range for deterministic color samples", () => {
  for (let n = 0; n < 512; n++) {
    const a = `#${((n * 32267) % 16777216).toString(16).padStart(6, "0")}`;
    const b = `#${((n * 71549 + 19) % 16777216).toString(16).padStart(6, "0")}`;
    assert.equal(ratio(a, b), ratio(b, a));
    assert.ok(ratio(a, b) >= 1 && ratio(a, b) <= 21);
  }
});
for (const lang of ["tr", "en"]) {
  test(`report is readable plain text in ${lang}`, () => {
    const r = report("#777777", "#FFFFFF", lang);
    assert.match(r, /4\.478:1/);
    assert.match(r, lang === "tr" ? /normal metin.*KALIR/ : /normal text.*FAIL/);
    assert.match(r, /#000000 \(21\.000:1\)/);
    assert.match(r, /18pt/);
    assert.ok(r.length < 1500);
    assert.ok(!r.includes("@"));
  });
}
test("suggests white text on black background", () =>
  assert.match(report("101010", "000000", "en"), /#FFFFFF \(21\.000:1\)/));
