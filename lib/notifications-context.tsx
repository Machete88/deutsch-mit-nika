import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Set handler for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  enabled: boolean;
  reminderHour: number;   // 0–23
  reminderMinute: number; // 0–59
  streakReminder: boolean;
  reviewReminder: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  reminderHour: 9,
  reminderMinute: 0,
  streakReminder: true,
  reviewReminder: true,
};

interface NotificationsContextType {
  notifSettings: NotificationSettings;
  permissionStatus: string;
  requestPermissions: () => Promise<boolean>;
  updateNotifSettings: (partial: Partial<NotificationSettings>) => Promise<void>;
  scheduleDailyReminder: () => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const STORAGE_KEY = 'notif_settings';

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [permissionStatus, setPermissionStatus] = useState<string>('undetermined');

  useEffect(() => {
    loadSettings();
    checkPermissions();
    setupAndroidChannel();
  }, []);

  const setupAndroidChannel = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('deutsch-lernen', {
        name: 'Deutsch Lernen',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1A73E8',
        description: 'Tägliche Lern-Erinnerungen',
      });
    }
  };

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setNotifSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      }
    } catch (e) {
      console.warn('Error loading notification settings:', e);
    }
  };

  const checkPermissions = async () => {
    if (Platform.OS === 'web') {
      setPermissionStatus('web-not-supported');
      return;
    }
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
  };

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'web') return false;
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status);
    return status === 'granted';
  };

  const updateNotifSettings = async (partial: Partial<NotificationSettings>) => {
    const updated = { ...notifSettings, ...partial };
    setNotifSettings(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Re-schedule if enabled
    if (updated.enabled) {
      await scheduleDailyReminderWith(updated);
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  const scheduleDailyReminderWith = async (settings: NotificationSettings) => {
    if (Platform.OS === 'web') return;
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!settings.enabled) return;

    const messages = [
      { title: '🇩🇪 Zeit zum Lernen!', body: 'Dein tägliches Deutsch-Training wartet auf dich.' },
      { title: '🔥 Streak nicht verlieren!', body: 'Lerne heute, um deine Serie fortzusetzen.' },
      { title: '📚 Neue Wörter warten!', body: 'Erweitere deinen deutschen Wortschatz heute.' },
      { title: '🎯 Tägliches Ziel!', body: 'Nur 10 Minuten Deutsch heute — du schaffst das!' },
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];

    // Daily reminder at configured time
    await Notifications.scheduleNotificationAsync({
      content: {
        title: msg.title,
        body: msg.body,
        data: { type: 'daily_reminder' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: settings.reminderHour,
        minute: settings.reminderMinute,
      },
    });

    // Evening streak reminder at 20:00 if enabled
    if (settings.streakReminder) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔥 Vergiss deinen Streak nicht!',
          body: 'Lerne noch heute, um deine Lern-Serie zu erhalten.',
          data: { type: 'streak_reminder' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 20,
          minute: 0,
        },
      });
    }
  };

  const scheduleDailyReminder = async () => {
    await scheduleDailyReminderWith(notifSettings);
  };

  const cancelAllNotifications = async () => {
    if (Platform.OS === 'web') return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const sendTestNotification = async () => {
    if (Platform.OS === 'web') return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🇩🇪 Test-Benachrichtigung',
        body: 'Push-Benachrichtigungen funktionieren! Guten Lerntag!',
        data: { type: 'test' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });
  };

  return (
    <NotificationsContext.Provider value={{
      notifSettings,
      permissionStatus,
      requestPermissions,
      updateNotifSettings,
      scheduleDailyReminder,
      cancelAllNotifications,
      sendTestNotification,
    }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
