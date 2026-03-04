export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Code manquant");
  }

  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.REDIRECT_URI,
  });

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    return res.status(400).send("Erreur lors de la récupération du token");
  }

  // Récupère les infos utilisateur
  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const user = await userRes.json();

  // Récupère les serveurs de l'utilisateur
  const guildsRes = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const guilds = await guildsRes.json();

  // Récupère les serveurs où le bot est présent via le token bot
  const botGuildsRes = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` },
  });
  const botGuilds = await botGuildsRes.json();

  // Vérifie si l'utilisateur partage au moins un serveur avec le bot
  const botGuildIds = botGuilds.map(g => g.id);
  const userGuildIds = guilds.map(g => g.id);
  const hasSharedServer = userGuildIds.some(id => botGuildIds.includes(id));

  const redirectUrl = `https://lujnab.github.io/Assistante-Barbara/?discord_id=${user.id}&username=${encodeURIComponent(user.username)}&avatar=${user.avatar}&member=${hasSharedServer}`;
  
  res.redirect(redirectUrl);
}
