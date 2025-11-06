// Voice Service - Voice-to-text medical note taking simulation
export interface VoiceNote {
  id: string;
  text: string;
  timestamp: string;
  patientId?: string;
  category: 'clinical' | 'prescription' | 'observation' | 'diagnosis' | 'general';
  confidence: number;
}

export interface VoiceCommand {
  command: string;
  action: string;
  parameters?: any;
}

class VoiceService {
  private recognition: any = null;
  private isListening: boolean = false;
  private notes: VoiceNote[] = [];
  private listeners: Set<(text: string, isFinal: boolean) => void> = new Set();

  // Medical terminology dictionary for recognition enhancement
  private medicalTerms = [
    'hypertension', 'diabetes', 'dyspnea', 'tachycardia', 'bradycardia',
    'arrhythmia', 'myocardial infarction', 'angina', 'atherosclerosis',
    'diagnosis', 'prognosis', 'symptom', 'syndrome', 'prescription',
    'medication', 'dosage', 'milligrams', 'liters', 'blood pressure',
    'heart rate', 'temperature', 'oxygen saturation', 'respiratory rate',
    'glucose level', 'hemoglobin', 'cholesterol', 'triglycerides',
    'patient presents with', 'vital signs', 'physical examination',
    'laboratory results', 'imaging studies', 'treatment plan'
  ];

  // Voice commands
  private commands = [
    { trigger: 'open patient', action: 'navigate', target: 'patient' },
    { trigger: 'show dashboard', action: 'navigate', target: 'dashboard' },
    { trigger: 'start monitoring', action: 'monitoring', target: 'start' },
    { trigger: 'stop monitoring', action: 'monitoring', target: 'stop' },
    { trigger: 'show alerts', action: 'navigate', target: 'alerts' },
    { trigger: 'clear note', action: 'clear', target: 'note' },
    { trigger: 'save note', action: 'save', target: 'note' },
  ];

  constructor() {
    this.initializeSpeechRecognition();
    this.loadNotes();
  }

  private initializeSpeechRecognition() {
    // Check for browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    // Configure recognition
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 3;

    // Event handlers
    this.recognition.onstart = () => {
      console.log('[VoiceService] Speech recognition started');
      this.isListening = true;
    };

    this.recognition.onend = () => {
      console.log('[VoiceService] Speech recognition ended');
      this.isListening = false;
    };

    this.recognition.onerror = (event: any) => {
      console.error('[VoiceService] Speech recognition error:', event.error);
      this.isListening = false;
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Enhance with medical terminology
      if (finalTranscript) {
        const enhanced = this.enhanceMedicalText(finalTranscript);
        this.notifyListeners(enhanced, true);
        
        // Check for voice commands
        this.processCommand(enhanced.toLowerCase());
      }

      if (interimTranscript) {
        this.notifyListeners(interimTranscript, false);
      }
    };
  }

  private enhanceMedicalText(text: string): string {
    // Replace common phonetic errors with correct medical terms
    let enhanced = text;

    const replacements: Record<string, string> = {
      'high per tension': 'hypertension',
      'die a betes': 'diabetes',
      'dis nea': 'dyspnea',
      'tacky cardia': 'tachycardia',
      'brady cardia': 'bradycardia',
      'my o cardial': 'myocardial',
      'an gina': 'angina',
      'athero sclerosis': 'atherosclerosis',
    };

    Object.entries(replacements).forEach(([wrong, correct]) => {
      const regex = new RegExp(wrong, 'gi');
      enhanced = enhanced.replace(regex, correct);
    });

    return enhanced;
  }

  private processCommand(text: string) {
    const matchedCommand = this.commands.find(cmd => text.includes(cmd.trigger));
    
    if (matchedCommand) {
      console.log('[VoiceService] Command detected:', matchedCommand);
      // Emit command event
      window.dispatchEvent(new CustomEvent('voiceCommand', {
        detail: {
          command: matchedCommand.trigger,
          action: matchedCommand.action,
          target: matchedCommand.target,
        },
      }));
    }
  }

