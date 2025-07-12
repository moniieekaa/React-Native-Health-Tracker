import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, clearError } from '../store/slices/authSlice';

const LoginScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Navigate to main app when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigation.navigate('Main' as never);
    }
  }, [isAuthenticated, navigation]);

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await dispatch(loginUser({
        email: email.trim().toLowerCase(),
        password,
      })).unwrap();
      
      Alert.alert('Success', 'Logged in successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Login failed');
    }
  };

  return (
    <LinearGradient
      colors={[colors.primary, '#ffb300', colors.secondary]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <Animated.View entering={FadeInDown.duration(800)}>
            <Text style={[styles.title, { color: colors.onPrimary }]} variant="displayMedium">
              Welcome Back
            </Text>
            <Text style={[styles.subtitle, { color: colors.onPrimary }]} variant="titleMedium">
              Sign in to continue
            </Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.form}>
            {error && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {error}
              </Text>
            )}
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon="email" />}
              theme={{ colors: { primary: colors.primary } }}
              disabled={loading}
            />
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry
              left={<TextInput.Icon icon="lock" />}
              theme={{ colors: { primary: colors.primary } }}
              disabled={loading}
            />
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={{ paddingVertical: 8 }}
              labelStyle={{ fontWeight: 'bold', fontSize: 18 }}
              buttonColor={colors.primary}
            >
              {loading ? 'Signing In...' : 'Log In'}
            </Button>
            <TouchableOpacity onPress={() => navigation.navigate('Signup' as never)} disabled={loading}>
              <Text style={[styles.signupText, { color: colors.onPrimary }]}>
                Don't have an account? <Text style={{ color: '#ffb300' }}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: 320,
    maxWidth: '100%',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
    shadowColor: '#4f8cff',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  signupText: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;
