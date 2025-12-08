import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';

const providers = [
  { id: 'openai', name: 'OpenAI GPT-4/4o', status: 'available' },
  { id: 'anthropic', name: 'Anthropic Claude', status: 'available' },
  { id: 'gemini', name: 'Google Gemini', status: 'available' },
  { id: 'local', name: 'Local/Ollama', status: 'available' },
];

export class AIController {
  listProviders(req: AuthRequest, res: Response) {
    res.json({ providers });
  }

  analyze(req: AuthRequest, res: Response) {
    const { symptoms = [], age, sex, provider = 'local' } = req.body || {};
    const chief = symptoms.slice(0, 3).join(', ') || 'unspecified';
    const suggestions = [
      {
        diagnosis: 'Post-viral cough',
        icd10Code: 'R05.8',
        confidence: 0.32,
        reasoning: ['Recent URI', 'No red flags', 'Subacute duration'],
        supportingEvidence: symptoms,
        recommendedTests: ['Spirometry with bronchodilator', 'CXR if persistent >6 weeks'],
        urgency: 'low',
        differentialRank: 1,
        evidenceLevel: 'III',
      },
      {
        diagnosis: 'Asthma (cough-variant)',
        icd10Code: 'J45.9',
        confidence: 0.28,
        reasoning: ['Nocturnal cough', 'Possible hyperreactivity'],
        supportingEvidence: symptoms,
        recommendedTests: ['FeNO', 'Trial ICS/LABA'],
        urgency: 'medium',
        differentialRank: 2,
        evidenceLevel: 'II',
      },
    ];

    res.json({
      provider,
      chiefComplaint: chief,
      age,
      sex,
      suggestions,
      plan: [
        'Rule out red flags (hemoptysis, weight loss, smoking history)',
        'If red flags absent, spirometry + trial ICS',
      ],
      guardrails: ['Human-in-the-loop required', 'Do not auto-order tests'],
    });
  }
}

export const aiController = new AIController();
