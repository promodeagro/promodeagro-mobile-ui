import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { Modal } from "react-native";
import {
  MapPin,
  Navigation,
  Search,
  Clock,
  Truck,
  Store,
  X,
  Plus,
  Home,
  Briefcase,
  Heart,
  Star,
} from "lucide-react-native";

const LocationSelector = ({
  visible,
  onClose,
  onLocationSelect,
  showStores = true,
  showDeliveryZones = true,
  showOffers = true,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("current");

  // Mock data for nearby locations
  const mockLocationData = {
    nearby_stores: [
      {
        id: 1,
        name: "Fresh Mart",
        distance: "0.5 km",
        rating: 4.5,
        delivery_time: "30-45 min",
        min_order: 100,
        delivery_fee: 20,
        is_open: true,
        address: "123 Main Street, Downtown",
        coordinates: { lat: 12.9716, lng: 77.5946 },
      },
      {
        id: 2,
        name: "Green Grocery",
        distance: "1.2 km",
        rating: 4.3,
        delivery_time: "45-60 min",
        min_order: 150,
        delivery_fee: 30,
        is_open: true,
        address: "456 Oak Avenue, Midtown",
        coordinates: { lat: 12.9716, lng: 77.5946 },
      },
    ],
    delivery_zones: [
      {
        id: 1,
        name: "Downtown Zone",
        delivery_time: "30-45 min",
        min_order: 100,
        delivery_fee: 20,
        is_available: true,
      },
      {
        id: 2,
        name: "Midtown Zone",
        delivery_time: "45-60 min",
        min_order: 150,
        delivery_fee: 30,
        is_available: true,
      },
    ],
    offers: [
      {
        id: 1,
        title: "Free Delivery",
        description: "On orders above ₹200",
        valid_until: "2024-12-31",
      },
      {
        id: 2,
        title: "20% OFF",
        description: "First order discount",
        valid_until: "2024-12-31",
      },
    ],
  };

  const handleLocationSelect = (location) => {
    onLocationSelect(location);
    onClose();
  };

  const renderCurrentLocation = () => (
    <View style={{ padding: 20 }}>
      <Text
        style={{
          fontSize: 18,
          fontFamily: "Inter_600SemiBold",
          color: "#111827",
          marginBottom: 16,
        }}
      >
        Current Location
      </Text>
      
      <TouchableOpacity
        style={{
          backgroundColor: "#F3F4F6",
          padding: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#E5E7EB",
        }}
        onPress={() => handleLocationSelect({
          type: "current",
          coordinates: { lat: 12.9716, lng: 77.5946 },
          name: "Current Location"
        })}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Navigation size={20} color="#6366F1" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#111827",
              }}
            >
              Use Current Location
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#6B7280",
                marginTop: 4,
              }}
            >
              12.9716, 77.5946 (Mock Location)
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderNearbyStores = () => (
    <View style={{ padding: 20 }}>
      <Text
        style={{
          fontSize: 18,
          fontFamily: "Inter_600SemiBold",
          color: "#111827",
          marginBottom: 16,
        }}
      >
        Nearby Stores
      </Text>
      
      {mockLocationData.nearby_stores.map((store) => (
        <TouchableOpacity
          key={store.id}
          style={{
            backgroundColor: "#FFFFFF",
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: "#E5E7EB",
          }}
          onPress={() => handleLocationSelect({
            type: "store",
            ...store
          })}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Store size={20} color="#10B981" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: "#111827",
                }}
              >
                {store.name}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: "#6B7280",
                  marginTop: 4,
                }}
              >
                {store.distance} • {store.delivery_time} • ₹{store.delivery_fee} delivery
              </Text>
            </View>
            <Star size={16} color="#F59E0B" />
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: "#6B7280",
                marginLeft: 4,
              }}
            >
              {store.rating}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDeliveryZones = () => (
    <View style={{ padding: 20 }}>
      <Text
        style={{
          fontSize: 18,
          fontFamily: "Inter_600SemiBold",
          color: "#111827",
          marginBottom: 16,
        }}
      >
        Delivery Zones
      </Text>
      
      {mockLocationData.delivery_zones.map((zone) => (
        <TouchableOpacity
          key={zone.id}
          style={{
            backgroundColor: "#FFFFFF",
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: "#E5E7EB",
          }}
          onPress={() => handleLocationSelect({
            type: "zone",
            ...zone
          })}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Truck size={20} color="#8B5CF6" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: "#111827",
                }}
              >
                {zone.name}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: "#6B7280",
                  marginTop: 4,
                }}
              >
                {zone.delivery_time} • Min order: ₹{zone.min_order}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOffers = () => (
    <View style={{ padding: 20 }}>
      <Text
        style={{
          fontSize: 18,
          fontFamily: "Inter_600SemiBold",
          color: "#111827",
          marginBottom: 16,
        }}
      >
        Special Offers
      </Text>
      
      {mockLocationData.offers.map((offer) => (
        <View
          key={offer.id}
          style={{
            backgroundColor: "#FEF3C7",
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: "#F59E0B",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              color: "#92400E",
            }}
          >
            {offer.title}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: "#A16207",
              marginTop: 4,
            }}
          >
            {offer.description}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
        {/* Header */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            paddingTop: 60,
            paddingBottom: 20,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: "#E5E7EB",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Inter_700Bold",
                color: "#111827",
              }}
            >
              Select Location
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View
            style={{
              backgroundColor: "#F3F4F6",
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              marginTop: 16,
            }}
          >
            <Search size={20} color="#6B7280" />
            <TextInput
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 12,
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: "#111827",
              }}
              placeholder="Search for address, landmark, or store"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Tab Navigation */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            flexDirection: "row",
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: "#E5E7EB",
          }}
        >
          <TouchableOpacity
            style={{
              paddingVertical: 16,
              paddingHorizontal: 20,
              borderBottomWidth: 2,
              borderBottomColor: selectedTab === "current" ? "#6366F1" : "transparent",
            }}
            onPress={() => setSelectedTab("current")}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: selectedTab === "current" ? "#6366F1" : "#6B7280",
              }}
            >
              Current
            </Text>
          </TouchableOpacity>

          {showStores && (
            <TouchableOpacity
              style={{
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderBottomWidth: 2,
                borderBottomColor: selectedTab === "stores" ? "#6366F1" : "transparent",
              }}
              onPress={() => setSelectedTab("stores")}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                  color: selectedTab === "stores" ? "#6366F1" : "#6B7280",
                }}
              >
                Stores
              </Text>
            </TouchableOpacity>
          )}

          {showDeliveryZones && (
            <TouchableOpacity
              style={{
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderBottomWidth: 2,
                borderBottomColor: selectedTab === "zones" ? "#6366F1" : "transparent",
              }}
              onPress={() => setSelectedTab("zones")}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                  color: selectedTab === "zones" ? "#6366F1" : "#6B7280",
                }}
              >
                Zones
              </Text>
            </TouchableOpacity>
          )}

          {showOffers && (
            <TouchableOpacity
              style={{
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderBottomWidth: 2,
                borderBottomColor: selectedTab === "offers" ? "#6366F1" : "transparent",
              }}
              onPress={() => setSelectedTab("offers")}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                  color: selectedTab === "offers" ? "#6366F1" : "#6B7280",
                }}
              >
                Offers
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <ScrollView style={{ flex: 1 }}>
          {selectedTab === "current" && renderCurrentLocation()}
          {selectedTab === "stores" && showStores && renderNearbyStores()}
          {selectedTab === "zones" && showDeliveryZones && renderDeliveryZones()}
          {selectedTab === "offers" && showOffers && renderOffers()}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default LocationSelector;
