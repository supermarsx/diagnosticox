import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Edit, Trash2, Save, X, Calendar,
  Activity, Pill, Microscope, Heart, Brain, AlertCircle,
  ZoomIn, ZoomOut, Download, Share2, Eye
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'diagnosis' | 'treatment' | 'test' | 'symptom' | 'medication' | 'consultation';
  severity?: 'low' | 'medium' | 'high';
  details?: any;
  position?: number;
}

interface MedicalTimelineProps {
  user: any;
}

export default function MedicalTimeline({ user }: MedicalTimelineProps) {
  const navigate = useNavigate();
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const [events, setEvents] = useState<TimelineEvent[]>([
    {
      id: '1',
      date: '2025-10-15',
      title: 'Initial Diagnosis',
      description: 'Type 2 Diabetes Mellitus diagnosed',
      type: 'diagnosis',
      severity: 'high',
      position: 0,
    },
    {
      id: '2',
      date: '2025-10-18',
      title: 'Medication Started',
      description: 'Metformin 500mg twice daily',
      type: 'medication',
      severity: 'medium',
      position: 1,
    },
    {
      id: '3',
      date: '2025-10-25',
      title: 'Lab Results',
      description: 'HbA1c: 7.2%, Fasting Glucose: 145 mg/dL',
      type: 'test',
      severity: 'medium',
      position: 2,
    },
    {
      id: '4',
      date: '2025-11-01',
      title: 'Follow-up Consultation',
      description: 'Reviewed medication response, adjusted dosage',
      type: 'consultation',
      severity: 'low',
      position: 3,
    },
    {
      id: '5',
      date: '2025-11-05',
      title: 'Symptom Report',
      description: 'Improved energy levels, better glucose control',
      type: 'symptom',
      severity: 'low',
      position: 4,
    },
  ]);

  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    type: 'symptom' as TimelineEvent['type'],
    severity: 'medium' as TimelineEvent['severity'],
    description: '',
  });

  const getEventIcon = (type: TimelineEvent['type']) => {
    const icons = {
      diagnosis: Brain,
      treatment: Heart,
      test: Microscope,
      symptom: Activity,
      medication: Pill,
      consultation: Calendar,
    };
    return icons[type] || Activity;
  };

  const getEventColor = (type: TimelineEvent['type']) => {
    const colors = {
      diagnosis: 'bg-purple-500',
      treatment: 'bg-green-500',
      test: 'bg-blue-500',
      symptom: 'bg-orange-500',
      medication: 'bg-pink-500',
      consultation: 'bg-indigo-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const getSeverityColor = (severity?: TimelineEvent['severity']) => {
    if (!severity) return 'border-gray-300';
    const colors = {
      low: 'border-green-400',
      medium: 'border-yellow-400',
      high: 'border-red-400',
    };
    return colors[severity];
  };

  const handleDragStart = (eventId: string) => {
    setDraggedEvent(eventId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetEventId: string) => {
    if (!draggedEvent || draggedEvent === targetEventId) return;

    const draggedIndex = events.findIndex((e) => e.id === draggedEvent);
    const targetIndex = events.findIndex((e) => e.id === targetEventId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newEvents = [...events];
    const [removed] = newEvents.splice(draggedIndex, 1);
    newEvents.splice(targetIndex, 0, removed);

    // Update positions
    newEvents.forEach((event, index) => {
      event.position = index;
    });

    setEvents(newEvents);
    setDraggedEvent(null);
  };

  const handleAddEvent = () => {
    const newEvent: TimelineEvent = {
      id: Date.now().toString(),
      ...formData,
      position: events.length,
    };

    setEvents([...events, newEvent].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ));

    setShowAddForm(false);
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      type: 'symptom',
      severity: 'medium',
      description: '',
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Delete this event?')) {
      setEvents(events.filter((e) => e.id !== eventId));
      setSelectedEvent(null);
    }
  };

  const handleExportTimeline = () => {
    const exportData = JSON.stringify(events, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medical-timeline-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleZoomIn = () => {
    setZoomLevel(Math.min(200, zoomLevel + 20));
  };

  const handleZoomOut = () => {
    setZoomLevel(Math.max(50, zoomLevel - 20));
  };

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
                <div className="glass-card-strong p-3 rounded-2xl">
                  <Calendar className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Interactive Medical Timeline
                  </h1>
                  <p className="text-sm text-gray-600">
                    Drag-and-drop event management
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleZoomOut}
                className="glass-button flex items-center gap-2"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                onClick={handleZoomIn}
                className="glass-button flex items-center gap-2"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={handleExportTimeline}
                className="glass-button flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="glass-button-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Event
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Add Event Form */}
        {showAddForm && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Medical Event</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="glass-card-subtle p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Lab Results"
                    className="glass-input w-full px-4 py-2 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="glass-input w-full px-4 py-2 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="glass-input w-full px-4 py-2 rounded-xl"
                  >
                    <option value="diagnosis">Diagnosis</option>
                    <option value="treatment">Treatment</option>
                    <option value="test">Test</option>
                    <option value="symptom">Symptom</option>
                    <option value="medication">Medication</option>
                    <option value="consultation">Consultation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                    className="glass-input w-full px-4 py-2 rounded-xl"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event details..."
                  rows={3}
                  className="glass-input w-full px-4 py-2 rounded-xl"
                />
              </div>

              <button
                onClick={handleAddEvent}
                disabled={!formData.title || !formData.description}
                className="glass-button-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Add Event
              </button>
            </div>
          </div>
        )}

        {/* Timeline Container */}
        <div className="glass-card p-8" style={{ zoom: `${zoomLevel}%` }}>
          <div className="relative" ref={timelineRef}>
            {/* Timeline Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 transform -translate-x-1/2"></div>

            {/* Timeline Events */}
            <div className="space-y-12">
              {events.map((event, index) => {
                const Icon = getEventIcon(event.type);
                const isLeft = index % 2 === 0;

                return (
                  <div
                    key={event.id}
                    draggable
                    onDragStart={() => handleDragStart(event.id)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(event.id)}
                    className={`relative flex items-center ${
                      isLeft ? 'flex-row' : 'flex-row-reverse'
                    } cursor-move`}
                  >
                    {/* Event Card */}
                    <div className={`w-5/12 ${isLeft ? 'pr-8 text-right' : 'pl-8'}`}>
                      <div
                        onClick={() => setSelectedEvent(event)}
                        className={`glass-card p-6 hover-lift border-l-4 ${getSeverityColor(event.severity)} cursor-pointer`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className={isLeft ? 'order-2' : ''}>
                            <div className={`glass-card-subtle p-2 rounded-lg inline-block ${getEventColor(event.type)}`}>
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-1">{event.date}</p>
                            <h4 className="font-semibold text-gray-900 mb-2">{event.title}</h4>
                            <p className="text-sm text-gray-600">{event.description}</p>
                            <div className="flex gap-2 mt-3">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                                {event.type}
                              </span>
                              {event.severity && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  event.severity === 'high' ? 'bg-red-100 text-red-700' :
                                  event.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {event.severity}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Dot */}
                    <div className="absolute left-1/2 transform -translate-x-1/2">
                      <div className={`w-6 h-6 rounded-full border-4 border-white ${getEventColor(event.type)} shadow-lg`}></div>
                    </div>

                    {/* Empty Space */}
                    <div className="w-5/12"></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Event Details Panel */}
        {selectedEvent && (
          <div className="glass-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedEvent.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedEvent.date}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="glass-button flex items-center gap-2 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="glass-card-subtle p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                <p className="text-gray-900">{selectedEvent.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Type</p>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                    {selectedEvent.type}
                  </span>
                </div>
                {selectedEvent.severity && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Severity</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedEvent.severity === 'high' ? 'bg-red-100 text-red-700' :
                      selectedEvent.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {selectedEvent.severity}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}