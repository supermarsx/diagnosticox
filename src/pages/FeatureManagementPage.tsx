/**
 * Feature Management Page
 * 
 * Comprehensive interface for managing usage modes and feature toggles.
 * Allows administrators to switch between 5 usage modes and override individual features.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  featureManager, 
  UsageMode, 
  Feature,
  FeatureCategory,
  FEATURE_REGISTRY,
  MODE_CONFIGURATIONS
} from '../services/featureManager';
import { 
  Settings, 
  Power, 
  CheckCircle2, 
  XCircle, 
  Users,
  GraduationCap,
  Microscope,
  Building2,
  User,
  Info,
  Shield
} from 'lucide-react';

interface ModeCardProps {
  mode: UsageMode;
  isActive: boolean;
  onSelect: () => void;
}

const ModeCard: React.FC<ModeCardProps> = ({ mode, isActive, onSelect }) => {
  const config = MODE_CONFIGURATIONS.get(mode);
  if (!config) return null;

  const modeIcons = {
    [UsageMode.CLINICAL_SETTING]: Users,
    [UsageMode.CLINICAL_STUDY]: Microscope,
    [UsageMode.STUDENT]: GraduationCap,
    [UsageMode.FULL_HOSPITAL]: Building2,
    [UsageMode.SELF_EXPLORATION]: User,
  };

  const Icon = modeIcons[mode];

  return (
    <div
      onClick={onSelect}
      className={`p-6 rounded-lg cursor-pointer transition-all hover-lift ${
        isActive
          ? 'glass-card-strong border-2 border-blue-400 bg-gradient-to-br from-blue-500/20 to-purple-500/20'
          : 'glass-card hover:bg-white/10'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${
          isActive ? 'bg-blue-500/30' : 'bg-white/10'
        }`}>
          <Icon className={`w-6 h-6 ${
            isActive ? 'text-blue-300' : 'text-gray-400'
          }`} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{config.name}</h3>
          <p className="text-sm text-gray-300 mb-3">{config.description}</p>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded">
              {config.features.enabled.length} features enabled
            </span>
            {config.features.restricted.length > 0 && (
              <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-300 rounded">
                {config.features.restricted.length} restricted
              </span>
            )}
          </div>
        </div>
        {isActive && (
          <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
        )}
      </div>
    </div>
  );
};

interface FeatureItemProps {
  feature: Feature;
  isEnabled: boolean;
  isRestricted: boolean;
  onToggle: () => void;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ 
  feature, 
  isEnabled, 
  isRestricted,
  onToggle 
}) => {
  const categoryColors: Record<FeatureCategory, string> = {
    [FeatureCategory.CORE]: 'blue',
    [FeatureCategory.CLINICAL]: 'green',
    [FeatureCategory.ADMINISTRATIVE]: 'purple',
    [FeatureCategory.EDUCATIONAL]: 'yellow',
    [FeatureCategory.RESEARCH]: 'pink',
    [FeatureCategory.PATIENT_FACING]: 'indigo',
  };

  const color = categoryColors[feature.category];

  return (
    <div className={`p-4 rounded-lg transition-all ${
      isEnabled 
        ? 'bg-green-500/10 border border-green-500/30' 
        : isRestricted
        ? 'bg-yellow-500/10 border border-yellow-500/30'
        : 'bg-white/5 border border-white/10'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-white">{feature.name}</h4>
            {feature.requiredRole && feature.requiredRole.length > 0 && (
              <Shield className="w-4 h-4 text-yellow-400" title="Requires Specific Role" />
            )}
          </div>
          <p className="text-sm text-gray-400 mb-2">{feature.description}</p>
          <div className="flex flex-wrap gap-2">
            <span className={`px-2 py-1 text-xs bg-${color}-500/20 text-${color}-300 rounded`}>
              {feature.category}
            </span>
            {feature.requiredRole && feature.requiredRole.length > 0 && (
              <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded">
                Role: {feature.requiredRole.join(', ')}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onToggle}
          disabled={feature.requiredRole?.includes('Super Admin')}
          className={`ml-4 p-2 rounded-lg transition-all ${
            isEnabled
              ? 'bg-green-500/30 hover:bg-green-500/40 text-green-300'
              : isRestricted
              ? 'bg-yellow-500/30 text-yellow-300 cursor-not-allowed'
              : 'bg-gray-500/30 hover:bg-gray-500/40 text-gray-300'
          }`}
          title={isRestricted ? 'Restricted in current mode' : 'Toggle feature'}
        >
          <Power className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export const FeatureManagementPage: React.FC = () => {
  const { t } = useTranslation();
  
  const [currentMode, setCurrentMode] = useState<UsageMode>(featureManager.getCurrentMode());
  const [enabledFeatures, setEnabledFeatures] = useState<Feature[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<FeatureCategory | 'all'>('all');
  const [overrides, setOverrides] = useState<Map<string, boolean>>(new Map());

  /**
   * Update enabled features when mode changes
   */
  useEffect(() => {
    const unsubscribe = featureManager.onModeChange((mode) => {
      setCurrentMode(mode);
      setEnabledFeatures(featureManager.getEnabledFeatures());
    });

    setEnabledFeatures(featureManager.getEnabledFeatures());

    return unsubscribe;
  }, []);

  /**
   * Handle mode change
   */
  const handleModeChange = (mode: UsageMode) => {
    featureManager.setMode(mode);
    setCurrentMode(mode);
    setOverrides(new Map()); // Reset overrides when changing modes
  };

  /**
   * Handle feature toggle
   */
  const handleFeatureToggle = (featureId: string) => {
    const currentState = featureManager.isFeatureEnabled(featureId);
    featureManager.overrideFeature(featureId, !currentState);
    setOverrides(new Map(overrides).set(featureId, !currentState));
    setEnabledFeatures(featureManager.getEnabledFeatures());
  };

  /**
   * Get mode configuration
   */
  const modeConfig = MODE_CONFIGURATIONS.get(currentMode);

  /**
   * Get features by category
   */
  const filteredFeatures = selectedCategory === 'all'
    ? FEATURE_REGISTRY
    : featureManager.getFeaturesByCategory(selectedCategory);

  /**
   * Get all categories
   */
  const categories = Object.values(FeatureCategory);

  /**
   * Check if feature is enabled
   */
  const isFeatureEnabled = (featureId: string): boolean => {
    return featureManager.isFeatureEnabled(featureId);
  };

  /**
   * Check if feature is restricted
   */
  const isFeatureRestricted = (featureId: string): boolean => {
    return modeConfig?.features.restricted.includes(featureId) || false;
  };

  /**
   * Get statistics
   */
  const totalFeatures = FEATURE_REGISTRY.length;
  const enabledCount = enabledFeatures.length;
  const restrictedCount = modeConfig?.features.restricted.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {t('features.title', 'Feature Management')}
          </h1>
          <p className="text-gray-300">
            Configure usage modes and manage feature availability
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4">
            <div className="text-sm text-gray-400 mb-1">Total Features</div>
            <div className="text-3xl font-bold text-white">{totalFeatures}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-sm text-gray-400 mb-1">Enabled</div>
            <div className="text-3xl font-bold text-green-400">{enabledCount}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-sm text-gray-400 mb-1">Restricted</div>
            <div className="text-3xl font-bold text-yellow-400">{restrictedCount}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-sm text-gray-400 mb-1">Disabled</div>
            <div className="text-3xl font-bold text-red-400">
              {totalFeatures - enabledCount - restrictedCount}
            </div>
          </div>
        </div>

        {/* Usage Modes Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-semibold text-white">
              Usage Modes
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(UsageMode).map((mode) => (
              <ModeCard
                key={mode}
                mode={mode}
                isActive={currentMode === mode}
                onSelect={() => handleModeChange(mode)}
              />
            ))}
          </div>
        </div>

        {/* Current Mode Info */}
        {modeConfig && (
          <div className="glass-card-strong p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-500/30">
                <Info className="w-6 h-6 text-blue-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Current Mode: {modeConfig.name}
                </h3>
                <p className="text-gray-300 mb-4">{modeConfig.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Access Level</div>
                    <div className="text-white font-semibold">{modeConfig.accessLevel}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Data Access</div>
                    <div className="text-white font-semibold capitalize">
                      {modeConfig.dataAccess}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Permissions</div>
                    <div className="flex flex-wrap gap-1">
                      {modeConfig.permissions.canView && (
                        <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded">
                          View
                        </span>
                      )}
                      {modeConfig.permissions.canEdit && (
                        <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded">
                          Edit
                        </span>
                      )}
                      {modeConfig.permissions.canDelete && (
                        <span className="px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded">
                          Delete
                        </span>
                      )}
                      {modeConfig.permissions.canExport && (
                        <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded">
                          Export
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white">
              Feature Toggles
            </h2>
          </div>

          {/* Category Filter */}
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedCategory === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              All Features ({FEATURE_REGISTRY.length})
            </button>
            {categories.map((category) => {
              const count = featureManager.getFeaturesByCategory(category).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {category} ({count})
                </button>
              );
            })}
          </div>

          {/* Features List */}
          <div className="space-y-3">
            {filteredFeatures.map((feature) => (
              <FeatureItem
                key={feature.id}
                feature={feature}
                isEnabled={isFeatureEnabled(feature.id)}
                isRestricted={isFeatureRestricted(feature.id)}
                onToggle={() => handleFeatureToggle(feature.id)}
              />
            ))}
          </div>
        </div>

        {/* Warning Notice */}
        <div className="mt-8 glass-card-strong p-6 border border-yellow-500/30">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-300 mb-2">
                Important Information
              </h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Feature overrides are temporary and reset when changing modes</li>
                <li>• Some features require specific user roles to be accessed</li>
                <li>• Restricted features cannot be enabled in certain modes for safety reasons</li>
                <li>• Changes to features may require page refresh to take full effect</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureManagementPage;