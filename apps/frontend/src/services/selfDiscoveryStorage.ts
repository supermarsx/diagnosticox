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

export type ProtocolStatus = 'planned' | 'active' | 'paused' | 'completed';

export interface DiscoveryProtocolCheckin {
  id: string;
  date: string;
  value: number;
  notes: string;
}

export interface DiscoveryProtocol {
  id: string;
  title: string;
  objective: string;
  hypothesisId?: string;
  metric: string;
  baseline: string;
  intervention: string;
  startDate: string;
  endDate: string;
  status: ProtocolStatus;
  checkins: DiscoveryProtocolCheckin[];
  createdAt: string;
  updatedAt: string;
}

export type DiscoveryReminderType = 'journal' | 'protocol' | 'evidence' | 'timeline';

export interface DiscoveryReminder {
  id: string;
  title: string;
  dueDate: string;
  type: DiscoveryReminderType;
  completed: boolean;
}

interface DiscoveryDataStoreV2 {
  version: 2;
  timeline: DiscoveryTimelineEvent[];
  hypotheses: DiscoveryHypothesis[];
  evidence: DiscoveryEvidence[];
  journal: DiscoveryJournalEntry[];
  protocols: DiscoveryProtocol[];
  reminders: DiscoveryReminder[];
}

type LegacyStoreV1 = {
  timeline?: DiscoveryTimelineEvent[];
  hypotheses?: DiscoveryHypothesis[];
  evidence?: DiscoveryEvidence[];
  journal?: DiscoveryJournalEntry[];
};

const STORAGE_KEY = 'diagnosticox:self_discovery:v2';
const LEGACY_STORAGE_KEY = 'diagnosticox:self_discovery:v1';

const DEFAULT_STORE: DiscoveryDataStoreV2 = {
  version: 2,
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
  protocols: [
    {
      id: 'protocol-1',
      title: 'Protein-first lunch protocol',
      objective: 'Reduce afternoon fatigue over 7 days',
      hypothesisId: 'hyp-1',
      metric: 'Afternoon energy score (0-10)',
      baseline: 'Average afternoon energy 4/10',
      intervention: 'Lunch must include protein + fiber before carbohydrates',
      startDate: '2026-02-23',
      endDate: '2026-03-01',
      status: 'active',
      checkins: [
        {
          id: 'checkin-1',
          date: '2026-02-24',
          value: 6,
          notes: 'Energy dip still present but less severe.',
        },
      ],
      createdAt: '2026-02-22',
      updatedAt: '2026-02-24',
    },
  ],
  reminders: [
    {
      id: 'rem-1',
      title: 'Evening protocol check-in',
      dueDate: '2026-02-27',
      type: 'protocol',
      completed: false,
    },
    {
      id: 'rem-2',
      title: 'Write daily reflection',
      dueDate: '2026-02-27',
      type: 'journal',
      completed: false,
    },
  ],
};

const cloneStore = (store: DiscoveryDataStoreV2): DiscoveryDataStoreV2 =>
  JSON.parse(JSON.stringify(store)) as DiscoveryDataStoreV2;

const uid = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeStore = (store: Partial<DiscoveryDataStoreV2>): DiscoveryDataStoreV2 => ({
  version: 2,
  timeline: Array.isArray(store.timeline) ? store.timeline : [],
  hypotheses: Array.isArray(store.hypotheses) ? store.hypotheses : [],
  evidence: Array.isArray(store.evidence) ? store.evidence : [],
  journal: Array.isArray(store.journal) ? store.journal : [],
  protocols: Array.isArray(store.protocols) ? store.protocols : [],
  reminders: Array.isArray(store.reminders) ? store.reminders : [],
});

const migrateLegacyV1 = (): DiscoveryDataStoreV2 | null => {
  const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as LegacyStoreV1;
    const migrated = normalizeStore({
      timeline: parsed.timeline,
      hypotheses: parsed.hypotheses,
      evidence: parsed.evidence,
      journal: parsed.journal,
      protocols: [],
      reminders: [],
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return null;
  }
};

const loadRawStore = (): DiscoveryDataStoreV2 => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const migrated = migrateLegacyV1();
    if (migrated) return migrated;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STORE));
    return cloneStore(DEFAULT_STORE);
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DiscoveryDataStoreV2>;
    return normalizeStore(parsed);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STORE));
    return cloneStore(DEFAULT_STORE);
  }
};

const saveRawStore = (store: DiscoveryDataStoreV2): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

const sortByDateDesc = <T extends { date: string }>(items: T[]): T[] =>
  items.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const mean = (arr: number[]): number => {
  if (!arr.length) return 0;
  const total = arr.reduce((sum, value) => sum + value, 0);
  return Math.round((total / arr.length) * 10) / 10;
};

const domainTrend = (timeline: DiscoveryTimelineEvent[]): Record<DiscoveryDomain, number> => {
  const domains: DiscoveryDomain[] = [
    'physical',
    'mental',
    'sleep',
    'nutrition',
    'environment',
    'social',
  ];
  const result = {} as Record<DiscoveryDomain, number>;
  domains.forEach((domain) => {
    result[domain] = mean(timeline.filter((t) => t.domain === domain).map((t) => t.intensity));
  });
  return result;
};

