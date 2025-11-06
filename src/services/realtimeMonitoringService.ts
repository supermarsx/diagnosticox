// Real-Time Monitoring Service - Simulated vital signs monitoring
export interface VitalSign {
  id: string;
  patientId: string;
  patientName: string;
  timestamp: string;
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  temperature: number;
  oxygenSaturation: number;
  respiratoryRate: number;
  glucoseLevel?: number;
}

export interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  vitalType: string;
  value: number;
  threshold: number;
  severity: 'warning' | 'critical';
  timestamp: string;
  acknowledged: boolean;
  message: string;
}

export interface MonitoringThresholds {
  heartRate: { min: number; max: number; critical: { min: number; max: number } };
  bloodPressureSystolic: { min: number; max: number; critical: { min: number; max: number } };
  bloodPressureDiastolic: { min: number; max: number; critical: { min: number; max: number } };
  temperature: { min: number; max: number; critical: { min: number; max: number } };
  oxygenSaturation: { min: number; max: number; critical: { min: number; max: number } };
  respiratoryRate: { min: number; max: number; critical: { min: number; max: number } };
}

class RealtimeMonitoringService {
  private vitalSigns: Map<string, VitalSign[]> = new Map();
  private alerts: Alert[] = [];
  private listeners: Set<(data: any) => void> = new Set();
  private monitoringActive: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  private thresholds: MonitoringThresholds = {
    heartRate: { min: 60, max: 100, critical: { min: 40, max: 140 } },
    bloodPressureSystolic: { min: 90, max: 140, critical: { min: 70, max: 180 } },
    bloodPressureDiastolic: { min: 60, max: 90, critical: { min: 40, max: 110 } },
    temperature: { min: 36.1, max: 37.2, critical: { min: 35.0, max: 39.0 } },
    oxygenSaturation: { min: 95, max: 100, critical: { min: 88, max: 100 } },
    respiratoryRate: { min: 12, max: 20, critical: { min: 8, max: 30 } },
  };

