import React, { useState, useRef, useEffect } from "react";
import { View, ScrollView, Animated, Text, TouchableOpacity, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Search, X, SlidersHorizontal, Mic, Camera, Sparkles, Settings, Clock, MessageCircle } from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export default function SearchScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isNaturalLanguageMode, setIsNaturalLanguageMode] = useState(false);

  // Mock data
  const [recentSearches] = useState([
    "Organic Apples",
    "Fresh Milk",
    "Whole Wheat Bread",
    "Green Vegetables",
  ]);

  const [conversationalQueries] = useState([
    "I need something healthy for breakfast",
    "Show me vegetables for tonight's dinner",
    "What's good for making pasta?",
    "I want organic snacks for kids",
    "Something quick to cook for lunch",
    "Fresh fruits that are in season",
  ]);

  const [recommendations] = useState([
    {
      id: 1,
      name: "Fresh Organic Apples",
      price: "$2.99/lb",
      image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=150&h=150&fit=crop",
      category: "Fruits"
    },
    {
      id: 2,
      name: "Whole Grain Bread",
      price: "$3.49",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&h=150&fit=crop",
      category: "Bakery"
    },
    {
      id: 3,
      name: "Fresh Spinach",
      price: "$1.99/bunch",
      image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=150&h=150&fit=crop",
      category: "Vegetables"
    }
  ]);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Auto-detect natural language queries
  useEffect(() => {
    const naturalLanguageIndicators = [
      "i need", "show me", "what", "where", "how", "give me", "find",
      "looking for", "want", "for breakfast", "for lunch", "for dinner",
      "healthy", "organic", "fresh", "quick"
    ];

    const isNaturalQuery = naturalLanguageIndicators.some((indicator) =>
      searchQuery.toLowerCase().includes(indicator)
    );
    setIsNaturalLanguageMode(isNaturalQuery || searchQuery.length > 15);
  }, [searchQuery]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setShowSuggestions(false);
    // Navigate to search results or implement search logic
    console.log("Searching for:", query);
  };

  const handleSearchInputChange = (text) => {
    setSearchQuery(text);
    setShowSuggestions(text.length >= 2);
  };

  const handleSearchFocus = () => {
    setShowSuggestions(searchQuery.length >= 2);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleProductPress = (product) => {
    router.push(`/product/${product.id}`);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Animated.View
      style={{ flex: 1, backgroundColor: "#F8F9FA", opacity: fadeAnim }}
    >
      <StatusBar style="dark" />

      {/* Enhanced Search Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F8F9FA",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginRight: 12,
              borderWidth: isNaturalLanguageMode ? 2 : 1,
              borderColor: isNaturalLanguageMode ? "#8B5CF6" : "#E5E7EB",
            }}
          >
            {isNaturalLanguageMode ? (
              <Sparkles size={20} color="#8B5CF6" />
            ) : (
              <Search size={20} color="#6B7280" />
            )}
            <TextInput
              style={{
                flex: 1,
                marginLeft: 12,
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: "#111827",
              }}
              placeholder={
                isNaturalLanguageMode
                  ? "Ask me anything... 'I need healthy breakfast options'"
                  : "Search for groceries..."
              }
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={handleSearchInputChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              autoCapitalize="none"
              returnKeyType="search"
              onSubmitEditing={() => handleSearch(searchQuery)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={{
              padding: 12,
              backgroundColor: "#F3F4F6",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <SlidersHorizontal size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={() => setShowVoiceModal(true)}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#F3F4F6",
              paddingVertical: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <Mic size={16} color="#6B7280" />
            <Text style={{ marginLeft: 6, fontSize: 14, fontFamily: "Inter_500Medium", color: "#6B7280" }}>
              Voice Search
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => console.log("Barcode scanner")}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#F3F4F6",
              paddingVertical: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <Camera size={16} color="#6B7280" />
            <Text style={{ marginLeft: 6, fontSize: 14, fontFamily: "Inter_500Medium", color: "#6B7280" }}>
              Scan Barcode
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowAdvancedFilters(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#8B5CF6",
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 8,
            }}
          >
            <Sparkles size={16} color="#FFFFFF" />
            <Text style={{ marginLeft: 6, fontSize: 14, fontFamily: "Inter_500Medium", color: "#FFFFFF" }}>
              AI Search
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {searchQuery.trim() ? (
          // Search Results Placeholder
          <View style={{ padding: 20, alignItems: "center" }}>
            <Search size={48} color="#D1D5DB" />
            <Text style={{ fontSize: 18, fontFamily: "Inter_600SemiBold", color: "#6B7280", marginTop: 16 }}>
              Search Results for "{searchQuery}"
            </Text>
            <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: "#9CA3AF", textAlign: "center", marginTop: 8 }}>
              Implement search results here
            </Text>
          </View>
        ) : (
          // Default Search Content
          <View style={{ padding: 20 }}>
            {/* Conversational Search Suggestions */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: "#111827",
                  marginBottom: 12,
                }}
              >
                Try asking me naturally
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: "#6B7280",
                  marginBottom: 16,
                  lineHeight: 20,
                }}
              >
                Ask me questions like you would ask a friend. I can understand what you need!
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {conversationalQueries.map((query, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSearch(query)}
                    style={{
                      backgroundColor: "#F8F7FF",
                      borderWidth: 1,
                      borderColor: "#E4E3FF",
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderRadius: 16,
                      marginRight: 8,
                      marginBottom: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      maxWidth: "48%",
                    }}
                  >
                    <Sparkles size={12} color="#8B5CF6" />
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Inter_500Medium",
                        color: "#8B5CF6",
                        marginLeft: 6,
                        flexShrink: 1,
                      }}
                      numberOfLines={2}
                    >
                      {query}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recent Searches */}
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <Clock size={16} color="#6B7280" />
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_600SemiBold",
                    color: "#111827",
                    marginLeft: 8,
                  }}
                >
                  Recent Searches
                </Text>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSearch(search)}
                    style={{
                      backgroundColor: "#F3F4F6",
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 16,
                      marginRight: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Inter_500Medium",
                        color: "#374151",
                      }}
                    >
                      {search}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recommendations */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: "#111827",
                  marginBottom: 12,
                }}
              >
                Recommended for You
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {recommendations.map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    onPress={() => handleProductPress(product)}
                    style={{
                      width: 150,
                      backgroundColor: "#FFFFFF",
                      borderRadius: 12,
                      padding: 12,
                      marginRight: 12,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    <View
                      style={{
                        width: "100%",
                        height: 80,
                        backgroundColor: "#F3F4F6",
                        borderRadius: 8,
                        marginBottom: 8,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Inter_600SemiBold",
                        color: "#111827",
                        marginBottom: 4,
                      }}
                      numberOfLines={2}
                    >
                      {product.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: "Inter_500Medium",
                        color: "#6B7280",
                        marginBottom: 4,
                      }}
                    >
                      {product.category}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Inter_700Bold",
                        color: "#8B5CF6",
                      }}
                    >
                      {product.price}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
}
