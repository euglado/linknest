import { REST, Routes } from "discord.js";
import { loadConfig } from "./config.js";
import { command } from "./views.js";

try {
  const settings = loadConfig();
  const rest = new REST({ version: "10" }).setToken(settings.token);
  // POST upserts just this command, preserving other application guild commands.
  await rest.post(
    Routes.applicationGuildCommands(settings.applicationId, settings.guildId),
    { body: command.toJSON() },
  );
  console.log(
    "/linknest registered in configured server. / /linknest yapılandırılan sunucuya kaydedildi.",
  );
} catch {
  console.error(
    "Cannot register. Run npm run setup; verify IDs, bot install and network. / Kaydedilemedi. npm run setup; ID, bot kurulumu ve ağı kontrol edin.",
  );
  process.exitCode = 1;
}
