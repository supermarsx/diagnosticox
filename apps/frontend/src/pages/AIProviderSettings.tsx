/**
 * AI Provider Settings Page
 * 
 * Configure and test multiple AI providers with medical prompt templates.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { 
  aiProviderService, 
  AIProvider, 
  AIModel,
  PromptTemplate,
  AIResponse 
} from '../services/aiProviderService';
import { 
  Settings, 
  Zap, 
  DollarSign, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  BarChart3
} from 'lucide-react';

export const AIProviderSettings: React.FC = () => {
  const [currentProvider, setCurrentProvider] = useState<AIProvider>(aiProviderService.getProvider());
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [testPrompt, setTestPrompt] = useState('');
  const [testResult, setTestResult] = useState<AIResponse | null>(null);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usageStats, setUsageStats] = useState(aiProviderService.getUsageStats());

  useEffect(() => {
    setAvailableModels(aiProviderService.getAvailableModels());
  }, [currentProvider]);

  /**
   * Handle provider change
   */
  const handleProviderChange = (provider: AIProvider) => {
    aiProviderService.setProvider(provider);
    setCurrentProvider(provider);
    setAvailableModels(aiProviderService.getAvailableModels(provider));
  };

  /**
   * Test AI provider
   */
  const handleTestProvider = async () => {
    if (!testPrompt.trim()) return;

    setTesting(true);
    setError(null);
    setTestResult(null);

    try {
      const response = await aiProviderService.complete(testPrompt);
      setTestResult(response);
      setUsageStats(aiProviderService.getUsageStats());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed');
    } finally {
      setTesting(false);
    }
  };

  /**
   * Test sample medical prompt
   */
  const handleTestSample = async () => {
    const samplePrompt = 'Explain the pathophysiology of type 2 diabetes in 3 sentences.';
    setTestPrompt(samplePrompt);
    
    setTesting(true);
    setError(null);
    setTestResult(null);

    try {
      const response = await aiProviderService.complete(samplePrompt);
      setTestResult(response);
      setUsageStats(aiProviderService.getUsageStats());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed');
    } finally {
      setTesting(false);
    }
  };

  /**
   * Get provider status color
   */
  const getProviderStatus = (provider: AIProvider): { color: string; icon: JSX.Element } => {
    // Mock status - in production, check actual API availability
    const isConfigured = true; // Check if API keys are set
    
    if (isConfigured) {
      return {
        color: 'green',
        icon: <CheckCircle2 className="w-5 h-5 text-green-400" />,
      };
    } else {
      return {
        color: 'red',
        icon: <AlertCircle className="w-5 h-5 text-red-400" />,
      };
    }
  };

  const providers = [
    {
      id: AIProvider.OPENAI,
      name: 'OpenAI (GPT-4)',
      description: 'Latest GPT-4 Turbo model with excellent medical knowledge',
      cost: 'High',
    },
    {
      id: AIProvider.ANTHROPIC,
      name: 'Anthropic (Claude 3)',
      description: 'Claude 3 Sonnet with strong reasoning capabilities',
      cost: 'Medium',
    },
    {
      id: AIProvider.GOOGLE,
      name: 'Google (Gemini Pro)',
      description: 'Gemini Pro with competitive performance',
      cost: 'Low',
    },
    {
      id: AIProvider.OLLAMA,
      name: 'Ollama (Local LLM)',
      description: 'Self-hosted LLaMA 2 70B - no external API calls',
      cost: 'Free',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            AI Provider Settings
          </h1>
          <p className="text-gray-300">
            Configure and test multiple AI providers for medical decision support
          </p>
        </div>

        {/* Usage Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-400">Total Requests</span>
            </div>
            <div className="text-3xl font-bold text-white">{usageStats.requestCount}</div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400">Total Cost</span>
            </div>
            <div className="text-3xl font-bold text-white">
              ${usageStats.totalCost.toFixed(4)}
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-400">Avg Cost/Request</span>
            </div>
            <div className="text-3xl font-bold text-white">
              ${usageStats.avgCostPerRequest.toFixed(4)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Provider Selection */}
          <div className="space-y-6">
            <div className="glass-card-strong p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-semibold">Select AI Provider</h2>
              </div>

              <div className="space-y-3">
                {providers.map((provider) => {
                  const status = getProviderStatus(provider.id);
                  const isActive = currentProvider === provider.id;

                  return (
                    <div
                      key={provider.id}
                      onClick={() => handleProviderChange(provider.id)}
                      className={`p-4 rounded-lg cursor-pointer transition-all hover-lift ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-400'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white">{provider.name}</h3>
                            {status.icon}
                          </div>
                          <p className="text-sm text-gray-400">{provider.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          provider.cost === 'Free' 
                            ? 'bg-green-500/20 text-green-300'
                            : provider.cost === 'Low'
                            ? 'bg-blue-500/20 text-blue-300'
                            : provider.cost === 'Medium'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          Cost: {provider.cost}
                        </span>
                        {isActive && (
                          <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Available Models */}
            {availableModels.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Available Models</h3>
                <div className="space-y-2">
                  {availableModels.map((model) => (
                    <div
                      key={model.modelId}
                      className="p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-white text-sm">{model.modelId}</span>
                        <span className="text-xs text-gray-400">
                          ${model.costPer1KTokens}/1K tokens
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>Max tokens: {model.maxTokens.toLocaleString()}</span>
                        <span>Temp: {model.temperature}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Test Interface */}
          <div className="space-y-6">
            <div className="glass-card-strong p-6">
              <div className="flex items-center gap-2 mb-4">
                <Play className="w-5 h-5 text-green-400" />
                <h2 className="text-xl font-semibold">Test AI Provider</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Test Prompt:
                  </label>
                  <textarea
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    placeholder="Enter a medical question or prompt..."
                    className="glass-input w-full h-32 resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleTestProvider}
                    disabled={testing || !testPrompt.trim()}
                    className="glass-button-primary flex-1"
                  >
                    {testing ? 'Testing...' : 'Test Provider'}
                  </button>
                  <button
                    onClick={handleTestSample}
                    disabled={testing}
                    className="glass-button px-4"
                  >
                    Sample Test
                  </button>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                    <div>
                      <p className="text-red-300 font-semibold">Error</p>
                      <p className="text-red-200 text-sm">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Test Results */}
            {testResult && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Test Results</h3>
                
                {/* Metadata */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="text-xs text-gray-400 mb-1">Provider</div>
                    <div className="font-semibold text-white capitalize">
                      {testResult.provider}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="text-xs text-gray-400 mb-1">Model</div>
                    <div className="font-semibold text-white text-sm">
                      {testResult.model}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <Clock className="w-3 h-3" />
                      Latency
                    </div>
                    <div className="font-semibold text-white">
                      {testResult.latency}ms
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <DollarSign className="w-3 h-3" />
                      Cost
                    </div>
                    <div className="font-semibold text-white">
                      ${testResult.cost.toFixed(4)}
                    </div>
                  </div>
                </div>

                {/* Response Content */}
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-gray-400 mb-2">Response:</div>
                  <div className="text-sm text-white whitespace-pre-wrap">
                    {testResult.content}
                  </div>
                </div>

                {/* Tokens Used */}
                <div className="mt-3 text-xs text-gray-400">
                  Tokens used: {testResult.tokensUsed.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Notice */}
        <div className="mt-8 glass-card-strong p-6 border border-yellow-500/30">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-300 mb-2">
                API Configuration Required
              </h3>
              <p className="text-sm text-gray-300 mb-3">
                To use AI providers, configure API keys in your environment variables:
              </p>
              <div className="space-y-1 text-sm font-mono text-gray-400">
                <div>• VITE_OPENAI_API_KEY - OpenAI API key</div>
                <div>• VITE_ANTHROPIC_API_KEY - Anthropic API key</div>
                <div>• VITE_GOOGLE_API_KEY - Google API key</div>
                <div>• VITE_OLLAMA_URL - Ollama server URL (default: http://localhost:11434)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIProviderSettings;
