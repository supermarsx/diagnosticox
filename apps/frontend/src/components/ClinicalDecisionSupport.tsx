import { useState, useEffect } from 'react';
import { Shield, Pill, Book, AlertTriangle, CheckCircle, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { aiService, TreatmentRecommendation, DrugInteractionWarning, ClinicalGuideline } from '../services/aiService';

interface ClinicalDecisionSupportProps {
  diagnosis: string;
  currentMedications?: string[];
}

export function ClinicalDecisionSupport({ diagnosis, currentMedications = [] }: ClinicalDecisionSupportProps) {
  const [loading, setLoading] = useState(false);
  const [treatments, setTreatments] = useState<TreatmentRecommendation[]>([]);
  const [interactions, setInteractions] = useState<DrugInteractionWarning[]>([]);
  const [guidelines, setGuidelines] = useState<ClinicalGuideline[]>([]);
  const [selectedTreatment, setSelectedTreatment] = useState<string | null>(null);

  useEffect(() => {
    loadClinicalData();
  }, [diagnosis]);

  const loadClinicalData = async () => {
    setLoading(true);
    try {
      const [treatmentData, guidelineData, interactionData] = await Promise.all([
        aiService.getTreatmentRecommendations(diagnosis),
        aiService.getClinicalGuidelines(diagnosis),
        currentMedications.length > 0 
          ? aiService.checkDrugInteractions(currentMedications)
          : Promise.resolve([]),
      ]);
      setTreatments(treatmentData);
      setGuidelines(guidelineData);
      setInteractions(interactionData);
    } catch (error) {
      console.error('Failed to load clinical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (risk: string) => {
    const badges = {
      low: 'glass-badge-stable',
      moderate: 'glass-badge-info',
      high: 'glass-badge-warning',
    };
    return badges[risk as keyof typeof badges] || 'glass-badge';
  };

  const getInteractionSeverityBadge = (severity: string) => {
    const badges = {
      minor: 'glass-badge-stable',
      moderate: 'glass-badge-info',
      major: 'glass-badge-warning',
      contraindicated: 'glass-badge-critical',
    };
    return badges[severity as keyof typeof badges] || 'glass-badge';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medication': return Pill;
      case 'procedure': return Activity;
      case 'lifestyle': return TrendingUp;
      case 'therapy': return Activity;
      case 'surgery': return Activity;
      default: return Pill;
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
        </div>
        <p className="text-gray-700 font-medium">Loading clinical recommendations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 gradient-overlay-primary">
        <div className="flex items-center gap-3">
          <div className="glass-card-strong p-3 rounded-2xl">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Clinical Decision Support
            </h2>
            <p className="text-sm text-gray-600 mt-1">Evidence-based treatment recommendations and safety alerts</p>
          </div>
        </div>
      </div>

      {/* Drug Interaction Warnings */}
      {interactions.length > 0 && (
        <div className="glass-card border-2 border-red-300/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h3 className="text-xl font-bold text-red-900">Drug Interaction Warnings</h3>
          </div>
          <div className="space-y-4">
            {interactions.map((interaction, idx) => (
              <div key={idx} className="glass-badge-critical p-4 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`${getInteractionSeverityBadge(interaction.severity)} text-xs px-3 py-1`}>
                        {interaction.severity.toUpperCase()}
                      </span>
                      <span className="font-bold text-gray-900">
                        {interaction.drug1} + {interaction.drug2}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 mb-3">{interaction.interaction}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold text-gray-900 mb-1">Clinical Effects:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {interaction.clinicalEffects.map((effect, i) => (
                        <li key={i} className="text-xs text-gray-800">{effect}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass-card-subtle p-3 rounded-lg">
                    <p className="text-xs font-bold text-gray-900 mb-1">Management:</p>
                    <p className="text-xs text-gray-800">{interaction.management}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Treatment Recommendations */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Pill className="h-6 w-6 text-indigo-600" />
          <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Treatment Recommendations
          </h3>
        </div>

        <div className="space-y-4">
          {treatments.map((treatment, idx) => {
            const CategoryIcon = getCategoryIcon(treatment.category);
            const isExpanded = selectedTreatment === treatment.id;
            
            return (
              <div
                key={treatment.id}
                className="glass-card-subtle p-5 rounded-xl hover:glass-card transition-all cursor-pointer"
                onClick={() => setSelectedTreatment(isExpanded ? null : treatment.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="glass-button-primary p-3 rounded-xl flex-shrink-0">
                    <CategoryIcon className="h-6 w-6" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900">{treatment.treatmentName}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="glass-badge text-xs">{treatment.category}</span>
                          <span className={`${getRiskBadge(treatment.riskLevel)} text-xs px-3 py-1`}>
                            {treatment.riskLevel} risk
                          </span>
                          <span className="glass-badge-info text-xs px-3 py-1">
                            Evidence Level {treatment.evidenceLevel}
                          </span>
                          <span className={`glass-badge text-xs ${
                            treatment.costEffectiveness === 'high' ? 'glass-badge-stable' :
                            treatment.costEffectiveness === 'moderate' ? 'glass-badge-info' :
                            'glass-badge-warning'
                          }`}>
                            {treatment.costEffectiveness} cost-effectiveness
                          </span>
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          {(treatment.efficacyRate * 100).toFixed(0)}%
                        </div>
                        <p className="text-xs text-gray-600 font-medium">Efficacy</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mt-3">{treatment.description}</p>

                    {/* Efficacy Bar */}
                    <div className="mt-3 glass-card-subtle rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                        style={{ width: `${treatment.efficacyRate * 100}%` }}
                      />
                    </div>

                    {isExpanded && (
                      <div className="mt-4 space-y-4 pt-4 border-t border-white/20">
                        {/* Clinical Guidelines */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Book className="h-4 w-4 text-blue-600" />
                            <h5 className="text-sm font-bold text-gray-900">Clinical Guidelines</h5>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {treatment.guidelines.map((guideline, i) => (
                              <span key={i} className="glass-badge-info text-xs px-3 py-1">
                                {guideline}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Contraindications */}
                        {treatment.contraindications.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                              <h5 className="text-sm font-bold text-gray-900">Contraindications</h5>
                            </div>
                            <div className="glass-badge-critical p-3 rounded-lg">
                              <ul className="list-disc list-inside space-y-1">
                                {treatment.contraindications.map((contra, i) => (
                                  <li key={i} className="text-xs">{contra}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Drug Interactions */}
                        {treatment.drugInteractions && treatment.drugInteractions.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                              <h5 className="text-sm font-bold text-gray-900">Drug Interactions</h5>
                            </div>
                            <div className="glass-badge-warning p-3 rounded-lg">
                              <ul className="list-disc list-inside space-y-1">
                                {treatment.drugInteractions.map((interaction, i) => (
                                  <li key={i} className="text-xs">{interaction}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Monitoring Requirements */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="h-4 w-4 text-purple-600" />
                            <h5 className="text-sm font-bold text-gray-900">Monitoring Requirements</h5>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {treatment.monitoring.map((item, i) => (
                              <div key={i} className="glass-card-subtle p-2 rounded-lg text-xs text-gray-700 flex items-start gap-2">
                                <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Expected Outcome */}
                        <div className="glass-badge-stable p-4 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4" />
                            <h5 className="text-sm font-bold">Expected Outcome</h5>
                          </div>
                          <p className="text-sm">{treatment.expectedOutcome}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clinical Guidelines */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Book className="h-6 w-6 text-green-600" />
          <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Evidence-Based Guidelines
          </h3>
        </div>

        <div className="space-y-4">
          {guidelines.map((guideline, idx) => (
            <div key={idx} className="glass-card-subtle p-5 rounded-xl">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">{guideline.title}</h4>
                  <p className="text-sm text-gray-600">
                    {guideline.organization} • {guideline.year}
                  </p>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <span className={`glass-badge text-xs px-3 py-1 ${
                    guideline.strengthOfRecommendation === 'strong' ? 'glass-badge-stable' :
                    guideline.strengthOfRecommendation === 'moderate' ? 'glass-badge-info' :
                    'glass-badge-warning'
                  }`}>
                    {guideline.strengthOfRecommendation}
                  </span>
                  <span className="glass-badge text-xs px-3 py-1">
                    {guideline.qualityOfEvidence} evidence
                  </span>
                </div>
              </div>

              <div className="glass-card-subtle p-3 rounded-lg mb-3">
                <p className="text-sm text-gray-800 font-medium">{guideline.recommendation}</p>
              </div>

              <p className="text-xs text-gray-600">
                <span className="font-bold">Applicability:</span> {guideline.applicability}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
