/**
 * Mock AI-Assisted Diagnosis Service
 * Provides sophisticated medical decision support with realistic responses
 */

export interface AIDiagnosisSuggestion {
  diagnosis: string;
  icd10Code: string;
  confidence: number; // 0-1
  reasoning: string[];
  supportingEvidence: string[];
  contradictingEvidence?: string[];
  recommendedTests: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  differentialRank: number;
  evidenceLevel: 'I' | 'II' | 'III' | 'IV' | 'V';
}

export interface TreatmentRecommendation {
  id: string;
  treatmentName: string;
  category: 'medication' | 'procedure' | 'lifestyle' | 'therapy' | 'surgery';
  description: string;
  efficacyRate: number; // 0-1
  riskLevel: 'low' | 'moderate' | 'high';
  evidenceLevel: 'I' | 'II' | 'III' | 'IV' | 'V';
  guidelines: string[];
  contraindications: string[];
  drugInteractions?: string[];
  monitoring: string[];
  expectedOutcome: string;
  costEffectiveness: 'low' | 'moderate' | 'high';
}

export interface DrugInteractionWarning {
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
  drug1: string;
  drug2: string;
  interaction: string;
  clinicalEffects: string[];
  management: string;
}

export interface ClinicalGuideline {
  title: string;
  organization: string;
  year: number;
  recommendation: string;
  strengthOfRecommendation: 'strong' | 'moderate' | 'weak' | 'conditional';
  qualityOfEvidence: 'high' | 'moderate' | 'low' | 'very low';
  applicability: string;
}

export interface AIAnalysisResult {
  patientId: string;
  analysisDate: string;
  suggestions: AIDiagnosisSuggestion[];
  treatmentRecommendations: TreatmentRecommendation[];
  riskFactors: string[];
  prognosticIndicators: {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }[];
  monitoringPlan: string[];
  followUpRecommendations: string[];
  clinicalPearls: string[];
}

class AIService {
  // Mock medical knowledge base
  private readonly medicalKnowledge = {
    'inflammatory-joint': {
      diagnoses: [
        {
          name: 'Rheumatoid Arthritis',
          icd10: 'M05.9',
          keyFeatures: ['morning stiffness', 'symmetric joint involvement', 'positive RF', 'elevated CRP/ESR'],
          treatments: ['methotrexate', 'biologics', 'NSAIDs', 'corticosteroids'],
        },
        {
          name: 'Psoriatic Arthritis',
          icd10: 'L40.50',
          keyFeatures: ['psoriasis', 'dactylitis', 'nail changes', 'asymmetric joint involvement'],
          treatments: ['methotrexate', 'TNF inhibitors', 'IL-17 inhibitors'],
        },
        {
          name: 'Systemic Lupus Erythematosus',
          icd10: 'M32.9',
          keyFeatures: ['malar rash', 'photosensitivity', 'positive ANA', 'multi-organ involvement'],
          treatments: ['hydroxychloroquine', 'corticosteroids', 'immunosuppressants'],
        },
      ],
    },
    'abdominal-pain': {
      diagnoses: [
        {
          name: 'Inflammatory Bowel Disease (Crohn\'s)',
          icd10: 'K50.9',
          keyFeatures: ['chronic diarrhea', 'abdominal pain', 'weight loss', 'elevated inflammatory markers'],
          treatments: ['5-ASA', 'corticosteroids', 'immunomodulators', 'biologics'],
        },
        {
          name: 'Ulcerative Colitis',
          icd10: 'K51.9',
          keyFeatures: ['bloody diarrhea', 'urgency', 'continuous colonic involvement'],
          treatments: ['5-ASA', 'corticosteroids', 'immunosuppressants', 'surgery'],
        },
        {
          name: 'Celiac Disease',
          icd10: 'K90.0',
          keyFeatures: ['malabsorption', 'positive tissue transglutaminase', 'villous atrophy'],
          treatments: ['gluten-free diet', 'nutritional supplements'],
        },
      ],
    },
  };

