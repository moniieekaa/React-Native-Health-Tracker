import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Card, useTheme, Avatar, Button, TextInput, IconButton } from 'react-native-paper';
import Animated, { FadeInUp, FadeInLeft } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { updateUserProfile } from '../store/slices/authSlice';

const ProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
  });
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // Initialize profile with user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        age: user.age?.toString() || '',
        gender: user.gender || '',
        height: user.height?.toString() || '',
        weight: user.weight?.toString() || '',
      });
      setProfilePhoto(user.profilePhoto || null);
    }
  }, [user]);

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload a photo.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setProfilePhoto(imageUri);
        
        // Save the photo to user profile
        if (user) {
          try {
            await dispatch(updateUserProfile({ 
              userId: user.id, 
              updates: { profilePhoto: imageUri } 
            })).unwrap();
          } catch (error) {
            console.error('Failed to save profile photo:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const calculateBMI = () => {
    const height = parseFloat(profile.height) / 100; // Convert to meters
    const weight = parseFloat(profile.weight);
    if (!height || !weight || height <= 0 || weight <= 0) return '0.0';
    const bmi = weight / (height * height);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: '#ffb300' };
    if (bmi < 25) return { category: 'Normal', color: '#4caf50' };
    if (bmi < 30) return { category: 'Overweight', color: '#ff9800' };
    return { category: 'Obese', color: '#f44336' };
  };

  const handleSaveProfile = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    // Validate required fields
    if (!profile.name.trim() || !profile.email.trim()) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Validate numeric fields
    const age = parseInt(profile.age);
    const height = parseFloat(profile.height);
    const weight = parseFloat(profile.weight);

    if (profile.age && (isNaN(age) || age < 1 || age > 120)) {
      Alert.alert('Error', 'Please enter a valid age (1-120)');
      return;
    }

    if (profile.height && (isNaN(height) || height < 50 || height > 300)) {
      Alert.alert('Error', 'Please enter a valid height (50-300 cm)');
      return;
    }

    if (profile.weight && (isNaN(weight) || weight < 20 || weight > 500)) {
      Alert.alert('Error', 'Please enter a valid weight (20-500 kg)');
      return;
    }

    try {
      const updates = {
        name: profile.name.trim(),
        email: profile.email.trim(),
        age: profile.age ? parseInt(profile.age) : undefined,
        gender: profile.gender.trim() || undefined,
        height: profile.height ? parseFloat(profile.height) : undefined,
        weight: profile.weight ? parseFloat(profile.weight) : undefined,
      };

      await dispatch(updateUserProfile({ userId: user.id, updates })).unwrap();
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    // Reset profile to current user data
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        age: user.age?.toString() || '',
        gender: user.gender || '',
        height: user.height?.toString() || '',
        weight: user.weight?.toString() || '',
      });
    }
    setIsEditing(false);
  };

  const bmi = calculateBMI();
  const bmiInfo = getBMICategory(parseFloat(bmi));

  // Don't render if no user
  if (!user) {
    return (
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <Text style={[styles.errorText, { color: colors.onSurface }]}>
            Please log in to view your profile
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.background, colors.surface]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={styles.container} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInLeft.duration(800)} style={styles.header}>
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                {profilePhoto ? (
                  <Avatar.Image
                    size={80}
                    source={{ uri: profilePhoto }}
                    style={[styles.avatar, { backgroundColor: colors.primary }]}
                  />
                ) : (
                  <Avatar.Text
                    size={80}
                    label={profile.name.split(' ').map(n => n[0]).join('') || 'U'}
                    style={[styles.avatar, { backgroundColor: colors.primary }]}
                  />
                )}
                <View style={[styles.photoEditButton, { backgroundColor: colors.primary }]}>
                  <IconButton
                    icon="camera"
                    size={16}
                    iconColor={colors.onPrimary}
                    style={styles.photoEditIcon}
                  />
                </View>
              </TouchableOpacity>
              <View style={styles.headerInfo}>
                <Text variant="headlineSmall" style={[styles.name, { color: colors.onSurface }]}>
                  {profile.name || 'User'}
                </Text>
                <Text variant="bodyLarge" style={[styles.email, { color: colors.onSurfaceVariant }]}>
                  {profile.email || 'No email'}
                </Text>
              </View>
              <IconButton
                icon={isEditing ? 'close' : 'pencil'}
                size={24}
                onPress={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
                style={[styles.editButton, { backgroundColor: colors.primary }]}
                iconColor={colors.onPrimary}
                disabled={loading}
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.bmiCard}>
            <Card style={[styles.card, { backgroundColor: colors.surface }]}>
              <Card.Content style={styles.bmiContent}>
                <Text variant="titleLarge" style={[styles.bmiTitle, { color: colors.onSurface }]}>
                  BMI Calculator
                </Text>
                <View style={styles.bmiInfo}>
                  <Text variant="displaySmall" style={[styles.bmiValue, { color: bmiInfo.color }]}>
                    {bmi}
                  </Text>
                  <Text variant="titleMedium" style={[styles.bmiCategory, { color: bmiInfo.color }]}>
                    {bmiInfo.category}
                  </Text>
                </View>
                {(!profile.height || !profile.weight) && (
                  <Text style={[styles.bmiHint, { color: colors.onSurfaceVariant }]}>
                    Enter your height and weight to calculate BMI
                  </Text>
                )}
              </Card.Content>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).duration(800)} style={styles.infoCard}>
            <Card style={[styles.card, { backgroundColor: colors.surface }]}>
              <Card.Content>
                <Text variant="titleLarge" style={[styles.sectionTitle, { color: colors.onSurface }]}>
                  Personal Information
                </Text>
                
                <View style={styles.inputRow}>
                  <TextInput
                    label="Full Name"
                    value={profile.name}
                    onChangeText={(text) => setProfile({ ...profile, name: text })}
                    mode="outlined"
                    style={[styles.input, { color: colors.onSurface }]}
                    disabled={!isEditing || loading}
                    left={<TextInput.Icon icon="account" />}
                    placeholder="Enter your full name"
                    textColor={colors.onSurface}
                  />
                </View>

                <View style={styles.inputRow}>
                  <TextInput
                    label="Email"
                    value={profile.email}
                    onChangeText={(text) => setProfile({ ...profile, email: text })}
                    mode="outlined"
                    style={[styles.input, { color: colors.onSurface }]}
                    disabled={!isEditing || loading}
                    left={<TextInput.Icon icon="email" />}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    textColor={colors.onSurface}
                  />
                </View>

                <View style={styles.inputRow}>
                  <TextInput
                    label="Age"
                    value={profile.age}
                    onChangeText={(text) => setProfile({ ...profile, age: text })}
                    mode="outlined"
                    style={[styles.input, { color: colors.onSurface }]}
                    disabled={!isEditing || loading}
                    keyboardType="numeric"
                    left={<TextInput.Icon icon="calendar" />}
                    placeholder="Enter your age"
                    textColor={colors.onSurface}
                  />
                  <TextInput
                    label="Gender"
                    value={profile.gender}
                    onChangeText={(text) => setProfile({ ...profile, gender: text })}
                    mode="outlined"
                    style={[styles.input, { color: colors.onSurface }]}
                    disabled={!isEditing || loading}
                    left={<TextInput.Icon icon="gender-male-female" />}
                    placeholder="Enter your gender"
                    textColor={colors.onSurface}
                  />
                </View>

                <View style={styles.inputRow}>
                  <TextInput
                    label="Height (cm)"
                    value={profile.height}
                    onChangeText={(text) => setProfile({ ...profile, height: text })}
                    mode="outlined"
                    style={[styles.input, { color: colors.onSurface }]}
                    disabled={!isEditing || loading}
                    keyboardType="numeric"
                    returnKeyType="next"
                    left={<TextInput.Icon icon="ruler" />}
                    placeholder="Enter your height"
                    textColor={colors.onSurface}
                  />
                  <TextInput
                    label="Weight (kg)"
                    value={profile.weight}
                    onChangeText={(text) => setProfile({ ...profile, weight: text })}
                    mode="outlined"
                    style={[styles.input, { color: colors.onSurface }]}
                    disabled={!isEditing || loading}
                    keyboardType="numeric"
                    returnKeyType="done"
                    left={<TextInput.Icon icon="scale" />}
                    placeholder="Enter your weight"
                    textColor={colors.onSurface}
                  />
                </View>

                {isEditing && (
                  <View style={styles.buttonRow}>
                    <Button
                      mode="outlined"
                      onPress={handleCancelEdit}
                      style={[styles.cancelButton, { borderColor: colors.outline }]}
                      textColor={colors.onSurface}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      mode="contained"
                      onPress={handleSaveProfile}
                      style={styles.saveButton}
                      buttonColor={colors.primary}
                      loading={loading}
                      disabled={loading}
                    >
                      Save Changes
                    </Button>
                  </View>
                )}
              </Card.Content>
            </Card>
          </Animated.View>
        </ScrollView>
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
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 100, // Add padding at the bottom for keyboard
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  photoEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  photoEditIcon: {
    width: 20,
    height: 20,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    opacity: 0.8,
  },
  editButton: {
    margin: 0,
  },
  bmiCard: {
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
  bmiContent: {
    padding: 20,
    alignItems: 'center',
  },
  bmiTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  bmiInfo: {
    alignItems: 'center',
  },
  bmiValue: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bmiCategory: {
    fontWeight: '600',
  },
  bmiHint: {
    marginTop: 10,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  infoCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  input: {
    flex: 1,
    minWidth: 0, // Prevents flex items from overflowing
    minHeight: 56, // Ensures consistent height
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 12,
  },
  errorText: {
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default ProfileScreen;
