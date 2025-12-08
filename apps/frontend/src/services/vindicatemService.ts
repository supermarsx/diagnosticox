/**
 * VINDICATE-M Diagnostic Mnemonic Service
 * 
 * Systematic approach to differential diagnosis using the VINDICATE-M framework.
 * This mnemonic helps clinicians consider all major categories of disease:
 * 
 * V - Vascular (thrombosis, embolism, vasculitis)
 * I - Infectious/Inflammatory
 * N - Neoplastic (benign or malignant)
 * D - Degenerative/Developmental
 * I - Intoxication/Iatrogenic
 * C - Congenital
 * A - Autoimmune/Allergic
 * T - Traumatic
 * E - Endocrine/Metabolic
 * M - Mechanical (obstruction, foreign body)
 * 
 * @module services/vindicatemService
 * 
 * @example
 * const analysis = await vindicatemService.analyzeDifferentials({
 *   chiefComplaint: "Chest pain",
 *   symptoms: ["chest_pain", "shortness_of_breath"],
 *   demographics: { age: 55, sex: "male" }
 * });
 */

/**
 * VINDICATE-M categories
 */
export enum VindicateCategory {
  VASCULAR = 'vascular',
  INFECTIOUS = 'infectious',
  NEOPLASTIC = 'neoplastic',
  DEGENERATIVE = 'degenerative',
  INTOXICATION = 'intoxication',
  CONGENITAL = 'congenital',
  AUTOIMMUNE = 'autoimmune',
  TRAUMATIC = 'traumatic',
  ENDOCRINE = 'endocrine',
  MECHANICAL = 'mechanical',
}

/**
 * Category information
 */
export interface CategoryInfo {
  category: VindicateCategory;
  name: string;
  description: string;
  examples: string[];
  keyQuestions: string[];
  diagnosticTests: string[];
}

/**
 * Differential diagnosis within a category
 */
export interface CategoryDifferential {
  category: VindicateCategory;
  differentials: Array<{
    diagnosis: string;
    icd10Code?: string;
    probability: number; // 0-100
    supportingEvidence: string[];
    contradictingEvidence: string[];
    keyFindings: string[];
    recommendedTests: string[];
    urgency: 'emergency' | 'urgent' | 'routine';
  }>;
  categoryRelevance: number; // 0-100 - how relevant is this category
}

/**
 * Complete VINDICATE-M analysis
 */
export interface VindicateAnalysis {
  chiefComplaint: string;
  categories: CategoryDifferential[];
  topDiagnoses: Array<{
    diagnosis: string;
    category: VindicateCategory;
    probability: number;
    reasoning: string;
  }>;
  redFlags: string[];
  recommendedWorkup: {
    immediate: string[];
    urgent: string[];
    routine: string[];
  };
  clinicalPearls: string[];
}

/**
 * Patient presentation for analysis
 */
export interface PatientPresentation {
  chiefComplaint: string;
  symptoms: string[];
  duration: string;
  demographics: {
    age: number;
    sex: 'male' | 'female' | 'other';
    ethnicity?: string;
  };
  medicalHistory?: string[];
  medications?: string[];
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  };
  physicalExam?: string[];
}

/**
 * Bayesian probability calculation result
 */
export interface BayesianCalculation {
  priorProbability: number;
  posteriorProbability: number;
  likelihoodRatio: number;
  priorOdds: number;
  posteriorOdds: number;
  interpretation: string;
}

/**
 * Treatment trial protocol
 */
export interface TreatmentTrial {
  approach: string;
  rationale: string;
  phases: Array<{
    intervention: string;
    duration: string;
    successCriteria: string;
  }>;
  monitoringParameters: string[];
}

/**
 * Category definitions
 */
