/**
 * DSM-5-TR Psychiatric Assessment Service
 * 
 * Implements validated psychiatric screening instruments and assessment tools
 * including PHQ-9, GAD-7, PC-PTSD-5, and DSM-5-TR differential diagnosis support.
 * 
 * @module services/dsm5Service
 * @see {@link https://www.psychiatry.org/psychiatrists/practice/dsm|APA DSM-5-TR}
 */

/**
 * PHQ-9 Depression Severity Assessment
 * Public domain instrument for depression screening
 */
export interface PHQ9Item {
  question: string;
  score: 0 | 1 | 2 | 3;
}

export interface PHQ9Result {
  totalScore: number;
  severity: 'none-minimal' | 'mild' | 'moderate' | 'moderately-severe' | 'severe';
  item9Response: 0 | 1 | 2 | 3; // Suicide risk item
  requiresClinicalFollowup: boolean;
  functionalImpairment: boolean;
  interpretation: string;
  recommendations: string[];
}

/**
 * GAD-7 Anxiety Severity Assessment
 * Public domain instrument for anxiety screening
 */
export interface GAD7Item {
  question: string;
  score: 0 | 1 | 2 | 3;
}

export interface GAD7Result {
  totalScore: number;
  severity: 'none-minimal' | 'mild' | 'moderate' | 'severe';
  interpretation: string;
  recommendations: string[];
}

/**
 * PC-PTSD-5 PTSD Screening
 * 5-item screening for PTSD
 */
export interface PCPTSD5Result {
  positiveScreens: number;
  ptsdLikely: boolean;
  recommendations: string[];
}

/**
 * DSM-5-TR diagnostic criteria template
 */
export interface DSM5Criteria {
  disorder: string;
  diagnosticCode: string; // ICD-10-CM code
  criteriaA: { met: boolean; details: string };
  criteriaB?: { met: boolean; details: string };
  criteriaC?: { met: boolean; details: string };
  criteriaD?: { met: boolean; details: string };
  criteriaE?: { met: boolean; details: string };
  duration: { met: boolean; details: string };
  exclusions: { met: boolean; details: string };
  specifiers?: string[];
  confidence: number;
}

/**
 * PHQ-9 questions (public domain)
 */
const PHQ9_QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling/staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
  'Trouble concentrating on things, such as reading the newspaper or watching television',
  'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
  'Thoughts that you would be better off dead, or of hurting yourself in some way',
];

/**
 * GAD-7 questions (public domain)
 */
const GAD7_QUESTIONS = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it is hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid, as if something awful might happen',
];

/**
 * DSM-5-TR Service class
 * Handles psychiatric assessment scoring and DSM-5-TR differential diagnosis
 */
