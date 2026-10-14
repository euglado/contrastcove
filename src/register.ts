import { REST, Routes } from "discord.js";
import { command } from "./command.js";
import { config } from "./config.js";

async function register() {
  const c = config();
  // POST upserts only /contrast, preserving other commands on the application.
  try {
    await new REST({ version: "10" })
      .setToken(c.token)
      .post(Routes.applicationGuildCommands(c.applicationId, c.guildId), {
        body: command.toJSON(),
      });
  } catch {
    throw new Error(
      "Command registration failed. Check token, IDs and server installation. / Komut kaydı başarısız; tokenı, kimlikleri ve kurulumu kontrol edin.",
    );
  }
  console.log("/contrast registered in the configured server. / Komut sunucuya kaydedildi.");
}
register().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Registration failed.");
  process.exitCode = 1;
});
