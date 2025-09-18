import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";

export default function Index() {
  // Now using full home screen with all features
  try {
    return <Redirect href="/splash" />;
  } catch (error) {
    console.error("Index error:", error);
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F8F9FA",
        }}
      >
        <ActivityIndicator size="large" color="#6366F1" />
        <Text
          style={{
            marginTop: 16,
            fontSize: 16,
            color: "#6B7280",
          }}
        >
          Loading Grocery App...
        </Text>
      </View>
    );
  }
}
