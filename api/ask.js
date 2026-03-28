
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
            role: 'system',
            content: `You are a world-class movie recommendation AI.
Given a user request, respond with ONLY a valid JSON object:
{"lang":"<code_or_empty>","titles":["Title1","Title2",...]}
Language codes: te=Telugu, hi=Hindi, ta=Tamil, ml=Malayalam, kn=Kannada, en=English, bn=Bengali.
- CRITICAL: If the user mentions a language (e.g. "Telugu") or an Indian region, set "lang" specifically (e.g. "te") and pick ONLY movies from that industry.
- Return 6-8 real movies that match the mood/genre. Use exact official titles.`
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
