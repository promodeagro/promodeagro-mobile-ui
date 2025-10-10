import React from "react";
import { View, Text } from "react-native";
import { ShoppingBag } from "lucide-react-native";

export default function EmptySearch() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 60,
      }}
    >
      <ShoppingBag size={64} color="#CCCCCC" />
      <Text
        style={{
          fontSize: 18,
          fontFamily: "Inter_600SemiBold",
          color: "#2D2D2D",
          marginBottom: 8,
          marginTop: 16,
        }}
      >
        No products found
      </Text>
      <Text
        style={{
          fontSize: 14,
          fontFamily: "Inter_400Regular",
          color: "#666666",
          textAlign: "center",
        }}
      >
        Try searching with different keywords
      </Text>
    </View>
  );
}
