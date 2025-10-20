import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronDown, Minus, Plus, X, Heart } from "lucide-react-native";
import React, { useState, useRef } from "react";
import { Modal, Text, TouchableOpacity, View, Animated, Pressable } from "react-native";
import { useCart } from "../../utils/CartContext";
import { useWishlist } from "../../utils/WishlistContext";
import { hapticFeedback } from "../../utils/hapticFeedback";
import { useToast } from "../../contexts/ToastContext";
import { BlinkitQuantityControl } from "../ui/BlinkitQuantityControl";

export default function ProductCard({
  product,
}) {
  const router = useRouter();
  const { cartItems, addToCart, updateQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [showVariationModal, setShowVariationModal] = useState(false);
  const { showSuccess, showError } = useToast();
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const addButtonScale = useRef(new Animated.Value(1)).current;

  // Get the default variation or first available variation
  const defaultVariation =
    product.variations?.find((v) => v.is_default) || product.variations?.[0];
  const currentVariation = defaultVariation || {
    id: null,
    name: product.unit || "1 unit",
    price: product.price,
    original_price: product.original_price,
    unit: product.unit || "unit",
  };

  const [selectedVariation, setSelectedVariation] = useState(currentVariation);

  // Debug logging
  console.log('ProductCard Debug:', {
    productName: product?.name,
    productPrice: product?.price,
    selectedVariation: selectedVariation,
    productData: product
  });

  // Check if the selected variation is in stock
  const isInStock = selectedVariation?.availability === true && (selectedVariation?.quantity > 0 || selectedVariation?.stock_quantity > 0);
  
  // Get current quantity in cart for this product variation
  const cartKey = `${product.id}-${selectedVariation.id || "default"}`;
  const cartItem = cartItems.get(cartKey);
  const currentQuantity = cartItem?.quantity || 0;

  const handleAddToCart = async () => {
    try {
      hapticFeedback.medium();
      await addToCart(product.id, selectedVariation.id, selectedVariation);
      showSuccess(`${product?.name || 'Product'} added to cart!`);
      
      // Animate add button
      Animated.sequence([
        Animated.timing(addButtonScale, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(addButtonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      hapticFeedback.error();
      showError('Failed to add item to cart');
    }
  };

  const handleIncreaseQuantity = async () => {
    try {
      hapticFeedback.light();
      if (currentQuantity === 0) {
        await addToCart(product.id, selectedVariation.id, selectedVariation);
        showSuccess(`${product?.name || 'Product'} added to cart!`);
      } else {
        updateQuantity(cartKey, currentQuantity + 1);
      }
    } catch (error) {
      hapticFeedback.error();
      showError('Failed to update quantity');
    }
  };

  const handleDecreaseQuantity = () => {
    try {
      hapticFeedback.light();
      if (currentQuantity > 1) {
        updateQuantity(cartKey, currentQuantity - 1);
      } else {
        updateQuantity(cartKey, 0); // This will remove the item
        showSuccess(`${product?.name || 'Product'} removed from cart`);
      }
    } catch (error) {
      hapticFeedback.error();
      showError('Failed to update quantity');
    }
  };

  const handleVariationSelect = (variation) => {
    setSelectedVariation(variation);
    setShowVariationModal(false);
  };

  return (
    <>
      <Animated.View
        style={{
          width: "48%",
          aspectRatio: 1,
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          marginBottom: 12,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 1,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <TouchableOpacity
          onPress={() => router.push(`/product/${product.id}`)}
          style={{ position: "relative" }}
        >
          <View style={{ aspectRatio: 1, width: "100%" }}>
            <Image
              source={{ uri: product.images?.[0] || product.image || "https://via.placeholder.com/200x200?text=No+Image" }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />

            {/* Wishlist Button */}
            <TouchableOpacity
              onPress={() => {
                toggleWishlist({
                  id: product.id,
                  name: product.name,
                  price: selectedVariation.price,
                  image: product.images?.[0] || product.image,
                  category: product.category,
                  variationId: selectedVariation.id,
                  variation: selectedVariation,
                });
              }}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                width: 32,
                height: 32,
                borderRadius: 16,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 10,
              }}
            >
              <Heart 
                size={16} 
                color={isInWishlist(product.id) ? "#EF4444" : "#000000"} 
                fill={isInWishlist(product.id) ? "#EF4444" : "none"}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>

          {/* Out of Stock Overlay */}
          {!isInStock && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 16,
                aspectRatio: 1,
              }}
            >
              <View
                style={{
                  backgroundColor: "#DC2626",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_700Bold",
                    color: "#FFFFFF",
                  }}
                >
                  SOLD OUT
                </Text>
              </View>
            </View>
          )}

          {/* Discount Badge */}
          {((product?.discount && product.discount > 0) ||
            (selectedVariation?.original_price && selectedVariation?.price && 
             selectedVariation.original_price > selectedVariation.price)) && (
            <View
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                backgroundColor: "#8B5CF6",
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
                zIndex: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 9,
                  fontFamily: "Inter_700Bold",
                  color: "#FFFFFF",
                }}
              >
                {product?.discount ||
                  Math.round(
                    ((selectedVariation.original_price -
                      selectedVariation.price) /
                      selectedVariation.original_price) *
                      100,
                  )}
                % OFF
              </Text>
            </View>
          )}

          {/* Blinkit-style Quantity Controls */}
          {isInStock && (
            <View
              style={{
                position: "absolute",
                bottom: 8,
                right: 8,
              }}
            >
              <BlinkitQuantityControl
                currentQuantity={currentQuantity}
                isInStock={isInStock}
                onAddToCart={handleAddToCart}
                onIncreaseQuantity={handleIncreaseQuantity}
                onDecreaseQuantity={handleDecreaseQuantity}
                size="medium"
              />
            </View>
          )}
        </TouchableOpacity>

        <View style={{ padding: 8, minHeight: 80 }}>
          {/* Product Name */}
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Inter_600SemiBold",
              color: "#374151",
              marginBottom: 6,
              lineHeight: 14,
            }}
            numberOfLines={2}
          >
            {product?.name || "Product Name"}
          </Text>

          {/* Price */}
          <View style={{ marginBottom: 6 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_700Bold",
                color: "#111827",
              }}
            >
              ₹{selectedVariation?.price || product?.price || 0}
              {selectedVariation?.original_price && selectedVariation.original_price > selectedVariation.price && (
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: "Inter_500Medium",
                    color: "#9CA3AF",
                    textDecorationLine: "line-through",
                    marginLeft: 4,
                  }}
                >
                  ₹{selectedVariation.original_price}
                </Text>
              )}
            </Text>
          </View>

          {/* Unit/Size Selector - Only show if in stock and has variations */}
          {isInStock && product?.variations && product.variations.length > 1 ? (
            <TouchableOpacity
              onPress={() => setShowVariationModal(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#F8FAFC",
                paddingHorizontal: 8,
                paddingVertical: 6,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                marginBottom: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "Inter_600SemiBold",
                  color: "#1F2937",
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {selectedVariation?.unit || selectedVariation?.name || "Select Size"}
              </Text>
              <ChevronDown size={12} color="#6B7280" />
            </TouchableOpacity>
          ) : (
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Inter_500Medium",
                color: "#6B7280",
                marginBottom: 4,
              }}
            >
              {selectedVariation?.unit || selectedVariation?.name || product?.unit || "1 unit"}
            </Text>
          )}

        </View>
      </Animated.View>

      {/* Variation Selection Modal */}
      <Modal
        visible={showVariationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowVariationModal(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
          activeOpacity={1}
          onPress={() => setShowVariationModal(false)}
        >
          <TouchableOpacity
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              maxHeight: "50%",
            }}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Inter_600SemiBold",
                  color: "#111827",
                  flex: 1,
                }}
              >
                Select Size
              </Text>
              <TouchableOpacity
                onPress={() => setShowVariationModal(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#F3F4F6",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <X size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {product.variations?.map((variation) => (
              <TouchableOpacity
                key={variation.id}
                onPress={() => variation.availability ? handleVariationSelect(variation) : null}
                disabled={!variation.availability}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor:
                    selectedVariation.id === variation.id
                      ? "#EDE9FE"
                      : !variation.availability
                      ? "#F9FAFB"
                      : "#FFFFFF",
                  borderWidth: 1,
                  borderColor:
                    selectedVariation.id === variation.id
                      ? "#8B5CF6"
                      : !variation.availability
                      ? "#E5E7EB"
                      : "#E5E7EB",
                  marginBottom: 8,
                  opacity: !variation.availability ? 0.6 : 1,
                }}
              >
                {/* Variation Image */}
                <View style={{ marginRight: 12 }}>
                  <Image
                    source={{ uri: variation.image || variation.images?.[0] || product.images?.[0] }}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 8,
                    }}
                    contentFit="cover"
                  />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Inter_600SemiBold",
                      color: "#111827",
                      marginBottom: 2,
                    }}
                  >
                    {variation.unit}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_500Medium",
                      color: variation.availability ? "#10B981" : "#EF4444",
                    }}
                  >
                    {variation.availability
                      ? `${variation.quantity} ${variation.unit} available`
                      : "Out of stock"}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_700Bold",
                    color: "#111827",
                  }}
                >
                  ₹{variation.price}
                </Text>
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
