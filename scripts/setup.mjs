import { existsSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";

function hiddenToken() {
  return new Promise((resolve, reject) => {
    let token = "";
    process.stdout.write("Bot token (hidden / gizli): ");
    process.stdin.setRawMode(true);
    process.stdin.resume();
    const finish = () => {
      process.stdin.off("data", onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
    };
    const onData = (chunk) => {
      for (const char of chunk.toString()) {
        if (char === "\u0003" || char === "\u0004") {
          finish();
          reject(new Error("Cancelled"));
          return;
        }
        if (char === "\r" || char === "\n") {
          finish();
          resolve(token);
          return;
        }
        if (char === "\u007f" || char === "\b") token = token.slice(0, -1);
        else if (/^[\x21-\x7e]$/.test(char) && token.length < 256)
          token += char;
      }
    };
    process.stdin.on("data", onData);
  });
}

try {
  if (!process.stdin.isTTY || !process.stdout.isTTY)
    throw new Error(
      "Interactive terminal required. / Etkileşimli terminal gerekli.",
    );
  if (existsSync(".env"))
    throw new Error(
      ".env already exists; keep it safe. To reconfigure, remove it yourself first. / .env mevcut; koruyun. Yeniden yapılandırmak için önce kendiniz silin.",
    );
  const input = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  let applicationId;
  let guildId;
  try {
    applicationId = (
      await input.question("Application ID / Uygulama ID: ")
    ).trim();
    guildId = (await input.question("Server ID / Sunucu ID: ")).trim();
  } finally {
    input.close();
  }
  if (!/^\d{17,20}$/.test(applicationId) || !/^\d{17,20}$/.test(guildId))
    throw new Error("Invalid IDs. / Geçersiz ID.");
  const token = await hiddenToken();
  if (token.length < 20 || /\s/.test(token))
    throw new Error("Invalid token format. / Token biçimi geçersiz.");
  writeFileSync(
    ".env",
    `DISCORD_TOKEN=${token}\nDISCORD_APPLICATION_ID=${applicationId}\nDISCORD_GUILD_ID=${guildId}\n`,
    { mode: 0o600, flag: "wx" },
  );
  console.log(
    "Saved local .env. Next: npm run register, then npm start. / Yerel .env kaydedildi. Sonra: npm run register, ardından npm start.",
  );
} catch (error) {
  console.error(
    error instanceof Error && error.code === undefined
      ? error.message
      : "Setup could not save .env. / Kurulum .env kaydedemedi.",
  );
  process.exitCode = 1;
}
