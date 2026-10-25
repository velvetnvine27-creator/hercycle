export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'period' | 'ovulation' | 'hygiene' | 'medication';
  timestamp: string;
  read: boolean;
}

class NotificationService {
  private inAppNotifications: InAppNotification[] = [];
  private listeners: Array<(notifications: InAppNotification[]) => void> = [];

  constructor() {
    // Load persisted in-app alerts from localStorage
    try {
      const stored = localStorage.getItem('bloom_in_app_notifications');
      if (stored) {
        this.inAppNotifications = JSON.parse(stored);
      }
    } catch {
      this.inAppNotifications = [];
    }
  }

  isWebNotificationSupported(): boolean {
    return 'Notification' in window;
  }

  getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!this.isWebNotificationSupported()) return 'unsupported';
    return Notification.permission;
  }

  async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (!this.isWebNotificationSupported()) return 'unsupported';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.warn('Could not request notification permission:', e);
      return 'denied';
    }
  }

  sendNotification(
    title: string,
    message: string,
    type: 'info' | 'period' | 'ovulation' | 'hygiene' | 'medication' = 'info'
  ) {
    // 1. Play soft pleasant chime via Web Audio API (free, offline, zero assets)
    this.playChime();

    // 2. Add to in-app notification list
    const newNotif: InAppNotification = {
      id: 'notif-' + Date.now(),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };

    this.inAppNotifications.unshift(newNotif);
    // Keep max 30 notifications
    if (this.inAppNotifications.length > 30) {
      this.inAppNotifications = this.inAppNotifications.slice(0, 30);
    }
    this.persist();
    this.notifyListeners();

    // 3. If Web Notification is granted, trigger desktop/mobile system notification
    if (this.isWebNotificationSupported() && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.svg',
          badge: '/favicon.svg'
        });
      } catch (err) {
        console.warn('System notification trigger failed, fell back to in-app alert:', err);
      }
    }
  }

  markAllAsRead() {
    this.inAppNotifications.forEach(n => (n.read = true));
    this.persist();
    this.notifyListeners();
  }

  clearAll() {
    this.inAppNotifications = [];
    this.persist();
    this.notifyListeners();
  }

  getNotifications(): InAppNotification[] {
    return [...this.inAppNotifications];
  }

  getUnreadCount(): number {
    return this.inAppNotifications.filter(n => !n.read).length;
  }

  subscribe(listener: (notifications: InAppNotification[]) => void) {
    this.listeners.push(listener);
    listener([...this.inAppNotifications]);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    const copy = [...this.inAppNotifications];
    this.listeners.forEach(l => l(copy));
  }

  private persist() {
    try {
      localStorage.setItem('bloom_in_app_notifications', JSON.stringify(this.inAppNotifications));
    } catch {
      // Storage full or private mode
    }
  }

  private playChime() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio context restricted or muted
    }
  }
}

export const notificationService = new NotificationService();
