export interface AISuggestion {
  diagnosis: string;
  icd10Code: string;
  confidence: number;
  reasoning: string[];
  recommendedTests: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface AIAnalyzeResponse {
  provider: string;
  chiefComplaint: string;
  suggestions: AISuggestion[];
  plan: string[];
  guardrails: string[];
}

export async function listProviders() {
  const res = await fetch('/api/ai/providers');
  if (!res.ok) throw new Error('Failed to load AI providers');
  return res.json();
}

export async function analyzeSymptoms(payload: { symptoms: string[]; age?: number; sex?: string; provider?: string }) {
  const res = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('AI analysis failed');
  return res.json() as Promise<AIAnalyzeResponse>;
}
