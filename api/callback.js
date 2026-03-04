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

  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const user = await userRes.json();

  // Redirige vers le site avec les infos en paramètres
  const redirectUrl = `https://assistante-barbara.github.io?discord_id=${user.id}&username=${encodeURIComponent(user.username)}&avatar=${user.avatar}`;
  
  res.redirect(redirectUrl);
}
