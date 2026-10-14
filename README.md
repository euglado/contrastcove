# ContrastCove

[Türkçe](#türkçe) · [English](#english) · [Security](SECURITY.md) · [Contributing](CONTRIBUTING.md)

## Türkçe

### Amaç ve özellikler

ContrastCove, tasarım, oyun ve topluluk sunucularında iki rengin metin kontrastını konuşmayı kolaylaştıran gerçek bir Discord botudur. Discord Gateway bağlantısıyla çalışır; GitHub Actions yalnızca kodu test eder, botu barındırmaz.

- `/contrast` komutuyla opak sRGB metin ve arka plan renklerini karşılaştırır.
- AA ve AAA için normal/büyük metin eşiklerini sayısal oran ve açık GEÇER/KALIR sözcükleriyle gösterir. Sonuç anlamak için rengi görmek gerekmez.
- Sonuç önce yalnızca komutu kullanan kişinin gördüğü özel yanıtta açılır. **Kanala paylaş** aynı normal metin kanalına herkese açık sonuç gönderir; **Vazgeç** önizlemeyi kapatır.
- Aynı arka plan üzerinde siyah ve beyaz metinden daha güçlü kontrast sağlayanı önerir. Arka planı değiştirmez.
- Türkçe/İngilizce yanıt seçimi, beş dakikalık kişiye bağlı önizlemeler, yinelenen paylaşımı önleme ve hız sınırları vardır.

Bot rol rengini değiştirmez, mesajları taramaz, üyelerin temasını algılamaz, görsel/URL indirmez ve yapay zekâ servisine veri göndermez. Bir renk görme bozukluğu simülatörü veya tam WCAG uygunluk denetçisi değildir. Çalıştırılan Discord uygulaması ve barındırma hesabı size aittir; ortak herkese açık bir bot daveti sunulmaz.

### Gereksinimler

- Windows, macOS veya Linux; **Node.js 24** ve beraberindeki npm. [Resmî Node.js indirmesi](https://nodejs.org/en/download).
- Discord hesabı, sunucuya uygulama ekleme yetkisi ve kendinize ait Discord uygulaması.
- İnternet erişimi; Discord Gateway, Discord REST ve kurulum sırasında npm kayıt sunucusuna erişebilme.
- Bot açık kalacaksa uyumayan, sürekli çalışan bir bilgisayar veya güvenilir sunucu. Tek bot süreci çalıştırın.
- Komutları kullanacak üyelerin kanalda **Uygulama Komutlarını Kullan** yetkisi; paylaşacak üyelerin ayrıca **Kanalı Görüntüle** ve **Mesaj Gönder** yetkisi.

### Kurulum: Developer Portal

1. [Discord Developer Portal](https://discord.com/developers/applications) içinde **New Application** ile ayrı bir uygulama oluşturun; adını ContrastCove koyabilirsiniz.
2. **General Information** sayfasından **Application ID** değerini alın. Bu, token değildir.
3. **Bot** sayfasından bot kullanıcısını oluşturun/gerekirse **Reset Token** ile token alın. Tokenı parola gibi koruyun: sohbete, ekran görüntüsüne, GitHub'a veya destek kaydına koymayın. Yalnızca yerel kurulum sorusuna girin.
4. **Privileged Gateway Intents** altındaki Message Content, Server Members ve Presence seçeneklerini **kapalı bırakın**. Kod yalnızca ayrıcalıksız **Guilds** intent'ini kullanır.
5. **Installation** altında **Guild Install** kullanın; User Install gerekli değildir. Varsayılan kapsamlar **bot** ve **applications.commands**; bot izinleri yalnızca **View Channels** ve **Send Messages**. Administrator vermeyin. Portal yerleşimi değişebilir; aynı kapsam ve izinleri seçin.
6. **Interactions Endpoint URL** alanını boş bırakın. Bu proje etkileşimleri sürekli Gateway bağlantısından alır; HTTPS webhook sunucusu gerekmez.
7. Discord **Kullanıcı Ayarları → Gelişmiş → Geliştirici Modu**nu açın. Sunucu simgesine sağ tıklayıp **Sunucu Kimliğini Kopyala**yı seçin.
8. Bu deponun **Code → Download ZIP** seçeneğiyle kaynağı indirin ve normal, yalnızca sizin hesabınızın eriştiği bir klasöre çıkarın. Sıkıştırılmış klasörün içinde çalıştırmayın. Terminali yeniden açıp `node --version` ile `v24.` başladığını doğrulayın.

### Kurulum: bilgisayarda çalıştırma

Windows'ta çıkarılan klasörde `setup.cmd` dosyasını açın. macOS/Linux'ta Terminal'den bu klasöre geçip:

```bash
bash setup.sh
```

Kurulum sırayla uygulama kimliğini, sunucu kimliğini ve **ekranda görünmeyen tokenı** sorar. Token yazarken hiçbir karakter görünmemesi normaldir; yapıştırıp Enter'a basın. Ctrl+C iptal eder. Doğrulanan ayarlar, mevcut dosyanın üzerine yazmadan, özel `.env` dosyasına kaydedilir. Kaynak kod düzenlemek gerekmez.

Kurulumun gösterdiği **Davet** bağlantısını kendi tarayıcınızda açıp botu hedef sunucuya ekleyin; ardından kurulum terminaline dönüp Enter'a basın. Davet izni bit alanı **3072** = View Channel + Send Messages; kanal özel izinleri bunları daha da kısıtlayabilir. Botu eklemeden devam ettiyseniz, daveti tamamlayıp aynı klasörde `npm run register` çalıştırın.

Yardımcı dosya, kilitli bağımlılıkları kurar, TypeScript'i derler ve yalnızca `/contrast` komutunu hedef sunucuya kaydeder. Uygulamanın diğer komutlarını topluca silmez. Ardından Windows'ta `start.cmd`; macOS/Linux'ta `bash start.sh` çalıştırın. Konsolda **ContrastCove hazır** görünmesini bekleyin.

Yardımcı dosyaları kullanmadan, ayarlar kurulduktan sonra aynı işlemler:

```text
npm ci --ignore-scripts
npm run build
npm run register
npm start
```

Terminal açık kalmalıdır. Ctrl+C botu durdurur. Bilgisayar uyursa veya terminal kapanırsa bot çevrimdışı olur. Sürekli kullanım için bir işletim sistemi servis yöneticisinde bu klasörü çalışma dizini ve `npm start` komutunu başlangıç komutu yapın; birden fazla kopya açmayın. Ücretsiz kısa süreli CI işleri canlı barındırma değildir. Tokenı GitHub Actions secrets içine koymanız bu proje için gerekli değildir.

### Yapılandırma

Üç ayar vardır: `DISCORD_TOKEN` gizli bot tokenı; `APPLICATION_ID` uygulama kimliği; `GUILD_ID` tek hedef sunucu kimliği. Ayarları değiştirmek için botu durdurun, eski `.env` dosyasını güvenli biçimde kaldırın veya `.env.backup` olarak yeniden adlandırın ve kurulum yardımcısını yeniden çalıştırın. Yedek de gizlidir. Eski dosya otomatik ezilmez. Eski sunucudaki komutu kaldırmak gerekirse Discord entegrasyonunu kaldırın; yeni sunucu kaydı eski sunucuyu değiştirmez.

Linux/macOS'ta dosya 0600 modu ile oluşturulur; Windows'ta klasörünüzün NTFS erişim izinlerini yalnızca kendi hesabınız için sınırlandırın. Bulut eşitlemeli/paylaşılan klasörlerde token saklamayın. Gelişmiş barındırma hizmetleri aynı adlarla ortam değişkeni verebilir; mevcut ortam değişkenleri `.env` değerlerinden önceliklidir. Tokenı komut satırı argümanına yazmayın.

### Kullanım ve hesap sınırları

Normal bir metin kanalında:

```text
/contrast foreground:#777777 background:#FFFFFF language:tr
```

Bu örnek yaklaşık **4.478:1** verir: AA normal metin için KALIR, AA büyük metin için GEÇER. Önizlemedeki **Kanala paylaş** düğmesini ancak sonucu kanaldaki herkesin görmesini istiyorsanız kullanın. **Vazgeç** hiçbir şey yayımlamaz. Dil seçilmezse Discord dili Türkçe olanlar Türkçe, diğerleri İngilizce yanıt alır.

Renkler `#12ABEF` veya `12ABEF` biçiminde **tam altı HEX rakamı** olmalıdır; kısa HEX, alfa, renk adları, CSS ifadeleri ve görseller desteklenmez. Hesap sRGB doğrusallaştırması, bağıl parlaklık ve `(daha açık + 0.05)/(daha koyu + 0.05)` formülünü kullanır. Gösterim üç ondalık basamağa yuvarlanır; eşik kararı yuvarlanmaz. AA normal 4.5, AA büyük 3, AAA normal 7 ve AAA büyük 4.5 eşikleri kullanılır. Büyük metin en az 18pt veya kalın 14pt koşulunu gerektirir; bot fontu ölçmez.

Girdiğiniz arka planın gerçek uygulama yüzeyiyle aynı olduğundan siz emin olmalısınız. Discord'un açık/koyu teması, rol rengi, yarı saydam katmanlar, anti-aliasing ve görsellerin gerçek görünümü otomatik değerlendirilmez. Sayısal eşik sonucu, tüm bir site veya sunucu için erişilebilirlik/uygunluk belgesi değildir.

Bir kullanıcı beş saniyede bir önizleme isteyebilir. Kanal başına en fazla 60 saniyede bir sonuç paylaşılır. RAM'de en fazla 100 önizleme ve 500 kısa süreli hız sınırı kaydı tutulur. Yoğunlukta kapalı güvenli davranır; süre geçtikten sonra yeniden deneyin. Önizleme, kullanıcıya/sunucuya/kanala/mesaja bağlıdır ve yalnızca bir kez kullanılır. İzinler paylaşım tıklamasında tekrar denetlenir. Bot yalnızca tek yapılandırılmış sunucunun normal metin kanallarında çalışır; DM, duyuru, forum, thread ve ses kanalları desteklenmez.

### İzinler, güvenlik ve gizlilik

Botun ihtiyacı **Kanalı Görüntüle + Mesaj Gönder**dir. Mesaj geçmişi okuma, rol yönetimi, mesaj yönetimi, üye listesi, ses bağlantısı ve Administrator gerektirmez. Mesaj okuma intent'i yoktur; komut seçenekleri ve kendi düğmelerinden gelen etkileşim verileri işlenir. SDK mesaj/kullanıcı/üye önbellekleri kapatılmıştır; Discord bağlantısı sunucu/kanal meta verisi işler.

Önizleme RAM'de renkler/sonuç, dil, kullanıcı/sunucu/kanal/özel mesaj kimliği ve son kullanma zamanı tutar; beş dakika sonra erişilemez, en geç sonraki 30 saniyelik temizlikte kaldırılır. Kısa hız sınırı kayıtları kullanıcı veya kanal kimliği taşır. Yeniden başlatmada tüm kayıtlar kaybolur; eski düğmeler çalışmaz. Veritabanı, analitik, takip sistemi, okur listesi ve disk üzerinde sonuç günlüğü yoktur. Konsol ham etkileşimleri veya tokenı yazdırmaz. RAM işletici tarafından incelenebilir; işletim sistemi dump/swap kayıtları için silinme garantisi verilmez.

**Özel yanıt anonim veya uçtan uca şifreli değildir:** Discord, bot işletmecisi ve komutu kullanan kişi verileri işleyebilir. Paylaşılan sonuçları kanal erişimi olan herkes görebilir/kopyalayabilir; mesajlar RAM süresi dolduktan veya bot durduktan sonra Discord'da kalabilir. Bot otomatik mesaj silmez. Kendi sonucunu kaldırmak isteyen kişi sunucu görevlisinden yardım isteyebilir. Mention ve bağlantı önizlemeleri bastırılır; renk alanı serbest metin kabul etmez.

Paylaşım sırasında bağlantı hatası olursa taslak yine tüketilir; aynı sonucu otomatik yeniden göndermez. Hata yanıtı görürseniz yeniden komut kullanmadan **önce kanalı kontrol edin**, çünkü ağ hatasında Discord mesajı almış olabilir.

### Sorun giderme

- **Node/npm bulunamadı:** Node.js 24'ü resmî siteden kurun, terminali yeniden açın.
- **.env zaten var:** Botu durdurup dosyayı güvenli kaldırın/yeniden adlandırın; yardımcının dosya korumasını atlamayın.
- **Giriş veya komut kaydı başarısız:** Uygulama ID ile sunucu ID'yi karıştırmayın; botun hedef sunucuya eklendiğini doğrulayın. Token sızdıysa Portal'da resetleyip yerel kurulumu yenileyin. Ağ/proxy kurallarını kontrol edin; tokenı hata raporuna eklemeyin.
- **Komut görünmüyor:** `npm run register` başarıyla bitmeli; Discord istemcisini yenileyin. Doğru sunucu/uygulama ve entegrasyon komut izinlerini kontrol edin.
- **İzin hatası:** Hem üyenin hem botun normal metin kanalında View Channel ve Send Messages izinlerini kontrol edin. Administrator açmayın; kanala özgü engelleri inceleyin.
- **Önizleme geçersiz:** Beş dakika geçmiş, bot yeniden başlamış veya taslak kullanılmış olabilir. Yeni `/contrast` komutu açın.
- **Yoğunluk/hız sınırı:** Kullanıcı için beş saniye, kanal paylaşımı için 60 saniye bekleyin. 100 önizleme sınırı için beş dakika beklemek gerekebilir.
- **Token girişi görünmüyor:** Bilerek gizlenir. Yardımcıyı yönlendirilmiş girişte veya CI'da değil gerçek terminalde açın.
- **Bot çevrimdışı:** Başlatma terminalini ve internet bağlantısını kontrol edin; bilgisayarın uykuya geçmesini engelleyin. Kaynak güncellemesinden sonra bağımlılıkları yeniden kurup derleyin.

### Testler, katkı ve lisans

`npm ci --ignore-scripts` ardından `npm run check` çalıştırın: Biome önerilen kuralları, strict TypeScript derlemesi, Node testleri, bağımlılık lisans/kayıt kaynağı/SHA-512/kurulum betiği denetimi ve kaynakta kimlik bilgisi örüntüsü taraması. `npm audit --audit-level=low` ayrıca çalıştırılır. Tarama tüm sırları yakalama garantisi değildir. CI aynı kontrolleri Ubuntu, Windows ve macOS üzerinde; yardımcı Node/Bash sözdizimini ve temiz Git farkını da denetleyerek uygular. İş akışı yalnızca contents:read yetkili ve action commit'leri sabittir.

Testler bağımsız hesap referanslarını, eşik çevresini, renk doğrulamayı, süre aşımını, yetki/binding kontrollerini, eşzamanlı çift tıklamayı, kapasiteyi ve ağ hatalarını kapsar. Discord etkileşimleri taklittir; gerçek tokenla canlı kurulum, gizli giriş, mobil ve ekran okuyucu deneyimi işletici tarafından ayrıca denenmelidir. CI tek başına canlı bot çalıştığını göstermez.

Hata raporlarında işletim sistemi, Node sürümü ve gizli veriler temizlenmiş hata metni kullanın. Ayrıntılar [katkı rehberinde](CONTRIBUTING.md), güvenlik bildirimi [SECURITY.md](SECURITY.md) dosyasında. Kod **MIT** lisanslıdır; [LICENSE](LICENSE). Bağımlılıkların lisansları kendi paketlerinde bulunur.

## English

### Purpose and features

ContrastCove is a real Discord Gateway bot for discussing readable color choices in design, gaming and community servers. GitHub Actions tests the source; it does not host the bot.

- `/contrast` compares opaque sRGB text and background colors.
- Private results show the numeric ratio and explicit PASS/FAIL for normal/large text at AA and AAA.
- **Share to channel** explicitly posts the previewed result publicly to the same regular text channel. **Discard** publishes nothing.
- A black-or-white foreground suggestion helps improve contrast on the supplied background, without changing that background.
- English/Turkish responses, five-minute owner-bound previews, single-use sharing, bounded memory and rate limits.

It does not edit roles, scan messages, detect Discord themes, download images/URLs, simulate color blindness or call an AI service. It is not a full WCAG conformance checker. You operate your own application and host; this repository does not provide a centrally hosted invite.

### Requirements

Windows, macOS or Linux, **Node.js 24** with npm, a Discord account and permission to install an application in the target server. Get Node from [the official download page](https://nodejs.org/en/download). Internet must reach the Discord Gateway/REST services and npm registry during installation. Use one continuously running process on a computer that stays awake or a trusted server. Members need Use Application Commands; public sharing also needs View Channel and Send Messages.

### Installation: Developer Portal

1. Open the [Discord Developer Portal](https://discord.com/developers/applications), select **New Application**, and create a separate application.
2. Copy **Application ID** from General Information.
3. On **Bot**, create the bot user if necessary and obtain a token using **Reset Token**. Treat it like a password. Never send it in chat, screenshots, issues or source control.
4. Leave **Message Content**, **Server Members** and **Presence** privileged intents **off**. Only the nonprivileged Guilds intent is requested.
5. Configure **Guild Install** in Installation. Use scopes **bot** and **applications.commands**, with **View Channels** and **Send Messages** only. Never grant Administrator. User Install is unnecessary; portal labels may move.
6. Leave **Interactions Endpoint URL** empty: the project receives interactions over the Gateway, without a public webhook server.
7. Enable Developer Mode in Discord User Settings → Advanced; right-click the server icon and copy its server ID.
8. Download this repository through Code → Download ZIP and extract it into a private local folder. Do not run inside the ZIP or a shared/cloud-synced folder. Restart your terminal after Node installation and verify `node --version` starts with `v24.`.

### Installation: run locally

On Windows, open `setup.cmd`. On macOS/Linux, open a terminal in the extracted folder and run:

```bash
bash setup.sh
```

The wizard asks for application ID, server ID and a **hidden token**. Nothing is displayed while typing/pasting the token; press Enter to finish or Ctrl+C to cancel. It validates the inputs and creates `.env` without overwriting an existing file. No source-code editing is needed.

Open the invite URL printed by the wizard in your own browser and install the bot into the target server, then return to the terminal and press Enter to continue. Permission value **3072** means View Channel + Send Messages. Channel overrides can further restrict these permissions. If you continued before installing and registration fails, finish the invite and run `npm run register` in the folder.

The helper installs locked dependencies, compiles TypeScript and registers only `/contrast` in the configured server. It does not bulk-delete other application commands. Start with `start.cmd` on Windows or `bash start.sh` elsewhere, and wait for **ContrastCove ready**.

After configuring settings, the equivalent manual commands are:

```text
npm ci --ignore-scripts
npm run build
npm run register
npm start
```

Keep the terminal open. Ctrl+C stops the bot; closing the terminal or sleeping the computer disconnects it. For continuous hosting, configure an OS service manager with this folder as its working directory and `npm start` as its command. Run one instance only. CI jobs are not continuous hosting; this workflow needs no Discord token in GitHub secrets.

### Configuration

Settings are `DISCORD_TOKEN` (secret), `APPLICATION_ID` and `GUILD_ID` (one target server). To change them, stop the bot, securely remove the old `.env` or rename it to `.env.backup`, then rerun setup. Backups also contain secrets. Existing files are never silently overwritten. Re-registering for a new server does not remove the old server's command; remove that integration in Discord if needed.

The file is created with mode 0600 on Unix. On Windows restrict the folder's NTFS access to your account. Do not store credentials in shared/synced folders. Advanced hosts may supply environment variables instead; inherited variables take precedence over `.env`. Never pass the token as a shell argument.

### Usage and calculation limits

In a regular text channel, run:

```text
/contrast foreground:#777777 background:#FFFFFF language:en
```

This returns approximately **4.478:1**: AA normal text FAIL, AA large text PASS. Use **Share to channel** only if everyone with access to that channel should see the result. Discard sends nothing. Explicit language wins; otherwise Turkish Discord locale uses Turkish and all others use English.

Both colors must be exactly six hexadecimal digits, with an optional leading `#`. Shorthand, alpha, named colors, CSS expressions and images are unsupported. Computation uses sRGB linearization, relative luminance and `(lighter + 0.05)/(darker + 0.05)`. The displayed ratio has three decimals; decisions compare the unrounded number. Thresholds are 4.5 for AA normal, 3 for AA large, 7 for AAA normal and 4.5 for AAA large. Large text means at least 18pt, or bold 14pt; the bot cannot measure your font.

You must supply the actual rendered background. Discord themes, role rendering, transparency, anti-aliasing and image appearance are not automatically assessed. A passing pair is not a certificate of whole-page/server accessibility or WCAG conformance.

Each user can request a preview every five seconds; public shares have a 60-second channel cooldown. At most 100 drafts and 500 short cooldown records are held in RAM. Full capacity fails closed. Previews are bound to user/server/channel/message, last five minutes and are consumed once. Member and bot permissions are checked again when Share is clicked. Only the configured server's regular text channels are supported; no DMs, announcements, threads, forums or voice channels.

### Permissions, security and privacy

The bot needs **View Channel + Send Messages**. It needs no message-history, role-management, moderation, member-list, voice or Administrator permission. No message-reading intent is enabled. It processes slash-command options and its own button interactions. SDK message/user/member caches are disabled; the Discord connection still processes server/channel metadata.

Drafts store colors/result, language, user/server/channel/private-message IDs and expiry in RAM for five minutes; expired drafts are inaccessible immediately and swept within another 30 seconds. Short cooldown records contain user or channel IDs. Restart drops all state and invalidates old buttons. No database, analytics, reader roster or result files are used. Raw interactions and tokens are not logged. Operators can inspect RAM; OS dumps/swap prevent any forensic-erasure guarantee.

**Ephemeral is neither anonymous nor end-to-end encrypted:** Discord, the operator and the requester can process data. Public results may be read/copied by channel members. Public and private Discord messages may remain after RAM expires or the bot stops. The bot does not delete them automatically; ask server staff to remove a public result if needed. Mentions and embeds are suppressed; color fields cannot contain arbitrary text.

A failed/ambiguous network send still consumes the draft. No automatic resend occurs. **Check the channel before trying again** because Discord may have received the first message.

### Troubleshooting

- **Node/npm missing:** install Node.js 24 from the official site and reopen your terminal.
- **Existing .env:** stop the bot, securely remove/rename it and rerun setup.
- **Login/registration fails:** verify application/server IDs, token, target-server installation and network/proxy access. Reset an exposed token and reconfigure locally; never include it in a report.
- **Command absent:** run `npm run register` successfully, refresh Discord, and check the server/application and integration command permissions.
- **Cannot share:** check both member and bot channel permissions, including overrides. Grant only View Channel and Send Messages.
- **Expired preview:** restart, expiry or previous use invalidated it; invoke `/contrast` again.
- **Busy/rate limited:** wait five seconds for requests, 60 seconds for channel sharing, or five minutes for draft capacity.
- **Invisible token input:** expected. Use an interactive terminal, not redirected input or CI.
- **Offline:** keep the start terminal and network active; prevent computer sleep. After updating source, reinstall dependencies and rebuild.

### Tests, contribution and license

Run `npm ci --ignore-scripts`, `npm run check` and `npm audit --audit-level=low`. Checks include recommended Biome lint/format, strict TypeScript compilation, Node tests, dependency license/registry/SHA-512/lifecycle-script review and source credential-pattern scans. Pattern scanning cannot guarantee that every secret is detected. CI repeats checks on Ubuntu, Windows and macOS, verifies Node/Bash helper syntax and a clean Git diff, uses only contents:read permission and pins actions to commit SHAs.

Tests cover independent calculation references, threshold boundaries, validation, binding, permissions, expiry, concurrent double clicks, resource bounds and network failure. Discord interactions are mocked. Live installation, hidden input, mobile and screen-reader behavior still need operator validation; CI does not establish live Discord operation.

See [CONTRIBUTING.md](CONTRIBUTING.md) for reports and patches, and [SECURITY.md](SECURITY.md) for security reporting. Include your OS, Node version and sanitized error text. The source is licensed under **MIT**; see [LICENSE](LICENSE). Dependencies retain their own licenses.

## References / Kaynaklar

- [W3C WCAG 2.2 contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [W3C WCAG 2.2 enhanced contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html)
- [W3C relative luminance and contrast ratio definitions](https://www.w3.org/TR/WCAG22/#dfn-relative-luminance)
- [Discord application commands](https://docs.discord.com/developers/interactions/application-commands)
- [Discord interaction responses](https://docs.discord.com/developers/interactions/receiving-and-responding)
- [Discord Gateway intents](https://docs.discord.com/developers/events/gateway#gateway-intents)
- [Discord Developer Policy](https://support-dev.discord.com/hc/en-us/articles/8563934450327-Discord-Developer-Policy)
