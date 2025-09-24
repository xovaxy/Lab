export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const reactantNames = req.body?.reactantNames;
  if (!Array.isArray(reactantNames) || reactantNames.length === 0 || !reactantNames.every(r => typeof r === 'string')) {
    return res.status(400).json({ error: 'reactantNames must be a non-empty array of strings' });
  }

  const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY missing in environment' });
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const prompt = `Given the following chemicals: ${reactantNames.join(', ')}, describe the reaction that occurs, the products, and a brief analysis of the process. If no reaction occurs, state so. Provide clear separation: Reaction:, Products:, Analysis:`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Gemini API request failed', status: response.status, details: data });
    }

    const fullText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    let result = fullText;
    let analysis = '';
    if (fullText.includes('Analysis:')) {
      const parts = fullText.split(/Analysis:/i);
      result = parts[0].trim();
      analysis = parts.slice(1).join('Analysis:').trim();
    }
    if (!result) result = 'No analysis available.';
    if (!analysis) analysis = 'No further analysis.';

    return res.status(200).json({ result, analysis });
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Gemini request timed out' });
    }
    return res.status(500).json({ error: 'Server exception calling Gemini', details: err.message });
  }
}

