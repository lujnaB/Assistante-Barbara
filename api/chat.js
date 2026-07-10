export default async function handler(req, res) {
    // 1. Autoriser GitHub Pages à communiquer avec Vercel (CORS)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // Autorise toutes les origines
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // 2. Gérer la requête préliminaire ("preflight") du navigateur
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
                'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}` 
            },
            body: JSON.stringify({
                model: 'mistral-small-latest', 
                messages: [
                    { role: 'system', content: 'Tu es Assistante Barbara, un bot Discord intelligent, poli et francophone.' },
                    { role: 'user', content: message }
                ]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error("Erreur Mistral AI:", data.error.message);
            return res.status(500).json({ reply: "Erreur avec la clé API Mistral." });
        }

        res.status(200).json({ reply: data.choices[0].message.content });
        
    } catch (error) {
        console.error("Erreur serveur interne:", error);
        res.status(500).json({ reply: "Désolée, mes circuits sont un peu surchargés." });
    }
}
