import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Patient, Problem, Hypothesis, Trial, TimelineEvent, DiaryEntry } from '../types/medical';

interface MedicalDB extends DBSchema {
  patients: {
    key: string;
    value: Patient;
    indexes: { 'by-org': string };
  };
  problems: {
    key: string;
    value: Problem;
    indexes: { 'by-patient': string; 'by-status': string };
  };
  hypotheses: {
    key: string;
    value: Hypothesis;
    indexes: { 'by-problem': string };
  };
  trials: {
    key: string;
    value: Trial;
    indexes: { 'by-patient': string; 'by-status': string };
  };
  timeline_events: {
    key: string;
    value: TimelineEvent;
    indexes: { 'by-patient': string; 'by-date': string };
  };
  diary_entries: {
    key: string;
    value: DiaryEntry;
    indexes: { 'by-patient': string; 'by-date': string; 'by-type': string };
  };
  sync_queue: {
    key: number;
    value: { action: string; data: any; timestamp: number };
    indexes: { 'by-timestamp': number };
  };
}

class OfflineStorageService {
  private db: IDBPDatabase<MedicalDB> | null = null;
  private readonly DB_NAME = 'medical-diagnosis-db';
  private readonly DB_VERSION = 1;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<MedicalDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Patients store
        if (!db.objectStoreNames.contains('patients')) {
          const patientStore = db.createObjectStore('patients', { keyPath: 'id' });
          patientStore.createIndex('by-org', 'organization_id');
        }

        // Problems store
        if (!db.objectStoreNames.contains('problems')) {
          const problemStore = db.createObjectStore('problems', { keyPath: 'id' });
          problemStore.createIndex('by-patient', 'patient_id');
          problemStore.createIndex('by-status', 'status');
        }

        // Hypotheses store
        if (!db.objectStoreNames.contains('hypotheses')) {
          const hypothesisStore = db.createObjectStore('hypotheses', { keyPath: 'id' });
          hypothesisStore.createIndex('by-problem', 'problem_id');
        }

        // Trials store
        if (!db.objectStoreNames.contains('trials')) {
          const trialStore = db.createObjectStore('trials', { keyPath: 'id' });
          trialStore.createIndex('by-patient', 'patient_id');
          trialStore.createIndex('by-status', 'status');
        }

        // Timeline events store
        if (!db.objectStoreNames.contains('timeline_events')) {
          const timelineStore = db.createObjectStore('timeline_events', { keyPath: 'id' });
          timelineStore.createIndex('by-patient', 'patient_id');
          timelineStore.createIndex('by-date', 'event_date');
        }

        // Diary entries store
        if (!db.objectStoreNames.contains('diary_entries')) {
          const diaryStore = db.createObjectStore('diary_entries', { keyPath: 'id' });
          diaryStore.createIndex('by-patient', 'patient_id');
          diaryStore.createIndex('by-date', 'entry_date');
          diaryStore.createIndex('by-type', 'entry_type');
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'timestamp', autoIncrement: true });
          syncStore.createIndex('by-timestamp', 'timestamp');
        }
      },
    });
  }

  // Patients
  async savePatients(patients: Patient[]): Promise<void> {
    await this.init();
    const tx = this.db!.transaction('patients', 'readwrite');
    await Promise.all(patients.map(p => tx.store.put(p)));
    await tx.done;
  }

  async getPatients(): Promise<Patient[]> {
    await this.init();
    return this.db!.getAll('patients');
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    await this.init();
    return this.db!.get('patients', id);
  }

  // Problems
  async saveProblems(problems: Problem[]): Promise<void> {
    await this.init();
    const tx = this.db!.transaction('problems', 'readwrite');
    await Promise.all(problems.map(p => tx.store.put(p)));
    await tx.done;
  }

  async getProblemsByPatient(patientId: string): Promise<Problem[]> {
    await this.init();
    return this.db!.getAllFromIndex('problems', 'by-patient', patientId);
  }

  // Hypotheses
  async saveHypotheses(hypotheses: Hypothesis[]): Promise<void> {
    await this.init();
    const tx = this.db!.transaction('hypotheses', 'readwrite');
    await Promise.all(hypotheses.map(h => tx.store.put(h)));
    await tx.done;
  }

  async getHypothesesByProblem(problemId: string): Promise<Hypothesis[]> {
    await this.init();
    return this.db!.getAllFromIndex('hypotheses', 'by-problem', problemId);
  }

  // Trials
  async saveTrials(trials: Trial[]): Promise<void> {
    await this.init();
    const tx = this.db!.transaction('trials', 'readwrite');
    await Promise.all(trials.map(t => tx.store.put(t)));
    await tx.done;
  }

  async getTrialsByPatient(patientId: string): Promise<Trial[]> {
    await this.init();
    return this.db!.getAllFromIndex('trials', 'by-patient', patientId);
  }

  // Timeline Events
  async saveTimelineEvents(events: TimelineEvent[]): Promise<void> {
    await this.init();
    const tx = this.db!.transaction('timeline_events', 'readwrite');
    await Promise.all(events.map(e => tx.store.put(e)));
    await tx.done;
  }

  async getTimelineEventsByPatient(patientId: string): Promise<TimelineEvent[]> {
    await this.init();
    const events = await this.db!.getAllFromIndex('timeline_events', 'by-patient', patientId);
    return events.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  }

  // Diary Entries
  async saveDiaryEntries(entries: DiaryEntry[]): Promise<void> {
    await this.init();
    const tx = this.db!.transaction('diary_entries', 'readwrite');
    await Promise.all(entries.map(e => tx.store.put(e)));
    await tx.done;
  }

  async getDiaryEntriesByPatient(patientId: string): Promise<DiaryEntry[]> {
    await this.init();
    const entries = await this.db!.getAllFromIndex('diary_entries', 'by-patient', patientId);
    return entries.sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());
  }

  async addDiaryEntry(entry: DiaryEntry): Promise<void> {
    await this.init();
    await this.db!.put('diary_entries', entry);
    // Add to sync queue
    await this.addToSyncQueue('create_diary_entry', entry);
  }

  // Sync Queue
  async addToSyncQueue(action: string, data: any): Promise<void> {
    await this.init();
    await this.db!.add('sync_queue', {
      action,
      data,
      timestamp: Date.now(),
    });
  }

  async getSyncQueue(): Promise<Array<{ action: string; data: any; timestamp: number }>> {
    await this.init();
    return this.db!.getAll('sync_queue');
  }

  async clearSyncQueue(): Promise<void> {
    await this.init();
    await this.db!.clear('sync_queue');
  }

  // Clear all data
  async clearAll(): Promise<void> {
    await this.init();
    const stores = ['patients', 'problems', 'hypotheses', 'trials', 'timeline_events', 'diary_entries', 'sync_queue'];
    const tx = this.db!.transaction(stores as any, 'readwrite');
    await Promise.all(stores.map(store => tx.objectStore(store as any).clear()));
    await tx.done;
  }

  // Get sync status
  getSyncStatus(): { lastSync: string | null; pendingChanges: number } {
    const lastSync = localStorage.getItem('last_sync_time');
    return {
      lastSync,
      pendingChanges: 0, // Would be calculated from sync_queue
    };
  }

  // Update sync timestamp
  updateSyncTimestamp(): void {
    localStorage.setItem('last_sync_time', new Date().toISOString());
  }
}

export const offlineStorage = new OfflineStorageService();