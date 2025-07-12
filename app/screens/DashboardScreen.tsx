import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { Text, Card, useTheme, IconButton, Avatar } from 'react-native-paper';
import Animated, { FadeInUp, FadeInLeft } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadTodayHealthData } from '../store/slices/healthSlice';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
};

const DashboardScreen: React.FC = () => {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { todayData, loading } = useAppSelector((state) => state.health);
  const [refreshing, setRefreshing] = useState(false);

  const loadHealthData = async () => {
    if (user) {
      await dispatch(loadTodayHealthData(user.id));
    }
  };

  useEffect(() => {
    loadHealthData();
  }, [dispatch, user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHealthData();
    setRefreshing(false);
  };

  // Helper function to get target values
  const getTargetValue = (type: string) => {
    const targets = {
      steps: 10000,
      water: 8,
      sleep: 8,
      meals: 2000,
      heartRate: 80,
      mood: 5,
    };
    return targets[type as keyof typeof targets] || 0;
  };

  // Helper function to format value for display
  const formatValue = (type: string, value: number) => {
    switch (type) {
      case 'steps':
        return value.toLocaleString();
      case 'water':
        return value.toString();
      case 'sleep':
        return `${value}h`;
      case 'meals':
        return value.toLocaleString();
      case 'heartRate':
        return value.toString();
      case 'mood':
        const moods = ['', '😢', '😐', '🙂', '😊', '🤩'];
        return moods[value] || '😐';
      default:
        return value.toString();
    }
  };

  // Helper function to get target display text
  const getTargetDisplay = (type: string) => {
    const targets = {
      steps: '10,000',
      water: '8',
      sleep: '8h',
      meals: '2,000',
      heartRate: '60-100',
      mood: 'Good',
    };
    return targets[type as keyof typeof targets] || '';
  };

  // Helper function to get progress percentage
  const getProgress = (type: string, value: number) => {
    const target = getTargetValue(type);
    if (target === 0) return 0;
    return Math.min(value / target, 1);
  };

  // Helper function to get color for each health type
  const getColor = (type: string) => {
    const colors = {
      steps: '#4f8cff',
      water: '#00c896',
      sleep: '#ffb300',
      meals: '#ff5252',
      heartRate: '#9c27b0',
      mood: '#4caf50',
    };
    return colors[type as keyof typeof colors] || '#666';
  };

  // Helper function to get icon for each health type
  const getIcon = (type: string) => {
    const icons = {
      steps: 'walk',
      water: 'cup-water',
      sleep: 'sleep',
      meals: 'food-apple',
      heartRate: 'heart-pulse',
      mood: 'emoticon-happy',
    };
    return icons[type as keyof typeof icons] || 'help-circle';
  };

  // Create health data array from today's data
  const healthData = Object.entries(todayData).map(([type, value]) => ({
    title: type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1'),
    value: formatValue(type, value),
    target: getTargetDisplay(type),
    icon: getIcon(type),
    color: getColor(type),
    progress: getProgress(type, value),
    type,
  }));

  // Add default cards for empty data
  const defaultHealthData = [
    { title: 'Steps', value: '0', target: '10,000', icon: 'walk', color: '#4f8cff', progress: 0, type: 'steps' },
    { title: 'Water', value: '0', target: '8', icon: 'cup-water', color: '#00c896', progress: 0, type: 'water' },
    { title: 'Sleep', value: '0h', target: '8h', icon: 'sleep', color: '#ffb300', progress: 0, type: 'sleep' },
    { title: 'Calories', value: '0', target: '2,000', icon: 'food-apple', color: '#ff5252', progress: 0, type: 'meals' },
    { title: 'Heart Rate', value: '0', target: '60-100', icon: 'heart-pulse', color: '#9c27b0', progress: 0, type: 'heartRate' },
    { title: 'Mood', value: '😐', target: 'Good', icon: 'emoticon-happy', color: '#4caf50', progress: 0, type: 'mood' },
  ];

  // Merge real data with defaults
  const displayData = defaultHealthData.map(defaultItem => {
    const realData = healthData.find(item => item.type === defaultItem.type);
    return realData || defaultItem;
  });

  const renderHealthCard = (item: any, index: number) => (
    <Animated.View
      key={item.title}
      entering={FadeInUp.delay(index * 100).duration(600)}
      style={styles.cardContainer}
    >
      <TouchableOpacity>
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <IconButton
                  icon={item.icon}
                  size={24}
                  iconColor={item.color}
                  style={styles.icon}
                />
              </View>
              <View style={styles.cardInfo}>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  {item.title}
                </Text>
                <Text variant="headlineSmall" style={[styles.cardValue, { color: item.color }]}>
                  {item.value}
                </Text>
                <Text variant="bodySmall" style={styles.cardTarget}>
                  Target: {item.target}
                </Text>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: colors.outline + '30' }]}>
                <View
                  style={[
                    styles.progressFill,
                    { backgroundColor: item.color, width: `${item.progress * 100}%` }
                  ]}
                />
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={[colors.background, colors.surface]}
      style={styles.gradient}
    >
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <Animated.View entering={FadeInLeft.duration(800)} style={styles.header}>
          <Text variant="headlineLarge" style={[styles.greeting, { color: colors.onSurface }]}>
            {getGreeting()}! 👋
          </Text>
          <Text variant="titleMedium" style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            Let's check your health today
          </Text>
        </Animated.View>

        <View style={styles.cardsGrid}>
          {displayData.map((item, index) => renderHealthCard(item, index))}
        </View>

        <Animated.View entering={FadeInUp.delay(600).duration(800)} style={styles.summaryCard}>
          <Card style={[styles.summaryCardInner, { backgroundColor: colors.primary }]}>
            <Card.Content style={styles.summaryContent}>
              <Text variant="titleLarge" style={[styles.summaryTitle, { color: colors.onPrimary }]}>
                Today's Summary
              </Text>
              <Text variant="bodyLarge" style={[styles.summaryText, { color: colors.onPrimary }]}>
                {Object.keys(todayData).length > 0 
                  ? "You're doing great! Keep up the healthy habits."
                  : "Start tracking your health data to see your progress here!"
                }
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
  greeting: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.8,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  cardContainer: {
    width: '48%',
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
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    borderRadius: 12,
    marginRight: 12,
  },
  icon: {
    margin: 0,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  cardValue: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cardTarget: {
    opacity: 0.6,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  summaryCard: {
    marginBottom: 24,
  },
  summaryCardInner: {
    borderRadius: 16,
    elevation: 3,
  },
  summaryContent: {
    padding: 20,
  },
  summaryTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryText: {
    opacity: 0.9,
  },
});

export default DashboardScreen;
