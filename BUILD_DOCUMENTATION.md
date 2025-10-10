# 📱 Expo Build Documentation - APK & AAB Generation

This document provides step-by-step instructions for building APK and AAB (Android App Bundle) files for the PromodeAgro Mobile App using Expo development tools.

## 🚨 Important Prerequisites

**Before building, ensure you have:**
- Expo SDK 53 (DO NOT upgrade to SDK 54)
- EAS CLI installed globally
- Expo account with proper permissions
- Android development environment set up
- Valid signing certificates (for production builds)

---

## 📋 Table of Contents

1. [Environment Setup](#environment-setup)
2. [EAS CLI Installation](#eas-cli-installation)
3. [Project Configuration](#project-configuration)
4. [Building APK Files](#building-apk-files)
5. [Building AAB Files](#building-aab-files)
6. [Build Profiles Configuration](#build-profiles-configuration)
7. [Troubleshooting](#troubleshooting)
8. [Production Builds](#production-builds)

---

## 🔧 Environment Setup

### 1. Install Required Tools

```bash
# Install EAS CLI globally
npm install -g @expo/eas-cli

# Verify installation
eas --version

# Login to your Expo account
eas login
```

### 2. Initialize EAS in Your Project

```bash
# Navigate to your project directory
cd mobile-app

# Initialize EAS configuration
eas build:configure
```

This will create an `eas.json` file in your project root.

---

## ⚙️ Project Configuration

### 1. Update app.json for Build Configuration

Ensure your `app.json` has the following configuration:

```json
{
  "expo": {
    "name": "PromodeAgro",
    "slug": "promode-agro-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.promodeagro.mobile"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.promodeagro.mobile",
      "versionCode": 1
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

### 2. Configure eas.json

Create or update `eas.json` with the following configuration:

```json
{
  "cli": {
    "version": ">= 5.9.1"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 📱 Building APK Files

### 1. Development APK (for testing)

```bash
# Build development APK
eas build --platform android --profile development

# Or using the preview profile for internal testing
eas build --platform android --profile preview
```

### 2. Production APK (for distribution)

```bash
# Build production APK
eas build --platform android --profile production --local
```

**Note:** For production APK, you might need to modify the `eas.json` to use `"buildType": "apk"` instead of `"aab"`.

---

## 📦 Building AAB Files (Android App Bundle)

### 1. Production AAB (for Google Play Store)

```bash
# Build production AAB
eas build --platform android --profile production
```

### 2. Preview AAB (for internal testing)

```bash
# Build preview AAB
eas build --platform android --profile preview
```

---

## 🔧 Build Profiles Configuration

### Development Profile
- **Purpose**: For development and testing
- **Distribution**: Internal
- **Build Type**: APK
- **Features**: Development client enabled

### Preview Profile
- **Purpose**: Internal testing and QA
- **Distribution**: Internal
- **Build Type**: APK or AAB
- **Features**: Production-like build for testing

### Production Profile
- **Purpose**: App store distribution
- **Distribution**: Store
- **Build Type**: AAB (recommended for Google Play)
- **Features**: Optimized and signed for production

---

## 🚀 Step-by-Step Build Process

### For APK (Android Package)

1. **Prepare the project:**
   ```bash
   cd mobile-app
   npm install
   ```

2. **Configure EAS (if not done already):**
   ```bash
   eas build:configure
   ```

3. **Build APK:**
   ```bash
   # For development/testing
   eas build --platform android --profile preview
   
   # For production (if configured for APK)
   eas build --platform android --profile production
   ```

4. **Download the APK:**
   - The build will provide a download link
   - Download and install on Android devices

### For AAB (Android App Bundle)

1. **Prepare the project:**
   ```bash
   cd mobile-app
   npm install
   ```

2. **Build AAB:**
   ```bash
   # For production (Google Play Store)
   eas build --platform android --profile production
   ```

3. **Download the AAB:**
   - Download the AAB file from the build dashboard
   - Upload to Google Play Console

---

## 🔐 Signing Configuration

### Automatic Signing (Recommended)

EAS can automatically handle signing for you:

```bash
# Configure automatic signing
eas credentials
```

### Manual Signing

If you prefer manual signing:

1. **Generate a keystore:**
   ```bash
   keytool -genkey -v -keystore promode-agro-key.keystore -alias promode-agro -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Upload to EAS:**
   ```bash
   eas credentials
   ```

---

## 📊 Build Monitoring

### Check Build Status

```bash
# List all builds
eas build:list

# View specific build details
eas build:view [BUILD_ID]
```

### Build Logs

```bash
# View build logs
eas build:logs [BUILD_ID]
```

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Build Fails with SDK Version Error
```bash
# Ensure you're using SDK 53
npx expo install --fix

# Clear cache and rebuild
eas build --clear-cache --platform android
```

#### 2. Signing Issues
```bash
# Reset credentials
eas credentials --clear-credentials

# Reconfigure signing
eas credentials
```

#### 3. Memory Issues During Build
```bash
# Use local build for large projects
eas build --platform android --profile production --local
```

#### 4. Dependencies Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear Expo cache
npx expo start --clear
```

#### 5. Build Timeout
```bash
# Use local build for faster builds
eas build --platform android --profile production --local
```

---

## 🏭 Production Builds

### Pre-Build Checklist

- [ ] Update version number in `app.json`
- [ ] Test the app thoroughly
- [ ] Ensure all API endpoints are production-ready
- [ ] Verify signing certificates
- [ ] Update app icons and splash screens
- [ ] Test on multiple Android devices

### Build Commands for Production

```bash
# Production AAB for Google Play Store
eas build --platform android --profile production

# Production APK for direct distribution
eas build --platform android --profile production --local
```

---

## 📱 Testing Your Builds

### APK Testing

1. **Install APK on device:**
   ```bash
   adb install path/to/your-app.apk
   ```

2. **Test on multiple devices:**
   - Different Android versions
   - Different screen sizes
   - Different hardware configurations

### AAB Testing

1. **Upload to Google Play Console:**
   - Use internal testing track first
   - Test with a small group of users
   - Gradually roll out to production

---

## 🔄 Continuous Integration

### GitHub Actions Example

Create `.github/workflows/build.yml`:

```yaml
name: Build Android App

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Install EAS CLI
      run: npm install -g @expo/eas-cli
      
    - name: Build APK
      run: eas build --platform android --profile preview --non-interactive
      env:
        EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

---

## 📚 Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Android App Bundle Guide](https://developer.android.com/guide/app-bundle)
- [Expo Build Troubleshooting](https://docs.expo.dev/build/troubleshooting/)
- [Google Play Console](https://play.google.com/console)

---

## ⚠️ Important Notes

1. **SDK Version**: Always use Expo SDK 53, not 54
2. **Build Time**: First builds may take 10-15 minutes
3. **Storage**: Build artifacts are stored for 30 days
4. **Signing**: Keep your signing certificates secure
5. **Testing**: Always test builds before production release

---

## 🆘 Support

If you encounter issues:

1. Check the [Expo documentation](https://docs.expo.dev/)
2. Review build logs for specific errors
3. Check the troubleshooting section above
4. Contact the development team

---

**Remember: This project uses Expo SDK 53. Do not upgrade to SDK 54 as it may cause compatibility issues.**
