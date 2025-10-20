import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronDown, X, Heart } from "lucide-react-native";
import { useState } from "react";
import React, { useMemo, useRef, useCallback, memo } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View, FlatList } from "react-native";
import { useCart } from "../../utils/CartContext";
import { useWishlist } from "../../utils/WishlistContext";
import { BlinkitQuantityControl } from "../ui/BlinkitQuantityControl";

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

// Memoized Product Card Component
const ProductCard = memo(({ 
  item, 
  currentVariation, 
  currentQuantity, 
  isInStock, 
  onAddToCart, 
  onIncreaseQuantity, 
  onDecreaseQuantity, 
  onOpenVariationModal,
  onProductPress 
}: {
  item: Product;
  currentVariation: ProductVariation;
  currentQuantity: number;
  isInStock: boolean;
  onAddToCart: () => void;
  onIncreaseQuantity: () => void;
  onDecreaseQuantity: () => void;
  onOpenVariationModal: () => void;
  onProductPress: () => void;
}) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
              return (
                <TouchableOpacity
                  key={item.groupId}
      onPress={onProductPress}
                  style={{
                    width: 180,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    marginRight: 16,
                    overflow: "hidden",
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


                    {/* Wishlist Button */}
                    <TouchableOpacity
                      onPress={() => {
                        toggleWishlist({
                          id: item.groupId,
                          name: item.name,
                          price: currentVariation.price,
                          image: item.image,
                          category: item.category,
                          variationId: currentVariation.id,
                          variation: currentVariation,
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
                      }}
                    >
                      <Heart 
                        size={16} 
                        color={isInWishlist(item.groupId) ? "#EF4444" : "#000000"} 
                        fill={isInWishlist(item.groupId) ? "#EF4444" : "none"}
                        strokeWidth={2}
                      />
                    </TouchableOpacity>

                    {/* Discount Badge if available */}
                    {currentVariation.mrp > 0 && currentVariation.mrp > currentVariation.price && (
                      <View
                        style={{
                          position: "absolute",
                          top: 8,
                          left: 8,
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
            onPress={() => item.variations.length > 1 ? onOpenVariationModal() : null}
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
                      {/* Blinkit-style Quantity Controls */}
                      <BlinkitQuantityControl
                        currentQuantity={currentQuantity}
                        isInStock={isInStock}
                        onAddToCart={onAddToCart}
                        onIncreaseQuantity={onIncreaseQuantity}
                        onDecreaseQuantity={onDecreaseQuantity}
                        size="medium"
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
});

export const CategoryProductsSection = memo(({ categoryData }: { categoryData: CategoryData[] }) => {
  const router = useRouter();
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [showVariationModal, setShowVariationModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);


  // Lightweight debounce util (per instance)
  const debounce = useCallback((fn: (...args: any[]) => void, wait: number) => {
    let t: any;
    return (...args: any[]) => {
      if (t) clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }, []);

  // Debounced quantity sync to avoid spamming state on rapid taps
  const debouncedUpdateQuantity = useRef(debounce((key: string, qty: number) => {
    updateQuantity(key, qty);
  }, 80)).current;

  const handleVariationSelect = useCallback((product: Product, variation: ProductVariation) => {
    // Update the product's current variation
    (product as any).currentVariation = variation;
    setShowVariationModal(false);
  }, []);

  const openVariationModal = useCallback((product: Product) => {
    setSelectedProduct(product);
    setShowVariationModal(true);
  }, []);

  if (!categoryData || categoryData.length === 0) {
    return null;
  }

  // Define the specific order of categories to display (with aliases)
  const categoryOrder = ["Bengali Special", "Fresh Fruits", "Fresh Vegetables"];

  const categoryAliases: Record<string, string[]> = {
    "Bengali Special": ["bengali special", "bengali"],
    "Fresh Fruits": ["fresh fruits", "fruits", "fruit"],
    "Fresh Vegetables": ["fresh vegetables", "vegetables", "veggies", "vegetable"],
  };

  const normalize = (val?: string) => (val || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

  // Build ordered categories using aliases; if not found, include empty section to show header
  const orderedCategories = useMemo(() => {
    const available = Array.isArray(categoryData) ? categoryData : [];

    // Helper: normalize a product item to ensure groupId exists
    const normalizeItems = (items?: any[]) =>
      Array.isArray(items)
        ? items.map((it) => ({ ...it, groupId: it?.groupId || it?.id }))
        : [];

    const result = categoryOrder.map((displayName) => {
      const aliases = categoryAliases[displayName] || [displayName];
      
      // First, try to find exact matches
      const exactMatch = available.find((cat) => {
        const catName = normalize((cat as any)?.category);
        const subName = normalize((cat as any)?.subcategory);
        return aliases.some((alias) => {
          const a = normalize(alias);
          return catName === a || subName === a;
        });
      });

      if (exactMatch) {
        const normalizedItems = normalizeItems((exactMatch as any).items);
        return {
          category: displayName,
          subcategory: (exactMatch as any)?.subcategory,
          items: normalizedItems,
        } as CategoryData;
      }

      // If no exact match, try partial matches but be more specific
      const partialMatch = available.find((cat) => {
        const catName = normalize((cat as any)?.category);
        const subName = normalize((cat as any)?.subcategory);
        return aliases.some((alias) => {
          const a = normalize(alias);
          // Only match if the category name starts with or contains the alias as a whole word
          return catName.includes(a) || subName.includes(a);
        });
      });

      if (partialMatch) {
        const normalizedItems = normalizeItems((partialMatch as any).items);
        return {
          category: displayName,
          subcategory: (partialMatch as any)?.subcategory,
          items: normalizedItems,
        } as CategoryData;
      }

      // If still no match, try to aggregate from multiple categories but be very specific
      const aliasSet = new Set((categoryAliases[displayName] || [displayName]).map((a) => normalize(a)));
      const aggregated: any[] = [];
      
      for (const cat of available) {
        const catName = normalize((cat as any)?.category);
        const subName = normalize((cat as any)?.subcategory);
        
        // Only include if it's a clear match and not already assigned to a higher priority category
        const catMatches = [...aliasSet].some((a) => {
          return catName.includes(a) || subName.includes(a);
        });
        
        if (catMatches && Array.isArray((cat as any)?.items)) {
          // Additional check: make sure this category hasn't been used by a higher priority section
          const isUsedByHigherPriority = categoryOrder.slice(0, categoryOrder.indexOf(displayName)).some(priorityName => {
            const priorityAliases = categoryAliases[priorityName] || [priorityName];
            return priorityAliases.some(alias => {
              const normalizedAlias = normalize(alias);
              return catName.includes(normalizedAlias) || subName.includes(normalizedAlias);
            });
          });
          
          if (!isUsedByHigherPriority) {
            aggregated.push(...normalizeItems((cat as any).items));
          }
        }
      }

      return { category: displayName, subcategory: "", items: aggregated } as CategoryData;
    });

    return result;
  }, [categoryData]);

  return (
    <>
      {orderedCategories.map((category, categoryIndex) => (
        <View key={`${category.category}-${categoryIndex}`} style={{ marginBottom: 32, borderWidth: 0 }}>
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

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
            style={{ borderWidth: 0 }}
            data={Array.isArray(category.items) ? category.items : []}
            keyExtractor={(it) => (it?.groupId || it?.id)}
            renderItem={({ item }) => {
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

              // Handlers for this product (no hooks inside renderItem)
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
                const next = currentQuantity > 1 ? currentQuantity - 1 : 0;
                debouncedUpdateQuantity(cartKey, next);
              };

              const handleOpenVariationModal = () => {
                openVariationModal(item);
              };

              const handleProductPress = () => {
                router.push(`/(tabs)/product/${item.groupId}`);
              };

              return (
                <ProductCard
                  key={item.groupId}
                  item={item}
                  currentVariation={currentVariation}
                  currentQuantity={currentQuantity}
                  isInStock={isInStock}
                  onAddToCart={handleAddToCart}
                  onIncreaseQuantity={handleIncreaseQuantity}
                  onDecreaseQuantity={handleDecreaseQuantity}
                  onOpenVariationModal={handleOpenVariationModal}
                  onProductPress={handleProductPress}
                />
              );
            }}
            getItemLayout={(data, index) => ({ length: 196, offset: 196 * index, index })}
            initialNumToRender={6}
            maxToRenderPerBatch={8}
            windowSize={5}
          />
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
});

export default CategoryProductsSection;