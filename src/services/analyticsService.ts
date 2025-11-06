// Analytics Service - Provides medical analytics data and insights

export interface PatientOutcome {
  patientId: string;
  patientName: string;
  condition: string;
  treatmentStart: string;
  currentStatus: 'improving' | 'stable' | 'declining' | 'resolved';
  qualityOfLife: number; // 0-100
  symptomSeverity: number; // 0-10
  adherenceRate: number; // 0-100
  adverseEvents: number;
  costOfCare: number;
}

export interface TreatmentEfficacy {
  treatmentName: string;
  condition: string;
  patientsCount: number;
  successRate: number; // 0-100
  averageResponseTime: number; // days
  adverseEventRate: number; // 0-100
  costPerPatient: number;
  evidenceLevel: 'I' | 'II' | 'III' | 'IV' | 'V';
  qualityImprovement: number; // percentage
}

export interface PopulationMetric {
  condition: string;
  prevalence: number; // per 1000
  incidence: number; // per 1000 per year
  averageAge: number;
  genderRatio: { male: number; female: number }; // percentages
  treatmentCoverage: number; // percentage
  outcomeSuccess: number; // percentage
}

export interface ClinicPerformance {
  metric: string;
  current: number;
  target: number;
  benchmark: number;
  trend: 'up' | 'down' | 'stable';
  category: 'quality' | 'safety' | 'efficiency' | 'satisfaction';
}

export interface TimeSeriesData {
  date: string;
  value: number;
  category?: string;
}

export interface TreatmentPathway {
  from: string;
  to: string;
  patients: number;
  successRate: number;
}

class AnalyticsService {
  // Patient Outcomes Data
  getPatientOutcomes(): PatientOutcome[] {
    return [
      {
        patientId: 'patient-1',
        patientName: 'John Doe',
        condition: 'Hypothyroidism',
        treatmentStart: '2025-09-01',
        currentStatus: 'improving',
        qualityOfLife: 72,
        symptomSeverity: 3.5,
        adherenceRate: 88,
        adverseEvents: 0,
        costOfCare: 2400,
      },
      {
        patientId: 'patient-2',
        patientName: 'Sarah Johnson',
        condition: 'Rheumatoid Arthritis',
        treatmentStart: '2025-08-15',
        currentStatus: 'stable',
        qualityOfLife: 65,
        symptomSeverity: 4.2,
        adherenceRate: 92,
        adverseEvents: 1,
        costOfCare: 8500,
      },
    ];
  }

  // Treatment Efficacy Comparison
  getTreatmentEfficacy(): TreatmentEfficacy[] {
    return [
      {
        treatmentName: 'Methotrexate Monotherapy',
        condition: 'Rheumatoid Arthritis',
        patientsCount: 145,
        successRate: 68,
        averageResponseTime: 84,
        adverseEventRate: 12,
        costPerPatient: 8200,
        evidenceLevel: 'I',
        qualityImprovement: 35,
      },
      {
        treatmentName: 'TNF Inhibitor + Methotrexate',
        condition: 'Rheumatoid Arthritis',
        patientsCount: 89,
        successRate: 82,
        averageResponseTime: 56,
        adverseEventRate: 18,
        costPerPatient: 28500,
        evidenceLevel: 'I',
        qualityImprovement: 58,
      },
      {
        treatmentName: 'Levothyroxine',
        condition: 'Hypothyroidism',
        patientsCount: 312,
        successRate: 94,
        averageResponseTime: 28,
        adverseEventRate: 3,
        costPerPatient: 1200,
        evidenceLevel: 'I',
        qualityImprovement: 72,
      },
      {
        treatmentName: '5-ASA Medications',
        condition: 'Ulcerative Colitis',
        patientsCount: 67,
        successRate: 71,
        averageResponseTime: 42,
        adverseEventRate: 8,
        costPerPatient: 5600,
        evidenceLevel: 'II',
        qualityImprovement: 48,
      },
    ];
  }

  // Population Health Metrics
  getPopulationMetrics(): PopulationMetric[] {
    return [
      {
        condition: 'Rheumatoid Arthritis',
        prevalence: 8.5,
        incidence: 0.6,
        averageAge: 52,
        genderRatio: { male: 35, female: 65 },
        treatmentCoverage: 78,
        outcomeSuccess: 74,
      },
      {
        condition: 'Hypothyroidism',
        prevalence: 15.2,
        incidence: 1.2,
        averageAge: 58,
        genderRatio: { male: 20, female: 80 },
        treatmentCoverage: 92,
        outcomeSuccess: 89,
      },
      {
        condition: 'Ulcerative Colitis',
        prevalence: 5.3,
        incidence: 0.4,
        averageAge: 42,
        genderRatio: { male: 48, female: 52 },
        treatmentCoverage: 68,
        outcomeSuccess: 65,
      },
      {
        condition: 'Celiac Disease',
        prevalence: 7.1,
        incidence: 0.5,
        averageAge: 38,
        genderRatio: { male: 40, female: 60 },
        treatmentCoverage: 82,
        outcomeSuccess: 81,
      },
    ];
  }

