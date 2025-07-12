import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4f8cff', // blue
    tertiary: '#ffb300', // orange
    background: '#f5f6fa',
    surface: '#fff',
    onSurface: '#222',
    secondary: '#00c896', // teal
    error: '#ff5252',
    onPrimary: '#fff',
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#4f8cff',
    tertiary: '#ffb300',
    background: '#181a20',
    surface: '#232634',
    onSurface: '#fff',
    secondary: '#00c896',
    error: '#ff5252',
    onPrimary: '#fff',
  },
}; 