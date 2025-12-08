/**
 * DSM-5 Service Test Suite
 * 
 * Comprehensive tests for psychiatric assessment tools.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import dsm5Service from '../dsm5Service';
import type {
  PHQ9Response,
  GAD7Response,
  PCPTSD5Response,
} from '../dsm5Service';

describe('DSM5Service', () => {
  const service = dsm5Service;

  beforeEach(() => {
    // Service is a singleton instance
  });

  describe('PHQ-9 Depression Assessment', () => {
    it('should calculate total score correctly', () => {
      const responses: PHQ9Response = {
        q1_interest: 2,
        q2_depressed: 2,
        q3_sleep: 1,
        q4_energy: 1,
        q5_appetite: 1,
        q6_failure: 0,
        q7_concentration: 1,
        q8_slowness: 0,
        q9_suicide: 0,
      };

      const result = service.scorePHQ9(responses);
      expect(result.totalScore).toBe(8);
    });

    it('should classify minimal depression (0-4)', () => {
      const responses: PHQ9Response = {
        q1_interest: 0,
        q2_depressed: 1,
        q3_sleep: 0,
        q4_energy: 1,
        q5_appetite: 0,
        q6_failure: 0,
        q7_concentration: 1,
        q8_slowness: 0,
        q9_suicide: 0,
      };

      const result = service.scorePHQ9(responses);
      expect(result.severity).toBe('minimal');
    });

    it('should classify mild depression (5-9)', () => {
      const responses: PHQ9Response = {
        q1_interest: 1,
        q2_depressed: 1,
        q3_sleep: 1,
        q4_energy: 1,
        q5_appetite: 1,
        q6_failure: 1,
        q7_concentration: 1,
        q8_slowness: 0,
        q9_suicide: 0,
      };

      const result = service.scorePHQ9(responses);
      expect(result.severity).toBe('mild');
    });

    it('should classify moderate depression (10-14)', () => {
      const responses: PHQ9Response = {
        q1_interest: 2,
        q2_depressed: 2,
        q3_sleep: 2,
        q4_energy: 2,
        q5_appetite: 1,
        q6_failure: 1,
        q7_concentration: 1,
        q8_slowness: 1,
        q9_suicide: 0,
      };

      const result = service.scorePHQ9(responses);
      expect(result.severity).toBe('moderate');
    });

    it('should classify moderately severe depression (15-19)', () => {
      const responses: PHQ9Response = {
        q1_interest: 2,
        q2_depressed: 2,
        q3_sleep: 2,
        q4_energy: 2,
        q5_appetite: 2,
        q6_failure: 2,
        q7_concentration: 2,
        q8_slowness: 2,
        q9_suicide: 1,
      };

      const result = service.scorePHQ9(responses);
      expect(result.severity).toBe('moderately-severe');
    });

    it('should classify severe depression (20-27)', () => {
      const responses: PHQ9Response = {
        q1_interest: 3,
        q2_depressed: 3,
        q3_sleep: 3,
        q4_energy: 3,
        q5_appetite: 3,
        q6_failure: 3,
        q7_concentration: 2,
        q8_slowness: 2,
        q9_suicide: 2,
      };

      const result = service.scorePHQ9(responses);
      expect(result.severity).toBe('severe');
    });

    it('should detect suicide risk from item 9', () => {
      const responses: PHQ9Response = {
        q1_interest: 1,
        q2_depressed: 1,
        q3_sleep: 1,
        q4_energy: 1,
        q5_appetite: 1,
        q6_failure: 1,
        q7_concentration: 1,
        q8_slowness: 1,
        q9_suicide: 2, // Suicide ideation present
      };

      const result = service.scorePHQ9(responses);
      expect(result.suicideRisk).toBe(true);
      expect(result.clinicalRecommendations).toContain('IMMEDIATE');
    });

    it('should provide appropriate recommendations for each severity', () => {
      const minimalResponses: PHQ9Response = {
        q1_interest: 0,
        q2_depressed: 0,
        q3_sleep: 0,
        q4_energy: 1,
        q5_appetite: 0,
        q6_failure: 0,
        q7_concentration: 0,
        q8_slowness: 0,
        q9_suicide: 0,
      };

      const result = service.scorePHQ9(minimalResponses);
      expect(result.clinicalRecommendations).toBeDefined();
      expect(result.clinicalRecommendations.length).toBeGreaterThan(0);
    });
  });

  describe('GAD-7 Anxiety Assessment', () => {
    it('should calculate total score correctly', () => {
      const responses: GAD7Response = {
        q1_nervous: 2,
        q2_control: 2,
        q3_worrying: 1,
        q4_relax: 1,
        q5_restless: 1,
        q6_irritable: 1,
        q7_afraid: 0,
      };

      const result = service.scoreGAD7(responses);
      expect(result.totalScore).toBe(8);
    });

    it('should classify minimal anxiety (0-4)', () => {
      const responses: GAD7Response = {
        q1_nervous: 0,
        q2_control: 1,
        q3_worrying: 1,
        q4_relax: 0,
        q5_restless: 1,
        q6_irritable: 0,
        q7_afraid: 0,
      };

      const result = service.scoreGAD7(responses);
      expect(result.severity).toBe('minimal');
    });

    it('should classify mild anxiety (5-9)', () => {
      const responses: GAD7Response = {
        q1_nervous: 1,
        q2_control: 1,
        q3_worrying: 1,
        q4_relax: 1,
        q5_restless: 1,
        q6_irritable: 1,
        q7_afraid: 1,
      };

      const result = service.scoreGAD7(responses);
      expect(result.severity).toBe('mild');
    });

    it('should classify moderate anxiety (10-14)', () => {
      const responses: GAD7Response = {
        q1_nervous: 2,
        q2_control: 2,
        q3_worrying: 2,
        q4_relax: 2,
        q5_restless: 1,
        q6_irritable: 1,
        q7_afraid: 1,
      };

      const result = service.scoreGAD7(responses);
      expect(result.severity).toBe('moderate');
    });

    it('should classify severe anxiety (15-21)', () => {
      const responses: GAD7Response = {
        q1_nervous: 3,
        q2_control: 3,
        q3_worrying: 3,
        q4_relax: 2,
        q5_restless: 2,
        q6_irritable: 2,
        q7_afraid: 2,
      };

      const result = service.scoreGAD7(responses);
      expect(result.severity).toBe('severe');
    });
  });

  describe('PC-PTSD-5 Assessment', () => {
    it('should calculate total score correctly', () => {
      const responses: PCPTSD5Response = {
        q1_memories: true,
        q2_nightmares: true,
        q3_avoidance: false,
        q4_guard: true,
        q5_numb: false,
      };

      const result = service.scorePCPTSD5(responses);
      expect(result.totalScore).toBe(3);
    });

    it('should flag positive screen with 3+ symptoms', () => {
      const responses: PCPTSD5Response = {
        q1_memories: true,
        q2_nightmares: true,
        q3_avoidance: true,
        q4_guard: false,
        q5_numb: false,
      };

      const result = service.scorePCPTSD5(responses);
      expect(result.isPositiveScreen).toBe(true);
    });

    it('should not flag positive screen with <3 symptoms', () => {
      const responses: PCPTSD5Response = {
        q1_memories: true,
        q2_nightmares: false,
        q3_avoidance: true,
        q4_guard: false,
        q5_numb: false,
      };

      const result = service.scorePCPTSD5(responses);
      expect(result.isPositiveScreen).toBe(false);
    });

    it('should provide appropriate recommendations', () => {
      const positiveResponses: PCPTSD5Response = {
        q1_memories: true,
        q2_nightmares: true,
        q3_avoidance: true,
        q4_guard: true,
        q5_numb: true,
      };

      const result = service.scorePCPTSD5(positiveResponses);
      expect(result.clinicalRecommendations).toBeDefined();
      expect(result.clinicalRecommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle maximum PHQ-9 score', () => {
      const responses: PHQ9Response = {
        q1_interest: 3,
        q2_depressed: 3,
        q3_sleep: 3,
        q4_energy: 3,
        q5_appetite: 3,
        q6_failure: 3,
        q7_concentration: 3,
        q8_slowness: 3,
        q9_suicide: 3,
      };

      const result = service.scorePHQ9(responses);
      expect(result.totalScore).toBe(27);
      expect(result.severity).toBe('severe');
    });

    it('should handle minimum scores', () => {
      const phq9Responses: PHQ9Response = {
        q1_interest: 0,
        q2_depressed: 0,
        q3_sleep: 0,
        q4_energy: 0,
        q5_appetite: 0,
        q6_failure: 0,
        q7_concentration: 0,
        q8_slowness: 0,
        q9_suicide: 0,
      };

      const result = service.scorePHQ9(phq9Responses);
      expect(result.totalScore).toBe(0);
      expect(result.severity).toBe('minimal');
    });

    it('should handle all false PC-PTSD-5 responses', () => {
      const responses: PCPTSD5Response = {
        q1_memories: false,
        q2_nightmares: false,
        q3_avoidance: false,
        q4_guard: false,
        q5_numb: false,
      };

      const result = service.scorePCPTSD5(responses);
      expect(result.totalScore).toBe(0);
      expect(result.isPositiveScreen).toBe(false);
    });
  });
});
