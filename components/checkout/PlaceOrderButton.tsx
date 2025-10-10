import React from "react";
import {
    ActivityIndicator,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function PlaceOrderButton({ 
  onPlaceOrder, 
  isPlacingOrder, 
  total, 
  disabled 
}: {
  onPlaceOrder: () => void;
  isPlacingOrder: boolean;
  total: number;
  disabled: boolean;
}) {
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    console.log("=== PLACE ORDER BUTTON PRESSED ===");
    console.log("disabled:", disabled);
    console.log("isPlacingOrder:", isPlacingOrder);
    console.log("onPlaceOrder function:", onPlaceOrder);
    
    if (!disabled && !isPlacingOrder) {
      console.log("Calling onPlaceOrder...");
      onPlaceOrder();
    } else {
      console.log("Button is disabled or already placing order");
    }
  };

  return (
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
        borderTopColor: "#F3F4F6",
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        style={{
          backgroundColor: !disabled ? "#8B5CF6" : "#E5E7EB",
          borderRadius: 16,
          paddingVertical: 16,
          alignItems: "center",
        }}
      >
        {isPlacingOrder ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              color: !disabled ? "#FFFFFF" : "#9CA3AF",
            }}
          >
            Place Order • ₹{(total || 0).toFixed(0)}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
