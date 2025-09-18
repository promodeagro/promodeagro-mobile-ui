import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { CheckCircle } from "lucide-react-native";

export function PaymentOption({
  id,
  title,
  subtitle,
  icon,
  isSelected,
  onSelect,
}: {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <TouchableOpacity
      onPress={() => onSelect(id)}
      style={{
        backgroundColor: isSelected ? "#EDE9FE" : "#F8F9FA",
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: isSelected ? "#8B5CF6" : "#E5E7EB",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      {icon}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_600SemiBold",
            color: isSelected ? "#8B5CF6" : "#111827",
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Inter_400Regular",
              color: "#6B7280",
              marginTop: 2,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {isSelected && <CheckCircle size={20} color="#8B5CF6" />}
    </TouchableOpacity>
  );
}
