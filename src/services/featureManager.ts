/**
 * Feature Management System
 * 
 * Provides dynamic feature toggling based on usage modes, user roles, and configuration.
 * Supports 5 usage modes: Clinical Setting, Clinical Study, Student, Full Hospital, Self Exploration.
 * 
 * @module services/featureManager
 */

/**
 * Usage modes for the application
 */
export enum UsageMode {
  /** Full EHR integration, all clinical features */
  CLINICAL_SETTING = 'clinical_setting',
  
  /** Research data collection, IRB compliance tools */
  CLINICAL_STUDY = 'clinical_study',
  
  /** Educational mode with tutorials and simplified UI */
  STUDENT = 'student',
  
  /** Multi-department workflows, billing, administration */
  FULL_HOSPITAL = 'full_hospital',
  
  /** Patient-facing, simplified, consumer-friendly */
  SELF_EXPLORATION = 'self_exploration',
}

/**
 * Feature categories
 */
export enum FeatureCategory {
  CORE = 'core',
  CLINICAL = 'clinical',
  ADMINISTRATIVE = 'administrative',
  EDUCATIONAL = 'educational',
  RESEARCH = 'research',
  PATIENT_FACING = 'patient_facing',
}

/**
 * Individual feature definition
 */
export interface Feature {
  id: string;
  name: string;
  description: string;
  category: FeatureCategory;
  enabledInModes: UsageMode[];
  requiredRole?: string[];
  experimentalFlag?: boolean;
  dependencies?: string[]; // Feature IDs this feature depends on
  conflictsWith?: string[]; // Features that cannot be enabled simultaneously
}

/**
 * Feature configuration by usage mode
 */
interface ModeConfiguration {
  mode: UsageMode;
  name: string; // Alias for displayName for compatibility
  displayName: string;
  description: string;
  targetAudience: string;
  accessLevel: string;
  dataAccess: 'full' | 'limited' | 'anonymized' | 'read-only';
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canExport: boolean;
  };
  features: {
    enabled: string[]; // Feature IDs
    disabled: string[];
    hidden: string[]; // Hidden from UI but can be manually enabled
    restricted: string[]; // Explicitly restricted features
  };
  uiCustomizations: {
    showTutorials: boolean;
    showAdvancedOptions: boolean;
    simplifiedWorkflow: boolean;
    showBilling: boolean;
    showResearch: boolean;
    showAdministration: boolean;
  };
}

/**
 * Comprehensive feature registry
 */
