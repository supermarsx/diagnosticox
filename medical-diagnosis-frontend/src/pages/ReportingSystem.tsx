import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Send,
  Calendar,
  Filter,
  Search,
  Settings,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';

interface Report {
  id: string;
  title: string;
  description: string;
  type: 'clinical' | 'quality' | 'financial' | 'research' | 'regulatory';
  status: 'draft' | 'generating' | 'completed' | 'failed' | 'scheduled';
  createdAt: Date;
  completedAt?: Date;
  scheduledFor?: Date;
  format: 'pdf' | 'csv' | 'excel' | 'json';
  size?: string;
  downloadUrl?: string;
  filters: {
    dateRange: {
      start: Date;
      end: Date;
    };
    departments?: string[];
    doctors?: string[];
    patients?: string[];
    conditions?: string[];
  };
  generatedBy: string;
  parameters: Record<string, any>;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: Report['type'];
  icon: React.ReactNode;
  defaultFilters: Partial<Report['filters']>;
  parameters: {
    name: string;
    type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
    options?: string[];
    required: boolean;
    description: string;
  }[];
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'patient-outcomes',
    name: 'Patient Outcomes Analysis',
    description: 'Comprehensive analysis of patient treatment outcomes and recovery metrics',
    type: 'clinical',
    icon: <TrendingUp className="w-5 h-5" />,
    defaultFilters: {
      dateRange: {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        end: new Date()
      }
    },
    parameters: [
      {
        name: 'outcomeMetrics',
        type: 'multiselect',
        options: ['Recovery Time', 'Complication Rate', 'Patient Satisfaction', 'Readmission Rate'],
        required: true,
        description: 'Select outcome metrics to include'
      },
      {
        name: 'groupBy',
        type: 'select',
        options: ['Department', 'Doctor', 'Condition', 'Treatment'],
        required: false,
        description: 'Group results by'
      }
    ]
  },
  {
    id: 'quality-metrics',
    name: 'Quality Metrics Dashboard',
    description: 'Key performance indicators for quality of care and patient safety',
    type: 'quality',
    icon: <BarChart3 className="w-5 h-5" />,
    defaultFilters: {
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      }
    },
    parameters: [
      {
        name: 'kpiCategory',
        type: 'select',
        options: ['Patient Safety', 'Clinical Excellence', 'Operational Efficiency', 'Patient Experience'],
        required: true,
        description: 'KPI category to analyze'
      },
      {
        name: 'comparisonPeriod',
        type: 'select',
        options: ['Previous Month', 'Previous Quarter', 'Previous Year', 'Benchmark'],
        required: false,
        description: 'Compare against'
      }
    ]
  },
  {
    id: 'financial-summary',
    name: 'Financial Summary Report',
    description: 'Revenue, expenses, and profitability analysis by department and service',
    type: 'financial',
    icon: <PieChart className="w-5 h-5" />,
    defaultFilters: {
      dateRange: {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        end: new Date()
      }
    },
    parameters: [
      {
        name: 'financialMetrics',
        type: 'multiselect',
        options: ['Revenue', 'Expenses', 'Profit Margin', 'Cost per Patient', 'Revenue per Visit'],
        required: true,
        description: 'Financial metrics to include'
      },
      {
        name: 'breakdownBy',
        type: 'select',
        options: ['Department', 'Service', 'Insurance Type', 'Patient Type'],
        required: false,
        description: 'Break down results by'
      }
    ]
  },
  {
    id: 'research-dataset',
    name: 'Research Dataset Export',
    description: 'Anonymized dataset for research purposes with configurable parameters',
    type: 'research',
    icon: <Activity className="w-5 h-5" />,
    defaultFilters: {
      dateRange: {
        start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        end: new Date()
      }
    },
    parameters: [
      {
        name: 'dataFields',
        type: 'multiselect',
        options: ['Demographics', 'Diagnoses', 'Treatments', 'Outcomes', 'Medications', 'Lab Results'],
        required: true,
        description: 'Data fields to include'
      },
      {
        name: 'anonymizationLevel',
        type: 'select',
        options: ['Full Anonymization', 'Partial Anonymization', 'No Anonymization'],
        required: true,
        description: 'Anonymization level for patient data'
      }
    ]
  },
  {
    id: 'compliance-report',
    name: 'Regulatory Compliance Report',
    description: 'Compliance status for healthcare regulations and quality standards',
    type: 'regulatory',
    icon: <CheckCircle className="w-5 h-5" />,
    defaultFilters: {
      dateRange: {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        end: new Date()
      }
    },
    parameters: [
      {
        name: 'regulations',
        type: 'multiselect',
        options: ['HIPAA', 'FDA', 'Joint Commission', 'State Regulations', 'Internal Policies'],
        required: true,
        description: 'Regulations to check compliance for'
      },
      {
        name: 'severityLevel',
        type: 'select',
        options: ['All Issues', 'High Priority Only', 'Critical Only'],
        required: false,
        description: 'Include issues of specific severity'
      }
    ]
  }
];

