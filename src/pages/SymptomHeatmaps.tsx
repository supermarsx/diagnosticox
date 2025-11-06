import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, MapPin, TrendingUp, Calendar,
  Download, Share2, Filter, RotateCcw
} from 'lucide-react';

interface SymptomPoint {
  id: string;
  x: number; // percentage
  y: number; // percentage
  intensity: number; // 1-10
  symptom: string;
  date: string;
  notes?: string;
}

interface SymptomHeatmapsProps {
  user: any;
}

export default function SymptomHeatmaps({ user }: SymptomHeatmapsProps) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'front' | 'back'>('front');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');

  const [symptoms, setSymptoms] = useState<SymptomPoint[]>([
    { id: '1', x: 48, y: 25, intensity: 7, symptom: 'Headache', date: '2025-11-05', notes: 'Persistent tension headache' },
    { id: '2', x: 45, y: 45, intensity: 5, symptom: 'Chest discomfort', date: '2025-11-04', notes: 'Mild tightness' },
    { id: '3', x: 55, y: 45, intensity: 6, symptom: 'Chest discomfort', date: '2025-11-04' },
    { id: '4', x: 30, y: 65, intensity: 8, symptom: 'Joint pain', date: '2025-11-03', notes: 'Left knee pain' },
    { id: '5', x: 70, y: 65, intensity: 4, symptom: 'Joint pain', date: '2025-11-05', notes: 'Right knee stiffness' },
    { id: '6', x: 50, y: 55, intensity: 6, symptom: 'Abdominal pain', date: '2025-11-02' },
  ]);

  const bodyRegions = [
    { name: 'Head', x: 45, y: 15, width: 10, height: 15 },
    { name: 'Neck', x: 47, y: 30, width: 6, height: 8 },
    { name: 'Chest', x: 40, y: 38, width: 20, height: 15 },
    { name: 'Abdomen', x: 42, y: 53, width: 16, height: 12 },
    { name: 'Left Arm', x: 25, y: 40, width: 10, height: 30 },
    { name: 'Right Arm', x: 65, y: 40, width: 10, height: 30 },
    { name: 'Left Leg', x: 35, y: 70, width: 10, height: 28 },
    { name: 'Right Leg', x: 55, y: 70, width: 10, height: 28 },
  ];

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 8) return 'bg-red-500 border-red-600';
    if (intensity >= 6) return 'bg-orange-500 border-orange-600';
    if (intensity >= 4) return 'bg-yellow-500 border-yellow-600';
    return 'bg-green-500 border-green-600';
  };

  const getIntensityGradient = (intensity: number) => {
    if (intensity >= 8) return 'rgba(239, 68, 68, 0.6)';
    if (intensity >= 6) return 'rgba(249, 115, 22, 0.5)';
    if (intensity >= 4) return 'rgba(234, 179, 8, 0.4)';
    return 'rgba(34, 197, 94, 0.3)';
  };

  const handleAddSymptom = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newSymptom: SymptomPoint = {
      id: Date.now().toString(),
      x,
      y,
      intensity: 5,
      symptom: 'New symptom',
      date: new Date().toISOString().split('T')[0],
    };

    setSymptoms([...symptoms, newSymptom]);
  };

  const handleExportReport = () => {
    const reportData = {
      patient: user?.full_name || user?.email,
      viewMode,
      timeRange,
      symptoms: symptoms.map(s => ({
        symptom: s.symptom,
        intensity: s.intensity,
        date: s.date,
        notes: s.notes,
      })),
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `symptom-heatmap-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getRegionSymptoms = (regionName: string) => {
    const region = bodyRegions.find(r => r.name === regionName);
    if (!region) return [];

    return symptoms.filter(s => {
      return (
        s.x >= region.x &&
        s.x <= region.x + region.width &&
        s.y >= region.y &&
        s.y <= region.y + region.height
      );
    });
  };

  const averageIntensityByRegion = (regionName: string) => {
    const regionSymptoms = getRegionSymptoms(regionName);
    if (regionSymptoms.length === 0) return 0;
    return regionSymptoms.reduce((sum, s) => sum + s.intensity, 0) / regionSymptoms.length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="glass-card-subtle p-2 rounded-xl mr-4 hover:scale-110 transition-transform"
              >
                <ArrowLeft className="h-6 w-6 text-gray-700" />
              </button>
              <div className="flex items-center gap-3">
                <div className="glass-card-strong p-3 rounded-2xl">
                  <MapPin className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Symptom Heatmaps
                  </h1>
                  <p className="text-sm text-gray-600">
                    Body mapping with pain intensity visualization
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'front' ? 'back' : 'front')}
                className="glass-button flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                {viewMode === 'front' ? 'Back View' : 'Front View'}
              </button>
              <button
                onClick={handleExportReport}
                className="glass-button flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Controls */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-gray-600" />
              <div className="flex gap-2">
                {['today', 'week', 'month'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range as any)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      timeRange === range
                        ? 'bg-indigo-600 text-white'
                        : 'glass-card-subtle hover:glass-card text-gray-700'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowLegend(!showLegend)}
              className="glass-button text-sm"
            >
              {showLegend ? 'Hide' : 'Show'} Legend
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Body Map */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
                {viewMode === 'front' ? 'Front View' : 'Back View'}
              </h3>

              {/* Body Diagram */}
              <div
                className="relative w-full mx-auto"
                style={{ paddingBottom: '120%', maxWidth: '400px' }}
                onClick={handleAddSymptom}
              >
                {/* Body Outline */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 200 240"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Simple body outline */}
                  <ellipse cx="100" cy="30" rx="20" ry="25" stroke="#9ca3af" strokeWidth="2" fill="rgba(255,255,255,0.3)" />
                  <rect x="85" y="55" width="30" height="15" rx="3" stroke="#9ca3af" strokeWidth="2" fill="rgba(255,255,255,0.3)" />
                  <rect x="75" y="70" width="50" height="45" rx="5" stroke="#9ca3af" strokeWidth="2" fill="rgba(255,255,255,0.3)" />
                  <rect x="78" y="115" width="44" height="35" rx="5" stroke="#9ca3af" strokeWidth="2" fill="rgba(255,255,255,0.3)" />
                  <rect x="45" y="75" width="25" height="75" rx="8" stroke="#9ca3af" strokeWidth="2" fill="rgba(255,255,255,0.3)" />
                  <rect x="130" y="75" width="25" height="75" rx="8" stroke="#9ca3af" strokeWidth="2" fill="rgba(255,255,255,0.3)" />
                  <rect x="70" y="150" width="25" height="85" rx="8" stroke="#9ca3af" strokeWidth="2" fill="rgba(255,255,255,0.3)" />
                  <rect x="105" y="150" width="25" height="85" rx="8" stroke="#9ca3af" strokeWidth="2" fill="rgba(255,255,255,0.3)" />
                </svg>

                {/* Symptom Points */}
                {symptoms.map((symptom) => (
                  <div
                    key={symptom.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{
                      left: `${symptom.x}%`,
                      top: `${symptom.y}%`,
                    }}
                  >
                    {/* Glow Effect */}
                    <div
                      className="absolute inset-0 rounded-full blur-xl opacity-60"
                      style={{
                        width: `${symptom.intensity * 8}px`,
                        height: `${symptom.intensity * 8}px`,
                        backgroundColor: getIntensityGradient(symptom.intensity),
                        transform: 'translate(-50%, -50%)',
                      }}
                    />

                    {/* Point */}
                    <div
                      className={`relative w-4 h-4 rounded-full border-2 ${getIntensityColor(symptom.intensity)} shadow-lg hover:scale-150 transition-transform`}
                    />

                    {/* Tooltip */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="glass-card p-3 text-sm whitespace-nowrap">
                        <p className="font-semibold text-gray-900">{symptom.symptom}</p>
                        <p className="text-gray-600 text-xs mt-1">Intensity: {symptom.intensity}/10</p>
                        <p className="text-gray-500 text-xs">{symptom.date}</p>
                        {symptom.notes && (
                          <p className="text-gray-600 text-xs mt-1 max-w-xs">{symptom.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-center text-sm text-gray-600 mt-4">
                Click anywhere on the body to add a symptom point
              </p>
            </div>

            {/* Legend */}
            {showLegend && (
              <div className="glass-card p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Intensity Scale</h4>
                <div className="space-y-3">
                  {[
                    { range: '8-10', label: 'Severe', color: 'bg-red-500' },
                    { range: '6-7', label: 'Moderate', color: 'bg-orange-500' },
                    { range: '4-5', label: 'Mild', color: 'bg-yellow-500' },
                    { range: '1-3', label: 'Minor', color: 'bg-green-500' },
                  ].map((item) => (
                    <div key={item.range} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${item.color}`} />
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-600">Intensity {item.range}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Region Analysis */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                Region Analysis
              </h4>

              <div className="space-y-3">
                {bodyRegions.map((region) => {
                  const avgIntensity = averageIntensityByRegion(region.name);
                  const symptomCount = getRegionSymptoms(region.name).length;

                  return (
                    <div
                      key={region.name}
                      onClick={() => setSelectedRegion(region.name)}
                      className={`glass-card-subtle p-4 rounded-xl cursor-pointer hover:glass-card transition-all ${
                        selectedRegion === region.name ? 'ring-2 ring-indigo-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{region.name}</p>
                        <span className="text-sm text-gray-600">{symptomCount} symptoms</span>
                      </div>
                      
                      {avgIntensity > 0 && (
                        <>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                avgIntensity >= 8 ? 'bg-red-500' :
                                avgIntensity >= 6 ? 'bg-orange-500' :
                                avgIntensity >= 4 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${(avgIntensity / 10) * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            Avg intensity: {avgIntensity.toFixed(1)}/10
                          </p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Symptoms */}
            <div className="glass-card p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                Recent Symptoms
              </h4>

              <div className="space-y-3">
                {symptoms
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map((symptom) => (
                    <div key={symptom.id} className="glass-card-subtle p-3 rounded-xl">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{symptom.symptom}</p>
                          <p className="text-xs text-gray-600 mt-1">{symptom.date}</p>
                          {symptom.notes && (
                            <p className="text-xs text-gray-500 mt-1">{symptom.notes}</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          symptom.intensity >= 8 ? 'bg-red-100 text-red-700' :
                          symptom.intensity >= 6 ? 'bg-orange-100 text-orange-700' :
                          symptom.intensity >= 4 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {symptom.intensity}/10
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
