import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    useFonts,
} from "@expo-google-fonts/inter";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
    CalendarDays,
    CheckCircle,
    ChevronRight,
    Clock,
    Edit3,
    Package,
    ShoppingBag,
    Truck,
    XCircle,
    X as XIcon,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from 'react-redux';
import { CategoryProductsSection } from "../../components/home/CategoryProductsSection";
import OrderCancellationModal from "../../components/orders/OrderCancellationModal";
import OrderModificationModal from "../../components/orders/OrderModificationModal";
import { apiService } from "../../config/api";
import { useCart } from "../../utils/CartContext";

export default function OrdersScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";  

  const [activeTab, setActiveTab] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [modifyModalVisible, setModifyModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get real user ID from Redux authentication
  const { user, isAuthenticated } = useSelector((state) => state.login);
  const userId = user?.id || user?.userId;

  // Get home page products data from Redux (same as home page)
  const { homePageProductsData } = useSelector((state) => state?.home || {
    homePageProductsData: { status: '', data: [], error: null }
  });

  // Get cart functions
  const { addToCart } = useCart();

  // Get category data from API (same as home page) - Bengali Special, Fresh Fruits, Fresh Vegetables
  const categoryData = homePageProductsData?.data?.filter(
    category => ["Bengali Special", "Fresh Fruits", "Fresh Vegetables"].includes(category.category)
  ) || [];

  // Fetch orders from API when user is authenticated and we have userId
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchOrders();
    } else {
      // User is not authenticated or no userId - show empty state
      setLoading(false);
      setError(null);
      setOrders([]);
    }
  }, [isAuthenticated, userId]);

  const fetchOrders = async () => {
    if (!userId) {
      console.warn("Cannot fetch orders: No user ID available");
      setError("User ID not available");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Fetching orders for user ID:", userId);
      const response = await apiService.getOrdersByUserId(userId);
      console.log("Orders API response:", response);
      
      if (response.orders && Array.isArray(response.orders)) {
        setOrders(response.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      // Handle 404 as "no orders found" instead of error
      if (err.message && err.message.includes('404')) {
        setError(null);
        setOrders([]);
      } else {
        setError(err.message || "Failed to fetch orders");
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Reorder function - adds all items from an order back to cart
  const handleReorder = async (order) => {
    try {
      console.log('Reordering items from order:', order.id);
      
      // Add each item from the order to the cart
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          // Extract product and variation info
          const productId = item.product_id || item.id;
          const variationId = item.variation_id || item.id;
          const variationData = {
            price: item.price,
            name: item.name || item.product_name,
            unit: item.unit || "1 unit",
          };

          // Add each quantity one by one to match the original quantity
          for (let i = 0; i < (item.quantity || 1); i++) {
            await addToCart(productId, variationId, variationData);
          }
        }

        // Navigate directly to checkout
        router.push('/checkout');
      } else {
        Alert.alert(
          "No Items Found",
          "No items found in this order to reorder.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error('Error reordering items:', error);
      Alert.alert(
        "Error",
        "Failed to add items to cart. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  // Mock orders data (fallback)
  const mockOrders = [
    {
      id: "ORD001",
      status: "delivered",
      created_at: "2024-01-15T10:30:00Z",
      total_amount: 1250.00,
      items: [
        {
          id: 1,
          product: {
            id: 1,
            name: "Organic Tomatoes",
            images: ["https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&h=100&fit=crop"]
          },
          variation: { id: 1, name: "1kg", unit: "1kg" },
          quantity: 2,
          unit_price: 45.00
        },
        {
          id: 2,
          product: {
            id: 2,
            name: "Fresh Spinach",
            images: ["https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=100&h=100&fit=crop"]
          },
          variation: { id: 2, name: "500g", unit: "500g" },
          quantity: 1,
          unit_price: 30.00
        },
        {
          id: 3,
          product: {
            id: 3,
            name: "Basmati Rice",
            images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&h=100&fit=crop"]
          },
          variation: { id: 3, name: "5kg", unit: "5kg" },
          quantity: 1,
          unit_price: 450.00
        }
      ],
      estimated_delivery: "2024-01-16T14:00:00Z",
      delivered_at: "2024-01-16T13:45:00Z",
      delivery_address: "123 Main Street, Downtown",
      delivery_instructions: "Leave at front door",
      payment_status: "completed"
    },
    {
      id: "ORD002",
      status: "out_for_delivery",
      created_at: "2024-01-17T09:15:00Z",
      total_amount: 890.00,
      items: [
        {
          id: 4,
          product: {
            id: 4,
            name: "Alphonso Mango",
            images: ["https://images.unsplash.com/photo-1553279768-865429fa0076?w=100&h=100&fit=crop"]
          },
          variation: { id: 4, name: "1kg", unit: "1kg" },
          quantity: 2,
          unit_price: 200.00
        },
        {
          id: 5,
          product: {
            id: 5,
            name: "Amul Milk",
            images: ["https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop"]
          },
          variation: { id: 5, name: "1L", unit: "1L" },
          quantity: 3,
          unit_price: 60.00
        }
      ],
      estimated_delivery: "2024-01-17T16:00:00Z",
      delivery_address: "456 Oak Avenue, Midtown",
      delivery_instructions: "Call before delivery",
      payment_status: "completed"
    },
    {
      id: "ORD003",
      status: "confirmed",
      created_at: "2024-01-18T11:00:00Z",
      total_amount: 1560.00,
      items: [
        {
          id: 6,
          product: {
            id: 6,
            name: "Tata Tea Gold",
            images: ["https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=100&h=100&fit=crop"]
          },
          variation: { id: 6, name: "250g", unit: "250g" },
          quantity: 2,
          unit_price: 140.00
        },
        {
          id: 7,
          product: {
            id: 7,
            name: "Aashirvaad Atta",
            images: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=100&h=100&fit=crop"]
          },
          variation: { id: 7, name: "5kg", unit: "5kg" },
          quantity: 2,
          unit_price: 220.00
        },
        {
          id: 8,
          product: {
            id: 8,
            name: "Maggi Noodles",
            images: ["https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=100&h=100&fit=crop"]
          },
          variation: { id: 8, name: "8 pack", unit: "8 pack" },
          quantity: 3,
          unit_price: 96.00
        }
      ],
      estimated_delivery: "2024-01-19T15:00:00Z",
      delivery_address: "789 Pine Street, Uptown",
      delivery_instructions: "Ring doorbell twice",
      payment_status: "completed"
    }
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleModifyOrder = async (orderData: any) => {
    try {
      console.log("Modifying order:", selectedOrder?.id, orderData);
      alert("Order modified successfully!");
      setModifyModalVisible(false);
    } catch (error: any) {
      alert("Failed to modify order: " + error.message);
    }
  };

  const handleCancelOrder = async (cancelData: any) => {
    try {
      console.log("Cancelling order:", selectedOrder?.id, cancelData);
      alert("Order cancelled successfully!");
      setCancelModalVisible(false);
    } catch (error: any) {
      alert("Failed to cancel order: " + error.message);
    }
  };

  const canModifyOrder = (order: any) => {
    return ["pending", "confirmed"].includes(order.status);
  };

  const canCancelOrder = (order: any) => {
    return ["pending", "confirmed", "preparing"].includes(order.status);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle size={20} color="#10B981" />;
      case "out_for_delivery":
        return <Truck size={20} color="#F59E0B" />;
      case "packed":
        return <Package size={20} color="#8B5CF6" />;
      case "confirmed":
        return <Clock size={20} color="#3B82F6" />;
      case "cancelled":
        return <XCircle size={20} color="#EF4444" />;
      default:
        return <Clock size={20} color="#6B7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "#10B981";
      case "out_for_delivery":
        return "#F59E0B";
      case "packed":
        return "#8B5CF6";
      case "confirmed":
        return "#3B82F6";
      case "cancelled":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "#ECFDF5";
      case "out_for_delivery":
        return "#FFFBEB";
      case "packed":
        return "#F3E8FF";
      case "confirmed":
        return "#EFF6FF";
      case "cancelled":
        return "#FEF2F2";
      default:
        return "#F3F4F6";
    }
  };

// sssss
  
  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return "Delivered";
      case "out_for_delivery":
        return "Out for Delivery";
      case "packed":
        return "Packed";
      case "confirmed":
        return "Confirmed";
      case "cancelled":
        return "Cancelled";
      case "pending":
        return "Pending";
      default:
        return "Processing";
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  });


  const OrderCard = ({ order }: { order: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/order-confirmation/${order.id}`)}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
        borderWidth: 1,
        borderColor: "#F3F4F6",
      }}
    >
      {/* Order Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Inter_700Bold",
              color: "#111827",
              marginBottom: 4,
            }}
          >
            Order #{order.id}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <CalendarDays size={14} color="#6B7280" />
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: "#6B7280",
                marginLeft: 4,
              }}
            >
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: getStatusBgColor(order.status),
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 6,
              marginBottom: 8,
            }}
          >
            {getStatusIcon(order.status)}
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Inter_600SemiBold",
                color: getStatusColor(order.status),
                marginLeft: 6,
              }}
            >
              {getStatusText(order.status)}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Inter_700Bold",
              color: "#8B5CF6",
            }}
          >
            ₹{parseFloat(order.finalTotal || order.totalPrice || 0).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Order Items */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
      >
        <View style={{ flexDirection: "row", marginRight: 12 }}>
          {order.items.slice(0, 3).map((item: any, index: number) => (
            <View
              key={index}
              style={{
                marginRight:
                  index < Math.min(order.items.length, 3) - 1 ? -8 : 0,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Image
                source={{ uri: item.productImage }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  borderWidth: 3,
                  borderColor: "#FFFFFF",
                }}
                contentFit="cover"
              />
            </View>
          ))}
          {order.items.length > 3 && (
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: "#F3F4F6",
                justifyContent: "center",
                alignItems: "center",
                marginLeft: -8,
                borderWidth: 3,
                borderColor: "#FFFFFF",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_600SemiBold",
                  color: "#6B7280",
                }}
              >
                +{order.items.length - 3}
              </Text>
            </View>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 15,
              fontFamily: "Inter_600SemiBold",
              color: "#111827",
              marginBottom: 4,
            }}
          >
            {order.items.length} {order.items.length === 1 ? "item" : "items"}
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Inter_500Medium",
              color: "#6B7280",
            }}
          >
            {order.deliverySlot?.date
              ? `Expected ${new Date(order.deliverySlot.date).toLocaleDateString()}`
              : "Processing"}
          </Text>
        </View>

        <View
          style={{
            width: 32,
            height: 32,
            backgroundColor: "#F3F4F6",
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ChevronRight size={16} color="#6B7280" />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "#F8FAFC",
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#E2E8F0",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_600SemiBold",
              color: "#64748B",
            }}
          >
            View Details
          </Text>
        </TouchableOpacity>

        {canModifyOrder(order) && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              setSelectedOrder(order);
              setModifyModalVisible(true);
            }}
            style={{
              backgroundColor: "#3b82f6",
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Edit3 size={14} color="white" />
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Inter_600SemiBold",
                color: "#FFFFFF",
                marginLeft: 4,
              }}
            >
              Modify
            </Text>
          </TouchableOpacity>
        )}

        {canCancelOrder(order) && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              setSelectedOrder(order);
              setCancelModalVisible(true);
            }}
            style={{
              backgroundColor: "#ef4444",
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <XIcon size={14} color="white" />
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Inter_600SemiBold",
                color: "#FFFFFF",
                marginLeft: 4,
              }}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        )}

        {order.status === "delivered" && (
          <TouchableOpacity
            onPress={() => handleReorder(order)}
            style={{
              backgroundColor: "#8B5CF6",
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 16,
              alignItems: "center",
              shadowColor: "#8B5CF6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Inter_600SemiBold",
                color: "#FFFFFF",
              }}
            >
              Reorder
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FAFBFC" }}>
        <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 24,
          paddingBottom: 20,
          backgroundColor: "#FFFFFF",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontFamily: "Inter_800ExtraBold",
            color: "#111827",
            marginBottom: 8,
          }}
        >
          My Orders
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_500Medium",
            color: "#6B7280",
            marginBottom: 20,
          }}
        >
          Track and manage your orders
        </Text>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
        >
          {[
            { key: "all", label: "All Orders", count: orders.length },
            {
              key: "pending",
              label: "Pending",
              count: orders.filter((o) => o.status === "pending").length,
            },
            {
              key: "confirmed",
              label: "Confirmed",
              count: orders.filter((o) => o.status === "confirmed").length,
            },
            {
              key: "out_for_delivery",
              label: "In Transit",
              count: orders.filter((o) => o.status === "out_for_delivery")
                .length,
            },
            {
              key: "delivered",
              label: "Delivered",
              count: orders.filter((o) => o.status === "delivered").length,
            },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 24,
                backgroundColor: activeTab === tab.key ? "#8B5CF6" : "#FFFFFF",
                flexDirection: "row",
                alignItems: "center",
                shadowColor: activeTab === tab.key ? "#8B5CF6" : "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: activeTab === tab.key ? 0.3 : 0.1,
                shadowRadius: 8,
                elevation: 4,
                borderWidth: activeTab === tab.key ? 0 : 1,
                borderColor: "#E5E7EB",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily:
                    activeTab === tab.key
                      ? "Inter_600SemiBold"
                      : "Inter_500Medium",
                  color: activeTab === tab.key ? "#FFFFFF" : "#374151",
                  marginRight: tab.count > 0 ? 8 : 0,
                }}
              >
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <View
                  style={{
                    backgroundColor:
                      activeTab === tab.key
                        ? "rgba(255,255,255,0.2)"
                        : "#F3F4F6",
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_600SemiBold",
                      color: activeTab === tab.key ? "#FFFFFF" : "#6B7280",
                    }}
                  >
                    {tab.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          // Loading State
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 80,
            }}
          >
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_500Medium",
                color: "#6B7280",
                marginTop: 16,
                textAlign: "center"
              }}
            >
              Loading orders...
            </Text>
          </View>
        ) : error ? (
          // Error State
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 80,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Inter_600SemiBold",
                color: "#EF4444",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Error Loading Orders
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: "#6B7280",
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              {error}
            </Text>
            <TouchableOpacity
              onPress={fetchOrders}
              style={{
                backgroundColor: "#8B5CF6",
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                  color: "#FFFFFF",
                }}
              >
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : filteredOrders.length === 0 ? (
          // Empty State
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 80,
            }}
          >
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "#F3E8FF",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <ShoppingBag size={40} color="#8B5CF6" />
            </View>

            <Text
              style={{
                fontSize: 24,
                fontFamily: "Inter_700Bold",
                color: "#111827",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              {!isAuthenticated ? "Sign In to View Orders" : "No Orders Found"}
            </Text>

            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_500Medium",
                color: "#6B7280",
                textAlign: "center",
                lineHeight: 24,
                marginBottom: 32,
                paddingHorizontal: 40,
              }}
            >
              {!isAuthenticated
                ? "Please sign in to view your order history and track your deliveries."
                : activeTab === "all"
                ? "You haven't placed any orders yet. Start shopping to see your orders here!"
                : `No ${activeTab.replace("_", " ")} orders found.`}
            </Text>

            {/* Show Sign In button for unauthenticated users */}
            {!isAuthenticated && (
              <TouchableOpacity
                onPress={() => router.push("/auth")}
                style={{
                  backgroundColor: "#8B5CF6",
                  borderRadius: 16,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  flexDirection: "row",
                  alignItems: "center",
                  shadowColor: "#8B5CF6",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 8,
                  marginBottom: 32,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_600SemiBold",
                    color: "#FFFFFF",
                    marginRight: 8,
                  }}
                >
                  Sign In
                </Text>
                <ChevronRight size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}

            {/* Category Products Section - Bengali Special, Fresh Fruits, Fresh Vegetables */}
            {categoryData.length > 0 && (
              <View style={{ 
                width: "100%", 
                marginTop: 20,
                paddingBottom: 20,
                backgroundColor: "#FAFBFC"
              }}>
                <CategoryProductsSection categoryData={categoryData} />
              </View>
            )}
          </View>
        ) : (
          // Orders List
          <View>
            {/* Quick Stats */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                padding: 24,
                marginBottom: 24,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
                elevation: 6,
                borderWidth: 1,
                borderColor: "#F3F4F6",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Inter_700Bold",
                  color: "#111827",
                  marginBottom: 20,
                }}
              >
                Order Summary
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 28,
                      fontFamily: "Inter_800ExtraBold",
                      color: "#8B5CF6",
                    }}
                  >
                    {orders.length}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_500Medium",
                      color: "#6B7280",
                    }}
                  >
                    Total Orders
                  </Text>
                </View>

                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 28,
                      fontFamily: "Inter_800ExtraBold",
                      color: "#10B981",
                    }}
                  >
                    {orders.filter((o) => o.status === "delivered").length}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_500Medium",
                      color: "#6B7280",
                    }}
                  >
                    Delivered
                  </Text>
                </View>

                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 28,
                      fontFamily: "Inter_800ExtraBold",
                      color: "#F59E0B",
                    }}
                  >
                    ₹
                    {orders
                      .reduce((sum, order) => sum + order.total_amount, 0)
                      .toFixed(0)}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_500Medium",
                      color: "#6B7280",
                    }}
                  >
                    Total Spent
                  </Text>
                </View>
              </View>
            </View>

            {/* Orders List */}
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <OrderModificationModal
        visible={modifyModalVisible}
        onClose={() => setModifyModalVisible(false)}
        order={selectedOrder}
        onModify={handleModifyOrder}
      />

      <OrderCancellationModal
        visible={cancelModalVisible}
        onClose={() => setCancelModalVisible(false)}
        order={selectedOrder}
        onCancel={handleCancelOrder}
      />
      </View>
  );
}
