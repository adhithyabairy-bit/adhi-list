
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { query } = req.body;
  const GROQ_KEY = process.env.GROQ_KEY;

  if (!GROQ_KEY) {
    return res.status(500).json({ error: 'Groq API Key not configured' });
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        temperature: 0.2,
        max_tokens: 300,
        messages: [
          {
            role   : 'system',
            content: `You are a world-class movie discovery expert. Your goal is to provide the perfect list of movie titles matching the user query.
RESOURCES: te=Telugu, hi=Hindi, ta=Tamil, ml=Malayalam, kn=Kannada, en=English, bn=Bengali.

RULES (STRICT):
1. Respond ONLY with a valid JSON object: {"lang": "te|hi|ta|ml|kn|en|bn|", "titles": ["..."]}
2. REGIONAL SEARCH (CRITICAL): If user mentions "Telugu/Tollywood", set lang="te". If "Hindi/Bollywood", set lang="hi". If "Tamil/Kollywood", set lang="ta". If "Malayalam", set lang="ml". If "Kannada", set lang="kn".
- INDUSTRY ISOLATION (MANDATORY): For regional requests, pick JUST movies where the original version is in that language. ABSOLUTELY NO Hollywood/English movies in regional results.
4. OUTPUT: Provide 6-8 real, high-quality titles. Respond with raw JSON ONLY.`
          },
          { role: 'user', content: query }
        ]
      })
    });

    const data = await groqRes.json();
    const rawText = data.choices?.[0]?.message?.content?.trim() || '{}';
    const jsonStr = rawText.replace(/```json?\s*|\s*```/g, '').trim();
    
    // Validate JSON before sending back
    const parsed = JSON.parse(jsonStr);
    return res.status(200).json(parsed);

  } catch (error) {
    console.error('Groq Proxy Error:', error);
    return res.status(500).json({ error: 'Failed' });
  }
}
