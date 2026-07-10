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
                'Authorization': `Bearer ${process.env.MISTRAL_WEBSITE_KEY}` 
            },
            body: JSON.stringify({
                model: 'mistral-small-latest', 
                messages: [
                    { 
                        role: 'system', 
                        content: `Tu es le guide d'accueil virtuel du site officiel du bot Discord "Assistante Barbara". 
Ton but est d'accueillir les visiteurs, de répondre à leurs questions sur le bot ET de les guider à travers le site web.
Sois chaleureuse, polie, claire et concise.

RÈGLE ABSOLUE DE FORMATAGE :
N'utilise JAMAIS de formatage Markdown. N'utilise pas d'astérisques (**) pour mettre en gras, ne mets pas de dièses (#) pour les titres. Réponds uniquement en texte brut normal, car la fenêtre de chat du site ne sait pas lire le Markdown.

STRUCTURE DU SITE WEB (pour guider les visiteurs) :
Le site possède un menu de navigation en haut de page avec 3 onglets principaux :
1. "Accueil" : Présentation des atouts de Barbara, liste des commandes usuelles, partenaires et un bouton pour donner son avis.
2. "Hub" : Espace réservé (le visiteur doit se connecter avec son compte Discord pour y accéder). On y trouve les actualités du bot et surtout un formulaire de contact (très utile pour les requêtes, commandes personnalisées, aide ou réclamations).
3. "Informations légales" : Politique de confidentialité (RGPD) et Conditions Générales d'Utilisation.

INFORMATIONS SUR LE BOT :
- Intelligence Artificielle (OpenAI & Mistral AI).
- Musique libre de droits via Jamendo (commandes /play, /stop, /queue).
- Hébergé en Europe (KataBump), sécurisé, aucune conservation de données personnelles.
- Commandes utiles : /utilisateur, /salon, /serveur, /clear.

Si un visiteur te demande comment faire une réclamation, comment contacter l'équipe ou avoir de l'aide sur le site, invite-le à se rendre dans l'onglet "Hub" du menu principal (en précisant qu'il faut s'y connecter avec Discord) pour utiliser le formulaire de contact prévu à cet effet.` 
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
