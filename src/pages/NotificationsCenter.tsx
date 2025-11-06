import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bell, Settings, Check, Trash2, Calendar,
  Activity, AlertTriangle, Clock, Filter, CheckCheck,
  Plus, X
} from 'lucide-react';
import { notificationService, MedicalNotification, NotificationSettings } from '../services/notificationService';

interface NotificationsCenterProps {
  user: any;
}

export default function NotificationsCenter({ user }: NotificationsCenterProps) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<MedicalNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(notificationService.getSettings());
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'medication' | 'appointments'>('all');
  const [showScheduler, setShowScheduler] = useState(false);
  const [medicationName, setMedicationName] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    loadNotifications();
    
    // Request notification permission on mount
    notificationService.requestPermission();
    notificationService.registerServiceWorker();
  }, []);

  const loadNotifications = () => {
    setNotifications(notificationService.getNotifications());
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;

    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (filter !== 'all') {
      filtered = filtered.filter(n => n.type === filter);
    }

    return filtered;
  };

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
    loadNotifications();
  };

  const handleDeleteNotification = (id: string) => {
    notificationService.deleteNotification(id);
    loadNotifications();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      notificationService.clearAll();
      loadNotifications();
    }
  };

  const handleSettingsChange = (updates: Partial<NotificationSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    notificationService.updateSettings(newSettings);
  };

  const handleScheduleMedication = () => {
    if (!medicationName.trim()) return;

    notificationService.scheduleMedicationReminder(medicationName, reminderTime, frequency);
    setShowScheduler(false);
    setMedicationName('');
    setReminderTime('09:00');
    loadNotifications();
  };

  const handleTestNotification = (type: MedicalNotification['type']) => {
    notificationService.simulateNotification(type);
    setTimeout(loadNotifications, 100);
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      medication: Activity,
      appointment: Calendar,
      lab_result: AlertTriangle,
      vital_alert: Activity,
      reminder: Clock,
      emergency: AlertTriangle,
    };
    return icons[type] || Bell;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      medication: 'text-blue-600',
      appointment: 'text-green-600',
      lab_result: 'text-purple-600',
      vital_alert: 'text-orange-600',
      reminder: 'text-indigo-600',
      emergency: 'text-red-600',
    };
    return colors[type] || 'text-gray-600';
  };

  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, string> = {
      low: 'bg-gray-100 text-gray-700',
      normal: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700',
    };
    return badges[priority] || badges.normal;
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

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
                  <Bell className="h-8 w-8 text-indigo-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Notifications Center
                  </h1>
                  <p className="text-sm text-gray-600">
                    Medical alerts, reminders, and updates
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowScheduler(true)}
                className="glass-button flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Schedule
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="glass-button-primary flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Settings Panel */}
        {showSettings && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="glass-card-subtle p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Master Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Enable Notifications</p>
                  <p className="text-sm text-gray-600">Receive all notification types</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) => handleSettingsChange({ enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Individual Type Toggles */}
              {[
                { key: 'medication', label: 'Medication Reminders', desc: 'Alerts for medication times' },
                { key: 'appointments', label: 'Appointments', desc: 'Upcoming appointment reminders' },
                { key: 'labResults', label: 'Lab Results', desc: 'New laboratory results available' },
                { key: 'vitalAlerts', label: 'Vital Sign Alerts', desc: 'Abnormal vital sign notifications' },
                { key: 'reminders', label: 'Health Reminders', desc: 'General health and diary reminders' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between pl-4 border-l-2 border-indigo-200">
                  <div>
                    <p className="font-medium text-gray-900">{label}</p>
                    <p className="text-sm text-gray-600">{desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[key as keyof NotificationSettings] as boolean}
                      onChange={(e) => handleSettingsChange({ [key]: e.target.checked })}
                      disabled={!settings.enabled}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-disabled:opacity-50"></div>
                  </label>
                </div>
              ))}

              {/* Emergency Only */}
              <div className="flex items-center justify-between border-t pt-4">
                <div>
                  <p className="font-medium text-gray-900">Emergency Only Mode</p>
                  <p className="text-sm text-gray-600">Only show critical emergency alerts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emergencyOnly}
                    onChange={(e) => handleSettingsChange({ emergencyOnly: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {/* Test Notifications */}
              <div className="border-t pt-4">
                <p className="font-medium text-gray-900 mb-3">Test Notifications</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['medication', 'appointment', 'lab_result', 'vital_alert', 'reminder', 'emergency'].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTestNotification(type as MedicalNotification['type'])}
                      className="glass-card-subtle p-2 rounded-lg hover:glass-card transition-all text-xs font-medium"
                    >
                      Test {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Medication Scheduler Modal */}
        {showScheduler && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Schedule Medication Reminder</h3>
              <button
                onClick={() => setShowScheduler(false)}
                className="glass-card-subtle p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medication Name
                </label>
                <input
                  type="text"
                  value={medicationName}
                  onChange={(e) => setMedicationName(e.target.value)}
                  placeholder="e.g., Lisinopril 10mg"
                  className="glass-input w-full px-4 py-2 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="glass-input w-full px-4 py-2 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="glass-input w-full px-4 py-2 rounded-xl"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleScheduleMedication}
                disabled={!medicationName.trim()}
                className="glass-button-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                Schedule Reminder
              </button>
            </div>
          </div>
        )}

        {/* Filters and Actions */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'unread', label: 'Unread' },
                  { value: 'medication', label: 'Medication' },
                  { value: 'appointments', label: 'Appointments' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setFilter(value as any)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      filter === value
                        ? 'bg-indigo-600 text-white'
                        : 'glass-card-subtle hover:glass-card text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="glass-button flex items-center gap-2 text-sm"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark All Read
                </button>
              )}
              <button
                onClick={handleClearAll}
                className="glass-button flex items-center gap-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Notifications
              </h3>
              <p className="text-gray-600">
                {filter === 'unread' ? 'You have no unread notifications' : 'You have no notifications'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const TypeIcon = getTypeIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`glass-card p-4 hover-lift transition-all ${
                    !notification.read ? 'ring-2 ring-indigo-200' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`glass-card-subtle p-3 rounded-xl ${getTypeColor(notification.type)}`}>
                      <TypeIcon className="h-6 w-6" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{notification.body}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(notification.priority)}`}>
                          {notification.priority}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                          <span className="capitalize">{notification.type.replace('_', ' ')}</span>
                        </div>

                        <div className="flex gap-2">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="glass-card-subtle p-1.5 rounded-lg hover:bg-green-100 text-green-600"
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="glass-card-subtle p-1.5 rounded-lg hover:bg-red-100 text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
