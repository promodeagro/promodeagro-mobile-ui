import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    useFonts,
} from "@expo-google-fonts/inter";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Phone, Shield, ArrowRight } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AuthScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (fontsLoaded) {
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [fontsLoaded]);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleGetStarted = () => {
    animateButton();
    router.push("/phone-auth");
  };

  const handleGuestAccess = () => {
    animateButton();
    router.replace("/(tabs)/home");
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar style="dark" />
      
      <Animated.View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: insets.top + 40,
          opacity: fadeAnimation,
        }}
      >
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 60 }}>
          <View
            style={{
              width: 80,
              height: 80,
              backgroundColor: "#8B5CF6",
              borderRadius: 40,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 24,
              shadowColor: "#8B5CF6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text style={{ fontSize: 28, color: "#FFFFFF" }}>🌱</Text>
          </View>

          <Text
            style={{
              fontSize: 28,
              fontFamily: "Inter_700Bold",
              color: "#111827",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Welcome to Promode Agro
          </Text>

          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_400Regular",
              color: "#6B7280",
              textAlign: "center",
              lineHeight: 24,
              paddingHorizontal: 20,
            }}
          >
            Fresh organic produce delivered to your doorstep
          </Text>
        </View>

        {/* Features */}
        <View style={{ marginBottom: 48 }}>
          {[
            { icon: Phone, text: "Quick phone verification" },
            { icon: Shield, text: "Secure & private authentication" },
          ].map((feature, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
                paddingHorizontal: 4,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: "#F3F4F6",
                  borderRadius: 18,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 16,
                }}
              >
                <feature.icon size={18} color="#8B5CF6" />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_500Medium",
                  color: "#374151",
                  flex: 1,
                }}
              >
                {feature.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={{ marginTop: "auto" }}>
          <Animated.View style={{ transform: [{ scale: scaleAnimation }] }}>
            <TouchableOpacity
              onPress={handleGetStarted}
              style={{
                backgroundColor: "#8B5CF6",
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
                marginBottom: 16,
                flexDirection: "row",
                justifyContent: "center",
                shadowColor: "#8B5CF6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: "#FFFFFF",
                  marginRight: 8,
                }}
              >
                Get Started
              </Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: scaleAnimation }] }}>
            <TouchableOpacity
              onPress={handleGuestAccess}
              style={{
                backgroundColor: "#F8FAFC",
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
                marginBottom: 32,
                borderWidth: 1,
                borderColor: "#E2E8F0",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: "#6B7280",
                }}
              >
                Continue as Guest
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Terms */}
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Inter_400Regular",
              color: "#9CA3AF",
              textAlign: "center",
              lineHeight: 18,
              paddingHorizontal: 16,
              marginBottom: Math.max(insets.bottom + 16, 24),
            }}
          >
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
