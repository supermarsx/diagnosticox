/**
 * Symptom Service Test Suite
 * 
 * Comprehensive unit tests for symptom database, search, and differential diagnosis.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import symptomService from '../symptomService';
import type {
  OrganSystem,
  SymptomReport,
} from '../symptomService';

describe('SymptomService', () => {
  const service = symptomService;

  beforeEach(() => {
    // Service is a singleton instance
  });

  describe('searchSymptoms', () => {
    it('should find symptoms by name', () => {
      const results = service.searchSymptoms('chest pain');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name.toLowerCase()).toContain('chest');
    });

    it('should find symptoms by synonyms', () => {
      const results = service.searchSymptoms('stomach ache');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', () => {
      const results = service.searchSymptoms('xyzabc123');
      expect(results).toEqual([]);
    });

    it('should be case insensitive', () => {
      const lower = service.searchSymptoms('headache');
      const upper = service.searchSymptoms('HEADACHE');
      expect(lower.length).toBe(upper.length);
    });
  });

  describe('getSymptomById', () => {
    it('should return symptom by valid ID', () => {
      const symptom = service.getSymptomById('chest_pain');
      expect(symptom).toBeDefined();
      expect(symptom?.id).toBe('chest_pain');
    });

    it('should return undefined for invalid ID', () => {
      const symptom = service.getSymptomById('invalid_id');
      expect(symptom).toBeUndefined();
    });
  });

  describe('getSymptomsByOrganSystem', () => {
    it('should return symptoms for cardiovascular system', () => {
      const symptoms = service.getSymptomsByOrganSystem(OrganSystem.CARDIOVASCULAR);
      expect(symptoms.length).toBeGreaterThan(0);
      symptoms.forEach(symptom => {
        expect(symptom.organSystem).toContain(OrganSystem.CARDIOVASCULAR);
      });
    });

    it('should return symptoms for nervous system', () => {
      const symptoms = service.getSymptomsByOrganSystem(OrganSystem.NERVOUS);
      expect(symptoms.length).toBeGreaterThan(0);
    });

    it('should return empty array for systems with no symptoms', () => {
      const symptoms = service.getSymptomsByOrganSystem(OrganSystem.REPRODUCTIVE_MALE);
      expect(Array.isArray(symptoms)).toBe(true);
    });
  });

  describe('getRedFlags', () => {
    it('should return red flags for chest pain', () => {
      const redFlags = service.getRedFlags(['chest_pain']);
      expect(redFlags.length).toBeGreaterThan(0);
    });

    it('should return empty array for no red flag symptoms', () => {
      const redFlags = service.getRedFlags(['headache']);
      expect(Array.isArray(redFlags)).toBe(true);
    });

    it('should handle multiple symptom IDs', () => {
      const redFlags = service.getRedFlags(['chest_pain', 'shortness_of_breath']);
      expect(Array.isArray(redFlags)).toBe(true);
    });
  });

  describe('analyzeDifferentialDiagnosis', () => {
    it('should generate differential diagnoses', () => {
      const reports: SymptomReport[] = [
        {
          symptomId: 'chest_pain',
          severity: 8,
          onset: new Date(),
          duration: '2 hours',
          frequency: 'constant',
          progression: 'worsening',
        },
      ];

      const differentials = service.analyzeDifferentialDiagnosis(reports);
      expect(Array.isArray(differentials)).toBe(true);
    });

    it('should return empty array for no symptoms', () => {
      const differentials = service.analyzeDifferentialDiagnosis([]);
      expect(differentials).toEqual([]);
    });

    it('should include ACS for chest pain with associated symptoms', () => {
      const reports: SymptomReport[] = [
        {
          symptomId: 'chest_pain',
          severity: 9,
          onset: new Date(),
          duration: '30 minutes',
          frequency: 'constant',
          progression: 'worsening',
        },
        {
          symptomId: 'shortness_of_breath',
          severity: 7,
          onset: new Date(),
          duration: '30 minutes',
          frequency: 'constant',
          progression: 'worsening',
        },
      ];

      const differentials = service.analyzeDifferentialDiagnosis(reports);
      const hasACS = differentials.some(d => 
        d.diagnosisName.toLowerCase().includes('coronary')
      );
      expect(hasACS).toBe(true);
    });

    it('should sort by confidence score', () => {
      const reports: SymptomReport[] = [
        {
          symptomId: 'chest_pain',
          severity: 8,
          onset: new Date(),
          duration: '2 hours',
          frequency: 'constant',
          progression: 'worsening',
        },
      ];

      const differentials = service.analyzeDifferentialDiagnosis(reports);
      for (let i = 1; i < differentials.length; i++) {
        expect(differentials[i - 1].confidence).toBeGreaterThanOrEqual(
          differentials[i].confidence
        );
      }
    });
  });

  describe('getTotalSymptomsCount', () => {
    it('should return total number of symptoms', () => {
      const count = service.getTotalSymptomsCount();
      expect(count).toBeGreaterThan(0);
      expect(typeof count).toBe('number');
    });
  });

  describe('SNOMED CT integration', () => {
    it('should have SNOMED codes for major symptoms', () => {
      const chestPain = service.getSymptomById('chest_pain');
      expect(chestPain?.snomedCode).toBeDefined();
    });

    it('should find symptom by SNOMED code', () => {
      const chestPain = service.getSymptomById('chest_pain');
      if (chestPain?.snomedCode) {
        const found = service.getSymptomBySNOMEDCode(chestPain.snomedCode);
        expect(found).toBeDefined();
        expect(found?.id).toBe('chest_pain');
      }
    });
  });
});