  // Clinical Quality Metrics
  getClinicalQualityMetrics(): ClinicPerformance[] {
    return [
      {
        metric: 'Diagnostic Accuracy',
        current: 89.7,
        target: 92.0,
        benchmark: 88.5,
        trend: 'up',
        category: 'quality',
      },
      {
        metric: 'Treatment Adherence',
        current: 84.2,
        target: 90.0,
        benchmark: 82.0,
        trend: 'up',
        category: 'quality',
      },
      {
        metric: 'Patient Satisfaction',
        current: 91.5,
        target: 95.0,
        benchmark: 89.0,
        trend: 'stable',
        category: 'satisfaction',
      },
      {
        metric: 'Adverse Event Rate',
        current: 3.8,
        target: 2.5,
        benchmark: 4.2,
        trend: 'down',
        category: 'safety',
      },
      {
        metric: 'Average Time to Diagnosis',
        current: 18.5,
        target: 14.0,
        benchmark: 21.0,
        trend: 'down',
        category: 'efficiency',
      },
      {
        metric: 'Cost per Patient',
        current: 6800,
        target: 6000,
        benchmark: 7200,
        trend: 'down',
        category: 'efficiency',
      },
      {
        metric: 'Readmission Rate',
        current: 8.2,
        target: 6.0,
        benchmark: 9.5,
        trend: 'down',
        category: 'quality',
      },
      {
        metric: 'Quality of Life Improvement',
        current: 67.3,
        target: 75.0,
        benchmark: 65.0,
        trend: 'up',
        category: 'quality',
      },
    ];
  }

  // Time Series - Patient Outcomes Over Time
  getOutcomeTrends(): TimeSeriesData[] {
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    return months.flatMap((month, idx) => [
      {
        date: month,
        value: 68 + idx * 3 + Math.random() * 2,
        category: 'Treatment Success Rate',
      },
      {
        date: month,
        value: 85 + idx * 1.5 + Math.random() * 2,
        category: 'Patient Satisfaction',
      },
      {
        date: month,
        value: 4.5 - idx * 0.3 + Math.random() * 0.2,
        category: 'Average Symptom Severity',
      },
    ]);
  }

  // Treatment Pathway Analysis
  getTreatmentPathways(): TreatmentPathway[] {
    return [
      {
        from: 'Initial Diagnosis',
        to: 'First-line Therapy',
        patients: 245,
        successRate: 72,
      },
      {
        from: 'First-line Therapy',
        to: 'Treatment Success',
        patients: 176,
        successRate: 72,
      },
      {
        from: 'First-line Therapy',
        to: 'Second-line Therapy',
        patients: 69,
        successRate: 28,
      },
      {
        from: 'Second-line Therapy',
        to: 'Treatment Success',
        patients: 54,
        successRate: 78,
      },
      {
        from: 'Second-line Therapy',
        to: 'Tertiary Care',
        patients: 15,
        successRate: 22,
      },
      {
        from: 'Tertiary Care',
        to: 'Treatment Success',
        patients: 12,
        successRate: 80,
      },
    ];
  }

  // Monthly Cost Analysis
  getCostTrends(): TimeSeriesData[] {
    return [
      { date: 'Jul', value: 124500, category: 'Medication Costs' },
      { date: 'Aug', value: 132800, category: 'Medication Costs' },
      { date: 'Sep', value: 128600, category: 'Medication Costs' },
      { date: 'Oct', value: 135200, category: 'Medication Costs' },
      { date: 'Nov', value: 142100, category: 'Medication Costs' },
      { date: 'Jul', value: 45200, category: 'Lab Tests' },
      { date: 'Aug', value: 48600, category: 'Lab Tests' },
      { date: 'Sep', value: 46800, category: 'Lab Tests' },
      { date: 'Oct', value: 49200, category: 'Lab Tests' },
      { date: 'Nov', value: 51400, category: 'Lab Tests' },
      { date: 'Jul', value: 28900, category: 'Imaging' },
      { date: 'Aug', value: 31200, category: 'Imaging' },
      { date: 'Sep', value: 29800, category: 'Imaging' },
      { date: 'Oct', value: 32400, category: 'Imaging' },
      { date: 'Nov', value: 33600, category: 'Imaging' },
    ];
  }

  // Predictive Analytics - Risk Stratification
  getRiskStratification() {
    return {
      lowRisk: { count: 156, percentage: 63.7, avgCost: 3200 },
      moderateRisk: { count: 67, percentage: 27.3, avgCost: 8500 },
      highRisk: { count: 22, percentage: 9.0, avgCost: 24800 },
    };
  }

  // Compliance Metrics
  getComplianceMetrics() {
    return [
      {
        measure: 'Diabetes HbA1c Testing',
        compliance: 92,
        target: 90,
        eligible: 145,
        compliant: 133,
      },
      {
        measure: 'Hypertension BP Control',
        compliance: 87,
        target: 85,
        eligible: 189,
        compliant: 164,
      },
      {
        measure: 'Preventive Care Screening',
        compliance: 78,
        target: 80,
        eligible: 312,
        compliant: 243,
      },
      {
        measure: 'Medication Reconciliation',
        compliance: 94,
        target: 95,
        eligible: 245,
        compliant: 230,
      },
    ];
  }

  // Generate Summary Statistics
  getSummaryStatistics() {
    return {
      totalPatients: 245,
      activePatients: 198,
      averageTreatmentDuration: 126, // days
      overallSuccessRate: 76.8,
      patientSatisfaction: 91.5,
      qualityOfLifeImprovement: 67.3,
      costPerPatientPerMonth: 2840,
      adverseEventRate: 3.8,
      diagnosticAccuracy: 89.7,
      treatmentAdherence: 84.2,
    };
  }
}

export const analyticsService = new AnalyticsService();
