// server.js
// Simple Node.js Express proxy for Gemini API

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// POST /api/gemini
app.post('/api/gemini', async (req, res) => {
  const { reactantNames } = req.body;
  const apiKey = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  const prompt = `Given the following chemicals: ${reactantNames.join(", ")}, describe the reaction that occurs, the products, and a brief analysis of the process. If no reaction occurs, state so.`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis available.';
    res.json({ result: text.split('Analysis:')[0].trim(), analysis: text.split('Analysis:')[1]?.trim() || 'No further analysis.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Gemini API result', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Gemini proxy server running on port ${PORT}`);
});
