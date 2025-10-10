import React from "react";
import { View, ActivityIndicator } from "react-native";

export function CheckoutLoader() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#8B5CF6" />
    </View>
  );
}
