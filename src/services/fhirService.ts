/**
 * FHIR R4 Compliance Service
 * 
 * Fast Healthcare Interoperability Resources (FHIR) R4 implementation for
 * standardized healthcare data exchange and interoperability.
 * 
 * Implements core FHIR resources:
 * - Patient
 * - Observation
 * - Condition
 * - MedicationStatement
 * - Procedure
 * - DiagnosticReport
 * - Questionnaire/QuestionnaireResponse
 * 
 * @module services/fhirService
 * @see {@link https://www.hl7.org/fhir/R4/|FHIR R4 Specification}
 * 
 * Standards Compliance:
 * - FHIR R4 (HL7 Fast Healthcare Interoperability Resources)
 * - US Core Data for Interoperability (USCDI)
 * - US Behavioral Health Profiles
 * 
 * @example
 * // Create FHIR Patient resource
 * const patient = fhirService.createPatient({
 *   name: { family: "Smith", given: ["John"] },
 *   gender: "male",
 *   birthDate: "1970-01-01"
 * });
 * 
 * @example
 * // Create Observation (vital sign)
 * const observation = fhirService.createObservation({
 *   code: "85354-9", // Blood pressure
 *   value: "120/80 mmHg",
 *   effectiveDateTime: new Date().toISOString()
 * });
 */

/**
 * FHIR resource types
 */
export enum FHIRResourceType {
  PATIENT = 'Patient',
  OBSERVATION = 'Observation',
  CONDITION = 'Condition',
  MEDICATION_STATEMENT = 'MedicationStatement',
  PROCEDURE = 'Procedure',
  DIAGNOSTIC_REPORT = 'DiagnosticReport',
  QUESTIONNAIRE = 'Questionnaire',
  QUESTIONNAIRE_RESPONSE = 'QuestionnaireResponse',
  ENCOUNTER = 'Encounter',
  PRACTITIONER = 'Practitioner',
}

/**
 * Base FHIR resource structure
 */
export interface FHIRResource {
  resourceType: FHIRResourceType;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    profile?: string[];
  };
  text?: {
    status: 'generated' | 'extensions' | 'additional' | 'empty';
    div: string;
  };
}

/**
 * FHIR Patient resource
 */
export interface FHIRPatient extends FHIRResource {
  resourceType: FHIRResourceType.PATIENT;
  identifier?: Array<{
    system: string;
    value: string;
    type?: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
  }>;
  name: Array<{
    use?: 'official' | 'usual' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
    family: string;
    given: string[];
    prefix?: string[];
    suffix?: string[];
  }>;
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate: string; // YYYY-MM-DD
  address?: Array<{
    use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
    line: string[];
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }>;
  telecom?: Array<{
    system: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
    value: string;
    use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  }>;
  maritalStatus?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  communication?: Array<{
    language: {
      coding: Array<{
        system: string;
        code: string; // BCP-47 language code
        display: string;
      }>;
    };
    preferred?: boolean;
  }>;
}

/**
 * FHIR Observation resource (vital signs, lab results)
 */
export interface FHIRObservation extends FHIRResource {
  resourceType: FHIRResourceType.OBSERVATION;
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled';
  category?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string; // LOINC, SNOMED CT
      code: string;
      display: string;
    }>;
    text?: string;
  };
  subject: {
    reference: string; // Patient/[id]
    display?: string;
  };
  effectiveDateTime?: string;
  effectivePeriod?: {
    start: string;
    end: string;
  };
  valueQuantity?: {
    value: number;
    unit: string;
    system: string; // UCUM
    code: string;
  };
  valueString?: string;
  valueBoolean?: boolean;
  interpretation?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  referenceRange?: Array<{
    low?: {
      value: number;
      unit: string;
    };
    high?: {
      value: number;
      unit: string;
    };
    text?: string;
  }>;
}

/**
 * FHIR Condition resource (diagnoses, problems)
 */
