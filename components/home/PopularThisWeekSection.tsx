import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronDown, Minus, Plus, Star, X } from "lucide-react-native";
import { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useCart } from "../../utils/CartContext";

export function PopularThisWeekSection({ items }: { items: any[] }) {
  const router = useRouter();
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [showVariationModal, setShowVariationModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const handleVariationSelect = (product: any, variation: any) => {
    // Update the product's current variation
    product.currentVariation = variation;
    setShowVariationModal(false);
  };

  const openVariationModal = (product: any) => {
    setSelectedProduct(product);
    setShowVariationModal(true);
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <>
      <View style={{ marginBottom: 32 }}>
        <Text
          style={{
            fontSize: 20,
            fontFamily: "Inter_700Bold",
            color: "#111827",
            paddingHorizontal: 24,
            marginBottom: 16,
          }}
        >
          Popular This Week
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 24 }}
        >
          {items.map((item) => {
            // Get the default variation or first available variation
            const defaultVariation =
              item.variations?.find((v: any) => v.is_default) || item.variations?.[0];
            const currentVariation = defaultVariation || {
              id: null,
              name: item.unit || "1 unit",
              price: item.price,
              original_price: item.original_price,
              unit: item.unit || "unit",
              stock_quantity: item.stock_quantity,
            };

            // Get current quantity in cart for this product variation
            const cartKey = `${item.id}-${currentVariation.id || "default"}`;
            const cartItem = cartItems.get(cartKey);
            const currentQuantity = cartItem?.quantity || 0;

            const handleAddToCart = async () => {
              await addToCart(item.id, currentVariation.id, currentVariation);
            };

            const handleIncreaseQuantity = async () => {
              if (currentQuantity === 0) {
                await addToCart(item.id, currentVariation.id, currentVariation);
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

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(`/product/${item.id}`)}
                style={{
                  width: 140,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  marginRight: 16,
                  overflow: "hidden",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 4,
                  borderWidth: 1,
                  borderColor: "#F3F4F6",
                }}
              >
                <View style={{ position: "relative", height: 100 }}>
                  <Image
                    source={{ uri: item.images?.[0] }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />

                  {/* Rating Badge */}
                  <View
                    style={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      backgroundColor: "rgba(16, 185, 129, 0.9)",
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 8,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Star size={10} color="#FFFFFF" fill="#FFFFFF" />
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: "Inter_600SemiBold",
                        color: "#FFFFFF",
                        marginLeft: 2,
                      }}
                    >
                      {item.rating}
                    </Text>
                  </View>

                  {/* Discount Badge if available */}
                  {(item.discount_percentage > 0 ||
                    currentVariation.original_price > currentVariation.price) && (
                    <View
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        backgroundColor: "rgba(239, 68, 68, 0.9)",
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 9,
                          fontFamily: "Inter_600SemiBold",
                          color: "#FFFFFF",
                        }}
                      >
                        {item.discount_percentage ||
                          Math.round(
                            ((currentVariation.original_price -
                              currentVariation.price) /
                              currentVariation.original_price) *
                              100,
                          )}
                        % OFF
                      </Text>
                    </View>
                  )}
                </View>

                <View style={{ padding: 12 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_600SemiBold",
                      color: "#374151",
                      marginBottom: 8,
                      lineHeight: 18,
                    }}
                    numberOfLines={2}
                  >
                    {item.name && item.name.length > 20 ? `${item.name.substring(0, 20)}...` : item.name}
                  </Text>

                  {/* Variation Selector */}
                  {item.variations && item.variations.length > 0 && (
                    <TouchableOpacity
                      onPress={() => item.variations.length > 1 ? openVariationModal(item) : null}
                      disabled={item.variations.length === 1}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: item.variations.length === 1 ? "#F3F4F6" : "#F8FAFC",
                        paddingHorizontal: 8,
                        paddingVertical: 6,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: item.variations.length === 1 ? "#D1D5DB" : "#E2E8F0",
                        marginBottom: 8,
                        opacity: item.variations.length === 1 ? 0.7 : 1,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: "Inter_600SemiBold",
                          color: item.variations.length === 1 ? "#6B7280" : "#1F2937",
                          flex: 1,
                        }}
                      >
                        {currentVariation.name}
                      </Text>
                      {item.variations.length > 1 && <ChevronDown size={12} color="#6B7280" />}
                    </TouchableOpacity>
                  )}

                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: "Inter_500Medium",
                        color: "#6B7280",
                      }}
                    >
                      {currentVariation.name} • {item.review_count} reviews
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: "Inter_700Bold",
                          color: "#111827",
                        }}
                      >
                        ₹{currentVariation.price}
                      </Text>
                      {currentVariation.original_price &&
                        currentVariation.original_price >
                          currentVariation.price && (
                          <Text
                            style={{
                              fontSize: 11,
                              fontFamily: "Inter_500Medium",
                              color: "#9CA3AF",
                              textDecorationLine: "line-through",
                            }}
                          >
                            ₹{currentVariation.original_price}
                          </Text>
                        )}
                    </View>
                    {/* Add to Cart / Quantity Controls */}
                    {currentQuantity === 0 ? (
                                         // Add to Cart Button
                     <TouchableOpacity
                       style={{
                         width: 24,
                         height: 24,
                         backgroundColor: "#8B5CF6",
                         borderRadius: 12,
                         justifyContent: "center",
                         alignItems: "center",
                       }}
                       disabled={
                         !item.in_stock || currentVariation.stock_quantity <= 0
                       }
                       onPress={(e) => {
                         e.stopPropagation();
                         handleAddToCart();
                       }}
                     >
                       <Plus size={12} color="#FFFFFF" strokeWidth={2.5} />
                     </TouchableOpacity>
                  ) : (
                                         // Quantity Controls
                     <View
                       style={{
                         flexDirection: "row",
                         alignItems: "center",
                         backgroundColor: "#8B5CF6", // Same color as plus button
                         borderRadius: 16, // More rounded corners
                         paddingHorizontal: 6,
                         paddingVertical: 3,
                       }}
                     >
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDecreaseQuantity();
                        }}
                        style={{
                          width: 20,
                          height: 20,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Minus size={12} color="#FFFFFF" strokeWidth={2.5} />
                      </TouchableOpacity>
                      
                      <View
                        style={{
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          minWidth: 16,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: "Inter_700Bold",
                            color: "#FFFFFF",
                            textAlign: "center",
                          }}
                        >
                          {currentQuantity}
                        </Text>
                      </View>
                      
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleIncreaseQuantity();
                        }}
                        style={{
                          width: 20,
                          height: 20,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Plus size={12} color="#FFFFFF" strokeWidth={2.5} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      </View>

      {/* Variation Selection Modal */}
      <Modal
        visible={showVariationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowVariationModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              maxHeight: "50%",
            }}
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

            {selectedProduct?.variations?.map((variation: any) => (
              <TouchableOpacity
                key={variation.id}
                onPress={() => handleVariationSelect(selectedProduct, variation)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor:
                    selectedProduct?.currentVariation?.id === variation.id
                      ? "#EDE9FE"
                      : "#FFFFFF",
                  borderWidth: 1,
                  borderColor:
                    selectedProduct?.currentVariation?.id === variation.id
                      ? "#8B5CF6"
                      : "#E5E7EB",
                  marginBottom: 8,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Inter_600SemiBold",
                      color: "#111827",
                      marginBottom: 2,
                    }}
                  >
                    {variation.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_500Medium",
                      color: "#6B7280",
                    }}
                  >
                    {variation.stock_quantity > 0
                      ? `${variation.stock_quantity} in stock`
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
          </View>
        </View>
      </Modal>
    </>
  );
}