const FEATURE_REGISTRY: Feature[] = [
  // Core Features
  {
    id: 'patient_management',
    name: 'Patient Management',
    description: 'Comprehensive patient record management',
    category: FeatureCategory.CORE,
    enabledInModes: [
      UsageMode.CLINICAL_SETTING,
      UsageMode.CLINICAL_STUDY,
      UsageMode.FULL_HOSPITAL,
    ],
  },
  {
    id: 'diagnosis_tools',
    name: 'Diagnosis Tools',
    description: 'AI-powered diagnosis and differential diagnosis',
    category: FeatureCategory.CORE,
    enabledInModes: Object.values(UsageMode),
  },
  {
    id: 'treatment_planning',
    name: 'Treatment Planning',
    description: 'Treatment recommendations and planning',
    category: FeatureCategory.CLINICAL,
    enabledInModes: [
      UsageMode.CLINICAL_SETTING,
      UsageMode.CLINICAL_STUDY,
      UsageMode.FULL_HOSPITAL,
    ],
  },
  
  // ICD/DSM Features
  {
    id: 'icd_lookup',
    name: 'ICD-10/ICD-11 Lookup',
    description: 'WHO ICD code search and mapping',
    category: FeatureCategory.CLINICAL,
    enabledInModes: [
      UsageMode.CLINICAL_SETTING,
      UsageMode.CLINICAL_STUDY,
      UsageMode.FULL_HOSPITAL,
      UsageMode.STUDENT,
    ],
  },
  {
    id: 'dsm5_assessments',
    name: 'DSM-5-TR Assessments',
    description: 'PHQ-9, GAD-7, and psychiatric screening tools',
    category: FeatureCategory.CLINICAL,
    enabledInModes: [
      UsageMode.CLINICAL_SETTING,
      UsageMode.CLINICAL_STUDY,
      UsageMode.FULL_HOSPITAL,
    ],
  },
  {
    id: 'symptom_checker',
    name: 'Symptom Checker',
    description: 'Comprehensive symptom database and checking',
    category: FeatureCategory.PATIENT_FACING,
    enabledInModes: Object.values(UsageMode),
  },
  
  // Medical Research Features
  {
    id: 'pubmed_integration',
    name: 'PubMed Integration',
    description: 'Medical literature search and evidence lookup',
    category: FeatureCategory.RESEARCH,
    enabledInModes: [
      UsageMode.CLINICAL_SETTING,
      UsageMode.CLINICAL_STUDY,
      UsageMode.STUDENT,
      UsageMode.FULL_HOSPITAL,
    ],
  },
  {
    id: 'clinical_trials',
    name: 'Clinical Trials Lookup',
    description: 'ClinicalTrials.gov integration',
    category: FeatureCategory.RESEARCH,
    enabledInModes: [
      UsageMode.CLINICAL_SETTING,
      UsageMode.CLINICAL_STUDY,
      UsageMode.FULL_HOSPITAL,
    ],
  },
  {
    id: 'drug_interactions',
    name: 'Drug Interaction Checker',
    description: 'DrugBank API integration for DDI checking',
    category: FeatureCategory.CLINICAL,
    enabledInModes: [
      UsageMode.CLINICAL_SETTING,
      UsageMode.CLINICAL_STUDY,
      UsageMode.FULL_HOSPITAL,
    ],
  },
  
  // Administrative Features
  {
    id: 'billing_coding',
    name: 'Billing & Coding',
    description: 'Medical billing and ICD code management',
    category: FeatureCategory.ADMINISTRATIVE,
    enabledInModes: [UsageMode.FULL_HOSPITAL],
    requiredRole: ['billing_specialist', 'admin'],
  },
  {
    id: 'multi_department',
    name: 'Multi-Department Management',
    description: 'Department workflows and coordination',
    category: FeatureCategory.ADMINISTRATIVE,
    enabledInModes: [UsageMode.FULL_HOSPITAL],
  },
  {
    id: 'security_center',
    name: 'Security Center',
    description: 'HIPAA compliance and security tools',
    category: FeatureCategory.ADMINISTRATIVE,
    enabledInModes: [UsageMode.CLINICAL_SETTING, UsageMode.FULL_HOSPITAL],
    requiredRole: ['admin', 'security_admin'],
  },
  
  // Educational Features
  {
    id: 'interactive_tutorials',
    name: 'Interactive Tutorials',
    description: 'Step-by-step learning modules',
    category: FeatureCategory.EDUCATIONAL,
    enabledInModes: [UsageMode.STUDENT, UsageMode.SELF_EXPLORATION],
  },
  {
    id: 'case_studies',
    name: 'Medical Case Studies',
    description: 'Educational case library',
    category: FeatureCategory.EDUCATIONAL,
    enabledInModes: [UsageMode.STUDENT, UsageMode.CLINICAL_STUDY],
  },
  {
    id: 'diagnostic_reasoning',
    name: 'Diagnostic Reasoning Trainer',
    description: 'VINDICATE-M mnemonic and systematic diagnosis',
    category: FeatureCategory.EDUCATIONAL,
    enabledInModes: [UsageMode.STUDENT, UsageMode.CLINICAL_STUDY],
  },
  
  // Research Features
  {
    id: 'research_data_collection',
    name: 'Research Data Collection',
    description: 'IRB-compliant data collection tools',
    category: FeatureCategory.RESEARCH,
    enabledInModes: [UsageMode.CLINICAL_STUDY],
  },
  {
    id: 'analytics_dashboard',
    name: 'Analytics Dashboard',
    description: 'Advanced analytics and reporting',
    category: FeatureCategory.RESEARCH,
    enabledInModes: [
      UsageMode.CLINICAL_STUDY,
      UsageMode.FULL_HOSPITAL,
    ],
  },
  
  // Patient-Facing Features
  {
    id: 'patient_diary',
    name: 'Patient Diary',
    description: 'Personal symptom and mood tracking',
    category: FeatureCategory.PATIENT_FACING,
    enabledInModes: [UsageMode.SELF_EXPLORATION],
  },
  {
    id: 'simplified_ui',
    name: 'Simplified UI',
    description: 'Consumer-friendly interface',
    category: FeatureCategory.PATIENT_FACING,
    enabledInModes: [UsageMode.SELF_EXPLORATION],
  },
  {
    id: 'health_education',
    name: 'Health Education',
    description: 'MedlinePlus health information',
    category: FeatureCategory.PATIENT_FACING,
    enabledInModes: [UsageMode.SELF_EXPLORATION, UsageMode.STUDENT],
  },
];

