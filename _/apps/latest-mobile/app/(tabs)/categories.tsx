import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowRight, Grid3X3, Search, Sparkles } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from 'react-redux';
import status from "../../store/Constants";
import { fetchCategories } from "../../store/Home/HomeThunk";

const { width } = Dimensions.get("window");

export default function CategoriesScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dispatch = useDispatch();

  // Redux state with safe access
  const { categoriesData } = useSelector((state) => state?.home || {
    categoriesData: { status: '', data: [], error: null }
  });
  
  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Loading state from Redux with safe access
  const categoriesLoading = categoriesData?.status === status.IN_PROGRESS;

  // Load categories using Redux
  const loadCategories = () => {
    dispatch(fetchCategories());
  };

  // Load categories on component mount
  useEffect(() => {
    // Only fetch if we don't have data or if there was an error
    if (categoriesData?.status === '' || categoriesData?.status === status.ERROR) {
      loadCategories();
    }
  }, []);

  // Transform categories data for display
  const transformedCategories = categoriesData?.data?.map((category: any, index: number) => ({
    id: index + 1,
    title: category.CategoryName || category.name,
    subtitle: `Browse ${(category.CategoryName || category.name)?.toLowerCase()}`,
    image: category.image_url,
    route: `/category/${(category.CategoryName || category.name)?.toLowerCase().replace(/\s+/g, '-')}`,
    bgColor: "#FDF4FF",
    borderColor: "#C084FC",
    accentColor: "#8B5CF6",
    subcategories: category.Subcategories || category.subcategories || []
  })) || [];

  // Loading screen component
  const LoadingScreen = () => (
    <View style={{ 
      flex: 1, 
      backgroundColor: "#FAFBFC",
      justifyContent: "center",
      alignItems: "center",
    }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ActivityIndicator size="large" color="#8B5CF6" />
      <Text style={{
        fontSize: 16,
        fontFamily: "Inter_500Medium",
        color: "#6B7280",
        marginTop: 16,
        textAlign: "center"
      }}>
        Loading Categories...
      </Text>
    </View>
  );

  if (!fontsLoaded || categoriesLoading) {
    return <LoadingScreen />;
  }

  const filteredCategories = transformedCategories.filter((category) =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#FAFBFC" }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: "#FFFFFF",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              backgroundColor: "#F3F4F6",
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            <Grid3X3 size={18} color="#8B5CF6" />
          </View>
          <Text
            style={{
              fontSize: 24,
              fontFamily: "Inter_800ExtraBold",
              color: "#111827",
            }}
          >
            Categories
          </Text>
        </View>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_500Medium",
            color: "#6B7280",
            marginBottom: 20,
          }}
        >
          Discover fresh groceries by category
        </Text>

        {/* Enhanced Search Bar */}
        <View
          style={{
            height: 52,
            backgroundColor: "#FFFFFF",
            borderRadius: 26,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 8,
            borderWidth: 2,
            borderColor: "#F3F4F6",
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              backgroundColor: "#F3F4F6",
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Search size={18} color="#8B5CF6" />
          </View>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search categories..."
            placeholderTextColor="#9CA3AF"
            style={{
              flex: 1,
              marginLeft: 16,
              fontSize: 15,
              fontFamily: "Inter_500Medium",
              color: "#111827",
            }}
          />
          <TouchableOpacity
            style={{
              width: 32,
              height: 32,
              backgroundColor: "#8B5CF6",
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Sparkles size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories Grid */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {categoriesLoading ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 80,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_500Medium",
                color: "#6B7280",
              }}
            >
              Loading categories...
            </Text>
          </View>
        ) : (
          <>
            {/* First Category - Full Width */}
            {filteredCategories.length > 0 && (
            <TouchableOpacity
              key={filteredCategories[0].id}
              onPress={() => router.push(filteredCategories[0].route)}
              style={{
                width: "100%",
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                marginBottom: 20,
                overflow: "hidden",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
                elevation: 6,
                borderWidth: 1,
                borderColor: "#F3F4F6",
              }}
            >
              {/* Category Image with Overlay */}
              <View style={{ position: "relative", height: 180 }}>
                <Image
                  source={{ uri: filteredCategories[0].image }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.1)",
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    backgroundColor: "rgba(255,255,255,0.95)",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_600SemiBold",
                      color: "#8B5CF6",
                    }}
                  >
                    FEATURED
                  </Text>
                </View>
              </View>

              {/* Category Info */}
              <View style={{ padding: 20 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 20,
                        fontFamily: "Inter_700Bold",
                        color: "#111827",
                        marginBottom: 6,
                        lineHeight: 24,
                      }}
                      numberOfLines={2}
                    >
                      {filteredCategories[0].title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 15,
                        fontFamily: "Inter_500Medium",
                        color: "#6B7280",
                      }}
                    >
                      {filteredCategories[0].subtitle}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: "#F3F4F6",
                      borderRadius: 20,
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#8B5CF6",
                    }}
                  >
                    <ArrowRight size={20} color="#8B5CF6" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Remaining Categories - Grid Layout */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {filteredCategories.slice(1).map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => router.push(category.route)}
              style={{
                width: "48%",
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                marginBottom: 16,
                overflow: "hidden",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
                elevation: 6,
                borderWidth: 1,
                borderColor: "#F3F4F6",
              }}
            >
              {/* Category Image with Overlay */}
              <View style={{ position: "relative", height: 140 }}>
                <Image
                  source={{ uri: category.image }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.1)",
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    backgroundColor: "rgba(255,255,255,0.95)",
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: "Inter_600SemiBold",
                      color: "#8B5CF6",
                    }}
                  >
                    NEW
                  </Text>
                </View>
              </View>

              {/* Category Info */}
              <View style={{ padding: 16 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "Inter_700Bold",
                        color: "#111827",
                        marginBottom: 4,
                        lineHeight: 20,
                      }}
                      numberOfLines={2}
                    >
                      {category.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "Inter_500Medium",
                        color: "#6B7280",
                      }}
                    >
                      {category.subtitle}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      backgroundColor: "#F3F4F6",
                      borderRadius: 16,
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#8B5CF6",
                    }}
                  >
                    <ArrowRight size={16} color="#8B5CF6" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
            ))}
          </View>
          </>
        )}

        {/* Empty State */}
        {filteredCategories.length === 0 && searchQuery && (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 80,
            }}
          >
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "#F3F4F6",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Search size={40} color="#8B5CF6" />
            </View>
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Inter_700Bold",
                color: "#111827",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              No Categories Found
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_500Medium",
                color: "#6B7280",
                textAlign: "center",
                lineHeight: 24,
                paddingHorizontal: 24,
              }}
            >
              Try searching with different keywords or browse all available
              categories
            </Text>
          </View>
        )}

        {/* Category Stats */}
        {filteredCategories.length > 0 && !searchQuery && !categoriesLoading && (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 24,
              marginTop: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
              elevation: 6,
              borderWidth: 1,
              borderColor: "#F3F4F6",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Inter_700Bold",
                color: "#111827",
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              Shop with Confidence
            </Text>
            <View
              style={{ flexDirection: "row", justifyContent: "space-around" }}
            >
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: "Inter_800ExtraBold",
                    color: "#8B5CF6",
                  }}
                >
                  {transformedCategories.reduce((total, category) => total + (category.subcategories?.length || 0), 0)}+
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_500Medium",
                    color: "#6B7280",
                  }}
                >
                  Products
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: "Inter_800ExtraBold",
                    color: "#10B981",
                  }}
                >
                  {transformedCategories.length}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_500Medium",
                    color: "#6B7280",
                  }}
                >
                  Categories
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
