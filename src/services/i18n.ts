/**
 * Internationalization (i18n) Configuration
 * 
 * Configures react-i18next for multi-language support.
 * Initial languages: English (en-US) and Portuguese (pt-PT)
 * 
 * @module services/i18n
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

/**
 * English (US) translations
 */
const enUS = {
  translation: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
      logout: 'Logout',
    },
    navigation: {
      dashboard: 'Dashboard',
      patients: 'Patients',
      diagnosis: 'Diagnosis',
      analytics: 'Analytics',
      security: 'Security',
      settings: 'Settings',
    },
    usageModes: {
      clinicalSetting: 'Clinical Setting',
      clinicalStudy: 'Clinical Study',
      student: 'Student Mode',
      fullHospital: 'Full Hospital',
      selfExploration: 'Self Exploration',
      switchMode: 'Switch Mode',
      currentMode: 'Current Mode',
    },
    diagnosis: {
      title: 'Diagnosis',
      enterSymptoms: 'Enter Symptoms',
      differentialDiagnosis: 'Differential Diagnosis',
      confidence: 'Confidence',
      recommendations: 'Recommendations',
      aiAnalysis: 'AI Analysis',
      treatmentPlan: 'Treatment Plan',
    },
    symptoms: {
      title: 'Symptoms',
      severity: 'Severity',
      onset: 'Onset',
      duration: 'Duration',
      location: 'Location',
      searchSymptoms: 'Search Symptoms',
      addSymptom: 'Add Symptom',
      redFlags: 'Red Flags',
      organSystems: {
        cardiovascular: 'Cardiovascular',
        respiratory: 'Respiratory',
        digestive: 'Digestive',
        nervous: 'Nervous',
        musculoskeletal: 'Musculoskeletal',
        integumentary: 'Integumentary',
        endocrine: 'Endocrine',
        urinary: 'Urinary',
        lymphatic_immune: 'Lymphatic/Immune',
        reproductive_male: 'Reproductive (Male)',
        reproductive_female: 'Reproductive (Female)',
      },
    },
    assessments: {
      phq9: {
        title: 'PHQ-9 Depression Screening',
        description: 'Patient Health Questionnaire for depression assessment',
        severity: {
          noneMinimal: 'None-Minimal',
          mild: 'Mild',
          moderate: 'Moderate',
          moderatelySevere: 'Moderately Severe',
          severe: 'Severe',
        },
        item9Warning: '⚠️ Suicide risk: Clinical follow-up required',
      },
      gad7: {
        title: 'GAD-7 Anxiety Screening',
        description: 'Generalized Anxiety Disorder assessment',
        severity: {
          noneMinimal: 'None-Minimal',
          mild: 'Mild',
          moderate: 'Moderate',
          severe: 'Severe',
        },
      },
    },
    icd: {
      title: 'ICD-10/ICD-11 Lookup',
      searchCodes: 'Search ICD Codes',
      icd10: 'ICD-10-CM',
      icd11: 'ICD-11',
      codeDetails: 'Code Details',
      mapping: 'Code Mapping',
      chapters: 'Chapters',
    },
    medical: {
      drugInteractions: 'Drug Interactions',
      clinicalTrials: 'Clinical Trials',
      pubmedSearch: 'PubMed Search',
      evidenceLevel: 'Evidence Level',
      guidelines: 'Clinical Guidelines',
    },
    patient: {
      demographics: 'Demographics',
      history: 'Medical History',
      medications: 'Medications',
      allergies: 'Allergies',
      vitals: 'Vital Signs',
      timeline: 'Timeline',
    },
    security: {
      title: 'Security Center',
      compliance: 'Compliance',
      auditLogs: 'Audit Logs',
      encryption: 'Encryption',
      privacy: 'Privacy Controls',
      roles: 'Roles & Permissions',
    },
  },
};

/**
 * Portuguese (Portugal) translations
 */
