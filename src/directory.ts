export type Language = "en" | "tr";
export type Resource = { name: string; url: string; note: string };
export type Directory = {
  title: string;
  language: Language;
  resources: Resource[];
};

export class InputError extends Error {}

export function plain(value: string, max: number): string {
  const text = value.trim();
  // Keep the public wire format unambiguous and prevent deceptive formatting.
  if (!text || text.length > max || /[\p{Cc}\p{Cf}<>@`*_~[\]\\|]/u.test(text)) {
    throw new InputError(
      "Use plain text without mentions/formatting. / Biçimsiz, etiketsiz metin kullanın.",
    );
  }
  return text;
}

export function httpsUrl(value: string): string {
  const text = value.trim();
  if (
    text.length > 250 ||
    !/^https:\/\//i.test(text) ||
    /[\s<>|\\\p{Cc}\p{Cf}]/u.test(text)
  ) {
    throw new InputError(
      "Use an HTTPS URL of at most 250 characters. / En fazla 250 karakterlik HTTPS adresi kullanın.",
    );
  }
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    throw new InputError("Invalid URL. / Geçersiz adres.");
  }
  // No fetching takes place. This is a conservative syntax filter, not a safety verdict.
  const host = url.hostname;
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/.test(host) ||
    host
      .split(".")
      .some((part) => part.length > 63 || part.startsWith("xn--")) ||
    /(?:^|\.)(?:localhost|local|internal|invalid|test|example|onion)$/.test(
      host,
    )
  ) {
    throw new InputError(
      "Use a public DNS name, without login, IP address, IDN or custom port. / Giriş bilgisi, IP, IDN veya özel port içermeyen genel DNS adresi kullanın.",
    );
  }
  const canonical = url.href;
  if (canonical.length > 250)
    throw new InputError(
      "URL too long after normalization. / Adres normalleştirilince çok uzun.",
    );
  return canonical;
}

export function parseForm(
  title: string,
  lines: string,
  language: Language,
): Directory {
  if (lines.length > 1600)
    throw new InputError("Resource list too long. / Kaynak listesi çok uzun.");
  const resources = lines
    .trim()
    .split(/\r?\n/)
    .map((line) => {
      const parts = line.split("|");
      if (parts.length !== 3)
        throw new InputError(
          "Each line: Name | HTTPS URL | Note. / Her satır: Ad | HTTPS adresi | Not.",
        );
      return {
        name: plain(parts[0] ?? "", 40),
        url: httpsUrl(parts[1] ?? ""),
        note: plain(parts[2] ?? "", 80),
      };
    });
  if (resources.length < 2 || resources.length > 4)
    throw new InputError("Add 2–4 resources. / 2–4 kaynak ekleyin.");
  if (
    new Set(resources.map((r) => r.name.toLocaleLowerCase("en"))).size !==
      resources.length ||
    new Set(resources.map((r) => r.url)).size !== resources.length
  ) {
    throw new InputError(
      "Use distinct names and URLs. / Adlar ve adresler farklı olmalı.",
    );
  }
  const directory = { title: plain(title, 60), language, resources };
  if (renderDirectory(directory).length > 1850)
    throw new InputError(
      "Directory too long; shorten notes or URLs. / Notları veya adresleri kısaltın.",
    );
  return directory;
}

export function renderDirectory(directory: Directory): string {
  return [
    `LinkNest v1 [${directory.language}]`,
    directory.title,
    ...directory.resources.map(
      (r, i) => `${i + 1}. ${r.name}\n<${r.url}>\n${r.note}`,
    ),
    directory.language === "tr"
      ? "Kaynak seçin • Bağlantıları yönetici seçti; güvenlik doğrulaması yapılmadı."
      : "Choose a resource • Links selected by a manager; safety not verified.",
  ].join("\n\n");
}

// Only canonical bot-authored messages are accepted; malformed/edited cards fail closed.
export function readDirectory(content: string): Directory {
  if (content.length > 1850) throw new InputError("Invalid card.");
  const blocks = content.split("\n\n");
  const match = /^LinkNest v1 \[(en|tr)\]$/.exec(blocks[0] ?? "");
  if (!match) throw new InputError("Invalid card.");
  const language = match[1] as Language;
  const lines = blocks
    .slice(2, -1)
    .map((block, i) => {
      const found = new RegExp(
        `^${i + 1}\\. ([^\\n]+)\\n<([^\\n]+)>\\n([^\\n]+)$`,
      ).exec(block);
      if (!found) throw new InputError("Invalid card.");
      return `${found[1]} | ${found[2]} | ${found[3]}`;
    })
    .join("\n");
  const directory = parseForm(blocks[1] ?? "", lines, language);
  if (renderDirectory(directory) !== content)
    throw new InputError("Invalid card.");
  return directory;
}
