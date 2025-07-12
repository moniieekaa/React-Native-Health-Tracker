import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, useTheme, Button, TextInput, IconButton, SegmentedButtons } from 'react-native-paper';
import Animated, { FadeInUp, FadeInLeft } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addHealthData } from '../store/slices/healthSlice';
import notificationService from '../services/notificationService';

const TrackerScreen: React.FC = () => {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { loading } = useAppSelector((state) => state.health);
  
  const [activeTab, setActiveTab] = useState('steps');
  const [steps, setSteps] = useState('');
  const [water, setWater] = useState('');
  const [sleep, setSleep] = useState('');
  const [calories, setCalories] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [mood, setMood] = useState('');

  const checkAndSendAchievements = async (type: string, value: number) => {
    try {
      switch (type) {
        case 'steps':
          if (value >= 10000) {
            await notificationService.sendAchievementNotification('10,000 Steps Goal! 🚶‍♂️');
          } else if (value >= 5000) {
            await notificationService.sendGoalReminderNotification('Daily Steps', value / 10000);
          }
          break;
        case 'water':
          if (value >= 8) {
            await notificationService.sendAchievementNotification('8 Glasses of Water Goal! 💧');
          } else if (value >= 4) {
            await notificationService.sendGoalReminderNotification('Daily Water Intake', value / 8);
          }
          break;
        case 'sleep':
          if (value >= 8 && value <= 9) {
            await notificationService.sendAchievementNotification('Perfect Sleep Goal! 😴');
          } else if (value < 6) {
            await notificationService.sendHealthAlertNotification('Sleep', 'You slept less than 6 hours. Consider getting more rest!');
          }
          break;
        case 'meals':
          if (value >= 2000) {
            await notificationService.sendAchievementNotification('Daily Calorie Goal! 🍽️');
          } else if (value >= 1500) {
            await notificationService.sendGoalReminderNotification('Daily Calories', value / 2000);
          }
          break;
        case 'heartRate':
          if (value >= 60 && value <= 100) {
            await notificationService.sendAchievementNotification('Healthy Heart Rate! ❤️');
          } else if (value > 100) {
            await notificationService.sendHealthAlertNotification('Heart Rate', 'Your heart rate is elevated. Consider resting or consulting a doctor.');
          }
          break;
        case 'mood':
          if (value >= 4) {
            await notificationService.sendAchievementNotification('Great Mood! 😊');
          }
          break;
      }
    } catch (error) {
      console.error('Error sending achievement notification:', error);
    }
  };

  const trackerTabs = [
    { value: 'steps', label: 'Steps', icon: 'walk' },
    { value: 'water', label: 'Water', icon: 'cup-water' },
    { value: 'sleep', label: 'Sleep', icon: 'sleep' },
    { value: 'meals', label: 'Meals', icon: 'food-apple' },
    { value: 'heart', label: 'Heart', icon: 'heart-pulse' },
    { value: 'mood', label: 'Mood', icon: 'emoticon-happy' },
  ];

  const handleLogData = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to track health data');
      return;
    }

    let value: number;
    let type: string;

    switch (activeTab) {
      case 'steps':
        value = parseInt(steps);
        type = 'steps';
        if (!steps || isNaN(value) || value < 0) {
          Alert.alert('Error', 'Please enter a valid number of steps');
          return;
        }
        break;
      case 'water':
        value = parseInt(water);
        type = 'water';
        if (!water || isNaN(value) || value < 0) {
          Alert.alert('Error', 'Please enter a valid number of glasses');
          return;
        }
        break;
      case 'sleep':
        value = parseFloat(sleep);
        type = 'sleep';
        if (!sleep || isNaN(value) || value < 0 || value > 24) {
          Alert.alert('Error', 'Please enter a valid number of hours (0-24)');
          return;
        }
        break;
      case 'meals':
        value = parseInt(calories);
        type = 'meals';
        if (!calories || isNaN(value) || value < 0) {
          Alert.alert('Error', 'Please enter a valid number of calories');
          return;
        }
        break;
      case 'heart':
        value = parseInt(heartRate);
        type = 'heartRate';
        if (!heartRate || isNaN(value) || value < 0 || value > 300) {
          Alert.alert('Error', 'Please enter a valid heart rate (0-300)');
          return;
        }
        break;
      case 'mood':
        value = ['😢', '😐', '🙂', '😊', '🤩'].indexOf(mood) + 1;
        type = 'mood';
        if (!mood) {
          Alert.alert('Error', 'Please select your mood');
          return;
        }
        break;
      default:
        return;
    }

    try {
      await dispatch(addHealthData({
        userId: user.id,
        type: type as any,
        value,
      })).unwrap();
      
      Alert.alert('Success', `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} logged successfully!`);
      
      // Check for achievements and send notifications
      await checkAndSendAchievements(type, value);
      
      // Clear the input after successful logging
      switch (activeTab) {
        case 'steps':
          setSteps('');
          break;
        case 'water':
          setWater('');
          break;
        case 'sleep':
          setSleep('');
          break;
        case 'meals':
          setCalories('');
          break;
        case 'heart':
          setHeartRate('');
          break;
        case 'mood':
          setMood('');
          break;
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to log data');
    }
  };

  const renderInputForm = () => {
    switch (activeTab) {
      case 'steps':
        return (
          <View style={styles.inputContainer}>
            <TextInput
              label="Steps Count"
              value={steps}
              onChangeText={setSteps}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
              left={<TextInput.Icon icon="walk" />}
              placeholder="Enter your steps"
              disabled={loading}
            />
            <Text style={[styles.hint, { color: colors.onSurfaceVariant }]}>
              Target: 10,000 steps per day
            </Text>
          </View>
        );
      case 'water':
        return (
          <View style={styles.inputContainer}>
            <TextInput
              label="Water Intake (glasses)"
              value={water}
              onChangeText={setWater}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
              left={<TextInput.Icon icon="cup-water" />}
              placeholder="Number of glasses"
              disabled={loading}
            />
            <Text style={[styles.hint, { color: colors.onSurfaceVariant }]}>
              Target: 8 glasses per day
            </Text>
          </View>
        );
      case 'sleep':
        return (
          <View style={styles.inputContainer}>
            <TextInput
              label="Sleep Hours"
              value={sleep}
              onChangeText={setSleep}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
              left={<TextInput.Icon icon="sleep" />}
              placeholder="Hours slept"
              disabled={loading}
            />
            <Text style={[styles.hint, { color: colors.onSurfaceVariant }]}>
              Target: 7-9 hours per night
            </Text>
          </View>
        );
      case 'meals':
        return (
          <View style={styles.inputContainer}>
            <TextInput
              label="Calories Consumed"
              value={calories}
              onChangeText={setCalories}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
              left={<TextInput.Icon icon="food-apple" />}
              placeholder="Daily calories"
              disabled={loading}
            />
            <Text style={[styles.hint, { color: colors.onSurfaceVariant }]}>
              Target: 2,000 calories per day
            </Text>
          </View>
        );
      case 'heart':
        return (
          <View style={styles.inputContainer}>
            <TextInput
              label="Heart Rate (BPM)"
              value={heartRate}
              onChangeText={setHeartRate}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
              left={<TextInput.Icon icon="heart-pulse" />}
              placeholder="Beats per minute"
              disabled={loading}
            />
            <Text style={[styles.hint, { color: colors.onSurfaceVariant }]}>
              Normal range: 60-100 BPM
            </Text>
          </View>
        );
      case 'mood':
        return (
          <View style={styles.inputContainer}>
            <View style={styles.moodContainer}>
              <Text style={[styles.moodTitle, { color: colors.onSurface }]}>
                How are you feeling today?
              </Text>
              <View style={styles.moodButtons}>
                {['😢', '😐', '🙂', '😊', '🤩'].map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.moodButton,
                      { backgroundColor: mood === emoji ? colors.primary : colors.surfaceVariant }
                    ]}
                    onPress={() => setMood(emoji)}
                    disabled={loading}
                  >
                    <Text style={styles.moodEmoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <LinearGradient
      colors={[colors.background, colors.surface]}
      style={styles.gradient}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInLeft.duration(800)} style={styles.header}>
          <Text variant="headlineLarge" style={[styles.title, { color: colors.onSurface }]}>
            Health Tracker
          </Text>
          <Text variant="titleMedium" style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            Log your daily health data
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            <SegmentedButtons
              value={activeTab}
              onValueChange={setActiveTab}
              buttons={trackerTabs.map(tab => ({
                value: tab.value,
                label: tab.label,
                icon: tab.icon,
              }))}
              style={styles.segmentedButtons}
            />
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(800)} style={styles.formCard}>
          <Card style={[styles.card, { backgroundColor: colors.surface }]}>
            <Card.Content style={styles.cardContent}>
              {renderInputForm()}
              <Button
                mode="contained"
                onPress={handleLogData}
                loading={loading}
                disabled={loading}
                style={styles.logButton}
                buttonColor={colors.primary}
                icon="plus"
              >
                {loading ? 'Logging...' : 'Log Data'}
              </Button>
            </Card.Content>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600).duration(800)} style={styles.tipsCard}>
          <Card style={[styles.card, { backgroundColor: colors.primary }]}>
            <Card.Content style={styles.tipsContent}>
              <Text variant="titleMedium" style={[styles.tipsTitle, { color: colors.onPrimary }]}>
                💡 Health Tip
              </Text>
              <Text variant="bodyLarge" style={[styles.tipsText, { color: colors.onPrimary }]}>
                Consistency is key! Try to log your health data at the same time each day for better tracking.
              </Text>
            </Card.Content>
          </Card>
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
  tabsContainer: {
    marginBottom: 16,
  },
  segmentedButtons: {
    borderRadius: 12,
  },
  tabsScroll: {
    alignItems: 'center',
  },
  formCard: {
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
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  moodContainer: {
    alignItems: 'center',
  },
  moodTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  moodButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  moodButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  moodEmoji: {
    fontSize: 24,
  },
  logButton: {
    borderRadius: 12,
    marginTop: 8,
  },
  tipsCard: {
    marginBottom: 24,
  },
  tipsContent: {
    padding: 20,
  },
  tipsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipsText: {
    opacity: 0.9,
  },
});

export default TrackerScreen;
