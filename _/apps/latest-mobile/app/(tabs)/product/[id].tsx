import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Heart, Plus, Minus, Star } from "lucide-react-native";
import { Image } from "expo-image";
import { apiService } from "../../../config/api";

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
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const product = productData;
  const currentVariation = product.variants?.[selectedVariation];
  const isInStock = currentVariation?.availability && (currentVariation?.quantity ?? 0) > 0;

  const handleAddToCart = () => {
    if (!currentVariation) return;
    
    // Simple add to cart functionality
    console.log("Adding to cart:", {
      productId: product.groupId,
      variationId: currentVariation.id,
      quantity,
      price: currentVariation.price,
    });
    
    Alert.alert("Success", `Added ${quantity} ${product.name} to cart!`);
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

          {product.description && (
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
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: 8,
                }}
              >
                Tags
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {product.tags.map((tag, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: "#F3F4F6",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      marginRight: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: "#6B7280" }}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Variations */}
        {product.variants && product.variants.length > 1 && (
          <View style={{ backgroundColor: "#FFFFFF", marginTop: 8, padding: 20 }}>
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
              {product.variants.map((variation, index) => (
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
      </ScrollView>

      {/* Bottom Bar */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#FFFFFF",
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: insets.bottom + 16,
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        }}
      >
        {isInStock ? (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* Quantity Selector */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#F3F4F6",
                borderRadius: 12,
                marginRight: 16,
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            >
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={{
                  width: 40,
                  height: 40,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Minus size={16} color="#6B7280" />
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#111827",
                  minWidth: 32,
                  textAlign: "center",
                }}
              >
                {quantity}
              </Text>

              <TouchableOpacity
                onPress={() => setQuantity(quantity + 1)}
                style={{
                  width: 40,
                  height: 40,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Plus size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Add to Cart Button */}
            <TouchableOpacity
              onPress={handleAddToCart}
              style={{
                flex: 1,
                backgroundColor: "#8B5CF6",
                borderRadius: 12,
                paddingVertical: 12,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#FFFFFF",
                  marginRight: 8,
                }}
              >
                Add to Cart
              </Text>
              {currentVariation && (
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#FFFFFF",
                  }}
                >
                  ₹{(currentVariation.price * quantity).toFixed(2)}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: "#F3F4F6",
              borderRadius: 12,
              paddingVertical: 16,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#9CA3AF",
              }}
            >
              Out of Stock
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
