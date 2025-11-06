import { AIDiagnosisSuggestion, TreatmentRecommendation, DrugInteractionWarning, ClinicalGuideline } from '@/types/medical';

class AIService {
  // Mock AI diagnosis with sophisticated medical reasoning
  async generateAIDiagnosis(
    symptoms: string[],
    patientData: any,
    medicalHistory: string[]
  ): Promise<AIDiagnosisSuggestion[]> {
    // Simulate API delay
    await this.delay(1500);

    const diagnoses = this.analyzeSymptoms(symptoms, patientData, medicalHistory);
    return diagnoses.map(diagnosis => ({
      id: `ai-diagnosis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      primaryDiagnosis: diagnosis.condition,
      confidence: diagnosis.confidence,
      differentialDiagnosis: diagnosis.differentials,
      supportingSymptoms: diagnosis.supportingSymptoms,
      reasoning: diagnosis.reasoning,
      riskFactors: diagnosis.riskFactors,
      redFlags: diagnosis.redFlags,
      recommendedTests: diagnosis.recommendedTests,
      icd10Code: diagnosis.icd10Code,
      severity: diagnosis.severity,
      urgency: diagnosis.urgency,
      aiAnalysisId: `ai-analysis-${Date.now()}`,
      timestamp: new Date().toISOString()
    }));
  }

  // Generate treatment recommendations
  async generateTreatmentRecommendations(
    diagnosis: string,
    patientData: any,
    allergies: string[] = [],
    currentMedications: string[] = []
  ): Promise<TreatmentRecommendation[]> {
    await this.delay(1000);

    const recommendations = this.getTreatmentPlan(diagnosis, patientData, allergies, currentMedications);
    
    return recommendations.map(rec => ({
      id: `treatment-rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      treatmentType: rec.type,
      recommendation: rec.recommendation,
      dosage: rec.dosage,
      frequency: rec.frequency,
      duration: rec.duration,
      route: rec.route,
      monitoringRequirements: rec.monitoring,
      contraindications: rec.contraindications,
      sideEffects: rec.sideEffects,
      patientEducation: rec.education,
      costEffectiveness: rec.costEffectiveness,
      evidenceLevel: rec.evidenceLevel,
      recommendationStrength: rec.strength,
      timestamp: new Date().toISOString()
    }));
  }

  // Check for drug interactions
  async checkDrugInteractions(
    medications: string[]
  ): Promise<DrugInteractionWarning[]> {
    await this.delay(800);

    const interactions = this.analyzeDrugInteractions(medications);
    
    return interactions.map(interaction => ({
      id: `drug-interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      drug1: interaction.drug1,
      drug2: interaction.drug2,
      interactionType: interaction.type,
      severity: interaction.severity,
      description: interaction.description,
      clinicalEffect: interaction.effect,
      mechanism: interaction.mechanism,
      recommendations: interaction.recommendations,
      monitoringRequired: interaction.monitoring,
      timestamp: new Date().toISOString()
    }));
  }

  // Get clinical guidelines
  async getClinicalGuidelines(
    condition: string,
    patientCategory?: string
  ): Promise<ClinicalGuideline[]> {
    await this.delay(600);

    const guidelines = this.findGuidelines(condition, patientCategory);
    
    return guidelines.map(guideline => ({
      id: `guideline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: guideline.title,
      organization: guideline.organization,
      lastUpdated: guideline.lastUpdated,
      version: guideline.version,
      condition: guideline.condition,
      category: guideline.category,
      recommendations: guideline.recommendations,
      evidenceLevel: guideline.evidenceLevel,
      strengthOfRecommendation: guideline.strength,
      qualityOfEvidence: guideline.quality,
      externalUrl: guideline.url,
      keyPoints: guideline.keyPoints,
      implementationNotes: guideline.implementation,
      timestamp: new Date().toISOString()
    }));
  }

