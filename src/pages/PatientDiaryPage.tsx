import { useState, useEffect } from 'react';
import { Calendar, Heart, Activity, Moon, Plus, AlertCircle, Sparkles } from 'lucide-react';
import { apiService } from '../services/apiService';
import { offlineStorage } from '../services/offlineStorage';
import type { DiaryEntry } from '../types/medical';

interface PatientDiaryPageProps {
  patientId: string;
}

const ENTRY_TYPES = [
  { value: 'symptom', label: 'Symptom', icon: AlertCircle, color: 'red' },
  { value: 'medication', label: 'Medication', icon: Heart, color: 'blue' },
  { value: 'vitals', label: 'Vitals', icon: Activity, color: 'green' },
  { value: 'sleep', label: 'Sleep', icon: Moon, color: 'indigo' },
  { value: 'pain', label: 'Pain', icon: AlertCircle, color: 'orange' },
  { value: 'mood', label: 'Mood', icon: Heart, color: 'pink' },
];

export default function PatientDiaryPage({ patientId }: PatientDiaryPageProps) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Form state
  const [entryType, setEntryType] = useState('symptom');
  const [symptomName, setSymptomName] = useState('');
  const [severity, setSeverity] = useState(5);
  const [measurementValue, setMeasurementValue] = useState('');
  const [measurementUnit, setMeasurementUnit] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEntries();

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [patientId]);

  const loadEntries = async () => {
    setLoading(true);
    
    try {
      const data = await apiService.getDiaryEntries(patientId);
      setEntries(data.entries || []);
    } catch (error) {
      console.error('Failed to load diary entries:', error);
      // Try loading from IndexedDB
      const cachedEntries = await offlineStorage.getDiaryEntriesByPatient(patientId);
      setEntries(cachedEntries);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const newEntry: Partial<DiaryEntry> = {
      id: `temp-${Date.now()}`,
      patient_id: patientId,
      entry_date: new Date().toISOString(),
      entry_type: entryType as any,
      symptom_name: entryType === 'symptom' || entryType === 'pain' ? symptomName : undefined,
      severity: entryType === 'symptom' || entryType === 'pain' ? severity : undefined,
      measurement_value: measurementValue || undefined,
      measurement_unit: measurementUnit || undefined,
      notes: notes || undefined,
      created_at: new Date().toISOString(),
    };

    try {
      const created = await apiService.createDiaryEntry(newEntry);
      setEntries([created, ...entries]);
      resetForm();
      setShowAddForm(false);
    } catch (error: any) {
      console.error('Failed to create entry:', error);
      
      // Save to IndexedDB for offline sync
      if (isOffline) {
        const entry = { ...newEntry, id: newEntry.id! } as DiaryEntry;
        await offlineStorage.addDiaryEntry(entry);
        setEntries([entry, ...entries]);
        resetForm();
        setShowAddForm(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setEntryType('symptom');
    setSymptomName('');
    setSeverity(5);
    setMeasurementValue('');
    setMeasurementUnit('');
    setNotes('');
  };

  const getEntryIcon = (type: string) => {
    const entryType = ENTRY_TYPES.find(t => t.value === type);
    return entryType ? entryType.icon : AlertCircle;
  };

  const getEntryColorClass = (type: string) => {
    const colorMap: Record<string, string> = {
      'symptom': 'glass-badge-critical',
      'medication': 'glass-badge-info',
      'vitals': 'glass-badge-stable',
      'sleep': 'glass-badge-info',
      'pain': 'glass-badge-warning',
      'mood': 'glass-badge-info',
    };
    return colorMap[type] || 'glass-badge';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
          </div>
          <p className="text-gray-700 font-medium">Loading diary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20">
      {/* Glassmorphism Header */}
      <div className="glass-nav sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="glass-card-strong p-2 rounded-xl">
                <Calendar className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Health Diary
                </h1>
                <p className="text-xs text-gray-600">Track your health journey</p>
              </div>
            </div>
            {isOffline && (
              <div className="glass-badge-warning flex items-center gap-1 px-2 py-1 text-xs">
                <AlertCircle className="h-3 w-3" />
                <span>Offline</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Add Entry Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full mb-6 glass-button-primary py-4 flex items-center justify-center gap-2 font-semibold text-white shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Add New Entry
          </button>
        )}

        {/* Add Entry Form */}
        {showAddForm && (
          <div className="glass-card p-6 mb-6 animate-in">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                New Entry
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Entry Type Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {ENTRY_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setEntryType(type.value)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                          entryType === type.value
                            ? 'glass-card-strong border-indigo-300'
                            : 'glass-card-subtle border-transparent hover:border-indigo-200'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${entryType === type.value ? 'text-indigo-600' : 'text-gray-600'}`} />
                        <span className={`font-medium ${entryType === type.value ? 'text-gray-900' : 'text-gray-600'}`}>
                          {type.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Symptom/Pain Name */}
              {(entryType === 'symptom' || entryType === 'pain') && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {entryType === 'pain' ? 'Pain Location' : 'Symptom Name'}
                  </label>
                  <input
                    type="text"
                    value={symptomName}
                    onChange={(e) => setSymptomName(e.target.value)}
                    className="glass-input w-full"
                    placeholder={entryType === 'pain' ? 'e.g., Lower back, Headache' : 'e.g., Fatigue, Nausea'}
                    required
                  />
                </div>
              )}

              {/* Severity Scale */}
              {(entryType === 'symptom' || entryType === 'pain') && (
                <div className="glass-card-subtle p-4 rounded-xl">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Severity: <span className="text-indigo-600">{severity}/10</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={severity}
                    onChange={(e) => setSeverity(parseInt(e.target.value))}
                    className="w-full h-3 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, rgb(239, 68, 68) 0%, rgb(245, 158, 11) 50%, rgb(34, 197, 94) 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-2 font-medium">
                    <span>None</span>
                    <span>Moderate</span>
                    <span>Severe</span>
                  </div>
                </div>
              )}

              {/* Measurement */}
              {entryType === 'vitals' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Value</label>
                    <input
                      type="text"
                      value={measurementValue}
                      onChange={(e) => setMeasurementValue(e.target.value)}
                      className="glass-input w-full"
                      placeholder="120/80"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Unit</label>
                    <input
                      type="text"
                      value={measurementUnit}
                      onChange={(e) => setMeasurementUnit(e.target.value)}
                      className="glass-input w-full"
                      placeholder="mmHg, bpm"
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="glass-input w-full resize-none"
                  placeholder="Any additional details..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="flex-1 glass-button"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 glass-button-primary disabled:opacity-50 font-semibold"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Entries List */}
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <div className="glass-card-subtle p-8 rounded-3xl inline-block mb-4">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto" />
              </div>
              <p className="text-gray-700 text-lg font-medium">No diary entries yet</p>
              <p className="text-sm text-gray-500 mt-2">Start tracking your health by adding an entry</p>
            </div>
          ) : (
            entries.map((entry) => {
              const Icon = getEntryIcon(entry.entry_type);
              const badgeClass = getEntryColorClass(entry.entry_type);
              
              return (
                <div key={entry.id} className="glass-card p-4 hover-lift">
                  <div className="flex items-start gap-3">
                    <div className={`${badgeClass} p-2.5 rounded-xl flex-shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 truncate">
                            {entry.symptom_name || entry.entry_type.charAt(0).toUpperCase() + entry.entry_type.slice(1)}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {new Date(entry.entry_date).toLocaleString()}
                          </p>
                        </div>
                        
                        {entry.severity !== undefined && (
                          <div className="glass-card-subtle px-3 py-1 rounded-lg text-right flex-shrink-0">
                            <span className="text-xl font-bold text-gray-900">{entry.severity}</span>
                            <span className="text-sm text-gray-500">/10</span>
                          </div>
                        )}
                      </div>

                      {entry.measurement_value && (
                        <div className="glass-card-subtle px-3 py-1.5 rounded-lg mt-2 inline-block">
                          <p className="text-sm font-bold text-gray-900">
                            {entry.measurement_value} {entry.measurement_unit}
                          </p>
                        </div>
                      )}

                      {entry.notes && (
                        <p className="text-sm text-gray-700 mt-2 glass-card-subtle p-2 rounded-lg">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Offline Notice */}
        {isOffline && entries.length > 0 && (
          <div className="mt-6 glass-badge-warning p-4 rounded-xl">
            <p className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>You're offline. Entries will sync when you're back online.</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
