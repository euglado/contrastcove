import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  ChannelType,
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
} from "discord.js";
import { type Language, report } from "./contrast.js";
import { Drafts } from "./drafts.js";

const mentions = { parse: [] as [], repliedUser: false };
const permissions = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages];
export function language(locale: string, requested: string | null = null): Language {
  return requested === "tr" || requested === "en" ? requested : locale === "tr" ? "tr" : "en";
}
const text = (lang: Language, tr: string, en: string) => (lang === "tr" ? tr : en);
export function createHandler(guild: string, drafts = new Drafts()) {
  return async (i: ChatInputCommandInteraction | ButtonInteraction) => {
    const lang = language(i.locale);
    const privateReply = (content: string) =>
      i.reply({
        content,
        flags: MessageFlags.Ephemeral | MessageFlags.SuppressEmbeds,
        allowedMentions: mentions,
      });
    if (!i.inGuild() || i.guildId !== guild || i.channel?.type !== ChannelType.GuildText) {
      await privateReply(
        text(
          lang,
          "Yalnızca yapılandırılan sunucunun normal metin kanallarında kullanın.",
          "Use a regular text channel in the configured server.",
        ),
      );
      return;
    }
    if (i.isChatInputCommand()) {
      if (i.commandName !== "contrast") return;
      const chosen = language(i.locale, i.options.getString("language"));
      let content: string;
      try {
        content = report(
          i.options.getString("foreground", true),
          i.options.getString("background", true),
          chosen,
        );
      } catch {
        await privateReply(
          text(
            chosen,
            "Her renk için altı HEX rakamı girin: #12ABEF. Alfa, kısa HEX ve renk adları desteklenmez.",
            "Enter six HEX digits per color, e.g. #12ABEF. Alpha, shorthand and color names are unsupported.",
          ),
        );
        return;
      }
      if (!drafts.reserve(`user:${i.user.id}`, 5_000)) {
        await privateReply(
          text(
            chosen,
            "Beş saniye bekleyip yeniden deneyin; bot yoğun olabilir.",
            "Wait five seconds and retry; the bot may be busy.",
          ),
        );
        return;
      }
      let id: string;
      try {
        id = drafts.create(
          { user: i.user.id, guild, channel: i.channelId, message: "" },
          content,
          chosen,
        );
      } catch {
        await privateReply(
          text(
            chosen,
            "Önizleme kapasitesi dolu. Beş dakika sonra deneyin.",
            "Preview capacity is full. Retry in five minutes.",
          ),
        );
        return;
      }
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`cc:share:${id}`)
          .setLabel(text(chosen, "Kanala paylaş", "Share to channel"))
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`cc:discard:${id}`)
          .setLabel(text(chosen, "Vazgeç", "Discard"))
          .setStyle(ButtonStyle.Secondary),
      );
      try {
        await i.deferReply({ flags: MessageFlags.Ephemeral });
        const message = await i.editReply({
          content: `${content}\n\n${text(chosen, "Yalnızca siz görüyorsunuz. Paylaş düğmesi aynı kanala herkese açık sonuç gönderir. 5 dakika geçerli.", "Only you can see this. Share posts this result publicly to this channel. Valid for 5 minutes.")}`,
          components: [row],
          allowedMentions: mentions,
          flags: MessageFlags.SuppressEmbeds,
        });
        drafts.bindMessage(id, message.id);
      } catch (error) {
        drafts.remove(id);
        throw error;
      }
      return;
    }
    const match = /^cc:(share|discard):([a-f0-9-]{36})$/.exec(i.customId);
    if (!match) return;
    const binding = { user: i.user.id, guild, channel: i.channelId, message: i.message.id };
    // Ephemeral interaction responses are authored by this application and its webhook.
    if (
      i.message.author.id !== i.client.user.id ||
      i.message.webhookId !== i.applicationId ||
      !i.message.flags.has(MessageFlags.Ephemeral)
    ) {
      await privateReply(
        text(
          lang,
          "Bu kontrol geçerli bir özel önizlemeye ait değil.",
          "This control is not from a valid private preview.",
        ),
      );
      return;
    }
    const id = match[2] ?? "";
    const d = drafts.find(id, binding);
    if (!d) {
      await privateReply(
        text(
          lang,
          "Önizleme süresi doldu, kullanıldı veya size ait değil. /contrast ile yeniden başlayın.",
          "Preview expired, was used, or belongs to someone else. Start again with /contrast.",
        ),
      );
      return;
    }
    const share = match[1] === "share";
    if (share && (!i.appPermissions?.has(permissions) || !i.memberPermissions?.has(permissions))) {
      await privateReply(
        text(
          d.lang,
          "Sizin ve botun Kanalı Görüntüle + Mesaj Gönder izinleri gerekli. Önizleme hâlâ geçerli.",
          "You and the bot need View Channel + Send Messages. The preview is still available.",
        ),
      );
      return;
    }
    // Consume and reserve synchronously before the first await to prevent duplicate sends.
    if (!drafts.consume(id, binding, share)) {
      await privateReply(
        text(
          d.lang,
          "Bu kanalda paylaşımlar arasında 60 saniye bekleyin; önizleme geçerliyse yeniden deneyin.",
          "Wait 60 seconds between channel shares, then retry if the preview is still valid.",
        ),
      );
      return;
    }
    await i.deferUpdate();
    if (share) {
      try {
        await i.channel.send({
          content: d.content,
          allowedMentions: mentions,
          flags: MessageFlags.SuppressEmbeds,
        });
      } catch {
        await i.editReply({
          content: text(
            d.lang,
            "Paylaşım doğrulanamadı. Yeniden denemeden önce kanalı kontrol edin. Önizleme tüketildi.",
            "Could not confirm sharing. Check the channel before retrying. Preview consumed.",
          ),
          components: [],
          allowedMentions: mentions,
        });
        return;
      }
    }
    await i.editReply({
      content: text(
        d.lang,
        share ? "Sonuç bu kanala paylaşıldı." : "Önizleme kapatıldı.",
        share ? "Result shared to this channel." : "Preview discarded.",
      ),
      components: [],
      allowedMentions: mentions,
    });
  };
}
