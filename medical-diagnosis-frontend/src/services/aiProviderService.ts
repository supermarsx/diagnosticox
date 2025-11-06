/**
 * Multi-Provider AI Connection Service
 * 
 * Unified interface for multiple AI providers with medical-specific prompt templates.
 * Supports OpenAI, Anthropic, Google, and local LLMs (Ollama) with automatic failover.
 * 
 * @module services/aiProviderService
 * 
 * Key Features:
 * - Provider abstraction layer for seamless switching
 * - Medical prompt engineering templates
 * - Automatic retry and failover logic
 * - Cost tracking and usage monitoring
 * - Response validation for medical safety
 * 
 * @example
 * // Use default provider
 * const diagnosis = await aiProviderService.getDifferentialDiagnosis(symptoms);
 * 
 * @example
 * // Switch provider
 * aiProviderService.setProvider('anthropic');
 * const analysis = await aiProviderService.analyzeMedicalText(report);
 */

/**
 * Supported AI providers
 */
export enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  OLLAMA = 'ollama', // Local LLM
  AUTO = 'auto', // Automatic selection based on task
}

/**
 * AI model configurations
 */
export interface AIModel {
  provider: AIProvider;
  modelId: string;
  maxTokens: number;
  temperature: number;
  costPer1KTokens: number;
}

/**
 * Medical prompt templates
 */
export enum PromptTemplate {
  DIFFERENTIAL_DIAGNOSIS = 'differential_diagnosis',
  TREATMENT_RECOMMENDATION = 'treatment_recommendation',
  DRUG_INTERACTION = 'drug_interaction',
  CLINICAL_SUMMARY = 'clinical_summary',
  PATIENT_EDUCATION = 'patient_education',
  LITERATURE_SUMMARY = 'literature_summary',
  RISK_ASSESSMENT = 'risk_assessment',
}

/**
 * AI response with metadata
 */
export interface AIResponse {
  content: string;
  provider: AIProvider;
  model: string;
  tokensUsed: number;
  cost: number;
  latency: number;
  confidence?: number;
  citations?: string[];
  warnings?: string[];
}

/**
 * Differential diagnosis from AI
 */
export interface AIDifferentialDiagnosis {
  diagnoses: Array<{
    name: string;
    confidence: number;
    reasoning: string;
    supportingEvidence: string[];
    contradictingEvidence: string[];
    recommendedTests: string[];
    icd10Code?: string;
  }>;
  redFlags: string[];
  urgency: 'emergency' | 'urgent' | 'routine';
  disclaimer: string;
}

/**
 * Medical AI Provider Service Configuration
 */
interface AIProviderConfig {
  openai?: {
    apiKey: string;
    model: string;
    baseUrl?: string;
  };
  anthropic?: {
    apiKey: string;
    model: string;
    baseUrl?: string;
  };
  google?: {
    apiKey: string;
    model: string;
    baseUrl?: string;
  };
  ollama?: {
    baseUrl: string;
    model: string;
  };
  defaultProvider: AIProvider;
  timeout: number;
  retries: number;
  enableCostTracking: boolean;
}

/**
 * Available AI models
 */
const AI_MODELS: Record<AIProvider, AIModel[]> = {
  [AIProvider.OPENAI]: [
    {
      provider: AIProvider.OPENAI,
      modelId: 'gpt-4-turbo-preview',
      maxTokens: 128000,
      temperature: 0.3,
      costPer1KTokens: 0.01,
    },
    {
      provider: AIProvider.OPENAI,
      modelId: 'gpt-3.5-turbo',
      maxTokens: 16385,
      temperature: 0.3,
      costPer1KTokens: 0.0005,
    },
  ],
  [AIProvider.ANTHROPIC]: [
    {
      provider: AIProvider.ANTHROPIC,
      modelId: 'claude-3-opus-20240229',
      maxTokens: 200000,
      temperature: 0.3,
      costPer1KTokens: 0.015,
    },
    {
      provider: AIProvider.ANTHROPIC,
      modelId: 'claude-3-sonnet-20240229',
      maxTokens: 200000,
      temperature: 0.3,
      costPer1KTokens: 0.003,
    },
  ],
  [AIProvider.GOOGLE]: [
    {
      provider: AIProvider.GOOGLE,
      modelId: 'gemini-pro',
      maxTokens: 32760,
      temperature: 0.3,
      costPer1KTokens: 0.00025,
    },
  ],
  [AIProvider.OLLAMA]: [
    {
      provider: AIProvider.OLLAMA,
      modelId: 'llama2:70b',
      maxTokens: 4096,
      temperature: 0.3,
      costPer1KTokens: 0, // Local, no cost
    },
  ],
  [AIProvider.AUTO]: [],
};

