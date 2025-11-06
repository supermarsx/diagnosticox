import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, RotateCw, ZoomIn, ZoomOut, Move, Eye, EyeOff,
  Layers, Tag, Info, Download, Share2, Grid3x3
} from 'lucide-react';

interface AnatomicalModelsProps {
  user: any;
}

export default function AnatomicalModels({ user }: AnatomicalModelsProps) {
  const navigate = useNavigate();
  const [selectedSystem, setSelectedSystem] = useState('cardiovascular');
  const [selectedStructure, setSelectedStructure] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | 'cross-section' | 'labeled'>('3d');
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [zoom, setZoom] = useState(100);
  const [showLabels, setShowLabels] = useState(true);
  const [showGrid, setShowGrid] = useState(false);

  const anatomicalSystems = [
    { id: 'cardiovascular', name: 'Cardiovascular System', color: 'bg-red-500', structures: 12 },
    { id: 'nervous', name: 'Nervous System', color: 'bg-purple-500', structures: 15 },
    { id: 'skeletal', name: 'Skeletal System', color: 'bg-gray-500', structures: 206 },
    { id: 'muscular', name: 'Muscular System', color: 'bg-orange-500', structures: 640 },
    { id: 'respiratory', name: 'Respiratory System', color: 'bg-blue-500', structures: 8 },
    { id: 'digestive', name: 'Digestive System', color: 'bg-yellow-500', structures: 11 },
  ];

  const structures = {
    cardiovascular: [
      { id: 'heart', name: 'Heart', description: 'Four-chambered muscular organ', highlighted: true },
      { id: 'aorta', name: 'Aorta', description: 'Main arterial vessel' },
      { id: 'vena-cava', name: 'Vena Cava', description: 'Superior and inferior' },
      { id: 'pulmonary', name: 'Pulmonary Arteries', description: 'Blood flow to lungs' },
    ],
    nervous: [
      { id: 'brain', name: 'Brain', description: 'Central processing unit', highlighted: true },
      { id: 'spinal-cord', name: 'Spinal Cord', description: 'Neural pathway' },
      { id: 'nerves', name: 'Peripheral Nerves', description: 'Sensory and motor' },
    ],
    skeletal: [
      { id: 'skull', name: 'Skull', description: 'Cranial bones', highlighted: true },
      { id: 'spine', name: 'Vertebral Column', description: '33 vertebrae' },
      { id: 'ribs', name: 'Rib Cage', description: '24 ribs' },
      { id: 'femur', name: 'Femur', description: 'Longest bone' },
    ],
  };

  const currentStructures = structures[selectedSystem as keyof typeof structures] || structures.cardiovascular;

  const handleRotate = (axis: 'x' | 'y' | 'z', degrees: number) => {
    setRotation((prev) => ({
      ...prev,
      [axis]: (prev[axis] + degrees) % 360,
    }));
  };

  const handleZoom = (delta: number) => {
    setZoom(Math.max(50, Math.min(200, zoom + delta)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/visualizations')}
                className="glass-card-subtle p-2 rounded-xl mr-4 hover:scale-110 transition-transform"
              >
                <ArrowLeft className="h-6 w-6 text-gray-700" />
              </button>
              <div className="flex items-center gap-3">
                <div className="glass-card-strong p-3 rounded-2xl">
                  <Layers className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    3D Anatomical Models
                  </h1>
                  <p className="text-sm text-gray-600">
                    Interactive anatomical visualization (Simulation)
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLabels(!showLabels)}
                className="glass-button flex items-center gap-2"
              >
                {showLabels ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                Labels
              </button>
              <button className="glass-button flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* System Selector */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Anatomical Systems</h3>
              <div className="space-y-2">
                {anatomicalSystems.map((system) => (
                  <button
                    key={system.id}
                    onClick={() => setSelectedSystem(system.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      selectedSystem === system.id
                        ? 'glass-card ring-2 ring-indigo-500'
                        : 'glass-card-subtle hover:glass-card'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${system.color}`} />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{system.name}</p>
                        <p className="text-xs text-gray-600">{system.structures} structures</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">View Mode</h3>
              <div className="space-y-2">
                {[
                  { value: '3d', label: '3D View', icon: Layers },
                  { value: 'cross-section', label: 'Cross Section', icon: Grid3x3 },
                  { value: 'labeled', label: 'Labeled Diagram', icon: Tag },
                ].map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.value}
                      onClick={() => setViewMode(mode.value as any)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        viewMode === mode.value
                          ? 'bg-indigo-600 text-white'
                          : 'glass-card-subtle hover:glass-card text-gray-700'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3D Viewer */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-8">
              {/* 3D Canvas Placeholder */}
              <div
                className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden"
                style={{ height: '500px' }}
              >
                {/* Grid Background */}
                {showGrid && (
                  <div className="absolute inset-0 opacity-20">
                    <svg className="w-full h-full">
                      <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>
                )}

                {/* 3D Model Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="relative transition-transform duration-300"
                    style={{
                      transform: `scale(${zoom / 100}) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
                    }}
                  >
                    {/* Simulated 3D Heart */}
                    {selectedSystem === 'cardiovascular' && (
                      <svg width="300" height="300" viewBox="0 0 100 100" className="drop-shadow-2xl">
                        <defs>
                          <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#dc2626" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M50,85 C25,70 10,50 10,35 C10,20 20,10 35,10 C45,10 50,20 50,20 C50,20 55,10 65,10 C80,10 90,20 90,35 C90,50 75,70 50,85Z"
                          fill="url(#heartGradient)"
                          stroke="#dc2626"
                          strokeWidth="2"
                          className="animate-pulse"
                        />
                        {showLabels && (
                          <>
                            <text x="20" y="40" fill="white" fontSize="6" className="font-bold">
                              Left Atrium
                            </text>
                            <text x="65" y="40" fill="white" fontSize="6" className="font-bold">
                              Right Atrium
                            </text>
                          </>
                        )}
                      </svg>
                    )}

                    {/* Simulated Brain */}
                    {selectedSystem === 'nervous' && (
                      <svg width="300" height="300" viewBox="0 0 100 100">
                        <ellipse cx="50" cy="45" rx="40" ry="35" fill="#a855f7" stroke="#9333ea" strokeWidth="2" />
                        <ellipse cx="35" cy="45" rx="15" ry="18" fill="#c084fc" stroke="#9333ea" strokeWidth="1" />
                        <ellipse cx="65" cy="45" rx="15" ry="18" fill="#c084fc" stroke="#9333ea" strokeWidth="1" />
                        {showLabels && (
                          <>
                            <text x="35" y="35" fill="white" fontSize="6" className="font-bold" textAnchor="middle">
                              Left Hemisphere
                            </text>
                            <text x="65" y="35" fill="white" fontSize="6" className="font-bold" textAnchor="middle">
                              Right Hemisphere
                            </text>
                          </>
                        )}
                      </svg>
                    )}

                    {/* Simulated Skeleton */}
                    {selectedSystem === 'skeletal' && (
                      <svg width="300" height="400" viewBox="0 0 100 150">
                        <ellipse cx="50" cy="20" rx="15" ry="18" fill="#9ca3af" stroke="#6b7280" strokeWidth="2" />
                        <rect x="40" y="38" width="20" height="40" rx="5" fill="#9ca3af" stroke="#6b7280" strokeWidth="2" />
                        <rect x="35" y="78" width="10" height="60" rx="3" fill="#9ca3af" stroke="#6b7280" strokeWidth="2" />
                        <rect x="55" y="78" width="10" height="60" rx="3" fill="#9ca3af" stroke="#6b7280" strokeWidth="2" />
                        {showLabels && (
                          <>
                            <text x="50" y="15" fill="white" fontSize="6" className="font-bold" textAnchor="middle">
                              Skull
                            </text>
                            <text x="50" y="60" fill="white" fontSize="6" className="font-bold" textAnchor="middle">
                              Spine
                            </text>
                          </>
                        )}
                      </svg>
                    )}
                  </div>
                </div>

                {/* Controls Overlay */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 glass-card px-6 py-3 rounded-full">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleRotate('y', -15)}
                      className="glass-card-subtle p-2 rounded-lg hover:bg-white/30 transition"
                    >
                      <RotateCw className="h-4 w-4 text-white transform rotate-180" />
                    </button>
                    <button
                      onClick={() => handleRotate('y', 15)}
                      className="glass-card-subtle p-2 rounded-lg hover:bg-white/30 transition"
                    >
                      <RotateCw className="h-4 w-4 text-white" />
                    </button>
                    <div className="w-px h-6 bg-white/30" />
                    <button
                      onClick={() => handleZoom(-20)}
                      className="glass-card-subtle p-2 rounded-lg hover:bg-white/30 transition"
                    >
                      <ZoomOut className="h-4 w-4 text-white" />
                    </button>
                    <span className="text-white text-sm font-medium min-w-[60px] text-center">
                      {zoom}%
                    </span>
                    <button
                      onClick={() => handleZoom(20)}
                      className="glass-card-subtle p-2 rounded-lg hover:bg-white/30 transition"
                    >
                      <ZoomIn className="h-4 w-4 text-white" />
                    </button>
                    <div className="w-px h-6 bg-white/30" />
                    <button
                      onClick={() => setShowGrid(!showGrid)}
                      className="glass-card-subtle p-2 rounded-lg hover:bg-white/30 transition"
                    >
                      <Grid3x3 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Info Badge */}
                <div className="absolute top-4 left-4 glass-card px-4 py-2 rounded-full">
                  <p className="text-white text-sm font-medium">3D Model Simulation</p>
                </div>
              </div>
            </div>

            {/* Rotation Controls */}
            <div className="glass-card p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Rotation Controls</h4>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { axis: 'x' as const, label: 'X-Axis (Pitch)' },
                  { axis: 'y' as const, label: 'Y-Axis (Yaw)' },
                  { axis: 'z' as const, label: 'Z-Axis (Roll)' },
                ].map(({ axis, label }) => (
                  <div key={axis}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={rotation[axis]}
                      onChange={(e) => setRotation({ ...rotation, [axis]: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-600 mt-1 text-center">{rotation[axis]}°</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Structure List */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Structures</h3>
              <div className="space-y-2">
                {currentStructures.map((structure) => (
                  <div
                    key={structure.id}
                    onClick={() => setSelectedStructure(structure.id)}
                    className={`glass-card-subtle p-3 rounded-xl cursor-pointer hover:glass-card transition-all ${
                      selectedStructure === structure.id ? 'ring-2 ring-indigo-500' : ''
                    } ${structure.highlighted ? 'border-l-4 border-indigo-600' : ''}`}
                  >
                    <p className="font-medium text-gray-900 text-sm">{structure.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{structure.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedStructure && (
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-5 w-5 text-indigo-600" />
                  <h4 className="font-semibold text-gray-900">Details</h4>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Clinical Significance</p>
                    <p className="text-gray-900">
                      Detailed anatomical information and clinical relevance would be displayed here in production.
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Related Conditions</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Pathology A
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        Pathology B
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}