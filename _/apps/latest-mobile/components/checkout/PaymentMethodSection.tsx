import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { CreditCard, Plus, Check, Edit3, Star } from "lucide-react-native";
import { PaymentOption } from "./PaymentOption";

const paymentOptions = {
  upi: [
    {
      id: "upi",
      title: "UPI",
      subtitle: "Pay using any UPI app",
      icon: (
        <View
          style={{
            width: 40,
            height: 40,
            backgroundColor: "#FFF7ED",
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 18 }}>🏦</Text>
        </View>
      ),
    },
    {
      id: "phonepe",
      title: "PhonePe",
      subtitle: "Pay using PhonePe wallet or UPI",
      icon: (
        <View
          style={{
            width: 40,
            height: 40,
            backgroundColor: "#F3E8FF",
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#7C3AED" }}>
            Pe
          </Text>
        </View>
      ),
    },
    {
      id: "googlepay",
      title: "Google Pay",
      subtitle: "Pay using Google Pay UPI",
      icon: (
        <View
          style={{
            width: 40,
            height: 40,
            backgroundColor: "#FEF3C7",
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 16 }}>G</Text>
        </View>
      ),
    },
    {
      id: "paytm",
      title: "Paytm",
      subtitle: "Pay using Paytm wallet or UPI",
      icon: (
        <View
          style={{
            width: 40,
            height: 40,
            backgroundColor: "#DBEAFE",
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#3B82F6" }}>
            Py
          </Text>
        </View>
      ),
    },
  ],
  other: [
    {
      id: "card",
      title: "Credit/Debit Card",
      subtitle: "Pay securely with your card",
      icon: (
        <View
          style={{
            width: 40,
            height: 40,
            backgroundColor: "#ECFDF5",
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <CreditCard size={20} color="#10B981" />
        </View>
      ),
    },
    {
      id: "cod",
      title: "Cash on Delivery",
      subtitle: "Pay when your order arrives",
      icon: (
        <View
          style={{
            width: 40,
            height: 40,
            backgroundColor: "#FEF3C7",
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 18 }}>💰</Text>
        </View>
      ),
    },
  ],
};

export function PaymentMethodSection({
  selectedPaymentMethod,
  onSelectPaymentMethod,
}: {
  selectedPaymentMethod: string;
  onSelectPaymentMethod: (method: string) => void;
}) {
  const [showSavedMethods, setShowSavedMethods] = useState(true);

  // Mock saved payment methods instead of React Query
  const savedMethods = [
    {
      id: 1,
      payment_type: "card",
      metadata: { brand: "Visa" },
      masked_details: "**** **** **** 1234",
      is_default: true,
    },
    {
      id: 2,
      payment_type: "upi",
      masked_details: "user@upi",
      is_default: false,
    },
  ];

  const getPaymentMethodIcon = (method: any) => {
    if (method.payment_type === "card") {
      return (
        <View
          style={{
            width: 40,
            height: 40,
            backgroundColor: "#ECFDF5",
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <CreditCard size={20} color="#10B981" />
        </View>
      );
    } else if (method.payment_type === "upi") {
      return (
        <View
          style={{
            width: 40,
            height: 40,
            backgroundColor: "#FFF7ED",
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 18 }}>🏦</Text>
        </View>
      );
    }
    return (
      <View
        style={{
          width: 40,
          height: 40,
          backgroundColor: "#F3F4F6",
          borderRadius: 20,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
        }}
      >
        <CreditCard size={20} color="#6B7280" />
      </View>
    );
  };

  const getPaymentMethodTitle = (method: any) => {
    if (method.payment_type === "card") {
      return method.metadata?.brand
        ? `${method.metadata.brand} Card`
        : "Credit/Debit Card";
    } else if (method.payment_type === "upi") {
      return "UPI ID";
    }
    return method.payment_type;
  };

  return (
    <View style={{ backgroundColor: "#FFFFFF", marginTop: 8, padding: 20 }}>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
      >
        <CreditCard size={20} color="#8B5CF6" />
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_600SemiBold",
            color: "#111827",
            marginLeft: 8,
          }}
        >
          Payment Method
        </Text>
      </View>

      {/* Saved Payment Methods */}
      {savedMethods.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: "#374151",
              }}
            >
              Saved Payment Methods
            </Text>
            <TouchableOpacity
              onPress={() => setShowSavedMethods(!showSavedMethods)}
              style={{
                backgroundColor: "#f3f4f6",
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_500Medium",
                  color: "#6b7280",
                }}
              >
                {showSavedMethods ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>

          {showSavedMethods && (
            <>
              {savedMethods.map((method) => (
                <TouchableOpacity
                  key={`saved-${method.id}`}
                  onPress={() => onSelectPaymentMethod(`saved-${method.id}`)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor:
                      selectedPaymentMethod === `saved-${method.id}`
                        ? "#8B5CF6"
                        : "#F3F4F6",
                    backgroundColor:
                      selectedPaymentMethod === `saved-${method.id}`
                        ? "#F8F6FF"
                        : "#FFFFFF",
                    marginBottom: 8,
                  }}
                >
                  {getPaymentMethodIcon(method)}

                  <View style={{ flex: 1 }}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: "Inter_600SemiBold",
                          color: "#111827",
                        }}
                      >
                        {getPaymentMethodTitle(method)}
                      </Text>
                      {method.is_default && (
                        <View
                          style={{
                            backgroundColor: "#dcfce7",
                            borderRadius: 8,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            marginLeft: 8,
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Star size={10} color="#16a34a" fill="#16a34a" />
                          <Text
                            style={{
                              fontSize: 10,
                              fontFamily: "Inter_600SemiBold",
                              color: "#16a34a",
                              marginLeft: 2,
                            }}
                          >
                            Default
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_400Regular",
                        color: "#6B7280",
                        marginTop: 2,
                      }}
                    >
                      {method.masked_details}
                    </Text>
                  </View>

                  <View
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    {selectedPaymentMethod === `saved-${method.id}` && (
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          backgroundColor: "#8B5CF6",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 8,
                        }}
                      >
                        <Check size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      )}

      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_600SemiBold",
            color: "#374151",
            marginBottom: 12,
          }}
        >
          UPI Payments
        </Text>
        {paymentOptions.upi.map((option) => (
          <PaymentOption
            key={option.id}
            {...option}
            isSelected={selectedPaymentMethod === option.id}
            onSelect={onSelectPaymentMethod}
          />
        ))}
      </View>

      <View>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_600SemiBold",
            color: "#374151",
            marginBottom: 12,
          }}
        >
          Other Methods
        </Text>
        {paymentOptions.other.map((option) => (
          <PaymentOption
            key={option.id}
            {...option}
            isSelected={selectedPaymentMethod === option.id}
            onSelect={onSelectPaymentMethod}
          />
        ))}
      </View>
    </View>
  );
}
