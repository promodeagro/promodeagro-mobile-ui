import React, { useState } from "react";
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export type AddressInput = {
  id?: string;
  name: string;
  phone: string;
  house_number: string;
  address: string;
  landmark_area: string;
  zipCode: string;
  address_type?: string;
};

export function AddressModal({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (addr: AddressInput) => void;
}) {
  const [form, setForm] = useState<AddressInput>({
    name: "",
    phone: "",
    house_number: "",
    address: "",
    landmark_area: "",
    zipCode: "",
    address_type: "home",
  });

  const set = (k: keyof AddressInput, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#FFFFFF", paddingTop: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827", textAlign: "center", marginBottom: 12 }}>Add Delivery Address</Text>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {[
            ["name", "Full Name"],
            ["phone", "Phone"],
            ["house_number", "House/Flat No."],
            ["address", "Street/Area"],
            ["landmark_area", "Landmark"],
            ["zipCode", "Pincode"],
          ].map(([k, label]) => (
            <View key={String(k)} style={{ marginBottom: 12 }}>
              <Text style={{ marginBottom: 6, color: "#374151" }}>{label}</Text>
              <TextInput
                value={String((form as any)[k] || "")}
                onChangeText={(t) => set(k as keyof AddressInput, t)}
                placeholder={String(label)}
                style={{ borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 }}
              />
            </View>
          ))}
          <TouchableOpacity
            onPress={() => {
              onSave({ ...form, id: form.id || String(Date.now()) });
              onClose();
            }}
            style={{ backgroundColor: "#8B5CF6", paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 8 }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Save Address</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ paddingVertical: 12, alignItems: "center" }}>
            <Text style={{ color: "#6B7280" }}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}


