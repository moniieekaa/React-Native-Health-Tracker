import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { Text, Card, useTheme, SegmentedButtons } from 'react-native-paper';
import Animated, { FadeInUp, FadeInLeft } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart, ProgressChart } from 'react-native-chart-kit';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadHealthDataForPeriod } from '../store/slices/healthSlice';

const { width } = Dimensions.get('window');

const AnalyticsScreen: React.FC = () => {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { loading } = useAppSelector((state) => state.health);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('7');
  const [healthData, setHealthData] = useState<any[]>([]);

  const timeRanges = [
    { value: '7', label: '7 Days' },
    { value: '14', label: '14 Days' },
    { value: '30', label: '30 Days' },
  ];

  const loadAnalyticsData = async () => {
    if (user) {
      try {
        const result = await dispatch(loadHealthDataForPeriod({ 
          userId: user.id, 
          days: parseInt(timeRange) 
        })).unwrap();
        setHealthData(result);
      } catch (error) {
        console.error('Failed to load analytics data:', error);
      }
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [dispatch, user, timeRange]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  // Process data for charts
  const processChartData = () => {
    const dates: string[] = [];
    const stepsData: number[] = [];
    const waterData: number[] = [];
    const sleepData: number[] = [];
    const caloriesData: number[] = [];

    // Group data by date
    const groupedData: Record<string, any> = {};
    healthData.forEach(item => {
      if (!groupedData[item.date]) {
        groupedData[item.date] = {};
      }
      groupedData[item.date][item.type] = item.value;
    });

    // Sort dates and create chart data
    const sortedDates = Object.keys(groupedData).sort();
    sortedDates.forEach(date => {
      const data = groupedData[date];
      const dateObj = new Date(date);
      dates.push(`${dateObj.getMonth() + 1}/${dateObj.getDate()}`);
      stepsData.push(data.steps || 0);
      waterData.push(data.water || 0);
      sleepData.push(data.sleep || 0);
      caloriesData.push(data.meals || 0);
    });

    return { dates, stepsData, waterData, sleepData, caloriesData };
  };

  const { dates, stepsData, waterData, sleepData, caloriesData } = processChartData();

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(79, 140, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  const renderStepsChart = () => (
    <Card style={[styles.chartCard, { backgroundColor: colors.surface }]}>
      <Card.Content style={styles.chartContent}>
        <Text variant="titleMedium" style={[styles.chartTitle, { color: colors.onSurface }]}>
          Steps Progress
        </Text>
        {stepsData.length > 0 ? (
          <LineChart
            data={{
              labels: dates,
              datasets: [{ data: stepsData }],
            }}
            width={width - 64}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={[styles.noDataText, { color: colors.onSurfaceVariant }]}>
              No steps data available
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderWaterChart = () => (
    <Card style={[styles.chartCard, { backgroundColor: colors.surface }]}>
      <Card.Content style={styles.chartContent}>
        <Text variant="titleMedium" style={[styles.chartTitle, { color: colors.onSurface }]}>
          Water Intake
        </Text>
        {waterData.length > 0 ? (
          <BarChart
            data={{
              labels: dates,
              datasets: [{ data: waterData }],
            }}
            width={width - 64}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(0, 200, 150, ${opacity})`,
            }}
            style={styles.chart}
            yAxisLabel=""
            yAxisSuffix=""
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={[styles.noDataText, { color: colors.onSurfaceVariant }]}>
              No water intake data available
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderSleepChart = () => (
    <Card style={[styles.chartCard, { backgroundColor: colors.surface }]}>
      <Card.Content style={styles.chartContent}>
        <Text variant="titleMedium" style={[styles.chartTitle, { color: colors.onSurface }]}>
          Sleep Hours
        </Text>
        {sleepData.length > 0 ? (
          <LineChart
            data={{
              labels: dates,
              datasets: [{ data: sleepData }],
            }}
            width={width - 64}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(255, 179, 0, ${opacity})`,
            }}
            bezier
            style={styles.chart}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={[styles.noDataText, { color: colors.onSurfaceVariant }]}>
              No sleep data available
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderCaloriesChart = () => (
    <Card style={[styles.chartCard, { backgroundColor: colors.surface }]}>
      <Card.Content style={styles.chartContent}>
        <Text variant="titleMedium" style={[styles.chartTitle, { color: colors.onSurface }]}>
          Calories Consumed
        </Text>
        {caloriesData.length > 0 ? (
          <BarChart
            data={{
              labels: dates,
              datasets: [{ data: caloriesData }],
            }}
            width={width - 64}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(255, 82, 82, ${opacity})`,
            }}
            style={styles.chart}
            yAxisLabel=""
            yAxisSuffix=""
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={[styles.noDataText, { color: colors.onSurfaceVariant }]}>
              No calories data available
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderSummaryStats = () => {
    if (healthData.length === 0) return null;

    const totalSteps = stepsData.reduce((sum, val) => sum + val, 0);
    const avgWater = waterData.length > 0 ? waterData.reduce((sum, val) => sum + val, 0) / waterData.length : 0;
    const avgSleep = sleepData.length > 0 ? sleepData.reduce((sum, val) => sum + val, 0) / sleepData.length : 0;
    const totalCalories = caloriesData.reduce((sum, val) => sum + val, 0);

    return (
      <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.summaryCard}>
        <Card style={[styles.summaryCardInner, { backgroundColor: colors.primary }]}>
          <Card.Content style={styles.summaryContent}>
            <Text variant="titleLarge" style={[styles.summaryTitle, { color: colors.onPrimary }]}>
              Analytics Summary
            </Text>
            <View style={styles.summaryStats}>
              <View style={styles.summaryStat}>
                <Text variant="headlineSmall" style={[styles.summaryValue, { color: colors.onPrimary }]}>
                  {totalSteps.toLocaleString()}
                </Text>
                <Text variant="bodySmall" style={[styles.summaryLabel, { color: colors.onPrimary }]}>
                  Total Steps
                </Text>
              </View>
              <View style={styles.summaryStat}>
                <Text variant="headlineSmall" style={[styles.summaryValue, { color: colors.onPrimary }]}>
                  {avgWater.toFixed(1)}
                </Text>
                <Text variant="bodySmall" style={[styles.summaryLabel, { color: colors.onPrimary }]}>
                  Avg Water
                </Text>
              </View>
              <View style={styles.summaryStat}>
                <Text variant="headlineSmall" style={[styles.summaryValue, { color: colors.onPrimary }]}>
                  {avgSleep.toFixed(1)}h
                </Text>
                <Text variant="bodySmall" style={[styles.summaryLabel, { color: colors.onPrimary }]}>
                  Avg Sleep
                </Text>
              </View>
              <View style={styles.summaryStat}>
                <Text variant="headlineSmall" style={[styles.summaryValue, { color: colors.onPrimary }]}>
                  {totalCalories.toLocaleString()}
                </Text>
                <Text variant="bodySmall" style={[styles.summaryLabel, { color: colors.onPrimary }]}>
                  Total Calories
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

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
          <Text variant="headlineLarge" style={[styles.title, { color: colors.onSurface }]}>
            Analytics 📊
          </Text>
          <Text variant="titleMedium" style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            Track your health progress over time
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.timeRangeContainer}>
          <SegmentedButtons
            value={timeRange}
            onValueChange={setTimeRange}
            buttons={timeRanges.map(range => ({
              value: range.value,
              label: range.label,
            }))}
            style={styles.segmentedButtons}
          />
        </Animated.View>

        {renderSummaryStats()}

        <Animated.View entering={FadeInUp.delay(400).duration(800)}>
          {renderStepsChart()}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500).duration(800)}>
          {renderWaterChart()}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600).duration(800)}>
          {renderSleepChart()}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(700).duration(800)}>
          {renderCaloriesChart()}
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
  timeRangeContainer: {
    marginBottom: 16,
  },
  segmentedButtons: {
    borderRadius: 12,
  },
  summaryCard: {
    marginBottom: 16,
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
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryStat: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    opacity: 0.8,
    textAlign: 'center',
  },
  chartCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 16,
  },
  chartContent: {
    padding: 20,
  },
  chartTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
});

export default AnalyticsScreen; 