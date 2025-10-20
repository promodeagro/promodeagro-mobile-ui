import { Tabs } from "expo-router";
import {
    Grid3X3,
    Home,
    RotateCcw,
    ShoppingCart,
    User
} from "lucide-react-native";
import { Platform, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const TabIcon = ({ icon: Icon, focused, activeColor = "#8B5CF6" }) => {
    const bg = focused ? activeColor : "transparent";
    const stroke = focused ? "#FFFFFF" : "#6B7280";
    const border = focused ? activeColor : "#E5E7EB";
    return (
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: bg,
          borderWidth: focused ? 0 : 1,
          borderColor: border,
          shadowColor: focused ? activeColor : "transparent",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: focused ? 0.25 : 0,
          shadowRadius: 8,
          elevation: focused ? 6 : 0,
        }}
      >
        <Icon size={20} color={stroke} strokeWidth={2.5} />
      </View>
    );
  };

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
            <TabIcon icon={Home} focused={focused} activeColor="#8B5CF6" />
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
            <TabIcon icon={RotateCcw} focused={focused} activeColor="#10B981" />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Grid3X3} focused={focused} activeColor="#06B6D4" />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          href: null,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={ShoppingCart} focused={focused} activeColor="#8B5CF6" />
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
          title: "Account",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={User} focused={focused} activeColor="#8B5CF6" />
          ),
        }}
      />
      <Tabs.Screen
        name="product/[id]"
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