const CATEGORY_DEFINITIONS: Record<VindicateCategory, CategoryInfo> = {
  [VindicateCategory.VASCULAR]: {
    category: VindicateCategory.VASCULAR,
    name: 'Vascular',
    description: 'Blood vessel disorders including thrombosis, embolism, hemorrhage, and vasculitis',
    examples: [
      'Myocardial infarction',
      'Stroke (CVA)',
      'Pulmonary embolism',
      'Deep vein thrombosis',
      'Peripheral arterial disease',
      'Vasculitis',
      'Aortic dissection',
    ],
    keyQuestions: [
      'Sudden onset of symptoms?',
      'Risk factors for vascular disease (smoking, hypertension, diabetes)?',
      'History of cardiovascular disease?',
      'Chest pain, dyspnea, or neurological symptoms?',
    ],
    diagnosticTests: [
      'ECG',
      'Troponin',
      'D-dimer',
      'CT angiography',
      'Doppler ultrasound',
      'Echocardiography',
    ],
  },
  [VindicateCategory.INFECTIOUS]: {
    category: VindicateCategory.INFECTIOUS,
    name: 'Infectious/Inflammatory',
    description: 'Infections by bacteria, viruses, fungi, parasites, or non-infectious inflammation',
    examples: [
      'Pneumonia',
      'Urinary tract infection',
      'Meningitis',
      'Sepsis',
      'COVID-19',
      'Tuberculosis',
      'Inflammatory bowel disease',
    ],
    keyQuestions: [
      'Fever or chills?',
      'Recent exposures or travel?',
      'Immunocompromised status?',
      'Signs of infection (redness, warmth, drainage)?',
    ],
    diagnosticTests: [
      'Complete blood count (CBC)',
      'Blood cultures',
      'Urinalysis and culture',
      'Chest X-ray',
      'C-reactive protein (CRP)',
      'Erythrocyte sedimentation rate (ESR)',
    ],
  },
  [VindicateCategory.NEOPLASTIC]: {
    category: VindicateCategory.NEOPLASTIC,
    name: 'Neoplastic',
    description: 'Benign or malignant tumors and paraneoplastic syndromes',
    examples: [
      'Lung cancer',
      'Colorectal cancer',
      'Breast cancer',
      'Lymphoma',
      'Leukemia',
      'Brain tumor',
      'Benign prostatic hyperplasia',
    ],
    keyQuestions: [
      'Unexplained weight loss?',
      'Family history of cancer?',
      'Night sweats or persistent symptoms?',
      'Palpable mass or lymphadenopathy?',
    ],
    diagnosticTests: [
      'CT scan',
      'MRI',
      'Biopsy',
      'Tumor markers',
      'PET scan',
      'Colonoscopy/Endoscopy',
    ],
  },
  [VindicateCategory.DEGENERATIVE]: {
    category: VindicateCategory.DEGENERATIVE,
    name: 'Degenerative/Developmental',
    description: 'Progressive tissue degeneration or developmental abnormalities',
    examples: [
      'Osteoarthritis',
      'Alzheimer disease',
      'Parkinson disease',
      'Macular degeneration',
      'Congenital heart defects',
      'Neural tube defects',
    ],
    keyQuestions: [
      'Progressive worsening over time?',
      'Age-related symptoms?',
      'Family history of degenerative conditions?',
      'Developmental milestones affected?',
    ],
    diagnosticTests: [
      'MRI',
      'X-ray',
      'Neuropsychological testing',
      'Genetic testing',
      'Echocardiography',
    ],
  },
  [VindicateCategory.INTOXICATION]: {
    category: VindicateCategory.INTOXICATION,
    name: 'Intoxication/Iatrogenic',
    description: 'Drug toxicity, poisoning, medication side effects, or complications from medical treatment',
    examples: [
      'Drug overdose',
      'Medication side effects',
      'Drug-drug interactions',
      'Post-surgical complications',
      'Radiation toxicity',
      'Carbon monoxide poisoning',
    ],
    keyQuestions: [
      'Recent medication changes?',
      'Exposure to toxins or drugs?',
      'Recent procedures or surgeries?',
      'Symptoms related to medication timing?',
    ],
    diagnosticTests: [
      'Toxicology screen',
      'Medication levels',
      'Liver function tests',
      'Kidney function tests',
      'Blood gas analysis',
    ],
  },
  [VindicateCategory.CONGENITAL]: {
    category: VindicateCategory.CONGENITAL,
    name: 'Congenital',
    description: 'Conditions present from birth',
    examples: [
      'Congenital heart disease',
      'Cystic fibrosis',
      'Down syndrome',
      'Hemophilia',
      'Sickle cell disease',
      'Cleft palate',
    ],
    keyQuestions: [
      'Symptoms present since birth or early childhood?',
      'Family history of genetic conditions?',
      'Consanguinity in parents?',
      'Abnormal prenatal screening?',
    ],
    diagnosticTests: [
      'Genetic testing',
      'Karyotype analysis',
      'Echocardiography',
      'Newborn screening results',
      'Chromosomal microarray',
    ],
  },
  [VindicateCategory.AUTOIMMUNE]: {
    category: VindicateCategory.AUTOIMMUNE,
    name: 'Autoimmune/Allergic',
    description: 'Immune system attacking self-tissues or allergic reactions',
    examples: [
      'Systemic lupus erythematosus (SLE)',
      'Rheumatoid arthritis',
      'Multiple sclerosis',
      'Type 1 diabetes',
      'Anaphylaxis',
      'Asthma',
      'Celiac disease',
    ],
    keyQuestions: [
      'History of autoimmune disease?',
      'Known allergies?',
      'Symptoms wax and wane?',
      'Multi-system involvement?',
    ],
    diagnosticTests: [
      'Antinuclear antibodies (ANA)',
      'Rheumatoid factor',
      'Anti-CCP antibodies',
      'IgE levels',
      'Allergy testing',
      'Autoantibody panels',
    ],
  },
  [VindicateCategory.TRAUMATIC]: {
    category: VindicateCategory.TRAUMATIC,
    name: 'Traumatic',
    description: 'Physical injury from external forces',
    examples: [
      'Fractures',
      'Traumatic brain injury',
      'Lacerations',
      'Spinal cord injury',
      'Burns',
      'Contusions',
      'Post-traumatic stress disorder',
    ],
    keyQuestions: [
      'Recent trauma or injury?',
      'Mechanism of injury?',
      'Time since injury?',
      'Associated injuries?',
    ],
    diagnosticTests: [
      'X-ray',
      'CT scan',
      'MRI',
      'FAST exam (ultrasound)',
      'Wound culture',
    ],
  },
  [VindicateCategory.ENDOCRINE]: {
    category: VindicateCategory.ENDOCRINE,
    name: 'Endocrine/Metabolic',
    description: 'Hormonal imbalances and metabolic disorders',
    examples: [
      'Diabetes mellitus',
      'Hypothyroidism',
      'Hyperthyroidism',
      'Cushing syndrome',
      'Addison disease',
      'Electrolyte imbalances',
      'Pheochromocytoma',
    ],
    keyQuestions: [
      'Weight changes?',
      'Temperature intolerance?',
      'Polyuria, polydipsia, polyphagia?',
      'Changes in energy level or mood?',
    ],
    diagnosticTests: [
      'Thyroid function tests',
      'Fasting glucose',
      'HbA1c',
      'Electrolyte panel',
      'Cortisol levels',
      'Hormone panels',
    ],
  },
  [VindicateCategory.MECHANICAL]: {
    category: VindicateCategory.MECHANICAL,
    name: 'Mechanical',
    description: 'Physical obstruction or structural problems',
    examples: [
      'Bowel obstruction',
      'Kidney stones',
      'Hernias',
      'Foreign body',
      'Adhesions',
      'Volvulus',
      'Compartment syndrome',
    ],
    keyQuestions: [
      'Sudden onset of pain?',
      'History of surgery or procedures?',
      'Palpable mass or obstruction?',
      'Symptoms relieved by position changes?',
    ],
    diagnosticTests: [
      'X-ray',
      'CT scan',
      'Ultrasound',
      'Endoscopy',
      'Contrast studies',
    ],
  },
};