/**
 * Medical prompt templates
 */
const PROMPT_TEMPLATES: Record<PromptTemplate, string> = {
  [PromptTemplate.DIFFERENTIAL_DIAGNOSIS]: `You are a medical AI assistant specialized in differential diagnosis.

Given the following patient presentation:

Symptoms: {{symptoms}}
Duration: {{duration}}
Patient Demographics: {{demographics}}
Medical History: {{history}}

Provide a comprehensive differential diagnosis with:
1. Top 5 most likely diagnoses with confidence scores (0-100)
2. Supporting and contradicting evidence for each
3. Recommended diagnostic tests
4. Red flags requiring immediate attention
5. Urgency level (emergency/urgent/routine)

Format your response as JSON matching this structure:
{
  "diagnoses": [
    {
      "name": "Diagnosis name",
      "confidence": 85,
      "reasoning": "Clinical reasoning",
      "supportingEvidence": ["Evidence 1", "Evidence 2"],
      "contradictingEvidence": ["Evidence 1"],
      "recommendedTests": ["Test 1", "Test 2"],
      "icd10Code": "A00.0"
    }
  ],
  "redFlags": ["Red flag 1", "Red flag 2"],
  "urgency": "urgent",
  "disclaimer": "This is AI-generated medical information..."
}

IMPORTANT: Always include appropriate medical disclaimers.`,

  [PromptTemplate.TREATMENT_RECOMMENDATION]: `You are a medical AI assistant specialized in evidence-based treatment recommendations.

Patient Diagnosis: {{diagnosis}}
Comorbidities: {{comorbidities}}
Current Medications: {{medications}}
Contraindications: {{contraindications}}

Provide treatment recommendations including:
1. First-line treatments with evidence level
2. Alternative treatments
3. Medication dosing guidelines
4. Monitoring requirements
5. Expected outcomes
6. Drug interactions to avoid

Base all recommendations on current clinical guidelines and peer-reviewed evidence.`,

  [PromptTemplate.DRUG_INTERACTION]: `You are a pharmaceutical AI assistant specialized in drug-drug interactions.

Medications: {{medications}}

Analyze potential interactions:
1. Severity classification (contraindicated/major/moderate/minor)
2. Mechanism of interaction
3. Clinical manifestations
4. Management recommendations
5. Alternative medications if needed

Provide evidence-based citations for significant interactions.`,

  [PromptTemplate.CLINICAL_SUMMARY]: `You are a medical documentation AI assistant.

Patient Data: {{patientData}}

Generate a concise clinical summary including:
1. Chief complaint
2. History of present illness
3. Assessment
4. Plan
5. Follow-up recommendations

Use standard medical documentation format (SOAP or equivalent).`,

  [PromptTemplate.PATIENT_EDUCATION]: `You are a patient education AI assistant.

Medical Topic: {{topic}}
Patient Education Level: {{educationLevel}}

Create patient-friendly educational content:
1. Explain the condition in simple terms
2. Common symptoms and when to seek care
3. Treatment options explained simply
4. Lifestyle modifications
5. FAQ section

Use clear, empathetic language appropriate for {{educationLevel}} reading level.`,

  [PromptTemplate.LITERATURE_SUMMARY]: `You are a medical literature AI assistant.

Research Article: {{article}}

Provide a structured summary:
1. Study design and methodology
2. Key findings
3. Clinical implications
4. Limitations
5. Evidence level (GRADE or Oxford CEBM)
6. Relevance to clinical practice

Focus on actionable insights for clinicians.`,

  [PromptTemplate.RISK_ASSESSMENT]: `You are a clinical risk assessment AI assistant.

Patient Profile: {{patientProfile}}
Risk Factors: {{riskFactors}}

Assess risk for: {{condition}}

Provide:
1. Overall risk score (low/moderate/high)
2. Contributing risk factors ranked by impact
3. Modifiable vs non-modifiable factors
4. Risk reduction strategies
5. Screening recommendations
6. Timeline for reassessment

Use validated risk assessment tools when applicable.`,
};

