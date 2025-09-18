import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Tag } from "lucide-react-native";

export function CouponSection({
  appliedCoupon,
  discount,
  onRemoveCoupon,
  couponCode,
  onCouponCodeChange,
  onApplyCoupon,
  isApplyingCoupon,
}: {
  appliedCoupon: any;
  discount: number;
  onRemoveCoupon: () => void;
  couponCode: string;
  onCouponCodeChange: (code: string) => void;
  onApplyCoupon: () => void;
  isApplyingCoupon: boolean;
}) {
  return (
    <View style={{ backgroundColor: "#FFFFFF", marginTop: 8, padding: 20 }}>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
      >
        <Tag size={20} color="#8B5CF6" />
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_600SemiBold",
            color: "#111827",
            marginLeft: 8,
          }}
        >
          Promo Code
        </Text>
      </View>

      {appliedCoupon ? (
        <View
          style={{
            backgroundColor: "#ECFDF5",
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: "#86EFAC",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                  color: "#10B981",
                }}
              >
                {appliedCoupon.name}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_400Regular",
                  color: "#059669",
                }}
              >
                You saved ₹{(discount || 0).toFixed(0)}
              </Text>
            </View>
            <TouchableOpacity onPress={onRemoveCoupon}>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_600SemiBold",
                  color: "#EF4444",
                }}
              >
                Remove
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput
            style={{
              flex: 1,
              backgroundColor: "#F8F9FA",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              marginRight: 12,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              fontSize: 14,
              fontFamily: "Inter_500Medium",
              color: "#111827",
            }}
            onChangeText={onCouponCodeChange}
            value={couponCode}
            placeholder="Enter promo code"
            placeholderTextColor="#6B7280"
          />
          <TouchableOpacity
            onPress={onApplyCoupon}
            disabled={!couponCode || isApplyingCoupon}
            style={{
              backgroundColor: couponCode ? "#8B5CF6" : "#E5E7EB",
              borderRadius: 12,
              paddingHorizontal: 20,
              paddingVertical: 14,
              justifyContent: "center",
              alignItems: "center",
              height: 50,
            }}
          >
            {isApplyingCoupon ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                  color: couponCode ? "#FFFFFF" : "#9CA3AF",
                }}
              >
                Apply
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
