import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ArrowLeft, Search } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function CategoryHeader({ categoryName }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      style={{
        paddingTop: Math.max(insets.top, 16),
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 16 }}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 20,
            fontFamily: "Inter_700Bold",
            color: "#111827",
            flex: 1,
          }}
        >
          {categoryName}
        </Text>

        <TouchableOpacity>
          <Search size={24} color="#111827" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