/**
 * VINDICATE-M Service Class
 */
export class VindicatemService {
  /**
   * Get category information
   */
  getCategoryInfo(category: VindicateCategory): CategoryInfo {
    return CATEGORY_DEFINITIONS[category];
  }

  /**
   * Get all categories
   */
  getAllCategories(): CategoryInfo[] {
    return Object.values(CATEGORY_DEFINITIONS);
  }

  /**
   * Analyze patient presentation using VINDICATE-M framework
   */
  async analyze(presentation: PatientPresentation): Promise<VindicateAnalysis> {
    const categories = await this.analyzeByCategorories(presentation);
    const topDiagnoses = this.extractTopDiagnoses(categories);
    const redFlags = this.identifyRedFlags(presentation);
    const recommendedWorkup = this.generateWorkup(categories, presentation);
    const clinicalPearls = this.generateClinicalPearls(presentation, categories);

    return {
      chiefComplaint: presentation.chiefComplaint,
      categories,
      topDiagnoses,
      redFlags,
      recommendedWorkup,
      clinicalPearls,
    };
  }

  /**
   * Analyze by each VINDICATE category
   * @private
   */
  private async analyzeByCategorories(
    presentation: PatientPresentation
  ): Promise<CategoryDifferential[]> {
    const categories: CategoryDifferential[] = [];

    // Analyze each category
    for (const category of Object.values(VindicateCategory)) {
      const differential = await this.analyzeCategory(category, presentation);
      if (differential.categoryRelevance > 10) {
        // Only include relevant categories
        categories.push(differential);
      }
    }

    // Sort by relevance
    return categories.sort((a, b) => b.categoryRelevance - a.categoryRelevance);
  }

