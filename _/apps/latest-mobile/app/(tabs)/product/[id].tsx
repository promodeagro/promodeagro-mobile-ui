import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Heart, Plus, Minus, Star } from "lucide-react-native";
import { Image } from "expo-image";
import { apiService } from "../../../config/api";
import { useCart } from "../../../utils/CartContext";

interface ProductVariant {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  image: string;
  images: string[];
  description: string;
  availability: boolean;
  tags: string[];
  price: number;
  mrp: number;
  unit: string;
  quantity: number;
  inCart: boolean;
  inWishlist: boolean;
}

interface ProductData {
  groupId: string;
  name: string;
  category: string;
  subCategory: string;
  image: string;
  images: string[];
  description: string;
  tags: string[];
  variants: ProductVariant[];
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [quantity, setQuantity] = useState(1); // retained for pre-add display, but cart is source of truth after add
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derive product and variation ASAP to keep hooks before any returns
  const product = productData as ProductData | null;
  // Support both `variants` and `variations` from API
  const variationList = (product as any)?.variants || (product as any)?.variations || [];
  const currentVariation = variationList?.[selectedVariation] as ProductVariant | undefined;
  const isInStock = !!(currentVariation?.availability && (currentVariation?.quantity ?? 0) > 0);

  // Cart linkage hooks must run on every render (before early returns)
  const cartKey = useMemo(() => {
    if (!product || !currentVariation) return "";
    return `${product.groupId}-${currentVariation.id}`;
  }, [product, currentVariation]);

  const currentCartQuantity = useMemo(() => {
    if (!cartKey) return 0;
    const entry = cartItems.get(cartKey);
    return entry?.quantity || 0;
  }, [cartItems, cartKey]);

  // Fetch product data when component mounts
  useEffect(() => {
    if (id) {
      fetchProductData();
    }
  }, [id]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch product data using the groupId from route params
      const data = await apiService.fetchProductByGroupId(id as string);
      setProductData(data);
    } catch (err) {
      console.error('Error fetching product data:', err);
      setError('Failed to load product details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F8F9FA", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={{ marginTop: 16, fontSize: 16, color: "#6B7280" }}>Loading product details...</Text>
      </View>
    );
  }

  // Error state
  if (error || !productData) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F8F9FA", justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ fontSize: 18, color: "#EF4444", textAlign: "center", marginBottom: 16 }}>{error || 'Product not found'}</Text>
        <TouchableOpacity
          onPress={fetchProductData}
          style={{
            backgroundColor: "#8B5CF6",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // product, currentVariation, isInStock, cartKey, and currentCartQuantity are defined above

  const handleAddToCart = async () => {
    if (!currentVariation) return;
    await addToCart(product.groupId, currentVariation.id, {
      price: currentVariation.price,
      name: currentVariation.unit,
      unit: currentVariation.unit,
      image: currentVariation.image || product.image,
    });
  };

  const handleIncrease = async () => {
    if (!currentVariation) return;
    if (currentCartQuantity === 0) {
      await handleAddToCart();
    } else {
      updateQuantity(cartKey, currentCartQuantity + 1);
    }
  };

  const handleDecrease = () => {
    if (!currentVariation || currentCartQuantity <= 0) return;
    const next = Math.max(0, currentCartQuantity - 1);
    updateQuantity(cartKey, next);
  };

  const calculateDiscount = (mrp: number, price: number) => {
    if (mrp <= 0 || mrp <= price) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F9FA" }}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#F3F4F6",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ArrowLeft size={20} color="#374151" />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#111827",
            flex: 1,
            textAlign: "center",
            marginHorizontal: 16,
          }}
          numberOfLines={1}
        >
          {product.name}
        </Text>

        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#F3F4F6",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Heart size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Image */}
        <View style={{ backgroundColor: "#FFFFFF", padding: 20 }}>
          <View
            style={{
              height: 250,
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: "#F8F9FA",
            }}
          >
            {product.image ? (
              <Image
                source={{ uri: product.image }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#F3F4F6",
                }}
              >
                <Text style={{ color: "#9CA3AF", fontSize: 16 }}>No Image</Text>
              </View>
            )}
            
            {/* Rating Badge */}
            <View
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                backgroundColor: "rgba(16, 185, 129, 0.9)",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={{ color: "white", fontSize: 12, fontWeight: "600", marginLeft: 4 }}>
                4.5
              </Text>
            </View>

