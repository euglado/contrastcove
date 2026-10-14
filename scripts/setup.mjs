import { writeFileSync } from "node:fs";
import { stdin, stdout } from "node:process";
import { emitKeypressEvents } from "node:readline";
import { createInterface } from "node:readline/promises";

async function hiddenToken() {
  stdout.write("Bot token (hidden / gizli): ");
  emitKeypressEvents(stdin);
  stdin.setRawMode(true);
  stdin.resume();
  return new Promise((resolve, reject) => {
    let value = "";
    const cleanup = () => {
      stdin.off("keypress", onKey);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write("\n");
    };
    const onKey = (str, key = {}) => {
      if (key.ctrl && key.name === "c") {
        cleanup();
        reject(new Error("Cancelled / İptal edildi."));
      } else if (key.name === "return" || key.name === "enter") {
        cleanup();
        resolve(value);
      } else if (key.name === "backspace") value = value.slice(0, -1);
      else if (!key.ctrl && !key.meta && str && /^[A-Za-z0-9_.-]+$/.test(str)) value += str;
    };
    stdin.on("keypress", onKey);
  });
}

async function setup() {
  if (Number(process.versions.node.split(".")[0]) !== 24)
    throw new Error("Install Node.js 24 LTS first. / Önce Node.js 24 LTS kurun.");
  if (!stdin.isTTY || !stdout.isTTY)
    throw new Error(
      "Open an interactive terminal for setup. / Kurulum için etkileşimli terminal açın.",
    );
  const rl = createInterface({ input: stdin, output: stdout });
  let application;
  let guild;
  try {
    application = (await rl.question("Application ID / Uygulama kimliği: ")).trim();
    guild = (await rl.question("Server ID / Sunucu kimliği: ")).trim();
  } finally {
    rl.close();
  }
  if (!/^\d{17,20}$/.test(application) || !/^\d{17,20}$/.test(guild))
    throw new Error("IDs must contain 17–20 digits. / Kimlikler 17–20 rakam olmalı.");
  const token = await hiddenToken();
  if (!/^[A-Za-z0-9_.-]{30,200}$/.test(token))
    throw new Error("Invalid token format. / Token biçimi geçersiz.");
  try {
    const settings = [
      ["DISCORD_TOKEN", token],
      ["APPLICATION_ID", application],
      ["GUILD_ID", guild],
    ]
      .map((pair) => pair.join("="))
      .join("\n");
    writeFileSync(".env", `${settings}\n`, { flag: "wx", mode: 0o600 });
  } catch {
    throw new Error(
      "Could not create .env; existing files are never overwritten. / .env oluşturulamadı; mevcut dosya üzerine yazılmaz.",
    );
  }
  console.log(
    "Settings saved privately in .env. Never share it. / Ayarlar .env içine kaydedildi; paylaşmayın.",
  );
  console.log(
    `Install link / Davet: https://discord.com/oauth2/authorize?client_id=${application}&scope=bot%20applications.commands&permissions=3072&guild_id=${guild}&disable_guild_select=true`,
  );
  const confirmation = createInterface({ input: stdin, output: stdout });
  try {
    await confirmation.question(
      "Open the invite and add the bot, then press Enter. / Daveti açıp botu ekleyin, sonra Enter'a basın: ",
    );
  } finally {
    confirmation.close();
  }
}
setup().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
