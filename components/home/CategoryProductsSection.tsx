import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronDown, Minus, Plus, Star, X } from "lucide-react-native";
import { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useCart } from "../../utils/CartContext";

interface ProductVariation {
  id: string;
  name: string;
  price: number;
  mrp: number;
  unit: string;
  quantity: number;
  availability: boolean;
  inCart: boolean;
  inWishlist: boolean;
}

interface Product {
  groupId: string;
  name: string;
  category: string;
  subCategory: string;
  image: string;
  images: string[];
  description: string;
  tags: string[];
  variations: ProductVariation[];
}

interface CategoryData {
  category: string;
  subcategory: string;
  items: Product[];
}

export function CategoryProductsSection({ categoryData }: { categoryData: CategoryData[] }) {
  const router = useRouter();
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [showVariationModal, setShowVariationModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleVariationSelect = (product: Product, variation: ProductVariation) => {
    // Update the product's current variation
    (product as any).currentVariation = variation;
    setShowVariationModal(false);
  };

  const openVariationModal = (product: Product) => {
    setSelectedProduct(product);
    setShowVariationModal(true);
  };

  if (!categoryData || categoryData.length === 0) {
    return null;
  }

  // Define the specific order of categories to display
  const categoryOrder = ["Bengali Special", "Fresh Fruits", "Fresh Vegetables"];
  
  // Filter and sort categories according to the specified order
  const orderedCategories = categoryOrder
    .map(categoryName => 
      categoryData.find(category => category.category === categoryName)
    )
    .filter(Boolean); // Remove undefined entries

  return (
    <>
      {orderedCategories.map((category, categoryIndex) => (
        <View key={`${category.category}-${categoryIndex}`} style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Inter_700Bold",
              color: "#111827",
              paddingHorizontal: 16,
              marginBottom: 16,
            }}
          >
            {category.category}
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 16 }}
          >
            {category.items.map((item) => {
              // Get the first available variation
              const defaultVariation = item.variations?.[0];
              const currentVariation = defaultVariation || {
                id: item.groupId,
                name: "1 unit",
                price: 0,
                mrp: 0,
                unit: "unit",
                quantity: 1,
                availability: true,
                inCart: false,
                inWishlist: false,
              };

              // Check if the current variation is in stock
              const isInStock = currentVariation?.availability === true && (currentVariation?.quantity > 0 || currentVariation?.stock_quantity > 0);
              
              // Get current quantity in cart for this product variation
              const cartKey = `${item.groupId}-${currentVariation.id}`;
              const cartItem = cartItems.get(cartKey);
              const currentQuantity = cartItem?.quantity || 0;

                             const handleAddToCart = async () => {
                 await addToCart(item.groupId, currentVariation.id, currentVariation);
               };

                             const handleIncreaseQuantity = async () => {
                 if (currentQuantity === 0) {
                   await addToCart(item.groupId, currentVariation.id, currentVariation);
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
                  key={item.groupId}
                  onPress={() => router.push(`/(tabs)/product/${item.groupId}`)}
                  style={{
                    width: 180,
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
                  <View style={{ position: "relative", height: 130 }}>
                    <Image
                      source={{ uri: item.image }}
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
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 16,
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
                        4.5
                      </Text>
                    </View>

                    {/* Discount Badge if available */}
                    {currentVariation.mrp > 0 && currentVariation.mrp > currentVariation.price && (
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
                          {Math.round(((currentVariation.mrp - currentVariation.price) / currentVariation.mrp) * 100)}% OFF
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
                          {currentVariation.unit || currentVariation.name}
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
                        {currentVariation.unit || currentVariation.name} • {item.subCategory}
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
                        {currentVariation.mrp > 0 && currentVariation.mrp > currentVariation.price && (
                          <Text
                            style={{
                              fontSize: 11,
                              fontFamily: "Inter_500Medium",
                              color: "#9CA3AF",
                              textDecorationLine: "line-through",
                            }}
                          >
                            ₹{currentVariation.mrp}
                          </Text>
                        )}
                      </View>
                      {/* Add to Cart / Quantity Controls */}
                      {currentQuantity === 0 ? (
                        <TouchableOpacity
                          style={{
                            width: 24,
                            height: 24,
                            backgroundColor: isInStock ? "#8B5CF6" : "#D1D5DB",
                            borderRadius: 12,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                          disabled={!isInStock}
                          onPress={(e) => {
                            e.stopPropagation();
                            if (isInStock) {
                              handleAddToCart();
                            }
                          }}
                        >
                          <Plus size={12} color={isInStock ? "#FFFFFF" : "#9CA3AF"} strokeWidth={2.5} />
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
                              if (isInStock) {
                                handleIncreaseQuantity();
                              }
                            }}
                            disabled={!isInStock}
                            style={{
                              width: 20,
                              height: 20,
                              justifyContent: "center",
                              alignItems: "center",
                              opacity: isInStock ? 1 : 0.5,
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
      ))}

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

            {selectedProduct?.variations?.map((variation) => (
              <TouchableOpacity
                key={variation.id}
                onPress={() => variation.availability ? handleVariationSelect(selectedProduct, variation) : null}
                disabled={!variation.availability}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor:
                    (selectedProduct as any)?.currentVariation?.id === variation.id
                      ? "#EDE9FE"
                      : !variation.availability
                      ? "#F9FAFB"
                      : "#FFFFFF",
                  borderWidth: 1,
                  borderColor:
                    (selectedProduct as any)?.currentVariation?.id === variation.id
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
                    source={{ uri: variation.image || variation.images?.[0] || selectedProduct?.image }}
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
