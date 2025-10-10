import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { ArrowLeft, Trash2, Plus, Minus } from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export default function CartScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Mock cart data
  const cartItems = [
    {
      id: 1,
      quantity: 2,
      product: {
        name: "Organic Fresh Tomatoes",
        images: ["https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop&crop=center"],
        price: 85.00
      },
      variation: {
        name: "1kg",
        price: 85.00,
        weight_grams: 1000
      }
    },
    {
      id: 2,
      quantity: 1,
      product: {
        name: "Fresh Spinach",
        images: ["https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop&crop=center"],
        price: 45.00
      },
      variation: {
        name: "250g",
        price: 45.00,
        weight_grams: 250
      }
    }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.variation?.price || item.product?.price) * item.quantity, 0);
  const deliveryFee = subtotal > 200 ? 0 : 30;
  const total = subtotal + deliveryFee;

  if (!fontsLoaded) {
    return null;
  }

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
            fontFamily: "Inter_600SemiBold",
            color: "#111827",
            flex: 1,
            textAlign: "center",
            marginHorizontal: 16,
          }}
        >
          Shopping Cart
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        {cartItems.length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 100 }}>
            <Text style={{ fontSize: 18, fontFamily: "Inter_600SemiBold", color: "#6B7280", marginBottom: 8 }}>
              Your cart is empty
            </Text>
            <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: "#9CA3AF", textAlign: "center" }}>
              Add some products to get started
            </Text>
          </View>
        ) : (
          <>
            {/* Cart Items */}
            {cartItems.map((item, index) => (
              <View
                key={item.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  marginTop: index === 0 ? 8 : 0,
                  padding: 20,
                  borderBottomWidth: index < cartItems.length - 1 ? 1 : 0,
                  borderBottomColor: "#F3F4F6",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {/* Product Image */}
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      backgroundColor: "#F9FAFB",
                      borderRadius: 12,
                      marginRight: 16,
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
                        <Text style={{ color: "#9CA3AF", fontSize: 12 }}>No Image</Text>
                      </View>
                    )}
                  </View>

                  {/* Product Details */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "Inter_600SemiBold",
                        color: "#111827",
                        marginBottom: 4,
                      }}
                      numberOfLines={2}
                    >
                      {item.product?.name}
                    </Text>

                    {item.variation && (
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: "Inter_400Regular",
                          color: "#6B7280",
                          marginBottom: 8,
                        }}
                      >
                        {item.variation.name} • {(item.variation.weight_grams / 1000).toFixed(1)}kg
                      </Text>
                    )}

                    <Text
                      style={{
                        fontSize: 18,
                        fontFamily: "Inter_700Bold",
                        color: "#111827",
                      }}
                    >
                      ₹{(item.variation?.price || item.product?.price) * item.quantity}
                    </Text>
                  </View>

                  {/* Quantity Controls */}
                  <View style={{ alignItems: "center" }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#F3F4F6",
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          width: 32,
                          height: 32,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Minus size={16} color="#6B7280" />
                      </TouchableOpacity>

                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: "Inter_600SemiBold",
                          color: "#111827",
                          minWidth: 32,
                          textAlign: "center",
                        }}
                      >
                        {item.quantity}
                      </Text>

                      <TouchableOpacity
                        style={{
                          width: 32,
                          height: 32,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Plus size={16} color="#6B7280" />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={{
                        marginTop: 8,
                        padding: 8,
                      }}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            {/* Order Summary */}
            <View style={{ backgroundColor: "#FFFFFF", marginTop: 8, padding: 20 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Inter_700Bold",
                  color: "#111827",
                  marginBottom: 16,
                }}
              >
                Order Summary
              </Text>

              <View style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, fontFamily: "Inter_500Medium", color: "#6B7280" }}>
                    Subtotal
                  </Text>
                  <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#111827" }}>
                    ₹{subtotal.toFixed(2)}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, fontFamily: "Inter_500Medium", color: "#6B7280" }}>
                    Delivery Fee
                  </Text>
                  <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: deliveryFee === 0 ? "#10B981" : "#111827" }}>
                    {deliveryFee === 0 ? "FREE" : `₹${deliveryFee.toFixed(2)}`}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F3F4F6" }}>
                  <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: "#111827" }}>
                    Total
                  </Text>
                  <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: "#8B5CF6" }}>
                    ₹{total.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      {cartItems.length > 0 && (
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
          }}
        >
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/checkout")}
            style={{
              backgroundColor: "#8B5CF6",
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#FFFFFF",
              }}
            >
              Proceed to Checkout • ₹{total.toFixed(0)}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
