import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { Search, X } from "lucide-react-native";

const filterCategories = [
  { id: "sort", name: "Sort by", hasIndicator: true },
  { id: "categories", name: "Categories", hasIndicator: true },
  { id: "brands", name: "Brands", hasIndicator: false },
  { id: "price", name: "Price", hasIndicator: false },
  { id: "discount", name: "Discount", hasIndicator: false },
  { id: "pack", name: "Pack Size", hasIndicator: false },
  { id: "origin", name: "Country Of Origin", hasIndicator: false },
];

const sortOptions = [
  "Relevance",
  "Price - Low to High",
  "Price - High to Low",
  "Rupee Saving - High to Low",
  "Rupee Saving - Low to High",
  "% Off - High to Low",
];

const categoryOptions = [
  "All",
  "Potato, Onion & Tomato",
  "Cucumber & Capsicum",
  "Beans, Brinjals & Okra",
  "Root Vegetables",
  "Leafy Vegetables",
  "Gourd, Pumpkin, Drumstick",
];

const brandOptions = [
  "fresho!",
  "BB Royal",
  "24 Mantra Organic",
  "Organics",
  "Fresho! Signature",
  "Good Life",
  "Nature Basket",
  "Green Harvest",
];

const priceRanges = [
  "Under ₹50",
  "₹50 - ₹100",
  "₹100 - ₹200",
  "₹200 - ₹500",
  "Above ₹500",
];

const discountOptions = [
  "10% and above",
  "20% and above",
  "30% and above",
  "40% and above",
  "50% and above",
];

const packSizeOptions = ["100g", "200g", "250g", "500g", "1kg", "2kg", "5kg"];

const countryOriginOptions = [
  "India",
  "Local - West Bengal",
  "Karnataka",
  "Tamil Nadu",
  "Maharashtra",
  "Kerala",
  "Himachal Pradesh",
  "Punjab",
];

