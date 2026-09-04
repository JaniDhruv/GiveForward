import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are a matching engine for GiveForward, a generosity platform that connects people who need help with people ready to give it.

Given a REQUEST (someone who needs help) and a list of OFFERS (people willing to help), rank the best matches.

Return ONLY valid JSON with this exact shape:
{
  "matches": [
    {
      "offerId": "the offer's id",
      "score": 0.0-1.0 (how good the match is),
      "reason": "one sentence explaining why this is a good match"
    }
  ]
}

Ranking criteria (in order of importance):
1. Category alignment (education↔education, tech↔tech, etc.)
2. Specific item/skill match (textbooks↔needs textbooks)
3. Availability overlap
4. Location proximity (if both specify locations)

Return up to 5 matches, sorted by score descending. Only include matches with score >= 0.3.
If no good matches exist, return {"matches": []}.

Always return valid JSON, nothing else.`;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { request, offers } = req.body;

  if (!request || !offers || !Array.isArray(offers)) {
    return res.status(400).json({ error: 'Missing "request" object or "offers" array' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const prompt = `${SYSTEM_PROMPT}

REQUEST:
${JSON.stringify(request, null, 2)}

OFFERS:
${JSON.stringify(offers, null, 2)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const raw = response.text.trim();
    const jsonStr = raw.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
    const parsed = JSON.parse(jsonStr);

    return res.status(200).json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error('Gemini match error:', error);
    return res.status(500).json({
      error: 'Failed to find matches',
      details: error.message,
    });
  }
}
