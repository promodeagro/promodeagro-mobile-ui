import {
    Briefcase,
    Home,
    MapPin,
    Navigation,
    Plus,
    Search,
    Star,
    Store,
    Truck,
    X
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedAddress } from "../store/Address/AddressSlice";
import { fetchAllAddresses } from "../store/Address/AddressThunk";
import status from "../store/Constants";
import { getFont, getTextStyle } from "../utils/fontStyles";

const LocationSelector = ({
  visible,
  onClose,
  onLocationSelect,
  showStores = true,
  showDeliveryZones = true,
  showOffers = true,
}) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("current");
  
  // Redux selectors
  const { user } = useSelector((state) => state.login);
  const { allAddressesData } = useSelector((state) => state.address);

  // Fetch addresses when component mounts or when user changes
  useEffect(() => {
    if (visible && user?.userId) {
      dispatch(fetchAllAddresses(user.userId));
    }
  }, [visible, user?.userId, dispatch]);

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
    // Store selected address in Redux for use throughout the app
    if (location.type === "address") {
      dispatch(setSelectedAddress(location));
    } else {
      // Clear selected address for non-address selections (current location, store, etc.)
      dispatch(setSelectedAddress(null));
    }
    
    onLocationSelect(location);
    onClose();
  };

  const renderCurrentLocation = () => (
    <View style={{ padding: 20 }}>
      <Text
        style={getTextStyle({
          fontSize: 18,
          fontFamily: getFont("Inter_600SemiBold"),
          color: "#111827",
          marginBottom: 16,
        })}
      >
        Current Location
      </Text>
      
      {/* Current Location Button */}
      <TouchableOpacity
        style={{
          backgroundColor: "#F3F4F6",
          padding: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#E5E7EB",
          marginBottom: 16,
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
              style={getTextStyle({
                fontSize: 16,
                fontFamily: getFont("Inter_600SemiBold"),
                color: "#111827",
              })}
            >
              Use Current Location
            </Text>
            <Text
              style={getTextStyle({
                fontSize: 14,
                fontFamily: getFont("Inter_400Regular"),
                color: "#6B7280",
                marginTop: 4,
              })}
            >
              12.9716, 77.5946 (Mock Location)
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Saved Addresses Section */}
      <Text
        style={getTextStyle({
          fontSize: 18,
          fontFamily: getFont("Inter_600SemiBold"),
          color: "#111827",
          marginBottom: 16,
        })}
      >
        Saved Addresses
      </Text>

      {/* Loading State */}
      {allAddressesData.status === status.IN_PROGRESS && (
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text
            style={getTextStyle({
              fontSize: 14,
              fontFamily: getFont("Inter_500Medium"),
              color: "#6B7280",
              marginTop: 8,
            })}
          >
            Loading addresses...
          </Text>
        </View>
      )}

      {/* Error State */}
      {allAddressesData.status === status.ERROR && (
        <View style={{
          backgroundColor: "#FEF2F2",
          padding: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#FECACA",
          marginBottom: 16,
        }}>
          <Text
            style={getTextStyle({
              fontSize: 14,
              fontFamily: getFont("Inter_500Medium"),
              color: "#DC2626",
            })}
          >
            Failed to load addresses. Please try again.
          </Text>
        </View>
      )}


      {/* Addresses List */}
      {allAddressesData.status === status.SUCCESS && allAddressesData.data && allAddressesData.data.addresses && (
        <>
          {allAddressesData.data.addresses.map((address, index) => (
            <TouchableOpacity
              key={address.addressId || index}
              style={{
                backgroundColor: "#FFFFFF",
                padding: 16,
                borderRadius: 12,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: address.addressId === allAddressesData.data.defaultAddressId ? "#6366F1" : "#E5E7EB",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
              onPress={() => handleLocationSelect({
                type: "address",
                addressId: address.addressId,
                name: address.name,
                address: address.address,
                house_number: address.house_number,
                landmark_area: address.landmark_area,
                zipCode: address.zipCode,
                phoneNumber: address.phoneNumber,
                address_type: address.address_type,
                isDefault: address.addressId === allAddressesData.data.defaultAddressId,
              })}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <View style={{ marginRight: 12 }}>
                  {address.address_type === "Home" ? (
                    <Home size={20} color="#10B981" />
                  ) : address.address_type === "Work" ? (
                    <Briefcase size={20} color="#3B82F6" />
                  ) : (
                    <MapPin size={20} color="#8B5CF6" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                    <Text
                      style={getTextStyle({
                        fontSize: 16,
                        fontFamily: getFont("Inter_600SemiBold"),
                        color: "#111827",
                      })}
                    >
                      {address.name}
                    </Text>
                    {address.addressId === allAddressesData.data.defaultAddressId && (
                      <View
                        style={{
                          backgroundColor: "#6366F1",
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 12,
                          marginLeft: 8,
                        }}
                      >
                        <Text
                          style={getTextStyle({
                            fontSize: 10,
                            fontFamily: getFont("Inter_600SemiBold"),
                            color: "#FFFFFF",
                          })}
                        >
                          DEFAULT
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={getTextStyle({
                      fontSize: 14,
                      fontFamily: getFont("Inter_400Regular"),
                      color: "#6B7280",
                      marginBottom: 2,
                    })}
                  >
                    {address.house_number}, {address.address}
                  </Text>
                  {address.landmark_area && (
                    <Text
                      style={getTextStyle({
                        fontSize: 12,
                        fontFamily: getFont("Inter_400Regular"),
                        color: "#9CA3AF",
                      })}
                    >
                      Near {address.landmark_area}
                    </Text>
                  )}
                  <Text
                    style={getTextStyle({
                      fontSize: 12,
                      fontFamily: getFont("Inter_500Medium"),
                      color: "#6B7280",
                      marginTop: 4,
                    })}
                  >
                    {address.zipCode} • {address.phoneNumber}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* No Addresses State */}
      {allAddressesData.status === status.SUCCESS && allAddressesData.data && (!allAddressesData.data.addresses || allAddressesData.data.addresses.length === 0) && (
        <View style={{
          backgroundColor: "#F9FAFB",
          padding: 20,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#E5E7EB",
          alignItems: 'center',
        }}>
          <MapPin size={32} color="#9CA3AF" />
          <Text
            style={getTextStyle({
              fontSize: 16,
              fontFamily: getFont("Inter_500Medium"),
              color: "#6B7280",
              marginTop: 8,
              textAlign: 'center',
            })}
          >
            No saved addresses found
          </Text>
          <Text
            style={getTextStyle({
              fontSize: 14,
              fontFamily: getFont("Inter_400Regular"),
              color: "#9CA3AF",
              marginTop: 4,
              textAlign: 'center',
            })}
          >
            Add an address to get started
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "#6366F1",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              marginTop: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={() => {
              // Navigate to add address screen
              console.log("Navigate to add address");
            }}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text
              style={getTextStyle({
                fontSize: 14,
                fontFamily: getFont("Inter_600SemiBold"),
                color: "#FFFFFF",
                marginLeft: 4,
              })}
            >
              Add Address
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Address Button - Show when addresses exist */}
      {allAddressesData.status === status.SUCCESS && allAddressesData.data && allAddressesData.data.addresses && allAddressesData.data.addresses.length > 0 && (
        <TouchableOpacity
          style={{
            backgroundColor: "#F3F4F6",
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 8,
          }}
          onPress={() => {
            // Navigate to add address screen
            console.log("Navigate to add address");
          }}
        >
          <Plus size={20} color="#6366F1" />
          <Text
            style={getTextStyle({
              fontSize: 16,
              fontFamily: getFont("Inter_600SemiBold"),
              color: "#6366F1",
              marginLeft: 8,
            })}
          >
            Add New Address
          </Text>
        </TouchableOpacity>
      )}
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
              style={getTextStyle({
                fontSize: 20,
                fontFamily: getFont("Inter_700Bold"),
                color: "#111827",
              })}
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
              style={getTextStyle({
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 12,
                fontSize: 16,
                fontFamily: getFont("Inter_400Regular"),
                color: "#111827",
              })}
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
              style={getTextStyle({
                fontSize: 14,
                fontFamily: getFont("Inter_600SemiBold"),
                color: selectedTab === "current" ? "#6366F1" : "#6B7280",
              })}
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
                style={getTextStyle({
                  fontSize: 14,
                  fontFamily: getFont("Inter_600SemiBold"),
                  color: selectedTab === "stores" ? "#6366F1" : "#6B7280",
                })}
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
                style={getTextStyle({
                  fontSize: 14,
                  fontFamily: getFont("Inter_600SemiBold"),
                  color: selectedTab === "zones" ? "#6366F1" : "#6B7280",
                })}
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
                style={getTextStyle({
                  fontSize: 14,
                  fontFamily: getFont("Inter_600SemiBold"),
                  color: selectedTab === "offers" ? "#6366F1" : "#6B7280",
                })}
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
