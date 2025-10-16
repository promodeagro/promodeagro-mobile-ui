import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ShoppingCart } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_500Medium,
} from "@expo-google-fonts/inter";

export default function CheckoutWidget({ itemCount = 0, totalAmount = 0, visible = false }) {
  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_500Medium,
  });

  const insets = useSafeAreaInsets();
  const router = useRouter();

  if (!fontsLoaded || !visible || itemCount === 0) {
    return null;
  }

  const handleViewCart = () => {
    router.push("/(tabs)/cart");
  };

  const handleCheckout = () => {
    // Navigate to checkout screen
    console.log("Proceeding to checkout");
    router.push("/(tabs)/checkout");
  };

  return (
    <View
      style={{
        position: "absolute",
        bottom: insets.bottom + 10,
        left: 20,
        right: 20,
        backgroundColor: "black",
        borderRadius: 24,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
        zIndex: 1000,
      }}
    >
      {/* Cart Icon and Info */}
      <TouchableOpacity
        onPress={handleViewCart}
        style={{
          flexDirection: "row",
          alignItems: "center",
          flex: 1,
        }}
      >
        {/* Cart Icon */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#8B5CF6",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <ShoppingCart size={20} color="#FFFFFF" strokeWidth={2} />
        </View>

        {/* Cart Info */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              color: "#FFFFFF",
              marginBottom: 2,
            }}
          >
            View Cart
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Inter_500Medium",
              color: "#D1D5DB",
            }}
          >
            {itemCount} {itemCount === 1 ? "item" : "items"} • ₹{totalAmount}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Checkout Button */}
      <TouchableOpacity
        onPress={handleCheckout}
        style={{
          backgroundColor: "#8B5CF6",
          borderRadius: 20,
          paddingHorizontal: 24,
          paddingVertical: 10,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            fontFamily: "Inter_600SemiBold",
            color: "#FFFFFF",
          }}
        >
          Checkout
        </Text>
      </TouchableOpacity>
    </View>
  );``
}
