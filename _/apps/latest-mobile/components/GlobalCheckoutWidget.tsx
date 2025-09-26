import {
    Inter_500Medium,
    Inter_600SemiBold,
    useFonts,
} from "@expo-google-fonts/inter";
import { usePathname, useRouter } from "expo-router";
import { ShoppingCart } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "../utils/CartContext";

export default function GlobalCheckoutWidget() {
  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_500Medium,
  });

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems, totalAmount } = useCart();

  // Only show widget on home and categories pages
  const allowedPages = [
    '/(tabs)/home',
    '/home',
    '/(tabs)/categories', 
    '/categories'
  ];
  
  const shouldShowWidget = allowedPages.some(page => pathname?.includes(page)) || 
                          pathname === '/' || 
                          pathname === '/home' ||
                          pathname === '/categories';

  if (!fontsLoaded || totalItems === 0 || !shouldShowWidget) {
    return null;
  }

  const handleViewCart = () => {
    router.push("/(tabs)/cart" as any);
  };

  const handleCheckout = () => {
    // Navigate to checkout screen
    console.log("Proceeding to checkout");
    router.push("/checkout" as any);
  };

  return (
    <View
             style={{
         position: "absolute",
         bottom: insets.bottom + 80,
         left: 20,
         right: 20,
         backgroundColor: "#111827",
         borderRadius: 32,
         flexDirection: "row",
         alignItems: "center",
         paddingHorizontal: 16,
         paddingVertical: 12,
         shadowColor: "#000",
         shadowOffset: { width: 0, height: 12 },
         shadowOpacity: 0.3,
         shadowRadius: 24,
         elevation: 12,
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
            {totalItems} {totalItems === 1 ? "item" : "items"} • ₹{totalAmount}
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
  );
}
