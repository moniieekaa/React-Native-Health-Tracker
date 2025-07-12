import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import healthService, { HealthData } from '../../services/healthService';

interface HealthState {
  todayData: Record<string, number>;
  loading: boolean;
  error: string | null;
}

const initialState: HealthState = {
  todayData: {},
  loading: false,
  error: null,
};

// Async thunks
export const addHealthData = createAsyncThunk(
  'health/addData',
  async ({ userId, type, value }: { userId: string; type: HealthData['type']; value: number }, { rejectWithValue }) => {
    try {
      const healthData = await healthService.addHealthData(userId, type, value);
      return healthData;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadTodayHealthData = createAsyncThunk(
  'health/loadTodayData',
  async (userId: string, { rejectWithValue }) => {
    try {
      const todayData = await healthService.getTodayHealthData(userId);
      return todayData;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadHealthDataForPeriod = createAsyncThunk(
  'health/loadPeriodData',
  async ({ userId, days }: { userId: string; days: number }, { rejectWithValue }) => {
    try {
      const periodData = await healthService.getHealthDataForPeriod(userId, days);
      return periodData;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    clearHealthError: (state) => {
      state.error = null;
    },
    updateTodayData: (state, action) => {
      state.todayData = { ...state.todayData, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Add health data
      .addCase(addHealthData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addHealthData.fulfilled, (state, action) => {
        state.loading = false;
        // Update today's data with the new value
        state.todayData[action.payload.type] = action.payload.value;
        state.error = null;
      })
      .addCase(addHealthData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Load today's data
      .addCase(loadTodayHealthData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTodayHealthData.fulfilled, (state, action) => {
        state.loading = false;
        state.todayData = action.payload;
        state.error = null;
      })
      .addCase(loadTodayHealthData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearHealthError, updateTodayData } = healthSlice.actions;
export default healthSlice.reducer; 