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
    Clock,
    CreditCard,
    Crown,
    Gift,
    Heart,
    HelpCircle,
    LogOut,
    MapPin,
    Package,
    Settings,
    Shield,
    Star,
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
import status from "../../store/Constants";
import { logout } from "../../store/Signin/SigninSlice";
import { fetchPersonalDetails } from "../../store/Signin/SigninThunk";
import { getFont, getTextStyle } from "../../utils/fontStyles";

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
  const dispatch = useDispatch();

  // Redux state with safe access
  const { user, isAuthenticated, personalDetailsData } = useSelector((state) => state?.login || {});

  const [profileImage, setProfileImage] = useState(
    "https://raw.createusercontent.com/3a830457-6aee-4df3-8acc-d221b7c17d6c/"
  );

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
  const displayName = personalDetails?.name || user?.name || "User";
  const displayMobile = personalDetails?.MobileNumber || user?.mobileNumber || "Not provided";
  const currentBalance = 1250;
  const tier = "Gold";
  const totalOrders = 8;

  // Sample user stats
  const userStats = {
    totalOrders: totalOrders,
    totalSpent: 4850,
    favoriteItems: 12,
    memberSince: "2023",
  };

  const quickActions = [
    {
      icon: Star,
      label: "Loyalty Points",
      subtitle: `${currentBalance} points • ${tier} tier`,
      onPress: () => router.push("/loyalty"),
      color: "#F59E0B",
      bgColor: "#FFFBEB",
      borderColor: "#FCD34D",
    },
    {
      icon: Heart,
      label: "My Favorites",
      subtitle: `${userStats.favoriteItems} saved items`,
      onPress: () => router.push("/(tabs)/wishlist"),
      color: "#EC4899",
      bgColor: "#FDF2F8",
      borderColor: "#F9A8D4",
    },
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
      subtitle: `${userStats.totalOrders} completed orders`,
      onPress: () => router.push("/(tabs)/orders"),
      color: "#8B5CF6",
      bgColor: "#EDE9FE",
      borderColor: "#C4B5FD",
    },
  ];

  const menuItems = [
    {
      icon: Gift,
      label: "Referral Program",
      subtitle: "Invite friends and earn rewards",
      onPress: () => router.push("/referral"),
    },
    {
      icon: Clock,
      label: "Subscription Orders",
      subtitle: "Manage recurring deliveries",
      onPress: () => router.push("/subscriptions"),
    },
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
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#F3F4F6",
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
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: "#F3F4F6",
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
          paddingTop: insets.top + 20,
          paddingHorizontal: 24,
          paddingBottom: 24,
          backgroundColor: "#FFFFFF",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              backgroundColor: "#EEF2FF",
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            <User size={18} color="#6366F1" />
          </View>
          <Text
            style={getTextStyle({
              fontSize: 28,
              fontFamily: getFont("Inter_800ExtraBold"),
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
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info */}
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <View style={{ position: "relative", marginBottom: 16 }}>
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

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text
              style={getTextStyle({
                fontSize: 24,
                fontFamily: getFont("Inter_700Bold"),
                color: "#111827",
                marginRight: 8,
              })}
            >
              {displayName}
            </Text>
            <View
              style={{
                backgroundColor: "#FEF3C7",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#FBBF24",
              }}
            >
              <Crown size={12} color="#F59E0B" />
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Inter_600SemiBold",
                  color: "#F59E0B",
                  marginLeft: 4,
                }}
              >
                PREMIUM
              </Text>
            </View>
          </View>

          <Text
            style={getTextStyle({
              fontSize: 16,
              fontFamily: getFont("Inter_500Medium"),
              color: "#6B7280",
              marginBottom: 20,
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

              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 2,
                  }}
                >
                  <Star size={16} color="#F59E0B" fill="#F59E0B" />
                  <Text
                    style={{
                      fontSize: 24,
                      fontFamily: "Inter_800ExtraBold",
                      color: "#F59E0B",
                      marginLeft: 4,
                    }}
                  >
                    4.8
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_500Medium",
                    color: "#6B7280",
                  }}
                >
                  Rating
                </Text>
              </View>

              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontFamily: "Inter_800ExtraBold",
                    color: "#EC4899",
                  }}
                >
                  {userStats.memberSince}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_500Medium",
                    color: "#6B7280",
                  }}
                >
                  Member
                </Text>
              </View>
            </View>
          </View>
        </View>
        {/* Quick Actions */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Inter_700Bold",
              color: "#111827",
              marginBottom: 16,
            }}
          >
            Quick Actions
          </Text>
          {quickActions.map((action, index) => (
            <QuickActionCard key={index} action={action} />
          ))}
        </View>

        {/* Menu Items */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Inter_700Bold",
              color: "#111827",
              marginBottom: 16,
            }}
          >
            Account Settings
          </Text>
          {menuItems.map((item, index) => (
            <MenuItem key={index} item={item} />
          ))}
        </View>

        {/* Premium Features */}
        <View
          style={{
            backgroundColor: "#6366F1",
            borderRadius: 20,
            padding: 24,
            marginBottom: 24,
            shadowColor: "#6366F1",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Shield size={24} color="#FFFFFF" />
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Inter_700Bold",
                color: "#FFFFFF",
                marginLeft: 12,
              }}
            >
              Premium Benefits
            </Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_500Medium",
              color: "rgba(255,255,255,0.8)",
              lineHeight: 20,
              marginBottom: 16,
            }}
          >
            Enjoy faster delivery, exclusive deals, and priority customer
            support with your premium membership.
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 20,
              alignSelf: "flex-start",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: "#FFFFFF",
              }}
            >
              Manage Membership
            </Text>
          </TouchableOpacity>
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
