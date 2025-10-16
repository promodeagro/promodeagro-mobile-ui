import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export default function SplashScreen() {
  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const router = useRouter();
  const scaleAnimation = useRef(new Animated.Value(0.8)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (fontsLoaded) {
      // Start animations
      Animated.parallel([
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();

      // Navigate to welcome screens after 3 seconds
      const timer = setTimeout(() => {
        router.replace("/welcome");
      }, 3000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#2E7D32",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
      }}
    >
      <StatusBar style="light" />

      {/* Logo with animation */}
      <Animated.View
        style={{
          transform: [{ scale: scaleAnimation }],
          opacity: fadeAnimation,
          alignItems: "center",
        }}
      >
        {/* Logo */}
        <View
          style={{
            width: 140,
            height: 140,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: 70,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 32,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <Text style={{ fontSize: 56, color: "#2E7D32" }}>🌱</Text>
        </View>

        <Text
          style={{
            fontSize: 32,
            fontFamily: "Inter_700Bold",
            color: "#FFFFFF",
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          Promode Agro Farms
        </Text>

        <Text
          style={{
            fontSize: 18,
            fontFamily: "Inter_600SemiBold",
            color: "#FFFFFF",
            textAlign: "center",
            opacity: 0.95,
          }}
        >
          Fresh groceries delivered to your door
        </Text>
      </Animated.View>

      {/* Loading indicator */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 80,
          opacity: fadeAnimation,
        }}
      >
        <View
          style={{
            width: 60,
            height: 4,
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Animated.View
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#FFFFFF",
              borderRadius: 2,
              transform: [
                {
                  translateX: scaleAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-60, 0],
                  }),
                },
              ],
            }}
          />
        </View>
      </Animated.View>
    </View>
  );
}
