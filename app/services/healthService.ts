import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HealthData {
  id: string;
  userId: string;
  type: 'steps' | 'water' | 'sleep' | 'meals' | 'heartRate' | 'mood';
  value: number;
  date: string; // YYYY-MM-DD format
  timestamp: number;
}

class HealthService {
  private readonly HEALTH_DATA_KEY = 'healthData';

  // Add health data
  async addHealthData(userId: string, type: HealthData['type'], value: number): Promise<HealthData> {
    try {
      const existingData = await this.getHealthData();
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Check if data for today already exists
      const existingIndex = existingData.findIndex(
        data => data.userId === userId && data.type === type && data.date === today
      );

      const newHealthData: HealthData = {
        id: Date.now().toString(),
        userId,
        type,
        value,
        date: today,
        timestamp: Date.now(),
      };

      let updatedData: HealthData[];
      if (existingIndex !== -1) {
        // Update existing data for today
        updatedData = [...existingData];
        updatedData[existingIndex] = newHealthData;
      } else {
        // Add new data
        updatedData = [...existingData, newHealthData];
      }

      await AsyncStorage.setItem(this.HEALTH_DATA_KEY, JSON.stringify(updatedData));
      return newHealthData;
    } catch (error) {
      console.error('Add health data error:', error);
      throw error;
    }
  }

  // Get health data for a user
  async getUserHealthData(userId: string, date?: string): Promise<HealthData[]> {
    try {
      const allData = await this.getHealthData();
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      return allData.filter(
        data => data.userId === userId && data.date === targetDate
      );
    } catch (error) {
      console.error('Get user health data error:', error);
      return [];
    }
  }

  // Get today's health data for a user
  async getTodayHealthData(userId: string): Promise<Record<string, number>> {
    try {
      const todayData = await this.getUserHealthData(userId);
      const result: Record<string, number> = {};
      
      todayData.forEach(data => {
        result[data.type] = data.value;
      });
      
      return result;
    } catch (error) {
      console.error('Get today health data error:', error);
      return {};
    }
  }

  // Get health data for the last N days
  async getHealthDataForPeriod(userId: string, days: number): Promise<HealthData[]> {
    try {
      const allData = await this.getHealthData();
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      return allData.filter(data => {
        if (data.userId !== userId) return false;
        const dataDate = new Date(data.date);
        return dataDate >= startDate && dataDate <= endDate;
      });
    } catch (error) {
      console.error('Get health data for period error:', error);
      return [];
    }
  }

  // Export all health data for a user as CSV
  async exportUserHealthDataAsCSV(userId: string): Promise<string> {
    const allData = await this.getUserHealthData(userId);
    if (!allData.length) return '';
    const header = 'Date,Type,Value\n';
    const rows = allData.map(d => `${d.date},${d.type},${d.value}`);
    return header + rows.join('\n');
  }

  // Get all health data
  private async getHealthData(): Promise<HealthData[]> {
    try {
      const data = await AsyncStorage.getItem(this.HEALTH_DATA_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Get health data error:', error);
      return [];
    }
  }

  // Clear all health data for a user
  async clearUserHealthData(userId: string): Promise<void> {
    try {
      const allData = await this.getHealthData();
      const filteredData = allData.filter(data => data.userId !== userId);
      await AsyncStorage.setItem(this.HEALTH_DATA_KEY, JSON.stringify(filteredData));
    } catch (error) {
      console.error('Clear user health data error:', error);
      throw error;
    }
  }
}

export default new HealthService(); 