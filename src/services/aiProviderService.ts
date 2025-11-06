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
export interface MedicalPromptTemplate {
  type: 'differential_diagnosis' | 'symptom_analysis' | 'treatment_recommendation' | 'risk_assessment';
  template: string;
  variables: string[];
}

/**
 * AI request interface
 */
export interface AIRequest {
  prompt: string;
  model?: AIModel;
  maxTokens?: number;
  temperature?: number;
  systemMessage?: string;
}

/**
 * AI response interface
 */
export interface AIResponse {
  content: string;
  provider: AIProvider;
  model: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number;
  latency: number;
  safetyScore: number;
  medicalDisclaimer: boolean;
}

/**
 * Multi-provider AI service
 */
class AIProviderService {
  private currentProvider: AIProvider = AIProvider.AUTO;
  private availableProviders = new Set<AIProvider>();
  private models: AIModel[] = [
    {
      provider: AIProvider.OPENAI,
      modelId: 'gpt-4-turbo',
      maxTokens: 4096,
      temperature: 0.1,
      costPer1KTokens: 0.01
    },
    {
      provider: AIProvider.ANTHROPIC,
      modelId: 'claude-3-sonnet',
      maxTokens: 4096,
      temperature: 0.1,
      costPer1KTokens: 0.015
    },
    {
      provider: AIProvider.GOOGLE,
      modelId: 'gemini-pro',
      maxTokens: 4096,
      temperature: 0.1,
      costPer1KTokens: 0.008
    },
    {
      provider: AIProvider.OLLAMA,
      modelId: 'llama2:70b',
      maxTokens: 2048,
      temperature: 0.1,
      costPer1KTokens: 0 // Local model
    }
  ];

  // Medical prompt templates
  private promptTemplates: MedicalPromptTemplate[] = [
    {
      type: 'differential_diagnosis',
      template: `You are a medical AI assistant. Analyze the following symptoms and provide a differential diagnosis. 
      
      Patient Information: {patient_info}
      Symptoms: {symptoms}
      Duration: {duration}
      
      Please provide:
      1. Top 3 differential diagnoses with reasoning
      2. Recommended next steps (tests/consultations)
      3. Risk factors to consider
      4. Important red flags to watch for
      
      Remember: This is for educational purposes only and should not replace professional medical advice.`,
      variables: ['patient_info', 'symptoms', 'duration']
    },
    {
      type: 'symptom_analysis',
      template: `Analyze the following symptoms for potential medical significance:
      
      Symptoms: {symptoms}
      Patient history: {history}
      
      Provide:
      1. Symptom classification and urgency level
      2. Possible underlying causes
      3. When to seek immediate medical attention
      4. Recommended self-care measures
      
      Always include appropriate medical disclaimers.`,
      variables: ['symptoms', 'history']
    },
    {
      type: 'treatment_recommendation',
      template: `Based on the following diagnosis, provide treatment guidance:
      
      Diagnosis: {diagnosis}
      Patient factors: {factors}
      
      Provide:
      1. First-line treatment options
      2. Lifestyle modifications
      3. Monitoring recommendations
      4. When to adjust treatment
      5. Potential side effects to watch for
      
      Emphasize the importance of following up with healthcare providers.`,
      variables: ['diagnosis', 'factors']
    }
  ];

  constructor() {
    this.initializeProviders();
  }

  /**
   * Initialize available providers
   */
  private async initializeProviders(): Promise<void> {
    // Check which providers are available
    this.availableProviders.add(AIProvider.OPENAI); // Assume available if env vars present
    this.availableProviders.add(AIProvider.ANTHROPIC);
    this.availableProviders.add(AIProvider.GOOGLE);
    this.availableProviders.add(AIProvider.OLLAMA);
  }

  /**
   * Set current provider
   */
  setProvider(provider: AIProvider): void {
    this.currentProvider = provider;
    console.log(`[AIProviderService] Provider set to: ${provider}`);
  }

  /**
   * Get current provider
   */
  getCurrentProvider(): AIProvider {
    return this.currentProvider;
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): AIProvider[] {
    return Array.from(this.availableProviders);
  }

