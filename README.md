# LinkNest

[Türkçe](#türkçe) · [English](#english) · [MIT license](LICENSE)

Discord toplulukları için önizlemeli kaynak dizinleri. / Previewed resource directories for Discord communities.

## Türkçe

### Amaç ve özellikler

Yeni üyelerin sık sorulan kaynaklara ulaşmasını kolaylaştırır: ders belgeleri, erişilebilirlik rehberleri, topluluk kuralları veya resmi proje bağlantıları. Gerçek bir Discord Gateway botudur; çalışması için kendi Discord uygulamanız ve açık kalan bir bilgisayar/sunucu gerekir.

- **Sunucuyu Yönet** yetkisi olan kişi `/linknest` ile başlık ve 2–4 kaynak girer. Her kaynakta ad, HTTPS adresi ve kısa açıklama vardır.
- Formdan sonra yalnızca hazırlayanın gördüğü **özel önizleme** çıkar. **Yayımla** açıkça seçilmeden kanala hiçbir şey gönderilmez. **Vazgeç** önizlemeyi iptal eder.
- Yayımlanan dizindeki seçme menüsünden herkes kaynak seçebilir. Seçen üyeye özel yanıt; kaynak adı, açıklama, açık adres ve **Kaynağı aç** düğmesini gösterir.
- Başlık, kaynaklar ve uyarı normal metin olarak da görünür. Yalnızca renk veya emojiyle bilgi verilmez. Discord diliniz Türkçeyse form ve yeni kart Türkçe olur; diğer dillerde İngilizce olur.
- Yayımlanan kartlar botun kendi Discord mesajındaki içerikten okunur. Bot aynı uygulama ve sunucuyla yeniden başlatıldığında eski özgün kartlar yeniden çalışır; veritabanı gerekmez.

**Yapmadıkları:** web sayfalarını ziyaret etmez, adreslerin güvenli/erişilebilir olduğunu doğrulamaz, yönlendirmeleri incelemez, mesaj geçmişi okumaz, üyeleri izlemez, tıklama saymaz, DM göndermez, rol/kanal oluşturmaz, moderasyon veya müzik yayını yapmaz. Dizin düzenleme, arama, otomatik güncelleme ve otomatik sabitleme yoktur. Kaynakların seçimi ve güncel tutulması yöneticinin sorumluluğudur.

### Gereksinimler

- [Node.js](https://nodejs.org/) **24.x LTS** ve beraberindeki npm; Windows, macOS veya Linux.
- Bir Discord hesabı, sunucunuza uygulama ekleme yetkisi ve [Developer Portal](https://discord.com/developers/applications) erişimi.
- Çalışırken Discord API ve Gateway bağlantısına izin veren internet. Dış kaynak sitelerine bot tarafından bağlantı kurulmaz.
- Tek süreç, tek yapılandırılmış sunucu. Birden fazla sunucu için ayrı uygulama/kurulum kullanın. Bu sürüm yatay ölçekleme yapmaz.

### Baştan sona kurulum

1. Developer Portal'da **New Application** ile uygulama oluşturun; **General Information → Application ID** değerini alın. Bu, sunucu ID'sinden farklıdır.
2. **Bot** sayfasını açın; gerekirse bot ekleyin, **Reset Token** ile token oluşturun. Token parola gibidir: hiçbir kişiye, sohbete, ekran görüntüsüne, issue'ya veya GitHub'a göndermeyin. Sızarsa Portal'da hemen sıfırlayın, botu yeni tokenla yeniden yapılandırın.
3. **Privileged Gateway Intents** altındaki Presence, Server Members ve Message Content seçeneklerini **kapalı** bırakın. Bot yalnızca ayrıcalıksız `Guilds` intent kullanır. HTTP Interactions Endpoint URL girmeyin; bot etkileşimleri Gateway üzerinden alır.
4. **Installation** altında **Guild Install** kullanın, **User Install** seçeneğini kapatın. Install Link için Discord Provided Link seçin. Sunucu kurulumu kapsamları **bot** ve **applications.commands**; bot izinleri yalnızca **View Channels** ve **Send Messages** olsun. Arayüz adları değişirse aynı kapsam/izin değerlerini seçin. **Administrator** vermeyin.
5. Oluşan kurulum bağlantısını açıp kendi sunucunuzu seçin. Bot bir uygulama dizini/halka açık servis olarak barındırılmaz; bu depo kaynak dağıtımıdır. Başkalarının sizin uygulamanızı yüklemesini istemiyorsanız uygulama ayarlarını buna göre sınırlandırın.
6. Discord **User Settings → Advanced → Developer Mode** seçeneğini açın. Sunucu simgesine sağ tıklayıp **Copy Server ID** alın.
7. Bu depoda **Code → Download ZIP** seçin ve ZIP'i tamamen çıkarın; GitHub üzerinden kodu incelemek de mümkündür. Token içeren kurulum klasörünü ortak/paylaşılan veya buluta eşitlenen bir klasöre koymayın. Kaynak dosyalarını düzenlemeniz gerekmez.
8. Node.js 24 kurulduktan sonra Windows'ta çıkarılan klasörde **setup.cmd** dosyasını açın. macOS/Linux'ta Terminal'i klasörde açıp `bash setup.sh` çalıştırın. Yardımcı; kilitli bağımlılıkları kurar, derler, yapılandırır ve komutu kaydeder. macOS'ta dosyaya çift tıklamak yerine Terminal kullanın.
9. İstendiğinde Application ID ve Server ID değerlerini girin; tokenı terminaldeki **gizli** alana yapıştırıp Enter'a basın. Token yazılırken/yapıştırılırken karakter veya yıldız gösterilmez. Kurulum yerel `.env` dosyasını oluşturur. Aynı dosyayı tekrar yazmaz; yeniden yapılandırma için botu durdurun, eski `.env` dosyasını kendiniz kaldırın ve `npm run setup` çalıştırın, ardından komutu tekrar kaydedin. Token gerekirse önce Portal'da sıfırlanmalıdır.
10. Windows'ta **start.cmd**, macOS/Linux'ta `bash start.sh` ile çalıştırın. **LinkNest hazır** mesajından sonra Discord'da normal bir metin kanalında `/linknest` deneyin. Terminali kapatmak veya bilgisayarı uyutmak botu çevrimdışı bırakır. Durdurmak için Ctrl+C kullanın.

Terminal yolunu tercih edenler için (Windows PowerShell `npm.ps1` engelliyorsa `npm` yerine `npm.cmd` kullanın; yürütme politikasını değiştirmeniz gerekmez):

```sh
npm ci --ignore-scripts
npm run build
npm run setup
npm run register
npm start
```

Yapılandırma değerleri `.env` veya barındırma sağlayıcınızın gizli ortam değişkenlerinden okunur: `DISCORD_TOKEN`, `DISCORD_APPLICATION_ID`, `DISCORD_GUILD_ID`. `.env.example` yalnızca boş bir örnektir. **register** yalnızca bu sunucudaki `/linknest` komutunu oluşturur/günceller; diğer komutları topluca silmez. ID, uygulama veya sunucu değiştiğinde yeniden kaydedin. Silinen komutlar/kartlar otomatik geri yüklenmez.

### Kullanım ve sınırlar

Sunucuyu Yönet yetkili bir yönetici `/linknest` yazsın. Örnek başlık: `Geliştirici kaynakları`. Kaynak alanına her satırda bir kayıt girin; `|` ayıracı zorunludur:

```text
Discord belgeleri | https://discord.com/developers | Resmi geliştirme belgeleri
Node.js | https://nodejs.org | Çalışma ortamı ve kurulum
```

Başlık en fazla 60, kaynak adı 40, not 80 ve adres 250 karakterdir. Formdaki kaynak listesi en fazla 1500 karakter; 2–4 farklı ad ve farklı adres gerekir. Etiketler, markdown, görünmez kontrol karakterleri ve satır içine gömülü ayraçlar kabul edilmez. Adresler yalnızca HTTPS, genel DNS adı ve standart port olabilir; IP, yerel/özel isimler, giriş bilgisi, Unicode/IDN/punycode alan adları ve özel portlar desteklenmez. **Bu filtre site güvenliği kanıtı değildir:** DNS genel görünen bir adı özel adrese yönlendirebilir, sayfa yönlendirebilir veya içeriği sonradan değişebilir. Kısaltılmış adres yerine doğrudan resmi kaynağı kullanın. URL sorgusu veya parçasına token/kişisel bilgi koymayın; adresin tamamı yayımlanır.

Önizlemeyi ve kanalın kimlere açık olduğunu kontrol edin, sonra **Yayımla** seçin. Her kaynak için menüye tıklayarak üyeye özel kartı inceleyin. Dış siteye geçmeden gerçek alan adını kontrol edin; bu bot bağlantıları onaylamaz. Ekran okuyucu, mobil istemci ve gizli token girişi gerçek kurulumda ayrıca doğrulanmalıdır.

- Önizleme 10 dakika geçerlidir; kişi başına yeni önizleme eskisini geçersiz kılar. En fazla 100 bekleyen önizleme tutulur.
- Form açma aralığı kişi başına 10 saniye; kaynak okuma aralığı 2 saniye; yayın sunucu başına dakikada birdir. Bekleme verileri yaklaşık her dakika temizlenir; önizlemeler her istekte de temizlenir. Kısa süreli bekleme tablosu yaklaşık 2000 kayıtla sınırlıdır.
- Normal sunucu metin kanalları desteklenir; DM, thread, forum ve duyuru kanalları desteklenmez.
- İzni kaybeden yönetici eski önizlemeyi yayımlayamaz. Gönderim hatası otomatik tekrarlanmaz: yanıt kaybolsa bile kart gönderilmiş olabilir; yeniden oluşturmadan önce kanalı kontrol edin.
- Yeniden başlatma bekleyen önizlemeleri ve bekleme sürelerini siler. Yayımlanan kartlar Discord'da kalır. Aynı bot uygulamasıyla aynı sunucuda çalışırken menüleri yeniden kullanılabilir. Token sıfırlama uygulama kimliğini değiştirmez; farklı uygulamaya geçmek eski kartları taşımaz.
- Bir dizini değiştirmek/kaldırmak için yönetici Discord'da eski bot mesajını kendi yetkisiyle silip yenisini oluşturur. Bot mesajı kendisi sabitlemez veya silmez. Kartı sabitlemek isterseniz Discord'un normal yönetici işlemini kullanın.

### İzinler

Bot: **View Channel (1024)** + **Send Messages (2048)**, toplam **3072**. Kanal izinlerini ayrıca kontrol edin. Botun Read Message History, Embed Links, Manage Messages, Manage Channels, Manage Roles, Administrator, ses veya ayrıcalıklı intent ihtiyacı yoktur. Bot yayımlamak için normal kanal mesajı gönderir; üyeler kaynak seçtiğinde kendisine gelen etkileşimdeki kendi mesajını okur.

Yönetici: oluşturma ve yayımlamada **Manage Server / Sunucuyu Yönet**. Üye: normal kanal erişimi ve **Use Application Commands**; kaynak seçmek yönetim yetkisi gerektirmez. Discord komut izinlerini değiştirebilse de bot çalışma anında yönetici iznini tekrar kontrol eder. Sunucu sahipliği/Administrator Discord'un izin davranışlarına tabidir.

### Güvenlik, gizlilik ve veriler

- Her dizin başlığı, notu ve tam adresi **herkese açık kanal mesajıdır**. “Özel önizleme” veya “özel kaynak yanıtı” kaynakların gizli olduğu anlamına gelmez. Discord ve kanal erişimi olan kişiler bu içeriği görür/saklayabilir.
- Botun veritabanı, analitiği, tıklama kaydı, reklamı veya telemetrisi yoktur. Kaynak düğmesi doğrudan dış siteye gider; bot bu tıklamayı almaz. Dış site ve Discord kendi veri politikalarına tabidir.
- Bot RAM'de geçici olarak önizleme içeriği, hazırlayan üye/sunucu/kanal kimlikleri ve süre sınırlarını tutar. Bekleme tablosunda kısa süreli üye kimlikleri vardır; temizlenince/restart sonrası kaybolur. Operatör belleği inceleyebilir; bu gizli kasa değildir.
- Yayımlanan kartlar Discord'un saklama düzenine tabidir. Silmek için Discord mesajını kaldırın; kopyalar/Discord saklaması botun denetimi dışındadır. Sunucudan botu çıkarmak eski mesajları otomatik silmez.
- Yanıtlarda mention izinleri kapalıdır; normal dış bağlantı önizlemeleri açı ayraçlarıyla bastırılır. Hata günlükleri ham Discord yanıtlarını, tokenı, etkileşim metnini veya kullanıcı kimliklerini yazmaz. Barındırma sağlayıcısının günlük/erişim ayarları ayrıca incelenmelidir.
- `.env` Git tarafından yok sayılır. Unix'te yeni dosya izinleri `0600` istenir; Windows'ta NTFS klasör erişimini ayrıca kendi hesabınızla sınırlandırın. Ignore kuralları güvenlik kasası değildir. Repo/bot klasörünü, tokenlı dosyayı, yedekleri veya ekranınızı paylaşırken dikkat edin.
- Sadece kendi yönetebildiğiniz uygulama ve sunucularda kullanın. Spam veya zararlı bağlantı dağıtmayın; [Discord Developer Policy](https://support-dev.discord.com/hc/en-us/articles/8563934450327-Discord-Developer-Policy) ve sunucu kurallarına uyun.

### Botu çalışır tutma

Kendi bilgisayarınız test için uygundur; 7/24 kullanım için Node.js 24 destekli güvenilir bir barındırıcı/VPS gerekir. Tek süreç çalıştırın, çalışma klasörünü proje klasörü seçin, önce `npm ci --ignore-scripts` ve `npm run build` çalıştırın, başlangıç komutu `npm start` olsun. Gizli ortam değişkenlerini sağlayıcının paneline girin; `.env` dosyasını GitHub'a yüklemeyin. Ağın Discord HTTPS/WebSocket erişimine izin verdiğini doğrulayın. Sağlayıcınızın yeniden başlatma/sağlık ayarlarını kendi talimatlarına göre kullanın; burada bir üretim servisi kurulmaz. Güncellemeden önce işlemi durdurun, `.env` dosyanızı özel olarak koruyun, yeni kaynak/kilit dosyasıyla kurulum/derleme/testi tekrarlayın, aynı uygulama ve sunucu değerleriyle başlatın.

### Sorun giderme

- **node/npm bulunamadı:** Node.js 24 kurun ve terminali yeniden açın. ZIP'i tamamen çıkardığınızdan emin olun.
- **Cannot start/register:** yapılandırmayı, Application ID/Server ID ayrımını, Portal tokenını ve ağı kontrol edin; ham tokenı destek mesajına koymayın. `npm run register` tekrar denenebilir.
- **Komut görünmüyor:** doğru sunucuda kayıt yapıldığını, kurulum kapsamlarını, Discord komut izinlerini kontrol edin; Discord'u yeniden yükleyin. Manage Server yetkisiz kişilere varsayılan olarak görünmez.
- **Bot çevrimdışı:** `start.cmd`/`bash start.sh` açık mı, bilgisayar uyuyor mu, token iptal mi? Tek süreç kullanın; Portal'da uygulama ID'sini doğrulayın.
- **İzin hatası:** kanal override'larında bot için View Channel ve Send Messages açık olmalı; Administrator vermek çözüm değildir. Normal metin kanalı kullanın.
- **Form reddedildi:** her satır `Ad | https://adres | Not` biçiminde, 2–4 farklı kaynak ve düz metin olmalı. Kaynak alanındaki tüm adresler ve notlar yayımlanır.
- **Önizleme süresi doldu/yoğun:** bekleyin; `/linknest` ile yeni önizleme alın. Yayımlanan kart var mı önce kontrol edin.
- **Eski kart açılmıyor:** aynı bot uygulaması doğru sunucuda çevrimiçi olmalı, kart kendi özgün mesajı olmalı. Elle değiştirilmiş/bozuk kartlar reddedilir. Menü yerine düz adresleri kullanabilirsiniz; gerekirse yönetici kartı yeniden yayımlasın.
- **Kaynak site açılmıyor:** bot siteyi ziyaret etmez; bağlantıyı yöneticiye bildirin. HTTPS kabul edilmesi sitenin güvenli veya çalışır olduğu anlamına gelmez.

### Testler, katkı ve lisans

```sh
npm ci --ignore-scripts
npm run check
npm audit --audit-level=low
node --check scripts/setup.mjs
node --check scripts/check-supply.mjs
bash -n setup.sh start.sh
```

`check`; Biome önerilen lint/biçim kuralları, strict TypeScript derlemesi, Node testleri ve kilit dosyasındaki bağımlılık lisans/kaynak/SHA-512 bütünlük ve kaynak gizli bilgi desen kontrollerini çalıştırır. Bunları token içermeyen temiz kaynak kopyasında çalıştırın; `.env` bulunan kurulmuş klasörde kaynak taraması kasıtlı olarak durur. Desen taraması tam güvenlik denetimi değildir. GitHub Actions bu kontrolleri Ubuntu, Windows ve macOS Intel üzerinde, salt okunur depo yetkisiyle çalıştırır. Testler Discord etkileşimlerini taklit eder; canlı token/sunucu, gizli giriş ve ekran okuyucu davranışını kanıtlamaz. İlk gerçek sunucunuzda önizleme, vazgeçme, yayın, yetkisiz yayın reddi, kaynak seçimi ve yeniden başlatma akışlarını kendiniz doğrulayın. Bot test için ayrı test sunucusunda çalıştırılabilir; bu depoda token yoktur.

Hata ve iyileştirme önerileri için issue/PR açın; kişisel veri, gerçek sunucu içeriği veya token eklemeyin. [CONTRIBUTING.md](CONTRIBUTING.md) ve [SECURITY.md](SECURITY.md) belgelerine bakın. MIT lisansı [LICENSE](LICENSE) dosyasındadır. Bağımlılıklar kendi lisanslarına tabidir.

## English

### Purpose and features

LinkNest helps new members find community resources such as study documentation, accessibility guides, rules, and official project sites. It is a real Discord Gateway bot. You run your own Discord application on a computer or host that stays online.

- A member with **Manage Server** opens `/linknest`, enters a title and 2–4 named HTTPS resources with short notes.
- The bot shows a **private preview**. Nothing is posted until the manager explicitly clicks **Publish**; **Cancel** discards the preview.
- The public directory includes readable text and a resource select menu. Choosing a resource gives that member a private reply containing the name, note, visible URL and **Open resource** link button.
- Labels and instructions communicate meaning without relying on color or emoji. A Turkish Discord locale produces Turkish forms/new cards; other locales use English.
- Published cards reconstruct their directory from the bot's own Discord message. They work after restarting with the same application and server, without a database.

It does **not** fetch websites, verify safety/availability, inspect redirects, read message history, track members/clicks, send DMs, manage roles/channels, moderate, or stream music. There is no directory editing/search, automatic updating, or automatic pinning. Managers curate and maintain resources.

### Requirements

[Node.js 24.x LTS](https://nodejs.org/) with npm on Windows/macOS/Linux; a Discord account with server app-install permission; [Developer Portal](https://discord.com/developers/applications) access; internet access to Discord HTTPS and Gateway. The bot never connects to resource sites. Run one process for one configured server; use separate apps/installations for other servers. Horizontal scaling is unsupported.

### Complete installation and configuration

1. In Developer Portal create **New Application**. Copy **General Information → Application ID**; this is different from your Server ID.
2. Open **Bot**, add a bot if needed, and generate a token with **Reset Token**. Treat it as a password. Never post it in chat, screenshots, issues, or GitHub. If exposed, reset it in the Portal immediately and reconfigure the stopped bot.
3. Leave all **Privileged Gateway Intents** disabled: Presence, Server Members and Message Content. Only the nonprivileged `Guilds` intent is used. Leave Interactions Endpoint URL empty; interactions arrive through Gateway.
4. Under **Installation**, enable **Guild Install**, disable **User Install**, choose a Discord Provided Link, scopes **bot** and **applications.commands**, and permissions **View Channels** and **Send Messages** only. UI names may change; keep these equivalent scopes/permissions. Do not grant Administrator. Open the link and choose your server. This repository distributes source, rather than a hosted service. Restrict your application's installation settings if other people should not install it.
5. In Discord **User Settings → Advanced** enable **Developer Mode**. Right-click your server icon and copy **Server ID**.
6. Choose **Code → Download ZIP** here and fully extract the ZIP. Install Node.js 24. Keep the eventual token-bearing installation outside shared or cloud-synced folders. You do not need to edit source code.
7. Windows: open **setup.cmd** inside the extracted folder. macOS/Linux: open Terminal in that folder and run `bash setup.sh`. The helper installs locked dependencies, builds, asks for configuration, and registers the command. On macOS use Terminal rather than double-clicking the shell script.
8. Enter Application ID and Server ID. Paste the token at the **hidden** terminal prompt and press Enter; characters/stars are deliberately not displayed. The helper creates a local `.env` and refuses to overwrite it. To reconfigure, stop the bot, personally remove the old `.env`, run `npm run setup`, and register again; reset an exposed token in Portal first.
9. Run **start.cmd** on Windows or `bash start.sh` on macOS/Linux. After **LinkNest ready**, try `/linknest` in a normal server text channel. Keep the terminal open and the computer awake. Ctrl+C stops it.

Manual terminal commands (use `npm.cmd` on Windows if PowerShell blocks `npm.ps1`; no execution-policy change needed):

```sh
npm ci --ignore-scripts
npm run build
npm run setup
npm run register
npm start
```

Configuration comes from `.env` or your host's secret environment variables: `DISCORD_TOKEN`, `DISCORD_APPLICATION_ID`, `DISCORD_GUILD_ID`. `.env.example` contains empty placeholders. Registration upserts only `/linknest` in the configured server, preserving other commands. Register again after changing application/server IDs. Deleted commands/cards are not restored automatically.

### Usage and limits

A manager runs `/linknest` and enters a title such as `Developer resources`. Every resource line must contain three fields separated by `|`:

```text
Discord docs | https://discord.com/developers | Official development documentation
Node.js | https://nodejs.org | Runtime and installation guide
```

Limits: title 60 characters, resource name 40, note 80, URL 250; form resource list 1500 characters; 2–4 distinct names and URLs. Mentions, markdown, hidden control characters and embedded separators are rejected. URLs require HTTPS, a public-looking DNS hostname and standard port. IP addresses, local/private names, credentials, Unicode/IDN/punycode hostnames and custom ports are unsupported. **This is a syntax filter, not a site safety guarantee:** DNS may resolve a public-looking name privately, links can redirect, and sites can change. Prefer direct official links over shorteners. Never put credentials or personal data into URL queries/fragments; the entire URL becomes public.

Review the preview and channel audience, then click **Publish**. Choose each resource to inspect the private resource reply. Verify the real domain before opening external sites. Validate screen-reader/mobile behavior and hidden token entry during live setup; these are not claimed as live-tested.

- Previews expire after ten minutes. A new preview replaces that manager's previous one. At most 100 previews are held.
- Per-person form cooldown: ten seconds; resource-read cooldown: two seconds. Publication: once per server per minute. Temporary cooldown state is capped at approximately 2000 records and cleaned about every minute; requests also clean expired previews/state.
- Normal server text channels only: no DMs, threads, forums or announcement channels.
- Manager and bot permissions are rechecked at publication. Failed/ambiguous sends are not retried automatically; check the channel before recreating a directory.
- Restart discards pending previews/cooldowns. Public Discord messages remain. Their menus reopen with the same bot application in the same configured server. Resetting the token keeps the app identity; migrating to another app does not transfer old cards.
- To change/remove a directory, a manager uses their own Discord permission to delete its old message and creates a new directory. The bot does not delete or pin messages. Use Discord's normal pin action if wanted.

### Permissions

Bot: **View Channel (1024)** + **Send Messages (2048)** = **3072**; check channel overrides too. No Read Message History, Embed Links, Manage Messages, Manage Channels, Manage Roles, Administrator, voice permissions, or privileged intents. Publication uses a normal channel send. Reading uses only the bot's own message supplied with a component interaction.

Managers need **Manage Server** to create/publish, checked at runtime even if command visibility is overridden. Members need normal channel access and **Use Application Commands**, without management permissions to select resources. Discord's owner/Administrator permission semantics apply.

### Security, privacy and data

Every published title, note and full URL is a **public channel message**. Private previews/resource replies do not make the resources secret. Discord and people with channel access can retain them. The bot has no database, analytics, ads, telemetry or click counter. Link buttons open sites directly without sending clicks to this bot; Discord and external sites follow their own data policies.

RAM temporarily contains preview content, creator/server/channel IDs and expiry times, plus member IDs for short cooldowns. Cleanup/restart removes this process state. The operator can inspect RAM; this is not a secret vault. Published cards remain according to Discord's retention behavior. Delete the Discord message to remove a card; copies/Discord retention are outside the bot's control. Removing the bot does not delete its messages.

Mentions are disabled in replies and URLs are angle-bracketed to suppress ordinary previews. Raw API errors, tokens, interaction content and user IDs are not logged by the bot. Separately review host logging/access. `.env` is Git-ignored, with `0600` requested for newly created Unix files. On Windows restrict NTFS folder access to your account; ignore rules are not a credential vault. Keep local configs and backups private.

Use only apps/servers you can administer; avoid spam and harmful links. Follow [Discord Developer Policy](https://support-dev.discord.com/hc/en-us/articles/8563934450327-Discord-Developer-Policy) and server rules.

### Keeping the bot online

Your computer is suitable for a trial. For continuous use, choose a trusted Node.js 24 host/VPS. Run one process with the project as its working directory. Install with `npm ci --ignore-scripts`, build with `npm run build`, then start with `npm start`. Set secrets through the host's secret panel, never GitHub. Allow Discord HTTPS/WebSocket connectivity. Follow the host's restart/health instructions; these helpers do not install a production service. Before updating, stop the process, privately preserve `.env`, install/build/test the updated source/lockfile, then start with the same application/server IDs.

### Troubleshooting

- **node/npm missing:** install Node.js 24 and reopen the terminal; fully extract the download.
- **Cannot start/register:** check the configuration, distinct application/server IDs, current Portal token and network; never include the raw token in support requests. Registration can be retried.
- **Command missing:** check the registration server, installation scopes and Discord command permissions; reload Discord. Non-managers do not see the command by default.
- **Offline:** keep the start helper/terminal running, prevent sleep, check revoked tokens and correct app ID; use one process.
- **Permission error:** allow View Channel and Send Messages in channel overrides; use a normal text channel rather than granting Administrator.
- **Form rejected:** each line needs `Name | https://address | Note`, with 2–4 unique resources and plain text. Every URL/note becomes public.
- **Preview expired/busy:** wait and recreate with `/linknest`; first check whether a public card already appeared.
- **Old card fails:** run the same app in the same server; original bot-authored, unmodified content is required. Malformed cards fail closed. Plain URLs remain usable; a manager can recreate the card.
- **External site fails:** report the address to the directory manager. The bot never fetches it, and HTTPS acceptance does not establish safety or availability.

### Tests, contributions and license

```sh
npm ci --ignore-scripts
npm run check
npm audit --audit-level=low
node --check scripts/setup.mjs
node --check scripts/check-supply.mjs
bash -n setup.sh start.sh
```

`check` runs Biome recommended lint/format rules, strict TypeScript, Node tests, dependency license/registry/SHA-512 integrity checks and source credential-pattern scans. Use a clean source checkout without credentials; the source scan deliberately stops if a local `.env` is present. Pattern scans are not a complete security audit. Read-only GitHub Actions runs these checks on Ubuntu, Windows and macOS Intel. Tests mock Discord interactions: they do not establish live token/server, hidden-entry or screen-reader behavior. In your own test server, verify preview, cancellation, publication, denied unauthorized publication, resource selection and restart recovery before community use. No token is included here.

Issues/PRs are welcome; exclude personal data, real server content and secrets. See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md). Source is [MIT licensed](LICENSE); dependencies retain their licenses.

### Official references / Resmi kaynaklar

[Interactions](https://docs.discord.com/developers/interactions/receiving-and-responding), [component and Label reference](https://docs.discord.com/developers/components/reference), [application commands](https://docs.discord.com/developers/interactions/application-commands), [Gateway](https://docs.discord.com/developers/events/gateway), [permissions](https://docs.discord.com/developers/topics/permissions).