  // Advanced symptom analysis
  private analyzeSymptoms(
    symptoms: string[],
    patientData: any,
    medicalHistory: string[]
  ): Array<{
    condition: string;
    confidence: number;
    differentials: string[];
    supportingSymptoms: string[];
    reasoning: string;
    riskFactors: string[];
    redFlags: string[];
    recommendedTests: string[];
    icd10Code: string;
    severity: 'mild' | 'moderate' | 'severe';
    urgency: 'routine' | 'urgent' | 'emergency';
  }> {
    const symptomPatterns = {
      chestPain: {
        conditions: ['Myocardial Infarction', 'Angina Pectoris', 'Pulmonary Embolism', 'Costochondritis'],
        icd10Codes: ['I21.3', 'I20.0', 'I26.0', 'M94.0'],
        redFlags: ['severe crushing pain', 'radiation to left arm', 'shortness of breath', 'diaphoresis', 'nausea'],
        tests: ['ECG', 'Troponin', 'Chest X-ray', 'CT Angiography']
      },
      shortnessOfBreath: {
        conditions: ['Heart Failure', 'COPD', 'Pneumonia', 'Asthma', 'Pulmonary Embolism'],
        icd10Codes: ['I50.9', 'J44.1', 'J18.9', 'J45.9', 'I26.0'],
        redFlags: ['sudden onset', 'chest pain', 'hemoptysis', 'tachypnea'],
        tests: ['Chest X-ray', 'SpO2', 'ABG', 'BNP', 'Pulmonary Function Tests']
      },
      abdominalPain: {
        conditions: ['Appendicitis', 'Cholecystitis', 'Pancreatitis', 'Gastritis', 'IBS'],
        icd10Codes: ['K35.9', 'K81.9', 'K85.9', 'K29.9', 'K58.9'],
        redFlags: ['rebound tenderness', 'rigid abdomen', 'fever', 'vomiting blood'],
        tests: ['CT Abdomen', 'CBC', 'LIPASE', 'Amylase', 'Ultrasound']
      },
      headache: {
        conditions: ['Migraine', 'Tension Headache', 'Cluster Headache', 'Subarachnoid Hemorrhage'],
        icd10Codes: ['G43.9', 'G44.2', 'G44.0', 'I60.9'],
        redFlags: ['sudden severe headache', 'neck stiffness', 'visual changes', 'altered consciousness'],
        tests: ['CT Head', 'MRI', 'Lumbar Puncture', 'Ophthalmologic Exam']
      }
    };

    const diagnoses = [];

    // Match symptoms to potential conditions
    for (const [symptomKey, pattern] of Object.entries(symptomPatterns)) {
      const matchedSymptoms = symptoms.filter(symptom => 
        symptom.toLowerCase().includes(symptomKey.toLowerCase().replace(/([A-Z])/g, ' $1').trim()) ||
        pattern.redFlags.some(flag => symptom.toLowerCase().includes(flag.toLowerCase()))
      );

      if (matchedSymptoms.length > 0) {
        // Calculate confidence based on symptom matches and risk factors
        const baseConfidence = Math.min(matchedSymptoms.length * 0.3, 0.9);
        const riskFactorBonus = this.calculateRiskFactorBonus(patientData, medicalHistory, pattern.conditions[0]);
        const confidence = Math.min(baseConfidence + riskFactorBonus, 0.95);

        diagnoses.push({
          condition: pattern.conditions[0],
          confidence,
          differentials: pattern.conditions.slice(1),
          supportingSymptoms: matchedSymptoms,
          reasoning: this.generateReasoning(symptomKey, matchedSymptoms, patientData),
          riskFactors: this.identifyRiskFactors(patientData, medicalHistory, pattern.conditions[0]),
          redFlags: pattern.redFlags.filter(flag => 
            symptoms.some(s => s.toLowerCase().includes(flag.toLowerCase()))
          ),
          recommendedTests: pattern.tests,
          icd10Code: pattern.icd10Codes[0],
          severity: this.assessSeverity(symptoms, pattern.redFlags),
          urgency: this.assessUrgency(symptoms, pattern.redFlags)
        });
      }
    }

    return diagnoses.sort((a, b) => b.confidence - a.confidence);
  }

