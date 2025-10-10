import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Settings,
  Bell,
  Eye,
  Shield,
  Globe,
  Palette,
  Smartphone,
  Wifi,
  Moon,
  Sun,
  Languages,
  Volume2,
  VolumeX,
  Download,
  Trash2,
  LogOut,
  ChevronRight,
  User,
  Lock,
  CreditCard,
  Truck,
  Package,
} from 'lucide-react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

interface SettingItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  type: 'toggle' | 'navigate' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    darkMode: false,
    autoPlay: false,
    soundEffects: true,
    hapticFeedback: true,
    locationServices: true,
    dataUsage: false,
  });

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // Handle logout logic
            Alert.alert('Logged Out', 'You have been successfully logged out.');
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Cache Cleared', 'All cached data has been cleared.');
          },
        },
      ]
    );
  };

  const generalSettings: SettingItem[] = [
    {
      id: 'profile',
      title: 'Profile Settings',
      subtitle: 'Edit your profile information',
      icon: <User size={20} color="#3b82f6" />,
      type: 'navigate',
      onPress: () => router.push('/(tabs)/profile'),
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      subtitle: 'Manage your account security',
      icon: <Lock size={20} color="#ef4444" />,
      type: 'navigate',
      onPress: () => router.push('/security'),
    },
    {
      id: 'payment',
      title: 'Payment Methods',
      subtitle: 'Manage your payment options',
      icon: <CreditCard size={20} color="#16a34a" />,
      type: 'navigate',
      onPress: () => router.push('/payment-methods'),
    },
    {
                   id: 'addresses',
             title: 'Delivery Addresses',
             subtitle: 'Manage your delivery locations',
             icon: <Truck size={20} color="#f59e0b" />,
             type: 'navigate',
             onPress: () => router.push('/address/new'),
    },
  ];

  const notificationSettings: SettingItem[] = [
    {
      id: 'pushNotifications',
      title: 'Push Notifications',
      subtitle: 'Receive notifications on your device',
      icon: <Bell size={20} color="#8b5cf6" />,
      type: 'toggle',
      value: settings.pushNotifications,
      onToggle: (value) => updateSetting('pushNotifications', value),
    },
    {
      id: 'emailNotifications',
      title: 'Email Notifications',
      subtitle: 'Receive updates via email',
      icon: <Bell size={20} color="#0ea5e9" />,
      type: 'toggle',
      value: settings.emailNotifications,
      onToggle: (value) => updateSetting('emailNotifications', value),
    },
  ];

  const appSettings: SettingItem[] = [
    {
      id: 'darkMode',
      title: 'Dark Mode',
      subtitle: 'Switch between light and dark themes',
      icon: settings.darkMode ? <Moon size={20} color="#6366f1" /> : <Sun size={20} color="#f59e0b" />,
      type: 'toggle',
      value: settings.darkMode,
      onToggle: (value) => updateSetting('darkMode', value),
    },
    {
      id: 'soundEffects',
      title: 'Sound Effects',
      subtitle: 'Play sounds for app interactions',
      icon: settings.soundEffects ? <Volume2 size={20} color="#16a34a" /> : <VolumeX size={20} color="#6b7280" />,
      type: 'toggle',
      value: settings.soundEffects,
      onToggle: (value) => updateSetting('soundEffects', value),
    },
    {
      id: 'hapticFeedback',
      title: 'Haptic Feedback',
      subtitle: 'Vibrate on touch interactions',
      icon: <Smartphone size={20} color="#8b5cf6" />,
      type: 'toggle',
      value: settings.hapticFeedback,
      onToggle: (value) => updateSetting('hapticFeedback', value),
    },
    {
      id: 'locationServices',
      title: 'Location Services',
      subtitle: 'Allow app to access your location',
      icon: <Globe size={20} color="#10b981" />,
      type: 'toggle',
      value: settings.locationServices,
      onToggle: (value) => updateSetting('locationServices', value),
    },
    {
      id: 'dataUsage',
      title: 'Data Saver',
      subtitle: 'Reduce data usage for images and videos',
      icon: <Wifi size={20} color="#f59e0b" />,
      type: 'toggle',
      value: settings.dataUsage,
      onToggle: (value) => updateSetting('dataUsage', value),
    },
  ];

  const dataSettings: SettingItem[] = [
    {
      id: 'clearCache',
      title: 'Clear Cache',
      subtitle: 'Free up storage space',
      icon: <Trash2 size={20} color="#ef4444" />,
      type: 'action',
      onPress: handleClearCache,
    },
    {
      id: 'downloadQuality',
      title: 'Download Quality',
      subtitle: 'Choose image and video quality',
      icon: <Download size={20} color="#8b5cf6" />,
      type: 'navigate',
      onPress: () => Alert.alert('Download Quality', 'Feature coming soon!'),
    },
  ];

  const accountSettings: SettingItem[] = [
    {
      id: 'logout',
      title: 'Logout',
      subtitle: 'Sign out of your account',
      icon: <LogOut size={20} color="#ef4444" />,
      type: 'action',
      onPress: handleLogout,
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        onPress={item.onPress}
        style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 16,
          marginBottom: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#f3f4f6',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16,
              }}
            >
              {item.icon}
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: 4,
                }}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: '#6b7280',
                  lineHeight: 20,
                }}
              >
                {item.subtitle}
              </Text>
            </View>
          </View>

          {item.type === 'toggle' && (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: '#d1d5db', true: '#16a34a' }}
              thumbColor={item.value ? '#ffffff' : '#ffffff'}
            />
          )}

          {item.type === 'navigate' && (
            <ChevronRight size={20} color="#9ca3af" />
          )}

          {item.type === 'action' && (
            <View style={{ width: 24 }} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f9fa', paddingTop: insets.top }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          backgroundColor: 'white',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '600',
            color: '#1f2937',
          }}
        >
          Settings
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ padding: 20 }}>
          {/* General Settings */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: 16,
              }}
            >
              General
            </Text>
            {generalSettings.map(renderSettingItem)}
          </View>

          {/* Notification Settings */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: 16,
              }}
            >
              Notifications
            </Text>
            {notificationSettings.map(renderSettingItem)}
          </View>

          {/* App Settings */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: 16,
              }}
            >
              App Preferences
            </Text>
            {appSettings.map(renderSettingItem)}
          </View>

          {/* Data Settings */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: 16,
              }}
            >
              Data & Storage
            </Text>
            {dataSettings.map(renderSettingItem)}
          </View>

          {/* Account Settings */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: 16,
              }}
            >
              Account
            </Text>
            {accountSettings.map(renderSettingItem)}
          </View>

          {/* App Info */}
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: 12,
              }}
            >
              App Information
            </Text>
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>Version</Text>
                <Text style={{ fontSize: 14, color: '#1f2937', fontWeight: '500' }}>1.0.0</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>Build</Text>
                <Text style={{ fontSize: 14, color: '#1f2937', fontWeight: '500' }}>2024.01.15</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>Platform</Text>
                <Text style={{ fontSize: 14, color: '#1f2937', fontWeight: '500' }}>React Native</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