export interface FHIRCondition extends FHIRResource {
  resourceType: FHIRResourceType.CONDITION;
  clinicalStatus?: {
    coding: Array<{
      system: string;
      code: 'active' | 'recurrence' | 'relapse' | 'inactive' | 'remission' | 'resolved';
      display: string;
    }>;
  };
  verificationStatus?: {
    coding: Array<{
      system: string;
      code: 'unconfirmed' | 'provisional' | 'differential' | 'confirmed' | 'refuted' | 'entered-in-error';
      display: string;
    }>;
  };
  category?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  severity?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  code: {
    coding: Array<{
      system: string; // ICD-10, SNOMED CT
      code: string;
      display: string;
    }>;
    text?: string;
  };
  subject: {
    reference: string; // Patient/[id]
  };
  onsetDateTime?: string;
  onsetAge?: {
    value: number;
    unit: string;
  };
  recordedDate?: string;
  note?: Array<{
    text: string;
  }>;
}

/**
 * FHIR MedicationRequest (prescription)
 */
export interface FHIRMedicationRequest extends FHIRResource {
  resourceType: FHIRResourceType.MEDICATION_STATEMENT;
  status: 'active' | 'on-hold' | 'cancelled' | 'completed' | 'entered-in-error' | 'stopped' | 'draft' | 'unknown';
  intent: 'proposal' | 'plan' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';
  medicationCodeableConcept?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text?: string;
  };
  subject: {
    reference: string; // Patient/[id]
  };
  authoredOn?: string;
  dosageInstruction?: Array<{
    text?: string;
    timing?: {
      repeat?: {
        frequency?: number;
        period?: number;
        periodUnit?: string;
      };
    };
    route?: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
    doseAndRate?: Array<{
      doseQuantity?: {
        value: number;
        unit: string;
        system: string;
        code: string;
      };
    }>;
  }>;
}

/**
 * FHIR QuestionnaireResponse (PHQ-9, GAD-7, etc.)
 */
export interface FHIRQuestionnaireResponse extends FHIRResource {
  resourceType: FHIRResourceType.QUESTIONNAIRE_RESPONSE;
  questionnaire: string; // Canonical URL
  status: 'in-progress' | 'completed' | 'amended' | 'entered-in-error' | 'stopped';
  subject?: {
    reference: string; // Patient/[id]
  };
  authored?: string; // DateTime
  author?: {
    reference: string; // Practitioner/[id] or Patient/[id]
  };
  item: Array<{
    linkId: string;
    text?: string;
    answer?: Array<{
      valueBoolean?: boolean;
      valueDecimal?: number;
      valueInteger?: number;
      valueString?: string;
      valueCoding?: {
        system: string;
        code: string;
        display: string;
      };
    }>;
    item?: Array<any>; // Nested items
  }>;
}

/**
 * FHIR Service Class
 */
export class FHIRService {
  private readonly fhirVersion = '4.0.1';
  private readonly baseUrl: string;

  constructor(baseUrl: string = 'http://fhir.example.com/') {
    this.baseUrl = baseUrl;
  }

