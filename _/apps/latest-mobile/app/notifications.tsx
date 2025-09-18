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
  Bell,
  BellOff,
  Settings,
  CheckCircle,
  XCircle,
  Info,
  ShoppingBag,
  Truck,
  Tag,
  Star,
} from 'lucide-react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: React.ReactNode;
}

const NotificationsScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: 'orders',
      title: 'Order Updates',
      description: 'Get notified about order status, delivery updates, and tracking',
      enabled: true,
      icon: <ShoppingBag size={20} color="#16a34a" />,
    },
    {
      id: 'delivery',
      title: 'Delivery Notifications',
      description: 'Real-time delivery updates and driver information',
      enabled: true,
      icon: <Truck size={20} color="#3b82f6" />,
    },
    {
      id: 'offers',
      title: 'Offers & Deals',
      description: 'Exclusive discounts, flash sales, and promotional offers',
      enabled: false,
      icon: <Tag size={20} color="#f59e0b" />,
    },
    {
      id: 'reviews',
      title: 'Review Reminders',
      description: 'Reminders to review products after delivery',
      enabled: true,
      icon: <Star size={20} color="#8b5cf6" />,
    },
    {
      id: 'news',
      title: 'News & Updates',
      description: 'App updates, new features, and important announcements',
      enabled: false,
      icon: <Info size={20} color="#6b7280" />,
    },
  ]);

  const toggleNotification = (id: string) => {
    setNotificationSettings(prev =>
      prev.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const toggleAllNotifications = (enabled: boolean) => {
    setNotificationSettings(prev =>
      prev.map(setting => ({ ...setting, enabled }))
    );
  };

  const getEnabledCount = () => notificationSettings.filter(s => s.enabled).length;

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
          Notifications
        </Text>
        <TouchableOpacity>
          <Settings size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={{ padding: 20 }}>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Bell size={24} color="#16a34a" />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: '#1f2937',
                    marginLeft: 12,
                  }}
                >
                  Notification Settings
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 14,
                  color: '#6b7280',
                }}
              >
                {getEnabledCount()}/{notificationSettings.length} enabled
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => toggleAllNotifications(true)}
                style={{
                  flex: 1,
                  backgroundColor: '#16a34a',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <CheckCircle size={16} color="white" />
                <Text
                  style={{
                    color: 'white',
                    fontSize: 14,
                    fontWeight: '600',
                    marginLeft: 4,
                  }}
                >
                  Enable All
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => toggleAllNotifications(false)}
                style={{
                  flex: 1,
                  backgroundColor: '#ef4444',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <XCircle size={16} color="white" />
                <Text
                  style={{
                    color: 'white',
                    fontSize: 14,
                    fontWeight: '600',
                    marginLeft: 4,
                  }}
                >
                  Disable All
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notification Categories */}
          <View style={{ gap: 16 }}>
            {notificationSettings.map((setting) => (
              <View
                key={setting.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 16,
                  padding: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
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
                      {setting.icon}
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
                        {setting.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: '#6b7280',
                          lineHeight: 20,
                        }}
                      >
                        {setting.description}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={setting.enabled}
                    onValueChange={() => toggleNotification(setting.id)}
                    trackColor={{ false: '#d1d5db', true: '#16a34a' }}
                    thumbColor={setting.enabled ? '#ffffff' : '#ffffff'}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Info Section */}
          <View
            style={{
              backgroundColor: '#f0f9ff',
              borderRadius: 16,
              padding: 20,
              marginTop: 20,
              borderWidth: 1,
              borderColor: '#0ea5e9',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Info size={20} color="#0ea5e9" style={{ marginRight: 12, marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#0c4a6e',
                    marginBottom: 8,
                  }}
                >
                  Notification Preferences
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#0369a1',
                    lineHeight: 20,
                  }}
                >
                  You can customize which notifications you receive. Some important notifications related to your orders cannot be disabled for security reasons.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationsScreen;