  /**
   * Analyze specific category
   * @private
   */
  private async analyzeCategory(
    category: VindicateCategory,
    presentation: PatientPresentation
  ): Promise<CategoryDifferential> {
    const categoryInfo = CATEGORY_DEFINITIONS[category];
    
    // Simple heuristic-based analysis
    // In production, this would use AI or expert system
    const differentials = this.generateCategoryDifferentials(category, presentation);
    const categoryRelevance = this.calculateCategoryRelevance(category, presentation);

    return {
      category,
      differentials,
      categoryRelevance,
    };
  }

  /**
   * Generate differentials for a category
   * @private
   */
  private generateCategoryDifferentials(
    category: VindicateCategory,
    presentation: PatientPresentation
  ): CategoryDifferential['differentials'] {
    const { chiefComplaint, symptoms, demographics } = presentation;
    const differentials: CategoryDifferential['differentials'] = [];

    // Example heuristics (simplified)
    if (category === VindicateCategory.VASCULAR && chiefComplaint.toLowerCase().includes('chest')) {
      differentials.push({
        diagnosis: 'Acute Coronary Syndrome',
        icd10Code: 'I24.9',
        probability: demographics.age > 45 ? 75 : 45,
        supportingEvidence: [
          'Chest pain presentation',
          'Age > 45 years',
          'Classic vascular risk factors',
        ],
        contradictingEvidence: [],
        keyFindings: ['Chest pain', 'Dyspnea', 'Diaphoresis'],
        recommendedTests: ['ECG', 'Troponin', 'CK-MB'],
        urgency: 'emergency',
      });
    }

    if (category === VindicateCategory.INFECTIOUS && symptoms.some(s => s.includes('fever'))) {
      differentials.push({
        diagnosis: 'Bacterial Infection',
        icd10Code: 'A49.9',
        probability: 60,
        supportingEvidence: ['Fever present', 'Systemic symptoms'],
        contradictingEvidence: [],
        keyFindings: ['Fever', 'Elevated WBC'],
        recommendedTests: ['CBC', 'Blood cultures', 'CRP'],
        urgency: 'urgent',
      });
    }

    return differentials;
  }

  /**
   * Calculate category relevance
   * @private
   */
  private calculateCategoryRelevance(
    category: VindicateCategory,
    presentation: PatientPresentation
  ): number {
    let relevance = 0;
    const { chiefComplaint, symptoms, demographics } = presentation;
    const complaint = chiefComplaint.toLowerCase();

    // Age-based relevance
    if (category === VindicateCategory.DEGENERATIVE && demographics.age > 60) {
      relevance += 30;
    }
    if (category === VindicateCategory.CONGENITAL && demographics.age < 18) {
      relevance += 40;
    }

    // Symptom-based relevance
    if (category === VindicateCategory.VASCULAR && complaint.includes('chest')) {
      relevance += 50;
    }
    if (category === VindicateCategory.TRAUMATIC && complaint.includes('injury')) {
      relevance += 70;
    }

    return Math.min(relevance, 100);
  }

