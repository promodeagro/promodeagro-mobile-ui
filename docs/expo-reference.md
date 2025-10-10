# Expo Documentation Reference

## Quick Links
- [Expo Docs](https://docs.expo.dev/)
- [Get Started](https://docs.expo.dev/get-started/introduction/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [API Reference](https://docs.expo.dev/versions/latest/)

## Key Sections for This Project

### Development
- [Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [Debugging](https://docs.expo.dev/debugging/runtime-issues/)
- [Config Plugins](https://docs.expo.dev/config-plugins/introduction/)

### Navigation
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [File-based Routing](https://docs.expo.dev/router/create-pages/)
- [Navigation](https://docs.expo.dev/router/navigating-pages/)

### APIs Used in This Project
- [Expo Image](https://docs.expo.dev/versions/latest/sdk/image/)
- [Expo Font](https://docs.expo.dev/versions/latest/sdk/font/)
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [Expo Blur](https://docs.expo.dev/versions/latest/sdk/blur/)
- [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)
- [Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)

### Deployment
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [EAS Update](https://docs.expo.dev/eas-update/introduction/)

### Configuration
- [App Config](https://docs.expo.dev/workflow/configuration/)
- [App.json/App.config.js](https://docs.expo.dev/versions/latest/config/app/)

## Common Commands
```bash
# Development
npx expo start
npx expo start --android
npx expo start --ios
npx expo start --web

# Building
npx eas build --platform android
npx eas build --platform ios
npx eas build --platform all

# Updates
npx eas update --branch production
```

## Project-Specific Notes
- Using Expo SDK ~53.0.20
- File-based routing with Expo Router ~5.1.4
- TypeScript configuration enabled
- New Architecture enabled in app.json
