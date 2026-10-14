import assert from "node:assert/strict";
import test from "node:test";
import { ChannelType, MessageFlags, MessageFlagsBitField, PermissionsBitField } from "discord.js";
import { Drafts } from "../dist/drafts.js";
import { createHandler, language } from "../dist/handler.js";

const guild = "100000000000000001";
function fixture() {
  const events = [];
  const base = {
    locale: "en",
    guildId: guild,
    channelId: "channel",
    applicationId: "bot",
    user: { id: "user" },
    client: { user: { id: "bot" } },
    appPermissions: new PermissionsBitField(["ViewChannel", "SendMessages"]),
    memberPermissions: new PermissionsBitField(["ViewChannel", "SendMessages"]),
    inGuild: () => true,
    channel: {
      type: ChannelType.GuildText,
      send: async (p) => {
        events.push(["send", p]);
        return { id: "public" };
      },
    },
    reply: async (p) => {
      events.push(["reply", p]);
    },
    deferReply: async (p) => {
      events.push(["deferReply", p]);
    },
    deferUpdate: async () => {
      events.push(["deferUpdate"]);
    },
    editReply: async (p) => {
      events.push(["editReply", p]);
      return { id: "preview" };
    },
  };
  const command = {
    ...base,
    isChatInputCommand: () => true,
    commandName: "contrast",
    options: {
      getString: (name) => ({ foreground: "#000000", background: "#FFFFFF", language: "en" })[name],
    },
  };
  const button = (customId) => ({
    ...base,
    isChatInputCommand: () => false,
    customId,
    message: {
      id: "preview",
      author: { id: "bot" },
      webhookId: "bot",
      flags: new MessageFlagsBitField(MessageFlags.Ephemeral),
    },
  });
  return { events, command, button };
}
async function preview(f, handle) {
  await handle(f.command);
  assert.equal(f.events.filter(([e]) => e === "send").length, 0);
  const payload = f.events.find(([e]) => e === "editReply")[1];
  return payload.components[0].toJSON().components;
}
test("command stays private; matching owner explicitly shares exactly once", async () => {
  const f = fixture();
  const handle = createHandler(guild);
  const buttons = await preview(f, handle);
  assert.equal(f.events[0][1].flags, MessageFlags.Ephemeral);
  await Promise.all([
    handle(f.button(buttons[0].custom_id)),
    handle(f.button(buttons[0].custom_id)),
  ]);
  const sends = f.events.filter(([e]) => e === "send");
  assert.equal(sends.length, 1);
  assert.deepEqual(sends[0][1].allowedMentions.parse, []);
  assert.equal(sends[0][1].flags, MessageFlags.SuppressEmbeds);
  assert.ok(!sends[0][1].content.includes("Only you"));
});
test("discard never publishes and disables components", async () => {
  const f = fixture();
  const handle = createHandler(guild);
  const buttons = await preview(f, handle);
  await handle(f.button(buttons[1].custom_id));
  assert.equal(f.events.filter(([e]) => e === "send").length, 0);
  assert.deepEqual(f.events.at(-1)[1].components, []);
});
for (const field of ["user", "channel", "message", "author", "webhook", "public"]) {
  test(`rejects a mismatched preview ${field}`, async () => {
    const f = fixture();
    const handle = createHandler(guild);
    const buttons = await preview(f, handle);
    const b = f.button(buttons[0].custom_id);
    if (field === "user") b.user = { id: "other" };
    if (field === "channel") b.channelId = "other";
    if (field === "message") b.message.id = "other";
    if (field === "author") b.message.author.id = "other";
    if (field === "webhook") b.message.webhookId = "other";
    if (field === "public") b.message.flags = new MessageFlagsBitField(0);
    await handle(b);
    assert.equal(f.events.filter(([e]) => e === "send").length, 0);
    assert.equal(f.events.at(-1)[0], "reply");
    await handle(f.button(buttons[0].custom_id));
    assert.equal(f.events.filter(([e]) => e === "send").length, 1);
  });
}
for (const field of ["appPermissions", "memberPermissions"]) {
  test(`rechecks ${field} before sharing without consuming preview`, async () => {
    const f = fixture();
    const handle = createHandler(guild);
    const buttons = await preview(f, handle);
    const b = f.button(buttons[0].custom_id);
    b[field] = new PermissionsBitField(["ViewChannel"]);
    await handle(b);
    assert.equal(f.events.filter(([e]) => e === "send").length, 0);
    await handle(f.button(buttons[0].custom_id));
    assert.equal(f.events.filter(([e]) => e === "send").length, 1);
  });
}
for (const type of [
  ChannelType.DM,
  ChannelType.PublicThread,
  ChannelType.GuildVoice,
  ChannelType.GuildAnnouncement,
]) {
  test(`rejects unsupported channel type ${type}`, async () => {
    const f = fixture();
    f.command.channel.type = type;
    await createHandler(guild)(f.command);
    assert.equal(f.events[0][0], "reply");
  });
}
test("rejects another server or DM context", async () => {
  for (const dm of [false, true]) {
    const f = fixture();
    f.command.guildId = "other";
    f.command.inGuild = () => !dm;
    await createHandler(guild)(f.command);
    assert.equal(f.events[0][0], "reply");
  }
});
test("expired preview never sends", async () => {
  let now = 0;
  const f = fixture();
  const handle = createHandler(guild, new Drafts(() => now));
  const buttons = await preview(f, handle);
  now = 300000;
  await handle(f.button(buttons[0].custom_id));
  assert.equal(f.events.filter(([e]) => e === "send").length, 0);
});
test("network send failure consumes preview and warns about ambiguous delivery", async () => {
  const f = fixture();
  const handle = createHandler(guild);
  const buttons = await preview(f, handle);
  f.command.channel.send = async () => {
    throw new Error("network");
  };
  await handle(f.button(buttons[0].custom_id));
  assert.match(f.events.at(-1)[1].content, /Check the channel/);
  await handle(f.button(buttons[0].custom_id));
  assert.match(f.events.at(-1)[1].content, /was used/);
});
test("preview edit failure does not leave a usable draft", async () => {
  const f = fixture();
  const handle = createHandler(guild);
  f.command.editReply = async () => {
    throw new Error("expired interaction");
  };
  await assert.rejects(handle(f.command), /expired interaction/);
});
test("unrelated button ignored", async () => {
  const f = fixture();
  await createHandler(guild)(f.button("some-other-app"));
  assert.equal(f.events.length, 0);
});
test("bad color is private and includes guidance", async () => {
  const f = fixture();
  f.command.options.getString = () => "red";
  await createHandler(guild)(f.command);
  assert.equal(f.events[0][1].flags & MessageFlags.Ephemeral, MessageFlags.Ephemeral);
  assert.match(f.events[0][1].content, /six HEX/);
});
test("rapid repeat command is throttled", async () => {
  const f = fixture();
  const handle = createHandler(guild);
  await preview(f, handle);
  await handle(f.command);
  assert.match(f.events.at(-1)[1].content, /five seconds/);
});
test("language selection respects explicit preference", () => {
  assert.equal(language("tr", "en"), "en");
  assert.equal(language("en-US", "tr"), "tr");
  assert.equal(language("tr"), "tr");
  assert.equal(language("de"), "en");
});
