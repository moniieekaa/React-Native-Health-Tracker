import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  profilePhoto?: string; // Base64 encoded image or file URI
}

class AuthService {
  private readonly USERS_KEY = 'users';
  private readonly CURRENT_USER_KEY = 'currentUser';

  // Register a new user
  async register(userData: Omit<User, 'id'>): Promise<User> {
    try {
      // Get existing users
      const existingUsers = await this.getUsers();
      
      // Check if email already exists
      const existingUser = existingUsers.find(user => user.email === userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user with unique ID
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
      };

      // Add to users list
      const updatedUsers = [...existingUsers, newUser];
      await AsyncStorage.setItem(this.USERS_KEY, JSON.stringify(updatedUsers));

      // Store current user
      await AsyncStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(newUser));

      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  async login(email: string, password: string): Promise<User> {
    try {
      const users = await this.getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Store current user
      await AsyncStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CURRENT_USER_KEY);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(this.CURRENT_USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Get all users
  private async getUsers(): Promise<User[]> {
    try {
      const usersData = await AsyncStorage.getItem(this.USERS_KEY);
      return usersData ? JSON.parse(usersData) : [];
    } catch (error) {
      console.error('Get users error:', error);
      return [];
    }
  }

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const users = await this.getUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      // Update user
      users[userIndex] = { ...users[userIndex], ...updates };
      await AsyncStorage.setItem(this.USERS_KEY, JSON.stringify(users));

      // Update current user if it's the same user
      const currentUser = await this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        const updatedUser = users[userIndex];
        await AsyncStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(updatedUser));
        return updatedUser;
      }

      return users[userIndex];
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
}

export default new AuthService(); 