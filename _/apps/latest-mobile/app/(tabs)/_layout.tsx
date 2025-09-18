import { Tabs } from "expo-router";
import { useColorScheme, View } from "react-native";
import {
  Home,
  RotateCcw,
  Grid3X3,
  Heart,
  Search,
  ShoppingCart,
  User,
} from "lucide-react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
          paddingTop: 8,
          paddingBottom: 8,
          height: 88,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarActiveTintColor: "#6366F1",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingTop: 4,
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
