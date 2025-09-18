import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Bell, ChevronDown, MapPin, Mic, Search } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    Animated,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";

// Inline weather hook to avoid import issues
const useLocationWeather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [isDataReady, setIsDataReady] = useState(false);

  useEffect(() => {
    // Simulate weather data loading
    const timer = setTimeout(() => {
      setWeatherData({
        condition: "sunny",
        temperature: 24,
        location: "Current Location",
      });
      setIsDataReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getCurrentWeather = () => {
    return weatherData;
  };

  return {
    getCurrentWeather,
    isDataReady,
    weatherData,
  };
};

export function HomeScreenHeader({
  insets,
  headerOpacity,
  headerTranslateY,
  searchTranslateY,
  categories,
  selectedCategory,
  onSelectCategory, 
  searchQuery,
  onSearchQueryChange,
  onLocationPress,
  userLocation,
  addressType,
  locationPermission,
  onRequestLocation,
  defaultAddress,
}) {
  const router = useRouter();
  const { getCurrentWeather, isDataReady } = useLocationWeather();
  

  // Get current weather data for animations
  const currentWeather = getCurrentWeather();

  // Rotating search suggestions
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const searchSuggestions = [
    "laal saag",
    "Gondaraj nimbu",
    "pui saag",
    "tomato",
    "potato",
    "onion",
    "ginger",
    "garlic",
    "coriander",
    "mint leaves"
  ];

  // Rotate through search suggestions every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestionIndex((prevIndex) => 
        (prevIndex + 1) % searchSuggestions.length
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Map category names to display data
  const getCategoryDisplayData = (categoryName, categoryData = null) => {
    // If we have real category data with image_url, use it
    if (categoryData && categoryData.image_url) {
      return {
        image_url: categoryData.image_url,
        color: "#6366F1", // Default color for real categories
        isRealImage: true
      };
    }
    
    // Fallback to emoji icons for "All" and any categories without images
    const categoryMap = {
      All: { icon: "🛒", color: "#6366F1", isRealImage: false },
      "Bengali Special": { icon: "🐟", color: "#EF4444", isRealImage: false },
      "Fresh Vegetables": { icon: "🥬", color: "#10B981", isRealImage: false },
      "Fresh Fruits": { icon: "🍎", color: "#F59E0B", isRealImage: false },
      Groceries: { icon: "🌾", color: "#8B5CF6", isRealImage: false },
      "Non Veg": { icon: "🍖", color: "#EC4899", isRealImage: false },
      Dairy: { icon: "🥛", color: "#3B82F6", isRealImage: false },
    };
    return categoryMap[categoryName] || { icon: "🛒", color: "#6366F1", isRealImage: false };
  };

  const handleCategoryPress = (categoryName) => {
    if (categoryName === "All") {
      onSelectCategory(categoryName);
      return;
    }

    // Map category names to their slugs for navigation
    const categorySlugMap = {
      "Bengali Special": "bengali-special",
      "Fresh Vegetables": "fresh-vegetables",
      "Fresh Fruits": "fresh-fruits",
      "Groceries": "groceries",
      "Eggs Meat & Fish": "eggs-meat-fish",
      "Dairy": "dairy",
    };

    const slug = categorySlugMap[categoryName];
    if (slug) {
      // Navigate to specific category screen
      router.push(`/category/${slug}`);
    } else {
      // Fallback to categories screen if no mapping found
      router.push("/(tabs)/categories");
    }
  };

  // Convert categories array to just names for display
  const categoryNames = Array.isArray(categories)
    ? categories.map((cat) => (typeof cat === "object" ? cat.name : cat))
    : [];

  // Ensure "All" is first
  const displayCategories = [
    "All",
    ...categoryNames.filter((name) => name !== "All"),
  ];

  return (
    <View style={{ position: "relative", paddingTop: insets.top + 16 }}>
      {/* Fallback Gradient when weather not loaded */}
      <LinearGradient
        colors={["#F8FAFC", "#E2E8F0"]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }}
      />

      {/* Header Content - Above weather animation */}
      <View style={{ zIndex: 2, position: "relative" }}>
        {/* Header Content - Animated */}
        <Animated.View
          style={{
            paddingHorizontal: 24,
            paddingBottom: headerOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 20], // Use padding instead of height
            }),
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
            height: headerOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 60], // Decreased height for more compact header when scrolling up
            }),
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 16,
            }}
          >
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <MapPin size={16} color="#6366F1" />
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_500Medium",
                    color: "#6366F1",
                    marginLeft: 4,
                  }}
                >
                  Delivering to
                </Text>
              </View>

              <TouchableOpacity
                onPress={locationPermission === 'granted' ? onLocationPress : onRequestLocation}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 4,
                  flex: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "Inter_700Bold",
                    color: "#6B7280", // Gray color for ellipsis
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {addressType ? (
                    <>
                      <Text style={{ fontFamily: "Inter_700Bold", color: "#1F2937" }}>{addressType}</Text>
                      <Text style={{ fontFamily: "Inter_400Regular", color: "#6B7280", fontSize: 16 }}> - {userLocation}</Text>
                    </>
                  ) : (
                    <Text style={{ color: "#1F2937" }}>{userLocation}</Text>
                  )}
                </Text>
                <ChevronDown
                  size={16}
                  color="#6B7280"
                  style={{ marginLeft: 4, marginRight: 8 }}
                />
                {locationPermission === 'denied' && (
                  <View
                    style={{
                      backgroundColor: "#FEF2F2",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                      marginLeft: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: "Inter_600SemiBold",
                        color: "#EF4444",
                      }}
                    >
                      Location Access Required
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                style={{
                  width: 44,
                  height: 44,
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: 22,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Bell size={20} color="#6366F1" />
                <View
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 8,
                    height: 8,
                    backgroundColor: "#EF4444",
                    borderRadius: 4,
                  }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/(tabs)/profile")}
                style={{
                  width: 44,
                  height: 44,
                  backgroundColor: "rgba(99, 102, 241, 0.9)",
                  borderRadius: 22,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#6366F1",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text style={{ fontSize: 18 }}>👤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Enhanced Search Bar - Animated */}
        <Animated.View
          style={{
            paddingHorizontal: 24,
            marginBottom: 0, // Remove bottom margin to stick with categories
            transform: [{ translateY: searchTranslateY }],
            marginTop: headerOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0], // Add padding top when header collapses
            }),
          }}
        >
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/search")}
            style={{
              height: 52,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: 26,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.2,
              shadowRadius: 16,
              elevation: 8,
              borderWidth: 1,
              borderColor: "rgba(243, 244, 246, 0.8)",
            }}
          >
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
              <Search size={18} color="#6366F1" />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Inter_500Medium",
                  color: "#9CA3AF",
                }}
              >
                Search "{searchSuggestions[currentSuggestionIndex]}"
              </Text>
            </View>
            <TouchableOpacity
              style={{
                width: 32,
                height: 32,
                backgroundColor: "#F3F4F6",
                borderRadius: 16,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Mic size={16} color="#6366F1" />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>

        {/* Modern Category Pills - Animated */}
        <Animated.View
          style={{
            marginBottom: 10, // Consistent 10px bottom padding for all scroll states
            transform: [{ translateY: searchTranslateY }],
            marginTop: 16, // Small consistent gap between search bar and categories
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          >
            {displayCategories.map((categoryName, index) => {
              // Find the actual category data from the categories prop
              const actualCategoryData = categories.find(cat => cat.name === categoryName);
              const categoryData = getCategoryDisplayData(categoryName, actualCategoryData);
              
              return (
                <TouchableOpacity
                  key={`${categoryName}-${index}`}
                  onPress={() => handleCategoryPress(categoryName)}
                  style={{
                    backgroundColor:
                      selectedCategory === categoryName
                        ? categoryData.color
                        : "rgba(255, 255, 255, 0.9)",
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 24,
                    marginRight: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    shadowColor:
                      selectedCategory === categoryName
                        ? categoryData.color
                        : "#000",
                    shadowOffset: { width: 0, height: 2 }, // Reduced shadow offset
                    shadowOpacity:
                      selectedCategory === categoryName ? 0.2 : 0.1, // Reduced shadow opacity
                    shadowRadius: 4, // Reduced shadow radius
                    elevation: 2, // Reduced elevation
                    borderWidth: selectedCategory === categoryName ? 0 : 1,
                    borderColor: "rgba(229, 231, 235, 0.8)",
                  }}
                >
                  {categoryData.isRealImage ? (
                    <Image
                      source={{ uri: categoryData.image_url }}
                      style={{
                        width: 20,
                        height: 20,
                        marginRight: 8,
                        borderRadius: 4,
                      }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={{ fontSize: 16, marginRight: 8 }}>
                      {categoryData.icon}
                    </Text>
                  )}
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily:
                        selectedCategory === categoryName
                          ? "Inter_600SemiBold"
                          : "Inter_500Medium",
                      color:
                        selectedCategory === categoryName
                          ? "#FFFFFF"
                          : "#374151",
                    }}
                  >
                    {categoryName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>
    </View>
  );
}
