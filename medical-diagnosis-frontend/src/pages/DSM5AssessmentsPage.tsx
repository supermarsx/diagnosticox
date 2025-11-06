/**
 * DSM-5 Psychiatric Assessments Page
 * 
 * Provides PHQ-9, GAD-7, and PC-PTSD-5 screening tools
 * with automated scoring and clinical recommendations.
 * 
 * @component
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { dsm5Service, PHQ9Item, GAD7Item, PHQ9Result, GAD7Result } from '../services/dsm5Service';
import { Brain, Heart, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

type AssessmentType = 'phq9' | 'gad7' | 'pcptsd5';

interface AssessmentState {
  type: AssessmentType;
  currentQuestion: number;
  responses: number[];
  functionalImpairment: boolean;
  result: PHQ9Result | GAD7Result | null;
  showResults: boolean;
}

export const DSM5AssessmentsPage: React.FC = () => {
  const { t } = useTranslation();
  
  const [assessment, setAssessment] = useState<AssessmentState>({
    type: 'phq9',
    currentQuestion: 0,
    responses: [],
    functionalImpairment: false,
    result: null,
    showResults: false,
  });

  const phq9Questions = dsm5Service.getPHQ9Questions();
  const gad7Questions = dsm5Service.getGAD7Questions();

  const responseOptions = [
    { value: 0, label: 'Not at all' },
    { value: 1, label: 'Several days' },
    { value: 2, label: 'More than half the days' },
    { value: 3, label: 'Nearly every day' },
  ];

  /**
   * Handle response selection
   */
  const handleResponse = (score: number) => {
    const newResponses = [...assessment.responses];
    newResponses[assessment.currentQuestion] = score;
    
    setAssessment(prev => ({
      ...prev,
      responses: newResponses,
      currentQuestion: prev.currentQuestion + 1,
    }));
  };

  /**
   * Calculate and display results
   */
  const handleComplete = () => {
    if (assessment.type === 'phq9') {
      const items: PHQ9Item[] = phq9Questions.map((question, idx) => ({
        question,
        score: assessment.responses[idx] as 0 | 1 | 2 | 3,
      }));
      
      const result = dsm5Service.scorePHQ9(items, assessment.functionalImpairment);
      setAssessment(prev => ({ ...prev, result, showResults: true }));
    } else if (assessment.type === 'gad7') {
      const items: GAD7Item[] = gad7Questions.map((question, idx) => ({
        question,
        score: assessment.responses[idx] as 0 | 1 | 2 | 3,
      }));
      
      const result = dsm5Service.scoreGAD7(items);
      setAssessment(prev => ({ ...prev, result, showResults: true }));
    }
  };

  /**
   * Start new assessment
   */
  const handleStartNew = (type: AssessmentType) => {
    setAssessment({
      type,
      currentQuestion: 0,
      responses: [],
      functionalImpairment: false,
      result: null,
      showResults: false,
    });
  };

  /**
   * Go back to previous question
   */
  const handleBack = () => {
    if (assessment.currentQuestion > 0) {
      setAssessment(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1,
      }));
    }
  };

  const totalQuestions = assessment.type === 'phq9' ? 9 : 7;
  const isComplete = assessment.currentQuestion >= totalQuestions;
  const progress = (assessment.currentQuestion / totalQuestions) * 100;

  // Get severity color
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'none-minimal': return 'text-green-400';
      case 'mild': return 'text-yellow-400';
      case 'moderate': return 'text-orange-400';
      case 'moderately-severe': return 'text-red-400';
      case 'severe': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            DSM-5-TR Psychiatric Assessments
          </h1>
          <p className="text-gray-300">
            Evidence-based screening tools for depression, anxiety, and PTSD
          </p>
        </div>

        {!assessment.showResults ? (
          <>
            {/* Assessment Selection */}
            {assessment.currentQuestion === 0 && assessment.responses.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <button
                  onClick={() => handleStartNew('phq9')}
                  className={`glass-card p-6 hover-lift transition-all ${
                    assessment.type === 'phq9' ? 'ring-2 ring-blue-400' : ''
                  }`}
                >
                  <Brain className="w-12 h-12 text-blue-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">{t('assessments.phq9.title')}</h3>
                  <p className="text-sm text-gray-300">
                    {t('assessments.phq9.description')}
                  </p>
                  <div className="mt-4 text-xs text-gray-400">9 questions • 2-3 minutes</div>
                </button>

                <button
                  onClick={() => handleStartNew('gad7')}
                  className={`glass-card p-6 hover-lift transition-all ${
                    assessment.type === 'gad7' ? 'ring-2 ring-purple-400' : ''
                  }`}
                >
                  <Heart className="w-12 h-12 text-purple-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">{t('assessments.gad7.title')}</h3>
                  <p className="text-sm text-gray-300">
                    {t('assessments.gad7.description')}
                  </p>
                  <div className="mt-4 text-xs text-gray-400">7 questions • 2 minutes</div>
                </button>

                <button
                  onClick={() => handleStartNew('pcptsd5')}
                  className="glass-card p-6 hover-lift transition-all opacity-50 cursor-not-allowed"
                  disabled
                >
                  <AlertTriangle className="w-12 h-12 text-yellow-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">PC-PTSD-5</h3>
                  <p className="text-sm text-gray-300">
                    Primary Care PTSD Screen
                  </p>
                  <div className="mt-4 text-xs text-gray-400">Coming soon</div>
                </button>
              </div>
            )}

            {/* Assessment Questions */}
            {assessment.currentQuestion < totalQuestions && (
              <div className="glass-card-strong p-8">
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">
                      Question {assessment.currentQuestion + 1} of {totalQuestions}
                    </span>
                    <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="mb-8">
                  <p className="text-lg text-gray-300 mb-2">
                    Over the last 2 weeks, how often have you been bothered by:
                  </p>
                  <h3 className="text-2xl font-bold text-white">
                    {assessment.type === 'phq9'
                      ? phq9Questions[assessment.currentQuestion]
                      : gad7Questions[assessment.currentQuestion]}
                  </h3>
                </div>

                {/* Response Options */}
                <div className="space-y-3">
                  {responseOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleResponse(option.value)}
                      className="w-full p-4 glass-card hover:bg-white/20 transition-all text-left flex items-center justify-between group"
                    >
                      <span className="text-lg">{option.label}</span>
                      <span className="text-sm text-gray-400 group-hover:text-white">
                        {option.value} {option.value === 1 ? 'point' : 'points'}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Navigation */}
                {assessment.currentQuestion > 0 && (
                  <button
                    onClick={handleBack}
                    className="mt-6 glass-button"
                  >
                    ← Back
                  </button>
                )}
              </div>
            )}

            {/* Functional Impairment Question (PHQ-9 only) */}
            {isComplete && assessment.type === 'phq9' && !assessment.showResults && (
              <div className="glass-card-strong p-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Final Question
                </h3>
                <p className="text-lg text-gray-300 mb-6">
                  If you checked off any problems, how difficult have these problems made it
                  for you to do your work, take care of things at home, or get along with
                  other people?
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setAssessment(prev => ({ ...prev, functionalImpairment: false }));
                      handleComplete();
                    }}
                    className="w-full p-4 glass-card hover:bg-white/20 transition-all text-left"
                  >
                    Not difficult at all
                  </button>
                  <button
                    onClick={() => {
                      setAssessment(prev => ({ ...prev, functionalImpairment: true }));
                      handleComplete();
                    }}
                    className="w-full p-4 glass-card hover:bg-white/20 transition-all text-left"
                  >
                    Somewhat difficult / Very difficult / Extremely difficult
                  </button>
                </div>
              </div>
            )}

            {/* Complete Button (GAD-7) */}
            {isComplete && assessment.type === 'gad7' && !assessment.showResults && (
              <div className="glass-card-strong p-8 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Assessment Complete
                </h3>
                <button
                  onClick={handleComplete}
                  className="glass-button-primary px-8 py-3"
                >
                  View Results
                </button>
              </div>
            )}
          </>
        ) : (
          /* Results Display */
          <div className="space-y-6">
            {/* Results Header */}
            <div className="glass-card-strong p-8">
              <div className="flex items-center gap-4 mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-400" />
                <div>
                  <h2 className="text-3xl font-bold text-white">
                    {assessment.type === 'phq9' ? 'PHQ-9' : 'GAD-7'} Results
                  </h2>
                  <p className="text-gray-300">Assessment completed</p>
                </div>
              </div>

              {assessment.result && 'totalScore' in assessment.result && (
                <>
                  {/* Score Display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="glass-card p-6">
                      <div className="text-sm text-gray-400 mb-2">Total Score</div>
                      <div className="text-5xl font-bold text-white mb-2">
                        {assessment.result.totalScore}
                      </div>
                      <div className="text-sm text-gray-400">
                        out of {assessment.type === 'phq9' ? '27' : '21'}
                      </div>
                    </div>

                    <div className="glass-card p-6">
                      <div className="text-sm text-gray-400 mb-2">Severity</div>
                      <div className={`text-3xl font-bold mb-2 ${getSeverityColor(assessment.result.severity)}`}>
                        {assessment.result.severity.split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <TrendingUp className="w-4 h-4" />
                        Clinical significance
                      </div>
                    </div>
                  </div>

                  {/* Item 9 Warning (PHQ-9 only) */}
                  {'requiresClinicalFollowup' in assessment.result && assessment.result.requiresClinicalFollowup && (
                    <div className="p-4 bg-red-500/20 border-2 border-red-500 rounded-lg mb-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-red-300 mb-1">
                            {t('assessments.phq9.item9Warning')}
                          </p>
                          <p className="text-sm text-red-200">
                            Immediate clinical interview required to assess suicide risk. Do not
                            rely on screening tools alone for risk assessment.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interpretation */}
                  <div className="glass-card p-6 mb-6">
                    <h3 className="text-xl font-bold mb-3">Interpretation</h3>
                    <p className="text-gray-300">{assessment.result.interpretation}</p>
                  </div>

                  {/* Recommendations */}
                  <div className="glass-card p-6">
                    <h3 className="text-xl font-bold mb-3">Clinical Recommendations</h3>
                    <ul className="space-y-2">
                      {assessment.result.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-blue-400 mt-1">•</span>
                          <span className="text-gray-300">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => handleStartNew(assessment.type)}
                className="glass-button-primary flex-1"
              >
                Take Again
              </button>
              <button
                onClick={() => handleStartNew(assessment.type === 'phq9' ? 'gad7' : 'phq9')}
                className="glass-button flex-1"
              >
                Try {assessment.type === 'phq9' ? 'GAD-7' : 'PHQ-9'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DSM5AssessmentsPage;