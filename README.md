# Promode Agro Mobile App 🛒

A modern React Native e-commerce mobile application built with Expo, featuring grocery shopping, order management, and user authentication.

## 🚨 Important: SDK Version Requirement

**This project requires Expo SDK 53. Do NOT upgrade to SDK 54 as it may cause compatibility issues.**

Current SDK Version: `~53.0.20`

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI** (latest version compatible with SDK 53)
- **Git**

### Mobile Development Setup

For mobile development, you'll also need:

- **Android Studio** (for Android development)
- **Xcode** (for iOS development - macOS only)
- **Expo Go app** on your mobile device (for testing)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mobile-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Verify Expo SDK Version

Ensure you're using the correct Expo SDK version:

```bash
npx expo --version
```

If you need to install the correct Expo CLI version for SDK 53:

```bash
npm install -g @expo/cli@latest
```

### 4. Start the Development Server

```bash
npm start
# or
npx expo start
```

### 5. Run on Different Platforms

**For Android:**
```bash
npm run android
# or
npx expo start --android
```

**For iOS:**
```bash
npm run ios
# or
npx expo start --ios
```

**For Web:**
```bash
npm run web
# or
npx expo start --web
```

## 📱 Testing the App

### Option 1: Expo Go (Recommended for quick testing)
1. Install [Expo Go](https://expo.dev/go) on your mobile device
2. Scan the QR code from the terminal or browser
3. The app will load on your device

### Option 2: Development Build
1. Use Android Studio emulator or iOS simulator
2. Follow the [Expo development build guide](https://docs.expo.dev/develop/development-builds/introduction/)

## 🏗️ Project Structure

```
├── app/                    # Main app screens (file-based routing)
│   ├── (tabs)/            # Tab navigation screens
│   ├── auth.jsx           # Authentication screen
│   ├── checkout.tsx       # Checkout flow
│   └── ...
├── components/            # Reusable UI components
├── store/                 # Redux store and slices
├── utils/                 # Utility functions and contexts
├── config/                # API configuration
├── constants/             # App constants
└── assets/               # Images, fonts, and static assets
```

## 🛠️ Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run on web browser
- `npm run lint` - Run ESLint for code quality
- `npm run reset-project` - Reset to a fresh project state

## 🔧 Key Technologies

- **Expo SDK 53** - React Native framework
- **Expo Router** - File-based navigation
- **Redux Toolkit** - State management
- **React Query** - Server state management
- **TypeScript** - Type safety
- **React Native Reanimated** - Animations
- **Lucide React Native** - Icons

## 📚 Development Guidelines

### Code Standards
- Follow TypeScript best practices
- Use functional components with hooks
- Maintain consistent code formatting
- Write clear, readable code with proper comments

### State Management
- Use Redux Toolkit for global state
- Use React Query for server state
- Use local state for component-specific data

### Navigation
- This project uses Expo Router for file-based routing
- Screen files are located in the `app/` directory
- Tab navigation is configured in `app/(tabs)/_layout.tsx`

## 🐛 Troubleshooting

### Common Issues

**1. Metro bundler issues:**
```bash
npx expo start --clear
```

**2. Node modules issues:**
```bash
rm -rf node_modules
npm install
```

**3. Expo CLI version mismatch:**
```bash
npm install -g @expo/cli@latest
```

**4. Android build issues:**
- Ensure Android Studio is properly configured
- Check that Android SDK is installed
- Verify environment variables

**5. iOS build issues:**
- Ensure Xcode is installed and updated
- Check iOS simulator is available
- Verify provisioning profiles (for physical devices)

## 📖 Documentation

- [Expo Documentation](https://docs.expo.dev/) - Official Expo guides
- [React Native Documentation](https://reactnative.dev/) - React Native fundamentals
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/) - Navigation guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For technical support or questions:
- Check the [Expo documentation](https://docs.expo.dev/)
- Review the troubleshooting section above
- Create an issue in the repository

---

**Remember: Always use Expo SDK 53 for this project. Do not upgrade to SDK 54.**
