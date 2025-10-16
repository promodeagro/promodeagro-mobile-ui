import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    useFonts,
} from "@expo-google-fonts/inter";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Phone, Shield, Users } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AuthScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
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

  const handleSignIn = () => {
    animateButton();
    // Navigate to phone auth for sign in
    router.push("/phone-auth");
  };

  const handleSignUp = () => {
    animateButton();
    // Navigate to phone auth for sign up
    router.push("/phone-auth");
  };

  const handleGuestAccess = () => {
    animateButton();
    // Navigate directly to home page as guest
    router.replace("/(tabs)/home");
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          backgroundColor: "#F5F5F5",
          paddingTop: insets.top + 20,
        }}
      >
        <StatusBar style="dark" />

        <Animated.View
          style={{
            flex: 1,
            paddingHorizontal: 24,
            opacity: fadeAnimation,
          }}
        >
          {/* Header */}
          <View
            style={{ alignItems: "center", marginBottom: 60, marginTop: 40 }}
          >
            <View
              style={{
                width: 100,
                height: 100,
                backgroundColor: "#2E7D32",
                borderRadius: 50,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 32,
                elevation: 8,
                shadowColor: "#2E7D32",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
              }}
            >
              <Text style={{ fontSize: 32, color: "#FFFFFF" }}>🌱</Text>
            </View>

            <Text
              style={{
                fontSize: 22,
                fontFamily: "Inter_600SemiBold",
                color: "#333333",
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              Welcome to Promode Agro
            </Text>

            <Text
              style={{
                fontSize: 15,
                fontFamily: "Inter_400Regular",
                color: "#6B7280",
                textAlign: "center",
                lineHeight: 22,
                paddingHorizontal: 20,
              }}
            >
              Fresh organic produce delivered to your doorstep
            </Text>
          </View>

          {/* Features */}
          <View style={{ marginBottom: 40 }}>
            {[
              // { icon: Mail, text: "Sign in with Email & Social Login" },
              { icon: Phone, text: "Phone Verification Available" },
              { icon: Users, text: "Connect with Google & Facebook" },
              { icon: Shield, text: "Secure & Private Authentication" },
            ].map((feature, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                  paddingHorizontal: 16,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: "#E8F5E8",
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 16,
                  }}
                >
                  <feature.icon size={20} color="#2E7D32" />
                </View>
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: "Inter_500Medium",
                    color: "#333333",
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
                 onPress={handleSignIn}
                 style={{
                   backgroundColor: "#2E7D32",
                   borderRadius: 16,
                   paddingVertical: 14,
                   alignItems: "center",
                   marginBottom: 16,
                   elevation: 4,
                   shadowColor: "#2E7D32",
                   shadowOffset: { width: 0, height: 4 },
                   shadowOpacity: 0.3,
                   shadowRadius: 8,
                 }}
               >
                 <Text
                   style={{
                     fontSize: 16,
                     fontFamily: "Inter_600SemiBold",
                     color: "#FFFFFF",
                   }}
                 >
                   Sign In
                 </Text>
               </TouchableOpacity>
             </Animated.View>

             {/* Guest Button */}
             <Animated.View style={{ transform: [{ scale: scaleAnimation }] }}>
               <TouchableOpacity
                 onPress={handleGuestAccess}
                 style={{
                   backgroundColor: "#F3F4F6",
                   borderRadius: 16,
                   paddingVertical: 14,
                   alignItems: "center",
                   marginBottom: 20,
                   borderWidth: 1,
                   borderColor: "#E5E7EB",
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

            {/* Create Account Button - Commented out for now */}
            {/* <TouchableOpacity
              onPress={handleSignUp}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                paddingVertical: 18,
                alignItems: "center",
                borderWidth: 2,
                borderColor: "#2E7D32",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Inter_600SemiBold",
                  color: "#2E7D32",
                }}
              >
                Create Account
              </Text>
            </TouchableOpacity> */}

            {/* Info Text */}
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Inter_400Regular",
                color: "#9CA3AF",
                textAlign: "center",
                lineHeight: 18,
                paddingHorizontal: 16,
                marginBottom: Math.max(insets.bottom + 16, 24),
              }}
            >
              By continuing, you agree to our Terms of Service and Privacy Policy.
              You can browse as a guest or sign in for full access.
            </Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}
