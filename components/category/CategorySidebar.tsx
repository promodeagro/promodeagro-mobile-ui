import { Image } from "expo-image";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function CategorySidebar({ subcategories, selectedSubcategory, onSubcategorySelect }) {
  // Fallback icon mapping for subcategories when no image is available
  const getFallbackIcon = (subcategoryName) => {
    const iconMap = {
      // Fresh Vegetables
      "Exotic Vegetables": "🥬",
      "Leafy Vegetables": "🥬",
      "Root Vegetables": "🥕",
      "Gourd & Pumpkin": "🎃",
      "Beans & Brinjals": "🫘",
      "Potato, Onion & Tomato": "🧅",
      "Cucumber & Capsicum": "🥒",
      
      // Fresh Fruits
      "Seasonal Fruits": "🍎",
      "Citrus Fruits": "🍊",
      "Tropical Fruits": "🥭",
      "Berries": "🍓",
      
      // Bengali Special
      "Fish": "🐟",
      "Meat": "🥩",
      "Seafood": "🦐",
      "Traditional Sweets": "🍯",
      
      // Groceries
      "Rice & Grains": "🌾",
      "Pulses & Lentils": "🫘",
      "Spices & Masala": "🌶️",
      "Oil & Ghee": "🫒",
      
      // Dairy
      "Milk & Cream": "🥛",
      "Cheese": "🧀",
      "Yogurt": "🍶",
      "Butter": "🧈",
      
      // Default
      default: "🛒"
    };
    
    return iconMap[subcategoryName] || iconMap.default;
  };

  if (!subcategories || subcategories.length === 0) {
    return (
      <View style={{ width: 90, backgroundColor: "#FFFFFF", paddingVertical: 16, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 12, color: "#6B7280", textAlign: "center" }}>
          No subcategories available
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{ width: 90, backgroundColor: "#FFFFFF", paddingVertical: 16 }}
    >
      {subcategories.map((subcategory) => (
        <TouchableOpacity
          key={subcategory.id}
          onPress={() => onSubcategorySelect(subcategory)}
          style={{
            alignItems: "center",
            paddingVertical: 12,
            paddingHorizontal: 6,
            backgroundColor:
              selectedSubcategory?.id === subcategory.id ? "#F3E8FF" : "transparent",
            borderRightWidth: selectedSubcategory?.id === subcategory.id ? 3 : 0,
            borderRightColor: "#8B5CF6",
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor:
                selectedSubcategory?.id === subcategory.id ? "#8B5CF6" : "#F3F4F6",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 6,
              overflow: "hidden",
            }}
          >
            {subcategory.image_url ? (
              <Image
                source={{ uri: subcategory.image_url }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                }}
                contentFit="cover"
                transition={200}
                onError={() => {
                  console.log('Failed to load image for subcategory:', subcategory.name);
                }}
                // No placeholder for now, will fallback to emoji if image fails
              />
            ) : (
              <Text style={{ fontSize: 16 }}>
                {getFallbackIcon(subcategory.name)}
              </Text>
            )}
          </View>
          <Text
            style={{
              fontSize: 10,
              fontFamily: "Inter_500Medium",
              color: selectedSubcategory?.id === subcategory.id ? "#8B5CF6" : "#6B7280",
              textAlign: "center",
              lineHeight: 12,
            }}
            numberOfLines={2}
          >
            {subcategory.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
