// src/api/gemini.ts
// Utility to call Gemini proxy for chemical reaction analysis with optional context metadata

// NOTE: For production consider using a relative path: const API_URL = '/api/gemini';
const API_URL = 'https://virtual-lab-navy.vercel.app/api/gemini';

export interface GeminiAnalysis {
  result: string;
  analysis: string;
  raw?: unknown;
}

export interface ReactionContext {
  temperatureC?: number;        // current temperature in Celsius
  heating?: boolean;            // whether user clicked heat / is heating
  ph?: number;                  // approximate pH of mixture
  notes?: string;               // extra freeform context
  volumes?: { [chemicalName: string]: number }; // ml of each chemical
}

interface GeminiRequestBody {
  reactantNames: string[];
  // We piggyback context by synthesizing extra pseudo-reactant lines if server not updated;
  // but simplest is to include an extra synthetic name array entry server already concatenates.
  // For cleanliness, we also send a meta field in case server evolves to use it.
  meta?: ReactionContext;
}

// Helper to build augmented reactant list carrying context if backend not yet context-aware
function buildReactantPayload(reactantNames: string[], ctx?: ReactionContext): GeminiRequestBody {
  if (!ctx) return { reactantNames };
  const contextFragments: string[] = [];
  if (typeof ctx.temperatureC === 'number') contextFragments.push(`Temperature=${ctx.temperatureC}C`);
  if (typeof ctx.heating === 'boolean') contextFragments.push(`Heating=${ctx.heating ? 'Yes' : 'No'}`);
  if (typeof ctx.ph === 'number') contextFragments.push(`pH=${ctx.ph.toFixed(2)}`);
  if (ctx.notes) contextFragments.push(`Notes=${ctx.notes}`);
  const contextLine = contextFragments.length ? `__CONTEXT__ ${contextFragments.join('; ')}` : '';
  return contextLine ? { reactantNames: [...reactantNames, contextLine], meta: ctx } : { reactantNames, meta: ctx };
}

export async function getGeminiReactionAnalysis(reactantNames: string[], context?: ReactionContext): Promise<GeminiAnalysis> {
  try {
    const body = buildReactantPayload(reactantNames, context);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('Gemini proxy fetch failed', response.status, text);
      throw new Error(`Failed to fetch Gemini API result (${response.status})`);
    }

    const data = await response.json();
    // Post-formatting: normalize line breaks & bullet lists for UI readability
    const format = (txt: string) => txt
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/(Reaction|Products|Analysis)\s*:/g, (m)=>`\n${m}`)
      .trim();
    return { result: format(data.result || ''), analysis: format(data.analysis || ''), raw: data.raw };
  } catch (err) {
    console.error('Gemini analysis request error:', err);
    throw err;
  }
}


