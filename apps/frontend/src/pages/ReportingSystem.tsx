import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Download, Calendar, Filter,
  Users, Activity, TrendingUp, BarChart3, Clock, Send
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';

interface ReportingSystemProps {
  user: any;
}

interface Report {
  id: string;
  name: string;
  type: 'clinical' | 'quality' | 'financial' | 'research' | 'regulatory';
  status: 'generating' | 'ready' | 'scheduled';
  createdAt: string;
  format: 'pdf' | 'csv' | 'excel' | 'json';
  schedule?: string;
}

export default function ReportingSystem({ user }: ReportingSystemProps) {
  const navigate = useNavigate();
  const [selectedReportType, setSelectedReportType] = useState<string>('all');
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      name: 'Monthly Clinical Summary',
      type: 'clinical',
      status: 'ready',
      createdAt: '2025-11-05T10:00:00Z',
      format: 'pdf',
      schedule: 'monthly',
    },
    {
      id: '2',
      name: 'Quality Measures Q4 2025',
      type: 'quality',
      status: 'ready',
      createdAt: '2025-11-04T15:30:00Z',
      format: 'excel',
    },
    {
      id: '3',
      name: 'Patient Outcomes Analysis',
      type: 'research',
      status: 'generating',
      createdAt: '2025-11-06T00:30:00Z',
      format: 'csv',
    },
  ]);

  const reportTypes = [
    { value: 'all', label: 'All Reports', icon: FileText, color: 'indigo' },
    { value: 'clinical', label: 'Clinical Summary', icon: Activity, color: 'blue' },
    { value: 'quality', label: 'Quality Measures', icon: TrendingUp, color: 'green' },
    { value: 'financial', label: 'Financial Analysis', icon: BarChart3, color: 'purple' },
    { value: 'research', label: 'Research Data', icon: Users, color: 'orange' },
    { value: 'regulatory', label: 'Regulatory Compliance', icon: FileText, color: 'red' },
  ];

  const generateReport = (type: string) => {
    const newReport: Report = {
      id: Date.now().toString(),
      name: `${reportTypes.find(t => t.value === type)?.label || 'New Report'} - ${new Date().toLocaleDateString()}`,
      type: type as any,
      status: 'generating',
      createdAt: new Date().toISOString(),
      format: 'pdf',
    };

    setReports([newReport, ...reports]);

    // Simulate generation
    setTimeout(() => {
      setReports(prev =>
        prev.map(r => r.id === newReport.id ? { ...r, status: 'ready' as const } : r)
      );
    }, 3000);
  };

  const exportClinicalSummary = () => {
    const summary = analyticsService.getSummaryStatistics();
    const qualityMetrics = analyticsService.getClinicalQualityMetrics();
    const treatments = analyticsService.getTreatmentEfficacy();

    const reportData = {
      reportTitle: 'Clinical Summary Report',
      generatedDate: new Date().toISOString(),
      generatedBy: user?.full_name || user?.email,
      summary,
      qualityMetrics,
      treatments,
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clinical-summary-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportQualityMeasures = () => {
    const qualityMetrics = analyticsService.getClinicalQualityMetrics();
    const complianceMetrics = analyticsService.getComplianceMetrics();

    const csvHeaders = ['Metric', 'Current', 'Target', 'Benchmark', 'Trend', 'Category'];
    const csvRows = qualityMetrics.map(m => [
      m.metric,
      m.current.toString(),
      m.target.toString(),
      m.benchmark.toString(),
      m.trend,
      m.category,
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(',')),
      '',
      'Compliance Metrics',
      'Measure,Compliance %,Target %,Eligible,Compliant',
      ...complianceMetrics.map(m => [
        m.measure,
        m.compliance.toString(),
        m.target.toString(),
        m.eligible.toString(),
        m.compliant.toString(),
      ].join(',')),
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quality-measures-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPatientOutcomes = () => {
    const outcomes = analyticsService.getPatientOutcomes();

    const csvHeaders = ['Patient ID', 'Patient Name', 'Condition', 'Treatment Start', 'Status', 'Quality of Life', 'Symptom Severity', 'Adherence Rate', 'Adverse Events', 'Cost of Care'];
    const csvRows = outcomes.map(o => [
      o.patientId,
      o.patientName,
      o.condition,
      o.treatmentStart,
      o.currentStatus,
      o.qualityOfLife.toString(),
      o.symptomSeverity.toString(),
      o.adherenceRate.toString(),
      o.adverseEvents.toString(),
      o.costOfCare.toString(),
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(',')),
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `patient-outcomes-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportTreatmentEfficacy = () => {
    const treatments = analyticsService.getTreatmentEfficacy();

    const csvHeaders = ['Treatment', 'Condition', 'Patients', 'Success Rate %', 'Avg Response Days', 'Adverse Event Rate %', 'Cost per Patient', 'Evidence Level', 'QoL Improvement %'];
    const csvRows = treatments.map(t => [
      t.treatmentName,
      t.condition,
      t.patientsCount.toString(),
      t.successRate.toString(),
      t.averageResponseTime.toString(),
      t.adverseEventRate.toString(),
      t.costPerPatient.toString(),
      t.evidenceLevel,
      t.qualityImprovement.toString(),
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(',')),
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `treatment-efficacy-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPopulationHealth = () => {
    const population = analyticsService.getPopulationMetrics();

    const csvHeaders = ['Condition', 'Prevalence per 1000', 'Incidence per 1000/yr', 'Average Age', 'Male %', 'Female %', 'Treatment Coverage %', 'Outcome Success %'];
    const csvRows = population.map(p => [
      p.condition,
      p.prevalence.toString(),
      p.incidence.toString(),
      p.averageAge.toString(),
      p.genderRatio.male.toString(),
      p.genderRatio.female.toString(),
      p.treatmentCoverage.toString(),
      p.outcomeSuccess.toString(),
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(',')),
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `population-health-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredReports = selectedReportType === 'all'
    ? reports
    : reports.filter(r => r.type === selectedReportType);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-700';
      case 'generating': return 'bg-yellow-100 text-yellow-700';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeColor = (type: string) => {
    const typeConfig = reportTypes.find(t => t.value === type);
    return typeConfig ? `text-${typeConfig.color}-600` : 'text-gray-600';
  };

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
                  <FileText className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Reporting System
                  </h1>
                  <p className="text-sm text-gray-600">
                    Generate, schedule, and export comprehensive reports
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Export Section */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Data Export</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <button
              onClick={exportClinicalSummary}
              className="glass-card-subtle p-4 rounded-xl hover:glass-card transition-all text-left group"
            >
              <Activity className="h-6 w-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 text-sm">Clinical Summary</p>
              <p className="text-xs text-gray-600 mt-1">JSON format</p>
            </button>

            <button
              onClick={exportQualityMeasures}
              className="glass-card-subtle p-4 rounded-xl hover:glass-card transition-all text-left group"
            >
              <TrendingUp className="h-6 w-6 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 text-sm">Quality Measures</p>
              <p className="text-xs text-gray-600 mt-1">CSV format</p>
            </button>

            <button
              onClick={exportPatientOutcomes}
              className="glass-card-subtle p-4 rounded-xl hover:glass-card transition-all text-left group"
            >
              <Users className="h-6 w-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 text-sm">Patient Outcomes</p>
              <p className="text-xs text-gray-600 mt-1">CSV format</p>
            </button>

            <button
              onClick={exportTreatmentEfficacy}
              className="glass-card-subtle p-4 rounded-xl hover:glass-card transition-all text-left group"
            >
              <BarChart3 className="h-6 w-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 text-sm">Treatment Efficacy</p>
              <p className="text-xs text-gray-600 mt-1">CSV format</p>
            </button>

            <button
              onClick={exportPopulationHealth}
              className="glass-card-subtle p-4 rounded-xl hover:glass-card transition-all text-left group"
            >
              <Activity className="h-6 w-6 text-red-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 text-sm">Population Health</p>
              <p className="text-xs text-gray-600 mt-1">CSV format</p>
            </button>
          </div>
        </div>

        {/* Report Generation */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate New Report</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {reportTypes.filter(t => t.value !== 'all').map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => generateReport(type.value)}
                  className="glass-card-subtle p-4 rounded-xl hover:glass-card transition-all text-center group"
                >
                  <Icon className={`h-6 w-6 text-${type.color}-600 mx-auto mb-2 group-hover:scale-110 transition-transform`} />
                  <p className="text-sm font-medium text-gray-900">{type.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Report Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => setSelectedReportType(type.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  selectedReportType === type.value
                    ? 'glass-card-strong text-indigo-600'
                    : 'glass-card-subtle text-gray-600 hover:glass-card'
                }`}
              >
                <Icon className="h-4 w-4" />
                {type.label}
              </button>
            );
          })}
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Found</h3>
              <p className="text-gray-600">
                Generate a new report to get started
              </p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={report.id} className="glass-card p-6 hover-lift">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {report.format.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(report.createdAt).toLocaleString()}
                      </span>
                      {report.schedule && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Scheduled: {report.schedule}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {report.status === 'ready' && (
                      <>
                        <button className="glass-button-primary px-4 py-2 flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                        <button className="glass-button px-4 py-2 flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          Email
                        </button>
                      </>
                    )}
                    {report.status === 'generating' && (
                      <div className="flex items-center gap-2 px-4 py-2 text-gray-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-indigo-600"></div>
                        <span className="text-sm">Generating...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
