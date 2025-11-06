import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mic, MicOff, Save, Trash2, FileText,
  AlertCircle, Check, Volume2, Copy, Download,
  MessageSquare, Settings
} from 'lucide-react';
import { voiceService, VoiceNote } from '../services/voiceService';

interface VoiceAssistantPageProps {
  user: any;
}

export default function VoiceAssistantPage({ user }: VoiceAssistantPageProps) {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [savedNotes, setSavedNotes] = useState<VoiceNote[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<VoiceNote['category']>('clinical');
  const [showCommands, setShowCommands] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if speech recognition is supported
    setIsSupported(voiceService.isSupported());

    // Subscribe to voice updates
    const unsubscribe = voiceService.subscribe((text, isFinal) => {
      setCurrentText(text);
      if (isFinal) {
        // Optionally auto-save or wait for user action
      }
    });

    // Listen for voice commands
    const handleVoiceCommand = (event: any) => {
      const { action, target } = event.detail;
      handleCommand(action, target);
    };
    window.addEventListener('voiceCommand', handleVoiceCommand);

    // Load saved notes
    loadNotes();

    return () => {
      unsubscribe();
      window.removeEventListener('voiceCommand', handleVoiceCommand);
      voiceService.stopListening();
    };
  }, []);

  useEffect(() => {
    setIsListening(voiceService.getIsListening());
  }, []);

  const loadNotes = () => {
    setSavedNotes(voiceService.getNotes());
  };

  const handleToggleListening = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      const started = voiceService.startListening();
      setIsListening(started);
    }
  };

  const handleSaveNote = () => {
    if (!currentText.trim()) return;

    voiceService.saveNote(currentText, selectedCategory);
    setCurrentText('');
    loadNotes();
  };

  const handleClearNote = () => {
    if (window.confirm('Clear current text?')) {
      setCurrentText('');
    }
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('Delete this note?')) {
      voiceService.deleteNote(id);
      loadNotes();
    }
  };

  const handleCopyNote = (text: string) => {
    navigator.clipboard.writeText(text);
    // Show toast notification
    alert('Note copied to clipboard');
  };

  const handleExportNotes = () => {
    const exportData = JSON.stringify(savedNotes, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `voice-notes-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSimulateVoice = (text: string) => {
    voiceService.simulateVoiceInput(text);
  };

  const handleLoadTemplate = (type: 'soap' | 'progress' | 'consult') => {
    const template = voiceService.generateNoteTemplate(type);
    setCurrentText(template);
  };

  const handleCommand = (action: string, target: string) => {
    console.log('Voice command:', action, target);
    
    if (action === 'navigate') {
      switch (target) {
        case 'dashboard':
          navigate('/dashboard');
          break;
        case 'patient':
          navigate('/patients/patient-1');
          break;
        case 'alerts':
          navigate('/notifications');
          break;
      }
    } else if (action === 'monitoring') {
      if (target === 'start') {
        navigate('/monitoring');
      }
    } else if (action === 'clear' && target === 'note') {
      handleClearNote();
    } else if (action === 'save' && target === 'note') {
      handleSaveNote();
    }
  };

  const commands = voiceService.getAvailableCommands();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="glass-card-subtle p-2 rounded-xl mr-4 hover:scale-110 transition-transform"
              >
                <ArrowLeft className="h-6 w-6 text-gray-700" />
              </button>
              <div className="flex items-center gap-3">
                <div className="glass-card-strong p-3 rounded-2xl relative">
                  <Mic className="h-8 w-8 text-indigo-600" />
                  {isListening && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Voice Assistant
                  </h1>
                  <p className="text-sm text-gray-600">
                    Voice-to-text medical note taking
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowCommands(!showCommands)}
              className="glass-button flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Voice Commands
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Support Warning */}
        {!isSupported && (
          <div className="glass-card p-4 bg-yellow-50 border-2 border-yellow-300">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-900">Speech Recognition Not Supported</p>
                <p className="text-sm text-yellow-700">
                  Your browser doesn't support speech recognition. You can use the simulation mode below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Voice Commands Panel */}
        {showCommands && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Available Voice Commands</h3>
              <button
                onClick={() => setShowCommands(false)}
                className="glass-card-subtle p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {commands.map((cmd, index) => (
                <div key={index} className="glass-card-subtle p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Volume2 className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">"{cmd.command}"</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {cmd.action === 'navigate' && `Navigate to ${cmd.parameters.target}`}
                        {cmd.action === 'monitoring' && `${cmd.parameters.target} monitoring`}
                        {cmd.action === 'clear' && 'Clear current note'}
                        {cmd.action === 'save' && 'Save current note'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voice Input Section */}
        <div className="glass-card p-8">
          <div className="text-center mb-6">
            <button
              onClick={handleToggleListening}
              disabled={!isSupported}
              className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto transition-all ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'glass-button-primary hover:scale-110'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isListening ? (
                <MicOff className="h-16 w-16 text-white" />
              ) : (
                <Mic className="h-16 w-16 text-white" />
              )}
            </button>
            <p className="mt-4 text-lg font-semibold text-gray-900">
              {isListening ? 'Listening...' : 'Click to start voice input'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {isListening ? 'Speak clearly into your microphone' : 'Medical terminology will be recognized automatically'}
            </p>
          </div>

          {/* Category Selector */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {(['clinical', 'prescription', 'observation', 'diagnosis', 'general'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'glass-card-subtle hover:glass-card text-gray-700'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Current Transcription */}
          <div className="glass-card-subtle p-6 rounded-xl min-h-48 mb-6">
            {currentText ? (
              <p className="text-gray-900 whitespace-pre-wrap">{currentText}</p>
            ) : (
              <p className="text-gray-400 italic text-center">Your voice input will appear here...</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleSaveNote}
              disabled={!currentText.trim()}
              className="glass-button-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save Note
            </button>
            <button
              onClick={handleClearNote}
              disabled={!currentText.trim()}
              className="glass-button flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
            <button
              onClick={() => handleCopyNote(currentText)}
              disabled={!currentText.trim()}
              className="glass-button flex items-center gap-2 disabled:opacity-50"
            >
              <Copy className="h-4 w-4" />
              Copy
            </button>
          </div>
        </div>

        {/* Template Selector */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Note Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { type: 'soap' as const, title: 'SOAP Note', desc: 'Subjective, Objective, Assessment, Plan' },
              { type: 'progress' as const, title: 'Progress Note', desc: 'Patient progress documentation' },
              { type: 'consult' as const, title: 'Consultation Note', desc: 'Specialist consultation format' },
            ].map(({ type, title, desc }) => (
              <button
                key={type}
                onClick={() => handleLoadTemplate(type)}
                className="glass-card-subtle p-4 rounded-xl hover:glass-card text-left transition-all"
              >
                <FileText className="h-6 w-6 text-indigo-600 mb-2" />
                <p className="font-semibold text-gray-900">{title}</p>
                <p className="text-sm text-gray-600 mt-1">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Simulation Mode (for demo) */}
        {!isSupported && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Simulation Mode</h3>
            <p className="text-sm text-gray-600 mb-4">
              Try these example voice inputs to see how the system works:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Patient presents with chest pain and shortness of breath',
                'Vital signs: Blood pressure 145 over 95, heart rate 88, temperature 37.2',
                'Diagnosis: Essential hypertension, Type 2 diabetes mellitus',
                'Prescribed Lisinopril 10 milligrams once daily',
                'Show dashboard',
                'Start monitoring',
              ].map((text, index) => (
                <button
                  key={index}
                  onClick={() => handleSimulateVoice(text)}
                  className="glass-card-subtle p-3 rounded-xl hover:glass-card text-left text-sm transition-all"
                >
                  <Volume2 className="h-4 w-4 text-indigo-600 inline mr-2" />
                  {text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Saved Notes */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Saved Notes ({savedNotes.length})
            </h3>
            <button
              onClick={handleExportNotes}
              disabled={savedNotes.length === 0}
              className="glass-button flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export All
            </button>
          </div>

          {savedNotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No saved notes yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedNotes.map((note) => (
                <div key={note.id} className="glass-card-subtle p-4 rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                        {note.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(note.timestamp).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        Confidence: {(note.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopyNote(note.text)}
                        className="glass-card-subtle p-1.5 rounded-lg hover:bg-blue-100 text-blue-600"
                        title="Copy"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="glass-card-subtle p-1.5 rounded-lg hover:bg-red-100 text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-900 text-sm whitespace-pre-wrap">{note.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}