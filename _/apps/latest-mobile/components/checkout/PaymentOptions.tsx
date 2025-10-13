import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export type PaymentMethod = "card" | "upi" | "cod";

export function PaymentOptions({
  selected,
  onSelect,
}: {
  selected: PaymentMethod;
  onSelect: (m: PaymentMethod) => void;
}) {
  const methods: PaymentMethod[] = ["card", "upi", "cod"];
  return (
    <View style={{ backgroundColor: "#FFFFFF", marginTop: 12, padding: 20, borderRadius: 12 }}>
      <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: "#111827", marginBottom: 12 }}>Payment Method</Text>
      <View>
        {methods.map((m) => {
          const label = m === "cod" ? "Cash on Delivery" : m.toUpperCase();
          const emoji = m === "card" ? "💳" : m === "upi" ? "📱" : "💵";
          return (
          <TouchableOpacity key={m} onPress={() => onSelect(m)} style={{ paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: "#111827" }}>{emoji} {label}</Text>
            <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: selected === m ? "#8B5CF6" : "#E5E7EB", backgroundColor: selected === m ? "#8B5CF6" : "transparent" }} />
          </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}


