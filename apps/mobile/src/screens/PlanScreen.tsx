import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { Beaker, TrendingUp, Calendar, Info } from 'lucide-react-native';

export default function PlanScreen() {
  const activeTrials = [
    { id: '1', name: 'ICS Trial for Chronic Cough', intervention: 'Inhaled corticosteroid', progress: 'Day 12 of 30' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Care Plan</Text>
        <Text style={styles.subtitle}>Current trials & interventions</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Beaker size={20} color="#4F46E5" />
          <Text style={styles.sectionTitle}>Active Treatment Trials</Text>
        </View>

        {activeTrials.map(trial => (
          <View key={trial.id} style={styles.trialCard}>
            <Text style={styles.trialName}>{trial.name}</Text>
            <Text style={styles.intervention}>{trial.intervention}</Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '40%' }]} />
              </View>
              <Text style={styles.progressText}>{trial.progress}</Text>
            </View>

            <TouchableOpacity style={styles.infoButton}>
              <Info size={16} color="#4F46E5" />
              <Text style={styles.infoButtonText}>View Success Criteria</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={20} color="#10B981" />
          <Text style={styles.sectionTitle}>Metrics Being Tracked</Text>
        </View>
        
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricName}>Pain NRS</Text>
            <Text style={styles.metricTarget}>Target: {'<'} 3</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricName}>Sleep Duration</Text>
            <Text style={styles.metricTarget}>Target: 7+ hrs</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
  },
  trialCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  trialName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  intervention: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
  },
  progressText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    fontWeight: 'bold',
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    backgroundColor: '#EEF2FF',
    padding: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  infoButtonText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: 'bold',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  metricName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  metricTarget: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
});
