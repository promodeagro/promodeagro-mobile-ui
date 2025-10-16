import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Clock, Truck } from "lucide-react-native";

// Temporary inline component to resolve import issues
function DeliverySlotCard({ slot, isSelected, onSelect }: {
  slot: any;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isAvailable = slot.available;

  return (
    <TouchableOpacity
      onPress={onSelect}
      disabled={!isAvailable}
      style={{
        width: 140,
        backgroundColor: isSelected ? "#8B5CF6" : "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginRight: 12,
        borderWidth: 2,
        borderColor: isSelected
          ? "#8B5CF6"
          : isAvailable
            ? "#E5E7EB"
            : "#F3F4F6",
        opacity: isAvailable ? 1 : 0.6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Clock
          size={16}
          color={isSelected ? "#FFFFFF" : isAvailable ? "#6B7280" : "#D1D5DB"}
        />
        <Text
          style={{
            fontSize: 12,
            fontFamily: "Inter_500Medium",
            color: isSelected ? "#FFFFFF" : isAvailable ? "#6B7280" : "#D1D5DB",
            marginLeft: 4,
          }}
        >
          {slot.date}
        </Text>
      </View>

      <Text
        style={{
          fontSize: 14,
          fontFamily: "Inter_600SemiBold",
          color: isSelected ? "#FFFFFF" : isAvailable ? "#111827" : "#9CA3AF",
          marginBottom: 4,
        }}
      >
        {slot.time}
      </Text>

      {isAvailable ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <Truck size={12} color={isSelected ? "#FFFFFF" : "#10B981"} />
          <Text
            style={{
              fontSize: 10,
              fontFamily: "Inter_500Medium",
              color: isSelected ? "#FFFFFF" : "#10B981",
              marginLeft: 4,
            }}
          >
            Available
          </Text>
        </View>
      ) : (
        <Text
          style={{
            fontSize: 10,
            fontFamily: "Inter_500Medium",
            color: "#EF4444",
            marginTop: 8,
          }}
        >
          Fully Booked
        </Text>
      )}
    </TouchableOpacity>
  );
}

export function DeliverySlotSection({
  deliverySlots,
  selectedDeliverySlot,
  onSelectSlot,
}: {
  deliverySlots: any[];
  selectedDeliverySlot: any;
  onSelectSlot: (slot: any) => void;
}) {
  return (
    <View style={{ backgroundColor: "#FFFFFF", marginTop: 8, padding: 20 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Clock size={20} color="#8B5CF6" />
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_600SemiBold",
            color: "#111827",
            marginLeft: 8,
          }}
        >
          Delivery Time
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {deliverySlots?.map((slot) => (
          <DeliverySlotCard
            key={slot.id}
            slot={slot}
            isSelected={selectedDeliverySlot?.id === slot.id}
            onSelect={() => onSelectSlot(slot)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
