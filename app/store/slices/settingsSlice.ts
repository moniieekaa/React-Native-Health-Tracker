import { createSlice } from '@reduxjs/toolkit';

interface SettingsState {
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
}

const initialState: SettingsState = {
  theme: 'light',
  notificationsEnabled: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action) => { state.theme = action.payload; },
    toggleNotifications: (state) => { state.notificationsEnabled = !state.notificationsEnabled; },
    resetSettings: () => initialState,
  },
});

export const { setTheme, toggleNotifications, resetSettings } = settingsSlice.actions;
export default settingsSlice.reducer; 