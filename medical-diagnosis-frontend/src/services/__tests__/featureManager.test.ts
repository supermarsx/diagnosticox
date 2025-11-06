/**
 * Feature Manager Test Suite
 * 
 * Tests for usage mode management and feature toggling.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import FeatureManager, {
  UsageMode,
  FeatureCategory,
} from '../featureManager';

describe('FeatureManager', () => {
  let manager: FeatureManager;

  beforeEach(() => {
    manager = new FeatureManager(UsageMode.CLINICAL_SETTING);
  });

  describe('Mode Management', () => {
    it('should initialize with correct default mode', () => {
      expect(manager.getCurrentMode()).toBe(UsageMode.CLINICAL_SETTING);
    });

    it('should change mode successfully', () => {
      manager.setMode(UsageMode.STUDENT);
      expect(manager.getCurrentMode()).toBe(UsageMode.STUDENT);
    });

    it('should return all available modes', () => {
      const modes = manager.getAllModes();
      expect(modes).toContain(UsageMode.CLINICAL_SETTING);
      expect(modes).toContain(UsageMode.STUDENT);
      expect(modes).toContain(UsageMode.FULL_HOSPITAL);
    });

    it('should get mode configuration', () => {
      const config = manager.getModeConfiguration();
      expect(config).toBeDefined();
      expect(config?.mode).toBe(UsageMode.CLINICAL_SETTING);
    });
  });

  describe('Feature Availability', () => {
    it('should check if feature is enabled', () => {
      const isEnabled = manager.isFeatureEnabled('icd_coding');
      expect(typeof isEnabled).toBe('boolean');
    });

    it('should return enabled features for current mode', () => {
      const features = manager.getEnabledFeatures();
      expect(Array.isArray(features)).toBe(true);
      expect(features.length).toBeGreaterThan(0);
    });

    it('should have different features for different modes', () => {
      manager.setMode(UsageMode.CLINICAL_SETTING);
      const clinicalFeatures = manager.getEnabledFeatures();

      manager.setMode(UsageMode.STUDENT);
      const studentFeatures = manager.getEnabledFeatures();

      // Student mode should have educational features
      const hasEducational = studentFeatures.some(f => 
        f.category === FeatureCategory.EDUCATIONAL
      );
      expect(hasEducational).toBe(true);
    });

    it('should restrict admin features in self-exploration mode', () => {
      manager.setMode(UsageMode.SELF_EXPLORATION);
      const hasAdmin = manager.isFeatureEnabled('admin_panel');
      expect(hasAdmin).toBe(false);
    });
  });

  describe('Feature Overrides', () => {
    it('should override feature state', () => {
      const featureId = 'dsm5_assessments';
      const initialState = manager.isFeatureEnabled(featureId);
      
      manager.overrideFeature(featureId, !initialState);
      expect(manager.isFeatureEnabled(featureId)).toBe(!initialState);
    });

    it('should notify listeners on mode change', (done) => {
      let notified = false;
      
      const unsubscribe = manager.onModeChange((mode) => {
        notified = true;
        expect(mode).toBe(UsageMode.STUDENT);
        unsubscribe();
        done();
      });

      manager.setMode(UsageMode.STUDENT);
      
      // Verify notification occurred
      setTimeout(() => {
        expect(notified).toBe(true);
      }, 100);
    });

    it('should unsubscribe from mode changes', () => {
      let callCount = 0;
      
      const unsubscribe = manager.onModeChange(() => {
        callCount++;
      });

      manager.setMode(UsageMode.STUDENT);
      unsubscribe();
      manager.setMode(UsageMode.FULL_HOSPITAL);

      expect(callCount).toBe(1); // Only first change should trigger
    });
  });

  describe('Feature Queries', () => {
    it('should get feature by ID', () => {
      const feature = manager.getFeature('icd_coding');
      expect(feature).toBeDefined();
      expect(feature?.id).toBe('icd_coding');
    });

    it('should return undefined for invalid feature ID', () => {
      const feature = manager.getFeature('invalid_feature_id');
      expect(feature).toBeUndefined();
    });

    it('should get features by category', () => {
      const clinical = manager.getFeaturesByCategory(FeatureCategory.CLINICAL);
      expect(Array.isArray(clinical)).toBe(true);
      clinical.forEach(feature => {
        expect(feature.category).toBe(FeatureCategory.CLINICAL);
      });
    });

    it('should handle empty category results', () => {
      const features = manager.getFeaturesByCategory(FeatureCategory.RESEARCH);
      expect(Array.isArray(features)).toBe(true);
    });
  });

  describe('Mode-Specific Behavior', () => {
    it('Clinical Setting should have full diagnostic features', () => {
      manager.setMode(UsageMode.CLINICAL_SETTING);
      expect(manager.isFeatureEnabled('differential_diagnosis')).toBe(true);
      expect(manager.isFeatureEnabled('icd_coding')).toBe(true);
    });

    it('Student Mode should have educational features', () => {
      manager.setMode(UsageMode.STUDENT);
      const config = manager.getModeConfiguration();
      expect(config?.features.enabled).toContain('differential_diagnosis');
    });

    it('Self Exploration should have limited features', () => {
      manager.setMode(UsageMode.SELF_EXPLORATION);
      expect(manager.isFeatureEnabled('admin_panel')).toBe(false);
      expect(manager.isFeatureEnabled('patient_data_access')).toBe(false);
    });

    it('Full Hospital should have maximum features', () => {
      manager.setMode(UsageMode.FULL_HOSPITAL);
      const features = manager.getEnabledFeatures();
      
      manager.setMode(UsageMode.CLINICAL_SETTING);
      const clinicalFeatures = manager.getEnabledFeatures();

      expect(features.length).toBeGreaterThanOrEqual(clinicalFeatures.length);
    });
  });

  describe('Permission Checks', () => {
    it('should respect role requirements', () => {
      const config = manager.getModeConfiguration();
      expect(config?.accessLevel).toBeDefined();
    });

    it('should provide data access level', () => {
      const config = manager.getModeConfiguration();
      expect(['full', 'limited', 'anonymized']).toContain(config?.dataAccess || '');
    });

    it('should define permissions correctly', () => {
      const config = manager.getModeConfiguration();
      expect(config?.permissions).toBeDefined();
      expect(typeof config?.permissions.canView).toBe('boolean');
      expect(typeof config?.permissions.canEdit).toBe('boolean');
    });
  });
});
