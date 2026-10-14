import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  LabelBuilder,
  ModalBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import type { Directory, Language, Resource } from "./directory.js";
import { renderDirectory } from "./directory.js";

export const command = new SlashCommandBuilder()
  .setName("linknest")
  .setDescription("Preview a community resource directory")
  .setDescriptionLocalizations({ tr: "Topluluk kaynak dizinini önizle" })
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export const words = (language: Language, en: string, tr: string) =>
  language === "tr" ? tr : en;
export const noMentions = { parse: [] as [], repliedUser: false };

export function modal(language: Language) {
  return new ModalBuilder()
    .setCustomId(`ln:form:${language}`)
    .setTitle("LinkNest")
    .addLabelComponents(
      new LabelBuilder()
        .setLabel(words(language, "Directory title", "Dizin başlığı"))
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("title")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(60),
        ),
      new LabelBuilder()
        .setLabel(
          words(
            language,
            "2–4 resources, one per line",
            "2–4 kaynak, her satırda bir tane",
          ),
        )
        .setDescription(
          words(
            language,
            "Name | HTTPS URL | Short note",
            "Ad | HTTPS adresi | Kısa not",
          ),
        )
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("resources")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1500)
            .setPlaceholder(
              "Docs | https://discord.com/developers | Official documentation",
            ),
        ),
    );
}

export function preview(directory: Directory, id: string) {
  return {
    content: `${words(directory.language, "PRIVATE PREVIEW — all links and notes will be public in this channel.", "ÖZEL ÖNİZLEME — tüm adres ve notlar bu kanalda herkese açık olacak.")}\n\n${renderDirectory(directory)}`,
    allowedMentions: noMentions,
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`ln:publish:${id}`)
          .setLabel(words(directory.language, "Publish", "Yayımla"))
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`ln:cancel:${id}`)
          .setLabel(words(directory.language, "Cancel", "Vazgeç"))
          .setStyle(ButtonStyle.Secondary),
      ),
    ],
  };
}

export function publicCard(directory: Directory) {
  return {
    content: renderDirectory(directory),
    allowedMentions: noMentions,
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("ln:choose:v1")
          .setPlaceholder(
            words(directory.language, "Choose a resource", "Kaynak seçin"),
          )
          .setMinValues(1)
          .setMaxValues(1)
          .addOptions(
            directory.resources.map((r, index) => ({
              label: r.name,
              description: r.note,
              value: String(index),
            })),
          ),
      ),
    ],
  };
}

export function resourceCard(resource: Resource, language: Language) {
  return {
    content: `${resource.name}\n${resource.note}\n\n<${resource.url}>\n\n${words(language, "External site; verify the domain before opening. No click tracking by this bot.", "Dış site; açmadan önce alan adını kontrol edin. Bot tıklamaları izlemez.")}`,
    allowedMentions: noMentions,
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setURL(resource.url)
          .setLabel(words(language, "Open resource", "Kaynağı aç")),
      ),
    ],
  };
}