export default function FiltersModal({
  visible,
  onClose,
  insets,
  filteredProductCount,
  selectedSort,
  onSortChange,
}) {
  const [selectedFilter, setSelectedFilter] = useState("sort");
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedBrands, setSelectedBrands] = useState(new Set());
  const [selectedPriceRanges, setSelectedPriceRanges] = useState(new Set());
  const [selectedDiscounts, setSelectedDiscounts] = useState(new Set());
  const [selectedPackSizes, setSelectedPackSizes] = useState(new Set());
  const [selectedOrigins, setSelectedOrigins] = useState(new Set());
  const [filterSearchQuery, setFilterSearchQuery] = useState("");

  const toggleSelection = (setFunction, value) => {
    setFunction((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    });
  };

  const getFilteredOptions = (options) => {
    if (!filterSearchQuery.trim()) return options;
    return options.filter((option) =>
      option.toLowerCase().includes(filterSearchQuery.toLowerCase()),
    );
  };

  const renderCheckboxOptions = (options, selectedSet, setFunction) => {
    const filteredOptions = getFilteredOptions(options);

    return (
      <View>
        {filteredOptions.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => toggleSelection(setFunction, option)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#F1F5F9",
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: selectedSet.has(option) ? "#8B5CF6" : "#D1D5DB",
                backgroundColor: selectedSet.has(option)
                  ? "#8B5CF6"
                  : "transparent",
                marginRight: 16,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {selectedSet.has(option) && (
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                >
                  ✓
                </Text>
              )}
            </View>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_500Medium",
                color: "#374151",
                flex: 1,
              }}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
        {filteredOptions.length === 0 && filterSearchQuery.trim() && (
          <View
            style={{
              paddingVertical: 40,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_500Medium",
                color: "#9CA3AF",
                textAlign: "center",
              }}
            >
              No options found for "{filterSearchQuery}"
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderSortOptions = () => {
    const filteredOptions = getFilteredOptions(sortOptions);

    return (
      <View>
        {filteredOptions.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => onSortChange(option)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#F1F5F9",
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: selectedSort === option ? "#8B5CF6" : "#D1D5DB",
                marginRight: 16,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {selectedSort === option && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#8B5CF6",
                  }}
                />
              )}
            </View>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_500Medium",
                color: "#374151",
              }}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
        {filteredOptions.length === 0 && filterSearchQuery.trim() && (
          <View
            style={{
              paddingVertical: 40,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_500Medium",
                color: "#9CA3AF",
                textAlign: "center",
              }}
            >
              No options found for "{filterSearchQuery}"
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderContent = () => {
    switch (selectedFilter) {
      case "sort":
        return renderSortOptions();

      case "categories":
        return renderCheckboxOptions(
          categoryOptions,
          selectedCategories,
          setSelectedCategories,
        );

      case "brands":
        return renderCheckboxOptions(
          brandOptions,
          selectedBrands,
          setSelectedBrands,
        );

      case "price":
        return renderCheckboxOptions(
          priceRanges,
          selectedPriceRanges,
          setSelectedPriceRanges,
        );

      case "discount":
        return renderCheckboxOptions(
          discountOptions,
          selectedDiscounts,
          setSelectedDiscounts,
        );

      case "pack":
        return renderCheckboxOptions(
          packSizeOptions,
          selectedPackSizes,
          setSelectedPackSizes,
        );

      case "origin":
        return renderCheckboxOptions(
          countryOriginOptions,
          selectedOrigins,
          setSelectedOrigins,
        );

      default:
        return null;
    }
  };

  const clearFilterSearch = () => {
    setFilterSearchQuery("");
  };

  const clearAllFilters = () => {
    setSelectedCategories(new Set());
    setSelectedBrands(new Set());
    setSelectedPriceRanges(new Set());
    setSelectedDiscounts(new Set());
    setSelectedPackSizes(new Set());
    setSelectedOrigins(new Set());
    onSortChange("Relevance");
    setFilterSearchQuery("");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        {/* Semi-transparent background overlay */}
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Modal content container - covers 70% of screen */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "70%",
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          <View style={{ paddingTop: 20, paddingHorizontal: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontFamily: "Inter_700Bold",
                  color: "#111827",
                }}
              >
                Filters
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#F3F4F6",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <X size={18} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flex: 1, flexDirection: "row" }}>
            <View
              style={{
                width: 140,
                backgroundColor: "#F8FAFC",
                paddingVertical: 20,
              }}
            >
              {filterCategories.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  onPress={() => {
                    setSelectedFilter(filter.id);
                    setFilterSearchQuery("");
                  }}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    backgroundColor:
                      selectedFilter === filter.id ? "#FFFFFF" : "transparent",
                    borderRightWidth: selectedFilter === filter.id ? 3 : 0,
                    borderRightColor: "#8B5CF6",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_500Medium",
                        color:
                          selectedFilter === filter.id ? "#111827" : "#6B7280",
                        flex: 1,
                      }}
                    >
                      {filter.name}
                    </Text>
                    {filter.hasIndicator && (
                      <View
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: "#EF4444",
                        }}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flex: 1, paddingTop: 20 }}>
              <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#F8FAFC",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                  }}
                >
                  <Search size={18} color="#6B7280" />
                  <TextInput
                    value={filterSearchQuery}
                    onChangeText={setFilterSearchQuery}
                    placeholder={`Search ${filterCategories.find((f) => f.id === selectedFilter)?.name.toLowerCase() || "options"}...`}
                    placeholderTextColor="#9CA3AF"
                    style={{
                      flex: 1,
                      marginLeft: 12,
                      fontSize: 16,
                      fontFamily: "Inter_400Regular",
                      color: "#374151",
                    }}
                  />
                  {filterSearchQuery ? (
                    <TouchableOpacity onPress={clearFilterSearch}>
                      <X size={18} color="#6B7280" />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>

              <ScrollView
                style={{ flex: 1, paddingHorizontal: 20 }}
                showsVerticalScrollIndicator={false}
              >
                {renderContent()}
              </ScrollView>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 20,
              paddingVertical: 16,
              paddingBottom: Math.max(insets.bottom + 16, 20),
              borderTopWidth: 1,
              borderTopColor: "#F1F5F9",
            }}
          >
            <TouchableOpacity
              onPress={clearAllFilters}
              style={{
                flex: 1,
                paddingVertical: 16,
                borderRadius: 12,
                marginRight: 12,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#D1D5DB",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: "#374151",
                }}
              >
                Clear
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 2,
                backgroundColor: "#8B5CF6",
                paddingVertical: 16,
                borderRadius: 12,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: "#FFFFFF",
                }}
              >
                Show {filteredProductCount} Products
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
