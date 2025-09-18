import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { MapPin, Plus } from "lucide-react-native";
import { AddressCard } from "./AddressCard";

export function AddressSection({ addresses, selectedAddress, onSelectAddress }: { 
  addresses: any[], 
  selectedAddress: any, 
  onSelectAddress: (address: any) => void 
}) {
  const router = useRouter();

  return (
    <View style={{ backgroundColor: "#FFFFFF", marginTop: 8, padding: 20 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <MapPin size={20} color="#8B5CF6" />
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_600SemiBold",
            color: "#111827",
            marginLeft: 8,
          }}
        >
          Delivery Address
        </Text>
        <TouchableOpacity
          style={{ marginLeft: "auto" }}
          onPress={() => router.push("/(tabs)/address/new")}
        >
          <Plus size={20} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      {addresses && addresses.length > 0 ? (
        addresses.map((address) => (
          <AddressCard
            key={address.id}
            address={address}
            isSelected={selectedAddress?.id === address.id}
            onSelect={() => onSelectAddress(address)}
          />
        ))
      ) : (
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/address/new")}
          style={{
            backgroundColor: "#F8F9FA",
            borderRadius: 12,
            padding: 20,
            borderWidth: 2,
            borderColor: "#E5E7EB",
            borderStyle: "dashed",
            alignItems: "center",
          }}
        >
          <Plus size={24} color="#8B5CF6" />
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_500Medium",
              color: "#8B5CF6",
              marginTop: 8,
            }}
          >
            Add Delivery Address
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