class DSM5Service {
  /**
   * Calculate PHQ-9 depression score
   * 
   * @param {PHQ9Item[]} items - Array of 9 PHQ-9 item responses
   * @param {boolean} hasFunctionalImpairment - Patient reported functional impairment
   * @returns {PHQ9Result} Scored result with interpretation
   * 
   * @example
   * const items: PHQ9Item[] = [
   *   { question: PHQ9_QUESTIONS[0], score: 2 },
   *   // ... 8 more items
   * ];
   * const result = dsm5Service.scorePHQ9(items, true);
   * if (result.requiresClinicalFollowup) {
   *   console.log('ALERT: Clinical follow-up required for item 9');
   * }
   */
  scorePHQ9(items: PHQ9Item[], hasFunctionalImpairment: boolean): PHQ9Result {
    if (items.length !== 9) {
      throw new Error('PHQ-9 requires exactly 9 items');
    }

    const totalScore = items.reduce((sum, item) => sum + item.score, 0);
    const item9Response = items[8].score; // Suicide risk item

    let severity: PHQ9Result['severity'];
    if (totalScore <= 4) severity = 'none-minimal';
    else if (totalScore <= 9) severity = 'mild';
    else if (totalScore <= 14) severity = 'moderate';
    else if (totalScore <= 19) severity = 'moderately-severe';
    else severity = 'severe';

    const requiresClinicalFollowup = item9Response > 0;

    let interpretation = '';
    const recommendations: string[] = [];

    switch (severity) {
      case 'none-minimal':
        interpretation = 'No or minimal depression symptoms. Continue routine monitoring.';
        recommendations.push('Routine follow-up as clinically indicated');
        break;
      case 'mild':
        interpretation = 'Mild depression. Consider watchful waiting, patient education.';
        recommendations.push('Patient education on depression');
        recommendations.push('Watchful waiting with repeat PHQ-9 in 2-4 weeks');
        recommendations.push('Consider psychotherapy if symptoms persist');
        break;
      case 'moderate':
        interpretation = 'Moderate depression. Active treatment warranted.';
        recommendations.push('Initiate treatment plan (psychotherapy and/or medication)');
        recommendations.push('Follow-up within 2 weeks');
        recommendations.push('Repeat PHQ-9 at follow-up');
        break;
      case 'moderately-severe':
        interpretation = 'Moderately severe depression. Active treatment strongly recommended.';
        recommendations.push('Immediate initiation of treatment (medication + psychotherapy)');
        recommendations.push('Close follow-up within 1 week');
        recommendations.push('Consider psychiatric consultation');
        recommendations.push('Assess suicide risk thoroughly');
        break;
      case 'severe':
        interpretation = 'Severe depression. Urgent treatment required.';
        recommendations.push('URGENT: Immediate psychiatric evaluation');
        recommendations.push('Initiate intensive treatment (medication + psychotherapy)');
        recommendations.push('Consider hospitalization if suicide risk or severe impairment');
        recommendations.push('Daily or near-daily monitoring initially');
        break;
    }

    if (requiresClinicalFollowup) {
      recommendations.unshift(
        '⚠️ CRITICAL: Positive response on item 9 requires immediate clinical interview to assess suicide risk'
      );
    }

    return {
      totalScore,
      severity,
      item9Response,
      requiresClinicalFollowup,
      functionalImpairment: hasFunctionalImpairment,
      interpretation,
      recommendations,
    };
  }

  /**
   * Calculate GAD-7 anxiety score
   * 
   * @param {GAD7Item[]} items - Array of 7 GAD-7 item responses
   * @returns {GAD7Result} Scored result with interpretation
   * 
   * @example
   * const items: GAD7Item[] = [
   *   { question: GAD7_QUESTIONS[0], score: 3 },
   *   // ... 6 more items
   * ];
   * const result = dsm5Service.scoreGAD7(items);
   * console.log(`Anxiety severity: ${result.severity}`);
   */
  scoreGAD7(items: GAD7Item[]): GAD7Result {
    if (items.length !== 7) {
      throw new Error('GAD-7 requires exactly 7 items');
    }

    const totalScore = items.reduce((sum, item) => sum + item.score, 0);

    let severity: GAD7Result['severity'];
    if (totalScore < 5) severity = 'none-minimal';
    else if (totalScore < 10) severity = 'mild';
    else if (totalScore < 15) severity = 'moderate';
    else severity = 'severe';

    let interpretation = '';
    const recommendations: string[] = [];

    switch (severity) {
      case 'none-minimal':
        interpretation = 'No or minimal anxiety symptoms.';
        recommendations.push('Routine monitoring as clinically indicated');
        break;
      case 'mild':
        interpretation = 'Mild anxiety. Consider watchful waiting or brief intervention.';
        recommendations.push('Patient education on anxiety management');
        recommendations.push('Lifestyle modifications (exercise, sleep hygiene, stress reduction)');
        recommendations.push('Repeat GAD-7 in 2-4 weeks');
        break;
      case 'moderate':
        interpretation = 'Moderate anxiety. Active treatment recommended.';
        recommendations.push('Initiate treatment (psychotherapy and/or medication)');
        recommendations.push('Follow-up within 2-3 weeks');
        recommendations.push('Consider cognitive-behavioral therapy');
        break;
      case 'severe':
        interpretation = 'Severe anxiety. Prompt treatment required.';
        recommendations.push('Immediate initiation of treatment');
        recommendations.push('Consider combined therapy (medication + psychotherapy)');
        recommendations.push('Close follow-up within 1 week');
        recommendations.push('Rule out panic disorder, PTSD, and other anxiety disorders');
        break;
    }

    return {
      totalScore,
      severity,
      interpretation,
      recommendations,
    };
  }

