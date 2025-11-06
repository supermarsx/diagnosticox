import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, MapPin, Box, Camera, Activity,
  Eye, Film, Mic, Brain, FileText, BarChart3
} from 'lucide-react';

interface VisualizationsHubProps {
  user: any;
}

const visualizationTools = [
  {
    title: 'Interactive Medical Timeline',
    description: 'Drag-and-drop event management with zoom and pan capabilities',
    icon: Calendar,
    color: 'from-blue-500 to-indigo-500',
    route: '/visualizations/timeline',
    features: ['Drag & Drop', 'Event Correlation', 'Export Timeline'],
  },
  {
    title: 'Symptom Heatmaps',
    description: 'Body mapping with pain intensity and symptom tracking',
    icon: MapPin,
    color: 'from-orange-500 to-pink-500',
    route: '/visualizations/heatmaps',
    features: ['Body Mapping', 'Intensity Tracking', 'Region Analysis'],
  },
  {
    title: '3D Anatomical Models',
    description: 'Interactive 3D anatomical structures with detailed labeling',
    icon: Box,
    color: 'from-purple-500 to-indigo-500',
    route: '/visualizations/anatomical',
    features: ['3D Rotation', 'System Views', 'Educational Overlays'],
  },
  {
    title: 'Medical Imaging Viewer',
    description: 'Advanced medical image viewing with annotations and measurements',
    icon: Eye,
    color: 'from-green-500 to-teal-500',
    route: '/visualizations/imaging',
    features: ['Image Manipulation', 'Annotations', 'Measurements'],
  },
  {
    title: 'Document Scanner',
    description: 'Camera integration for digitizing medical documents and prescriptions',
    icon: Camera,
    color: 'from-red-500 to-orange-500',
    route: '/visualizations/camera',
    features: ['OCR Processing', 'Auto-Categorization', 'Document Management'],
  },
  {
    title: 'Real-Time Monitoring',
    description: 'Live vital signs monitoring with alert thresholds',
    icon: Activity,
    color: 'from-indigo-500 to-purple-500',
    route: '/monitoring',
    features: ['Live Updates', 'Alert System', 'Multi-Patient'],
  },
];

export default function VisualizationsHub({ user }: VisualizationsHubProps) {
  const navigate = useNavigate();

  const quickStats = [
    { label: 'Total Visualizations', value: '6', icon: BarChart3, color: 'text-blue-600' },
    { label: 'Active Tools', value: '4', icon: Activity, color: 'text-green-600' },
    { label: 'Data Points', value: '127', icon: Brain, color: 'text-purple-600' },
    { label: 'Reports Generated', value: '23', icon: FileText, color: 'text-orange-600' },
  ];

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
                  <Film className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Visualizations Hub
                  </h1>
                  <p className="text-sm text-gray-600">
                    Advanced medical visualizations and interactive tools
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="glass-card p-6 hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-2">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className="glass-card-subtle p-3 rounded-xl">
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visualization Tools Grid */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Visualization Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Medical Timeline */}
            <Link
              to="/visualizations/timeline"
              className="glass-card p-6 hover-lift cursor-pointer transition-all group block"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Medical Timeline</h3>
              <p className="text-sm text-gray-600 mb-4">Drag-and-drop event management with zoom and pan capabilities</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">Drag & Drop</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">Event Correlation</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">Export Timeline</span>
              </div>
              <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium group-hover:translate-x-2 transition-transform">
                Open Tool
                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
              </div>
            </Link>

            {/* Symptom Heatmaps */}
            <Link
              to="/visualizations/heatmaps"
              className="glass-card p-6 hover-lift cursor-pointer transition-all group block"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Symptom Heatmaps</h3>
              <p className="text-sm text-gray-600 mb-4">Body mapping with pain intensity and symptom tracking</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">Body Mapping</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">Intensity Tracking</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">Region Analysis</span>
              </div>
              <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium group-hover:translate-x-2 transition-transform">
                Open Tool
                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
              </div>
            </Link>

            {/* 3D Anatomical Models */}
            <Link
              to="/visualizations/anatomical"
              className="glass-card p-6 hover-lift cursor-pointer transition-all group block"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Box className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3D Anatomical Models</h3>
              <p className="text-sm text-gray-600 mb-4">Interactive 3D anatomical structures with detailed labeling</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">3D Rotation</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">System Views</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">Educational Overlays</span>
              </div>
              <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium group-hover:translate-x-2 transition-transform">
                Open Tool
                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
              </div>
            </Link>

            {/* Medical Imaging Viewer */}
            <Link
              to="/visualizations/imaging"
              className="glass-card p-6 hover-lift cursor-pointer transition-all group block"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Medical Imaging Viewer</h3>
              <p className="text-sm text-gray-600 mb-4">Advanced medical image viewing with annotations and measurements</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">Image Manipulation</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">Annotations</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">Measurements</span>
              </div>
              <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium group-hover:translate-x-2 transition-transform">
                Open Tool
                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
              </div>
            </Link>

            {/* Document Scanner */}
            <Link
              to="/visualizations/camera"
              className="glass-card p-6 hover-lift cursor-pointer transition-all group block"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Scanner</h3>
              <p className="text-sm text-gray-600 mb-4">Camera integration for digitizing medical documents and prescriptions</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">OCR Processing</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">Auto-Categorization</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">Document Management</span>
              </div>
              <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium group-hover:translate-x-2 transition-transform">
                Open Tool
                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
              </div>
            </Link>

            {/* Real-Time Monitoring */}
            <Link
              to="/monitoring"
              className="glass-card p-6 hover-lift cursor-pointer transition-all group block"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Monitoring</h3>
              <p className="text-sm text-gray-600 mb-4">Live vital signs monitoring with alert thresholds</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">Live Updates</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">Alert System</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">Multi-Patient</span>
              </div>
              <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium group-hover:translate-x-2 transition-transform">
                Open Tool
                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
              </div>
            </Link>

          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              {
                action: 'Timeline Event Added',
                details: 'Lab Results - HbA1c Test',
                time: '2 hours ago',
                icon: Calendar,
                color: 'text-blue-600',
              },
              {
                action: 'Symptom Mapped',
                details: 'Chest discomfort intensity 6/10',
                time: '5 hours ago',
                icon: MapPin,
                color: 'text-orange-600',
              },
              {
                action: 'Vital Signs Monitored',
                details: 'Real-time monitoring session completed',
                time: '1 day ago',
                icon: Activity,
                color: 'text-green-600',
              },
              {
                action: 'Document Scanned',
                details: 'Prescription digitized and archived',
                time: '2 days ago',
                icon: Camera,
                color: 'text-red-600',
              },
            ].map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="glass-card-subtle p-4 rounded-xl flex items-start gap-4">
                  <div className={`glass-card-subtle p-2 rounded-lg ${activity.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="glass-card-subtle p-3 rounded-xl text-indigo-600">
                <Brain className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-gray-900">AI-Powered Analysis</h4>
            </div>
            <p className="text-sm text-gray-600">
              Advanced algorithms analyze your medical data to provide insights and correlations across visualizations.
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="glass-card-subtle p-3 rounded-xl text-green-600">
                <Activity className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-gray-900">Real-Time Updates</h4>
            </div>
            <p className="text-sm text-gray-600">
              Live data streaming and automatic updates keep your visualizations current with the latest medical information.
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="glass-card-subtle p-3 rounded-xl text-purple-600">
                <FileText className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-gray-900">Export & Share</h4>
            </div>
            <p className="text-sm text-gray-600">
              Generate professional reports and export visualizations in multiple formats for sharing with healthcare providers.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