            {/* Discount Badge if available */}
            {currentVariation && currentVariation.mrp > 0 && currentVariation.mrp > currentVariation.price && (
              <View
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  backgroundColor: "rgba(239, 68, 68, 0.9)",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>
                  {calculateDiscount(currentVariation.mrp, currentVariation.price)}% OFF
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Product Info */}
        <View style={{ backgroundColor: "#FFFFFF", marginTop: 8, padding: 20 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: "#111827",
              marginBottom: 8,
            }}
          >
            {product.name}
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              marginBottom: 16,
            }}
          >
            {product.category} • {product.subCategory}
          </Text>

          {currentVariation && (
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  color: "#111827",
                  marginRight: 12,
                }}
              >
                ₹{currentVariation.price}
              </Text>
              {currentVariation.mrp > 0 && currentVariation.mrp > currentVariation.price && (
                <Text
                  style={{
                    fontSize: 16,
                    color: "#9CA3AF",
                    textDecorationLine: "line-through",
                  }}
                >
                  ₹{currentVariation.mrp}
                </Text>
              )}
            </View>
          )}

          {currentVariation && (
            <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 16 }}>
              Per {currentVariation.unit}
            </Text>
          )}

          {/* Select Size - moved above cart controls */}
          {Array.isArray(variationList) && variationList.length > 1 && (
            <View style={{ backgroundColor: "#FFFFFF", marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: 12,
                }}
              >
                Select Size
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {variationList.map((variation: any, index: number) => (
                  <TouchableOpacity
                    key={variation.id}
                    onPress={() => setSelectedVariation(index)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: selectedVariation === index ? "#8B5CF6" : "#E5E7EB",
                      backgroundColor: selectedVariation === index ? "#EDE9FE" : "#FFFFFF",
                      marginRight: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: selectedVariation === index ? "#8B5CF6" : "#6B7280",
                        marginBottom: 2,
                      }}
                    >
                      {variation.unit}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: selectedVariation === index ? "#8B5CF6" : "#9CA3AF",
                      }}
                    >
                      ₹{variation.price}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Inline Cart Controls (always visible) */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            {currentCartQuantity === 0 ? (
              <TouchableOpacity
                onPress={handleAddToCart}
                disabled={!isInStock || !currentVariation}
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: isInStock ? "#8B5CF6" : "#D1D5DB",
                  borderRadius: 20,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 16,
                  opacity: isInStock ? 1 : 0.6,
                }}
              >
                <Plus size={18} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#8B5CF6",
                  borderRadius: 16,
                  paddingHorizontal: 6,
                  paddingVertical: 3,
                  marginRight: 16,
                }}
              >
                <TouchableOpacity
                  onPress={handleDecrease}
                  disabled={!isInStock}
                  style={{ width: 28, height: 32, justifyContent: "center", alignItems: "center", opacity: isInStock ? 1 : 0.6 }}
                >
                  <Minus size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={{ paddingHorizontal: 6, paddingVertical: 2, minWidth: 16, justifyContent: "center", alignItems: "center" }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#FFFFFF" }}>{currentCartQuantity}</Text>
                </View>
                <TouchableOpacity
                  onPress={handleIncrease}
                  disabled={!isInStock}
                  style={{ width: 28, height: 32, justifyContent: "center", alignItems: "center", opacity: isInStock ? 1 : 0.6 }}
                >
                  <Plus size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              onPress={handleAddToCart}
              disabled={!isInStock || !currentVariation}
              style={{
                flex: 1,
                backgroundColor: isInStock ? "#8B5CF6" : "#D1D5DB",
                borderRadius: 12,
                paddingVertical: 12,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                opacity: isInStock ? 1 : 0.6,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF", marginRight: 8 }}>
                {currentCartQuantity === 0 ? "Add to Cart" : "Add One More"}
              </Text>
              {currentVariation && (
                <Text style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}>
                  ₹{(
                    currentVariation.price * (currentCartQuantity > 0 ? currentCartQuantity : 1)
                  ).toFixed(2)}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {product.description && (
            <>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: 8,
                }}
              >
                Description
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  lineHeight: 20,
                  marginBottom: 20,
                }}
              >
                {product.description}
              </Text>
            </>
          )}

        {/* Tags removed per request */}
        </View>

        {/* Variations moved above; removed from here */}
      </ScrollView>
    </View>
  );
}