  /**
   * Score PC-PTSD-5 PTSD screening
   * 
   * @param {boolean[]} responses - 5 yes/no responses
   * @returns {PCPTSD5Result} Screening result
   * 
   * @example
   * const responses = [true, true, false, true, false];
   * const result = dsm5Service.scorePCPTSD5(responses);
   * if (result.ptsdLikely) {
   *   console.log('Positive PTSD screen - full assessment recommended');
   * }
   */
  scorePCPTSD5(responses: boolean[]): PCPTSD5Result {
    if (responses.length !== 5) {
      throw new Error('PC-PTSD-5 requires exactly 5 items');
    }

    const positiveScreens = responses.filter((r) => r).length;
    const ptsdLikely = positiveScreens >= 3;

    const recommendations: string[] = [];

    if (ptsdLikely) {
      recommendations.push('Positive PTSD screen');
      recommendations.push('Conduct full clinical assessment for PTSD');
      recommendations.push('Consider PCL-5 (PTSD Checklist) for detailed symptom assessment');
      recommendations.push('Evaluate for comorbid depression and anxiety');
      recommendations.push('Initiate evidence-based PTSD treatment if diagnosis confirmed');
    } else {
      recommendations.push('Negative PTSD screen');
      recommendations.push('Continue routine monitoring for trauma-related symptoms');
    }

    return {
      positiveScreens,
      ptsdLikely,
      recommendations,
    };
  }

  /**
   * Generate DSM-5-TR differential diagnosis
   * 
   * @param {Object} symptoms - Patient symptom profile
   * @returns {DSM5Criteria[]} Ranked list of potential diagnoses
   * 
   * @example
   * const symptoms = {
   *   depressedMood: true,
   *   anhedonia: true,
   *   sleepDisturbance: true,
   *   // ... more symptoms
   * };
   * const differentials = dsm5Service.generateDifferentialDiagnosis(symptoms);
   * differentials.forEach(dx => {
   *   console.log(`${dx.disorder} (${dx.diagnosticCode}): ${dx.confidence}% confidence`);
   * });
   */
  generateDifferentialDiagnosis(symptoms: any): DSM5Criteria[] {
    // Simplified differential diagnosis logic
    // In production, this would be much more comprehensive
    const differentials: DSM5Criteria[] = [];

    // Example: Major Depressive Disorder criteria check
    if (symptoms.depressedMood || symptoms.anhedonia) {
      differentials.push({
        disorder: 'Major Depressive Disorder',
        diagnosticCode: 'F32.9', // ICD-10-CM
        criteriaA: {
          met: symptoms.depressedMood || symptoms.anhedonia,
          details: 'Depressed mood or anhedonia present',
        },
        criteriaB: {
          met: false, // Would check for 5+ symptoms
          details: 'Additional symptom count evaluation needed',
        },
        duration: {
          met: false, // Would check for 2+ weeks
          details: 'Duration assessment needed',
        },
        exclusions: {
          met: false, // Would check for medical/substance causes
          details: 'Rule out medical conditions, medications, bipolar, bereavement',
        },
        confidence: 65,
      });
    }

    // Sort by confidence
    return differentials.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get PHQ-9 questions
   * @returns {string[]} Array of PHQ-9 questions
   */
  getPHQ9Questions(): string[] {
    return PHQ9_QUESTIONS;
  }

  /**
   * Get GAD-7 questions
   * @returns {string[]} Array of GAD-7 questions
   */
  getGAD7Questions(): string[] {
    return GAD7_QUESTIONS;
  }
}

/**
 * Default DSM-5 service instance
 */
export const dsm5Service = new DSM5Service();

export default DSM5Service;