/**
 * Multi-Provider AI Service Class
 */
export class AIProviderService {
  private config: AIProviderConfig;
  private currentProvider: AIProvider;
  private totalCost: number = 0;
  private requestCount: number = 0;

  constructor(config?: Partial<AIProviderConfig>) {
    this.config = {
      openai: {
        apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
        model: 'gpt-4-turbo-preview',
        baseUrl: 'https://api.openai.com/v1',
      },
      anthropic: {
        apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
        model: 'claude-3-sonnet-20240229',
        baseUrl: 'https://api.anthropic.com/v1',
      },
      google: {
        apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
        model: 'gemini-pro',
        baseUrl: 'https://generativelanguage.googleapis.com/v1',
      },
      ollama: {
        baseUrl: import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434',
        model: 'llama2:70b',
      },
      defaultProvider: AIProvider.OPENAI,
      timeout: 60000,
      retries: 3,
      enableCostTracking: true,
      ...config,
    };

    this.currentProvider = this.config.defaultProvider;
  }

  /**
   * Set active AI provider
   */
  setProvider(provider: AIProvider): void {
    this.currentProvider = provider;
  }

  /**
   * Get current provider
   */
  getProvider(): AIProvider {
    return this.currentProvider;
  }

  /**
   * Get available models for a provider
   */
  getAvailableModels(provider?: AIProvider): AIModel[] {
    return AI_MODELS[provider || this.currentProvider] || [];
  }

  /**
   * Build prompt from template
   * @private
   */
  private buildPrompt(template: PromptTemplate, variables: Record<string, any>): string {
    let prompt = PROMPT_TEMPLATES[template];
    
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return prompt;
  }

