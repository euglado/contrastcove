export function config(env: NodeJS.ProcessEnv = process.env) {
  const token = env.DISCORD_TOKEN?.trim() ?? "";
  const applicationId = env.APPLICATION_ID?.trim() ?? "";
  const guildId = env.GUILD_ID?.trim() ?? "";
  if (
    !/^[A-Za-z0-9_.-]{30,200}$/.test(token) ||
    !/^\d{17,20}$/.test(applicationId) ||
    !/^\d{17,20}$/.test(guildId)
  ) {
    throw new Error(
      "Run setup.cmd or ./setup.sh first. / Önce setup.cmd veya ./setup.sh çalıştırın.",
    );
  }
  return { token, applicationId, guildId };
}