/**
 * Usage mode configurations
 */
const MODE_CONFIGURATIONS: Map<UsageMode, ModeConfiguration> = new Map([
  [
    UsageMode.CLINICAL_SETTING,
    {
      mode: UsageMode.CLINICAL_SETTING,
      name: 'Clinical Setting',
      displayName: 'Clinical Setting',
      description: 'Full EHR integration for clinical practice',
      targetAudience: 'Physicians, NPs, PAs in clinical practice',
      accessLevel: 'Professional',
      dataAccess: 'full',
      permissions: {
        canView: true,
        canEdit: true,
        canDelete: true,
        canExport: true,
      },
      features: {
        enabled: [
          'patient_management',
          'diagnosis_tools',
          'treatment_planning',
          'icd_lookup',
          'dsm5_assessments',
          'symptom_checker',
          'pubmed_integration',
          'clinical_trials',
          'drug_interactions',
          'security_center',
        ],
        disabled: ['billing_coding', 'multi_department', 'research_data_collection'],
        hidden: ['interactive_tutorials', 'simplified_ui'],
        restricted: [],
      },
      uiCustomizations: {
        showTutorials: false,
        showAdvancedOptions: true,
        simplifiedWorkflow: false,
        showBilling: false,
        showResearch: true,
        showAdministration: false,
      },
    },
  ],
  [
    UsageMode.CLINICAL_STUDY,
    {
      mode: UsageMode.CLINICAL_STUDY,
      name: 'Clinical Study',
      displayName: 'Clinical Study',
      description: 'Research data collection and analysis',
      targetAudience: 'Clinical researchers, study coordinators',
      accessLevel: 'Research',
      dataAccess: 'full',
      permissions: {
        canView: true,
        canEdit: true,
        canDelete: false,
        canExport: true,
      },
      features: {
        enabled: [
          'patient_management',
          'diagnosis_tools',
          'icd_lookup',
          'dsm5_assessments',
          'pubmed_integration',
          'clinical_trials',
          'research_data_collection',
          'analytics_dashboard',
          'case_studies',
          'diagnostic_reasoning',
        ],
        disabled: ['billing_coding', 'multi_department', 'simplified_ui'],
        hidden: ['patient_diary', 'health_education'],
        restricted: ['security_center', 'drug_interactions'],
      },
      uiCustomizations: {
        showTutorials: false,
        showAdvancedOptions: true,
        simplifiedWorkflow: false,
        showBilling: false,
        showResearch: true,
        showAdministration: false,
      },
    },
  ],
  [
    UsageMode.STUDENT,
    {
      mode: UsageMode.STUDENT,
      name: 'Student Mode',
      displayName: 'Student Mode',
      description: 'Educational platform for medical students',
      targetAudience: 'Medical students, residents',
      accessLevel: 'Educational',
      dataAccess: 'anonymized',
      permissions: {
        canView: true,
        canEdit: false,
        canDelete: false,
        canExport: false,
      },
      features: {
        enabled: [
          'diagnosis_tools',
          'symptom_checker',
          'icd_lookup',
          'pubmed_integration',
          'interactive_tutorials',
          'case_studies',
          'diagnostic_reasoning',
          'health_education',
        ],
        disabled: [
          'patient_management',
          'billing_coding',
          'security_center',
          'research_data_collection',
        ],
        hidden: ['treatment_planning', 'drug_interactions'],
        restricted: ['patient_management', 'drug_interactions', 'security_center'],
      },
      uiCustomizations: {
        showTutorials: true,
        showAdvancedOptions: false,
        simplifiedWorkflow: true,
        showBilling: false,
        showResearch: false,
        showAdministration: false,
      },
    },
  ],
  [
    UsageMode.FULL_HOSPITAL,
    {
      mode: UsageMode.FULL_HOSPITAL,
      name: 'Full Hospital',
      displayName: 'Full Hospital',
      description: 'Enterprise hospital system with all features',
      targetAudience: 'Hospital systems, large medical centers',
      accessLevel: 'Enterprise',
      dataAccess: 'full',
      permissions: {
        canView: true,
        canEdit: true,
        canDelete: true,
        canExport: true,
      },
      features: {
        enabled: Object.values(FEATURE_REGISTRY)
          .filter((f) =>
            f.category !== FeatureCategory.PATIENT_FACING &&
            f.category !== FeatureCategory.EDUCATIONAL
          )
          .map((f) => f.id),
        disabled: ['simplified_ui', 'patient_diary', 'interactive_tutorials'],
        hidden: [],
        restricted: [],
      },
      uiCustomizations: {
        showTutorials: false,
        showAdvancedOptions: true,
        simplifiedWorkflow: false,
        showBilling: true,
        showResearch: true,
        showAdministration: true,
      },
    },
  ],
  [
    UsageMode.SELF_EXPLORATION,
    {
      mode: UsageMode.SELF_EXPLORATION,
      name: 'Self Exploration',
      displayName: 'Self Exploration',
      description: 'Consumer-friendly symptom checker and health tracker',
      targetAudience: 'General public, patients',
      accessLevel: 'Consumer',
      dataAccess: 'limited',
      permissions: {
        canView: true,
        canEdit: false,
        canDelete: false,
        canExport: false,
      },
      features: {
        enabled: [
          'diagnosis_tools',
          'symptom_checker',
          'patient_diary',
          'simplified_ui',
          'health_education',
          'interactive_tutorials',
        ],
        disabled: [
          'patient_management',
          'treatment_planning',
          'billing_coding',
          'security_center',
          'research_data_collection',
          'drug_interactions',
        ],
        hidden: ['icd_lookup', 'dsm5_assessments', 'pubmed_integration'],
        restricted: ['patient_management', 'treatment_planning', 'drug_interactions', 'security_center'],
      },
      uiCustomizations: {
        showTutorials: true,
        showAdvancedOptions: false,
        simplifiedWorkflow: true,
        showBilling: false,
        showResearch: false,
        showAdministration: false,
      },
    },
  ],
]);

