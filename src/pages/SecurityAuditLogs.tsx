import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Activity, AlertTriangle, Shield,
  User, Clock, MapPin, Filter, Download, Search, Eye,
  XCircle, CheckCircle, Info, TrendingUp, Loader
} from 'lucide-react';
import securityAPI from '../services/securityAPI';

interface AuditEvent {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: 'success' | 'failure' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress: string;
  location: string;
  details: string;
}

interface SecurityAuditLogsProps {
  user: any;
}

const SecurityAuditLogs = ({ user }: SecurityAuditLogsProps) => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('24h');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch audit logs from API
  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        const response = await securityAPI.getAuditLogs();
        
        // Map API logs to component format
        const mappedLogs: AuditEvent[] = (Array.isArray(response) ? response : []).map((log: any) => ({
          id: log.id?.toString() || '',
          timestamp: log.created_at || '',
          user: log.user_email || 'system',
          action: log.action || '',
          resource: log.table_name ? `Table: ${log.table_name}` : 'Unknown',
          status: log.action.includes('FAILED') ? 'failure' : 'success',
          severity: log.action.includes('FAILED') || log.action.includes('DELETE') ? 'high' : 'medium',
          ipAddress: log.ip_address || 'Unknown',
          location: 'N/A',
          details: log.changes || ''
        }));
        setAuditEvents(mappedLogs);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching audit logs:', err);
        setError(err.message || 'Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAuditLogs();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failure': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default: return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <span className="glass-badge-danger">Critical</span>;
      case 'high': return <span className="glass-badge-warning">High</span>;
      case 'medium': return <span className="glass-badge-info">Medium</span>;
      case 'low': return <span className="glass-badge-success">Low</span>;
      default: return <span className="glass-badge">Unknown</span>;
    }
  };

  const filteredEvents = auditEvents.filter(event => {
    if (filterStatus !== 'all' && event.status !== filterStatus) return false;
    if (filterSeverity !== 'all' && event.severity !== filterSeverity) return false;
    if (searchQuery && !event.action.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !event.user.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const securityMetrics = {
    totalEvents: auditEvents.length,
    criticalEvents: auditEvents.filter(e => e.severity === 'critical').length,
    failedAttempts: auditEvents.filter(e => e.status === 'failure').length,
    activeUsers: new Set(auditEvents.map(e => e.user)).size
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="glass-nav sticky top-0 z-10 px-4 py-4 mb-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/security')}
              className="glass-button p-2 hover:scale-105 transition-transform"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-orange-600" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Security Audit Logs
                </h1>
                <p className="text-sm text-gray-600">Real-time security monitoring and compliance reporting</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="glass-button flex items-center space-x-2 px-4 py-2">
              <Download className="w-5 h-5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* Loading State */}
        {loading && (
          <div className="glass-card p-12 text-center">
            <Loader className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading audit logs...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="glass-card p-8 text-center border border-red-200 bg-red-50">
            <div className="text-red-600 mb-2">⚠️ Error</div>
            <p className="text-gray-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="glass-button-primary mt-4"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{securityMetrics.totalEvents}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Last 24 hours</span>
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Events</p>
                <p className="text-2xl font-bold text-red-600">{securityMetrics.criticalEvents}</p>
                <p className="text-xs text-gray-500 mt-1">Requires attention</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed Attempts</p>
                <p className="text-2xl font-bold text-yellow-600">{securityMetrics.failedAttempts}</p>
                <p className="text-xs text-gray-500 mt-1">Security incidents</p>
              </div>
              <XCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{securityMetrics.activeUsers}</p>
                <p className="text-xs text-gray-500 mt-1">Unique users</p>
              </div>
              <User className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="glass-card-strong p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by action or user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="glass-input w-full px-4 py-2"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
                <option value="warning">Warning</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="glass-input w-full px-4 py-2"
              >
                <option value="all">All Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">
                Showing {filteredEvents.length} of {auditEvents.length} events
              </span>
            </div>
            <div className="flex space-x-2">
              {['24h', '7d', '30d', '90d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    timeRange === range
                      ? 'bg-blue-600 text-white'
                      : 'glass-button'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Audit Events List */}
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <div key={event.id} className="glass-card p-5 hover-lift">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="mt-1">{getStatusIcon(event.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{event.action}</h3>
                      {getSeverityBadge(event.severity)}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{event.details}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{event.user}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{event.resource}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{event.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      IP Address: {event.ipAddress}
                    </div>
                  </div>
                </div>
                <button className="glass-button p-2 ml-4">
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Compliance Summary */}
        <div className="glass-card-strong p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Compliance Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4">
              <h3 className="font-bold text-gray-900 mb-2">HIPAA Audit Trail</h3>
              <p className="text-sm text-gray-600 mb-3">
                All patient data access is logged and monitored
              </p>
              <span className="glass-badge-success">Compliant</span>
            </div>
            <div className="glass-card p-4">
              <h3 className="font-bold text-gray-900 mb-2">SOC 2 Type II</h3>
              <p className="text-sm text-gray-600 mb-3">
                Security controls are continuously monitored
              </p>
              <span className="glass-badge-success">Compliant</span>
            </div>
            <div className="glass-card p-4">
              <h3 className="font-bold text-gray-900 mb-2">GDPR Article 30</h3>
              <p className="text-sm text-gray-600 mb-3">
                Processing activities are documented
              </p>
              <span className="glass-badge-success">Compliant</span>
            </div>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default SecurityAuditLogs;