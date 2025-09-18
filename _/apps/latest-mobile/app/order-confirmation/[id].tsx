import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Calendar,
  CheckCircle,
  CreditCard,
  Home,
  MapPin,
  Package,
  Truck
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiService } from "../../config/api";

export default function OrderConfirmationScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkmarkAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;



  // Fetch order details from API
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) {
        setError("Order ID not found");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching order details for ID:", id);
        const response = await apiService.getOrderById(id as string);
        console.log("Order API response:", response);
        
        if (response.order) {
          setOrder(response.order);
        } else {
          setError("Order not found");
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError(err.message || "Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  useEffect(() => {
    if (!loading && order) {
      Animated.sequence([
        Animated.timing(checkmarkAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [loading, order]);

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8F9FA" }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={{ marginTop: 16, fontSize: 16, color: "#6B7280" }}>Loading order details...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8F9FA", padding: 20 }}>
        <Text style={{ fontSize: 18, color: "#EF4444", textAlign: "center", marginBottom: 16 }}>
          {error || "Order not found"}
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/home")}
          style={{
            backgroundColor: "#8B5CF6",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>
            Go to Home
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate estimated delivery time based on delivery slot
  const getEstimatedDeliveryTime = () => {
    if (order.deliverySlot) {
      const { date, startTime, startAmPm, endTime, endAmPm } = order.deliverySlot;
      const deliveryDate = new Date(date);
      return deliveryDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }) + ` ${startTime} ${startAmPm} - ${endTime} ${endAmPm}`;
    }
    // Fallback to 2 hours from order creation
    const estimatedTime = new Date(order.createdAt);
    estimatedTime.setHours(estimatedTime.getHours() + 2);
    return estimatedTime.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const deliveryTime = getEstimatedDeliveryTime();

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F9FA" }}>
      <StatusBar style="light" />

      {/* Header with Gradient */}
      <View style={{
        paddingTop: insets.top + 20,
        paddingBottom: 40,
        paddingHorizontal: 20,
        backgroundColor: "#10B981",
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
      }}>
        {/* Success Animation */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Animated.View
            style={{
              transform: [
                {
                  scale: checkmarkAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1.2, 1],
                  }),
                },
              ],
              opacity: checkmarkAnim,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#FFFFFF",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <CheckCircle size={48} color="#10B981" />
            </View>
          </Animated.View>

          <Animated.View
            style={{
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontFamily: "Inter_700Bold",
                color: "#FFFFFF",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Order Confirmed!
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_500Medium",
                color: "#DCFCE7",
                textAlign: "center",
                lineHeight: 24,
              }}
            >
              Thank you for your order.{"\n"}Your groceries are on their way!
            </Text>
          </Animated.View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Details Card */}
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
            backgroundColor: "#FFFFFF",
            marginHorizontal: 20,
            marginTop: 20,
            borderRadius: 20,
            padding: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Inter_700Bold",
              color: "#111827",
              marginBottom: 16,
            }}
          >
            Order #{order.id}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Calendar size={18} color="#8B5CF6" />
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: "#374151",
                marginLeft: 12,
              }}
            >
              Estimated Delivery
            </Text>
          </View>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_500Medium",
              color: "#6B7280",
              marginBottom: 20,
              marginLeft: 30,
            }}
          >
            {deliveryTime}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 12 }}>
            <MapPin size={18} color="#8B5CF6" />
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: "#374151",
                marginLeft: 12,
              }}
            >
              Delivery Address
            </Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: "#6B7280",
              lineHeight: 20,
              marginLeft: 30,
              marginBottom: 20,
            }}
          >
            {order.address ? 
              `${order.address.house_number}, ${order.address.address}\n${order.address.landmark_area}\n${order.address.zipCode}` :
              "Address not available"
            }
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <CreditCard size={18} color="#8B5CF6" />
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: "#374151",
                marginLeft: 12,
              }}
            >
              Payment Method
            </Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: "#6B7280",
              marginLeft: 30,
              marginBottom: 20,
            }}
          >
            {order.paymentDetails?.method === 'COD' ? 'Cash on Delivery' : 
             order.paymentDetails?.method || 'Payment method not available'}
          </Text>

          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: "#F3F4F6",
              paddingTop: 16,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Inter_700Bold",
                color: "#111827",
              }}
            >
              Total Amount
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Inter_700Bold",
                color: "#10B981",
              }}
            >
              ₹{order.finalTotal || order.totalPrice || 0}
            </Text>
          </View>
        </Animated.View>

        {/* Order Timeline */}
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
            backgroundColor: "#FFFFFF",
            marginHorizontal: 20,
            marginTop: 16,
            borderRadius: 20,
            padding: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Inter_700Bold",
              color: "#111827",
              marginBottom: 16,
            }}
          >
            Order Status
          </Text>

          <View style={{ position: "relative" }}>
            {/* Timeline Steps */}
            {[
              { icon: CheckCircle, label: "Order Confirmed", status: "completed", time: "Now" },
              { icon: Package, label: "Preparing Order", status: "current", time: "15 mins" },
              { icon: Truck, label: "Out for Delivery", status: "pending", time: "45 mins" },
              { icon: Home, label: "Delivered", status: "pending", time: deliveryTime.split(' at ')[1] },
            ].map((step, index) => (
              <View key={index} style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: step.status === "completed" ? "#10B981" : 
                                   step.status === "current" ? "#F59E0B" : "#E5E7EB",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 16,
                  }}
                >
                  <step.icon 
                    size={20} 
                    color={step.status === "pending" ? "#9CA3AF" : "#FFFFFF"} 
                  />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Inter_600SemiBold",
                      color: step.status === "pending" ? "#9CA3AF" : "#111827",
                      marginBottom: 2,
                    }}
                  >
                    {step.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_400Regular",
                      color: "#6B7280",
                    }}
                  >
                    {step.time}
                  </Text>
                </View>
                
                {index < 3 && (
                  <View
                    style={{
                      position: "absolute",
                      left: 19,
                      top: 40,
                      width: 2,
                      height: 30,
                      backgroundColor: "#E5E7EB",
                    }}
                  />
                )}
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Order Items */}
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
            backgroundColor: "#FFFFFF",
            marginHorizontal: 20,
            marginTop: 16,
            borderRadius: 20,
            padding: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Inter_700Bold",
              color: "#111827",
              marginBottom: 16,
            }}
          >
            Order Items ({order.items?.length || 0})
          </Text>

          {order.items?.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 12,
                borderBottomWidth: index < (order.items?.length || 0) - 1 ? 1 : 0,
                borderBottomColor: "#F3F4F6",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_600SemiBold",
                    color: "#111827",
                    marginBottom: 2,
                  }}
                >
                  {item.productName}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_400Regular",
                    color: "#6B7280",
                  }}
                >
                  {item.quantityUnits} {item.unit}
                </Text>
              </View>
              
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_600SemiBold",
                    color: "#111827",
                  }}
                >
                  ₹{item.subtotal}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_400Regular",
                    color: "#6B7280",
                  }}
                >
                  Qty: {item.quantity}
                </Text>
              </View>
            </View>
          )) || (
            <Text style={{ textAlign: "center", color: "#6B7280", marginTop: 20 }}>
              No items found
            </Text>
          )}
        </Animated.View>
      </ScrollView>

      {/* Action Buttons */}
      <Animated.View
        style={{
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
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
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.push(`/order-tracking/${order.id}`)}
            style={{
              flex: 1,
              backgroundColor: "#8B5CF6",
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#FFFFFF",
              }}
            >
              Track Order
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/home")}
            style={{
              flex: 1,
              backgroundColor: "#F3F4F6",
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#6B7280",
              }}
            >
              Continue Shopping
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
