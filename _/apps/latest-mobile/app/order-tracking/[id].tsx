import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar, Home, MapPin, Package, Phone, Truck, User } from "lucide-react-native";
import { apiService } from "../../config/api";
import { useFocusEffect } from '@react-navigation/native';

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) {
        setError("Order ID not found");
        setLoading(false);
        return;
      }
      try {
        const res = await apiService.getOrderById(id as string);
        if (res?.order) setOrder(res.order);
        else setError("Order not found");
      } catch (e: any) {
        setError(e?.message || "Failed to fetch order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  useFocusEffect(
    React.useCallback(() => {
      let interval: any;
      const refresh = async () => {
        try {
          if (!id) return;
          const res = await apiService.getOrderById(id as string);
          if (res?.order) setOrder(res.order);
        } catch {}
      };
      refresh();
      interval = setInterval(refresh, 10000);
      return () => { if (interval) clearInterval(interval); };
    }, [id])
  );

  const statusToLabel = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("delivered")) return "Delivered";
    if (s.includes("on the way") || s.includes("out for delivery") || s.includes("transit")) return "Out for Delivery";
    if (s.includes("packed")) return "In Process";
    if (s.includes("order processing") || s.includes("processing") || s.includes("processed") || s.includes("in process")) return "In Process";
    if (s.includes("order placed") || s.includes("placed") || s.includes("pending") || s.includes("created")) return "Order Placed";
    return "Order Placed";
  };

  const steps = () => {
    const raw = (order?.status || order?.order_status || "");
    const label = statusToLabel(raw);
    return [
      { icon: Package, label: "Order Placed" },
      { icon: Package, label: "In Process" },
      { icon: Truck, label: "Out for Delivery" },
      { icon: Home, label: "Delivered" },
    ].map((step) => ({
      ...step,
      done:
        step.label === "Order Placed" ||
        (step.label === "In Process" && ["In Process", "Out for Delivery", "Delivered"].includes(label)) ||
        (step.label === "Out for Delivery" && ["Out for Delivery", "Delivered"].includes(label)) ||
        (step.label === "Delivered" && label === "Delivered"),
    }));
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Text style={{ color: "#EF4444", marginBottom: 12 }}>{error || "Order not found"}</Text>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/orders")}
          style={{ backgroundColor: "#8B5CF6", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Go to Orders</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F9FA", paddingTop: insets.top }}>
      <Stack.Screen options={{ title: "Order Tracking" }} />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#111827", marginBottom: 6 }}>Order #{order.id}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <Calendar size={16} color="#6B7280" />
            <Text style={{ marginLeft: 8, color: "#6B7280" }}>
              {new Date(order.createdAt || order.created_at || Date.now()).toLocaleString()}
            </Text>
          </View>

          {/* Timeline */}
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12 }}>Status</Text>
            {steps().map((s, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: s.done ? "#10B981" : "#E5E7EB",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <s.icon size={18} color={s.done ? "#fff" : "#9CA3AF"} />
                </View>
                <Text style={{ fontWeight: "600", color: s.done ? "#111827" : "#9CA3AF" }}>{s.label}</Text>
                {i < 3 && (
                  <View style={{ position: "absolute", left: 18, top: 36, width: 2, height: 22, backgroundColor: "#E5E7EB" }} />
                )}
              </View>
            ))}
          </View>

          {/* Address */}
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <MapPin size={16} color="#6B7280" />
              <Text style={{ marginLeft: 8, fontWeight: "700", color: "#111827" }}>Delivery Address</Text>
            </View>
            <Text style={{ color: "#6B7280" }}>
              {order?.address
                ? `${order.address.house_number}, ${order.address.address}\n${order.address.landmark_area}\n${order.address.zipCode}`
                : "Not available"}
            </Text>
          </View>

          {/* Rider */}
          {order?.rider && (
            <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <User size={16} color="#6B7280" />
                <Text style={{ marginLeft: 8, fontWeight: "700", color: "#111827" }}>Delivery Partner</Text>
              </View>
              <Text style={{ color: "#111827", marginBottom: 6 }}>{order.rider.name || "Rider"}</Text>
              {order.rider.phone && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Phone size={16} color="#6B7280" />
                  <Text style={{ marginLeft: 8, color: "#6B7280" }}>{order.rider.phone}</Text>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/orders")}
            style={{ backgroundColor: "#8B5CF6", paddingVertical: 14, borderRadius: 12, alignItems: "center", marginBottom: 24 }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Back to Orders</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}


