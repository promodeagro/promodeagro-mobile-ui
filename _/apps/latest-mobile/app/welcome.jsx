import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";

const { width } = Dimensions.get("window");

const welcomeSlides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1560258018-c7db7645254e?w=800&h=600&fit=crop&crop=center&auto=enhance&q=80",
    title: "Fresh from our farms to your door",
    subtitle:
      "Get the freshest produce delivered directly from our organic farms to your doorstep",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop",
    title: "Effortless shopping, amazing prices",
    subtitle:
      "Shop with ease and discover unbeatable prices on premium quality organic produce",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=800&h=600&fit=crop",
    title: "Fast delivery, always on time",
    subtitle:
      "Choose your preferred delivery slot and we'll be there right on time, guaranteed",
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
    <View style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
      <StatusBar style="light" />

      {/* Background Image */}
      <View style={{ flex: 1, position: "relative" }}>
        <Image
          source={{ uri: currentSlide.image }}
          style={{
            width: "100%",
            height: "100%",
          }}
          contentFit="cover"
          transition={300}
        />

        {/* Overlay */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(46, 125, 50, 0.4)",
          }}
        />

        {/* Skip Button */}
        <TouchableOpacity
          onPress={handleSkip}
          style={{
            position: "absolute",
            top: Math.max(insets.top + 20, 60),
            right: 20,
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            borderRadius: 20,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_600SemiBold",
              color: "#FFFFFF",
            }}
          >
            Skip
          </Text>
        </TouchableOpacity>

        {/* Content */}
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 32,
            paddingTop: 32,
            paddingBottom: Math.max(insets.bottom + 20, 32),
            opacity: fadeAnimation,
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontFamily: "Inter_600SemiBold",
              color: "#FFFFFF",
              textAlign: "center",
              marginBottom: 16,
              lineHeight: 40,
            }}
          >
            {currentSlide.title}
          </Text>

          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_400Regular",
              color: "#FFFFFF",
              textAlign: "center",
              marginBottom: 40,
              lineHeight: 24,
              opacity: 0.9,
            }}
          >
            {currentSlide.subtitle}
          </Text>

          {/* Progress Indicators */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginBottom: 32,
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
                    index === currentIndex
                      ? "#FFFFFF"
                      : "rgba(255, 255, 255, 0.3)",
                  marginHorizontal: 4,
                }}
              />
            ))}
          </View>

          {/* Next Button */}
          <TouchableOpacity
            onPress={handleNext}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              paddingVertical: 16,
              paddingHorizontal: 24,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#2E7D32",
                marginRight: 8,
              }}
            >
              {currentIndex === welcomeSlides.length - 1
                ? "Get Started"
                : "Next"}
            </Text>
            <ChevronRight size={20} color="#2E7D32" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
