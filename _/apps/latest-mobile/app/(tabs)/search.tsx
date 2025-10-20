import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { View, ScrollView, Animated, Text, TouchableOpacity, TextInput, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Search, X, Heart } from "lucide-react-native";
import { Image } from "expo-image";
import { useSelector } from "react-redux";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useCart } from "../../utils/CartContext";
import { BlinkitQuantityControl } from "../../components/ui/BlinkitQuantityControl";
import { useWishlist } from "../../utils/WishlistContext";

export default function SearchScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addToCart, updateQuantity, cartItems } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Get home page products data from Redux
  const { homePageProductsData } = useSelector((state) => state?.home || {
    homePageProductsData: { status: '', data: [], error: null }
  });

  // Recent searches
  const [recentSearches] = useState([
    "Organic Apples",
    "Fresh Milk", 
    "Whole Wheat Bread",
    "Green Vegetables",
  ]);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setShowSuggestions(false);
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
    router.push(`/(tabs)/product/${product.groupId}`);
  };

  // Get all products from home page data
  const allProducts = useMemo(
    () => homePageProductsData?.data?.flatMap((category) => category.items || []) || [],
    [homePageProductsData]
  );

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allProducts.slice(0, 20);
    return allProducts.filter((product) =>
      product.name?.toLowerCase().includes(q) ||
      product.category?.toLowerCase().includes(q) ||
      product.subCategory?.toLowerCase().includes(q)
    );
  }, [searchQuery, allProducts]);

  // Get current cart quantity for a product
  const getCartQuantity = useCallback((product) => {
    if (!product.variations || product.variations.length === 0) return 0;
    const defaultVariation = product.variations.find(v => v.is_default) || product.variations[0];
    const cartKey = `${product.groupId}-${defaultVariation.id}`;
    return cartItems.get(cartKey)?.quantity || 0;
  }, [cartItems]);

  // Add to cart handler
  const handleAddToCart = useCallback(async (product) => {
    if (!product.variations || product.variations.length === 0) return;
    const defaultVariation = product.variations.find(v => v.is_default) || product.variations[0];
    await addToCart(product.groupId, defaultVariation.id, {
      price: defaultVariation.price,
      name: defaultVariation.name,
      unit: defaultVariation.unit,
      image: product.image,
    });
  }, [addToCart]);

  // Update quantity handler
  const handleUpdateQuantity = useCallback((product, newQuantity) => {
    if (!product.variations || product.variations.length === 0) return;
    const defaultVariation = product.variations.find(v => v.is_default) || product.variations[0];
    const cartKey = `${product.groupId}-${defaultVariation.id}`;
    updateQuantity(cartKey, newQuantity);
  }, [updateQuantity]);

  // Toggle wishlist handler
  const handleToggleWishlist = useCallback((product) => {
    const defaultVariation = product.variations?.find(v => v.is_default) || product.variations?.[0];
    toggleWishlist({
      id: product.groupId,
      name: product.name,
      price: defaultVariation?.price || 0,
      image: product.image,
      category: product.category,
      variationId: defaultVariation?.id,
      variation: defaultVariation,
    });
  }, [toggleWishlist]);

  // defer fontsLoaded return until after hooks definitions to keep hook order consistent

  const renderProductCard = useCallback(({ item: product }) => {
    const currentQuantity = getCartQuantity(product);
    const defaultVariation = product.variations?.find(v => v.is_default) || product.variations?.[0];
    const isInStock = defaultVariation?.availability && (defaultVariation?.quantity ?? 0) > 0;

    return (
      <TouchableOpacity
        onPress={() => handleProductPress(product)}
        style={{
          width: 180,
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          marginRight: 16,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 1,
        }}
      >
        <View style={{ position: "relative", height: 130 }}>
          <Image
            source={{ uri: product.image }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />

          {/* Wishlist Button */}
          <TouchableOpacity
            onPress={() => handleToggleWishlist(product)}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 32,
              height: 32,
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Heart 
              size={16} 
              color={isInWishlist(product.groupId) ? "#EF4444" : "#000000"} 
              fill={isInWishlist(product.groupId) ? "#EF4444" : "none"}
              strokeWidth={2}
            />
          </TouchableOpacity>

          {/* Out of Stock Overlay */}
          {!isInStock && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 16,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 12,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                Out of Stock
              </Text>
            </View>
          )}
        </View>

        <View style={{ padding: 12 }}>
          <Text
            style={{
              fontSize: 14,
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
              fontSize: 12,
              fontFamily: "Inter_500Medium",
              color: "#6B7280",
              marginBottom: 8,
            }}
          >
            {product.category}
          </Text>

          {defaultVariation && (
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_700Bold",
                    color: "#111827",
                  }}
                >
                  ₹{defaultVariation.price}
                </Text>
                {defaultVariation.mrp > defaultVariation.price && (
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_500Medium",
                      color: "#9CA3AF",
                      textDecorationLine: "line-through",
                    }}
                  >
                    ₹{defaultVariation.mrp}
                  </Text>
                )}
              </View>

              <BlinkitQuantityControl
                currentQuantity={currentQuantity}
                isInStock={isInStock}
                onAddToCart={() => handleAddToCart(product)}
                onIncreaseQuantity={() => handleUpdateQuantity(product, currentQuantity + 1)}
                onDecreaseQuantity={() => handleUpdateQuantity(product, currentQuantity - 1)}
                size="small"
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [getCartQuantity, handleProductPress, handleToggleWishlist, handleAddToCart, handleUpdateQuantity]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Animated.View
      style={{ flex: 1, backgroundColor: "#F8F9FA", opacity: fadeAnim }}
    >
      <StatusBar style="dark" />

      {/* Search Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 20,
          paddingBottom: 12,
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
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <Search size={20} color="#6B7280" />
            <TextInput
              style={{
                flex: 1,
                marginLeft: 12,
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: "#111827",
              }}
              placeholder="Search for groceries..."
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
        </View>

        {/* Recent Searches */}
        {!searchQuery.trim() && (
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
        )}
      </View>

      {/* Products List */}
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
        <Text
          style={{
            fontSize: 18,
            fontFamily: "Inter_700Bold",
            color: "#111827",
            marginBottom: 16,
          }}
        >
          {searchQuery.trim() ? `Search Results (${filteredProducts.length})` : "Recommended for You"}
        </Text>

        <FlatList
          data={filteredProducts}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.groupId}
          horizontal={false}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
        />
      </View>
    </Animated.View>
  );
}
