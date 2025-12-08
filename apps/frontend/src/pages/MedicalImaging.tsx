import React, { useState } from 'react';
import { ArrowLeft, ZoomIn, ZoomOut, RotateCw, Move, Ruler, Maximize2, Download, Upload, Grid3x3, Contrast, Sun, Filter, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ImageStudy {
  id: string;
  patientName: string;
  studyDate: string;
  modality: string;
  bodyPart: string;
  series: ImageSeries[];
}

interface ImageSeries {
  id: string;
  description: string;
  images: MedicalImage[];
}

interface MedicalImage {
  id: string;
  url: string;
  instanceNumber: number;
  sliceLocation?: number;
}

interface Measurement {
  id: string;
  type: 'line' | 'angle' | 'area';
  value: string;
  points: { x: number; y: number }[];
}

const MedicalImaging: React.FC<{ user: any }> = ({ user }) => {
  const navigate = useNavigate();
  
  // Mock study data
  const [studies] = useState<ImageStudy[]>([
    {
      id: 'study-001',
      patientName: 'Sarah Johnson',
      studyDate: '2025-01-15',
      modality: 'CT',
      bodyPart: 'Brain',
      series: [
        {
          id: 'series-001',
          description: 'Brain CT Axial',
          images: Array.from({ length: 24 }, (_, i) => ({
            id: `img-${i}`,
            url: '/images/ct-brain.png',
            instanceNumber: i + 1,
            sliceLocation: -60 + (i * 5)
          }))
        }
      ]
    },
    {
      id: 'study-002',
      patientName: 'Michael Chen',
      studyDate: '2025-01-10',
      modality: 'MRI',
      bodyPart: 'Spine',
      series: [
        {
          id: 'series-002',
          description: 'Spine MRI T2',
          images: Array.from({ length: 18 }, (_, i) => ({
            id: `img-${i}`,
            url: '/images/mri-spine.png',
            instanceNumber: i + 1
          }))
        }
      ]
    }
  ]);

  const [selectedStudy, setSelectedStudy] = useState<ImageStudy | null>(studies[0]);
  const [selectedSeries, setSelectedSeries] = useState<ImageSeries | null>(studies[0]?.series[0] || null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [activeTool, setActiveTool] = useState<'none' | 'zoom' | 'pan' | 'measure' | 'window'>('none');
  const [showGrid, setShowGrid] = useState(false);

  const handlePreviousImage = () => {
    if (selectedSeries && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (selectedSeries && currentImageIndex < selectedSeries.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 25, 400));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 25, 25));
  };

  const handleRotate = () => {
    setRotation((rotation + 90) % 360);
  };

  const handleReset = () => {
    setZoom(100);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setMeasurements([]);
    setActiveTool('none');
  };

  const handleAddMeasurement = () => {
    const newMeasurement: Measurement = {
      id: `measure-${Date.now()}`,
      type: 'line',
      value: '42.5 mm',
      points: [
        { x: 100, y: 100 },
        { x: 200, y: 150 }
      ]
    };
    setMeasurements([...measurements, newMeasurement]);
  };

  const currentImage = selectedSeries?.images[currentImageIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      {/* Header */}
      <div className="glass-card p-4 mb-6 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/visualizations')}
              className="glass-button p-2 hover-lift"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Medical Imaging Viewer</h1>
              <p className="text-sm text-gray-600">DICOM Image Analysis & Measurement</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="glass-button px-4 py-2 hover-lift">
              <Upload className="w-4 h-4 mr-2 inline" />
              Upload Study
            </button>
            <button className="glass-button px-4 py-2 hover-lift">
              <Download className="w-4 h-4 mr-2 inline" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Study List Sidebar */}
        <div className="col-span-3 space-y-4">
          <div className="glass-card p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-purple-600" />
              Studies
            </h3>
            
            <div className="space-y-2">
              {studies.map(study => (
                <button
                  key={study.id}
                  onClick={() => {
                    setSelectedStudy(study);
                    setSelectedSeries(study.series[0]);
                    setCurrentImageIndex(0);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedStudy?.id === study.id
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                      : 'glass-card-subtle hover:bg-white/50'
                  }`}
                >
                  <div className="font-medium text-sm">{study.patientName}</div>
                  <div className="text-xs opacity-80 mt-1">
                    {study.modality} - {study.bodyPart}
                  </div>
                  <div className="text-xs opacity-60 mt-1">
                    {new Date(study.studyDate).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Series List */}
          {selectedStudy && (
            <div className="glass-card p-4">
              <h3 className="font-semibold mb-4 text-sm">Series</h3>
              <div className="space-y-2">
                {selectedStudy.series.map(series => (
                  <button
                    key={series.id}
                    onClick={() => {
                      setSelectedSeries(series);
                      setCurrentImageIndex(0);
                    }}
                    className={`w-full text-left p-2 rounded text-sm transition-all ${
                      selectedSeries?.id === series.id
                        ? 'bg-purple-100 text-purple-700'
                        : 'hover:bg-white/50'
                    }`}
                  >
                    {series.description}
                    <div className="text-xs opacity-60 mt-1">
                      {series.images.length} images
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Image Info */}
          {currentImage && (
            <div className="glass-card p-4">
              <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                Image Info
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Instance:</span>
                  <span className="font-medium">{currentImage.instanceNumber}</span>
                </div>
                {currentImage.sliceLocation !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Slice Location:</span>
                    <span className="font-medium">{currentImage.sliceLocation} mm</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Zoom:</span>
                  <span className="font-medium">{zoom}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rotation:</span>
                  <span className="font-medium">{rotation}°</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Viewer */}
        <div className="col-span-9 space-y-4">
          {/* Toolbar */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 border-r border-gray-300 pr-3">
                  <button
                    onClick={handleZoomIn}
                    className="glass-button p-2 hover-lift"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleZoomOut}
                    className="glass-button p-2 hover-lift"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium px-2">{zoom}%</span>
                </div>

                <div className="flex items-center gap-1 border-r border-gray-300 pr-3">
                  <button
                    onClick={handleRotate}
                    className="glass-button p-2 hover-lift"
                    title="Rotate"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveTool(activeTool === 'pan' ? 'none' : 'pan')}
                    className={`glass-button p-2 hover-lift ${activeTool === 'pan' ? 'bg-purple-100' : ''}`}
                    title="Pan"
                  >
                    <Move className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-1 border-r border-gray-300 pr-3">
                  <button
                    onClick={() => {
                      setActiveTool(activeTool === 'measure' ? 'none' : 'measure');
                      if (activeTool !== 'measure') handleAddMeasurement();
                    }}
                    className={`glass-button p-2 hover-lift ${activeTool === 'measure' ? 'bg-purple-100' : ''}`}
                    title="Measure"
                  >
                    <Ruler className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`glass-button p-2 hover-lift ${showGrid ? 'bg-purple-100' : ''}`}
                    title="Grid"
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={() => setActiveTool(activeTool === 'window' ? 'none' : 'window')}
                  className={`glass-button p-2 hover-lift ${activeTool === 'window' ? 'bg-purple-100' : ''}`}
                  title="Window/Level"
                >
                  <Contrast className="w-5 h-5" />
                </button>

                <button
                  className="glass-button p-2 hover-lift"
                  title="Full Screen"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleReset}
                className="glass-button-primary px-4 py-2 hover-lift text-sm"
              >
                Reset View
              </button>
            </div>
          </div>

          {/* Image Viewer */}
          <div className="glass-card p-6">
            <div className="bg-black rounded-lg overflow-hidden relative" style={{ height: '600px' }}>
              {currentImage && (
                <div className="w-full h-full flex items-center justify-center relative">
                  {/* Simulated medical image display */}
                  <div
                    className="transition-all duration-200"
                    style={{
                      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                      filter: `brightness(${brightness}%) contrast(${contrast}%)`
                    }}
                    >
                    <div className="w-96 h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center text-gray-500 relative">
                      {/* Simulated CT/MRI image placeholder */}
                      <div className="absolute inset-0 opacity-20">
                        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="50%" cy="50%" r="40%" fill="none" stroke="#fff" strokeWidth="2" />
                          <circle cx="50%" cy="50%" r="30%" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
                          <circle cx="50%" cy="50%" r="20%" fill="none" stroke="#fff" strokeWidth="1" opacity="0.3" />
                        </svg>
                      </div>
                      
                      <div className="text-center z-10">
                        <div className="text-lg font-bold text-white mb-2">
                          {selectedStudy?.modality} {selectedStudy?.bodyPart}
                        </div>
                        <div className="text-sm">
                          Slice {currentImage.instanceNumber} of {selectedSeries?.images.length}
                        </div>
                      </div>

                      {/* Grid overlay */}
                      {showGrid && (
                        <div className="absolute inset-0 pointer-events-none">
                          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                              </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                          </svg>
                        </div>
                      )}

                      {/* Measurements overlay */}
                      {measurements.map(measurement => (
                        <div
                          key={measurement.id}
                          className="absolute inset-0 pointer-events-none"
                        >
                          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <line
                              x1={`${measurement.points[0].x}%`}
                              y1={`${measurement.points[0].y}%`}
                              x2={`${measurement.points[1].x}%`}
                              y2={`${measurement.points[1].y}%`}
                              stroke="#fbbf24"
                              strokeWidth="2"
                            />
                            <text
                              x={`${(measurement.points[0].x + measurement.points[1].x) / 2}%`}
                              y={`${(measurement.points[0].y + measurement.points[1].y) / 2}%`}
                              fill="#fbbf24"
                              fontSize="14"
                            >
                              {measurement.value}
                            </text>
                          </svg>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Image navigation overlays */}
                  <button
                    onClick={handlePreviousImage}
                    disabled={currentImageIndex === 0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 glass-button p-3 hover-lift disabled:opacity-30"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    disabled={!selectedSeries || currentImageIndex === selectedSeries.images.length - 1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 glass-button p-3 hover-lift disabled:opacity-30"
                  >
                    <ArrowLeft className="w-6 h-6 rotate-180" />
                  </button>
                </div>
              )}

              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-card px-4 py-2">
                <div className="text-sm text-white">
                  {currentImageIndex + 1} / {selectedSeries?.images.length || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Adjustment Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <Sun className="w-5 h-5 text-yellow-600" />
                <label className="text-sm font-medium">Brightness</label>
                <span className="ml-auto text-sm text-gray-600">{brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="glass-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <Contrast className="w-5 h-5 text-purple-600" />
                <label className="text-sm font-medium">Contrast</label>
                <span className="ml-auto text-sm text-gray-600">{contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalImaging;
