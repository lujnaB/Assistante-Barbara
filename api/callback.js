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

  // Page HTML qui ferme la popup et envoie les infos au site parent
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Connexion en cours...</title></head>
    <body>
      <p style="font-family:sans-serif; text-align:center; margin-top:50px;">
        Connexion réussie, fermeture...
      </p>
      <script>
        // Envoie les infos au site parent
        if (window.opener) {
          localStorage.setItem('discord_user', JSON.stringify({
            username: "${user.username}",
            avatar: "${user.avatar}",
            discord_id: "${user.id}"
          }));
          window.opener.postMessage('discord-login-success', '*');
          window.close();
        }
      </script>
    </body>
    </html>
  `);
}
