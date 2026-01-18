import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert
} from 'react-native';
import { diaryService } from '../services/api';

export default function DiaryScreen() {
  const [patientId, setPatientId] = useState('demo-patient-123'); // Demo ID
  const [entryType, setEntryType] = useState('symptom');
  const [loading, setLoading] = useState(false);

  // Form states
  const [symptomName, setSymptomName] = useState('');
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState('');
  const [measurementValue, setMeasurementValue] = useState('');
  const [measurementUnit, setMeasurementUnit] = useState('');

  const entryTypes = [
    { label: 'Symptom', value: 'symptom' },
    { label: 'Orthostatic (HR/BP)', value: 'orthostatic' },
    { label: 'Bristol Stool', value: 'bristol' },
    { label: 'Sleep Log', value: 'sleep' },
    { label: 'Pain (NRS)', value: 'pain' },
  ];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload: any = {
        patient_id: patientId,
        entry_type: entryType,
        notes,
        severity: entryType === 'symptom' || entryType === 'pain' ? severity : undefined,
        symptom_name: entryType === 'symptom' ? symptomName : entryType,
        measurement_value: measurementValue,
        measurement_unit: measurementUnit,
      };

      await diaryService.createEntry(payload);
      Alert.alert('Success', 'Diary entry recorded');
      // Reset
      setSymptomName('');
      setNotes('');
      setMeasurementValue('');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>New Diary Entry</Text>

      <View style={styles.typeContainer}>
        {entryTypes.map(t => (
          <TouchableOpacity 
            key={t.value}
            style={[styles.typeButton, entryType === t.value && styles.activeType]}
            onPress={() => setEntryType(t.value)}
          >
            <Text style={[styles.typeText, entryType === t.value && styles.activeTypeText]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.form}>
        {entryType === 'symptom' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Symptom Name</Text>
            <TextInput 
              style={styles.input} 
              value={symptomName}
              onChangeText={setSymptomName}
              placeholder="e.g. Cough, Dizziness"
            />
          </View>
        )}

        {(entryType === 'symptom' || entryType === 'pain') && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Severity (0-10): {severity}</Text>
            <View style={styles.scaleContainer}>
              {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                <TouchableOpacity 
                  key={n}
                  style={[styles.scaleButton, severity === n && styles.activeScale]}
                  onPress={() => setSeverity(n)}
                >
                  <Text style={[styles.scaleText, severity === n && styles.activeScaleText]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {entryType === 'orthostatic' && (
          <View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Measurement (e.g. "120/80 Lying, 100/60 Standing")</Text>
              <TextInput 
                style={styles.input} 
                value={measurementValue}
                onChangeText={setMeasurementValue}
                placeholder="Enter HR/BP readings"
              />
            </View>
          </View>
        )}

        {entryType === 'bristol' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bristol Type (1-7)</Text>
            <View style={styles.scaleContainer}>
              {[1,2,3,4,5,6,7].map(n => (
                <TouchableOpacity 
                  key={n}
                  style={[styles.scaleButton, parseInt(measurementValue) === n && styles.activeScale]}
                  onPress={() => setMeasurementValue(n.toString())}
                >
                  <Text style={[styles.scaleText, parseInt(measurementValue) === n && styles.activeScaleText]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes / Triggers</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
            placeholder="Anything else to note?"
          />
        </View>

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitText}>{loading ? 'Saving...' : 'Record Entry'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 20,
    marginTop: 40,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  activeType: {
    backgroundColor: '#4F46E5',
  },
  typeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748B',
  },
  activeTypeText: {
    color: '#FFFFFF',
  },
  form: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  scaleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  scaleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeScale: {
    backgroundColor: '#4F46E5',
  },
  scaleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748B',
  },
  activeScaleText: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