  /**
   * Analyze patient data and generate AI diagnosis suggestions
   */
  async analyzePatient(
    patientId: string,
    symptoms: string[],
    labResults?: Record<string, any>,
    demographics?: { age: number; gender: string }
  ): Promise<AIAnalysisResult> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Determine problem category from symptoms
    const category = this.categorizeSymptoms(symptoms);
    const knowledgeBase = this.medicalKnowledge[category as keyof typeof this.medicalKnowledge] || 
                          this.medicalKnowledge['inflammatory-joint'];

    // Generate AI suggestions
    const suggestions: AIDiagnosisSuggestion[] = knowledgeBase.diagnoses.map((diagnosis, index) => {
      const baseConfidence = 0.95 - (index * 0.12);
      const confidence = Math.max(0.60, Math.min(0.95, baseConfidence + (Math.random() * 0.08 - 0.04)));

      return {
        diagnosis: diagnosis.name,
        icd10Code: diagnosis.icd10,
        confidence,
        reasoning: this.generateReasoning(diagnosis.name, symptoms, labResults),
        supportingEvidence: this.getSupportingEvidence(diagnosis.keyFeatures, symptoms),
        contradictingEvidence: index > 0 ? this.getContradictingEvidence(diagnosis.name) : undefined,
        recommendedTests: this.getRecommendedTests(diagnosis.name),
        urgency: this.assessUrgency(confidence, symptoms),
        differentialRank: index + 1,
        evidenceLevel: this.getEvidenceLevel(confidence),
      };
    });

    // Generate treatment recommendations
    const topDiagnosis = knowledgeBase.diagnoses[0];
    const treatmentRecommendations = this.generateTreatmentRecommendations(topDiagnosis);

    // Generate risk factors and prognostic indicators
    const riskFactors = this.identifyRiskFactors(demographics, symptoms);
    const prognosticIndicators = this.generatePrognosticIndicators(topDiagnosis.name);

