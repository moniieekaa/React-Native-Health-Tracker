import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import store from './app/store';
import AppNavigator from './app/navigation/AppNavigator';
import { lightTheme, darkTheme } from './app/utils/theme';
import { useAppSelector } from './app/store/hooks';

const ThemedApp = () => {
  const themeType = useAppSelector((state) => (state as any).settings.theme);
  const theme = themeType === 'dark' ? darkTheme : lightTheme;
  return (
    <PaperProvider theme={theme}>
      <AppNavigator />
    </PaperProvider>
  );
};

export default function App() {
  return (
    <ReduxProvider store={store}>
      <ThemedApp />
    </ReduxProvider>
  );
}
