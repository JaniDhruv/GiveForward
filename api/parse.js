import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are a structured data parser for GiveForward, a generosity platform that connects people who need help with people ready to give it.

Given a natural language description of what someone needs OR what someone can offer, extract structured data.

Return ONLY valid JSON with this exact shape:
{
  "type": "need" | "offer",
  "title": "short 5-8 word summary",
  "description": "cleaned up version of their message (1-2 sentences)",
  "category": one of ["education", "food", "tech", "time", "items", "skills", "health", "transport", "housing", "other"],
  "tags": ["tag1", "tag2", "tag3"] (2-4 relevant tags),
  "availability": "when they're available (if mentioned, else null)",
  "location": "location if mentioned, else null",
  "estimatedTime": "estimated time commitment if applicable, else null"
}

Examples:
Input: "I have some old textbooks and a little free time on weekends to help students"
Output: {"type":"offer","title":"Textbooks and weekend tutoring available","description":"Has old textbooks to give away and free time on weekends to help students.","category":"education","tags":["textbooks","tutoring","weekends"],"availability":"Weekends","location":null,"estimatedTime":"A few hours per weekend"}

Input: "My laptop broke and I can't afford a new one, I need it for my online classes"
Output: {"type":"need","title":"Needs a laptop for online classes","description":"Student whose laptop broke and cannot afford a replacement. Needs it for online coursework.","category":"tech","tags":["laptop","student","online-learning"],"availability":null,"location":null,"estimatedTime":null}

Be generous in interpretation. If the type isn't explicitly stated, infer from context. Always return valid JSON, nothing else.`;

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

  const { text } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Missing or empty "text" field' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `${SYSTEM_PROMPT}\n\nInput: "${text.trim()}"`,
    });

    const raw = response.text.trim();

    // Strip markdown code fences if present
    const jsonStr = raw.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();

    const parsed = JSON.parse(jsonStr);

    return res.status(200).json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error('Gemini parse error:', error);
    return res.status(500).json({
      error: 'Failed to parse text',
      details: error.message,
    });
  }
}
