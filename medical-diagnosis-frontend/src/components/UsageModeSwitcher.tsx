/**
 * Usage Mode Switcher Component
 * 
 * Allows users to switch between different usage modes
 * and provides visual indication of the current mode.
 * 
 * @component
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { featureManager, UsageMode, MODE_CONFIGURATIONS } from '../services/featureManager';
import { 
  Stethoscope, 
  Microscope, 
  GraduationCap, 
  Building2, 
  Heart 
} from 'lucide-react';

interface UsageModeOption {
  mode: UsageMode;
  icon: React.ReactNode;
  color: string;
}

const MODE_OPTIONS: UsageModeOption[] = [
  {
    mode: UsageMode.CLINICAL_SETTING,
    icon: <Stethoscope className="w-6 h-6" />,
    color: 'blue',
  },
  {
    mode: UsageMode.CLINICAL_STUDY,
    icon: <Microscope className="w-6 h-6" />,
    color: 'purple',
  },
  {
    mode: UsageMode.STUDENT,
    icon: <GraduationCap className="w-6 h-6" />,
    color: 'green',
  },
  {
    mode: UsageMode.FULL_HOSPITAL,
    icon: <Building2 className="w-6 h-6" />,
    color: 'indigo',
  },
  {
    mode: UsageMode.SELF_EXPLORATION,
    icon: <Heart className="w-6 h-6" />,
    color: 'pink',
  },
];

export const UsageModeSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const [currentMode, setCurrentMode] = React.useState<UsageMode>(
    featureManager.getCurrentMode()
  );
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = featureManager.onModeChange((mode) => {
      setCurrentMode(mode);
    });
    return unsubscribe;
  }, []);

  const handleModeChange = (mode: UsageMode) => {
    featureManager.setMode(mode);
    setIsOpen(false);
  };

  const currentOption = MODE_OPTIONS.find((opt) => opt.mode === currentMode);
  const modeConfig = featureManager.getModeConfiguration();

  return (
    <div className="relative">
      {/* Current Mode Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-button flex items-center gap-2 px-4 py-2"
      >
        {currentOption?.icon}
        <span className="font-medium">{modeConfig?.displayName}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 glass-card-strong z-50 p-4">
          <h3 className="text-lg font-bold mb-2">{t('usageModes.switchMode')}</h3>
          <p className="text-sm text-gray-300 mb-4">{modeConfig?.description}</p>

          <div className="space-y-2">
            {MODE_OPTIONS.map((option) => {
              const config = MODE_CONFIGURATIONS.get(option.mode);
              
              const isActive = option.mode === currentMode;

              return (
                <button
                  key={option.mode}
                  onClick={() => handleModeChange(option.mode)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 text-${option.color}-400`}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">
                          {config?.displayName}
                        </h4>
                        {isActive && (
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/30 text-blue-300">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        {config?.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {config?.targetAudience}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feature Count */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-sm text-gray-400">
              {modeConfig?.features.enabled.length} features enabled in this mode
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default UsageModeSwitcher;