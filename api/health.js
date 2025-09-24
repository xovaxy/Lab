export default async function handler(_req, res) {
  const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  return res.status(200).json({ status: 'ok', model: GEMINI_MODEL, hasKey });
}

