import { existsSync } from "node:fs";

export function config(env: NodeJS.ProcessEnv = process.env) {
  const token = env.DISCORD_TOKEN ?? "";
  const applicationId = env.DISCORD_APPLICATION_ID ?? "";
  const guildId = env.DISCORD_GUILD_ID ?? "";
  if (
    token.length < 20 ||
    /\s/.test(token) ||
    !/^\d{17,20}$/.test(applicationId) ||
    !/^\d{17,20}$/.test(guildId)
  ) {
    throw new Error(
      "Configuration missing/invalid. Run npm run setup. / Yapılandırma eksik/geçersiz; npm run setup çalıştırın.",
    );
  }
  return { token, applicationId, guildId };
}

export function loadConfig() {
  if (existsSync(".env")) process.loadEnvFile(".env");
  return config();
}
