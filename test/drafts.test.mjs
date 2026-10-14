import assert from "node:assert/strict";
import test from "node:test";
import { Drafts } from "../dist/drafts.js";

const binding = { user: "u", guild: "g", channel: "c", message: "m" };
test("single-use consumption blocks a duplicate share", () => {
  const d = new Drafts();
  const id = d.create(binding, "result", "en");
  assert.ok(d.consume(id, binding, true));
  assert.equal(d.consume(id, binding, true), undefined);
});
for (const field of ["user", "guild", "channel", "message"]) {
  test(`draft bound to ${field}`, () => {
    const d = new Drafts();
    const id = d.create(binding, "result", "en");
    assert.equal(d.find(id, { ...binding, [field]: "other" }), undefined);
    assert.ok(d.find(id, binding));
  });
}
test("no draft access until the response message is bound", () => {
  const d = new Drafts();
  const id = d.create({ ...binding, message: "" }, "result", "en");
  assert.equal(d.find(id, { ...binding, message: "" }), undefined);
  d.bindMessage(id, "m");
  assert.ok(d.find(id, binding));
});
test("expiry is strict at five minutes and sweep releases capacity", () => {
  let now = 0;
  const d = new Drafts(() => now);
  const id = d.create(binding, "result", "en");
  now = 299999;
  assert.ok(d.find(id, binding));
  now++;
  assert.equal(d.find(id, binding), undefined);
  assert.ok(d.create(binding, "new", "tr"));
});
test("channel cooldown preserves blocked draft and discard still works", () => {
  let now = 0;
  const d = new Drafts(() => now);
  assert.ok(d.consume(d.create(binding, "a", "en"), binding, true));
  const id = d.create(binding, "b", "en");
  assert.equal(d.consume(id, binding, true), undefined);
  assert.ok(d.find(id, binding));
  assert.ok(d.consume(id, binding, false));
  now = 60000;
  assert.ok(d.consume(d.create(binding, "c", "en"), binding, true));
});
test("draft capacity is bounded at 100", () => {
  const d = new Drafts();
  for (let n = 0; n < 100; n++) d.create(binding, "a", "en");
  assert.throws(() => d.create(binding, "overflow", "en"), /capacity/);
});
test("cooldown memory cap fails closed and expires", () => {
  let now = 0;
  const d = new Drafts(() => now);
  for (let n = 0; n < 500; n++) assert.ok(d.reserve(`u${n}`, 5000));
  assert.equal(d.reserve("overflow", 5000), false);
  now = 5000;
  assert.ok(d.reserve("overflow", 5000));
});
test("restart drops all old previews", () => {
  const d = new Drafts();
  const id = d.create(binding, "a", "en");
  assert.equal(new Drafts().find(id, binding), undefined);
});