/**
 * Feature Manager class
 * Handles feature toggling, mode switching, and feature dependency resolution
 */
class FeatureManager {
  private currentMode: UsageMode;
  private overrides: Map<string, boolean> = new Map();
  private listeners: Set<(mode: UsageMode) => void> = new Set();

  constructor(initialMode: UsageMode = UsageMode.CLINICAL_SETTING) {
    this.currentMode = initialMode;
  }

  /**
   * Get current usage mode
   * @returns {UsageMode} Current mode
   */
  getCurrentMode(): UsageMode {
    return this.currentMode;
  }

  /**
   * Switch to a different usage mode
   * 
   * @param {UsageMode} mode - Target usage mode
   * 
   * @example
   * featureManager.setMode(UsageMode.STUDENT);
   * // UI will be reconfigured for student mode
   */
  setMode(mode: UsageMode): void {
    this.currentMode = mode;
    this.overrides.clear(); // Clear overrides when switching modes
    this.notifyListeners();
  }

  /**
   * Check if a feature is enabled in the current mode
   * 
   * @param {string} featureId - Feature ID to check
   * @param {string} userRole - Optional user role for role-based features
   * @returns {boolean} Whether feature is enabled
   * 
   * @example
   * if (featureManager.isFeatureEnabled('billing_coding', 'billing_specialist')) {
   *   // Show billing interface
   * }
   */
  isFeatureEnabled(featureId: string, userRole?: string): boolean {
    // Check for manual override first
    if (this.overrides.has(featureId)) {
      return this.overrides.get(featureId)!;
    }

    const feature = FEATURE_REGISTRY.find((f) => f.id === featureId);
    if (!feature) {
      console.warn(`Feature not found: ${featureId}`);
      return false;
    }

    // Check if feature requires specific role
    if (feature.requiredRole && userRole) {
      if (!feature.requiredRole.includes(userRole)) {
        return false;
      }
    }

    // Check if feature is enabled in current mode
    const modeConfig = MODE_CONFIGURATIONS.get(this.currentMode);
    if (!modeConfig) {
      return false;
    }

    return modeConfig.features.enabled.includes(featureId);
  }