    return {
      patientId,
      analysisDate: new Date().toISOString(),
      suggestions,
      treatmentRecommendations,
      riskFactors,
      prognosticIndicators,
      monitoringPlan: this.generateMonitoringPlan(topDiagnosis.name),
      followUpRecommendations: this.generateFollowUpRecommendations(topDiagnosis.name),
      clinicalPearls: this.getClinicalPearls(topDiagnosis.name),
    };
  }

  /**
   * Get treatment recommendations for a specific diagnosis
   */
  async getTreatmentRecommendations(diagnosis: string): Promise<TreatmentRecommendation[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const treatments: Record<string, TreatmentRecommendation[]> = {
      'Rheumatoid Arthritis': [
        {
          id: 'ra-mtx',
          treatmentName: 'Methotrexate',
          category: 'medication',
          description: 'First-line DMARD for RA with proven efficacy in reducing disease activity and preventing joint damage',
          efficacyRate: 0.75,
          riskLevel: 'moderate',
          evidenceLevel: 'I',
          guidelines: ['ACR 2021 Guidelines', 'EULAR 2019 Recommendations'],
          contraindications: ['Pregnancy', 'Severe hepatic impairment', 'Significant alcohol consumption'],
          drugInteractions: ['NSAIDs (increased toxicity)', 'Trimethoprim (bone marrow suppression)'],
          monitoring: ['CBC every 4-8 weeks', 'LFTs every 4-8 weeks', 'Creatinine periodically'],
          expectedOutcome: '60-70% achieve good disease control within 3-6 months',
          costEffectiveness: 'high',
        },
        {
          id: 'ra-tnf',
          treatmentName: 'TNF Inhibitors (e.g., Adalimumab)',
          category: 'medication',
          description: 'Biologic DMARD targeting tumor necrosis factor, highly effective for moderate to severe RA',
          efficacyRate: 0.85,
          riskLevel: 'moderate',
          evidenceLevel: 'I',
          guidelines: ['ACR 2021 Guidelines - Second line after MTX failure'],
          contraindications: ['Active infection', 'Heart failure (NYHA III-IV)', 'Multiple sclerosis'],
          drugInteractions: ['Live vaccines (avoid)', 'Other biologics (increased infection risk)'],
          monitoring: ['TB screening before initiation', 'Infection monitoring', 'CBC, LFTs every 3 months'],
          expectedOutcome: 'ACR50 response in 50-60% of patients at 6 months',
          costEffectiveness: 'moderate',
        },
        {
          id: 'ra-nsaid',
          treatmentName: 'NSAIDs + Gastroprotection',
          category: 'medication',
          description: 'Symptomatic relief of pain and inflammation, not disease-modifying',
          efficacyRate: 0.60,
          riskLevel: 'low',
          evidenceLevel: 'I',
          guidelines: ['ACR - Adjunctive therapy only'],
          contraindications: ['Active peptic ulcer', 'Severe renal impairment', 'Anticoagulation'],
          drugInteractions: ['Warfarin (increased bleeding)', 'ACE inhibitors (reduced efficacy)'],
          monitoring: ['Renal function every 6 months', 'Blood pressure monitoring'],
          expectedOutcome: 'Symptom relief within days, no disease modification',
          costEffectiveness: 'high',
        },
        {
          id: 'ra-lifestyle',
          treatmentName: 'Physical Therapy and Exercise',
          category: 'lifestyle',
          description: 'Regular exercise program to maintain joint mobility, strength, and function',
          efficacyRate: 0.70,
          riskLevel: 'low',
          evidenceLevel: 'II',
          guidelines: ['ACR - Recommended for all RA patients'],
          contraindications: ['Acute joint inflammation', 'Severe pain limiting movement'],
          monitoring: ['Functional assessment every 3 months', 'Pain levels', 'Joint mobility'],
          expectedOutcome: 'Improved function and quality of life, reduced disability progression',
          costEffectiveness: 'high',
        },
      ],
      'Inflammatory Bowel Disease (Crohn\'s)': [
        {
          id: 'ibd-5asa',
          treatmentName: '5-Aminosalicylates (Mesalamine)',
          category: 'medication',
          description: 'Anti-inflammatory agent for mild to moderate IBD, reduces mucosal inflammation',
          efficacyRate: 0.65,
          riskLevel: 'low',
          evidenceLevel: 'I',
          guidelines: ['ACG 2018 IBD Guidelines'],
          contraindications: ['Salicylate hypersensitivity', 'Severe renal impairment'],
          drugInteractions: ['Azathioprine (possible increased myelotoxicity)'],
          monitoring: ['Renal function every 6 months', 'CBC annually'],
          expectedOutcome: 'Clinical remission in 40-50% of mild disease',
          costEffectiveness: 'high',
        },
        {
          id: 'ibd-biologic',
          treatmentName: 'Anti-TNF Biologics (Infliximab)',
          category: 'medication',
          description: 'Monoclonal antibody for moderate to severe IBD, highly effective for inducing and maintaining remission',
          efficacyRate: 0.80,
          riskLevel: 'moderate',
          evidenceLevel: 'I',
          guidelines: ['ACG 2018 - For moderate to severe disease'],
          contraindications: ['Active tuberculosis', 'Sepsis', 'Heart failure'],
          drugInteractions: ['Live vaccines', 'Other immunosuppressants'],
          monitoring: ['TB screening', 'Hepatitis B screening', 'Infection surveillance'],
          expectedOutcome: 'Clinical remission in 60-70% at 1 year',
          costEffectiveness: 'moderate',
        },
        {
          id: 'ibd-nutrition',
          treatmentName: 'Nutritional Therapy',
          category: 'lifestyle',
          description: 'Dietary modification and nutritional supplementation to address malabsorption and inflammation',
          efficacyRate: 0.55,
          riskLevel: 'low',
          evidenceLevel: 'II',
          guidelines: ['ESPEN Guidelines on Clinical Nutrition in IBD'],
          contraindications: ['None specific'],
          monitoring: ['Nutritional status', 'Vitamin levels (B12, D, folate)', 'Weight'],
          expectedOutcome: 'Improved nutritional status, may reduce disease activity',
          costEffectiveness: 'high',
        },
      ],
    };

    return treatments[diagnosis] || treatments['Rheumatoid Arthritis'];
  }

  /**
   * Check for drug interactions
   */
  async checkDrugInteractions(medications: string[]): Promise<DrugInteractionWarning[]> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const interactions: DrugInteractionWarning[] = [];

    // Common interaction patterns
    const interactionDatabase: Record<string, DrugInteractionWarning[]> = {
      'methotrexate-nsaid': [
        {
          severity: 'major',
          drug1: 'Methotrexate',
          drug2: 'NSAIDs',
          interaction: 'NSAIDs may reduce renal clearance of methotrexate, leading to increased toxicity',
          clinicalEffects: ['Bone marrow suppression', 'Renal toxicity', 'Hepatotoxicity', 'Gastrointestinal ulceration'],
          management: 'Use with caution. Monitor CBC, LFTs, and renal function closely. Consider using selective COX-2 inhibitors or low-dose NSAIDs for short periods only.',
        },
      ],
      'warfarin-nsaid': [
        {
          severity: 'major',
          drug1: 'Warfarin',
          drug2: 'NSAIDs',
          interaction: 'NSAIDs inhibit platelet function and may increase bleeding risk when combined with anticoagulants',
          clinicalEffects: ['Increased bleeding risk', 'GI bleeding', 'Prolonged INR'],
          management: 'Avoid combination if possible. If necessary, monitor INR closely and watch for signs of bleeding. Consider gastroprotection.',
        },
      ],
      'corticosteroid-nsaid': [
        {
          severity: 'moderate',
          drug1: 'Corticosteroids',
          drug2: 'NSAIDs',
          interaction: 'Combined use increases risk of gastrointestinal ulceration and bleeding',
          clinicalEffects: ['Peptic ulcer disease', 'GI bleeding', 'Perforation'],
          management: 'Consider gastroprotection with PPI. Monitor for GI symptoms. Use lowest effective doses.',
        },
      ],
    };

    // Check all medication pairs
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const key1 = `${medications[i].toLowerCase()}-${medications[j].toLowerCase()}`;
        const key2 = `${medications[j].toLowerCase()}-${medications[i].toLowerCase()}`;
        
        if (interactionDatabase[key1]) {
          interactions.push(...interactionDatabase[key1]);
        } else if (interactionDatabase[key2]) {
          interactions.push(...interactionDatabase[key2]);
        }
      }
    }

    return interactions;
  }

  /**
   * Get clinical guidelines for a condition
   */
  async getClinicalGuidelines(condition: string): Promise<ClinicalGuideline[]> {
    await new Promise(resolve => setTimeout(resolve, 600));

    const guidelines: Record<string, ClinicalGuideline[]> = {
      'Rheumatoid Arthritis': [
        {
          title: 'American College of Rheumatology Guideline for the Treatment of Rheumatoid Arthritis',
          organization: 'American College of Rheumatology (ACR)',
          year: 2021,
          recommendation: 'Conventional synthetic DMARDs (particularly methotrexate) are recommended as first-line therapy for all patients with RA',
          strengthOfRecommendation: 'strong',
          qualityOfEvidence: 'high',
          applicability: 'All patients with newly diagnosed RA without contraindications',
        },
        {
          title: 'EULAR Recommendations for the Management of Rheumatoid Arthritis',
          organization: 'European League Against Rheumatism (EULAR)',
          year: 2019,
          recommendation: 'Treat-to-target strategy with regular disease activity monitoring and treatment adjustment to achieve remission or low disease activity',
          strengthOfRecommendation: 'strong',
          qualityOfEvidence: 'high',
          applicability: 'All patients with active RA',
        },
        {
          title: 'ACR Guideline for Biologic DMARDs in RA',
          organization: 'American College of Rheumatology',
          year: 2021,
          recommendation: 'Biologic or targeted synthetic DMARDs should be added in patients with moderate-to-high disease activity despite conventional DMARD therapy',
          strengthOfRecommendation: 'strong',
          qualityOfEvidence: 'moderate',
          applicability: 'Patients with inadequate response to methotrexate monotherapy',
        },
      ],
      'Inflammatory Bowel Disease': [
        {
          title: 'ACG Clinical Guideline: Management of Crohn\'s Disease in Adults',
          organization: 'American College of Gastroenterology (ACG)',
          year: 2018,
          recommendation: 'Anti-TNF therapy is recommended for inducing remission in patients with moderate-to-severe Crohn\'s disease',
          strengthOfRecommendation: 'strong',
          qualityOfEvidence: 'high',
          applicability: 'Moderate to severe active Crohn\'s disease',
        },
        {
          title: 'ECCO Guidelines on Therapeutics in Crohn\'s Disease',
          organization: 'European Crohn\'s and Colitis Organisation (ECCO)',
          year: 2020,
          recommendation: 'Early use of immunomodulators or biologics in high-risk patients to prevent disease progression',
          strengthOfRecommendation: 'moderate',
          qualityOfEvidence: 'moderate',
          applicability: 'Newly diagnosed patients with poor prognostic factors',
        },
      ],
    };

    return guidelines[condition] || guidelines['Rheumatoid Arthritis'];
  }

  // Helper methods
  private categorizeSymptoms(symptoms: string[]): string {
    const symptomText = symptoms.join(' ').toLowerCase();
    if (symptomText.includes('joint') || symptomText.includes('arthritis') || symptomText.includes('stiffness')) {
      return 'inflammatory-joint';
    }
    if (symptomText.includes('abdominal') || symptomText.includes('diarrhea') || symptomText.includes('bowel')) {
      return 'abdominal-pain';
    }
    return 'inflammatory-joint'; // default
  }

  private generateReasoning(diagnosis: string, symptoms: string[], labResults?: Record<string, any>): string[] {
    const reasoning = [
      `Clinical presentation is highly consistent with ${diagnosis}`,
      `Pattern of symptoms matches typical disease progression`,
      `Demographic profile aligns with common patient population`,
    ];

    if (labResults) {
      reasoning.push('Laboratory findings support inflammatory process');
      reasoning.push('Biomarker elevation consistent with active disease');
    }

    reasoning.push('Differential diagnosis excludes other common mimics');
    return reasoning;
  }

  private getSupportingEvidence(keyFeatures: string[], symptoms: string[]): string[] {
    return keyFeatures.map(feature => `Presence of ${feature} strongly supports this diagnosis`);
  }

  private getContradictingEvidence(diagnosis: string): string[] {
    return [
      'Some atypical features present',
      'Disease course differs slightly from textbook presentation',
    ];
  }

  private getRecommendedTests(diagnosis: string): string[] {
    const tests: Record<string, string[]> = {
      'Rheumatoid Arthritis': [
        'Rheumatoid Factor (RF)',
        'Anti-CCP antibodies',
        'ESR and CRP',
        'Complete Blood Count',
        'Joint X-rays (hands and feet)',
        'Ultrasound or MRI for early erosions',
      ],
      'Inflammatory Bowel Disease (Crohn\'s)': [
        'Colonoscopy with biopsy',
        'CT or MRI enterography',
        'Fecal calprotectin',
        'Complete Blood Count',
        'CRP and ESR',
        'Comprehensive metabolic panel',
      ],
    };
    return tests[diagnosis] || tests['Rheumatoid Arthritis'];
  }

  private assessUrgency(confidence: number, symptoms: string[]): 'low' | 'medium' | 'high' | 'critical' {
    if (confidence > 0.85) return 'high';
    if (confidence > 0.70) return 'medium';
    return 'low';
  }

  private getEvidenceLevel(confidence: number): 'I' | 'II' | 'III' | 'IV' | 'V' {
    if (confidence >= 0.85) return 'I';
    if (confidence >= 0.75) return 'II';
    if (confidence >= 0.65) return 'III';
    return 'IV';
  }

  private generateTreatmentRecommendations(diagnosis: any): TreatmentRecommendation[] {
    // Returns from getTreatmentRecommendations synchronously for this mock
    return [];
  }

  private identifyRiskFactors(demographics?: { age: number; gender: string }, symptoms?: string[]): string[] {
    const factors = [];
    if (demographics?.age && demographics.age > 50) {
      factors.push('Age > 50 increases risk of severe disease course');
    }
    if (demographics?.gender === 'Female') {
      factors.push('Female gender associated with higher prevalence of autoimmune conditions');
    }
    factors.push('Family history may contribute to disease susceptibility');
    factors.push('Environmental factors and lifestyle modifications important');
    return factors;
  }

  private generatePrognosticIndicators(diagnosis: string): Array<{ factor: string; impact: 'positive' | 'negative' | 'neutral'; description: string }> {
    return [
      {
        factor: 'Early diagnosis',
        impact: 'positive',
        description: 'Treatment initiated within 3 months of symptom onset improves long-term outcomes',
      },
      {
        factor: 'High disease activity at presentation',
        impact: 'negative',
        description: 'Elevated inflammatory markers predict more aggressive disease course',
      },
      {
        factor: 'Response to initial therapy',
        impact: 'positive',
        description: 'Good response within 3 months indicates favorable prognosis',
      },
      {
        factor: 'Smoking history',
        impact: 'negative',
        description: 'Smoking associated with worse outcomes and reduced treatment efficacy',
      },
    ];
  }

  private generateMonitoringPlan(diagnosis: string): string[] {
    return [
      'Disease activity assessment every 1-3 months',
      'Laboratory monitoring (CBC, LFTs, renal function) every 4-12 weeks',
      'Radiographic assessment annually or as clinically indicated',
      'Functional status assessment at each visit',
      'Side effect monitoring and medication adherence review',
      'Quality of life assessment using validated instruments',
    ];
  }

  private generateFollowUpRecommendations(diagnosis: string): string[] {
    return [
      'Follow-up visit in 2-4 weeks after treatment initiation',
      'Regular appointments every 3 months once stable',
      'Urgent re-evaluation if symptoms worsen',
      'Annual comprehensive disease assessment',
      'Coordinate care with specialists as needed',
      'Patient education and self-management support',
    ];
  }

  private getClinicalPearls(diagnosis: string): string[] {
    const pearls: Record<string, string[]> = {
      'Rheumatoid Arthritis': [
        'Early aggressive treatment improves long-term outcomes and prevents joint damage',
        'Symmetric small joint involvement is a key diagnostic feature',
        'Morning stiffness > 30 minutes is characteristic',
        'Extra-articular manifestations may occur in severe disease',
        'Treat-to-target approach with regular monitoring optimizes outcomes',
      ],
      'Inflammatory Bowel Disease (Crohn\'s)': [
        'Can affect any part of the GI tract from mouth to anus',
        'Skip lesions and transmural inflammation are characteristic',
        'Fistulas and strictures are common complications',
        'Smoking cessation critical for disease management',
        'Early use of biologics may alter disease course in high-risk patients',
      ],
    };
    return pearls[diagnosis] || pearls['Rheumatoid Arthritis'];
  }
}

export const aiService = new AIService();