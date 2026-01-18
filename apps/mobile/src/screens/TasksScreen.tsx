import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { CheckCircle2, Clock, Calendar, AlertCircle } from 'lucide-react-native';

export default function TasksScreen() {
  const tasks = [
    { id: '1', title: 'Morning Vital Signs', time: '08:00 AM', status: 'completed' },
    { id: '2', title: 'Bristol Stool Entry', time: '10:00 AM', status: 'pending' },
    { id: '3', title: 'Pain NRS Update', time: '02:00 PM', status: 'pending' },
    { id: '4', title: 'Evening Symptom Log', time: '08:00 PM', status: 'upcoming' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Tasks</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>1/4</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, {color: '#F59E0B'}]}>2</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      <View style={styles.taskList}>
        {tasks.map(task => (
          <TouchableOpacity key={task.id} style={styles.taskCard}>
            <View style={styles.taskInfo}>
              <View style={[styles.statusIndicator, 
                task.status === 'completed' ? styles.statusCompleted : 
                task.status === 'pending' ? styles.statusPending : styles.statusUpcoming
              ]} />
              <View>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View style={styles.timeContainer}>
                  <Clock size={12} color="#64748B" />
                  <Text style={styles.taskTime}>{task.time}</Text>
                </View>
              </View>
            </View>
            {task.status === 'completed' && <CheckCircle2 size={24} color="#10B981" />}
            {task.status === 'pending' && <AlertCircle size={24} color="#F59E0B" />}
          </TouchableOpacity>
        ))}
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
  date: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  taskList: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  statusCompleted: { backgroundColor: '#10B981' },
  statusPending: { backgroundColor: '#F59E0B' },
  statusUpcoming: { backgroundColor: '#E2E8F0' },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  taskTime: {
    fontSize: 12,
    color: '#64748B',
  },
});
