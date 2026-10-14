import { SlashCommandBuilder } from "discord.js";

export const command = new SlashCommandBuilder()
  .setName("contrast")
  .setDescription("Privately compare two sRGB text colors; share only after preview")
  .setDescriptionLocalizations({
    tr: "İki sRGB metin rengini özel olarak karşılaştır; önizlemeden sonra paylaş",
  })
  .addStringOption((o) =>
    o
      .setName("foreground")
      .setDescription("Text color, e.g. #000000 (six hex digits)")
      .setRequired(true)
      .setMinLength(6)
      .setMaxLength(7),
  )
  .addStringOption((o) =>
    o
      .setName("background")
      .setDescription("Background color, e.g. #FFFFFF (six hex digits)")
      .setRequired(true)
      .setMinLength(6)
      .setMaxLength(7),
  )
  .addStringOption((o) =>
    o
      .setName("language")
      .setDescription("Response language / Yanıt dili")
      .addChoices({ name: "Türkçe", value: "tr" }, { name: "English", value: "en" }),
  );
