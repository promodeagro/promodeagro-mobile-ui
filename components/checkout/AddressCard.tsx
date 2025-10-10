import { CheckCircle } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export function AddressCard({ address, isSelected, onSelect }: { 
  address: any, 
  isSelected: boolean, 
  onSelect: () => void 
}) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      style={{
        backgroundColor: isSelected ? "#EDE9FE" : "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: isSelected ? "#8B5CF6" : "#F3F4F6",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          {address.address_type && (
            <View
              style={{
                backgroundColor: "#8B5CF6",
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 12,
                alignSelf: "flex-start",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_600SemiBold",
                  color: "#FFFFFF",
                }}
              >
                {address.address_type}
              </Text>
            </View>
          )}
          {address.phone && (
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter_400Regular",
                color: "#9CA3AF",
                marginBottom: 4,
              }}
            >
              {address.phone}
            </Text>
          )}
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: "#6B7280",
              lineHeight: 20,
              marginBottom: 8,
            }}
          >
            {address.address}
            {address.house_number && `, ${address.house_number}`}
            {address.zipCode && `, ${address.zipCode}`}
            {address.landmark && `\n${address.landmark}`}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_600SemiBold",
              color: isSelected ? "#8B5CF6" : "#111827",
            }}
          >
            {address.name}
          </Text>
        </View>
        {isSelected && <CheckCircle size={20} color="#8B5CF6" />}
      </View>
    </TouchableOpacity>
  );
}
