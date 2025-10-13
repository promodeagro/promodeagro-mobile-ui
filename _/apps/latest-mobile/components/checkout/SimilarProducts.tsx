import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { apiService } from "../../config/api";
import { useCart } from "../../utils/CartContext";

export function SimilarProducts({
  basedOnCategory,
  onSeeAll,
  onAddMore,
}: {
  basedOnCategory?: string;
  onSeeAll?: () => void;
  onAddMore?: () => void;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const load = async () => {
      if (!basedOnCategory) return;
      try {
        setLoading(true);
        const res = await apiService.fetchProductsBySubcategory(basedOnCategory);
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res?.products) ? res.products : [];
        setItems(list.slice(0, 8));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [basedOnCategory]);

  return (
    <View style={{ backgroundColor: "#FFFFFF", marginTop: 12, padding: 20, borderRadius: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: "#111827" }}>Missed something?</Text>
        {onAddMore && (
          <TouchableOpacity onPress={onAddMore}>
            <Text style={{ color: "#6D28D9", fontWeight: "600" }}>+ Add More Items</Text>
          </TouchableOpacity>
        )}
      </View>
      {loading ? (
        <Text style={{ color: "#6B7280" }}>Loading…</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {items.map((p, idx) => (
            <View key={p.id || p.ProductId || `s-${idx}`} style={{ width: 140, marginRight: 12 }}>
              <View style={{ width: 140, height: 100, borderRadius: 12, overflow: "hidden", backgroundColor: "#F9FAFB" }}>
                {p.image || p.productImage ? (
                  <Image source={{ uri: p.image || p.productImage }} style={{ width: "100%", height: "100%" }} />
                ) : null}
              </View>
              <Text numberOfLines={1} style={{ marginTop: 8, fontSize: 13, color: "#111827" }}>{p.name || p.productName || "Product"}</Text>
              <Text style={{ fontSize: 12, color: "#6B7280" }}>₹{Number(p.price || p.Price || 0).toFixed(2)}</Text>
              <TouchableOpacity
                onPress={() => addToCart(String(p.ProductId || p.id), String(p.variationId || p.defaultVariationId || "default"), { price: p.price || p.Price, name: p.unit || p.QuantityUnits })}
                style={{ marginTop: 8, backgroundColor: "#8B5CF6", borderRadius: 8, paddingVertical: 8, alignItems: "center" }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Add</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
      {onSeeAll && !loading && (
        <TouchableOpacity onPress={onSeeAll} style={{ marginTop: 12, alignSelf: "flex-start" }}>
          <Text style={{ color: "#6D28D9", fontWeight: "600" }}>See all products</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}


