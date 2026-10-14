import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ChannelType,
  type Interaction,
  MessageFlags,
  MessageFlagsBitField,
  PermissionFlagsBits,
  PermissionsBitField,
} from "discord.js";
import { LinkNest } from "../src/bot.js";
import { parseForm, renderDirectory } from "../src/directory.js";

const guild = "111111111111111111";
const content = renderDirectory(
  parseForm(
    "Library",
    "Docs | https://discord.com | Documentation\nNode | https://nodejs.org | Runtime",
    "en",
  ),
);
function fake(kind: "command" | "modal" | "button" | "select") {
  const calls: { method: string; body: unknown }[] = [];
  const i = {
    calls,
    kind,
    commandName: "linknest",
    customId: kind === "modal" ? "ln:form:en" : "ln:choose:v1",
    locale: "en",
    guildId: guild,
    channelId: "222222222222222222",
    user: { id: "333333333333333333" },
    client: { user: { id: "444444444444444444" } },
    memberPermissions: new PermissionsBitField(PermissionFlagsBits.ManageGuild),
    appPermissions: new PermissionsBitField([
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
    ]),
    channel: {
      id: "222222222222222222",
      type: ChannelType.GuildText as ChannelType,
      send: async (body: unknown) => {
        calls.push({ method: "send", body });
      },
    },
    message: {
      author: { id: "444444444444444444" },
      webhookId: null as string | null,
      channelId: "222222222222222222",
      guildId: guild,
      content,
      flags: new MessageFlagsBitField(
        kind === "button" ? MessageFlags.Ephemeral : 0,
      ),
    },
    values: ["0"],
    replied: false,
    deferred: false,
    fields: {
      getTextInputValue: (id: string) =>
        id === "title"
          ? "Library"
          : "Docs | https://discord.com | Documentation\nNode | https://nodejs.org | Runtime",
    },
    isRepliable: () => true,
    inGuild: () => true,
    isChatInputCommand: () => kind === "command",
    isModalSubmit: () => kind === "modal",
    isButton: () => kind === "button",
    isStringSelectMenu: () => kind === "select",
    reply: async (body: unknown) => {
      i.replied = true;
      calls.push({ method: "reply", body });
    },
    showModal: async (body: unknown) => {
      calls.push({ method: "modal", body });
    },
    update: async (body: unknown) => {
      i.replied = true;
      calls.push({ method: "update", body });
    },
    deferUpdate: async () => {
      i.deferred = true;
      calls.push({ method: "defer", body: null });
    },
    editReply: async (body: unknown) => {
      calls.push({ method: "edit", body });
    },
    followUp: async (body: unknown) => {
      calls.push({ method: "followUp", body });
    },
  };
  return i;
}
type Fake = ReturnType<typeof fake>;
const run = (bot: LinkNest, i: Fake) => bot.handle(i as unknown as Interaction);
const output = (i: Fake) => JSON.stringify(i.calls);
async function draft(bot: LinkNest) {
  const form = fake("modal");
  await run(bot, form);
  const id = [...bot.drafts.keys()].at(-1);
  assert(id);
  return id;
}
test("manager command opens form without posting anything", async () => {
  const i = fake("command");
  await run(new LinkNest(guild), i);
  assert.deepEqual(
    i.calls.map((c) => c.method),
    ["modal"],
  );
});
test("non-manager cannot open a form, submit a form or publish", async () => {
  for (const kind of ["command", "modal", "button"] as const) {
    const i = fake(kind);
    i.memberPermissions = new PermissionsBitField();
    await run(new LinkNest(guild), i);
    assert(output(i).includes("Manage Server"));
    assert(!i.calls.some((c) => c.method === "send"));
  }
});
test("wrong guild, DM, thread and missing app permissions fail closed", async () => {
  for (const change of [
    (i: Fake) => {
      i.guildId = "555555555555555555";
    },
    (i: Fake) => {
      i.inGuild = () => false;
    },
    (i: Fake) => {
      i.channel.type = ChannelType.PublicThread;
    },
    (i: Fake) => {
      i.appPermissions = new PermissionsBitField(
        PermissionFlagsBits.ViewChannel,
      );
    },
  ]) {
    const i = fake("command");
    change(i);
    await run(new LinkNest(guild), i);
    assert.equal(i.calls[0]?.method, "reply");
    assert(!i.calls.some((c) => c.method === "modal"));
  }
});
test("modal only produces ephemeral preview; explicit publication consumes draft", async () => {
  const bot = new LinkNest(guild);
  const form = fake("modal");
  await run(bot, form);
  assert(output(form).includes("PRIVATE PREVIEW"));
  assert(output(form).includes('"flags":64'));
  assert(!form.calls.some((c) => c.method === "send"));
  const id = [...bot.drafts.keys()][0];
  assert(id);
  const i = fake("button");
  i.customId = `ln:publish:${id}`;
  await run(bot, i);
  assert.deepEqual(
    i.calls.map((c) => c.method),
    ["defer", "send", "edit"],
  );
  assert.equal(bot.drafts.size, 0);
  const duplicate = fake("button");
  duplicate.customId = i.customId;
  await run(bot, duplicate);
  assert(!duplicate.calls.some((c) => c.method === "send"));
});
test("cancel consumes draft and removes preview controls without posting", async () => {
  const bot = new LinkNest(guild);
  const id = await draft(bot);
  const i = fake("button");
  i.customId = `ln:cancel:${id}`;
  await run(bot, i);
  assert(output(i).includes("Cancelled"));
  assert.equal(bot.drafts.size, 0);
  assert(!i.calls.some((c) => c.method === "send"));
});
test("publication rechecks manager and bot permissions", async () => {
  const bot = new LinkNest(guild);
  const id = await draft(bot);
  const i = fake("button");
  i.customId = `ln:publish:${id}`;
  i.memberPermissions = new PermissionsBitField();
  await run(bot, i);
  assert(bot.drafts.has(id));
  assert(!i.calls.some((c) => c.method === "send"));
  const other = fake("button");
  other.customId = i.customId;
  other.appPermissions = new PermissionsBitField();
  await run(bot, other);
  assert(!other.calls.some((c) => c.method === "send"));
});
test("preview cannot be replayed by another member, channel or public message", async () => {
  for (const change of [
    (i: Fake) => {
      i.user.id = "666666666666666666";
    },
    (i: Fake) => {
      i.channelId = "777777777777777777";
      i.channel.id = i.channelId;
    },
    (i: Fake) => {
      i.message.flags = new MessageFlagsBitField();
    },
    (i: Fake) => {
      i.message.author.id = "888888888888888888";
    },
  ]) {
    const bot = new LinkNest(guild);
    const id = await draft(bot);
    const i = fake("button");
    i.customId = `ln:publish:${id}`;
    change(i);
    await run(bot, i);
    assert(!i.calls.some((c) => c.method === "send"));
    assert(bot.drafts.has(id));
  }
});
test("expired previews reject publication and periodic cleanup removes them", async () => {
  let now = 100;
  const bot = new LinkNest(guild, () => now);
  const id = await draft(bot);
  now += 600_000;
  const i = fake("button");
  i.customId = `ln:publish:${id}`;
  await run(bot, i);
  assert.equal(bot.drafts.size, 0);
  assert(!i.calls.some((c) => c.method === "send"));
});
test("failed preview response releases its draft", async () => {
  const bot = new LinkNest(guild);
  const i = fake("modal");
  i.reply = async () => {
    throw new Error("private API detail");
  };
  await run(bot, i);
  assert.equal(bot.drafts.size, 0);
  assert(!output(i).includes("private API detail"));
});
test("failed send is not retried and gives ambiguity guidance", async () => {
  const bot = new LinkNest(guild);
  const id = await draft(bot);
  const i = fake("button");
  i.customId = `ln:publish:${id}`;
  let sends = 0;
  i.channel.send = async () => {
    sends++;
    throw new Error("private API detail");
  };
  await run(bot, i);
  assert.equal(sends, 1);
  assert.equal(bot.drafts.size, 0);
  assert.equal(bot.publishing.size, 0);
  assert(output(i).includes("Check the channel"));
  assert(!output(i).includes("private API detail"));
});
test("concurrent publication and server cooldown prevent duplicate sends", async () => {
  let now = 100;
  const bot = new LinkNest(guild, () => now);
  const id = await draft(bot);
  const first = fake("button");
  first.customId = `ln:publish:${id}`;
  let release = () => {};
  first.channel.send = () =>
    new Promise<void>((resolve) => {
      release = resolve;
    });
  const pending = run(bot, first);
  await new Promise<void>((resolve) => setImmediate(resolve));
  const nextId = await draft(bot);
  const second = fake("button");
  second.customId = `ln:publish:${nextId}`;
  await run(bot, second);
  assert(!second.calls.some((c) => c.method === "send"));
  assert(bot.drafts.has(nextId));
  release();
  await pending;
  const third = fake("button");
  third.customId = second.customId;
  await run(bot, third);
  assert(!third.calls.some((c) => c.method === "send"));
  now += 60_000;
  const fourth = fake("button");
  fourth.customId = second.customId;
  await run(bot, fourth);
  assert(fourth.calls.some((c) => c.method === "send"));
});
test("member reads a public original directory after complete process state loss", async () => {
  const bot = new LinkNest(guild);
  const i = fake("select");
  i.memberPermissions = new PermissionsBitField();
  i.appPermissions = new PermissionsBitField();
  await run(bot, i);
  assert(output(i).includes('"flags":64'));
  assert(output(i).includes("https://discord.com/"));
  assert(!i.calls.some((c) => c.method === "send"));
  assert.equal(bot.drafts.size, 0);
});
test("spoofed, webhook, cross-channel, cross-guild and ephemeral source cards reject reads", async () => {
  for (const change of [
    (i: Fake) => {
      i.message.author.id = "999999999999999999";
    },
    (i: Fake) => {
      i.message.webhookId = "999999999999999999";
    },
    (i: Fake) => {
      i.message.channelId = "999999999999999999";
    },
    (i: Fake) => {
      i.message.guildId = "999999999999999999";
    },
    (i: Fake) => {
      i.message.flags = new MessageFlagsBitField(MessageFlags.Ephemeral);
    },
  ]) {
    const i = fake("select");
    change(i);
    await run(new LinkNest(guild), i);
    assert(output(i).includes("not an original"));
  }
});
test("invalid indices and tampered content cannot create an outbound link", async () => {
  for (const values of [["-1"], ["0", "1"], ["3"], ["00"], []]) {
    const i = fake("select");
    i.values = values;
    await run(new LinkNest(guild), i);
    assert(!output(i).includes('"style":5'));
  }
  const i = fake("select");
  i.message.content = i.message.content.replace("https:", "http:");
  await run(new LinkNest(guild), i);
  assert(!output(i).includes('"style":5'));
});
test("read and form cooldowns expire without retaining user IDs", async () => {
  let now = 100;
  const bot = new LinkNest(guild, () => now);
  await run(bot, fake("select"));
  const second = fake("select");
  await run(bot, second);
  assert(output(second).includes("two seconds"));
  now += 2000;
  bot.sweep();
  assert.equal(bot.cooldowns.size, 0);
  await run(bot, fake("command"));
  const form = fake("command");
  await run(bot, form);
  assert(output(form).includes("ten seconds"));
  now += 10_000;
  bot.sweep();
  assert.equal(bot.cooldowns.size, 0);
});
test("preview capacity is bounded and unrelated commands are ignored", async () => {
  const bot = new LinkNest(guild);
  for (let n = 0; n < 100; n++) {
    const i = fake("modal");
    i.user.id = String(n);
    await run(bot, i);
  }
  const overflow = fake("modal");
  await run(bot, overflow);
  assert(output(overflow).includes("Preview limit"));
  assert.equal(bot.drafts.size, 100);
  const other = fake("command");
  other.commandName = "other";
  await run(bot, other);
  assert.equal(other.calls.length, 0);
});
test("cooldown capacity rejects extra readers and forms", async () => {
  const bot = new LinkNest(guild, () => 100);
  for (let n = 0; n < 2000; n++) bot.cooldowns.set(`read:${n}`, 2000);
  const i = fake("select");
  await run(bot, i);
  assert(output(i).includes("Busy"));
  assert.equal(bot.cooldowns.size, 2000);
  const form = fake("command");
  await run(bot, form);
  assert(!form.calls.some((c) => c.method === "modal"));
});
