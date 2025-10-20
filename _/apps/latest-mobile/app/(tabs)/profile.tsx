import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    useFonts,
} from "@expo-google-fonts/inter";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
    Bell,
    Camera,
    ChevronRight,
    CreditCard,
    HelpCircle,
    Heart,
    LogOut,
    MapPin,
    Package,
    Settings,
    User
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from 'react-redux';
import { BackButton } from '../../components/BackButton';
import status from "../../store/Constants";
import { logout } from "../../store/Signin/SigninSlice";
import { fetchPersonalDetails } from "../../store/Signin/SigninThunk";
import { getFont, getTextStyle } from "../../utils/fontStyles";
import { apiService } from "../../config/api";
import { useWishlist } from "../../utils/WishlistContext";

export default function ProfileScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { totalItems: wishlistCount } = useWishlist();
  const dispatch = useDispatch();

  // Redux state with safe access
  const { user, isAuthenticated, personalDetailsData } = useSelector((state) => state?.login || {});

  const [profileImage, setProfileImage] = useState(
    "https://raw.createusercontent.com/3a830457-6aee-4df3-8acc-d221b7c17d6c/"
  );

  // Orders stats from API (keeps Profile consistent with Orders screen)
  const [ordersStats, setOrdersStats] = useState({ totalVisible: 0, totalCompleted: 0, totalSpent: 0 });

  // Helpers to normalize server fields (aligned with Orders screen)
  const getOrderStatus = (order: any) => (order?.status || order?.order_status || '').toLowerCase();
  const getPaymentStatus = (order: any) => (order?.payment_status || order?.paymentStatus || '').toLowerCase();
  const getPaymentMethod = (order: any) => (order?.paymentDetails?.method || order?.payment_method || '').toLowerCase();
  const isOrderDisplayable = (order: any) => {
    const status = getOrderStatus(order);
    const pstatus = getPaymentStatus(order);
    const method = getPaymentMethod(order);
    if (method === 'cash' || method === 'cod' || method === 'cod-prepared') return true;
    if (['completed', 'confirmed', 'delivered', 'paid'].includes(status)) return true;
    if (pstatus === 'completed' || pstatus === 'paid' || pstatus === 'succeeded') return true;
    return false;
  };

  useEffect(() => {
    const loadOrdersStats = async () => {
      try {
        if (!isAuthenticated || !user) return;
        const uid = user?.id || user?.userId;
        if (!uid) return;
        const response = await apiService.getOrdersByUserId(uid);
        const all = Array.isArray(response?.orders) ? response.orders : [];
        const visible = all.filter(isOrderDisplayable);
        const completed = visible.filter((o: any) => {
          const status = getOrderStatus(o);
          const pstatus = getPaymentStatus(o);
          if (status === 'delivered') return true;
          if ((pstatus === 'completed' || pstatus === 'paid' || pstatus === 'succeeded') && ['confirmed','completed','paid','delivered'].includes(status)) return true;
          return false;
        });
        const spent = visible.reduce((sum: number, o: any) => sum + (Number(o.total_amount ?? o.finalTotal ?? o.totalPrice ?? o.total) || 0), 0);
        setOrdersStats({ totalVisible: visible.length, totalCompleted: completed.length, totalSpent: spent });
      } catch (e) {
        console.warn('Failed to load orders stats:', (e as any)?.message || e);
        setOrdersStats({ totalVisible: 0, totalCompleted: 0, totalSpent: 0 });
      }
    };
    loadOrdersStats();
  }, [isAuthenticated, user]);

  // Fetch personal details when component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      const userId = user?.id || user?.userId;
      if (userId && (!personalDetailsData || personalDetailsData.status === '')) {
        console.log("Fetching personal details for user:", userId);
        dispatch(fetchPersonalDetails(userId));
      }
    }
  }, [isAuthenticated, user, dispatch]);

  // Loading state for personal details
  const isLoadingPersonalDetails = personalDetailsData?.status === status.IN_PROGRESS;

  const handleImagePicker = async () => {
    // Handle image picker
    console.log('Image picker pressed');
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          console.log('Signing out user...');
          // Dispatch logout action to clear Redux state
          dispatch(logout());
          // Navigate to welcome screen
          router.replace("/welcome");
        },
      },
    ]);
  };

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  // Get user data from personal details API with safe access
  const personalDetails = personalDetailsData?.data?.data?.user || personalDetailsData?.data?.user;
  
  // Try to get full name from various sources
  const getDisplayName = () => {
    // First try personal details API
    if (personalDetails?.name) return personalDetails.name;
    if (personalDetails?.fullName) return personalDetails.fullName;
    if (personalDetails?.firstName && personalDetails?.lastName) {
      return `${personalDetails.firstName} ${personalDetails.lastName}`;
    }
    
    // Then try user object
    if (user?.name) return user.name;
    if (user?.fullName) return user.fullName;
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    
    // Fallback
    return "User";
  };
  
  const displayName = getDisplayName();
  const displayMobile = personalDetails?.MobileNumber || user?.mobileNumber || user?.phone || "Not provided";
  // User stats
  const userStats = {
    totalOrders: ordersStats.totalVisible,
    totalSpent: ordersStats.totalSpent,
  };

  const quickActions = [
    {
      icon: MapPin,
      label: "My Addresses",
      subtitle: "Manage delivery locations",
      onPress: () => router.push("/address/new"),
      color: "#10B981",
      bgColor: "#ECFDF5",
      borderColor: "#86EFAC",
    },
    {
      icon: Package,
      label: "Order History",
      subtitle: `${ordersStats.totalCompleted} completed orders`,
      onPress: () => router.push("/(tabs)/orders"),
      color: "#8B5CF6",
      bgColor: "#EDE9FE",
      borderColor: "#C4B5FD",
    },
    {
      icon: Heart,
      label: "My Wishlist",
      subtitle: `${wishlistCount} saved items`,
      onPress: () => router.push("/(tabs)/wishlist"),
      color: "#EF4444",
      bgColor: "#FEF2F2",
      borderColor: "#FECACA",
    },
  ];

  const menuItems = [
    {
      icon: CreditCard,
      label: "Payment Methods",
      subtitle: "Cards & UPI options",
      onPress: () => router.push("/payment-methods"),
    },
    {
      icon: Bell,
      label: "Notifications",
      subtitle: "Manage alerts & updates",
      onPress: () => router.push("/notifications"),
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      subtitle: "Get assistance & FAQ",
      onPress: () => router.push("/help"),
    },
    {
      icon: Settings,
      label: "Settings",
      subtitle: "App preferences & privacy",
      onPress: () => router.push("/settings"),
    },
  ];

  const QuickActionCard = ({ action }: { action: any }) => (
    <TouchableOpacity
      onPress={action.onPress}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: action.bgColor,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 16,
          borderWidth: 2,
          borderColor: action.borderColor,
        }}
      >
        <action.icon size={26} color={action.color} />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_700Bold",
            color: "#111827",
            marginBottom: 4,
          }}
        >
          {action.label}
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_500Medium",
            color: "#6B7280",
          }}
        >
          {action.subtitle}
        </Text>
      </View>

      <View
        style={{
          width: 32,
          height: 32,
          backgroundColor: "#F3F4F6",
          borderRadius: 16,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ChevronRight size={16} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );

  const MenuItem = ({ item }: { item: any }) => (
    <Pressable
      onPress={item.onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? "#F8FAFC" : "#FFFFFF",
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      })}
    >
      <View
        style={{
          width: 44,
          height: 44,
          backgroundColor: "#F8FAFC",
          borderRadius: 22,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 16,
        }}
      >
        <item.icon size={22} color="#6366F1" />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_600SemiBold",
            color: "#111827",
            marginBottom: 2,
          }}
        >
          {item.label}
        </Text>
        <Text
          style={{
            fontSize: 13,
            fontFamily: "Inter_500Medium",
            color: "#6B7280",
          }}
        >
          {item.subtitle}
        </Text>
      </View>
      <ChevronRight size={20} color="#6B7280" />
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#FAFBFC" }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: "#FFFFFF",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <View style={{ position: 'absolute', left: 16, top: insets.top + 8 }}>
          <BackButton size={28} />
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginLeft: 28
          }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              backgroundColor: "#EEF2FF",
              borderRadius: 14,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 10,
            }}
          >
            <User size={16} color="#6366F1" />
          </View>
          <Text
            style={getTextStyle({
              fontSize: 24,
              fontFamily: getFont("Inter_700Bold"),
              color: "#111827",
            })}
          >
            Profile
          </Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <View style={{ position: "relative", marginBottom: 12 }}>
            <View
              style={{
                padding: 4,
                borderRadius: 60,
                backgroundColor: "#FFFFFF",
                shadowColor: "#6366F1",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <Image
                source={{ uri: profileImage }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  borderWidth: 4,
                  borderColor: "#6366F1",
                }}
                contentFit="cover"
              />
            </View>
            <TouchableOpacity
              onPress={handleImagePicker}
              style={{
                position: "absolute",
                bottom: 4,
                right: 4,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#6366F1",
                borderWidth: 3,
                borderColor: "#FFFFFF",
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#6366F1",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Camera size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text
            style={getTextStyle({
              fontSize: 24,
              fontFamily: getFont("Inter_700Bold"),
              color: "#111827",
              marginBottom: 8,
            })}
          >
            {displayName}
          </Text>

          <Text
            style={getTextStyle({
              fontSize: 16,
              fontFamily: getFont("Inter_500Medium"),
              color: "#6B7280",
              marginBottom: 16,
            })}
          >
            +91 {displayMobile}
          </Text>

          {/* User Stats */}
          <View
            style={{
              backgroundColor: "#F8FAFC",
              borderRadius: 20,
              padding: 20,
              width: "100%",
              borderWidth: 1,
              borderColor: "#E2E8F0",
            }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-around" }}
            >
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontFamily: "Inter_800ExtraBold",
                    color: "#6366F1",
                  }}
                >
                  {userStats.totalOrders}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_500Medium",
                    color: "#6B7280",
                  }}
                >
                  Orders
                </Text>
              </View>

              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontFamily: "Inter_800ExtraBold",
                    color: "#10B981",
                  }}
                >
                  ₹{(userStats.totalSpent / 1000).toFixed(1)}k
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_500Medium",
                    color: "#6B7280",
                  }}
                >
                  Spent
                </Text>
              </View>
            </View>
          </View>
        </View>
        {/* Quick Actions */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Inter_700Bold",
              color: "#111827",
              marginBottom: 12,
            }}
          >
            Quick Actions
          </Text>
          {quickActions.map((action, index) => (
            <QuickActionCard key={index} action={action} />
          ))}
        </View>

        {/* Menu Items */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Inter_700Bold",
              color: "#111827",
              marginBottom: 12,
            }}
          >
            Account Settings
          </Text>
          {menuItems.map((item, index) => (
            <MenuItem key={index} item={item} />
          ))}
        </View>


        {/* Logout */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={{
            backgroundColor: "#FEF2F2",
            borderRadius: 16,
            padding: 18,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            borderWidth: 1,
            borderColor: "#FECACA",
          }}
        >
          <LogOut size={20} color="#EF4444" />
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              color: "#EF4444",
              marginLeft: 8,
            }}
          >
            Sign Out
          </Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={{ alignItems: "center", paddingVertical: 20 }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_500Medium",
              color: "#6B7280",
            }}
          >
            Promode Agro Farms v1.0.0
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Inter_500Medium",
              color: "#9CA3AF",
              marginTop: 4,
            }}
          >
            Fresh from our farms to your table 🌱
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
