import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Plus,
  RotateCcw,
  Pause,
  Play,
  Settings,
  Calendar,
  Package,
} from "lucide-react-native";

interface SubscriptionItem {
  product: {
    name: string;
  };
  variation?: {
    name: string;
  };
  quantity: number;
}

interface Subscription {
  id: string;
  subscription_name?: string;
  is_active: boolean;
  pause_until?: string;
  frequency: string;
  items: SubscriptionItem[];
  next_delivery_date: string;
  total_amount: number;
}

const SubscriptionsScreen = () => {
  const insets = useSafeAreaInsets();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      // Mock data for demonstration
      setSubscriptions([
        {
          id: '1',
          subscription_name: 'Weekly Groceries',
          is_active: true,
          frequency: 'weekly',
          items: [
            { product: { name: 'Organic Tomatoes' }, variation: { name: '500g' }, quantity: 2 },
            { product: { name: 'Fresh Onions' }, variation: { name: '1kg' }, quantity: 1 },
            { product: { name: 'Basmati Rice' }, variation: { name: '2kg' }, quantity: 1 }
          ],
          next_delivery_date: '2024-01-22',
          total_amount: 325
        },
        {
          id: '2',
          subscription_name: 'Monthly Staples',
          is_active: true,
          pause_until: '2024-01-25',
          frequency: 'monthly',
          items: [
            { product: { name: 'Whole Wheat Flour' }, variation: { name: '5kg' }, quantity: 1 },
            { product: { name: 'Sugar' }, variation: { name: '2kg' }, quantity: 1 }
          ],
          next_delivery_date: '2024-02-01',
          total_amount: 180
        }
      ]);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (id: string, updates: any) => {
    try {
      // Mock update - in real app this would call the API
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === id ? { ...sub, ...updates } : sub
        )
      );
      Alert.alert("Success", "Subscription updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update subscription");
    }
  };

  const cancelSubscription = async (id: string) => {
    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel this subscription? This action cannot be undone.",
      [
        { text: "Keep Subscription", style: "cancel" },
        {
          text: "Cancel Subscription",
          style: "destructive",
          onPress: async () => {
            try {
              // Mock cancel - in real app this would call the API
              setSubscriptions(prev => 
                prev.map(sub => 
                  sub.id === id ? { ...sub, is_active: false } : sub
                )
              );
              Alert.alert("Success", "Subscription cancelled successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to cancel subscription");
            }
          },
        },
      ],
    );
  };

  const getFrequencyDisplay = (frequency: string) => {
    const frequencies: { [key: string]: string } = {
      daily: "Daily",
      weekly: "Weekly",
      "bi-weekly": "Bi-weekly",
      monthly: "Monthly",
    };
    return frequencies[frequency] || frequency;
  };

  const getStatusColor = (subscription: Subscription) => {
    if (!subscription.is_active) return "#ef4444";
    if (subscription.pause_until) return "#f59e0b";
    return "#16a34a";
  };

  const getStatusText = (subscription: Subscription) => {
    if (!subscription.is_active) return "Cancelled";
    if (subscription.pause_until) return "Paused";
    return "Active";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#f8f9fa",
          paddingTop: insets.top,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={{ marginTop: 16, fontSize: 16, color: "#6b7280" }}>
          Loading subscriptions...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: "#f8f9fa", paddingTop: insets.top }}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          backgroundColor: "white",
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#e5e7eb",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text
              style={{ fontSize: 24, fontWeight: "bold", color: "#1f2937" }}
            >
              My Subscriptions
            </Text>
            <Text style={{ fontSize: 14, color: "#6b7280", marginTop: 2 }}>
              Manage your recurring orders
            </Text>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: "#16a34a",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Plus size={16} color="white" />
            <Text style={{ color: "white", marginLeft: 4, fontWeight: "600" }}>
              New
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {subscriptions.length === 0 ? (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Package size={64} color="#d1d5db" />
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: "#4b5563",
                marginTop: 16,
              }}
            >
              No Subscriptions Yet
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#6b7280",
                marginTop: 8,
                textAlign: "center",
                marginHorizontal: 40,
              }}
            >
              Create recurring orders for your favorite products and never run
              out again.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#16a34a",
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 24,
                marginTop: 24,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Plus size={20} color="white" />
              <Text
                style={{
                  color: "white",
                  marginLeft: 8,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Create Subscription
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ padding: 16, gap: 16 }}>
            {subscriptions.map((subscription) => (
              <View
                key={subscription.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: 16,
                  padding: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                {/* Subscription Header */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "#1f2937",
                        marginBottom: 4,
                      }}
                    >
                      {subscription.subscription_name || "Subscription"}
                    </Text>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={{
                          backgroundColor: getStatusColor(subscription),
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 12,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 12,
                            fontWeight: "600",
                          }}
                        >
                          {getStatusText(subscription)}
                        </Text>
                      </View>
                      <Text
                        style={{
                          marginLeft: 8,
                          fontSize: 14,
                          color: "#6b7280",
                        }}
                      >
                        {getFrequencyDisplay(subscription.frequency)}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity style={{ padding: 4 }}>
                    <Settings size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                {/* Items Preview */}
                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{ fontSize: 14, color: "#6b7280", marginBottom: 6 }}
                  >
                    {subscription.items.length} item
                    {subscription.items.length !== 1 ? "s" : ""}
                  </Text>
                  {subscription.items.slice(0, 2).map((item, index) => (
                    <Text
                      key={index}
                      style={{
                        fontSize: 14,
                        color: "#4b5563",
                        marginBottom: 2,
                      }}
                    >
                      • {item.product.name}{" "}
                      {item.variation && `(${item.variation.name})`} ×{" "}
                      {item.quantity}
                    </Text>
                  ))}
                  {subscription.items.length > 2 && (
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#6b7280",
                        fontStyle: "italic",
                      }}
                    >
                      +{subscription.items.length - 2} more items
                    </Text>
                  )}
                </View>

                {/* Next Delivery */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#f9fafb",
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 16,
                  }}
                >
                  <Calendar size={16} color="#16a34a" />
                  <Text
                    style={{ marginLeft: 8, fontSize: 14, color: "#4b5563" }}
                  >
                    Next delivery:{" "}
                    <Text style={{ fontWeight: "600" }}>
                      {formatDate(subscription.next_delivery_date)}
                    </Text>
                  </Text>
                </View>

                {/* Total Amount */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Text style={{ fontSize: 16, color: "#4b5563" }}>
                    Total Amount
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#16a34a",
                    }}
                  >
                    ₹{subscription.total_amount}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {subscription.is_active ? (
                    <>
                      {subscription.pause_until ? (
                        <TouchableOpacity
                          onPress={() =>
                            updateSubscription(subscription.id, {
                              pause_until: null,
                            })
                          }
                          style={{
                            flex: 1,
                            backgroundColor: "#16a34a",
                            paddingVertical: 10,
                            borderRadius: 8,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Play size={16} color="white" />
                          <Text
                            style={{
                              color: "white",
                              marginLeft: 4,
                              fontWeight: "600",
                            }}
                          >
                            Resume
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() => {
                            const nextWeek = new Date();
                            nextWeek.setDate(nextWeek.getDate() + 7);
                            updateSubscription(subscription.id, {
                              pause_until: nextWeek.toISOString().split("T")[0],
                            });
                          }}
                          style={{
                            flex: 1,
                            backgroundColor: "#f59e0b",
                            paddingVertical: 10,
                            borderRadius: 8,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Pause size={16} color="white" />
                          <Text
                            style={{
                              color: "white",
                              marginLeft: 4,
                              fontWeight: "600",
                            }}
                          >
                            Pause
                          </Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        onPress={() =>
                          updateSubscription(subscription.id, {
                            skip_next_delivery: true,
                          })
                        }
                        style={{
                          flex: 1,
                          backgroundColor: "#6b7280",
                          paddingVertical: 10,
                          borderRadius: 8,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <RotateCcw size={16} color="white" />
                        <Text
                          style={{
                            color: "white",
                            marginLeft: 4,
                            fontWeight: "600",
                          }}
                        >
                          Skip Next
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      onPress={() => cancelSubscription(subscription.id)}
                      style={{
                        flex: 1,
                        backgroundColor: "#ef4444",
                        paddingVertical: 10,
                        borderRadius: 8,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "600" }}>
                        Remove
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SubscriptionsScreen;
