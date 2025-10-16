import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Clock, Truck } from "lucide-react-native";

export function DeliverySlotCard({ slot, isSelected, onSelect }: { 
  slot: any, 
  isSelected: boolean, 
  onSelect: () => void 
}) {
  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  const isAvailable = slot.available;
  const slotsRemaining = 5; // Mock data

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
        borderColor: isSelected ? "#8B5CF6" : isAvailable ? "#E5E7EB" : "#F3F4F6",
        opacity: isAvailable ? 1 : 0.6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Date */}
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
          {slot.day}
        </Text>
      </View>

      {/* Time Range */}
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

      {/* Availability Status */}
      {isAvailable ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <Truck
            size={12}
            color={isSelected ? "#FFFFFF" : "#10B981"}
          />
          <Text
            style={{
              fontSize: 10,
              fontFamily: "Inter_500Medium",
              color: isSelected ? "#FFFFFF" : "#10B981",
              marginLeft: 4,
            }}
          >
            {slotsRemaining} slots left
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

      {/* Express Delivery Badge */}
      {slot.is_express && (
        <View
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : "#FEF3C7",
            borderRadius: 6,
            paddingHorizontal: 6,
            paddingVertical: 2,
          }}
        >
          <Text
            style={{
              fontSize: 8,
              fontFamily: "Inter_600SemiBold",
              color: isSelected ? "#FFFFFF" : "#92400E",
            }}
          >
            EXPRESS
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