  // Start voice recognition
  startListening(): boolean {
    if (!this.recognition) {
      console.error('[VoiceService] Speech recognition not available');
      return false;
    }

    if (this.isListening) {
      console.warn('[VoiceService] Already listening');
      return false;
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('[VoiceService] Failed to start listening:', error);
      return false;
    }
  }

  // Stop voice recognition
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  // Subscribe to voice updates
  subscribe(callback: (text: string, isFinal: boolean) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(text: string, isFinal: boolean) {
    this.listeners.forEach(callback => callback(text, isFinal));
  }

  // Save voice note
  saveNote(text: string, category: VoiceNote['category'], patientId?: string) {
    const note: VoiceNote = {
      id: Date.now().toString(),
      text: text.trim(),
      timestamp: new Date().toISOString(),
      patientId,
      category,
      confidence: 0.95, // Simulated confidence score
    };

    this.notes.unshift(note);
    this.saveNotesToStorage();
    
    console.log('[VoiceService] Note saved:', note);
    return note;
  }

  // Get all notes
  getNotes(filter?: { patientId?: string; category?: string }): VoiceNote[] {
    let filtered = this.notes;

    if (filter?.patientId) {
      filtered = filtered.filter(n => n.patientId === filter.patientId);
    }

    if (filter?.category) {
      filtered = filtered.filter(n => n.category === filter.category);
    }

    return filtered;
  }

  // Delete note
  deleteNote(id: string) {
    this.notes = this.notes.filter(n => n.id !== id);
    this.saveNotesToStorage();
  }

  // Clear all notes
  clearNotes() {
    this.notes = [];
    this.saveNotesToStorage();
  }

  private loadNotes() {
    const stored = localStorage.getItem('voice_notes');
    if (stored) {
      this.notes = JSON.parse(stored);
    }
  }

  private saveNotesToStorage() {
    localStorage.setItem('voice_notes', JSON.stringify(this.notes));
  }

  // Check if currently listening
  getIsListening(): boolean {
    return this.isListening;
  }

  // Check if speech recognition is supported
  isSupported(): boolean {
    return this.recognition !== null;
  }

  // Get available commands
  getAvailableCommands(): VoiceCommand[] {
    return this.commands.map(cmd => ({
      command: cmd.trigger,
      action: cmd.action,
      parameters: { target: cmd.target },
    }));
  }

  // Simulate voice input (for demo when speech recognition not available)
  simulateVoiceInput(text: string) {
    console.log('[VoiceService] Simulating voice input:', text);
    
    // Simulate interim results
    const words = text.split(' ');
    let accumulated = '';
    
    words.forEach((word, index) => {
      accumulated += word + ' ';
      setTimeout(() => {
        this.notifyListeners(accumulated.trim(), index === words.length - 1);
      }, index * 200);
    });

    // Check for commands
    setTimeout(() => {
      this.processCommand(text.toLowerCase());
    }, words.length * 200 + 100);
  }

  // Generate medical note template
  generateNoteTemplate(type: 'soap' | 'progress' | 'consult'): string {
    const templates = {
      soap: `SUBJECTIVE:
Patient reports...

OBJECTIVE:
Vital Signs: BP: _/_  HR: _  RR: _  Temp: _  SpO2: _%
Physical Exam: ...

ASSESSMENT:
1. ...

PLAN:
1. ...`,
      
      progress: `PROGRESS NOTE
Date: ${new Date().toLocaleDateString()}

Patient Status: ...
Vital Signs: Stable/Unstable
Current Medications: ...
Progress: ...
Plan: ...`,
      
      consult: `CONSULTATION NOTE
Reason for Consult: ...
History: ...
Review of Systems: ...
Physical Examination: ...
Impression: ...
Recommendations: ...`,
    };

    return templates[type];
  }

  // Get medical terminology suggestions
  getMedicalTermSuggestions(prefix: string): string[] {
    return this.medicalTerms
      .filter(term => term.toLowerCase().startsWith(prefix.toLowerCase()))
      .slice(0, 5);
  }
}

export const voiceService = new VoiceService();
