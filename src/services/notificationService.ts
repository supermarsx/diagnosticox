// Notification Service - Push notifications and medical reminders

export interface MedicalNotification {
  id: string;
  title: string;
  body: string;
  type: 'medication' | 'appointment' | 'lab_result' | 'vital_alert' | 'reminder' | 'emergency';
  priority: 'low' | 'normal' | 'high' | 'critical';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  metadata?: any;
}

export interface NotificationSettings {
  enabled: boolean;
  medication: boolean;
  appointments: boolean;
  labResults: boolean;
  vitalAlerts: boolean;
  reminders: boolean;
  emergencyOnly: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

class NotificationService {
  private notifications: MedicalNotification[] = [];
  private settings: NotificationSettings;
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.settings = this.loadSettings();
    this.loadNotifications();
    this.initializeMockNotifications();
  }

  private loadSettings(): NotificationSettings {
    const stored = localStorage.getItem('notification_settings');
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      enabled: true,
      medication: true,
      appointments: true,
      labResults: true,
      vitalAlerts: true,
      reminders: true,
      emergencyOnly: false,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
    };
  }

  private saveSettings() {
    localStorage.setItem('notification_settings', JSON.stringify(this.settings));
  }

  private loadNotifications() {
    const stored = localStorage.getItem('medical_notifications');
    if (stored) {
      this.notifications = JSON.parse(stored);
    }
  }

  private saveNotifications() {
    localStorage.setItem('medical_notifications', JSON.stringify(this.notifications));
  }

  private initializeMockNotifications() {
    if (this.notifications.length === 0) {
      this.notifications = [
        {
          id: '1',
          title: 'Medication Reminder',
          body: 'Time to take your morning medication: Lisinopril 10mg',
          type: 'medication',
          priority: 'high',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          read: false,
          actionUrl: '/patients/patient-1',
        },
        {
          id: '2',
          title: 'Appointment Reminder',
          body: 'Follow-up appointment with Dr. Smith tomorrow at 10:00 AM',
          type: 'appointment',
          priority: 'normal',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          read: false,
          actionUrl: '/dashboard',
        },
        {
          id: '3',
          title: 'Lab Results Available',
          body: 'Your blood work results are ready for review',
          type: 'lab_result',
          priority: 'normal',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          read: true,
          actionUrl: '/patients/patient-1',
        },
        {
          id: '4',
          title: 'Vital Sign Alert',
          body: 'Blood pressure reading above threshold: 145/95 mmHg',
          type: 'vital_alert',
          priority: 'high',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          read: true,
          actionUrl: '/monitoring',
        },
      ];
      this.saveNotifications();
    }
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission;
  }

  // Register service worker for push notifications
  async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered:', this.registration);
        
        // Check for updates
        this.registration.addEventListener('updatefound', () => {
          console.log('Service Worker update found');
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Subscribe to push notifications
  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.error('Service Worker not registered');
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          // Demo VAPID public key (in production, use your own)
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8xQmrZS5ygIBQh5R3q0P7L3FV9A9wQpZI-TDqLH7rBEQJ9n1LMa0gU'
        ),
      });
      console.log('Push subscription:', subscription);
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Show local notification
  async showNotification(notification: Omit<MedicalNotification, 'id' | 'timestamp' | 'read'>): Promise<void> {
    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    if (!this.shouldShowNotification(notification.type)) {
      console.log('Notification blocked by settings:', notification.type);
      return;
    }

    const newNotification: MedicalNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    this.notifications.unshift(newNotification);
    this.saveNotifications();

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: newNotification.type,
        requireInteraction: newNotification.priority === 'critical',
      });
    }
  }

  private shouldShowNotification(type: MedicalNotification['type']): boolean {
    if (!this.settings.enabled) return false;
    if (this.settings.emergencyOnly && type !== 'emergency') return false;

    const typeMap: Record<string, boolean> = {
      medication: this.settings.medication,
      appointment: this.settings.appointments,
      lab_result: this.settings.labResults,
      vital_alert: this.settings.vitalAlerts,
      reminder: this.settings.reminders,
      emergency: true,
    };

    return typeMap[type] ?? true;
  }

  // Schedule medication reminder
  scheduleMedicationReminder(medication: string, time: string, frequency: 'daily' | 'weekly' | 'monthly') {
    console.log(`Scheduled medication reminder: ${medication} at ${time} (${frequency})`);
    // In production, this would integrate with the backend scheduler
    this.showNotification({
      title: 'Medication Reminder Scheduled',
      body: `${medication} reminder set for ${time} (${frequency})`,
      type: 'reminder',
      priority: 'normal',
    });
  }

  // Schedule appointment reminder
  scheduleAppointmentReminder(doctorName: string, date: string, time: string) {
    console.log(`Scheduled appointment reminder: ${doctorName} on ${date} at ${time}`);
    this.showNotification({
      title: 'Appointment Scheduled',
      body: `Appointment with ${doctorName} on ${date} at ${time}`,
      type: 'appointment',
      priority: 'normal',
    });
  }

  // Get all notifications
  getNotifications(): MedicalNotification[] {
    return this.notifications;
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  // Mark notification as read
  markAsRead(id: string): void {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  // Mark all as read
  markAllAsRead(): void {
    this.notifications.forEach((n) => (n.read = true));
    this.saveNotifications();
  }

  // Delete notification
  deleteNotification(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.saveNotifications();
  }

  // Clear all notifications
  clearAll(): void {
    this.notifications = [];
    this.saveNotifications();
  }

  // Get settings
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Update settings
  updateSettings(updates: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
  }

  // Simulate incoming notification (for demo)
  simulateNotification(type: MedicalNotification['type']) {
    const templates = {
      medication: {
        title: 'Medication Reminder',
        body: 'Time to take your medication',
        priority: 'high' as const,
      },
      appointment: {
        title: 'Appointment Reminder',
        body: 'You have an upcoming appointment',
        priority: 'normal' as const,
      },
      lab_result: {
        title: 'Lab Results Available',
        body: 'New lab results are ready for review',
        priority: 'normal' as const,
      },
      vital_alert: {
        title: 'Vital Sign Alert',
        body: 'Abnormal vital sign detected',
        priority: 'high' as const,
      },
      reminder: {
        title: 'Health Reminder',
        body: 'Remember to complete your health diary',
        priority: 'normal' as const,
      },
      emergency: {
        title: 'EMERGENCY ALERT',
        body: 'Critical vital sign - immediate attention required',
        priority: 'critical' as const,
      },
    };

    const template = templates[type];
    this.showNotification({
      ...template,
      type,
    });
  }
}

export const notificationService = new NotificationService();