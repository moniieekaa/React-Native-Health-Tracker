import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { registerUser, clearError } from '../store/slices/authSlice';

const SignupScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      await dispatch(registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      })).unwrap();
      
      Alert.alert('Success', 'Account created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Registration failed');
    }
  };

  return (
    <LinearGradient
      colors={[colors.secondary, colors.primary, '#ffb300']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <Animated.View entering={FadeInDown.duration(800)}>
              <Text style={[styles.title, { color: colors.onPrimary }]} variant="displayMedium">
                Create Account
              </Text>
              <Text style={[styles.subtitle, { color: colors.onPrimary }]} variant="titleMedium">
                Join us to track your health
              </Text>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.form}>
              {error && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {error}
                </Text>
              )}
              <TextInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
                autoCapitalize="words"
                left={<TextInput.Icon icon="account" />}
                theme={{ colors: { primary: colors.primary } }}
                disabled={loading}
              />
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
              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry
                left={<TextInput.Icon icon="lock-check" />}
                theme={{ colors: { primary: colors.primary } }}
                disabled={loading}
              />
              <Button
                mode="contained"
                onPress={handleSignup}
                loading={loading}
                disabled={loading}
                style={styles.button}
                contentStyle={{ paddingVertical: 8 }}
                labelStyle={{ fontWeight: 'bold', fontSize: 18 }}
                buttonColor={colors.primary}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>
              <TouchableOpacity onPress={() => navigation.navigate('Login' as never)} disabled={loading}>
                <Text style={[styles.loginText, { color: colors.onPrimary }]}>
                  Already have an account? <Text style={{ color: '#ffb300' }}>Log In</Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
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
  loginText: {
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

export default SignupScreen;
