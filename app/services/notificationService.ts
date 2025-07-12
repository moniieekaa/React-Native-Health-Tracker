import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  waterReminders: boolean;
  sleepReminders: boolean;
  exerciseReminders: boolean;
  mealReminders: boolean;
  waterReminderTime: string; // HH:MM format
  sleepReminderTime: string; // HH:MM format
  exerciseReminderTime: string; // HH:MM format
  mealReminderTime: string; // HH:MM format
}

class NotificationService {
  private readonly NOTIFICATION_SETTINGS_KEY = 'notificationSettings';

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  // Schedule a notification
  async scheduleNotification(
    identifier: string,
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger,
        identifier,
      });
      
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  // Schedule daily water reminder
  async scheduleWaterReminder(time: string): Promise<string> {
    const [hour, minute] = time.split(':').map(Number);
    
    return this.scheduleNotification(
      'water-reminder',
      '💧 Time to hydrate!',
      'Don\'t forget to drink water and stay hydrated.',
      {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      }
    );
  }

  // Schedule daily sleep reminder
  async scheduleSleepReminder(time: string): Promise<string> {
    const [hour, minute] = time.split(':').map(Number);
    
    return this.scheduleNotification(
      'sleep-reminder',
      '😴 Time for bed!',
      'Get ready for a good night\'s sleep to maintain your health.',
      {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      }
    );
  }

  // Schedule daily exercise reminder
  async scheduleExerciseReminder(time: string): Promise<string> {
    const [hour, minute] = time.split(':').map(Number);
    
    return this.scheduleNotification(
      'exercise-reminder',
      '🏃‍♂️ Time to move!',
      'Take a walk or do some exercise to reach your daily step goal.',
      {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      }
    );
  }

  // Schedule meal reminder
  async scheduleMealReminder(time: string): Promise<string> {
    const [hour, minute] = time.split(':').map(Number);
    
    return this.scheduleNotification(
      'meal-reminder',
      '🍽️ Time to eat!',
      'Don\'t forget to log your meals and track your nutrition.',
      {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      }
    );
  }

  // Cancel a specific notification
  async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  // Get notification settings
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const settings = await AsyncStorage.getItem(this.NOTIFICATION_SETTINGS_KEY);
      if (settings) {
        return JSON.parse(settings);
      }
      
      // Default settings
      return {
        waterReminders: true,
        sleepReminders: true,
        exerciseReminders: true,
        mealReminders: false,
        waterReminderTime: '10:00',
        sleepReminderTime: '22:00',
        exerciseReminderTime: '18:00',
        mealReminderTime: '12:00',
      };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return {
        waterReminders: false,
        sleepReminders: false,
        exerciseReminders: false,
        mealReminders: false,
        waterReminderTime: '10:00',
        sleepReminderTime: '22:00',
        exerciseReminderTime: '18:00',
        mealReminderTime: '12:00',
      };
    }
  }

  // Save notification settings
  async saveNotificationSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(this.NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
      throw error;
    }
  }

  // Update notification schedules based on settings
  async updateNotificationSchedules(settings: NotificationSettings): Promise<void> {
    try {
      // Cancel existing notifications
      await this.cancelAllNotifications();
      
      // Schedule new notifications based on settings
      if (settings.waterReminders) {
        await this.scheduleWaterReminder(settings.waterReminderTime);
      }
      
      if (settings.sleepReminders) {
        await this.scheduleSleepReminder(settings.sleepReminderTime);
      }
      
      if (settings.exerciseReminders) {
        await this.scheduleExerciseReminder(settings.exerciseReminderTime);
      }
      
      if (settings.mealReminders) {
        await this.scheduleMealReminder(settings.mealReminderTime);
      }
    } catch (error) {
      console.error('Error updating notification schedules:', error);
      throw error;
    }
  }

  // Send immediate notification (for testing)
  async sendImmediateNotification(title: string, body: string): Promise<string> {
    return this.scheduleNotification(
      `immediate-${Date.now()}`,
      title,
      body,
      null // null trigger means immediate
    );
  }

  // Send achievement notification
  async sendAchievementNotification(achievement: string): Promise<string> {
    return this.scheduleNotification(
      `achievement-${Date.now()}`,
      '🎉 Achievement Unlocked!',
      `Congratulations! You've achieved: ${achievement}`,
      null
    );
  }

  // Send goal reminder notification
  async sendGoalReminderNotification(goal: string, progress: number): Promise<string> {
    const percentage = Math.round(progress * 100);
    return this.scheduleNotification(
      `goal-reminder-${Date.now()}`,
      '🎯 Goal Progress Update',
      `You're ${percentage}% towards your ${goal} goal! Keep going!`,
      null
    );
  }

  // Send health alert notification
  async sendHealthAlertNotification(type: string, message: string): Promise<string> {
    return this.scheduleNotification(
      `health-alert-${Date.now()}`,
      `⚠️ Health Alert - ${type}`,
      message,
      null
    );
  }

  // Send streak notification
  async sendStreakNotification(days: number, type: string): Promise<string> {
    return this.scheduleNotification(
      `streak-${Date.now()}`,
      '🔥 Streak Alert!',
      `Amazing! You've maintained your ${type} streak for ${days} days!`,
      null
    );
  }

  // Get all scheduled notifications
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }
}

export default new NotificationService(); 