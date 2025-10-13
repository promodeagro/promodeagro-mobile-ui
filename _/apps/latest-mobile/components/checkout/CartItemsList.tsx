import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { ShoppingBag, Trash2 } from "lucide-react-native";

export type CartLineItem = {
  id?: string;
  quantity: number;
  product?: { name?: string; images?: string[]; price?: number; category?: string };
  variation?: { name?: string; price?: number; mrp?: number };
};

export function CartItemsList({
  items,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  items: CartLineItem[];
  onIncrease: (index: number) => void;
  onDecrease: (index: number) => void;
  onRemove: (index: number) => void;
}) {
  const formatPrice = (price?: number) => `₹${Number(price || 0).toFixed(2)}`;

  return (
    <View style={{ backgroundColor: "#FFFFFF", marginTop: 8, padding: 20, borderRadius: 12 }}>
      <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: "#111827", marginBottom: 12 }}>Cart Items</Text>
      {items.map((item, index) => (
        <View
          key={item.id || `line-${index}`}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 12,
            borderBottomWidth: index < items.length - 1 ? 1 : 0,
            borderBottomColor: "#F3F4F6",
          }}
        >
          <View style={{ width: 54, height: 54, backgroundColor: "#F9FAFB", borderRadius: 8, overflow: "hidden", marginRight: 12 }}>
            {item.product?.images?.[0] ? (
              <Image source={{ uri: item.product.images[0] }} style={{ width: "100%", height: "100%" }} />
            ) : (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#E5E7EB" }}>
                <ShoppingBag size={20} color="#9CA3AF" />
              </View>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#111827" }} numberOfLines={1}>
              {item.product?.name || "Product"}
            </Text>
            {item.variation?.name ? (
              <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{item.variation.name}</Text>
            ) : null}
            <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
              {formatPrice(item.variation?.price ?? item.product?.price)} × {item.quantity}
            </Text>
          </View>

          <View style={{ alignItems: "center", minWidth: 96 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity onPress={() => onDecrease(index)} style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#F3F4F6", borderRadius: 8 }}>
                <Text style={{ fontSize: 16, color: "#111827" }}>-</Text>
              </TouchableOpacity>
              <Text style={{ width: 32, textAlign: "center", fontSize: 14, color: "#111827" }}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => onIncrease(index)} style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#EDE9FE", borderRadius: 8 }}>
                <Text style={{ fontSize: 16, color: "#6D28D9" }}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ marginTop: 6, fontSize: 12, color: "#111827", fontFamily: "Inter_600SemiBold" }}>
              ₹{Number((item.variation?.price ?? item.product?.price ?? 0) * (item.quantity || 1)).toFixed(2)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}


