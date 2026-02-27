export type DiscoveryDomain =
  | 'physical'
  | 'mental'
  | 'sleep'
  | 'nutrition'
  | 'environment'
  | 'social';

export interface DiscoveryTimelineEvent {
  id: string;
  date: string;
  title: string;
  domain: DiscoveryDomain;
  intensity: number;
  notes: string;
  tags: string[];
}

export type HypothesisStatus = 'exploring' | 'supported' | 'challenged' | 'parked';

export interface DiscoveryHypothesis {
  id: string;
  title: string;
  description: string;
  status: HypothesisStatus;
  confidence: number;
  linkedEvidenceIds: string[];
  nextStep: string;
  updatedAt: string;
}

export type EvidenceType =
  | 'observation'
  | 'lab'
  | 'article'
  | 'conversation'
  | 'experiment';

export interface DiscoveryEvidence {
  id: string;
  title: string;
  type: EvidenceType;
  source: string;
  date: string;
  summary: string;
  reliability: number;
  hypothesisIds: string[];
}

export interface DiscoveryJournalEntry {
  id: string;
  date: string;
  mood: number;
  reflection: string;
  signals: string[];
  questions: string;
  nextAction: string;
}

interface DiscoveryDataStore {
  timeline: DiscoveryTimelineEvent[];
  hypotheses: DiscoveryHypothesis[];
  evidence: DiscoveryEvidence[];
  journal: DiscoveryJournalEntry[];
}

const STORAGE_KEY = 'diagnosticox:self_discovery:v1';

const DEFAULT_STORE: DiscoveryDataStore = {
  timeline: [
    {
      id: 'timeline-1',
      date: '2026-02-10',
      title: 'Energy crash after afternoon meals',
      domain: 'nutrition',
      intensity: 7,
      notes: 'Most obvious after high-carb lunches.',
      tags: ['energy', 'meal-response'],
    },
    {
      id: 'timeline-2',
      date: '2026-02-14',
      title: 'Improved focus after 30-minute walk',
      domain: 'physical',
      intensity: 6,
      notes: 'Clear focus window lasted around 90 minutes.',
      tags: ['movement', 'focus'],
    },
  ],
  hypotheses: [
    {
      id: 'hyp-1',
      title: 'Meal composition is driving afternoon fatigue',
      description:
        'Fatigue appears stronger when lunch is refined carbohydrate-heavy and lower in protein/fiber.',
      status: 'exploring',
      confidence: 62,
      linkedEvidenceIds: ['ev-1'],
      nextStep: 'Run a 7-day protein-first lunch trial and compare post-meal energy.',
      updatedAt: '2026-02-20',
    },
  ],
  evidence: [
    {
      id: 'ev-1',
      title: 'Two-week energy and meal tracking log',
      type: 'observation',
      source: 'Personal journal',
      date: '2026-02-20',
      summary:
        'Lower energy ratings mostly clustered after pasta/sandwich lunches; better ratings with protein + vegetables.',
      reliability: 3,
      hypothesisIds: ['hyp-1'],
    },
  ],
  journal: [
    {
      id: 'journal-1',
      date: '2026-02-22',
      mood: 6,
      reflection:
        'Pattern feels less random now. The challenge is keeping the tracking process simple enough to sustain.',
      signals: ['afternoon fatigue', 'improved focus after walk'],
      questions: 'Is sleep debt amplifying the lunch effect?',
      nextAction: 'Track sleep duration and sleep quality for 10 days.',
    },
  ],
};

const cloneStore = (store: DiscoveryDataStore): DiscoveryDataStore =>
  JSON.parse(JSON.stringify(store)) as DiscoveryDataStore;

const loadRawStore = (): DiscoveryDataStore => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STORE));
    return cloneStore(DEFAULT_STORE);
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DiscoveryDataStore>;
    return {
      timeline: Array.isArray(parsed.timeline) ? parsed.timeline : [],
      hypotheses: Array.isArray(parsed.hypotheses) ? parsed.hypotheses : [],
      evidence: Array.isArray(parsed.evidence) ? parsed.evidence : [],
      journal: Array.isArray(parsed.journal) ? parsed.journal : [],
    };
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STORE));
    return cloneStore(DEFAULT_STORE);
  }
};

const saveRawStore = (store: DiscoveryDataStore): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

const uid = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const selfDiscoveryStorage = {
  getAll(): DiscoveryDataStore {
    return loadRawStore();
  },

  getTimeline(): DiscoveryTimelineEvent[] {
    return loadRawStore()
      .timeline.slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addTimelineEvent(event: Omit<DiscoveryTimelineEvent, 'id'>): DiscoveryTimelineEvent {
    const store = loadRawStore();
    const created: DiscoveryTimelineEvent = { ...event, id: uid('timeline') };
    store.timeline.push(created);
    saveRawStore(store);
    return created;
  },

  getHypotheses(): DiscoveryHypothesis[] {
    return loadRawStore()
      .hypotheses.slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  addHypothesis(hypothesis: Omit<DiscoveryHypothesis, 'id' | 'updatedAt'>): DiscoveryHypothesis {
    const store = loadRawStore();
    const created: DiscoveryHypothesis = {
      ...hypothesis,
      id: uid('hyp'),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    store.hypotheses.push(created);
    saveRawStore(store);
    return created;
  },

  updateHypothesis(
    id: string,
    updates: Partial<Omit<DiscoveryHypothesis, 'id'>>
  ): DiscoveryHypothesis | null {
    const store = loadRawStore();
    const idx = store.hypotheses.findIndex((item) => item.id === id);
    if (idx === -1) return null;

    const next: DiscoveryHypothesis = {
      ...store.hypotheses[idx],
      ...updates,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    store.hypotheses[idx] = next;
    saveRawStore(store);
    return next;
  },

  getEvidence(): DiscoveryEvidence[] {
    return loadRawStore()
      .evidence.slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addEvidence(evidence: Omit<DiscoveryEvidence, 'id'>): DiscoveryEvidence {
    const store = loadRawStore();
    const created: DiscoveryEvidence = { ...evidence, id: uid('ev') };
    store.evidence.push(created);
    saveRawStore(store);
    return created;
  },

  getJournalEntries(): DiscoveryJournalEntry[] {
    return loadRawStore()
      .journal.slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addJournalEntry(entry: Omit<DiscoveryJournalEntry, 'id'>): DiscoveryJournalEntry {
    const store = loadRawStore();
    const created: DiscoveryJournalEntry = { ...entry, id: uid('journal') };
    store.journal.push(created);
    saveRawStore(store);
    return created;
  },

  getStats(): {
    timelineEvents: number;
    hypotheses: number;
    evidenceItems: number;
    journalEntries: number;
    activeHypotheses: number;
  } {
    const store = loadRawStore();
    return {
      timelineEvents: store.timeline.length,
      hypotheses: store.hypotheses.length,
      evidenceItems: store.evidence.length,
      journalEntries: store.journal.length,
      activeHypotheses: store.hypotheses.filter((h) => h.status === 'exploring').length,
    };
  },
};