  /**
   * Create FHIR Patient resource
   */
  createPatient(data: {
    id?: string;
    name: { family: string; given: string[] };
    gender: 'male' | 'female' | 'other' | 'unknown';
    birthDate: string;
    mrn?: string;
  }): FHIRPatient {
    const patient: FHIRPatient = {
      resourceType: FHIRResourceType.PATIENT,
      id: data.id,
      meta: {
        profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient'],
      },
      identifier: data.mrn ? [
        {
          system: 'urn:oid:2.16.840.1.113883.4.1', // SSN
          value: data.mrn,
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                code: 'MR',
                display: 'Medical Record Number',
              },
            ],
          },
        },
      ] : undefined,
      name: [
        {
          use: 'official',
          family: data.name.family,
          given: data.name.given,
        },
      ],
      gender: data.gender,
      birthDate: data.birthDate,
    };

    return patient;
  }

  /**
   * Create FHIR Observation (vital sign or lab result)
   */
  createObservation(data: {
    id?: string;
    patientId: string;
    code: string; // LOINC code
    codeDisplay: string;
    value: number;
    unit: string;
    effectiveDateTime: string;
    status?: 'final' | 'preliminary';
  }): FHIRObservation {
    const observation: FHIRObservation = {
      resourceType: FHIRResourceType.OBSERVATION,
      id: data.id,
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/vitalsigns'],
      },
      status: data.status || 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'vital-signs',
              display: 'Vital Signs',
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: data.code,
            display: data.codeDisplay,
          },
        ],
      },
      subject: {
        reference: `Patient/${data.patientId}`,
      },
      effectiveDateTime: data.effectiveDateTime,
      valueQuantity: {
        value: data.value,
        unit: data.unit,
        system: 'http://unitsofmeasure.org',
        code: data.unit,
      },
    };

    return observation;
  }

  /**
   * Create FHIR Condition (diagnosis)
   */
  createCondition(data: {
    id?: string;
    patientId: string;
    code: string; // ICD-10 or SNOMED CT
    codeSystem: 'ICD-10' | 'SNOMED';
    codeDisplay: string;
    clinicalStatus: 'active' | 'resolved';
    onsetDateTime?: string;
  }): FHIRCondition {
    const codeSystemUrl = data.codeSystem === 'ICD-10'
      ? 'http://hl7.org/fhir/sid/icd-10-cm'
      : 'http://snomed.info/sct';

    const condition: FHIRCondition = {
      resourceType: FHIRResourceType.CONDITION,
      id: data.id,
      meta: {
        profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-condition'],
      },
      clinicalStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: data.clinicalStatus,
            display: data.clinicalStatus.charAt(0).toUpperCase() + data.clinicalStatus.slice(1),
          },
        ],
      },
      verificationStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
            code: 'confirmed',
            display: 'Confirmed',
          },
        ],
      },
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-category',
              code: 'problem-list-item',
              display: 'Problem List Item',
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: codeSystemUrl,
            code: data.code,
            display: data.codeDisplay,
          },
        ],
      },
      subject: {
        reference: `Patient/${data.patientId}`,
      },
      onsetDateTime: data.onsetDateTime,
      recordedDate: new Date().toISOString(),
    };

    return condition;
  }

  /**
   * Create FHIR MedicationRequest (prescription)
   */
  createMedicationRequest(data: {
    id?: string;
    patientId: string;
    medicationCode: string; // RxNorm code
    medicationDisplay: string;
    dosage: string;
    frequency: string;
    route: string;
  }): FHIRMedicationRequest {
    const medication: FHIRMedicationRequest = {
      resourceType: FHIRResourceType.MEDICATION_STATEMENT,
      id: data.id,
      meta: {
        profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-medicationstatement'],
      },
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: {
        coding: [
          {
            system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
            code: data.medicationCode,
            display: data.medicationDisplay,
          },
        ],
        text: data.medicationDisplay,
      },
      subject: {
        reference: `Patient/${data.patientId}`,
      },
      authoredOn: new Date().toISOString(),
      dosageInstruction: [
        {
          text: `${data.dosage} ${data.frequency} by ${data.route} route`,
          timing: {
            repeat: {
              frequency: 1,
              period: 1,
              periodUnit: 'day',
            },
          },
          route: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '26643006',
                display: data.route,
              },
            ],
          },
        },
      ],
    };

    return medication;
  }

  /**
   * Create FHIR QuestionnaireResponse (for PHQ-9, GAD-7, etc.)
   */
  createQuestionnaireResponse(data: {
    id?: string;
    questionnaireUrl: string;
    patientId: string;
    items: Array<{
      linkId: string;
      answer: number | string | boolean;
    }>;
  }): FHIRQuestionnaireResponse {
    const response: FHIRQuestionnaireResponse = {
      resourceType: FHIRResourceType.QUESTIONNAIRE_RESPONSE,
      id: data.id,
      questionnaire: data.questionnaireUrl,
      status: 'completed',
      subject: {
        reference: `Patient/${data.patientId}`,
      },
      authored: new Date().toISOString(),
      item: data.items.map(item => ({
        linkId: item.linkId,
        answer: [
          typeof item.answer === 'number'
            ? { valueInteger: item.answer }
            : typeof item.answer === 'boolean'
            ? { valueBoolean: item.answer }
            : { valueString: item.answer },
        ],
      })),
    };

    return response;
  }

  /**
   * Convert PHQ-9 assessment to FHIR QuestionnaireResponse
   */
  convertPHQ9ToFHIR(
    patientId: string,
    responses: Record<string, number>
  ): FHIRQuestionnaireResponse {
    return this.createQuestionnaireResponse({
      questionnaireUrl: 'http://hl7.org/fhir/us/hedis/Questionnaire/phq-9',
      patientId,
      items: Object.entries(responses).map(([key, value]) => ({
        linkId: key,
        answer: value,
      })),
    });
  }

  /**
   * Convert GAD-7 assessment to FHIR QuestionnaireResponse
   */
  convertGAD7ToFHIR(
    patientId: string,
    responses: Record<string, number>
  ): FHIRQuestionnaireResponse {
    return this.createQuestionnaireResponse({
      questionnaireUrl: 'http://hl7.org/fhir/us/hedis/Questionnaire/gad-7',
      patientId,
      items: Object.entries(responses).map(([key, value]) => ({
        linkId: key,
        answer: value,
      })),
    });
  }

  /**
   * Validate FHIR resource
   */
  validateResource(resource: FHIRResource): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validation
    if (!resource.resourceType) {
      errors.push('Missing required field: resourceType');
    }

    // Resource-specific validation
    if (resource.resourceType === FHIRResourceType.PATIENT) {
      const patient = resource as FHIRPatient;
      if (!patient.name || patient.name.length === 0) {
        errors.push('Patient must have at least one name');
      }
      if (!patient.gender) {
        errors.push('Patient must have a gender');
      }
      if (!patient.birthDate) {
        errors.push('Patient must have a birth date');
      }
    }

    if (resource.resourceType === FHIRResourceType.OBSERVATION) {
      const observation = resource as FHIRObservation;
      if (!observation.status) {
        errors.push('Observation must have a status');
      }
      if (!observation.code) {
        errors.push('Observation must have a code');
      }
      if (!observation.subject) {
        errors.push('Observation must reference a subject');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert FHIR resource to JSON
   */
  toJSON(resource: FHIRResource): string {
    return JSON.stringify(resource, null, 2);
  }

  /**
   * Parse FHIR JSON
   */
  fromJSON(json: string): FHIRResource {
    return JSON.parse(json) as FHIRResource;
  }

  /**
   * Create FHIR Bundle (collection of resources)
   */
  createBundle(resources: FHIRResource[]): {
    resourceType: 'Bundle';
    type: 'collection';
    entry: Array<{ resource: FHIRResource }>;
  } {
    return {
      resourceType: 'Bundle',
      type: 'collection',
      entry: resources.map(resource => ({ resource })),
    };
  }

  /**
   * Generate US Core compliant Patient summary
   */
  generatePatientSummary(patientId: string, conditions: FHIRCondition[]): string {
    const summary = `
Patient Summary (USCDI Compliant)
===================================

Patient ID: ${patientId}

Active Conditions:
${conditions
  .filter(c => c.clinicalStatus?.coding[0]?.code === 'active')
  .map(c => `- ${c.code.coding[0].display} (${c.code.coding[0].code})`)
  .join('\n')}

Generated: ${new Date().toISOString()}
FHIR Version: ${this.fhirVersion}
Profile: http://hl7.org/fhir/us/core/
    `.trim();

    return summary;
  }
}

/**
 * Default FHIR service instance
 */
export const fhirService = new FHIRService();

export default FHIRService;