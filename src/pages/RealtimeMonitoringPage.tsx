import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Activity, Heart, Thermometer, Wind, Droplet,
  AlertTriangle, Play, Pause, Settings, RefreshCw, TrendingUp,
  TrendingDown, CheckCircle, X, Bell
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  realtimeMonitoringService,
  VitalSign,
  Alert,
  MonitoringThresholds,
} from '../services/realtimeMonitoringService';

interface RealtimeMonitoringPageProps {
  user: any;
}

export default function RealtimeMonitoringPage({ user }: RealtimeMonitoringPageProps) {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState<string>('patient-1');
  const [currentVitals, setCurrentVitals] = useState<VitalSign | null>(null);
  const [vitalHistory, setVitalHistory] = useState<VitalSign[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showThresholds, setShowThresholds] = useState(false);
  const [thresholds, setThresholds] = useState<MonitoringThresholds>(
    realtimeMonitoringService.getThresholds()
  );

  const patients = realtimeMonitoringService.getMonitoredPatients();

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = realtimeMonitoringService.subscribe((data) => {
      if (data.type === 'vital_update' && data.patientId === selectedPatient) {
        setCurrentVitals(data.vitals);
        // Reload history with current selected patient
        const history = realtimeMonitoringService.getVitalHistory(selectedPatient, 20);
        setVitalHistory(history);
      }
      
      if (data.type === 'critical_event') {
        // Refresh alerts on critical events
        const allAlerts = realtimeMonitoringService.getAlerts({
          patientId: selectedPatient,
          acknowledged: false,
        });
        setAlerts(allAlerts);
      }
    });

    // Load initial data for selected patient
    loadCurrentVitals();
    updateHistory();
    loadAlerts();

    return () => {
      unsubscribe();
    };
  }, [selectedPatient]);

  useEffect(() => {
    if (isMonitoring) {
      realtimeMonitoringService.startMonitoring();
    } else {
      realtimeMonitoringService.stopMonitoring();
    }
  }, [isMonitoring]);

  const loadCurrentVitals = () => {
    const vitals = realtimeMonitoringService.getCurrentVitals(selectedPatient);
    setCurrentVitals(vitals);
  };

  const updateHistory = () => {
    const history = realtimeMonitoringService.getVitalHistory(selectedPatient, 20);
    setVitalHistory(history);
  };

  const loadAlerts = () => {
    const allAlerts = realtimeMonitoringService.getAlerts({
      patientId: selectedPatient,
      acknowledged: false,
    });
    setAlerts(allAlerts);
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    realtimeMonitoringService.acknowledgeAlert(alertId);
    loadAlerts();
  };

  const handleClearAcknowledged = () => {
    realtimeMonitoringService.clearAcknowledgedAlerts();
    loadAlerts();
  };

  const handleSimulateCritical = () => {
    realtimeMonitoringService.simulateCriticalEvent(selectedPatient);
    setTimeout(() => {
      loadCurrentVitals();
      updateHistory();
      loadAlerts();
    }, 100);
  };

  const getVitalStatus = (value: number, thresholdKey: keyof MonitoringThresholds) => {
    const threshold = thresholds[thresholdKey];
    if (value < threshold.critical.min || value > threshold.critical.max) {
      return { status: 'critical', color: 'text-red-600', bg: 'bg-red-100' };
    }
    if (value < threshold.min || value > threshold.max) {
      return { status: 'warning', color: 'text-orange-600', bg: 'bg-orange-100' };
    }
    return { status: 'normal', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const getTrend = (history: VitalSign[], key: keyof VitalSign) => {
    if (history.length < 2) return null;
    const recent = history.slice(-5).map((v) => v[key] as number);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const current = recent[recent.length - 1];
    if (current > avg * 1.05) return 'up';
    if (current < avg * 0.95) return 'down';
    return 'stable';
  };

  const renderVitalCard = (
    title: string,
    value: number | undefined,
    unit: string,
    Icon: any,
    thresholdKey: keyof MonitoringThresholds,
    historyKey: keyof VitalSign
  ) => {
    if (value === undefined) return null;
    
    const status = getVitalStatus(value, thresholdKey);
    const trend = getTrend(vitalHistory, historyKey);

    return (
      <div className={`glass-card p-6 hover-lift ${status.bg} bg-opacity-20`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`glass-card-subtle p-3 rounded-xl ${status.color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <div className="flex items-baseline gap-2">
                <p className={`text-3xl font-bold ${status.color}`}>
                  {typeof value === 'number' ? value.toFixed(title.includes('Temperature') ? 1 : 0) : value}
                </p>
                <span className="text-sm text-gray-600">{unit}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {trend === 'up' && <TrendingUp className="h-5 w-5 text-red-600" />}
            {trend === 'down' && <TrendingDown className="h-5 w-5 text-blue-600" />}
            {trend === 'stable' && <Activity className="h-5 w-5 text-green-600" />}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
              {status.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Mini chart */}
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={vitalHistory.slice(-10).map((v, i) => ({ index: i, value: v[historyKey] }))}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={status.status === 'critical' ? '#dc2626' : status.status === 'warning' ? '#ea580c' : '#10b981'}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const selectedPatientData = patients.find((p) => p.id === selectedPatient);

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
                <div className="glass-card-strong p-3 rounded-2xl relative">
                  <Activity className="h-8 w-8 text-indigo-600" />
                  {isMonitoring && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse"></span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Real-Time Monitoring
                  </h1>
                  <p className="text-sm text-gray-600">
                    Live vital signs and patient monitoring
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={`${
                  isMonitoring ? 'glass-button-primary' : 'glass-button'
                } flex items-center gap-2`}
              >
                {isMonitoring ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start
                  </>
                )}
              </button>
              <button
                onClick={handleSimulateCritical}
                className="glass-button flex items-center gap-2 text-red-600"
              >
                <AlertTriangle className="h-4 w-4" />
                Simulate Critical
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Patient Selector */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium text-gray-700">Monitoring:</p>
            <div className="flex gap-2">
              {patients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient.id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedPatient === patient.id
                      ? 'bg-indigo-600 text-white'
                      : 'glass-card-subtle hover:glass-card text-gray-700'
                  }`}
                >
                  {patient.name}
                </button>
              ))}
            </div>
            {currentVitals && (
              <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
                <RefreshCw className="h-4 w-4" />
                Last update: {new Date(currentVitals.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Critical Alerts Banner */}
        {alerts.filter((a) => a.severity === 'critical').length > 0 && (
          <div className="glass-card p-4 bg-red-50 border-2 border-red-300">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 animate-pulse" />
              <div className="flex-1">
                <p className="font-semibold text-red-900">CRITICAL ALERT</p>
                <p className="text-sm text-red-700">
                  {alerts.filter((a) => a.severity === 'critical').length} critical vital sign alerts require immediate attention
                </p>
              </div>
              <button
                onClick={() => navigate('/notifications')}
                className="bg-red-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-red-700 transition-all"
              >
                View Alerts
              </button>
            </div>
          </div>
        )}

        {/* Vital Signs Grid */}
        {currentVitals && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderVitalCard(
              'Heart Rate',
              currentVitals.heartRate,
              'bpm',
              Heart,
              'heartRate',
              'heartRate'
            )}
            {renderVitalCard(
              'Blood Pressure',
              currentVitals.bloodPressureSystolic,
              `/${currentVitals.bloodPressureDiastolic} mmHg`,
              Activity,
              'bloodPressureSystolic',
              'bloodPressureSystolic'
            )}
            {renderVitalCard(
              'Temperature',
              currentVitals.temperature,
              '°C',
              Thermometer,
              'temperature',
              'temperature'
            )}
            {renderVitalCard(
              'Oxygen Saturation',
              currentVitals.oxygenSaturation,
              '%',
              Wind,
              'oxygenSaturation',
              'oxygenSaturation'
            )}
            {renderVitalCard(
              'Respiratory Rate',
              currentVitals.respiratoryRate,
              'breaths/min',
              Activity,
              'respiratoryRate',
              'respiratoryRate'
            )}
            {currentVitals.glucoseLevel && (
              <div className="glass-card p-6 hover-lift">
                <div className="flex items-center gap-3 mb-4">
                  <div className="glass-card-subtle p-3 rounded-xl text-purple-600">
                    <Droplet className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Glucose Level</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-purple-600">{currentVitals.glucoseLevel}</p>
                      <span className="text-sm text-gray-600">mg/dL</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Active Alerts ({alerts.length})
                </h3>
              </div>
              <button
                onClick={handleClearAcknowledged}
                className="glass-button text-sm"
              >
                Clear Acknowledged
              </button>
            </div>

            <div className="space-y-3">
              {alerts.slice(0, 10).map((alert) => (
                <div
                  key={alert.id}
                  className={`glass-card-subtle p-4 rounded-xl ${
                    alert.severity === 'critical' ? 'bg-red-50' : 'bg-orange-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <AlertTriangle
                      className={`h-5 w-5 ${
                        alert.severity === 'critical' ? 'text-red-600' : 'text-orange-600'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{alert.vitalType} Alert</p>
                          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              alert.severity === 'critical'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {alert.severity.toUpperCase()}
                          </span>
                          <button
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="glass-card-subtle p-1.5 rounded-lg hover:bg-green-100 text-green-600"
                            title="Acknowledge"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vital Signs History Chart */}
        {vitalHistory.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vital Signs Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitalHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    stroke="#6b7280"
                  />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="heartRate"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Heart Rate"
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="oxygenSaturation"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="SpO2"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