  // Generate treatment plan
  private getTreatmentPlan(
    diagnosis: string,
    patientData: any,
    allergies: string[],
    currentMedications: string[]
  ): Array<{
    type: 'medication' | 'procedure' | 'lifestyle' | 'monitoring';
    recommendation: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    route?: string;
    monitoring: string[];
    contraindications: string[];
    sideEffects: string[];
    education: string;
    costEffectiveness: 'high' | 'moderate' | 'low';
    evidenceLevel: 'A' | 'B' | 'C';
    strength: 'strong' | 'moderate' | 'weak';
  }> {
    const treatmentPlans: Record<string, any> = {
      'Myocardial Infarction': {
        medications: [
          { drug: 'Aspirin', dosage: '325mg', frequency: 'once', duration: 'indefinite', evidence: 'A', strength: 'strong' },
          { drug: 'Clopidogrel', dosage: '75mg', frequency: 'daily', duration: '12 months', evidence: 'A', strength: 'strong' },
          { drug: 'Atorvastatin', dosage: '40-80mg', frequency: 'daily', duration: 'indefinite', evidence: 'A', strength: 'strong' }
        ],
        procedures: ['Cardiac catheterization', 'PCI if indicated'],
        monitoring: ['ECG monitoring', 'Cardiac enzymes', 'Lipid panel']
      },
      'Hypertension': {
        medications: [
          { drug: 'Lisinopril', dosage: '10-40mg', frequency: 'daily', duration: 'indefinite', evidence: 'A', strength: 'strong' },
          { drug: 'Amlodipine', dosage: '5-10mg', frequency: 'daily', duration: 'indefinite', evidence: 'A', strength: 'strong' }
        ],
        lifestyle: ['DASH diet', 'Regular exercise', 'Weight management', 'Sodium restriction'],
        monitoring: ['Blood pressure monitoring', 'Renal function', 'Electrolytes']
      },
      'Type 2 Diabetes': {
        medications: [
          { drug: 'Metformin', dosage: '500-2000mg', frequency: 'twice daily', duration: 'indefinite', evidence: 'A', strength: 'strong' },
          { drug: 'Empagliflozin', dosage: '10-25mg', frequency: 'daily', duration: 'indefinite', evidence: 'A', strength: 'strong' }
        ],
        lifestyle: ['Diabetic diet', 'Regular exercise', 'Weight management', 'Foot care education'],
        monitoring: ['HbA1c every 3 months', 'Blood glucose monitoring', 'Annual eye exam', 'Kidney function']
      }
    };

    const plan = treatmentPlans[diagnosis] || {
      medications: [{ drug: 'Supportive care', evidence: 'C', strength: 'weak' }],
      monitoring: ['Clinical follow-up']
    };

    const recommendations = [];

    // Process medications
    if (plan.medications) {
      for (const med of plan.medications) {
        if (!allergies.some(allergy => med.drug.toLowerCase().includes(allergy.toLowerCase()))) {
          recommendations.push({
            type: 'medication',
            recommendation: med.drug,
            dosage: med.dosage,
            frequency: med.frequency,
            duration: med.duration,
            route: 'oral',
            monitoring: plan.monitoring || [],
            contraindications: this.getContraindications(med.drug),
            sideEffects: this.getSideEffects(med.drug),
            education: this.getPatientEducation(med.drug, diagnosis),
            costEffectiveness: this.assessCostEffectiveness(med.drug),
            evidenceLevel: med.evidence || 'B',
            strength: med.strength || 'moderate'
          });
        }
      }
    }

    // Add lifestyle recommendations
    if (plan.lifestyle) {
      for (const lifestyle of plan.lifestyle) {
        recommendations.push({
          type: 'lifestyle',
          recommendation: lifestyle,
          monitoring: ['Regular follow-up', 'Progress tracking'],
          contraindications: [],
          sideEffects: [],
          education: this.getLifestyleEducation(lifestyle),
          costEffectiveness: 'high',
          evidenceLevel: 'A',
          strength: 'strong'
        });
      }
    }

    // Add monitoring recommendations
    if (plan.monitoring) {
      for (const monitor of plan.monitoring) {
        recommendations.push({
          type: 'monitoring',
          recommendation: monitor,
          monitoring: ['Track results', 'Report abnormalities'],
          contraindications: [],
          sideEffects: [],
          education: this.getMonitoringEducation(monitor),
          costEffectiveness: 'high',
          evidenceLevel: 'A',
          strength: 'strong'
        });
      }
    }

    return recommendations;
  }