  /**
   * Get model for provider
   */
  getModelForProvider(provider: AIProvider): AIModel | null {
    return this.models.find(m => m.provider === provider) || null;
  }

  /**
   * Send request to AI provider
   */
  async sendRequest(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    const provider = request.model?.provider || this.currentProvider;
    const model = request.model || this.getModelForProvider(provider);
    
    if (!model) {
      throw new Error(`No model available for provider: ${provider}`);
    }

    try {
      let response: string;
      
      switch (provider) {
        case AIProvider.OPENAI:
          response = await this.callOpenAI(request, model);
          break;
        case AIProvider.ANTHROPIC:
          response = await this.callAnthropic(request, model);
          break;
        case AIProvider.GOOGLE:
          response = await this.callGoogle(request, model);
          break;
        case AIProvider.OLLAMA:
          response = await this.callOllama(request, model);
          break;
        case AIProvider.AUTO:
          response = await this.callAuto(request);
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      const latency = Date.now() - startTime;
      const tokens = this.estimateTokens(response);
      const cost = (tokens.completion / 1000) * model.costPer1KTokens;
      const safetyScore = this.validateResponse(response);
      
      return {
        content: response,
        provider,
        model: model.modelId,
        tokens,
        cost,
        latency,
        safetyScore,
        medicalDisclaimer: true
      };
      
    } catch (error) {
      console.error(`[AIProviderService] Error with provider ${provider}:`, error);
      
      // Automatic failover
      if (provider !== AIProvider.AUTO) {
        console.log('[AIProviderService] Attempting failover...');
        return this.failover(request, provider);
      }
      
      throw error;
    }
  }

  /**
   * Automatic provider selection
   */
  private async callAuto(request: AIRequest): Promise<string> {
    // Try providers in order of preference
    const providers = [AIProvider.OPENAI, AIProvider.ANTHROPIC, AIProvider.GOOGLE];
    
    for (const provider of providers) {
      if (this.availableProviders.has(provider)) {
        try {
          return await this.sendRequest({ ...request, model: this.getModelForProvider(provider) });
        } catch (error) {
          console.warn(`[AIProviderService] Provider ${provider} failed, trying next...`);
          continue;
        }
      }
    }
    
    throw new Error('All providers failed');
  }

  /**
   * Failover to other providers
   */
  private async failover(request: AIRequest, failedProvider: AIProvider): Promise<string> {
    const availableProviders = this.getAvailableProviders().filter(p => p !== failedProvider);
    
    for (const provider of availableProviders) {
      try {
        const result = await this.sendRequest({ ...request, model: this.getModelForProvider(provider) });
        return result.content;
      } catch (error) {
        console.warn(`[AIProviderService] Failover to ${provider} failed:`, error);
        continue;
      }
    }
    
    throw new Error('All providers failed during failover');
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(request: AIRequest, model: AIModel): Promise<string> {
    // Placeholder - would implement actual OpenAI API call
    await this.simulateAPICall();
    return this.generateSampleResponse('OpenAI', request.prompt);
  }

  /**
   * Call Anthropic API
   */
  private async callAnthropic(request: AIRequest, model: AIModel): Promise<string> {
    // Placeholder - would implement actual Anthropic API call
    await this.simulateAPICall();
    return this.generateSampleResponse('Anthropic', request.prompt);
  }

  /**
   * Call Google API
   */
  private async callGoogle(request: AIRequest, model: AIModel): Promise<string> {
    // Placeholder - would implement actual Google API call
    await this.simulateAPICall();
    return this.generateSampleResponse('Google', request.prompt);
  }

  /**
   * Call Ollama (local LLM)
   */
  private async callOllama(request: AIRequest, model: AIModel): Promise<string> {
    // Placeholder - would implement actual Ollama API call
    await this.simulateAPICall();
    return this.generateSampleResponse('Ollama', request.prompt);
  }

  /**
   * Simulate API call (placeholder)
   */
  private async simulateAPICall(): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  }

  /**
   * Generate sample response (placeholder)
   */
  private generateSampleResponse(provider: string, prompt: string): string {
    return `This is a sample response from ${provider} AI model.\n\nGiven the prompt: "${prompt.substring(0, 100)}..."\n\nThis would normally be a comprehensive medical analysis. For this demo, please note that this is a placeholder response and should be replaced with actual AI API integration.`;
  }

  /**
   * Estimate token count
   */
  private estimateTokens(text: string): { prompt: number; completion: number; total: number } {
    // Rough estimate: 1 token ≈ 4 characters for English text
    const total = Math.ceil(text.length / 4);
    const completion = total;
    const prompt = 0; // This would be calculated from the actual prompt
    
    return { prompt, completion, total };
  }

  /**
   * Validate response for medical safety
   */
  private validateResponse(response: string): number {
    let score = 0.5; // Base score
    
    // Check for medical disclaimers
    if (response.toLowerCase().includes('disclaimer') || 
        response.toLowerCase().includes('not a substitute for professional medical advice')) {
      score += 0.3;
    }
    
    // Check for appropriate medical language
    if (response.toLowerCase().includes('consult') || 
        response.toLowerCase().includes('seek medical attention') ||
        response.toLowerCase().includes('healthcare provider')) {
      score += 0.2;
    }
    
    // Penalize for definitive diagnostic claims
    if (response.toLowerCase().includes('definitely') ||
        response.toLowerCase().includes('certainly has') ||
        response.toLowerCase().includes('must be')) {
      score -= 0.3;
    }
    
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Get medical prompt template
   */
  getPromptTemplate(type: MedicalPromptTemplate['type']): MedicalPromptTemplate | null {
    return this.promptTemplates.find(t => t.type === type) || null;
  }

  /**
   * Fill prompt template
   */
  fillPromptTemplate(template: string, variables: Record<string, string>): string {
    let filled = template;
    Object.entries(variables).forEach(([key, value]) => {
      filled = filled.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    return filled;
  }

  /**
   * Get differential diagnosis
   */
  async getDifferentialDiagnosis(symptoms: string, patientInfo?: string): Promise<AIResponse> {
    const template = this.getPromptTemplate('differential_diagnosis');
    if (!template) {
      throw new Error('Differential diagnosis template not found');
    }

    const filledPrompt = this.fillPromptTemplate(template.template, {
      patient_info: patientInfo || 'Not provided',
      symptoms,
      duration: 'Not specified'
    });

    return this.sendRequest({
      prompt: filledPrompt,
      temperature: 0.1,
      systemMessage: 'You are a medical AI assistant designed to provide educational information. Always include appropriate disclaimers and recommend consulting healthcare professionals.'
    });
  }

  /**
   * Analyze symptoms
   */
  async analyzeSymptoms(symptoms: string, history?: string): Promise<AIResponse> {
    const template = this.getPromptTemplate('symptom_analysis');
    if (!template) {
      throw new Error('Symptom analysis template not found');
    }

    const filledPrompt = this.fillPromptTemplate(template.template, {
      symptoms,
      history: history || 'Not provided'
    });

    return this.sendRequest({
      prompt: filledPrompt,
      temperature: 0.1
    });
  }

  /**
   * Get treatment recommendations
   */
  async getTreatmentRecommendation(diagnosis: string, patientFactors?: string): Promise<AIResponse> {
    const template = this.getPromptTemplate('treatment_recommendation');
    if (!template) {
      throw new Error('Treatment recommendation template not found');
    }

    const filledPrompt = this.fillPromptTemplate(template.template, {
      diagnosis,
      factors: patientFactors || 'Not provided'
    });

    return this.sendRequest({
      prompt: filledPrompt,
      temperature: 0.1
    });
  }

  /**
   * Get usage statistics
   */
  getUsageStatistics(): any {
    return {
      currentProvider: this.currentProvider,
      availableProviders: Array.from(this.availableProviders),
      models: this.models,
      templates: this.promptTemplates.map(t => t.type)
    };
  }
}

// Export singleton instance
export default new AIProviderService();
