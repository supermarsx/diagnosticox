import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Save, Eye, Download, Trash2,
  BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon,
  Activity, Target, Users, DollarSign, TrendingUp, Settings
} from 'lucide-react';

interface CustomDashboardBuilderProps {
  user: any;
}

interface Widget {
  id: string;
  type: 'metric' | 'chart' | 'table';
  title: string;
  chartType?: 'line' | 'bar' | 'pie';
  dataSource: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: Widget[];
  createdAt: string;
  shared: boolean;
}

export default function CustomDashboardBuilder({ user }: CustomDashboardBuilderProps) {
  const navigate = useNavigate();
  const [dashboards, setDashboards] = useState<Dashboard[]>([
    {
      id: '1',
      name: 'Clinical Overview',
      description: 'High-level clinical performance metrics',
      widgets: [
        {
          id: 'w1',
          type: 'metric',
          title: 'Total Patients',
          dataSource: 'analytics.totalPatients',
          position: { x: 0, y: 0 },
          size: { width: 1, height: 1 },
        },
        {
          id: 'w2',
          type: 'chart',
          title: 'Outcome Trends',
          chartType: 'line',
          dataSource: 'analytics.outcomeTrends',
          position: { x: 1, y: 0 },
          size: { width: 2, height: 1 },
        },
      ],
      createdAt: '2025-11-05T10:00:00Z',
      shared: false,
    },
  ]);

  const [editingDashboard, setEditingDashboard] = useState<Dashboard | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState('');
  const [newDashboardDescription, setNewDashboardDescription] = useState('');

  const availableWidgets = [
    { type: 'metric', icon: Activity, label: 'Metric Card', dataSource: 'custom' },
    { type: 'chart', chartType: 'line', icon: LineChartIcon, label: 'Line Chart', dataSource: 'custom' },
    { type: 'chart', chartType: 'bar', icon: BarChart3, label: 'Bar Chart', dataSource: 'custom' },
    { type: 'chart', chartType: 'pie', icon: PieChartIcon, label: 'Pie Chart', dataSource: 'custom' },
    { type: 'table', icon: Users, label: 'Data Table', dataSource: 'custom' },
  ];

  const dataSourceOptions = [
    { value: 'analytics.totalPatients', label: 'Total Patients' },
    { value: 'analytics.successRate', label: 'Success Rate' },
    { value: 'analytics.satisfaction', label: 'Patient Satisfaction' },
    { value: 'analytics.cost', label: 'Cost per Patient' },
    { value: 'analytics.outcomeTrends', label: 'Outcome Trends' },
    { value: 'analytics.treatmentEfficacy', label: 'Treatment Efficacy' },
    { value: 'analytics.populationMetrics', label: 'Population Metrics' },
    { value: 'analytics.qualityMetrics', label: 'Quality Metrics' },
  ];

  const createNewDashboard = () => {
    if (!newDashboardName.trim()) return;

    const newDashboard: Dashboard = {
      id: Date.now().toString(),
      name: newDashboardName,
      description: newDashboardDescription,
      widgets: [],
      createdAt: new Date().toISOString(),
      shared: false,
    };

    setDashboards([...dashboards, newDashboard]);
    setEditingDashboard(newDashboard);
    setShowBuilder(true);
    setNewDashboardName('');
    setNewDashboardDescription('');
  };

  const deleteDashboard = (id: string) => {
    setDashboards(dashboards.filter(d => d.id !== id));
  };

  const toggleShare = (id: string) => {
    setDashboards(dashboards.map(d =>
      d.id === id ? { ...d, shared: !d.shared } : d
    ));
  };

  const addWidget = (widgetTemplate: any) => {
    if (!editingDashboard) return;

    const newWidget: Widget = {
      id: Date.now().toString(),
      type: widgetTemplate.type,
      title: 'New Widget',
      chartType: widgetTemplate.chartType,
      dataSource: widgetTemplate.dataSource,
      position: { x: 0, y: editingDashboard.widgets.length },
      size: { width: 2, height: 1 },
    };

    const updated = {
      ...editingDashboard,
      widgets: [...editingDashboard.widgets, newWidget],
    };

    setEditingDashboard(updated);
    setDashboards(dashboards.map(d => d.id === updated.id ? updated : d));
  };

  const removeWidget = (widgetId: string) => {
    if (!editingDashboard) return;

    const updated = {
      ...editingDashboard,
      widgets: editingDashboard.widgets.filter(w => w.id !== widgetId),
    };

    setEditingDashboard(updated);
    setDashboards(dashboards.map(d => d.id === updated.id ? updated : d));
  };

  const updateWidget = (widgetId: string, updates: Partial<Widget>) => {
    if (!editingDashboard) return;

    const updated = {
      ...editingDashboard,
      widgets: editingDashboard.widgets.map(w =>
        w.id === widgetId ? { ...w, ...updates } : w
      ),
    };

    setEditingDashboard(updated);
    setDashboards(dashboards.map(d => d.id === updated.id ? updated : d));
  };

  const exportDashboard = (dashboard: Dashboard) => {
    const dataStr = JSON.stringify(dashboard, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-${dashboard.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (showBuilder && editingDashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Builder Header */}
        <header className="glass-nav sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setShowBuilder(false)}
                  className="glass-card-subtle p-2 rounded-xl mr-4 hover:scale-110 transition-transform"
                >
                  <ArrowLeft className="h-6 w-6 text-gray-700" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Editing: {editingDashboard.name}
                  </h1>
                  <p className="text-sm text-gray-600">{editingDashboard.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="glass-button-primary flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Dashboard
                </button>
                <button
                  onClick={() => navigate(`/dashboards/preview/${editingDashboard.id}`)}
                  className="glass-button flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-4 gap-6">
            {/* Widget Library */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Widget Library</h3>
              <div className="space-y-2">
                {availableWidgets.map((widget, idx) => {
                  const Icon = widget.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => addWidget(widget)}
                      className="w-full glass-card-subtle p-3 rounded-xl hover:glass-card transition-all flex items-center gap-3 text-left"
                    >
                      <Icon className="h-5 w-5 text-indigo-600" />
                      <span className="text-sm font-medium text-gray-900">{widget.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Canvas */}
            <div className="col-span-3 space-y-6">
              {editingDashboard.widgets.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Add widgets from the library to build your custom dashboard
                  </p>
                </div>
              ) : (
                editingDashboard.widgets.map((widget) => (
                  <div key={widget.id} className="glass-card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={widget.title}
                          onChange={(e) => updateWidget(widget.id, { title: e.target.value })}
                          className="text-lg font-semibold text-gray-900 bg-transparent border-b border-gray-300 focus:border-indigo-600 outline-none mb-2 w-full"
                          placeholder="Widget Title"
                        />
                        <select
                          value={widget.dataSource}
                          onChange={(e) => updateWidget(widget.id, { dataSource: e.target.value })}
                          className="text-sm text-gray-600 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-lg px-3 py-1.5"
                        >
                          {dataSourceOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => removeWidget(widget.id)}
                        className="glass-card-subtle p-2 rounded-lg hover:bg-red-100 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {widget.type === 'metric' && (
                      <div className="glass-card-subtle p-4 rounded-xl">
                        <p className="text-3xl font-bold text-gray-900">245</p>
                        <p className="text-sm text-gray-600 mt-1">Sample Value</p>
                      </div>
                    )}

                    {widget.type === 'chart' && (
                      <div className="glass-card-subtle p-4 rounded-xl h-48 flex items-center justify-center">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">{widget.chartType?.toUpperCase()} Chart Preview</p>
                        </div>
                      </div>
                    )}

                    {widget.type === 'table' && (
                      <div className="glass-card-subtle p-4 rounded-xl">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left p-2">Column 1</th>
                              <th className="text-left p-2">Column 2</th>
                              <th className="text-left p-2">Column 3</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="p-2">Sample</td>
                              <td className="p-2">Data</td>
                              <td className="p-2">Row</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/analytics')}
                className="glass-card-subtle p-2 rounded-xl mr-4 hover:scale-110 transition-transform"
              >
                <ArrowLeft className="h-6 w-6 text-gray-700" />
              </button>
              <div className="flex items-center gap-3">
                <div className="glass-card-strong p-3 rounded-2xl">
                  <Settings className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Custom Dashboard Builder
                  </h1>
                  <p className="text-sm text-gray-600">
                    Create and manage personalized analytics dashboards
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Create New Dashboard */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Dashboard</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={newDashboardName}
              onChange={(e) => setNewDashboardName(e.target.value)}
              placeholder="Dashboard Name"
              className="glass-input px-4 py-2 rounded-xl"
            />
            <input
              type="text"
              value={newDashboardDescription}
              onChange={(e) => setNewDashboardDescription(e.target.value)}
              placeholder="Description (optional)"
              className="glass-input px-4 py-2 rounded-xl"
            />
            <button
              onClick={createNewDashboard}
              disabled={!newDashboardName.trim()}
              className="glass-button-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Create Dashboard
            </button>
          </div>
        </div>

        {/* Dashboard List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dashboards.map((dashboard) => (
            <div key={dashboard.id} className="glass-card p-6 hover-lift">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{dashboard.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{dashboard.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {dashboard.widgets.length} widgets • Created{' '}
                    {new Date(dashboard.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  dashboard.shared
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {dashboard.shared ? 'Shared' : 'Private'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingDashboard(dashboard);
                    setShowBuilder(true);
                  }}
                  className="flex-1 glass-button-primary flex items-center justify-center gap-2 text-sm"
                >
                  <Settings className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => navigate(`/dashboards/preview/${dashboard.id}`)}
                  className="flex-1 glass-button flex items-center justify-center gap-2 text-sm"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <button
                  onClick={() => toggleShare(dashboard.id)}
                  className="glass-button px-3"
                  title={dashboard.shared ? 'Make Private' : 'Share Dashboard'}
                >
                  <Users className="h-4 w-4" />
                </button>
                <button
                  onClick={() => exportDashboard(dashboard)}
                  className="glass-button px-3"
                  title="Export Dashboard"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteDashboard(dashboard.id)}
                  className="glass-button px-3 hover:bg-red-100 text-red-600"
                  title="Delete Dashboard"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {dashboards.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Custom Dashboards Yet
            </h3>
            <p className="text-gray-600">
              Create your first custom dashboard to visualize the metrics that matter most to you
            </p>
          </div>
        )}
      </main>
    </div>
  );
}