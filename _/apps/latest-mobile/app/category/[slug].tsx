import { useLocalSearchParams, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Filter } from "lucide-react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from 'react-redux';

import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    useFonts,
} from "@expo-google-fonts/inter";

import CategoryHeader from "../../components/category/CategoryHeader";
import CategorySidebar from "../../components/category/CategorySidebar";
import FiltersModal from "../../components/category/FiltersModal";
import ProductCard from "../../components/category/ProductCard";
import status from "../../store/Constants";
import { fetchCategories, fetchProductsBySubcategory } from "../../store/Home/HomeThunk";

export default function CategoryScreen() {
  const navigation = useNavigation();
  
  // Screen options to hide header
  useLayoutEffect(() => { 
    navigation.setOptions({
      headerShown: false,
      header: () => null,
    });
  }, [navigation]);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const { slug } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  // Redux state with safe access
  const { categoriesData, subcategoryProductsData } = useSelector((state) => state?.home || {
    categoriesData: { status: '', data: [], error: null },
    subcategoryProductsData: { status: '', data: [], error: null }
  });

  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Relevance");
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  
  // Loading states from Redux
  const loading = categoriesData.status === status.IN_PROGRESS;
  const productsLoading = subcategoryProductsData.status === status.IN_PROGRESS;

  // Find current category from Redux data
  const currentCategory = categoriesData.data?.find((cat) => 
    cat.CategoryName.toLowerCase().replace(/\s+/g, '-') === slug
  );

  // Load categories using Redux if not already loaded
  useEffect(() => {
    if (categoriesData.status === '' || categoriesData.status === status.ERROR) {
      dispatch(fetchCategories());
    }
  }, []);

  // Update subcategories when category changes
  useEffect(() => {
    if (currentCategory && currentCategory.Subcategories) {
      console.log('Current category:', currentCategory);
      console.log('Subcategories:', currentCategory.Subcategories);
      console.log('First subcategory:', currentCategory.Subcategories[0]);
      console.log('Subcategory image URLs:', currentCategory.Subcategories.map(sub => ({ name: sub.name || sub, image_url: sub.image_url })));
      
      const transformedSubcategories = currentCategory.Subcategories.map((subcat, index) => {
        try {
          // Handle both object and string formats
          const subcatName = typeof subcat === 'string' ? subcat : (subcat?.name || subcat || 'Unknown');
          const subcatImage = typeof subcat === 'object' && subcat ? subcat.image_url : null;
          
          return {
            id: index + 1,
            name: subcatName,
            slug: subcatName.toLowerCase().replace(/\s+/g, '-'),
            category: currentCategory.CategoryName,
            image_url: subcatImage
          };
        } catch (error) {
          console.error('Error processing subcategory:', subcat, error);
          return {
            id: index + 1,
            name: 'Unknown',
            slug: 'unknown',
            category: currentCategory.CategoryName,
            image_url: null
          };
        }
      });
      
      console.log('Transformed subcategories:', transformedSubcategories);
      setSubcategories(transformedSubcategories);
      
      // Auto-select first subcategory and load its products
      if (transformedSubcategories.length > 0) {
        setSelectedSubcategory(transformedSubcategories[0]);
        dispatch(fetchProductsBySubcategory(transformedSubcategories[0].name));
      }
    }
  }, [currentCategory]);

  // Load products for selected subcategory using Redux
  const loadProductsBySubcategory = (subcategoryName) => {
    dispatch(fetchProductsBySubcategory(subcategoryName));
  };

  // Transform products data from Redux
  const transformedProducts = subcategoryProductsData.data?.products?.map((product) => ({
    id: product.groupId,
    name: product.name,
    price: product.variations?.[0]?.price || 0,
    originalPrice: product.variations?.[0]?.mrp || product.variations?.[0]?.price || 0,
    unit: product.variations?.[0]?.unit || "1 unit",
    brand: "Promode Agro",
    image: product.image,
    rating: 4.5,
    reviews: Math.floor(Math.random() * 100) + 10,
    category: product.category,
    subCategory: product.subCategory,
    inStock: product.variations?.[0]?.availability !== false,
    discount: product.variations?.[0]?.mrp > 0 ? 
      Math.round(((product.variations[0].mrp - product.variations[0].price) / product.variations[0].mrp) * 100) : 0,
    deliveryTime: "11 mins",
    variations: product.variations || [],
    description: product.description,
    tags: product.tags || []
  })) || [];

  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory);
    loadProductsBySubcategory(subcategory.name);
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F8FAFC", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={{ marginTop: 16, fontSize: 16, color: "#6B7280" }}>Loading category...</Text>
      </View>
    );
  }

  const categoryName = currentCategory?.CategoryName || "Products";
  const filteredProducts = transformedProducts;

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <StatusBar style="dark" translucent={false} />
      <FiltersModal
        visible={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        insets={insets}
        filteredProductCount={filteredProducts.length}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
      />

      <CategoryHeader 
        categoryName={categoryName} 
      />

      <View style={{ flex: 1, flexDirection: "row" }}>
        <CategorySidebar 
          subcategories={subcategories} 
          selectedSubcategory={selectedSubcategory}
          onSubcategorySelect={handleSubcategorySelect}
        />

        <View style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            <TouchableOpacity
              onPress={() => setShowFiltersModal(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FDF4FF",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#8B5CF6",
                alignSelf: "flex-start",
              }}
            >
              <Filter size={16} color="#8B5CF6" />
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                  color: "#8B5CF6",
                  marginLeft: 8,
                }}
              >
                Filter & Sort
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 100,
            }}
            showsVerticalScrollIndicator={false}
          >
            {productsLoading ? (
              <View style={{ paddingVertical: 60, alignItems: "center" }}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text style={{ marginTop: 16, fontSize: 16, color: "#6B7280" }}>
                  Loading products...
                </Text>
              </View>
            ) : (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                  }}
                >
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </View>

                {filteredProducts.length === 0 && !productsLoading && (
                  <View style={{ paddingVertical: 60, alignItems: "center" }}>
                    <Text style={{ fontSize: 18, fontFamily: "Inter_600SemiBold", color: "#2D2D2D", marginBottom: 8 }}>
                      No products in this subcategory
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: "#666666", textAlign: "center" }}>
                      Check back later for new products
                    </Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