  // Analyze drug interactions
  private analyzeDrugInteractions(medications: string[]): Array<{
    drug1: string;
    drug2: string;
    type: 'major' | 'moderate' | 'minor';
    severity: 'high' | 'moderate' | 'low';
    description: string;
    effect: string;
    mechanism: string;
    recommendations: string[];
    monitoring: string[];
  }> {
    const knownInteractions: Record<string, any> = {
      'warfarin+aspirin': {
        type: 'major',
        severity: 'high',
        description: 'Increased bleeding risk',
        effect: 'Additive anticoagulant effect',
        mechanism: 'Inhibition of platelet function',
        recommendations: ['Avoid combination', 'Monitor INR closely', 'Consider alternative'],
        monitoring: ['INR', 'Bleeding signs', 'CBC']
      },
      'lisinopril+spironolactone': {
        type: 'major',
        severity: 'high',
        description: 'Hyperkalemia risk',
        effect: 'Increased potassium levels',
        mechanism: 'Reduced potassium excretion',
        recommendations: ['Monitor potassium', 'Consider alternative diuretic'],
        monitoring: ['Serum potassium', 'Renal function']
      },
      'metformin+contrast': {
        type: 'major',
        severity: 'high',
        description: 'Lactic acidosis risk',
        effect: 'Reduced renal clearance of metformin',
        mechanism: 'Contrast-induced nephropathy',
        recommendations: ['Hold metformin 48h before/after contrast', 'Monitor renal function'],
        monitoring: ['Serum creatinine', 'Lactate levels']
      }
    };

    const interactions = [];
    
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const med1 = medications[i].toLowerCase();
        const med2 = medications[j].toLowerCase();
        
        // Check for known interactions
        const interactionKey = `${med1}+${med2}`;
        const reverseKey = `${med2}+${med1}`;
        
        const interaction = knownInteractions[interactionKey] || knownInteractions[reverseKey];
        
        if (interaction) {
          interactions.push({
            drug1: medications[i],
            drug2: medications[j],
            ...interaction
          });
        }
      }
    }
    
    return interactions;
  }

  // Find clinical guidelines
  private findGuidelines(condition: string, patientCategory?: string): Array<{
    title: string;
    organization: string;
    lastUpdated: string;
    version: string;
    condition: string;
    category: string;
    recommendations: string[];
    evidenceLevel: string;
    strength: string;
    quality: string;
    url: string;
    keyPoints: string[];
    implementation: string;
  }> {
    const guidelines = {
      'Myocardial Infarction': {
        title: 'STEMI Guidelines',
        organization: 'American Heart Association',
        lastUpdated: '2023',
        version: '8.0',
        category: 'Cardiology',
        recommendations: [
          'Primary PCI within 90 minutes of first medical contact',
          'Aspirin 325mg chewed immediately',
          'P2Y12 inhibitor (clopidogrel, prasugrel, or ticagrelor)',
          'High-intensity statin therapy',
          'ACE inhibitor for patients with LV dysfunction'
        ],
        evidenceLevel: 'A',
        strength: 'Strong',
        quality: 'High',
        url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000001063',
        keyPoints: [
          'Time is muscle - faster treatment saves lives',
          'Dual antiplatelet therapy essential',
          'Statin therapy for all patients regardless of cholesterol levels'
        ],
        implementation: 'Implement protocols for rapid triage and treatment'
      },
      'Hypertension': {
        title: 'Hypertension Management Guidelines',
        organization: 'American College of Cardiology',
        lastUpdated: '2023',
        version: '2.0',
        category: 'Cardiology',
        recommendations: [
          'Target BP <130/80 mmHg for most adults',
          'Lifestyle modifications as first-line therapy',
          'ACE inhibitor or ARB as first-line medication',
          'Combination therapy if BP >20/10 above target',
          'Monitor for side effects and target organ damage'
        ],
        evidenceLevel: 'A',
        strength: 'Strong',
        quality: 'High',
        url: 'https://www.acc.org/guidelines',
        keyPoints: [
          'Lower targets benefit high-risk patients',
          'Home blood pressure monitoring recommended',
          'Team-based care improves outcomes'
        ],
        implementation: 'Use standardized treatment protocols and patient education'
      }
    };

    const guideline = guidelines[condition];
    if (guideline) {
      return [guideline];
    }
    
    return [{
      title: 'General Clinical Guidelines',
      organization: 'Various Medical Societies',
      lastUpdated: '2023',
      version: '1.0',
      condition,
      category: 'General Medicine',
      recommendations: [
        'Follow evidence-based treatment protocols',
        'Consider patient-specific factors',
        'Monitor treatment response',
        'Adjust therapy as needed'
      ],
      evidenceLevel: 'B',
      strength: 'Moderate',
      quality: 'Moderate',
      url: 'https://www.guidelines.gov',
      keyPoints: [
        'Individualize treatment based on patient factors',
        'Consider comorbidities and drug interactions'
      ],
      implementation: 'Apply clinical judgment and patient preferences'
    }];
  }

  // Utility methods
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private calculateRiskFactorBonus(patientData: any, medicalHistory: string[], condition: string): number {
    let bonus = 0;
    
    if (patientData.age > 65) bonus += 0.1;
    if (patientData.gender === 'male' && condition.includes('Cardiac')) bonus += 0.05;
    if (patientData.gender === 'female' && condition.includes('Migraine')) bonus += 0.05;
    
    medicalHistory.forEach(history => {
      if (history.toLowerCase().includes('diabetes') && condition.includes('Cardiac')) bonus += 0.15;
      if (history.toLowerCase().includes('hypertension') && condition.includes('Cardiac')) bonus += 0.1;
    });
    
    return Math.min(bonus, 0.3);
  }

  private generateReasoning(symptom: string, symptoms: string[], patientData: any): string {
    return `Analysis based on presenting symptoms (${symptoms.join(', ')}) in the context of patient demographics and medical history. The constellation of symptoms suggests ${symptom} as a likely diagnosis.`;
  }

  private identifyRiskFactors(patientData: any, medicalHistory: string[], condition: string): string[] {
    const riskFactors = [];
    
    if (patientData.age > 65) riskFactors.push('Advanced age');
    if (medicalHistory.includes('diabetes')) riskFactors.push('Diabetes mellitus');
    if (medicalHistory.includes('hypertension')) riskFactors.push('Hypertension');
    if (medicalHistory.includes('smoking')) riskFactors.push('Smoking history');
    
    return riskFactors;
  }

  private assessSeverity(symptoms: string[], redFlags: string[]): 'mild' | 'moderate' | 'severe' {
    const hasRedFlags = redFlags.some(flag => 
      symptoms.some(s => s.toLowerCase().includes(flag.toLowerCase()))
    );
    
    if (hasRedFlags) return 'severe';
    if (symptoms.length > 3) return 'moderate';
    return 'mild';
  }

  private assessUrgency(symptoms: string[], redFlags: string[]): 'routine' | 'urgent' | 'emergency' {
    const hasRedFlags = redFlags.some(flag => 
      symptoms.some(s => s.toLowerCase().includes(flag.toLowerCase()))
    );
    
    if (hasRedFlags) return 'emergency';
    if (symptoms.includes('chest pain') || symptoms.includes('shortness of breath')) return 'urgent';
    return 'routine';
  }

  private getContraindications(drug: string): string[] {
    const contraindications: Record<string, string[]> = {
      'warfarin': ['Pregnancy', 'Active bleeding', 'Recent surgery'],
      'lisinopril': ['Pregnancy', 'Bilateral renal artery stenosis', 'History of angioedema'],
      'metformin': ['Renal impairment', 'Hepatic disease', 'Alcohol abuse']
    };
    
    return contraindications[drug] || [];
  }

  private getSideEffects(drug: string): string[] {
    const sideEffects: Record<string, string[]> = {
      'warfarin': ['Bleeding', 'Skin necrosis', 'Purple toe syndrome'],
      'lisinopril': ['Dry cough', 'Hyperkalemia', 'Angioedema', 'Hypotension'],
      'metformin': ['Gastrointestinal upset', 'Lactic acidosis (rare)', 'Vitamin B12 deficiency']
    };
    
    return sideEffects[drug] || [];
  }

  private getPatientEducation(drug: string, condition: string): string {
    return `Take this medication as prescribed. Report any unusual symptoms. Regular monitoring is important for safe and effective treatment.`;
  }

  private getLifestyleEducation(lifestyle: string): string {
    return `Incorporate ${lifestyle} into your daily routine. This is an important part of managing your condition effectively.`;
  }

  private getMonitoringEducation(monitoring: string): string {
    return `Regular ${monitoring} is essential to track your progress and adjust treatment as needed.`;
  }

  private assessCostEffectiveness(drug: string): 'high' | 'moderate' | 'low' {
    const highCostDrugs = ['newer anticoagulants', 'specialty medications'];
    const moderateCostDrugs = ['ace inhibitors', 'statins'];
    
    if (highCostDrugs.some(costly => drug.toLowerCase().includes(costly))) return 'low';
    if (moderateCostDrugs.some(moderate => drug.toLowerCase().includes(moderate))) return 'moderate';
    return 'high';
  }
}

export const aiService = new AIService();