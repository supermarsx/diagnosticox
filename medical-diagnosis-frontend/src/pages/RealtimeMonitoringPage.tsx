import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Heart, Thermometer, Activity, Wind, Droplets, AlertTriangle, Play, Pause, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { realtimeMonitoringService } from '@/services/realtimeMonitoringService';
import type { VitalSign, Patient, ThresholdAlert } from '@/types';

interface MonitoringSession {
  id: string;
  patientId: string;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  vitalSigns: VitalSign[];
}

interface Thresholds {
  heartRate: { min: number; max: number };
  bloodPressure: { systolicMin: number; systolicMax: number; diastolicMin: number; diastolicMax: number };
  temperature: { min: number; max: number };
  respiratoryRate: { min: number; max: number };
  oxygenSaturation: { min: number; max: number };
}

const DEFAULT_THRESHOLDS: Thresholds = {
  heartRate: { min: 60, max: 100 },
  bloodPressure: { systolicMin: 90, systolicMax: 140, diastolicMin: 60, diastolicMax: 90 },
  temperature: { min: 36.0, max: 37.5 },
  respiratoryRate: { min: 12, max: 20 },
  oxygenSaturation: { min: 95, max: 100 }
};

export default function RealtimeMonitoringPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [monitoringSession, setMonitoringSession] = useState<MonitoringSession | null>(null);
  const [currentVitals, setCurrentVitals] = useState<VitalSign | null>(null);
  const [vitalHistory, setVitalHistory] = useState<VitalSign[]>([]);
  const [alerts, setAlerts] = useState<ThresholdAlert[]>([]);
  const [thresholds, setThresholds] = useState<Thresholds>(DEFAULT_THRESHOLDS);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    loadPatients();
    return () => {
      disconnectWebSocket();
    };
  }, []);

  useEffect(() => {
    if (isMonitoring && selectedPatient) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }
  }, [isMonitoring, selectedPatient]);

  const loadPatients = async () => {
    try {
      const patientsData = await realtimeMonitoringService.getPatients();
      setPatients(patientsData);
    } catch (error) {
      console.error('Failed to load patients:', error);
      toast({
        title: 'Error',
        description: 'Failed to load patients',
        variant: 'destructive'
      });
    }
  };

  const connectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    setConnectionStatus('connecting');
    
    try {
      const ws = new WebSocket(realtimeMonitoringService.getWebSocketUrl(selectedPatient));
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');
        toast({
          title: 'Connected',
          description: 'Real-time monitoring connected'
        });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'vital_sign') {
            const vitalSign: VitalSign = data.payload;
            setCurrentVitals(vitalSign);
            setVitalHistory(prev => {
              const updated = [...prev, vitalSign];
              // Keep only last 50 readings for performance
              return updated.slice(-50);
            });
            
            // Check for threshold violations
            checkThresholds(vitalSign);
          } else if (data.type === 'alert') {
            const alert: ThresholdAlert = data.payload;
            setAlerts(prev => [alert, ...prev.slice(0, 19)]); // Keep last 20 alerts
            
            toast({
              title: 'Alert',
              description: alert.message,
              variant: 'destructive'
            });
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnectionStatus('disconnected');
        if (isMonitoring) {
          toast({
            title: 'Disconnected',
            description: 'Real-time monitoring disconnected',
            variant: 'destructive'
          });
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to real-time monitoring',
          variant: 'destructive'
        });
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('disconnected');
      toast({
        title: 'Connection Error',
        description: 'Failed to create WebSocket connection',
        variant: 'destructive'
      });
    }
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionStatus('disconnected');
  };

  const startMonitoring = () => {
    if (!selectedPatient) {
      toast({
        title: 'Error',
        description: 'Please select a patient first',
        variant: 'destructive'
      });
      return;
    }

    const session: MonitoringSession = {
      id: `session_${Date.now()}`,
      patientId: selectedPatient,
      startTime: new Date(),
      isActive: true,
      vitalSigns: []
    };
    
    setMonitoringSession(session);
    setIsMonitoring(true);
    setVitalHistory([]);
    setAlerts([]);
  };

  const stopMonitoring = () => {
    if (monitoringSession) {
      const updatedSession = {
        ...monitoringSession,
        endTime: new Date(),
        isActive: false
      };
      setMonitoringSession(updatedSession);
    }
    
    setIsMonitoring(false);
    disconnectWebSocket();
  };

  const checkThresholds = (vital: VitalSign) => {
    const newAlerts: ThresholdAlert[] = [];

    // Check heart rate
    if (vital.heartRate < thresholds.heartRate.min || vital.heartRate > thresholds.heartRate.max) {
      newAlerts.push({
        id: `hr_${Date.now()}`,
        type: 'heart_rate',
        message: `Heart rate ${vital.heartRate} is outside normal range (${thresholds.heartRate.min}-${thresholds.heartRate.max} bpm)`,
        severity: 'warning',
        timestamp: new Date(),
        value: vital.heartRate,
        threshold: thresholds.heartRate
      });
    }

    // Check blood pressure
    if (vital.bloodPressure) {
      const { systolic, diastolic } = vital.bloodPressure;
      if (systolic < thresholds.bloodPressure.systolicMin || systolic > thresholds.bloodPressure.systolicMax ||
          diastolic < thresholds.bloodPressure.diastolicMin || diastolic > thresholds.bloodPressure.diastolicMax) {
        newAlerts.push({
          id: `bp_${Date.now()}`,
          type: 'blood_pressure',
          message: `Blood pressure ${systolic}/${diastolic} mmHg is outside normal range`,
          severity: 'warning',
          timestamp: new Date(),
          value: `${systolic}/${diastolic}`,
          threshold: thresholds.bloodPressure
        });
      }
    }

    // Check temperature
    if (vital.temperature < thresholds.temperature.min || vital.temperature > thresholds.temperature.max) {
      newAlerts.push({
        id: `temp_${Date.now()}`,
        type: 'temperature',
        message: `Temperature ${vital.temperature}°C is outside normal range (${thresholds.temperature.min}-${thresholds.temperature.max}°C)`,
        severity: 'warning',
        timestamp: new Date(),
        value: vital.temperature,
        threshold: thresholds.temperature
      });
    }

    // Check respiratory rate
    if (vital.respiratoryRate < thresholds.respiratoryRate.min || vital.respiratoryRate > thresholds.respiratoryRate.max) {
      newAlerts.push({
        id: `rr_${Date.now()}`,
        type: 'respiratory_rate',
        message: `Respiratory rate ${vital.respiratoryRate} bpm is outside normal range (${thresholds.respiratoryRate.min}-${thresholds.respiratoryRate.max} bpm)`,
        severity: 'warning',
        timestamp: new Date(),
        value: vital.respiratoryRate,
        threshold: thresholds.respiratoryRate
      });
    }

    // Check oxygen saturation
    if (vital.oxygenSaturation < thresholds.oxygenSaturation.min) {
      newAlerts.push({
        id: `o2_${Date.now()}`,
        type: 'oxygen_saturation',
        message: `Oxygen saturation ${vital.oxygenSaturation}% is below normal range (≥${thresholds.oxygenSaturation.min}%)`,
        severity: 'critical',
        timestamp: new Date(),
        value: vital.oxygenSaturation,
        threshold: thresholds.oxygenSaturation
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 20));
    }
  };

  const updateThreshold = (type: keyof Thresholds, field: string, value: number) => {
    setThresholds(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-500';
      case 'connecting': return 'text-yellow-500';
      default: return 'text-red-500';
    }
  };

  const formatChartData = () => {
    return vitalHistory.map((vital, index) => ({
      time: new Date(vital.timestamp).toLocaleTimeString(),
      heartRate: vital.heartRate,
      temperature: vital.temperature,
      respiratoryRate: vital.respiratoryRate,
      oxygenSaturation: vital.oxygenSaturation,
      systolic: vital.bloodPressure?.systolic || null,
      diastolic: vital.bloodPressure?.diastolic || null
    }));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Real-Time Monitoring</h1>
          <p className="text-muted-foreground mt-2">
            Monitor patient vital signs in real-time with threshold alerts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
            <div className={`w-2 h-2 rounded-full mr-2 ${getConnectionStatusColor()}`}></div>
            {connectionStatus}
          </Badge>
        </div>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoring Controls</CardTitle>
          <CardDescription>Select a patient and start real-time monitoring</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Patient</label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(patient => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} - {patient.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              {!isMonitoring ? (
                <Button onClick={startMonitoring} disabled={!selectedPatient}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Monitoring
                </Button>
              ) : (
                <Button onClick={stopMonitoring} variant="destructive">
                  <Square className="w-4 h-4 mr-2" />
                  Stop Monitoring
                </Button>
              )}
            </div>
          </div>
          
          {monitoringSession && (
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Session: {monitoringSession.id}</span>
              <span>Started: {monitoringSession.startTime.toLocaleTimeString()}</span>
              <span>Readings: {vitalHistory.length}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Current Vitals</TabsTrigger>
          <TabsTrigger value="history">Vital History</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Heart Rate */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
                <Heart className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentVitals?.heartRate || '--'}
                </div>
                <p className="text-xs text-muted-foreground">
                  bpm
                </p>
                {currentVitals && (
                  <div className={`text-xs ${
                    currentVitals.heartRate < thresholds.heartRate.min || currentVitals.heartRate > thresholds.heartRate.max
                      ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {currentVitals.heartRate < thresholds.heartRate.min || currentVitals.heartRate > thresholds.heartRate.max
                      ? 'Out of range' : 'Normal'
                    }
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Blood Pressure */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
                <Activity className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentVitals?.bloodPressure 
                    ? `${currentVitals.bloodPressure.systolic}/${currentVitals.bloodPressure.diastolic}`
                    : '--/--'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  mmHg
                </p>
                {currentVitals?.bloodPressure && (
                  <div className={`text-xs ${
                    (currentVitals.bloodPressure.systolic < thresholds.bloodPressure.systolicMin || 
                     currentVitals.bloodPressure.systolic > thresholds.bloodPressure.systolicMax ||
                     currentVitals.bloodPressure.diastolic < thresholds.bloodPressure.diastolicMin || 
                     currentVitals.bloodPressure.diastolic > thresholds.bloodPressure.diastolicMax)
                      ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {(currentVitals.bloodPressure.systolic < thresholds.bloodPressure.systolicMin || 
                      currentVitals.bloodPressure.systolic > thresholds.bloodPressure.systolicMax ||
                      currentVitals.bloodPressure.diastolic < thresholds.bloodPressure.diastolicMin || 
                      currentVitals.bloodPressure.diastolic > thresholds.bloodPressure.diastolicMax)
                      ? 'Out of range' : 'Normal'
                    }
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Temperature */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Temperature</CardTitle>
                <Thermometer className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentVitals?.temperature ? `${currentVitals.temperature}°C` : '--°C'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Celsius
                </p>
                {currentVitals && (
                  <div className={`text-xs ${
                    currentVitals.temperature < thresholds.temperature.min || currentVitals.temperature > thresholds.temperature.max
                      ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {currentVitals.temperature < thresholds.temperature.min || currentVitals.temperature > thresholds.temperature.max
                      ? 'Out of range' : 'Normal'
                    }
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Respiratory Rate */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Respiratory Rate</CardTitle>
                <Wind className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentVitals?.respiratoryRate || '--'}
                </div>
                <p className="text-xs text-muted-foreground">
                  breaths/min
                </p>
                {currentVitals && (
                  <div className={`text-xs ${
                    currentVitals.respiratoryRate < thresholds.respiratoryRate.min || currentVitals.respiratoryRate > thresholds.respiratoryRate.max
                      ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {currentVitals.respiratoryRate < thresholds.respiratoryRate.min || currentVitals.respiratoryRate > thresholds.respiratoryRate.max
                      ? 'Out of range' : 'Normal'
                    }
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Oxygen Saturation */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Oxygen Saturation</CardTitle>
                <Droplets className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentVitals?.oxygenSaturation ? `${currentVitals.oxygenSaturation}%` : '--%'}
                </div>
                <p className="text-xs text-muted-foreground">
                  SpO2
                </p>
                {currentVitals && (
                  <div className={`text-xs ${
                    currentVitals.oxygenSaturation < thresholds.oxygenSaturation.min
                      ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {currentVitals.oxygenSaturation < thresholds.oxygenSaturation.min
                      ? 'Low' : 'Normal'
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vital Signs History</CardTitle>
              <CardDescription>Historical chart of vital signs over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formatChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="heartRate" stroke="#ef4444" name="Heart Rate" strokeWidth={2} />
                    <Line type="monotone" dataKey="temperature" stroke="#f97316" name="Temperature" strokeWidth={2} />
                    <Line type="monotone" dataKey="respiratoryRate" stroke="#22c55e" name="Respiratory Rate" strokeWidth={2} />
                    <Line type="monotone" dataKey="oxygenSaturation" stroke="#3b82f6" name="Oxygen Saturation" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No alerts at this time</p>
                </CardContent>
              </Card>
            ) : (
              alerts.map(alert => (
                <Alert key={alert.id} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm text-muted-foreground">
                          {alert.timestamp.toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {alert.severity}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="thresholds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Threshold Configuration</CardTitle>
              <CardDescription>Configure alert thresholds for vital signs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Heart Rate Thresholds */}
              <div className="space-y-2">
                <h4 className="font-medium">Heart Rate (bpm)</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm">Minimum: {thresholds.heartRate.min}</label>
                    <Slider
                      value={[thresholds.heartRate.min]}
                      onValueChange={([value]) => updateThreshold('heartRate', 'min', value)}
                      min={30}
                      max={150}
                      step={1}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm">Maximum: {thresholds.heartRate.max}</label>
                    <Slider
                      value={[thresholds.heartRate.max]}
                      onValueChange={([value]) => updateThreshold('heartRate', 'max', value)}
                      min={30}
                      max={150}
                      step={1}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Blood Pressure Thresholds */}
              <div className="space-y-2">
                <h4 className="font-medium">Blood Pressure (mmHg)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm">Systolic Min: {thresholds.bloodPressure.systolicMin}</label>
                    <Slider
                      value={[thresholds.bloodPressure.systolicMin]}
                      onValueChange={([value]) => updateThreshold('bloodPressure', 'systolicMin', value)}
                      min={70}
                      max={200}
                      step={1}
                      className="mt-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Systolic Max: {thresholds.bloodPressure.systolicMax}</label>
                    <Slider
                      value={[thresholds.bloodPressure.systolicMax]}
                      onValueChange={([value]) => updateThreshold('bloodPressure', 'systolicMax', value)}
                      min={70}
                      max={200}
                      step={1}
                      className="mt-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Diastolic Min: {thresholds.bloodPressure.diastolicMin}</label>
                    <Slider
                      value={[thresholds.bloodPressure.diastolicMin]}
                      onValueChange={([value]) => updateThreshold('bloodPressure', 'diastolicMin', value)}
                      min={40}
                      max={120}
                      step={1}
                      className="mt-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Diastolic Max: {thresholds.bloodPressure.diastolicMax}</label>
                    <Slider
                      value={[thresholds.bloodPressure.diastolicMax]}
                      onValueChange={([value]) => updateThreshold('bloodPressure', 'diastolicMax', value)}
                      min={40}
                      max={120}
                      step={1}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Temperature Thresholds */}
              <div className="space-y-2">
                <h4 className="font-medium">Temperature (°C)</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm">Minimum: {thresholds.temperature.min}°C</label>
                    <Slider
                      value={[thresholds.temperature.min]}
                      onValueChange={([value]) => updateThreshold('temperature', 'min', value)}
                      min={30}
                      max={40}
                      step={0.1}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm">Maximum: {thresholds.temperature.max}°C</label>
                    <Slider
                      value={[thresholds.temperature.max]}
                      onValueChange={([value]) => updateThreshold('temperature', 'max', value)}
                      min={30}
                      max={40}
                      step={0.1}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Respiratory Rate Thresholds */}
              <div className="space-y-2">
                <h4 className="font-medium">Respiratory Rate (breaths/min)</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm">Minimum: {thresholds.respiratoryRate.min}</label>
                    <Slider
                      value={[thresholds.respiratoryRate.min]}
                      onValueChange={([value]) => updateThreshold('respiratoryRate', 'min', value)}
                      min={5}
                      max={40}
                      step={1}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm">Maximum: {thresholds.respiratoryRate.max}</label>
                    <Slider
                      value={[thresholds.respiratoryRate.max]}
                      onValueChange={([value]) => updateThreshold('respiratoryRate', 'max', value)}
                      min={5}
                      max={40}
                      step={1}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Oxygen Saturation Thresholds */}
              <div className="space-y-2">
                <h4 className="font-medium">Oxygen Saturation (%)</h4>
                <div>
                  <label className="text-sm">Minimum: {thresholds.oxygenSaturation.min}%</label>
                  <Slider
                    value={[thresholds.oxygenSaturation.min]}
                    onValueChange={([value]) => updateThreshold('oxygenSaturation', 'min', value)}
                    min={80}
                    max={100}
                    step={1}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}