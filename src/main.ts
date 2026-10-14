import { Client, Events, GatewayIntentBits, Options } from "discord.js";
import { config } from "./config.js";
import { Drafts } from "./drafts.js";
import { createHandler } from "./handler.js";

async function main() {
  const c = config();
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    allowedMentions: { parse: [], repliedUser: false },
    makeCache: Options.cacheWithLimits({
      ...Options.DefaultMakeCacheSettings,
      MessageManager: 0,
      UserManager: 0,
      GuildMemberManager: 0,
    }),
  });
  const drafts = new Drafts();
  const handle = createHandler(c.guildId, drafts);
  const timer = setInterval(() => drafts.sweep(), 30_000);
  timer.unref();
  client.once(Events.ClientReady, () => console.log("ContrastCove ready. / ContrastCove hazır."));
  client.on(Events.Error, () =>
    console.error("Discord connection error. / Discord bağlantı hatası."),
  );
  client.on(Events.InteractionCreate, async (i) => {
    if (!i.isChatInputCommand() && !i.isButton()) return;
    try {
      await handle(i);
    } catch {
      console.error("Interaction could not complete; no payload logged.");
      try {
        const content =
          "İşlem tamamlanamadı; yeniden denemeden önce kanalı kontrol edin. / Operation incomplete; check the channel before retrying.";
        if (i.deferred || i.replied)
          await i.editReply({ content, components: [], allowedMentions: { parse: [] } });
        else await i.reply({ content, flags: 64, allowedMentions: { parse: [] } });
      } catch {
        /* Expired interactions cannot be acknowledged again. */
      }
    }
  });
  for (const signal of ["SIGINT", "SIGTERM"] as const)
    process.once(signal, () => {
      clearInterval(timer);
      client.destroy();
    });
  try {
    await client.login(c.token);
  } catch {
    client.destroy();
    throw new Error(
      "Login failed. Reset token/check network. / Giriş başarısız; tokenı ve ağı kontrol edin.",
    );
  }
}
main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Startup failed.");
  process.exitCode = 1;
});
