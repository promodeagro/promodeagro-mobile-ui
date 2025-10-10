import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ShoppingCart } from "lucide-react-native";

export function CartFAB() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleViewCart = () => {
    router.push("/(tabs)/cart");
  };

  const handleCheckout = () => {
    router.push("/(tabs)/checkout");
  };

  return (
    <TouchableOpacity
      onPress={handleViewCart}
      style={{
        position: "absolute",
        bottom: insets.bottom + 24,
        left: 24,
        right: 24,
        height: 64,
        backgroundColor: "#111827",
        borderRadius: 32,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 40,
            height: 40,
            backgroundColor: "#6366F1",
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ShoppingCart size={18} color="#FFFFFF" />
        </View>

        <View style={{ marginLeft: 16 }}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_700Bold",
              color: "#FFFFFF",
            }}
          >
            View Cart
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Inter_500Medium",
              color: "#9CA3AF",
            }}
          >
            12 items • ₹1,240
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleCheckout}
        style={{
          backgroundColor: "#6366F1",
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_600SemiBold",
            color: "#FFFFFF",
          }}
        >
          Checkout
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