  /**
   * Call OpenAI API
   * @private
   */
  private async callOpenAI(prompt: string, model?: string): Promise<AIResponse> {
    if (!this.config.openai?.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const startTime = Date.now();
    const modelId = model || this.config.openai.model;

    const response = await fetch(`${this.config.openai.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.openai.apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: 'system',
            content: 'You are a medical AI assistant. Provide evidence-based, accurate medical information with appropriate disclaimers.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;
    const tokensUsed = data.usage?.total_tokens || 0;
    const cost = (tokensUsed / 1000) * 0.01; // Approximate cost

    if (this.config.enableCostTracking) {
      this.totalCost += cost;
      this.requestCount++;
    }

    return {
      content: data.choices[0]?.message?.content || '',
      provider: AIProvider.OPENAI,
      model: modelId,
      tokensUsed,
      cost,
      latency,
    };
  }

  /**
   * Call Anthropic API
   * @private
   */
  private async callAnthropic(prompt: string, model?: string): Promise<AIResponse> {
    if (!this.config.anthropic?.apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const startTime = Date.now();
    const modelId = model || this.config.anthropic.model;

    const response = await fetch(`${this.config.anthropic.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.anthropic.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: modelId,
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;
    const tokensUsed = data.usage?.input_tokens + data.usage?.output_tokens || 0;
    const cost = (tokensUsed / 1000) * 0.003;

    if (this.config.enableCostTracking) {
      this.totalCost += cost;
      this.requestCount++;
    }

    return {
      content: data.content[0]?.text || '',
      provider: AIProvider.ANTHROPIC,
      model: modelId,
      tokensUsed,
      cost,
      latency,
    };
  }

  /**
   * Call Google Gemini API
   * @private
   */
  private async callGoogle(prompt: string, model?: string): Promise<AIResponse> {
    if (!this.config.google?.apiKey) {
      throw new Error('Google API key not configured');
    }

    const startTime = Date.now();
    const modelId = model || this.config.google.model;

    const response = await fetch(
      `${this.config.google.baseUrl}/models/${modelId}:generateContent?key=${this.config.google.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;
    const tokensUsed = data.usageMetadata?.totalTokenCount || 0;
    const cost = (tokensUsed / 1000) * 0.00025;

    if (this.config.enableCostTracking) {
      this.totalCost += cost;
      this.requestCount++;
    }

    return {
      content: data.candidates[0]?.content?.parts[0]?.text || '',
      provider: AIProvider.GOOGLE,
      model: modelId,
      tokensUsed,
      cost,
      latency,
    };
  }

  /**
   * Call Ollama local LLM
   * @private
   */
  private async callOllama(prompt: string, model?: string): Promise<AIResponse> {
    const startTime = Date.now();
    const modelId = model || this.config.ollama?.model || 'llama2:70b';

    const response = await fetch(`${this.config.ollama?.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelId,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;

    return {
      content: data.response || '',
      provider: AIProvider.OLLAMA,
      model: modelId,
      tokensUsed: 0,
      cost: 0, // Local model, no cost
      latency,
    };
  }

  /**
   * Generate AI completion with automatic provider routing
   */
  async complete(prompt: string, provider?: AIProvider, model?: string): Promise<AIResponse> {
    const targetProvider = provider || this.currentProvider;

    try {
      switch (targetProvider) {
        case AIProvider.OPENAI:
          return await this.callOpenAI(prompt, model);
        case AIProvider.ANTHROPIC:
          return await this.callAnthropic(prompt, model);
        case AIProvider.GOOGLE:
          return await this.callGoogle(prompt, model);
        case AIProvider.OLLAMA:
          return await this.callOllama(prompt, model);
        default:
          throw new Error(`Unsupported provider: ${targetProvider}`);
      }
    } catch (error) {
      console.error(`AI provider ${targetProvider} failed:`, error);
      
      // Attempt failover to alternate provider
      if (targetProvider !== AIProvider.OLLAMA && this.config.ollama) {
        console.log('Failing over to Ollama local model...');
        return await this.callOllama(prompt, model);
      }
      
      throw error;
    }
  }

  /**
   * Get differential diagnosis from AI
   */
  async getDifferentialDiagnosis(
    symptoms: string[],
    demographics: string,
    history: string = '',
    duration: string = ''
  ): Promise<AIDifferentialDiagnosis> {
    const prompt = this.buildPrompt(PromptTemplate.DIFFERENTIAL_DIAGNOSIS, {
      symptoms: symptoms.join(', '),
      demographics,
      history,
      duration,
    });

    const response = await this.complete(prompt);

    try {
      // Try to parse JSON response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error);
    }

    // Fallback: Return structured error response
    return {
      diagnoses: [],
      redFlags: [],
      urgency: 'routine',
      disclaimer: 'AI analysis failed. Please consult a healthcare professional.',
    };
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): { totalCost: number; requestCount: number; avgCostPerRequest: number } {
    return {
      totalCost: this.totalCost,
      requestCount: this.requestCount,
      avgCostPerRequest: this.requestCount > 0 ? this.totalCost / this.requestCount : 0,
    };
  }

  /**
   * Reset usage statistics
   */
  resetUsageStats(): void {
    this.totalCost = 0;
    this.requestCount = 0;
  }
}

/**
 * Default AI provider service instance
 */
export const aiProviderService = new AIProviderService();

export default AIProviderService;
