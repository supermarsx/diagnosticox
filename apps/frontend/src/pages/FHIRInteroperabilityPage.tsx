/**
 * FHIR R4 Interoperability Page
 * 
 * Healthcare data exchange interface compliant with FHIR R4 standard.
 * Supports Patient, Observation, Condition, MedicationRequest, and DiagnosticReport resources.
 * 
 * @module FHIRInteroperabilityPage
 */

import { useState } from 'react';
import { 
  Database, User, Activity, FileText, Pill, 
  Download, Upload, CheckCircle, AlertCircle, Copy
} from 'lucide-react';
import { fhirService } from '../services/fhirService';
import type { 
  FHIRPatient, 
  FHIRObservation, 
  FHIRCondition, 
  FHIRMedicationRequest 
} from '../services/fhirService';

/**
 * Main FHIR interoperability page component
 */
export default function FHIRInteroperabilityPage() {
  const [activeTab, setActiveTab] = useState<'patient' | 'observation' | 'condition' | 'medication' | 'bundle'>('patient');
  const [fhirResource, setFhirResource] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Patient form state
  const [patientForm, setPatientForm] = useState({
    firstName: 'John',
    lastName: 'Doe',
    birthDate: '1980-05-15',
    gender: 'male' as 'male' | 'female' | 'other' | 'unknown',
    phone: '+1-555-0123',
    email: 'john.doe@example.com',
    addressLine: '123 Main St',
    city: 'Boston',
    state: 'MA',
    postalCode: '02101',
    country: 'USA'
  });

  // Observation form state
  const [observationForm, setObservationForm] = useState({
    patientId: 'patient-123',
    code: '8867-4',
    display: 'Heart rate',
    system: 'http://loinc.org',
    value: '72',
    unit: 'beats/minute'
  });

  // Condition form state
  const [conditionForm, setConditionForm] = useState({
    patientId: 'patient-123',
    code: '38341003',
    display: 'Hypertension',
    system: 'http://snomed.info/sct',
    severity: 'moderate' as 'mild' | 'moderate' | 'severe'
  });

  // Medication form state
  const [medicationForm, setMedicationForm] = useState({
    patientId: 'patient-123',
    medicationCode: '197361',
    medicationDisplay: 'Lisinopril 10 MG Oral Tablet',
    dosage: '10 mg',
    frequency: 'once daily',
    route: 'oral'
  });

  const handleCreatePatient = () => {
    try {
      const patient = fhirService.createPatient({
        name: {
          family: patientForm.lastName,
          given: [patientForm.firstName]
        },
        gender: patientForm.gender,
        birthDate: patientForm.birthDate
      });
      setFhirResource(patient);
      validateResource(patient);
    } catch (error) {
      console.error('Failed to create patient:', error);
      alert('Failed to create patient resource');
    }
  };

  const handleCreateObservation = () => {
    try {
      const observation = fhirService.createObservation({
        patientId: observationForm.patientId,
        code: observationForm.code,
        codeDisplay: observationForm.display,
        value: parseFloat(observationForm.value),
        unit: observationForm.unit,
        effectiveDateTime: new Date().toISOString()
      });
      setFhirResource(observation);
      validateResource(observation);
    } catch (error) {
      console.error('Failed to create observation:', error);
      alert('Failed to create observation resource');
    }
  };

  const handleCreateCondition = () => {
    try {
      const condition = fhirService.createCondition({
        patientId: conditionForm.patientId,
        code: conditionForm.code,
        codeDisplay: conditionForm.display,
        codeSystem: conditionForm.system === 'http://snomed.info/sct' ? 'SNOMED' : 'ICD-10',
        clinicalStatus: 'active'
      });
      setFhirResource(condition);
      validateResource(condition);
    } catch (error) {
      console.error('Failed to create condition:', error);
      alert('Failed to create condition resource');
    }
  };

  const handleCreateMedication = () => {
    try {
      const medication = fhirService.createMedicationRequest({
        patientId: medicationForm.patientId,
        medicationCode: medicationForm.medicationCode,
        medicationDisplay: medicationForm.medicationDisplay,
        dosage: medicationForm.dosage,
        frequency: medicationForm.frequency,
        route: medicationForm.route
      });
      setFhirResource(medication);
      validateResource(medication);
    } catch (error) {
      console.error('Failed to create medication:', error);
      alert('Failed to create medication request resource');
    }
  };

  const handleCreateBundle = () => {
    try {
      const patient = fhirService.createPatient({
        name: {
          family: patientForm.lastName,
          given: [patientForm.firstName]
        },
        gender: patientForm.gender,
        birthDate: patientForm.birthDate
      });
      const observation = fhirService.createObservation({
        patientId: patient.id || 'patient-123',
        code: '8867-4',
        codeDisplay: 'Heart rate',
        value: 72,
        unit: 'beats/minute',
        effectiveDateTime: new Date().toISOString()
      });
      const condition = fhirService.createCondition({
        patientId: patient.id || 'patient-123',
        code: '38341003',
        codeDisplay: 'Hypertension',
        codeSystem: 'SNOMED',
        clinicalStatus: 'active'
      });

      const bundle = fhirService.createBundle([patient, observation, condition]);
      setFhirResource(bundle);
      validateResource(bundle);
    } catch (error) {
      console.error('Failed to create bundle:', error);
      alert('Failed to create bundle resource');
    }
  };

  const validateResource = (resource: any) => {
    const result = fhirService.validateResource(resource);
    setValidationResult(result);
  };

  const handleCopyJSON = () => {
    if (fhirResource) {
      navigator.clipboard.writeText(JSON.stringify(fhirResource, null, 2));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleDownloadJSON = () => {
    if (fhirResource) {
      const dataStr = JSON.stringify(fhirResource, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `fhir-${fhirResource.resourceType}-${Date.now()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl">
              <Database className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FHIR R4 Interoperability</h1>
              <p className="text-sm text-gray-600 mt-1">
                Fast Healthcare Interoperability Resources - Create & Validate
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-6 flex-wrap">
            <button
              onClick={() => setActiveTab('patient')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'patient'
                  ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Patient
              </div>
            </button>
            <button
              onClick={() => setActiveTab('observation')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'observation'
                  ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Observation
              </div>
            </button>
            <button
              onClick={() => setActiveTab('condition')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'condition'
                  ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Condition
              </div>
            </button>
            <button
              onClick={() => setActiveTab('medication')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'medication'
                  ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4" />
                Medication
              </div>
            </button>
            <button
              onClick={() => setActiveTab('bundle')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'bundle'
                  ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Bundle
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Resource Configuration</h2>

              {/* Patient Form */}
              {activeTab === 'patient' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={patientForm.firstName}
                        onChange={(e) => setPatientForm({ ...patientForm, firstName: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={patientForm.lastName}
                        onChange={(e) => setPatientForm({ ...patientForm, lastName: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date</label>
                    <input
                      type="date"
                      value={patientForm.birthDate}
                      onChange={(e) => setPatientForm({ ...patientForm, birthDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      value={patientForm.gender}
                      onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value as any })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={patientForm.phone}
                        onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={patientForm.email}
                        onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleCreatePatient}
                    className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Create Patient Resource
                  </button>
                </div>
              )}

              {/* Observation Form */}
              {activeTab === 'observation' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Patient ID</label>
                    <input
                      type="text"
                      value={observationForm.patientId}
                      onChange={(e) => setObservationForm({ ...observationForm, patientId: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Observation Code (LOINC)</label>
                    <input
                      type="text"
                      value={observationForm.code}
                      onChange={(e) => setObservationForm({ ...observationForm, code: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 8867-4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                    <input
                      type="text"
                      value={observationForm.display}
                      onChange={(e) => setObservationForm({ ...observationForm, display: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Heart rate"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                      <input
                        type="number"
                        value={observationForm.value}
                        onChange={(e) => setObservationForm({ ...observationForm, value: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                      <input
                        type="text"
                        value={observationForm.unit}
                        onChange={(e) => setObservationForm({ ...observationForm, unit: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                        placeholder="e.g., beats/minute"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleCreateObservation}
                    className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Create Observation Resource
                  </button>
                </div>
              )}

              {/* Condition Form */}
              {activeTab === 'condition' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Patient ID</label>
                    <input
                      type="text"
                      value={conditionForm.patientId}
                      onChange={(e) => setConditionForm({ ...conditionForm, patientId: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Condition Code (SNOMED CT)</label>
                    <input
                      type="text"
                      value={conditionForm.code}
                      onChange={(e) => setConditionForm({ ...conditionForm, code: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 38341003"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                    <input
                      type="text"
                      value={conditionForm.display}
                      onChange={(e) => setConditionForm({ ...conditionForm, display: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Hypertension"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                    <select
                      value={conditionForm.severity}
                      onChange={(e) => setConditionForm({ ...conditionForm, severity: e.target.value as any })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>
                  <button
                    onClick={handleCreateCondition}
                    className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Create Condition Resource
                  </button>
                </div>
              )}

              {/* Medication Form */}
              {activeTab === 'medication' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Patient ID</label>
                    <input
                      type="text"
                      value={medicationForm.patientId}
                      onChange={(e) => setMedicationForm({ ...medicationForm, patientId: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medication Code (RxNorm)</label>
                    <input
                      type="text"
                      value={medicationForm.medicationCode}
                      onChange={(e) => setMedicationForm({ ...medicationForm, medicationCode: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 197361"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medication Name</label>
                    <input
                      type="text"
                      value={medicationForm.medicationDisplay}
                      onChange={(e) => setMedicationForm({ ...medicationForm, medicationDisplay: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Lisinopril 10 MG Oral Tablet"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
                    <input
                      type="text"
                      value={medicationForm.dosage}
                      onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 10 mg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                    <input
                      type="text"
                      value={medicationForm.frequency}
                      onChange={(e) => setMedicationForm({ ...medicationForm, frequency: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., once daily"
                    />
                  </div>
                  <button
                    onClick={handleCreateMedication}
                    className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Create Medication Resource
                  </button>
                </div>
              )}

              {/* Bundle Form */}
              {activeTab === 'bundle' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 mb-1">Bundle Resource</div>
                        <p className="text-sm text-gray-700">
                          Creates a FHIR Bundle containing Patient, Observation, and Condition resources.
                          Uses the patient form data as the base.
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleCreateBundle}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Create Bundle Resource
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Output Display */}
          <div className="space-y-6">
            {/* Validation Status */}
            {validationResult && (
              <div className={`rounded-2xl shadow-xl border p-6 ${
                validationResult.valid
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  {validationResult.valid ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  )}
                  <h3 className="font-semibold text-gray-900">
                    {validationResult.valid ? 'Valid FHIR Resource' : 'Validation Failed'}
                  </h3>
                </div>
                {!validationResult.valid && validationResult.errors.length > 0 && (
                  <div className="space-y-2">
                    {validationResult.errors.map((error: string, idx: number) => (
                      <div key={idx} className="text-sm text-red-700 flex items-start gap-2">
                        <span className="font-medium">•</span>
                        <span>{error}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FHIR Resource Output */}
            {fhirResource && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">FHIR Resource JSON</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyJSON}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all flex items-center gap-2"
                    >
                      {copySuccess ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownloadJSON}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(fhirResource, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
