import {
    Inter_400Regular,
    Inter_600SemiBold,
    useFonts,
} from "@expo-google-fonts/inter";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronRight } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const welcomeSlides = [
  {
    id: 1,
    title: "Fresh from our farms to your door",
    subtitle: "Get the freshest produce delivered directly from our organic farms to your doorstep",
    icon: "🌱",
  },
  {
    id: 2,
    title: "Effortless shopping, amazing prices",
    subtitle: "Shop with ease and discover unbeatable prices on premium quality organic produce",
    icon: "🛒",
  },
  {
    id: 3,
    title: "Fast delivery, always on time",
    subtitle: "Choose your preferred delivery slot and we'll be there right on time, guaranteed",
    icon: "🚚",
  },
];

export default function WelcomeScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
  });

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const fadeAnimation = useRef(new Animated.Value(1)).current;

  const handleNext = () => {
    if (currentIndex < welcomeSlides.length - 1) {
      const nextIndex = currentIndex + 1;

      // Fade out animation
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex(nextIndex);
        scrollViewRef.current?.scrollTo({
          x: nextIndex * width,
          animated: false,
        });

        // Fade in animation
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      router.replace("/auth");
    }
  };

  const handleSkip = () => {
    router.replace("/auth");
  };

  if (!fontsLoaded) {
    return null;
  }

  const currentSlide = welcomeSlides[currentIndex];

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar style="dark" />

      {/* Skip Button */}
      <TouchableOpacity
        onPress={handleSkip}
        style={{
          position: "absolute",
          top: Math.max(insets.top + 20, 60),
          right: 20,
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: "#F3F4F6",
          borderRadius: 20,
          zIndex: 10,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_600SemiBold",
            color: "#6B7280",
          }}
        >
          Skip
        </Text>
      </TouchableOpacity>

      {/* Content */}
      <Animated.View
        style={{
          flex: 1,
          paddingHorizontal: 32,
          paddingTop: Math.max(insets.top + 100, 120),
          paddingBottom: Math.max(insets.bottom + 20, 32),
          opacity: fadeAnimation,
          justifyContent: "center",
        }}
      >
        {/* Icon */}
        <View style={{ alignItems: "center", marginBottom: 48 }}>
          <View
            style={{
              width: 120,
              height: 120,
              backgroundColor: "#F3F4F6",
              borderRadius: 60,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 32,
            }}
          >
            <Text style={{ fontSize: 48 }}>{currentSlide.icon}</Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: 28,
            fontFamily: "Inter_600SemiBold",
            color: "#111827",
            textAlign: "center",
            marginBottom: 16,
            lineHeight: 36,
          }}
        >
          {currentSlide.title}
        </Text>

        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: "#6B7280",
            textAlign: "center",
            marginBottom: 48,
            lineHeight: 24,
          }}
        >
          {currentSlide.subtitle}
        </Text>

        {/* Progress Indicators */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 48,
          }}
        >
          {welcomeSlides.map((_, index) => (
            <View
              key={index}
              style={{
                width: index === currentIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  index === currentIndex ? "#8B5CF6" : "#E5E7EB",
                marginHorizontal: 4,
              }}
            />
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity
          onPress={handleNext}
          style={{
            backgroundColor: "#8B5CF6",
            borderRadius: 16,
            paddingVertical: 16,
            paddingHorizontal: 24,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
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
            {currentIndex === welcomeSlides.length - 1
              ? "Get Started"
              : "Next"}
          </Text>
          <ChevronRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

