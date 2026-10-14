import { randomUUID } from "node:crypto";
import {
  ChannelType,
  type Interaction,
  MessageFlags,
  PermissionFlagsBits,
} from "discord.js";
import {
  type Directory,
  InputError,
  parseForm,
  readDirectory,
} from "./directory.js";
import {
  modal,
  noMentions,
  preview,
  publicCard,
  resourceCard,
} from "./views.js";

type Draft = {
  owner: string;
  guild: string;
  channel: string;
  expires: number;
  directory: Directory;
};
export class LinkNest {
  readonly drafts = new Map<string, Draft>();
  readonly cooldowns = new Map<string, number>();
  readonly publishing = new Set<string>();
  constructor(
    readonly guildId: string,
    readonly now: () => number = Date.now,
  ) {}

  sweep() {
    const now = this.now();
    for (const [id, draft] of this.drafts)
      if (draft.expires <= now) this.drafts.delete(id);
    for (const [id, until] of this.cooldowns)
      if (until <= now) this.cooldowns.delete(id);
  }

  async handle(i: Interaction) {
    if (!i.isRepliable()) return;
    if (
      i.isChatInputCommand()
        ? i.commandName !== "linknest"
        : !("customId" in i && i.customId.startsWith("ln:"))
    )
      return;
    this.sweep();
    const tell = (content: string) =>
      i.reply({
        content,
        flags: MessageFlags.Ephemeral,
        allowedMentions: noMentions,
      });
    try {
      if (
        !i.inGuild() ||
        i.guildId !== this.guildId ||
        i.channel?.type !== ChannelType.GuildText
      ) {
        await tell(
          "Use a normal text channel in the configured server. / Yapılandırılan sunucuda normal metin kanalı kullanın.",
        );
        return;
      }
      if (i.isStringSelectMenu() && i.customId === "ln:choose:v1") {
        if (
          i.message.author.id !== i.client.user?.id ||
          i.message.webhookId ||
          i.message.channelId !== i.channelId ||
          i.message.guildId !== i.guildId ||
          i.message.flags.has(MessageFlags.Ephemeral)
        ) {
          await tell(
            "This is not an original LinkNest card. / Özgün LinkNest kartı değil.",
          );
          return;
        }
        const directory = readDirectory(i.message.content);
        if (i.values.length !== 1 || !/^[0-3]$/.test(i.values[0] ?? ""))
          throw new InputError("Invalid selection. / Geçersiz seçim.");
        const resource = directory.resources[Number(i.values[0])];
        if (!resource)
          throw new InputError("Invalid selection. / Geçersiz seçim.");
        const key = `read:${i.user.id}`;
        if ((this.cooldowns.get(key) ?? 0) > this.now()) {
          await tell("Wait two seconds. / İki saniye bekleyin.");
          return;
        }
        if (this.cooldowns.size >= 2000) {
          await tell("Busy; retry shortly. / Yoğun; biraz sonra deneyin.");
          return;
        }
        this.cooldowns.set(key, this.now() + 2000);
        await i.reply({
          ...resourceCard(resource, directory.language),
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      if (!i.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
        await tell(
          "Manage Server permission is required. / Sunucuyu Yönet izni gerekli.",
        );
        return;
      }
      if (
        !i.appPermissions?.has([
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
        ])
      ) {
        await tell(
          "Bot needs View Channel and Send Messages here. / Botun burada Kanalı Gör ve Mesaj Gönder izinleri gerekli.",
        );
        return;
      }
      if (i.isChatInputCommand()) {
        const key = `form:${i.user.id}`;
        if (
          (this.cooldowns.get(key) ?? 0) > this.now() ||
          this.cooldowns.size >= 2000
        ) {
          await tell(
            "Wait ten seconds and retry. / On saniye bekleyip deneyin.",
          );
          return;
        }
        this.cooldowns.set(key, this.now() + 10_000);
        await i.showModal(modal(i.locale === "tr" ? "tr" : "en"));
        return;
      }
      if (i.isModalSubmit() && /^ln:form:(en|tr)$/.test(i.customId)) {
        const directory = parseForm(
          i.fields.getTextInputValue("title"),
          i.fields.getTextInputValue("resources"),
          i.customId.endsWith(":tr") ? "tr" : "en",
        );
        if (this.drafts.size >= 100) {
          await tell(
            "Preview limit reached; retry in ten minutes. / Önizleme sınırı; on dakika sonra deneyin.",
          );
          return;
        }
        for (const [id, draft] of this.drafts)
          if (draft.owner === i.user.id) this.drafts.delete(id);
        const id = randomUUID();
        this.drafts.set(id, {
          owner: i.user.id,
          guild: i.guildId,
          channel: i.channel.id,
          expires: this.now() + 600_000,
          directory,
        });
        try {
          await i.reply({
            ...preview(directory, id),
            flags: MessageFlags.Ephemeral,
          });
        } catch (error) {
          this.drafts.delete(id);
          throw error;
        }
        return;
      }
      if (i.isButton()) {
        const match = /^ln:(publish|cancel):([a-f0-9-]{36})$/.exec(i.customId);
        const id = match?.[2] ?? "";
        const draft = this.drafts.get(id);
        if (
          !draft ||
          draft.owner !== i.user.id ||
          draft.guild !== i.guildId ||
          draft.channel !== i.channelId ||
          !i.message.flags.has(MessageFlags.Ephemeral) ||
          i.message.author.id !== i.client.user?.id
        ) {
          await tell(
            "Preview expired or belongs elsewhere; run /linknest. / Önizleme süresi doldu veya size ait değil; /linknest kullanın.",
          );
          return;
        }
        if (match?.[1] === "cancel") {
          this.drafts.delete(id);
          await i.update({
            content: "Cancelled. / Vazgeçildi.",
            components: [],
            allowedMentions: noMentions,
          });
          return;
        }
        const key = `publish:${i.guildId}`;
        if (
          this.publishing.has(i.guildId) ||
          (this.cooldowns.get(key) ?? 0) > this.now()
        ) {
          await tell(
            "One publication per server per minute; retry later. / Sunucu başına dakikada bir yayın; sonra deneyin.",
          );
          return;
        }
        // Reserve synchronously before any await to prevent duplicate sends.
        this.publishing.add(i.guildId);
        this.drafts.delete(id);
        this.cooldowns.set(key, this.now() + 60_000);
        try {
          await i.deferUpdate();
          await i.channel.send(publicCard(draft.directory));
          await i.editReply({
            content: "Published here. / Bu kanalda yayımlandı.",
            components: [],
            allowedMentions: noMentions,
          });
        } catch {
          if (i.deferred)
            await i
              .editReply({
                content:
                  "Could not confirm publication. Check the channel before recreating; no automatic retry. / Yayın doğrulanamadı. Yeniden oluşturmadan kanalı kontrol edin; otomatik tekrar yok.",
                components: [],
                allowedMentions: noMentions,
              })
              .catch(() => {});
          else
            await tell(
              "Request failed; check the channel before recreating. / İstek başarısız; yeniden oluşturmadan kanalı kontrol edin.",
            );
        } finally {
          this.publishing.delete(i.guildId);
        }
        return;
      }
      await tell(
        "Unsupported control; run /linknest. / Desteklenmeyen kontrol; /linknest kullanın.",
      );
    } catch (error) {
      const content =
        error instanceof InputError
          ? error.message
          : "Request failed; check bot permissions and retry. / İstek başarısız; bot izinlerini kontrol edip deneyin.";
      // Never log interaction contents, tokens, user IDs or raw API errors.
      if (i.replied || i.deferred)
        await i
          .followUp({
            content,
            flags: MessageFlags.Ephemeral,
            allowedMentions: noMentions,
          })
          .catch(() => {});
      else await tell(content).catch(() => {});
    }
  }
}
