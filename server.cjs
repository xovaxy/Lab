// server.cjs
// Enhanced Node.js Express proxy for Gemini API (CommonJS)

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Prefer built-in global fetch in Node 18+, otherwise fallback to dynamic import
let fetchFn = global.fetch;
if (typeof fetchFn !== 'function') {
  fetchFn = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
}

const app = express();
const PORT = process.env.PORT || 5001;
// Allow user to configure model; modern Gemini v1 models are like:
// gemini-1.5-flash, gemini-1.5-pro, gemini-1.5-flash-latest, etc.
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

// Basic request logging middleware
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', model: GEMINI_MODEL, hasKey: !!process.env.GEMINI_API_KEY });
});

// Validate body helper
function validateReactantNames(reactantNames) {
  if (!Array.isArray(reactantNames) || reactantNames.length === 0) {
    return 'reactantNames must be a non-empty array of strings';
  }
  if (!reactantNames.every(r => typeof r === 'string')) {
    return 'Each reactant name must be a string';
  }
  return null;
}

// POST /api/gemini
app.post('/api/gemini', async (req, res) => {
  const { reactantNames } = req.body || {};
  const validationError = validateReactantNames(reactantNames);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY missing in environment' });
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const prompt = `Given the following chemicals: ${reactantNames.join(', ')}, describe the reaction that occurs, the products, and a brief analysis of the process. If no reaction occurs, state so. Provide clear separation: Reaction:, Products:, Analysis:`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const response = await fetchFn(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Gemini API error status', response.status, data);

      // Automatic fallback if model not found (404) and user didn't explicitly set a model
      if (response.status === 404 && !process.env.GEMINI_MODEL) {
        const fallback = 'gemini-1.5-flash';
        if (fallback !== GEMINI_MODEL) {
          console.log(`Attempting fallback model: ${fallback}`);
          const fbEndpoint = `https://generativelanguage.googleapis.com/v1/models/${fallback}:generateContent?key=${apiKey}`;
          const fbResp = await fetchFn(fbEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });
          const fbData = await fbResp.json().catch(() => ({}));
          if (!fbResp.ok) {
            return res.status(fbResp.status).json({ error: 'Gemini API request failed (fallback)', status: fbResp.status, details: fbData });
          }
          const fbText = fbData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          let fbResult = fbText;
          let fbAnalysis = '';
            if (fbText.includes('Analysis:')) {
              const parts = fbText.split(/Analysis:/i);
              fbResult = parts[0].trim();
              fbAnalysis = parts.slice(1).join('Analysis:').trim();
            }
            if (!fbResult) fbResult = 'No analysis available.';
            if (!fbAnalysis) fbAnalysis = 'No further analysis.';
            return res.json({ result: fbResult, analysis: fbAnalysis, modelUsed: fallback });
        }
      }
      return res.status(response.status).json({ error: 'Gemini API request failed', status: response.status, details: data });
    }

    const fullText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    // Basic parsing heuristic
    let result = fullText;
    let analysis = '';
    if (fullText.includes('Analysis:')) {
      const parts = fullText.split(/Analysis:/i);
      result = parts[0].trim();
      analysis = parts.slice(1).join('Analysis:').trim();
    }
    if (!result) result = 'No analysis available.';
    if (!analysis) analysis = 'No further analysis.';

    res.json({ result, analysis, raw: process.env.NODE_ENV === 'development' ? data : undefined });
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Gemini request timed out' });
    }
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server exception calling Gemini', details: err.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

app.listen(PORT, () => {
  console.log(`Gemini proxy server running on port ${PORT}`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn('WARNING: GEMINI_API_KEY is not set. Requests will fail.');
  }
});
