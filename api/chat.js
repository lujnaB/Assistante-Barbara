export default async function handler(req, res) {
    // Autoriser GitHub Pages à communiquer avec Vercel (CORS)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    // On récupère le message ET l'historique de la conversation
    const { message, history = [] } = req.body;

    try {
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MISTRAL_WEBSITE_KEY}` 
            },
            body: JSON.stringify({
                model: 'mistral-small-latest', 
                messages: [
                    { 
                        role: 'system', 
                        content: `Tu es le guide d'accueil virtuel du site officiel du bot Discord "Assistante Barbara". 
Ton but est d'accueillir les visiteurs, de répondre à leurs questions sur le bot ET de les guider à travers le site web.
Sois chaleureuse, polie, claire et concise. Fais des paragraphes aérés.

RÈGLE ABSOLUE DE FORMATAGE :
N'utilise JAMAIS de formatage Markdown (pas d'astérisques **, pas de dièses #). Réponds uniquement en texte brut normal. Tu peux utiliser des sauts de ligne pour structurer ton texte.

STRUCTURE DU SITE WEB :
- "Accueil" : Présentation, commandes usuelles, partenaires et un bouton d'avis.
- "Hub" : Espace réservé (connexion Discord requise). Contient les actualités et le formulaire de contact principal.
- "Informations légales" : RGPD et CGU.
- "Pied de page (Footer)" : Tout en bas du site, on y trouve des liens directs pour contacter l'équipe par Email, rejoindre le serveur Discord officiel, ou visiter la page Bluesky du projet.

INFORMATIONS SUR LE BOT :
- IA (OpenAI & Mistral AI), Modération et Divertissement.
- Musique libre de droits via Jamendo (/play, /stop, /queue).
- Hébergé en Europe (KataBump), aucune conservation de données personnelles.

Si on te demande de l'aide, comment contacter l'équipe ou faire une réclamation, propose deux options : utiliser le formulaire de contact dans le "Hub" (connexion requise), ou utiliser les liens (Email, Discord, Bluesky) situés tout en bas du site dans le pied de page.` 
                    },
                    // On insère l'historique pour que l'IA ait de la mémoire
                    ...history,
                    // On ajoute le nouveau message de l'utilisateur
                    { role: 'user', content: message }
                ]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error("Erreur Mistral AI:", data.error.message);
            return res.status(500).json({ reply: "Erreur de configuration de l'IA. Veuillez réessayer plus tard." });
        }

        res.status(200).json({ reply: data.choices[0].message.content });
        
    } catch (error) {
        console.error("Erreur serveur interne:", error);
        res.status(500).json({ reply: "Désolée, mes circuits sont un peu surchargés." });
    }
}