const ptPT = {
  translation: {
    common: {
      loading: 'A carregar...',
      error: 'Erro',
      success: 'Sucesso',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      view: 'Ver',
      search: 'Pesquisar',
      filter: 'Filtrar',
      export: 'Exportar',
      import: 'Importar',
      logout: 'Sair',
    },
    navigation: {
      dashboard: 'Painel',
      patients: 'Pacientes',
      diagnosis: 'Diagnóstico',
      analytics: 'Análises',
      security: 'Segurança',
      settings: 'Definições',
    },
    usageModes: {
      clinicalSetting: 'Ambiente Clínico',
      clinicalStudy: 'Estudo Clínico',
      student: 'Modo Estudante',
      fullHospital: 'Hospital Completo',
      selfExploration: 'Auto-Exploração',
      switchMode: 'Mudar Modo',
      currentMode: 'Modo Atual',
    },
    diagnosis: {
      title: 'Diagnóstico',
      enterSymptoms: 'Inserir Sintomas',
      differentialDiagnosis: 'Diagnóstico Diferencial',
      confidence: 'Confiança',
      recommendations: 'Recomendações',
      aiAnalysis: 'Análise AI',
      treatmentPlan: 'Plano de Tratamento',
    },
    symptoms: {
      title: 'Sintomas',
      severity: 'Gravidade',
      onset: 'Início',
      duration: 'Duração',
      location: 'Localização',
      searchSymptoms: 'Pesquisar Sintomas',
      addSymptom: 'Adicionar Sintoma',
      redFlags: 'Sinais de Alerta',
      organSystems: {
        cardiovascular: 'Cardiovascular',
        respiratory: 'Respiratório',
        digestive: 'Digestivo',
        nervous: 'Nervoso',
        musculoskeletal: 'Musculoesquelético',
        integumentary: 'Tegumentar',
        endocrine: 'Endócrino',
        urinary: 'Urinário',
        lymphatic_immune: 'Linfático/Imunitário',
        reproductive_male: 'Reprodutivo (Masculino)',
        reproductive_female: 'Reprodutivo (Feminino)',
      },
    },
    assessments: {
      phq9: {
        title: 'Rastreio de Depressão PHQ-9',
        description: 'Questionário de Saúde do Paciente para avaliação de depressão',
        severity: {
          noneMinimal: 'Nenhuma-Mínima',
          mild: 'Ligeira',
          moderate: 'Moderada',
          moderatelySevere: 'Moderadamente Grave',
          severe: 'Grave',
        },
        item9Warning: '⚠️ Risco de suicídio: Avaliação clínica necessária',
      },
      gad7: {
        title: 'Rastreio de Ansiedade GAD-7',
        description: 'Avaliação de Perturbação de Ansiedade Generalizada',
        severity: {
          noneMinimal: 'Nenhuma-Mínima',
          mild: 'Ligeira',
          moderate: 'Moderada',
          severe: 'Grave',
        },
      },
    },
    icd: {
      title: 'Consulta ICD-10/ICD-11',
      searchCodes: 'Pesquisar Códigos ICD',
      icd10: 'ICD-10-CM',
      icd11: 'ICD-11',
      codeDetails: 'Detalhes do Código',
      mapping: 'Mapeamento de Códigos',
      chapters: 'Capítulos',
    },
    medical: {
      drugInteractions: 'Interações Medicamentosas',
      clinicalTrials: 'Ensaios Clínicos',
      pubmedSearch: 'Pesquisa PubMed',
      evidenceLevel: 'Nível de Evidência',
      guidelines: 'Diretrizes Clínicas',
    },
    patient: {
      demographics: 'Demografia',
      history: 'História Clínica',
      medications: 'Medicamentos',
      allergies: 'Alergias',
      vitals: 'Sinais Vitais',
      timeline: 'Cronologia',
    },
    security: {
      title: 'Centro de Segurança',
      compliance: 'Conformidade',
      auditLogs: 'Registos de Auditoria',
      encryption: 'Encriptação',
      privacy: 'Controlos de Privacidade',
      roles: 'Funções e Permissões',
    },
  },
};

/**
 * Initialize i18n
 */
i18n
  .use(initReactI18next)
  .init({
    resources: {
      'en-US': enUS,
      'pt-PT': ptPT,
    },
    lng: 'en-US', // Default language
    fallbackLng: 'en-US',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: true,
    },
  });

export default i18n;