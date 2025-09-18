import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    useFonts,
} from "@expo-google-fonts/inter";
import * as Location from 'expo-location';
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from 'react-redux';

import { categoryProducts } from "../../data/categoryData";
import { trendingCategories, weeklyStaples } from "../../data/homeScreenData";
import status from "../../store/Constants";
import { fetchCategories, fetchHomePageProducts, fetchOffers } from "../../store/Home/HomeThunk";
import { setTestAuth } from "../../store/Signin/SigninSlice";
import { fetchDefaultAddress } from "../../store/Signin/SigninThunk";
import { useHomeScreenAnimations } from "../../utils/useHomeScreenAnimations";

import { CategoryProductsSection } from "../../components/home/CategoryProductsSection";
import { FlashDealsSection } from "../../components/home/FlashDealsSection";
import { HomeScreenHeader } from "../../components/home/HomeScreenHeader";
import { OffersSliderSection } from "../../components/home/OffersSliderSection";
import { PopularThisWeekSection } from "../../components/home/PopularThisWeekSection";
import { TrendingCategoriesSection } from "../../components/home/TrendingCategoriesSection";
import { WeeklyStaplesSection } from "../../components/home/WeeklyStaplesSection";
import LocationSelector from "../../components/LocationSelector";

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dispatch = useDispatch();

  // Redux state with safe access
  const { categoriesData, homePageProductsData, offersData } = useSelector((state) => state?.home || {
    categoriesData: { status: '', data: [], error: null },
    homePageProductsData: { status: '', data: [], error: null },
    offersData: { status: '', data: [], error: null },
  });
  const { user, isAuthenticated, defaultAddressData } = useSelector((state) => state?.login || {
    user: null,
    isAuthenticated: false,
    defaultAddressData: { status: '', data: null, error: null },
  });
  
  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [userLocation, setUserLocation] = useState<string>("Current Location");
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);

  // Loading states from Redux with safe access
  const categoriesLoading = categoriesData?.status === status.IN_PROGRESS;
  const productsLoading = homePageProductsData?.status === status.IN_PROGRESS;
  const offersLoading = offersData?.status === status.IN_PROGRESS;

  const { handleScroll, headerOpacity, headerTranslateY, searchTranslateY } =
    useHomeScreenAnimations();

  // Dispatch Redux actions instead of direct API calls
  const loadCategories = () => {
    dispatch(fetchCategories());
  };

  const loadHomePageProducts = () => {
    dispatch(fetchHomePageProducts());
  };

  const loadOffers = () => {
    dispatch(fetchOffers());
  };

  // Request location permission and get user location
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      
      if (status === 'granted') {
        await getUserLocation();
      } else {
        Alert.alert(
          "Location Permission",
          "Location permission is required to show your current location. Please enable it in settings.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  // Get user's current location
  const getUserLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const locationName = address.city || address.subregion || address.region || "Current Location";
        setUserLocation(locationName);
      }
    } catch (error) {
      console.error('Error getting user location:', error);
      setUserLocation("Current Location");
    }
  };

  // Load data on component mount using Redux
  useEffect(() => {
    loadCategories();
    loadHomePageProducts();
    loadOffers();
    requestLocationPermission();
    
    // Fetch default address if user is authenticated
    if (isAuthenticated && user) {
      const userId = user?.id || user?.userId;
      if (userId) {
        dispatch(fetchDefaultAddress(userId));
      }
    }
  }, [isAuthenticated, user]);

  // Transform Bengali Special data to match FlashDealsSection expected structure
  const flashDealsProducts = (categoryProducts["bengali-special"] || []).map(product => ({
    id: product.id,
    name: product.name,
    images: [product.image], // Convert single image to array
    discount_percentage: product.discount, // Rename discount to discount_percentage
    price: product.price,
    original_price: product.originalPrice,
    unit: product.unit,
    variations: product.variations,
    in_stock: product.inStock,
    rating: product.rating,
    reviews: product.reviews,
    category: product.category,
    deliveryTime: product.deliveryTime,
  }));

  // Mock data for weekly staples
  const weeklyStaplesProducts = weeklyStaples.map(item => ({
    id: item.id,
    name: item.title,
    rating: 4.5,
    images: [item.image],
    variations: [
      {
        id: `${item.id}-500g`,
        name: "500g",
        price: Math.round(item.price * 0.5),
        original_price: Math.round(item.price * 0.5),
        unit: "500g",
        stock_quantity: item.inStock ? 20 : 0,
        is_default: false
      },
      {
        id: `${item.id}-1kg`,
        name: "1kg",
        price: item.price,
        original_price: item.price,
        unit: "1kg",
        stock_quantity: item.inStock ? 15 : 0,
        is_default: true
      },
      {
        id: `${item.id}-2kg`,
        name: "2kg",
        price: Math.round(item.price * 1.8),
        original_price: Math.round(item.price * 1.8),
        unit: "2kg",
        stock_quantity: item.inStock ? 10 : 0
      }
    ],
    in_stock: item.inStock
  }));

  // Mock data for trending categories
  const trendingCategoriesData = trendingCategories.map(cat => ({
    id: cat.id,
    name: cat.title,
    icon_name: cat.icon,
    slug: cat.route?.split('/').pop() || cat.id.toString(),
    description: cat.subtitle
  }));

  // Mock data for popular products
  const popularProducts = weeklyStaples.slice(0, 8).map(item => ({
    id: item.id,
    name: item.title,
    rating: 4.5,
    review_count: Math.floor(Math.random() * 100) + 10,
    images: [item.image],
    variations: [
      {
        id: `${item.id}-500g`,
        name: "500g",
        price: Math.round(item.price * 0.5),
        original_price: Math.round(item.price * 0.5),
        unit: "500g",
        stock_quantity: item.inStock ? 20 : 0,
        is_default: false
      },
      {
        id: `${item.id}-1kg`,
        name: "1kg",
        price: item.price,
        original_price: item.price,
        unit: "1kg",
        stock_quantity: item.inStock ? 15 : 0,
        is_default: true
      },
      {
        id: `${item.id}-2kg`,
        name: "2kg",
        price: Math.round(item.price * 1.8),
        original_price: Math.round(item.price * 1.8),
        unit: "2kg",
        stock_quantity: item.inStock ? 10 : 0
      }
    ],
    in_stock: item.inStock
  }));



  const handleProductPress = (product: any) => {
    router.push(`/product/${product.id}`);
  };

  const handleLocationSelect = (location: any) => {
    console.log("Selected location:", location);
    // Handle location selection - could update user preferences, refresh nearby stores, etc.
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh categories, products, and offers data using Redux
    dispatch(fetchCategories());
    dispatch(fetchHomePageProducts());
    dispatch(fetchOffers());
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Test function to manually authenticate user
  const testAuthentication = () => {
    console.log('Setting test authentication...');
    dispatch(setTestAuth());
  };

 
  if (!fontsLoaded) {
    return null;
  }

  // Check if any main data is still loading
  const isInitialLoading = categoriesLoading || productsLoading || offersLoading;

  // Transform categories data for header with safe access
  const transformedCategories = categoriesData?.data?.map((category: any) => ({
    id: category.CategoryName?.toLowerCase().replace(/\s+/g, '-') || category.id,
    name: category.CategoryName || category.name,
    image_url: category.image_url,
    slug: category.CategoryName?.toLowerCase().replace(/\s+/g, '-') || category.slug,
    description: `Browse ${(category.CategoryName || category.name)?.toLowerCase()}`,
    subcategories: category.Subcategories || category.subcategories || []
  })) || [];

  // Pass the transformed categories data to the header
  const categoriesForHeader = transformedCategories;

  // Get default address for header
  const defaultAddress = defaultAddressData?.data;
  
  // Format the address for display
  // Bold part: address_type (e.g., "Home")
  // Regular part: full address details
  const addressType = defaultAddress?.address_type || null;
  const fullAddress = defaultAddress ? 
    `${defaultAddress.house_number}, ${defaultAddress.address}${defaultAddress.landmark_area ? ', ' + defaultAddress.landmark_area : ''}` : 
    null;
    
  const displayLocation = defaultAddress ? fullAddress : userLocation;

  // Simple loading component
  const LoadingScreen = () => (
    <View style={{ 
      flex: 1, 
      backgroundColor: "#FAFBFC",
      justifyContent: "center",
      alignItems: "center",
    }}>
      <ActivityIndicator size="large" color="#8B5CF6" />
      <Text style={{
        fontSize: 16,
        fontFamily: "Inter_500Medium",
        color: "#6B7280",
        marginTop: 16,
        textAlign: "center"
      }}>
        Loading...
      </Text>
    </View>
  );

  // Show loading screen if initial data is loading
  if (isInitialLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FAFBFC" }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <LoadingScreen />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FAFBFC" }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Test Authentication Button - Remove this in production */}
      {!isAuthenticated && (
        <TouchableOpacity
          onPress={testAuthentication}
          style={{
            position: 'absolute',
            top: insets.top + 10,
            right: 20,
            backgroundColor: '#8B5CF6',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            zIndex: 1000,
          }}
        >
          <Text style={{
            color: 'white',
            fontSize: 12,
            fontFamily: 'Inter_500Medium'
          }}>
            Test Auth
          </Text>
        </TouchableOpacity>
      )}

      <HomeScreenHeader
        insets={insets}
        headerOpacity={headerOpacity}
        headerTranslateY={headerTranslateY}
        searchTranslateY={searchTranslateY}
        categories={categoriesForHeader}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onLocationPress={() => setShowLocationSelector(true)}
        userLocation={displayLocation}
        addressType={addressType}
        locationPermission={locationPermission}
        onRequestLocation={requestLocationPermission}
        defaultAddress={defaultAddress}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Flash Deals - First */}
        <FlashDealsSection
          deals={flashDealsProducts || []}
        />

        {/* Special Offers */}
        {!offersLoading && offersData?.data && offersData.data.length > 0 && (
          <OffersSliderSection offers={offersData.data} />
        )}
        
        {/* Real Products from API - Organized by specific categories */}
        {!productsLoading && homePageProductsData?.data && homePageProductsData.data.length > 0 && (
          <CategoryProductsSection categoryData={homePageProductsData.data} />
        )}
        
        {/* Bought Often (Popular This Week) */}
        <PopularThisWeekSection
          items={popularProducts || []}
        />
        
        {/* Weekly Staples */}
        <WeeklyStaplesSection
          items={weeklyStaplesProducts || []}
        />
        
        {/* Trending Categories */}
        <TrendingCategoriesSection categories={trendingCategoriesData || []} />
      </ScrollView>

             {/* Location Selector Modal */}
      <LocationSelector
        visible={showLocationSelector}
        onClose={() => setShowLocationSelector(false)}
        onLocationSelect={handleLocationSelect}
        showStores={true}
        showDeliveryZones={true}
        showOffers={true}
      />
    </View>
  );
}
