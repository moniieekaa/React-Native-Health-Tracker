# 🏃‍♂️ Health Tracker

A modern, feature-rich health tracking mobile app built with React Native and Expo. Track your daily health metrics, view analytics, and stay motivated with personalized notifications.

![Health Tracker App](https://img.shields.io/badge/React%20Native-0.72-blue)
![Expo](https://img.shields.io/badge/Expo-49.0.0-lightgrey)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🔐 Authentication & Profile
- **Secure Login/Signup** with local storage
- **Profile Management** with photo upload
- **BMI Calculator** with health categorization
- **Personal Information** editing (age, height, weight, gender)

### 📊 Dashboard
- **Real-time Health Metrics** display
- **Progress Tracking** with visual progress bars
- **Dynamic Greetings** based on time of day
- **Pull-to-Refresh** functionality

### 📈 Analytics
- **Interactive Charts** (line, bar, progress)
- **Time Range Selection** (7, 14, 30 days)
- **Summary Statistics** and trends
- **Multiple Health Metrics** visualization

### ➕ Health Tracker
- **Steps Tracking** (target: 10,000 steps)
- **Water Intake** (target: 8 glasses)
- **Sleep Hours** (target: 7-9 hours)
- **Calories Consumed** (target: 2,000 calories)
- **Heart Rate Monitoring**
- **Mood Tracking** with emoji selection
- **Achievement Notifications** for goal completion

### ⚙️ Settings & Notifications
- **Theme Toggle** (Light/Dark mode)
- **Push Notifications** with customizable reminders
- **Data Export** to CSV format
- **Data Management** (clear all data)
- **Test Notifications** functionality

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React Native + Expo |
| **Language** | TypeScript |
| **State Management** | Redux Toolkit |
| **Navigation** | React Navigation |
| **UI Components** | React Native Paper |
| **Animations** | React Native Reanimated |
| **Charts** | React Native Chart Kit |
| **Storage** | AsyncStorage |
| **Notifications** | Expo Notifications |
| **Image Picker** | Expo Image Picker |
| **File System** | Expo FileSystem |
| **Sharing** | Expo Sharing |

## 📱 Screenshots

*[Screenshots would be added here]*

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator or Android Emulator (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HealthTracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your device**
   - Install **Expo Go** app on your phone
   - Scan the QR code from the terminal
   - Or press `i` for iOS simulator / `a` for Android emulator

## 📁 Project Structure

```
HealthTracker/
├── app/
│   ├── components/          # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── navigation/          # Navigation configuration
│   ├── screens/            # App screens
│   │   ├── DashboardScreen.tsx
│   │   ├── AnalyticsScreen.tsx
│   │   ├── TrackerScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/           # API and data services
│   │   ├── authService.ts
│   │   ├── healthService.ts
│   │   └── notificationService.ts
│   ├── store/              # Redux store and slices
│   │   ├── index.ts
│   │   ├── hooks.ts
│   │   └── slices/
│   ├── types/              # TypeScript definitions
│   └── utils/              # Utility functions
├── assets/                 # Images and static assets
├── App.tsx                 # Main app component
└── package.json           # Dependencies and scripts
```

## 🎯 Key Features

### Health Data Management
- **Local Storage**: All data stored locally using AsyncStorage
- **Daily Tracking**: Organized by date for easy retrieval
- **Real-time Updates**: Dashboard updates immediately after logging
- **Data Validation**: Comprehensive input validation

### Analytics & Visualization
- **Time-based Analysis**: View trends over different periods
- **Multiple Chart Types**: Line, bar, and progress charts
- **Summary Statistics**: Totals and averages calculation
- **Responsive Design**: Adapts to different screen sizes

### Notification System
- **Permission Handling**: Proper notification permission requests
- **Scheduled Reminders**: Daily notifications at custom times
- **Achievement Alerts**: Notifications for goal completion
- **Health Alerts**: Warnings for unusual readings

### Theme System
- **Light/Dark Themes**: Complete theme switching
- **Dynamic Theming**: All components adapt to current theme
- **Persistent Settings**: Theme preference saved across sessions

## 📊 Data Flow

```mermaid
graph LR
    A[User Input] --> B[Validation]
    B --> C[AsyncStorage]
    C --> D[Redux Store]
    D --> E[UI Update]
    E --> F[Dashboard/Analytics]
```

## 🔧 Development Commands

```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run on web browser
npm run build      # Build for production
```

## 🎨 Customization

### Adding New Health Metrics
1. Update the `HealthDataType` in `types/health.ts`
2. Add new input field in `TrackerScreen.tsx`
3. Update the health service to handle new data type
4. Add visualization in `AnalyticsScreen.tsx`

### Modifying Themes
1. Edit `utils/themes.ts` for color schemes
2. Update component styles to use theme colors
3. Test in both light and dark modes

## 🚧 Future Enhancements

- [ ] **Backend Integration** - Connect to real API
- [ ] **Data Export** - PDF reports and advanced CSV options
- [ ] **Social Features** - Share achievements and compete with friends
- [ ] **Advanced Analytics** - Machine learning insights
- [ ] **Health Goals** - Customizable targets and milestones
- [ ] **Device Integration** - Connect with fitness trackers
- [ ] **Offline Support** - Enhanced offline functionality
- [ ] **Multi-language** - Internationalization support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/health-tracker/issues)
- **Documentation**: Check the code comments and this README
- **Community**: Join our discussions

## 🙏 Acknowledgments

- **Expo** for the amazing development platform
- **React Native Paper** for beautiful UI components
- **React Navigation** for seamless navigation
- **Redux Toolkit** for state management

---

**Made with ❤️ using React Native and Expo** 
