import { useRouter } from "expo-router";
import { ChevronDown, MapPin, Plus } from "lucide-react-native";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { AddressCard } from "./AddressCard";

export function AddressSection({ addresses, selectedAddress, onSelectAddress }: { 
  addresses: any[], 
  selectedAddress: any, 
  onSelectAddress: (address: any) => void 
}) {
  const router = useRouter();
  const [showAllAddresses, setShowAllAddresses] = useState(false);

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
        <>
          {(showAllAddresses ? addresses : addresses.slice(0, 3)).map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              isSelected={selectedAddress?.id === address.id}
              onSelect={() => onSelectAddress(address)}
            />
          ))}
          
          {addresses.length > 3 && (
            <TouchableOpacity
              onPress={() => setShowAllAddresses(!showAllAddresses)}
              style={{
                backgroundColor: "#F8F9FA",
                borderRadius: 12,
                padding: 16,
                marginTop: 8,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                  color: "#8B5CF6",
                  marginRight: 8,
                }}
              >
                {showAllAddresses ? "Show Less" : `View All (${addresses.length - 3} more)`}
              </Text>
              <ChevronDown 
                size={16} 
                color="#8B5CF6" 
                style={{ 
                  transform: [{ rotate: showAllAddresses ? "180deg" : "0deg" }] 
                }} 
              />
            </TouchableOpacity>
          )}
        </>
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