export const selfDiscoveryStorage = {
  getAll(): DiscoveryDataStoreV2 {
    return loadRawStore();
  },

  importStore(rawJson: string): { ok: boolean; error?: string } {
    try {
      const parsed = JSON.parse(rawJson) as Partial<DiscoveryDataStoreV2>;
      const normalized = normalizeStore(parsed);
      saveRawStore(normalized);
      return { ok: true };
    } catch (error: any) {
      return { ok: false, error: error?.message || 'Invalid import payload' };
    }
  },

  exportStore(): string {
    return JSON.stringify(loadRawStore(), null, 2);
  },

  getTimeline(): DiscoveryTimelineEvent[] {
    return sortByDateDesc(loadRawStore().timeline);
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
    return sortByDateDesc(loadRawStore().evidence);
  },

  addEvidence(evidence: Omit<DiscoveryEvidence, 'id'>): DiscoveryEvidence {
    const store = loadRawStore();
    const created: DiscoveryEvidence = { ...evidence, id: uid('ev') };
    store.evidence.push(created);
    saveRawStore(store);
    return created;
  },

  getJournalEntries(): DiscoveryJournalEntry[] {
    return sortByDateDesc(loadRawStore().journal);
  },

  addJournalEntry(entry: Omit<DiscoveryJournalEntry, 'id'>): DiscoveryJournalEntry {
    const store = loadRawStore();
    const created: DiscoveryJournalEntry = { ...entry, id: uid('journal') };
    store.journal.push(created);
    saveRawStore(store);
    return created;
  },

  getProtocols(): DiscoveryProtocol[] {
    return loadRawStore()
      .protocols.slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  addProtocol(
    protocol: Omit<DiscoveryProtocol, 'id' | 'checkins' | 'createdAt' | 'updatedAt'>
  ): DiscoveryProtocol {
    const store = loadRawStore();
    const now = new Date().toISOString().slice(0, 10);
    const created: DiscoveryProtocol = {
      ...protocol,
      id: uid('protocol'),
      checkins: [],
      createdAt: now,
      updatedAt: now,
    };
    store.protocols.push(created);
    saveRawStore(store);
    return created;
  },

  updateProtocol(
    id: string,
    updates: Partial<Omit<DiscoveryProtocol, 'id' | 'checkins' | 'createdAt'>>
  ): DiscoveryProtocol | null {
    const store = loadRawStore();
    const idx = store.protocols.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    const next: DiscoveryProtocol = {
      ...store.protocols[idx],
      ...updates,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    store.protocols[idx] = next;
    saveRawStore(store);
    return next;
  },

  addProtocolCheckin(
    protocolId: string,
    input: Omit<DiscoveryProtocolCheckin, 'id'>
  ): DiscoveryProtocolCheckin | null {
    const store = loadRawStore();
    const idx = store.protocols.findIndex((item) => item.id === protocolId);
    if (idx === -1) return null;
    const checkin: DiscoveryProtocolCheckin = { ...input, id: uid('checkin') };
    store.protocols[idx].checkins.push(checkin);
    store.protocols[idx].updatedAt = new Date().toISOString().slice(0, 10);
    saveRawStore(store);
    return checkin;
  },

  getReminders(): DiscoveryReminder[] {
    return loadRawStore()
      .reminders.slice()
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  },

  addReminder(reminder: Omit<DiscoveryReminder, 'id'>): DiscoveryReminder {
    const store = loadRawStore();
    const created: DiscoveryReminder = { ...reminder, id: uid('rem') };
    store.reminders.push(created);
    saveRawStore(store);
    return created;
  },

  setReminderCompleted(id: string, completed: boolean): DiscoveryReminder | null {
    const store = loadRawStore();
    const idx = store.reminders.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    store.reminders[idx] = { ...store.reminders[idx], completed };
    saveRawStore(store);
    return store.reminders[idx];
  },

  getInsights(): {
    topSignals: string[];
    domainAverages: Record<DiscoveryDomain, number>;
    averageMood: number;
    consistencyScore: number;
    protocolProgress: Array<{
      protocolId: string;
      title: string;
      status: ProtocolStatus;
      checkinCount: number;
      trend: 'improving' | 'declining' | 'stable' | 'unknown';
    }>;
  } {
    const store = loadRawStore();
    const signalCounts = new Map<string, number>();
    store.timeline.forEach((event) => {
      event.tags.forEach((tag) => {
        signalCounts.set(tag, (signalCounts.get(tag) || 0) + 1);
      });
    });

    const topSignals = [...signalCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    const averageMood = mean(store.journal.map((entry) => entry.mood));
    const domainAverages = domainTrend(store.timeline);
    const consistencyScore = Math.min(
      100,
      Math.round(
        (store.timeline.length * 4 +
          store.journal.length * 5 +
          store.evidence.length * 3 +
          store.protocols.filter((p) => p.checkins.length > 0).length * 10) /
          3
      )
    );

    const protocolProgress = store.protocols.map((protocol) => {
      const values = protocol.checkins.map((checkin) => checkin.value);
      let trend: 'improving' | 'declining' | 'stable' | 'unknown' = 'unknown';
      if (values.length >= 2) {
        const first = values[0];
        const last = values[values.length - 1];
        if (last > first) trend = 'improving';
        else if (last < first) trend = 'declining';
        else trend = 'stable';
      }

      return {
        protocolId: protocol.id,
        title: protocol.title,
        status: protocol.status,
        checkinCount: protocol.checkins.length,
        trend,
      };
    });

    return {
      topSignals,
      domainAverages,
      averageMood,
      consistencyScore,
      protocolProgress,
    };
  },

  getStats(): {
    timelineEvents: number;
    hypotheses: number;
    evidenceItems: number;
    journalEntries: number;
    activeHypotheses: number;
    activeProtocols: number;
    pendingReminders: number;
  } {
    const store = loadRawStore();
    return {
      timelineEvents: store.timeline.length,
      hypotheses: store.hypotheses.length,
      evidenceItems: store.evidence.length,
      journalEntries: store.journal.length,
      activeHypotheses: store.hypotheses.filter((h) => h.status === 'exploring').length,
      activeProtocols: store.protocols.filter((p) => p.status === 'active').length,
      pendingReminders: store.reminders.filter((r) => !r.completed).length,
    };
  },
};

