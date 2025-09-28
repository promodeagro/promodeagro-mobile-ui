import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronDown, Clock, Minus, Plus, TrendingUp, X, Zap } from "lucide-react-native";
import { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useCart } from "../../utils/CartContext";
import { getFont, getTextStyle } from "../../utils/fontStyles";

export function FlashDealsSection({ deals }: { deals: any[] }) {
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

  if (!deals || deals.length === 0) {
    return null;
  }

  return (
    <>
      <View style={{ marginBottom: 32, marginTop: 20 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 24,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Zap size={20} color="#EF4444" />
            <Text
              style={getTextStyle({
                fontSize: 20,
                fontFamily: getFont("Inter_700Bold"),
                color: "#111827",
                marginLeft: 8,
              })}
            >
              Flash Deals
            </Text>
            <View
              style={{
                backgroundColor: "#FEF2F2",
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 12,
                marginLeft: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_600SemiBold",
                  color: "#EF4444",
                }}
              >
                Limited Time
              </Text>
            </View>
          </View>
          <TrendingUp size={16} color="#6B7280" />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingLeft: 24,
            paddingRight: 24,
            flexDirection: "row",
            alignItems: "flex-start",
          }}
          style={{
            flexGrow: 0,
            height: 280, // Adjusted height to reduce extra space after products
          }}
          decelerationRate="fast"
          snapToInterval={176} // card width (160) + margin (16)
          snapToAlignment="start"
        >
          {deals.map((deal) => {
            // Get the default variation or first available variation
            const defaultVariation =
              deal.variations?.find((v: any) => v.is_default) || deal.variations?.[0];
            const currentVariation = defaultVariation || {
              id: null,
              name: deal.unit || "1 unit",
              price: deal.price,
              original_price: deal.original_price,
              unit: deal.unit || "unit",
            };

            // Get current quantity in cart for this product variation
            const cartKey = `${deal.id}-${currentVariation.id || "default"}`;
            const cartItem = cartItems.get(cartKey);
            const currentQuantity = cartItem?.quantity || 0;

            const handleAddToCart = async () => {
              await addToCart(deal.id, currentVariation.id, currentVariation);
            };

            const handleIncreaseQuantity = async () => {
              if (currentQuantity === 0) {
                await addToCart(deal.id, currentVariation.id, currentVariation);
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
                key={deal.id}
                onPress={() => router.push(`/product/${deal.id}`)}
                style={{
                  width: 160,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  marginRight: 16,
                  overflow: "hidden",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.12,
                  shadowRadius: 16,
                  elevation: 6,
                  borderWidth: 1,
                  borderColor: "#F3F4F6",
                  minHeight: 260, // Ensure minimum height for full content
                }}
              >
                <View style={{ position: "relative", height: 120 }}>
                  <Image
                    source={{ uri: deal.images?.[0] }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                  <View
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "#EF4444",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: "Inter_700Bold",
                        color: "#FFFFFF",
                      }}
                    >
                      -
                      {deal.discount_percentage ||
                        (currentVariation.original_price > currentVariation.price
                          ? Math.round(
                              ((currentVariation.original_price -
                                currentVariation.price) /
                                currentVariation.original_price) *
                              100,
                            )
                          : 0)}
                      %
                    </Text>
                  </View>
                  <View
                    style={{
                      position: "absolute",
                      bottom: 8,
                      left: 8,
                      backgroundColor: "rgba(0,0,0,0.7)",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Clock size={10} color="#FFFFFF" />
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: "Inter_600SemiBold",
                        color: "#FFFFFF",
                        marginLeft: 4,
                      }}
                    >
                      2h 30m
                    </Text>
                  </View>
                </View>

                <View style={{ padding: 12, paddingBottom: 16 }}>
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
                    {deal.name && deal.name.length > 20 ? `${deal.name.substring(0, 20)}...` : deal.name}
                  </Text>

                  {/* Variation Selector */}
                  {deal.variations && deal.variations.length > 0 && (
                    <TouchableOpacity
                      onPress={() => deal.variations.length > 1 ? openVariationModal(deal) : null}
                      disabled={deal.variations.length === 1}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: deal.variations.length === 1 ? "#F3F4F6" : "#F8FAFC",
                        paddingHorizontal: 8,
                        paddingVertical: 6,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: deal.variations.length === 1 ? "#D1D5DB" : "#E2E8F0",
                        marginBottom: 8,
                        opacity: deal.variations.length === 1 ? 0.7 : 1,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: "Inter_600SemiBold",
                          color: deal.variations.length === 1 ? "#6B7280" : "#1F2937",
                          flex: 1,
                        }}
                      >
                        {currentVariation.name}
                      </Text>
                      {deal.variations.length > 1 && <ChevronDown size={12} color="#6B7280" />}
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
                      {currentVariation.name}
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
                          color: "#EF4444",
                        }}
                      >
                        ₹{currentVariation.price}
                      </Text>
                      {currentVariation.original_price &&
                        currentVariation.original_price >
                          currentVariation.price && (
                          <Text
                            style={{
                              fontSize: 12,
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
                         backgroundColor: "#EF4444",
                         borderRadius: 12,
                         justifyContent: "center",
                         alignItems: "center",
                       }}
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
                         backgroundColor: "#EF4444", // Same color as plus button (red)
                         borderRadius: 12, // More rounded corners
                         paddingHorizontal: 4,
                         paddingVertical: 2,
                       }}
                     >
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDecreaseQuantity();
                        }}
                        style={{
                          width: 18,
                          height: 18,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Minus size={10} color="#FFFFFF" strokeWidth={2.5} />
                      </TouchableOpacity>
                      
                      <View
                        style={{
                          paddingHorizontal: 4,
                          paddingVertical: 1,
                          minWidth: 14,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
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
                          width: 18,
                          height: 18,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Plus size={10} color="#FFFFFF" strokeWidth={2.5} />
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
