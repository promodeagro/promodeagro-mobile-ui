import { CheckCircle } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export function PaymentOption({
  id,
  title,
  subtitle,
  icon,
  isSelected,
  onSelect,
  subOptions,
  selectedSubOption,
  onSelectSubOption,
}: {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onSelect: (id: string) => void;
  subOptions?: Array<{ id: string; title: string; subtitle: string }>;
  selectedSubOption?: string;
  onSelectSubOption?: (id: string) => void;
}) {
  return (
    <View style={{ marginBottom: 8 }}>
      {/* Only show main option if it doesn't have sub-options, or if it's not COD */}
      {(!subOptions || subOptions.length === 0 || id !== "cod") && (
        <TouchableOpacity
          onPress={() => onSelect(id)}
          style={{
            backgroundColor: isSelected ? "#EDE9FE" : "#F8F9FA",
            borderRadius: 12,
            padding: 16,
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
      )}

      {/* Sub-options for COD - render them as main options */}
      {isSelected && subOptions && subOptions.length > 0 && id === "cod" && (
        <View>
          {subOptions.map((subOption) => (
            <TouchableOpacity
              key={subOption.id}
              onPress={() => onSelectSubOption?.(subOption.id)}
              style={{
                backgroundColor: selectedSubOption === subOption.id ? "#EDE9FE" : "#F8F9FA",
                borderRadius: 12,
                padding: 16,
                marginBottom: 8,
                borderWidth: 2,
                borderColor: selectedSubOption === subOption.id ? "#8B5CF6" : "#E5E7EB",
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
                    color: selectedSubOption === subOption.id ? "#8B5CF6" : "#111827",
                  }}
                >
                  {subOption.title}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_400Regular",
                    color: "#6B7280",
                    marginTop: 2,
                  }}
                >
                  {subOption.subtitle}
                </Text>
              </View>
              {selectedSubOption === subOption.id && <CheckCircle size={20} color="#8B5CF6" />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
