import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronDown, Minus, Plus, X } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { useCart } from "../../utils/CartContext";

export default function ProductCard({
  product,
}) {
  const router = useRouter();
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [showVariationModal, setShowVariationModal] = useState(false);

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

  // Check if the selected variation is in stock
  const isInStock = selectedVariation?.availability === true && (selectedVariation?.quantity > 0 || selectedVariation?.stock_quantity > 0);
  
  // Get current quantity in cart for this product variation
  const cartKey = `${product.id}-${selectedVariation.id || "default"}`;
  const cartItem = cartItems.get(cartKey);
  const currentQuantity = cartItem?.quantity || 0;

  const handleAddToCart = async () => {
    await addToCart(product.id, selectedVariation.id, selectedVariation);
  };

  const handleIncreaseQuantity = async () => {
    if (currentQuantity === 0) {
      await addToCart(product.id, selectedVariation.id, selectedVariation);
    } else {
      updateQuantity(cartKey, currentQuantity + 1);
    }
  };

  const handleDecreaseQuantity = () => {
    if (currentQuantity > 1) {
      updateQuantity(cartKey, currentQuantity - 1);
    } else {
      updateQuantity(cartKey, 0); // This will remove the item
    }
  };

  const handleVariationSelect = (variation) => {
    setSelectedVariation(variation);
    setShowVariationModal(false);
  };

  return (
    <>
      <View
        style={{
          width: "49%",
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          marginBottom: 16,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
          borderWidth: 1,
          borderColor: "#F1F5F9",
        }}
      >
        <TouchableOpacity
          onPress={() => router.push(`/product/${product.id}`)}
          style={{ position: "relative", height: 160 }}
        >
          <Image
            source={{ uri: product.images?.[0] || product.image }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />

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
              <View
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.9)",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_700Bold",
                    color: "#FFFFFF",
                  }}
                >
                  SOLD OUT
                </Text>
              </View>
            </View>
          )}

          {(product.discount ||
            selectedVariation.original_price > selectedVariation.price) && (
            <View
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                backgroundColor: "#8B5CF6",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_700Bold",
                  color: "#FFFFFF",
                }}
              >
                {product.discount ||
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

          {/* Add to Cart / Quantity Controls */}
          {currentQuantity === 0 ? (
                         // Add to Cart Button
             <TouchableOpacity
               onPress={isInStock ? handleAddToCart : null}
               disabled={!isInStock}
               style={{
                 position: "absolute",
                 bottom: 12,
                 right: 12,
                 width: 36,
                 height: 36,
                 backgroundColor: isInStock ? "#FFFFFF" : "#F3F4F6",
                 borderRadius: 8,
                 justifyContent: "center",
                 alignItems: "center",
                 borderWidth: 2,
                 borderColor: isInStock ? "#8B5CF6" : "#D1D5DB",
                 shadowColor: "#000",
                 shadowOffset: { width: 0, height: 2 },
                 shadowOpacity: isInStock ? 0.1 : 0.05,
                 shadowRadius: 4,
                 elevation: isInStock ? 3 : 1,
               }}
             >
               <Plus size={20} color={isInStock ? "#8B5CF6" : "#9CA3AF"} strokeWidth={2.5} />
             </TouchableOpacity>
          ) : (
                         // Quantity Controls
             <View
               style={{
                 position: "absolute",
                 bottom: 12,
                 right: 12,
                 flexDirection: "row",
                 alignItems: "center",
                 backgroundColor: "#8B5CF6", // Same color as plus button
                 borderRadius: 20, // More rounded corners
                 paddingHorizontal: 8,
                 paddingVertical: 4,
                 shadowColor: "#000",
                 shadowOffset: { width: 0, height: 2 },
                 shadowOpacity: 0.1,
                 shadowRadius: 4,
                 elevation: 3,
               }}
             >
              <TouchableOpacity
                onPress={handleDecreaseQuantity}
                style={{
                  width: 24,
                  height: 24,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Minus size={16} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
              
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  minWidth: 20,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_700Bold",
                    color: "#FFFFFF",
                    textAlign: "center",
                  }}
                >
                  {currentQuantity}
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={isInStock ? handleIncreaseQuantity : null}
                disabled={!isInStock}
                style={{
                  width: 24,
                  height: 24,
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: isInStock ? 1 : 0.5,
                }}
              >
                <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>

        <View style={{ padding: 12 }}>
          <View style={{ marginBottom: 8 }}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Inter_700Bold",
                color: "#111827",
              }}
            >
              ₹{selectedVariation.price}
              {selectedVariation.original_price &&
                selectedVariation.original_price > selectedVariation.price && (
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_500Medium",
                      color: "#9CA3AF",
                      textDecorationLine: "line-through",
                    }}
                  >
                    {" "}
                    ₹{selectedVariation.original_price}
                  </Text>
                )}
            </Text>
          </View>

          {product.brand && (
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter_500Medium",
                color: "#8B5CF6",
                marginBottom: 4,
              }}
            >
              {product.brand}
            </Text>
          )}

          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_600SemiBold",
              color: "#374151",
              marginBottom: 12,
              lineHeight: 18,
            }}
            numberOfLines={2}
          >
            {product.name}
          </Text>

          {/* Variation Selector */}
          <TouchableOpacity
            onPress={() =>
              product.variations?.length > 1
                ? setShowVariationModal(true)
                : null
            }
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F8FAFC",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#E2E8F0",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: "#1F2937",
                flex: 1,
              }}
            >
              {selectedVariation.unit || selectedVariation.name}
            </Text>
            {product.variations?.length > 1 && (
              <ChevronDown size={16} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>
      </View>

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
