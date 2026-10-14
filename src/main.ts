import { Client, Events, GatewayIntentBits, Options } from "discord.js";
import { LinkNest } from "./bot.js";
import { loadConfig } from "./config.js";

try {
  const settings = loadConfig();
  const bot = new LinkNest(settings.guildId);
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    allowedMentions: { parse: [] },
    makeCache: Options.cacheWithLimits({
      ...Options.DefaultMakeCacheSettings,
      MessageManager: 0,
    }),
  });
  client.once(Events.ClientReady, (ready) => {
    if (ready.user.id !== settings.applicationId) {
      console.error(
        "Application ID does not match token. / Uygulama ID ile token eşleşmiyor.",
      );
      client.destroy();
      process.exitCode = 1;
      return;
    }
    console.log("LinkNest ready. / LinkNest hazır.");
  });
  client.on(Events.InteractionCreate, (interaction) => {
    void bot.handle(interaction);
  });
  client.on(Events.Error, () =>
    console.error(
      "Discord connection error; check connection. / Discord bağlantı hatası; bağlantıyı kontrol edin.",
    ),
  );
  const cleanup = setInterval(() => bot.sweep(), 60_000);
  cleanup.unref();
  for (const signal of ["SIGINT", "SIGTERM"] as const)
    process.once(signal, () => {
      clearInterval(cleanup);
      client.destroy();
    });
  await client.login(settings.token);
} catch {
  console.error(
    "Cannot start. Run npm run setup; check IDs, token and network. / Başlatılamadı. npm run setup çalıştırın; ID, token ve ağı kontrol edin.",
  );
  process.exitCode = 1;
}
