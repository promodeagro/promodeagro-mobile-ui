import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export function TrendingCategoriesSection({ categories }: { categories: any[] }) {
  const router = useRouter();

  // Icon mapping for categories
  const getIconForCategory = (iconName: string) => {
    const iconMap: { [key: string]: string } = {
      apple: "🍎",
      milk: "🥛",
      cookie: "🍪",
      "glass-water": "🥤",
      snowflake: "🧊",
      coffee: "☕",
      cake: "🧁",
      candy: "🍭",
      wheat: "🌾",
      nut: "🥜",
      bottle: "🍯",
      fish: "🐟",
      leaf: "🌿",
      baby: "👶",
      pill: "💊",
      home: "🏠",
      user: "👤",
      heart: "❤️",
    };
    return iconMap[iconName] || "🛒";
  };

  // Background color mapping for categories
  const getColorsForCategory = (index: number) => {
    const colorSets = [
      { bgColor: "#FEF3C7", borderColor: "#F59E0B" },
      { bgColor: "#DBEAFE", borderColor: "#3B82F6" },
      { bgColor: "#DCFCE7", borderColor: "#10B981" },
      { bgColor: "#FCE7F3", borderColor: "#EC4899" },
      { bgColor: "#F3E8FF", borderColor: "#8B5CF6" },
      { bgColor: "#FFF7ED", borderColor: "#F97316" },
      { bgColor: "#ECFDF5", borderColor: "#059669" },
      { bgColor: "#FEF2F2", borderColor: "#EF4444" },
    ];
    return colorSets[index % colorSets.length];
  };

  return (
    <View style={{ marginBottom: 32 }}>
      <Text
        style={{
          fontSize: 20,
          fontFamily: "Inter_700Bold",
          color: "#111827",
          paddingHorizontal: 24,
          marginBottom: 16,
        }}
      >
        Shop by Category
      </Text>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          paddingHorizontal: 24,
          justifyContent: "space-between",
        }}
      >
        {categories.slice(0, 8).map((category, index) => {
          const colors = getColorsForCategory(index);
          return (
            <TouchableOpacity
              key={category.id}
              onPress={() => router.push(`/category/${category.slug}`)}
              style={{
                width: "48%",
                backgroundColor: colors.bgColor,
                borderRadius: 20,
                marginBottom: 16,
                padding: 20,
                borderWidth: 2,
                borderColor: colors.borderColor,
                shadowColor: colors.borderColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontSize: 32 }}>
                  {getIconForCategory(category.icon_name)}
                </Text>
                <View
                  style={{
                    backgroundColor: colors.borderColor,
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                  }}
                />
              </View>

              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_700Bold",
                  color: "#111827",
                  lineHeight: 20,
                  marginBottom: 4,
                }}
              >
                {category.name}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_500Medium",
                  color: "#6B7280",
                }}
              >
                {category.description || "Shop now"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