  /**
   * Get all enabled features for current mode
   * @returns {Feature[]} List of enabled features
   */
  getEnabledFeatures(): Feature[] {
    const modeConfig = MODE_CONFIGURATIONS.get(this.currentMode);
    if (!modeConfig) {
      return [];
    }

    return FEATURE_REGISTRY.filter((f) =>
      modeConfig.features.enabled.includes(f.id)
    );
  }

  /**
   * Get mode configuration for current mode
   * @returns {ModeConfiguration | undefined} Mode configuration
   */
  getModeConfiguration(): ModeConfiguration | undefined {
    return MODE_CONFIGURATIONS.get(this.currentMode);
  }

  /**
   * Override feature state (for testing or admin control)
   * 
   * @param {string} featureId - Feature ID
   * @param {boolean} enabled - Enable or disable
   */
  overrideFeature(featureId: string, enabled: boolean): void {
    this.overrides.set(featureId, enabled);
    this.notifyListeners();
  }

  /**
   * Subscribe to mode changes
   * 
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  onModeChange(callback: (mode: UsageMode) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of mode change
   * @private
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.currentMode));
  }

  /**
   * Get all available usage modes
   * @returns {UsageMode[]} List of all modes
   */
  getAllModes(): UsageMode[] {
    return Object.values(UsageMode);
  }

  /**
   * Get feature by ID
   * @param {string} featureId - Feature ID
   * @returns {Feature | undefined} Feature definition
   */
  getFeature(featureId: string): Feature | undefined {
    return FEATURE_REGISTRY.find((f) => f.id === featureId);
  }

  /**
   * Get all features in a category
   * @param {FeatureCategory} category - Feature category
   * @returns {Feature[]} Features in that category
   */
  getFeaturesByCategory(category: FeatureCategory): Feature[] {
    return FEATURE_REGISTRY.filter((f) => f.category === category);
  }
}

/**
 * Default feature manager instance
 * Initialize with environment-specific mode or CLINICAL_SETTING by default
 */
export const featureManager = new FeatureManager(
  (import.meta.env.VITE_USAGE_MODE as UsageMode) || UsageMode.CLINICAL_SETTING
);

export default FeatureManager;
export { FEATURE_REGISTRY, MODE_CONFIGURATIONS };
export type { ModeConfiguration };