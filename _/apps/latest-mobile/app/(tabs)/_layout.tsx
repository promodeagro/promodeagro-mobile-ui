import { Tabs } from "expo-router";
import {
    Grid3X3,
    Home,
    RotateCcw
} from "lucide-react-native";
import { Platform, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const DuotoneTabIcon = ({
    icon: Icon,
    focused,
    primaryColor,
    secondaryColor,
  }) => (
    <View
      style={{
        width: 32,
        height: 32,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      {/* Secondary icon layer (background fill) */}
      <View style={{ position: "absolute" }}>
        <Icon
          color={focused ? secondaryColor : "#E5E7EB"}
          size={20}
          strokeWidth={0}
          fill={focused ? secondaryColor : "#E5E7EB"}
        />
      </View>

      {/* Primary icon layer (stroke with exact icon border) */}
      <Icon
        color={focused ? primaryColor : "#6B7280"}
        size={20}
        strokeWidth={focused ? 2.5 : 2}
        fill="none"
      />
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
          borderBottomWidth: 0,
          paddingTop: 4,
          paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 4) : Math.max(insets.bottom, 4),
          height: Platform.OS === 'android' ? 72 + Math.max(insets.bottom, 0) : 72 + Math.max(insets.bottom, 0),
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: "#6366F1",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <DuotoneTabIcon
              icon={Home}
              focused={focused}
              primaryColor="#6366F1"
              secondaryColor="#C7D2FE"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="home-simple"
        options={{
          href: null, // Hide from tab bar, keep for testing
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Reorder",
          tabBarIcon: ({ focused }) => (
            <DuotoneTabIcon
              icon={RotateCcw}
              focused={focused}
              primaryColor="#10B981"
              secondaryColor="#A7F3D0"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          tabBarIcon: ({ focused }) => (
            <DuotoneTabIcon
              icon={Grid3X3}
              focused={focused}
              primaryColor="#06B6D4"
              secondaryColor="#A5F3FC"
            />
          ),
        }}
      />

      {/* Hidden routes for navigation */}
      <Tabs.Screen
        name="search"
        options={{
          href: null, // Hide from tab bar
        }}
      />

      <Tabs.Screen
        name="wishlist"
        options={{
          href: null, // Hide from tab bar
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="product/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="order-tracking/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="address"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="phone-auth"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile-setup"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="subscriptions"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
