export default async function handler(req, res) {
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
                model: 'mistral-tiny', 
                messages: [
                    { role: 'system', content: 'Tu es Assistante Barbara, un bot Discord intelligent, poli et francophone.' },
                    { role: 'user', content: message }
                ]
            })
        });

        const data = await response.json();
        
        res.status(200).json({ reply: data.choices[0].message.content });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ reply: "Désolée, mes circuits sont un peu surchargés." });
    }
}
