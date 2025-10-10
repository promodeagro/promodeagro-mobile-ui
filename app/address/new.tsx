import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    useFonts,
} from "@expo-google-fonts/inter";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, MapPin, Save } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from 'react-redux';
import { addAddress, setDefaultAddress } from "../../store/Address/AddressThunk";
import status from "../../store/Constants";

// Move InputField outside component to prevent re-creation
const InputField = React.memo(({ label, value, onChangeText, placeholder, error, ...props }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    error?: string;
    [key: string]: any;
  }) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{
        fontSize: 14,
        fontFamily: "Inter_600SemiBold",
        color: "#374151",
        marginBottom: 8,
      }}>
        {label}
      </Text>
      <TextInput
        style={{
          backgroundColor: "#F9FAFB",
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 16,
          fontFamily: "Inter_400Regular",
          borderWidth: 1,
          borderColor: error ? "#EF4444" : "#E5E7EB",
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
      autoCorrect={false}
      autoComplete="off"
        {...props}
      />
      {error && (
        <Text style={{
          fontSize: 12,
          fontFamily: "Inter_500Medium",
          color: "#EF4444",
          marginTop: 4,
        }}>
          {error}
        </Text>
      )}
    </View>
));

export default function AddAddressScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useDispatch();

  // Redux state
  const { addAddressData, setDefaultAddressData } = useSelector((state) => state.address);
  const { user, isAuthenticated } = useSelector((state) => state.login);

  // Form data matching API payload structure
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phoneNumber: "",
    landmark_area: "",
    zipCode: "",
    house_number: "",
    address_type: "Home",
    isDefault: false,
  });

  const [errors, setErrors] = useState({});
  
  // Loading states from Redux
  const isSaving = addAddressData.status === status.IN_PROGRESS;
  const isSettingDefault = setDefaultAddressData.status === status.IN_PROGRESS;

  // Memoized form update functions to prevent re-renders
  const updateFormField = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateAddressType = useCallback((type: string) => {
    setFormData(prev => ({ ...prev, address_type: type }));
  }, []);

  const toggleDefault = useCallback(() => {
    setFormData(prev => ({ ...prev, isDefault: !prev.isDefault }));
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
    }
    if (!formData.house_number.trim()) {
      newErrors.house_number = "House/Building number is required";
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "Zip code is required";
    } else if (!/^\d{6}$/.test(formData.zipCode)) {
      newErrors.zipCode = "Zip code must be 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle API responses
  useEffect(() => {
    if (addAddressData.status === status.SUCCESS) {
      console.log("Add address response:", addAddressData.data);
      
      // Extract addressId from response - it's directly in the data
      const newAddressId = addAddressData.data?.data?.addressId || addAddressData.data?.addressId;
      
      if (newAddressId) {
        console.log("New address ID:", newAddressId);
        
        if (formData.isDefault) {
          // Set as default address
          const userId = user?.id || user?.userId;
          console.log("Setting default address - userId:", userId, "addressId:", newAddressId);
          dispatch(setDefaultAddress({ userId, addressId: newAddressId }));
        } else {
          // Just show success and go back
          Alert.alert("Success", "Address added successfully", [
            { text: "OK", onPress: () => router.back() }
          ]);
        }
      } else {
        console.error("No addressId found in response:", addAddressData.data);
        Alert.alert("Success", "Address added successfully", [
          { text: "OK", onPress: () => router.back() }
        ]);
      }
    } else if (addAddressData.status === status.ERROR) {
      console.error("Add address error:", addAddressData.error);
      Alert.alert("Error", addAddressData.error?.message || "Failed to add address");
    }
  }, [addAddressData.status, addAddressData.data, addAddressData.error]);

  useEffect(() => {
    if (setDefaultAddressData.status === status.SUCCESS) {
      console.log("Set default address response:", setDefaultAddressData.data);
      
      if (setDefaultAddressData.data?.statusCode === 200) {
        Alert.alert("Success", "Address added and set as default successfully", [
          { text: "OK", onPress: () => router.back() }
        ]);
      } else {
        console.error("Set default address failed:", setDefaultAddressData.data);
        Alert.alert("Error", setDefaultAddressData.data?.message || "Failed to set default address");
      }
    } else if (setDefaultAddressData.status === status.ERROR) {
      console.error("Set default address error:", setDefaultAddressData.error);
      Alert.alert("Error", setDefaultAddressData.error?.message || "Failed to set default address");
    }
  }, [setDefaultAddressData.status, setDefaultAddressData.data, setDefaultAddressData.error]);

  const handleSave = async () => {
    if (!isAuthenticated || !user) {
      Alert.alert("Error", "Please login to add address");
      return;
    }

    if (validateForm()) {
      const userId = user?.id || user?.userId;
      
      const addressPayload = {
        userId: userId,
        address: {
          name: formData.name.trim(),
          address: formData.address.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          landmark_area: formData.landmark_area.trim(),
          zipCode: formData.zipCode.trim(),
          house_number: formData.house_number.trim(),
          address_type: formData.address_type
        }
      };

      console.log("Adding address with payload:", addressPayload);
      dispatch(addAddress(addressPayload));
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F9FA" }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#2D2D2D" />
          </TouchableOpacity>
          <Text style={{
            fontSize: 18,
            fontFamily: "Inter_600SemiBold",
            color: "#111827",
          }}>
            Add Address
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          padding: 20, 
          paddingBottom: insets.bottom + 100 
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          padding: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
            <MapPin size={20} color="#8B5CF6" />
            <Text style={{
              fontSize: 18,
              fontFamily: "Inter_700Bold",
              color: "#111827",
              marginLeft: 8,
            }}>
              Address Details
            </Text>
          </View>

          <InputField
            key="name"
            label="Name*"
            value={formData.name}
            onChangeText={(text) => updateFormField('name', text)}
            placeholder="Your full name"
            error={errors.name}
          />

          <InputField
            key="phoneNumber"
            label="Phone Number*"
            value={formData.phoneNumber}
            onChangeText={(text) => updateFormField('phoneNumber', text)}
            placeholder="10-digit mobile number"
            error={errors.phoneNumber}
            keyboardType="phone-pad"
            maxLength={10}
          />

          <InputField
            key="house_number"
            label="House/Building Number*"
            value={formData.house_number}
            onChangeText={(text) => updateFormField('house_number', text)}
            placeholder="House/Flat/Building number"
            error={errors.house_number}
          />

          <InputField
            key="address"
            label="Address*"
            value={formData.address}
            onChangeText={(text) => updateFormField('address', text)}
            placeholder="Street name, Area, City"
            error={errors.address}
            multiline
            numberOfLines={3}
          />

              <InputField
            key="landmark_area"
            label="Landmark (Optional)"
            value={formData.landmark_area}
            onChangeText={(text) => updateFormField('landmark_area', text)}
            placeholder="Nearby landmark or area"
          />

          <InputField
            key="zipCode"
            label="Zip Code*"
            value={formData.zipCode}
            onChangeText={(text) => updateFormField('zipCode', text)}
            placeholder="6-digit zip code"
            error={errors.zipCode}
            keyboardType="numeric"
            maxLength={6}
          />

          {/* Address Type Selection */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{
              fontSize: 14,
              fontFamily: "Inter_600SemiBold",
              color: "#374151",
              marginBottom: 12,
            }}>
              Address Type*
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              {["Home", "Office", "Other"].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => updateAddressType(type)}
                  style={{
                    flex: 1,
                    backgroundColor: formData.address_type === type ? "#8B5CF6" : "#F9FAFB",
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: formData.address_type === type ? "#8B5CF6" : "#E5E7EB",
                  }}
                >
                  <Text style={{
                    fontSize: 14,
                    fontFamily: "Inter_500Medium",
                    color: formData.address_type === type ? "#FFFFFF" : "#6B7280",
                  }}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={toggleDefault}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F8F9FA",
              borderRadius: 12,
              padding: 16,
              marginTop: 8,
            }}
          >
            <View style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              backgroundColor: formData.isDefault ? "#8B5CF6" : "#FFFFFF",
              borderWidth: 2,
              borderColor: formData.isDefault ? "#8B5CF6" : "#D1D5DB",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}>
              {formData.isDefault && (
                <Text style={{ color: "#FFFFFF", fontSize: 12 }}>✓</Text>
              )}
            </View>
            <View>
              <Text style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: "#111827",
              }}>
                Set as default address
              </Text>
              <Text style={{
                fontSize: 12,
                fontFamily: "Inter_400Regular",
                color: "#6B7280",
                marginTop: 2,
              }}>
                This will be automatically selected for future orders
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: insets.bottom + 16,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
      }}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving || isSettingDefault}
          style={{
            backgroundColor: "#8B5CF6",
            borderRadius: 16,
            paddingVertical: 16,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            opacity: (isSaving || isSettingDefault) ? 0.7 : 1,
          }}
        >
          {(isSaving || isSettingDefault) ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Save size={20} color="#FFFFFF" />
              <Text style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#FFFFFF",
                marginLeft: 8,
              }}>
                Save Address
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