export const ReportingSystem: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [showNewReportForm, setShowNewReportForm] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all' as Report['type'] | 'all',
    status: 'all' as Report['status'] | 'all',
    search: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [generatingReports, setGeneratingReports] = useState<Set<string>>(new Set());

  // New report form state
  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
    templateId: '',
    format: 'pdf' as Report['format'],
    scheduledFor: '',
    parameters: {} as Record<string, any>,
    filters: {
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      departments: [] as string[],
      doctors: [] as string[],
      patients: [] as string[],
      conditions: [] as string[]
    }
  });

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reports, filters]);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const data = await analyticsService.getReports();
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = reports;

    if (filters.type !== 'all') {
      filtered = filtered.filter(r => r.type === filters.type);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(r => r.status === filters.status);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(searchLower) ||
        r.description.toLowerCase().includes(searchLower)
      );
    }

    setFilteredReports(filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
  };

  const generateReport = async (template: ReportTemplate) => {
    try {
      setGeneratingReports(prev => new Set(prev).add(template.id));
      
      const reportData = {
        title: newReport.title || template.name,
        description: newReport.description || template.description,
        templateId: template.id,
        type: template.type,
        format: newReport.format,
        filters: newReport.filters,
        parameters: newReport.parameters,
        scheduledFor: newReport.scheduledFor ? new Date(newReport.scheduledFor) : undefined
      };

      const result = await analyticsService.generateReport(reportData);
      
      if (result.success) {
        await loadReports();
        setShowNewReportForm(false);
        resetNewReportForm();
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGeneratingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(template.id);
        return newSet;
      });
    }
  };

  const downloadReport = async (reportId: string) => {
    try {
      const downloadUrl = await analyticsService.getReportDownloadUrl(reportId);
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const deleteReport = async (reportId: string) => {
    try {
      await analyticsService.deleteReport(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const scheduleReport = async () => {
    if (!selectedTemplate) return;

    try {
      setGeneratingReports(prev => new Set(prev).add(selectedTemplate.id));
      
      const scheduleData = {
        templateId: selectedTemplate.id,
        schedule: newReport.scheduledFor,
        filters: newReport.filters,
        parameters: newReport.parameters,
        format: newReport.format
      };

      await analyticsService.scheduleReport(scheduleData);
      await loadReports();
      setShowNewReportForm(false);
      resetNewReportForm();
    } catch (error) {
      console.error('Error scheduling report:', error);
    } finally {
      setGeneratingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedTemplate.id);
        return newSet;
      });
    }
  };

  const resetNewReportForm = () => {
    setNewReport({
      title: '',
      description: '',
      templateId: '',
      format: 'pdf',
      scheduledFor: '',
      parameters: {},
      filters: {
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        departments: [],
        doctors: [],
        patients: [],
        conditions: []
      }
    });
    setSelectedTemplate(null);
  };

  const getStatusIcon = (status: Report['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'generating':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'scheduled':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: Report['type']) => {
    switch (type) {
      case 'clinical':
        return 'bg-blue-100 text-blue-800';
      case 'quality':
        return 'bg-green-100 text-green-800';
      case 'financial':
        return 'bg-purple-100 text-purple-800';
      case 'research':
        return 'bg-orange-100 text-orange-800';
      case 'regulatory':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Reporting System</h1>
        </div>
        <button
          onClick={() => setShowNewReportForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Report</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="clinical">Clinical</option>
              <option value="quality">Quality</option>
              <option value="financial">Financial</option>
              <option value="research">Research</option>
              <option value="regulatory">Regulatory</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="generating">Generating</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>
      </div>

      {/* New Report Form */}
      {showNewReportForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Generate New Report</h3>
            <button
              onClick={() => {
                setShowNewReportForm(false);
                resetNewReportForm();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {!selectedTemplate ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      {template.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(template.type)}`}>
                        {template.type}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  {selectedTemplate.icon}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{selectedTemplate.name}</h4>
                  <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900">Report Details</h5>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Report Title
                    </label>
                    <input
                      type="text"
                      value={newReport.title}
                      onChange={(e) => setNewReport(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={selectedTemplate.name}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newReport.description}
                      onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={selectedTemplate.description}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Format
                    </label>
                    <select
                      value={newReport.format}
                      onChange={(e) => setNewReport(prev => ({ ...prev, format: e.target.value as Report['format'] }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pdf">PDF</option>
                      <option value="csv">CSV</option>
                      <option value="excel">Excel</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900">Date Range</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={newReport.filters.dateRange.start.toISOString().split('T')[0]}
                        onChange={(e) => setNewReport(prev => ({
                          ...prev,
                          filters: {
                            ...prev.filters,
                            dateRange: {
                              ...prev.filters.dateRange,
                              start: new Date(e.target.value)
                            }
                          }
                        }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={newReport.filters.dateRange.end.toISOString().split('T')[0]}
                        onChange={(e) => setNewReport(prev => ({
                          ...prev,
                          filters: {
                            ...prev.filters,
                            dateRange: {
                              ...prev.filters.dateRange,
                              end: new Date(e.target.value)
                            }
                          }
                        }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Schedule For (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={newReport.scheduledFor}
                      onChange={(e) => setNewReport(prev => ({ ...prev, scheduledFor: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                {newReport.scheduledFor ? (
                  <button
                    onClick={scheduleReport}
                    disabled={generatingReports.has(selectedTemplate.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                  >
                    {generatingReports.has(selectedTemplate.id) ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Calendar className="w-4 h-4" />
                    )}
                    <span>Schedule Report</span>
                  </button>
                ) : (
                  <button
                    onClick={() => generateReport(selectedTemplate)}
                    disabled={generatingReports.has(selectedTemplate.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                  >
                    {generatingReports.has(selectedTemplate.id) ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    <span>Generate Now</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No reports found</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getStatusIcon(report.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-lg font-medium text-gray-900">{report.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(report.type)}`}>
                        {report.type}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Created: {report.createdAt.toLocaleDateString()}</span>
                      {report.completedAt && (
                        <span>Completed: {report.completedAt.toLocaleDateString()}</span>
                      )}
                      {report.scheduledFor && (
                        <span>Scheduled: {report.scheduledFor.toLocaleDateString()}</span>
                      )}
                      <span>Format: {report.format.toUpperCase()}</span>
                      {report.size && <span>Size: {report.size}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {report.status === 'completed' && report.downloadUrl && (
                    <button
                      onClick={() => downloadReport(report.id)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                  <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors" title="View">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteReport(report.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};