  /**
   * Extract top diagnoses across all categories
   * @private
   */
  private extractTopDiagnoses(
    categories: CategoryDifferential[]
  ): VindicateAnalysis['topDiagnoses'] {
    const allDiagnoses: VindicateAnalysis['topDiagnoses'] = [];

    categories.forEach(cat => {
      cat.differentials.forEach(diff => {
        allDiagnoses.push({
          diagnosis: diff.diagnosis,
          category: cat.category,
          probability: diff.probability,
          reasoning: diff.supportingEvidence.join('; '),
        });
      });
    });

    return allDiagnoses
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 10);
  }

  /**
   * Identify red flags requiring immediate attention
   * @private
   */
  private identifyRedFlags(presentation: PatientPresentation): string[] {
    const redFlags: string[] = [];
    const { chiefComplaint, vitalSigns } = presentation;

    if (chiefComplaint.toLowerCase().includes('chest pain')) {
      redFlags.push('Chest pain - rule out acute coronary syndrome');
    }

    if (vitalSigns?.temperature && vitalSigns.temperature > 39) {
      redFlags.push('High fever (>39°C) - evaluate for sepsis');
    }

    if (vitalSigns?.oxygenSaturation && vitalSigns.oxygenSaturation < 90) {
      redFlags.push('Hypoxemia (SpO2 <90%) - respiratory failure risk');
    }

    return redFlags;
  }

  /**
   * Generate recommended workup
   * @private
   */
  private generateWorkup(
    categories: CategoryDifferential[],
    presentation: PatientPresentation
  ): VindicateAnalysis['recommendedWorkup'] {
    const immediate: string[] = [];
    const urgent: string[] = [];
    const routine: string[] = [];

    categories.forEach(cat => {
      cat.differentials.forEach(diff => {
        diff.recommendedTests.forEach(test => {
          if (diff.urgency === 'emergency' && !immediate.includes(test)) {
            immediate.push(test);
          } else if (diff.urgency === 'urgent' && !urgent.includes(test)) {
            urgent.push(test);
          } else if (!routine.includes(test)) {
            routine.push(test);
          }
        });
      });
    });

    return { immediate, urgent, routine };
  }

  /**
   * Generate clinical pearls
   * @private
   */
  private generateClinicalPearls(
    presentation: PatientPresentation,
    categories: CategoryDifferential[]
  ): string[] {
    const pearls: string[] = [
      'VINDICATE-M provides systematic approach to differential diagnosis',
      'Consider life-threatening conditions first (Vascular, Infectious)',
      'Age and demographics significantly influence diagnostic likelihood',
    ];

    if (presentation.demographics.age > 50) {
      pearls.push('Higher risk for degenerative and neoplastic conditions in this age group');
    }

    return pearls;
  }

  /**
   * Simple helper method for getCategories (alias for getAllCategories)
   */
  getCategories() {
    return this.getAllCategories();
  }

  /**
   * Simplified differential diagnosis analysis
   */
  analyzeDifferentialDiagnosis(params: { symptoms: string[]; age: number; gender: string; duration: string; severity: string }) {
    // Simplified implementation that returns mock data structure expected by UI
    return {
      differentials: [
        {
          condition: 'Hypertension',
          category: 'vascular' as VindicateCategory,
          probability: 0.75,
          supportingEvidence: params.symptoms,
        },
        {
          condition: 'Type 2 Diabetes',
          category: 'endocrine_metabolic' as VindicateCategory,
          probability: 0.6,
          supportingEvidence: params.symptoms,
        },
      ],
      recommendedTests: [
        { test: 'Blood Pressure Measurement', rationale: 'Screen for hypertension', priority: 'high' },
        { test: 'HbA1c', rationale: 'Screen for diabetes', priority: 'medium' },
      ],
    };
  }

  /**
   * Calculate Bayesian probability
   */
  calculateBayesianProbability(params: { priorProbability: number; sensitivity: number; specificity: number; testResult: boolean }) {
    const { priorProbability, sensitivity, specificity, testResult } = params;
    const likelihoodRatio = testResult ? sensitivity / (1 - specificity) : (1 - sensitivity) / specificity;
    const priorOdds = priorProbability / (1 - priorProbability);
    const posteriorOdds = priorOdds * likelihoodRatio;
    const posteriorProbability = posteriorOdds / (1 + posteriorOdds);

    return {
      priorProbability,
      posteriorProbability,
      likelihoodRatio,
      priorOdds,
      posteriorOdds,
      interpretation: posteriorProbability > 0.8
        ? 'High probability - consider diagnosis likely'
        : posteriorProbability > 0.5
        ? 'Moderate probability - further testing recommended'
        : 'Low probability - consider alternative diagnoses',
    };
  }

  /**
   * Design treatment trial protocol
   */
  designTreatmentTrial(params: { diagnosis: string; confidence: number; severity: string; contraindications: string[] }) {
    return {
      approach: params.confidence > 0.7 ? 'Empirical treatment trial' : 'Diagnostic workup before treatment',
      rationale: `Based on ${(params.confidence * 100).toFixed(0)}% diagnostic confidence`,
      phases: [
        {
          intervention: 'Initial conservative management',
          duration: '2 weeks',
          successCriteria: '30% symptom improvement',
        },
        {
          intervention: 'Escalate therapy if no response',
          duration: '4 weeks',
          successCriteria: '50% symptom improvement',
        },
      ],
      monitoringParameters: ['Symptom severity', 'Adverse effects', 'Quality of life', 'Functional status'],
    };
  }
}


/**
 * Default VINDICATE-M service instance
 */
export const vindicatemService = new VindicatemService();

export default VindicatemService;
