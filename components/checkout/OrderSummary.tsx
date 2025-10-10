import { ShoppingBag } from "lucide-react-native";
import React from "react";
import { Image, ScrollView, Text, View } from "react-native";

export function OrderSummary({
  cartItems = [],
  subtotal = 0,
  deliveryFee = 0,
  discount = 0,
  total = 0,
  savings = 0,
  chargestag = "",
}: {
  cartItems: any[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  savings?: number;
  chargestag?: string;
}) {
  const formatPrice = (price: number) => {
    const numPrice = parseFloat(price || 0);
    if (isNaN(numPrice)) return "₹0.00";
    return `₹${numPrice.toFixed(2)}`;
  };

  const formatWeight = (weight: number) => {
    if (!weight) return "";
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(1)}kg`;
    }
    return `${weight}g`;
  };

  return (
    <View style={{ backgroundColor: "#FFFFFF", marginTop: 8, padding: 20 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <ShoppingBag size={20} color="#8B5CF6" />
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_600SemiBold",
            color: "#111827",
            marginLeft: 8,
          }}
        >
          Order Summary
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_500Medium",
            color: "#6B7280",
            marginLeft: 8,
          }}
        >
          ({cartItems?.length || 0} items)
        </Text>
      </View>

      {/* Cart Items */}
      <ScrollView
        style={{ maxHeight: 200 }}
        showsVerticalScrollIndicator={false}
      >
        {cartItems?.map((item, index) => (
          <View
            key={item.id || `item-${index}`}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 12,
              borderBottomWidth:
                cartItems.length > 1 && index < cartItems.length - 1 ? 1 : 0,
              borderBottomColor: "#F3F4F6",
            }}
          >
            {/* Product Image */}
            <View
              style={{
                width: 50,
                height: 50,
                backgroundColor: "#F9FAFB",
                borderRadius: 8,
                marginRight: 12,
                overflow: "hidden",
              }}
            >
              {item.product?.images?.[0] ? (
                <Image
                  source={{ uri: item.product.images[0] }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#E5E7EB",
                  }}
                >
                  <ShoppingBag size={20} color="#9CA3AF" />
                </View>
              )}
            </View>

            {/* Product Details */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#111827",
                  marginBottom: 2,
                }}
                numberOfLines={1}
              >
                {item.product?.name || "Product"}
              </Text>

              {item.variation && (
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_400Regular",
                    color: "#6B7280",
                    marginBottom: 4,
                  }}
                >
                  {item.variation.name}
                  {item.product?.category && ` • ${item.product.category}`}
                </Text>
              )}

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Inter_500Medium",
                        color: "#6B7280",
                      }}
                    >
                      {formatPrice(item.variation?.price || item.product?.price)} ×{" "}
                      {item.quantity}
                    </Text>
                    {item.variation?.mrp && item.variation.mrp > item.variation.price && (
                      <Text
                        style={{
                          fontSize: 10,
                          fontFamily: "Inter_400Regular",
                          color: "#9CA3AF",
                          textDecorationLine: "line-through",
                          marginLeft: 8,
                        }}
                      >
                        {formatPrice(item.variation.mrp)}
                      </Text>
                    )}
                  </View>
                  {item.variation?.savings && item.variation.savings > 0 && (
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: "Inter_500Medium",
                        color: "#10B981",
                      }}
                    >
                      Save {formatPrice(item.variation.savings)}
                    </Text>
                  )}
                </View>

                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_600SemiBold",
                    color: "#111827",
                  }}
                >
                  {formatPrice(
                    (item.variation?.subtotal || item.variation?.price || item.product?.price || 0) *
                      (item.quantity || 1),
                  )}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Price Breakdown */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
          paddingTop: 16,
          marginTop: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_500Medium",
              color: "#6B7280",
            }}
          >
            Subtotal
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_600SemiBold",
              color: "#111827",
            }}
          >
            {formatPrice(subtotal)}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_500Medium",
              color: "#6B7280",
            }}
          >
            Delivery Fee
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_600SemiBold",
              color: deliveryFee === 0 ? "#10B981" : "#111827",
            }}
          >
            {deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}
          </Text>
        </View>

        {savings > 0 && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: "#6B7280",
              }}
            >
              Total Savings
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: "#10B981",
              }}
            >
              -{formatPrice(savings)}
            </Text>
          </View>
        )}

        {discount > 0 && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: "#6B7280",
              }}
            >
              Coupon Discount
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: "#10B981",
              }}
            >
              -{formatPrice(discount)}
            </Text>
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: "#F3F4F6",
            marginTop: 8,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Inter_700Bold",
              color: "#111827",
            }}
          >
            Total
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Inter_700Bold",
              color: "#8B5CF6",
            }}
          >
            {formatPrice(total)}
          </Text>
        </View>

        {/* Savings Message */}
        {(discount > 0 || savings > 0) && (
          <View
            style={{
              backgroundColor: "#F0FDF4",
              borderRadius: 8,
              padding: 12,
              marginTop: 12,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter_500Medium",
                color: "#15803D",
                textAlign: "center",
              }}
            >
              🎉 You're saving {formatPrice(discount + savings)} on this order!
            </Text>
          </View>
        )}

        {/* Charges Tag Message */}
        {chargestag && (
          <View
            style={{
              backgroundColor: "#FEF3C7",
              borderRadius: 8,
              padding: 12,
              marginTop: 8,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter_500Medium",
                color: "#D97706",
                textAlign: "center",
              }}
            >
              {chargestag}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
