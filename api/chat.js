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

    const { message } = req.body;

    try {
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // On utilise ici une nouvelle variable d'environnement pour le site
                'Authorization': `Bearer ${process.env.MISTRAL_WEBSITE_KEY}` 
            },
            body: JSON.stringify({
                model: 'mistral-small-latest', 
                messages: [
                    { 
                        role: 'system', 
                        content: `Tu es le guide d'accueil virtuel du site officiel du bot Discord "Assistante Barbara". 
Ton but est d'accueillir les visiteurs, de répondre à leurs questions sur le bot et de les encourager à l'ajouter sur leur serveur Discord.
Sois chaleureux, poli, clair et concis.

Voici les informations que tu dois connaître pour renseigner les visiteurs :
- Assistante Barbara est un bot Discord complet proposant : Intelligence Artificielle, Modération et Divertissement.
- IA : Elle utilise les modèles de pointe OpenAI et Mistral AI pour converser naturellement.
- Musique : Elle permet de jouer de la musique libre de droits via la plateforme Jamendo (commande /play).
- Sécurité et RGPD : Aucune donnée personnelle n'est conservée. Les logs sont temporaires. Le projet a un fort ancrage européen.
- Hébergement : Elle est hébergée sur l'infrastructure optimisée de KataBump, garantissant une haute disponibilité et une fiabilité constante.
- Commandes principales : /play, /stop, /queue, /utilisateur, /salon, /serveur, /clear.
- Le site propose un "Hub" (espace réservé aux utilisateurs connectés via Discord) et une section "Informations légales".

Si on te pose une question hors sujet, rappelle poliment que tu es là pour parler d'Assistante Barbara.` 
                    },
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
