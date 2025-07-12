import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, useTheme, Switch, List, Divider, Button, IconButton } from 'react-native-paper';
import Animated, { FadeInUp, FadeInLeft } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setTheme, toggleNotifications } from '../store/slices/settingsSlice';
import { logoutUser } from '../store/slices/authSlice';
import notificationService, { NotificationSettings } from '../services/notificationService';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import healthService from '../services/healthService';

const SettingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const theme = settings.theme;
  const notificationsEnabled = settings.notificationsEnabled;
  const { user } = useAppSelector((state) => state.auth);
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    waterReminders: false,
    sleepReminders: false,
    exerciseReminders: false,
    mealReminders: false,
    waterReminderTime: '10:00',
    sleepReminderTime: '22:00',
    exerciseReminderTime: '18:00',
    mealReminderTime: '12:00',
  });

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const settings = await notificationService.getNotificationSettings();
      setNotificationSettings(settings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const handleThemeToggle = () => {
    dispatch(setTheme(theme === 'light' ? 'dark' : 'light'));
  };

  const handleNotificationToggle = async () => {
    const newValue = !notificationsEnabled;
    dispatch(toggleNotifications());
    
    if (newValue) {
      const hasPermission = await notificationService.requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Please enable notifications in your device settings to receive health reminders.');
        dispatch(toggleNotifications()); // Revert the toggle
      }
    }
  };

  const handleNotificationSettingToggle = async (setting: keyof NotificationSettings) => {
    if (!notificationsEnabled) {
      Alert.alert('Notifications Disabled', 'Please enable push notifications first to configure reminder settings.');
      return;
    }

    const newSettings = {
      ...notificationSettings,
      [setting]: !notificationSettings[setting],
    };
    
    setNotificationSettings(newSettings);
    
    try {
      await notificationService.saveNotificationSettings(newSettings);
      await notificationService.updateNotificationSchedules(newSettings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      Alert.alert('Error', 'Failed to update notification settings. Please try again.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {
          dispatch(logoutUser());
        }},
      ]
    );
  };

  const handleClearData = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to clear data.');
      return;
    }
    Alert.alert(
      'Clear Data',
      'This will permanently delete all your health data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear Data', style: 'destructive', onPress: async () => {
          try {
            await healthService.clearUserHealthData(user.id);
            Alert.alert('Success', 'All health data has been cleared.');
          } catch (error) {
            Alert.alert('Error', 'Failed to clear data.');
          }
        }},
      ]
    );
  };

  const handleExportData = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to export data.');
      return;
    }
    try {
      const csv = await healthService.exportUserHealthDataAsCSV(user.id);
      if (!csv) {
        Alert.alert('No Data', 'No health data to export.');
        return;
      }
      const fileUri = FileSystem.cacheDirectory + `health_data_${user.id}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Export Health Data' });
    } catch (error) {
      Alert.alert('Error', 'Failed to export data.');
    }
  };

  const handleTestNotification = async () => {
    try {
      await notificationService.sendImmediateNotification(
        'Test Notification',
        'This is a test notification to verify your notification settings are working!'
      );
      Alert.alert('Success', 'Test notification sent! Check your notification panel.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification. Please check your notification permissions.');
    }
  };

  const settingsSections = [
    {
      title: 'Appearance',
      items: [
        {
          title: 'Dark Mode',
          subtitle: 'Switch between light and dark theme',
          icon: 'theme-light-dark',
          action: <Switch value={theme === 'dark'} onValueChange={handleThemeToggle} />,
          onPress: undefined,
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          title: 'Push Notifications',
          subtitle: 'Receive reminders and updates',
          icon: 'bell',
          action: <Switch value={notificationsEnabled} onValueChange={handleNotificationToggle} />,
          onPress: undefined,
        },
        {
          title: 'Water Reminders',
          subtitle: 'Get reminded to drink water',
          icon: 'cup-water',
          action: <Switch 
            value={notificationSettings.waterReminders && notificationsEnabled} 
            onValueChange={() => handleNotificationSettingToggle('waterReminders')}
            disabled={!notificationsEnabled}
          />,
          onPress: undefined,
        },
        {
          title: 'Sleep Reminders',
          subtitle: 'Get reminded to go to bed',
          icon: 'sleep',
          action: <Switch 
            value={notificationSettings.sleepReminders && notificationsEnabled} 
            onValueChange={() => handleNotificationSettingToggle('sleepReminders')}
            disabled={!notificationsEnabled}
          />,
          onPress: undefined,
        },
        {
          title: 'Exercise Reminders',
          subtitle: 'Get reminded to move',
          icon: 'walk',
          action: <Switch 
            value={notificationSettings.exerciseReminders && notificationsEnabled} 
            onValueChange={() => handleNotificationSettingToggle('exerciseReminders')}
            disabled={!notificationsEnabled}
          />,
          onPress: undefined,
        },
        {
          title: 'Meal Reminders',
          subtitle: 'Get reminded to log meals',
          icon: 'food-apple',
          action: <Switch 
            value={notificationSettings.mealReminders && notificationsEnabled} 
            onValueChange={() => handleNotificationSettingToggle('mealReminders')}
            disabled={!notificationsEnabled}
          />,
          onPress: undefined,
        },
        {
          title: 'Test Notifications',
          subtitle: 'Send a test notification',
          icon: 'bell-ring',
          action: null,
          onPress: handleTestNotification,
        },
      ],
    },
    {
      title: 'Data & Privacy',
      items: [
        {
          title: 'Export Data',
          subtitle: 'Download your health data',
          icon: 'download',
          action: null,
          onPress: handleExportData,
        },
        {
          title: 'Clear Data',
          subtitle: 'Delete all stored data',
          icon: 'delete',
          action: null,
          onPress: handleClearData,
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          title: 'Version',
          subtitle: '1.0.0',
          icon: 'information',
          action: null,
          onPress: undefined,
        },
        {
          title: 'Terms of Service',
          subtitle: 'Read our terms and conditions',
          icon: 'file-document',
          action: null,
          onPress: undefined,
        },
        {
          title: 'Privacy Policy',
          subtitle: 'Learn about data usage',
          icon: 'shield-check',
          action: null,
          onPress: undefined,
        },
      ],
    },
  ];

  return (
    <LinearGradient
      colors={[colors.background, colors.surface]}
      style={styles.gradient}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInLeft.duration(800)} style={styles.header}>
          <Text variant="headlineLarge" style={[styles.title, { color: colors.onSurface }]}>
            Settings
          </Text>
          <Text variant="titleMedium" style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            Customize your experience
          </Text>
        </Animated.View>

        {settingsSections.map((section, sectionIndex) => (
          <Animated.View
            key={section.title}
            entering={FadeInUp.delay(sectionIndex * 100).duration(600)}
            style={styles.section}
          >
            <Card style={[styles.card, { backgroundColor: colors.surface }]}>
              <Card.Content style={styles.cardContent}>
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.onSurface }]}>
                  {section.title}
                </Text>
                {section.items.map((item, itemIndex) => (
                  <View key={item.title}>
                    <TouchableOpacity
                      onPress={item.onPress}
                      disabled={!item.onPress}
                      style={item.onPress ? styles.touchableItem : undefined}
                    >
                      <List.Item
                        title={item.title}
                        description={item.subtitle}
                        left={(props) => <List.Icon {...props} icon={item.icon} />}
                        right={() => item.action}
                        style={styles.listItem}
                        titleStyle={[styles.listItemTitle, { color: colors.onSurface }]}
                        descriptionStyle={[styles.listItemDescription, { color: colors.onSurfaceVariant }]}
                      />
                    </TouchableOpacity>
                    {itemIndex < section.items.length - 1 && (
                      <Divider style={styles.divider} />
                    )}
                  </View>
                ))}
              </Card.Content>
            </Card>
          </Animated.View>
        ))}

        <Animated.View entering={FadeInUp.delay(600).duration(800)} style={styles.logoutSection}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={[styles.logoutButton, { borderColor: colors.error }]}
            textColor={colors.error}
            icon="logout"
          >
            Logout
          </Button>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.8,
  },
  section: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardContent: {
    padding: 0,
  },
  sectionTitle: {
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  listItem: {
    paddingVertical: 8,
  },
  listItemTitle: {
    fontWeight: '600',
  },
  listItemDescription: {
    opacity: 0.8,
  },
  divider: {
    marginLeft: 56,
  },
  touchableItem: {
    opacity: 0.8,
  },
  logoutSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logoutButton: {
    borderRadius: 12,
    paddingHorizontal: 32,
  },
});

export default SettingsScreen; 