  private patients = [
    { id: 'patient-1', name: 'John Doe' },
    { id: 'patient-2', name: 'Sarah Johnson' },
  ];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize with some baseline vital signs
    this.patients.forEach((patient) => {
      const baselineVitals = this.generateVitalSigns(patient.id, patient.name, true);
      this.vitalSigns.set(patient.id, [baselineVitals]);
    });
  }

  private generateVitalSigns(patientId: string, patientName: string, baseline: boolean = false): VitalSign {
    const existing = this.vitalSigns.get(patientId);
    const lastVitals = existing && existing.length > 0 ? existing[existing.length - 1] : null;

    // Generate realistic variations
    const vary = (base: number, range: number, trend: number = 0) => {
      if (baseline) return base;
      const variation = (Math.random() - 0.5) * range;
      return Math.max(0, base + variation + trend);
    };

    // Patient-specific baseline values
    const baselines = {
      'patient-1': {
        // John Doe - slightly elevated vitals
        heartRate: 78,
        bpSystolic: 128,
        bpDiastolic: 82,
        temperature: 37.0,
        spo2: 97,
        respRate: 16,
      },
      'patient-2': {
        // Sarah Johnson - normal vitals
        heartRate: 72,
        bpSystolic: 118,
        bpDiastolic: 76,
        temperature: 36.8,
        spo2: 98,
        respRate: 14,
      },
    };

    const patientBaseline = baselines[patientId as keyof typeof baselines] || baselines['patient-1'];

    return {
      id: Date.now().toString() + Math.random(),
      patientId,
      patientName,
      timestamp: new Date().toISOString(),
      heartRate: Math.round(
        lastVitals ? vary(lastVitals.heartRate, 5, (Math.random() - 0.5) * 2) : patientBaseline.heartRate
      ),
      bloodPressureSystolic: Math.round(
        lastVitals ? vary(lastVitals.bloodPressureSystolic, 8, (Math.random() - 0.5) * 3) : patientBaseline.bpSystolic
      ),
      bloodPressureDiastolic: Math.round(
        lastVitals ? vary(lastVitals.bloodPressureDiastolic, 5, (Math.random() - 0.5) * 2) : patientBaseline.bpDiastolic
      ),
      temperature: Number(
        (lastVitals ? vary(lastVitals.temperature, 0.3, (Math.random() - 0.5) * 0.1) : patientBaseline.temperature).toFixed(1)
      ),
      oxygenSaturation: Math.round(
        lastVitals ? Math.min(100, vary(lastVitals.oxygenSaturation, 2, (Math.random() - 0.5) * 0.5)) : patientBaseline.spo2
      ),
      respiratoryRate: Math.round(
        lastVitals ? vary(lastVitals.respiratoryRate, 3, (Math.random() - 0.5)) : patientBaseline.respRate
      ),
      glucoseLevel: Math.round(90 + Math.random() * 40),
    };
  }

  private checkThresholds(vital: VitalSign) {
    const checks = [
      {
        type: 'Heart Rate',
        value: vital.heartRate,
        thresholds: this.thresholds.heartRate,
        unit: 'bpm',
      },
      {
        type: 'Systolic BP',
        value: vital.bloodPressureSystolic,
        thresholds: this.thresholds.bloodPressureSystolic,
        unit: 'mmHg',
      },
      {
        type: 'Diastolic BP',
        value: vital.bloodPressureDiastolic,
        thresholds: this.thresholds.bloodPressureDiastolic,
        unit: 'mmHg',
      },
      {
        type: 'Temperature',
        value: vital.temperature,
        thresholds: this.thresholds.temperature,
        unit: '°C',
      },
      {
        type: 'Oxygen Saturation',
        value: vital.oxygenSaturation,
        thresholds: this.thresholds.oxygenSaturation,
        unit: '%',
      },
      {
        type: 'Respiratory Rate',
        value: vital.respiratoryRate,
        thresholds: this.thresholds.respiratoryRate,
        unit: 'breaths/min',
      },
    ];

    checks.forEach((check) => {
      let severity: 'warning' | 'critical' | null = null;
      let thresholdValue: number;

      if (check.value < check.thresholds.critical.min || check.value > check.thresholds.critical.max) {
        severity = 'critical';
        thresholdValue = check.value < check.thresholds.critical.min ? check.thresholds.critical.min : check.thresholds.critical.max;
      } else if (check.value < check.thresholds.min || check.value > check.thresholds.max) {
        severity = 'warning';
        thresholdValue = check.value < check.thresholds.min ? check.thresholds.min : check.thresholds.max;
      }

      if (severity) {
        const alert: Alert = {
          id: Date.now().toString() + Math.random(),
          patientId: vital.patientId,
          patientName: vital.patientName,
          vitalType: check.type,
          value: check.value,
          threshold: thresholdValue!,
          severity,
          timestamp: vital.timestamp,
          acknowledged: false,
          message: `${check.type} ${check.value < thresholdValue! ? 'below' : 'above'} ${severity} threshold: ${check.value} ${check.unit}`,
        };

        this.alerts.unshift(alert);

        // Limit alerts to last 100
        if (this.alerts.length > 100) {
          this.alerts = this.alerts.slice(0, 100);
        }
      }
    });
  }

  // Start real-time monitoring
  startMonitoring() {
    if (this.monitoringActive) return;

    console.log('[RealtimeMonitoring] Starting vital signs monitoring...');
    this.monitoringActive = true;

    // Update vitals every 3 seconds
    this.intervalId = setInterval(() => {
      this.patients.forEach((patient) => {
        const newVitals = this.generateVitalSigns(patient.id, patient.name);
        
        const patientVitals = this.vitalSigns.get(patient.id) || [];
        patientVitals.push(newVitals);

        // Keep last 100 readings
        if (patientVitals.length > 100) {
          patientVitals.shift();
        }

        this.vitalSigns.set(patient.id, patientVitals);

        // Check for alerts
        this.checkThresholds(newVitals);

        // Notify listeners
        this.notifyListeners({
          type: 'vital_update',
          patientId: patient.id,
          vitals: newVitals,
        });
      });
    }, 3000);
  }

  // Stop monitoring
  stopMonitoring() {
    if (!this.monitoringActive) return;

    console.log('[RealtimeMonitoring] Stopping vital signs monitoring...');
    this.monitoringActive = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Subscribe to real-time updates
  subscribe(callback: (data: any) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(data: any) {
    this.listeners.forEach((callback) => callback(data));
  }

  // Get current vital signs for a patient
  getCurrentVitals(patientId: string): VitalSign | null {
    const vitals = this.vitalSigns.get(patientId);
    return vitals && vitals.length > 0 ? vitals[vitals.length - 1] : null;
  }

  // Get vital signs history for a patient
  getVitalHistory(patientId: string, limit: number = 50): VitalSign[] {
    const vitals = this.vitalSigns.get(patientId) || [];
    return vitals.slice(-limit);
  }

  // Get all patients being monitored
  getMonitoredPatients() {
    return this.patients.map((p) => ({
      ...p,
      currentVitals: this.getCurrentVitals(p.id),
    }));
  }

  // Get alerts
  getAlerts(filter?: { patientId?: string; acknowledged?: boolean; severity?: string }): Alert[] {
    let filtered = this.alerts;

    if (filter?.patientId) {
      filtered = filtered.filter((a) => a.patientId === filter.patientId);
    }

    if (filter?.acknowledged !== undefined) {
      filtered = filtered.filter((a) => a.acknowledged === filter.acknowledged);
    }

    if (filter?.severity) {
      filtered = filtered.filter((a) => a.severity === filter.severity);
    }

    return filtered;
  }

  // Acknowledge alert
  acknowledgeAlert(alertId: string) {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.notifyListeners({
        type: 'alert_acknowledged',
        alertId,
      });
    }
  }

  // Clear acknowledged alerts
  clearAcknowledgedAlerts() {
    this.alerts = this.alerts.filter((a) => !a.acknowledged);
  }

  // Update thresholds
  updateThresholds(updates: Partial<MonitoringThresholds>) {
    this.thresholds = { ...this.thresholds, ...updates };
  }

  // Get thresholds
  getThresholds(): MonitoringThresholds {
    return { ...this.thresholds };
  }

  // Simulate critical event (for demo)
  simulateCriticalEvent(patientId: string) {
    const patient = this.patients.find((p) => p.id === patientId);
    if (!patient) return;

    const criticalVitals: VitalSign = {
      id: Date.now().toString(),
      patientId: patient.id,
      patientName: patient.name,
      timestamp: new Date().toISOString(),
      heartRate: 155, // Critical high
      bloodPressureSystolic: 185, // Critical high
      bloodPressureDiastolic: 115, // Critical high
      temperature: 38.9, // High fever
      oxygenSaturation: 89, // Below critical
      respiratoryRate: 28, // Elevated
    };

    const patientVitals = this.vitalSigns.get(patientId) || [];
    patientVitals.push(criticalVitals);
    this.vitalSigns.set(patientId, patientVitals);

    this.checkThresholds(criticalVitals);

    this.notifyListeners({
      type: 'critical_event',
      patientId,
      vitals: criticalVitals,
    });
  }

  // Is monitoring active
  isActive(): boolean {
    return this.monitoringActive;
  }
}

export const realtimeMonitoringService = new RealtimeMonitoringService();