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
import { useEffect, useState, useCallback } from "react";
import { ActivityIndicator, Alert, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, useColorScheme, View, BackHandler, ToastAndroid } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

import { categoryProducts } from "../../data/categoryData";
import { trendingCategories } from "../../data/homeScreenData";
import { setSelectedAddress } from "../../store/Address/AddressSlice";
import status from "../../store/Constants";
import { fetchCategories, fetchHomePageProducts, fetchOffers } from "../../store/Home/HomeThunk";
import { setTestAuth } from "../../store/Signin/SigninSlice";
import { fetchDefaultAddress } from "../../store/Signin/SigninThunk";
import { useHomeScreenAnimations } from "../../utils/useHomeScreenAnimations";

import { CategoryProductsSection } from "../../components/home/CategoryProductsSection";
import { HomeScreenHeader } from "../../components/home/HomeScreenHeader";
import { OffersSliderSection } from "../../components/home/OffersSliderSection";
import { TrendingCategoriesSection } from "../../components/home/TrendingCategoriesSection";
import LocationSelector from "../../components/LocationSelector";
import { ProductCardSkeleton } from "../../components/ui/SkeletonLoader";

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
  const { selectedAddress } = useSelector((state) => state?.address || {
    selectedAddress: null,
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
      // Check if location services are enabled
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        Alert.alert(
          "Location Services Disabled",
          "Please enable location services in your device settings to use this feature.",
          [{ text: "OK" }]
        );
        return;
      }

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
      // Don't show error to user for permission requests
    }
  };

  // Get user's current location
  const getUserLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 15000, // Increased timeout
        maximumAge: 300000, // 5 minutes
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
      // Set a fallback location instead of "Current Location"
      setUserLocation("Location unavailable");
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

  // Set default address as selected when it loads
  useEffect(() => {
    const defaultAddress = defaultAddressData?.data;
    if (defaultAddress && !selectedAddress) {
      dispatch(setSelectedAddress(defaultAddress));
    }
  }, [defaultAddressData, selectedAddress, dispatch]);

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


  // Mock data for trending categories
  const trendingCategoriesData = trendingCategories.map(cat => ({
    id: cat.id,
    name: cat.title,
    icon_name: cat.icon,
    slug: cat.route?.split('/').pop() || cat.id.toString(),
    description: cat.subtitle
  }));




  const handleProductPress = (product: any) => {
    router.push(`/product/${product.id}`);
  };

  const handleLocationSelect = (location: any) => {
    console.log("Selected location:", location);
    
    // The selected address is now handled in LocationSelector component
    // and stored in Redux state. We just need to close the modal.
    setShowLocationSelector(false);
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
    // Show a brief success message
    Alert.alert(
      "Authentication Set",
      "You are now authenticated and can access checkout.",
      [{ text: "OK" }]
    );
  };

  // Ensure authentication state is maintained
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('User not authenticated on home page');
    } else {
      console.log('User is authenticated:', user?.id);
    }
  }, [isAuthenticated, user]);

  // Android back behavior on Home ONLY: double-back to exit
  useFocusEffect(
    useCallback(() => {
      const backPressTsRef = { current: 0 } as { current: number };
      const onBackPress = () => {
        const now = Date.now();
        if (now - backPressTsRef.current < 1500) {
          BackHandler.exitApp();
          return true;
        }
        backPressTsRef.current = now;
        if (Platform.OS === 'android') {
          try { ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT); } catch {}
        }
        return true; // consume on Home
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [])
  );

 
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
  // Priority: selectedAddress > defaultAddress > userLocation > "Add Address"
  const addressType = selectedAddress?.address_type || defaultAddress?.address_type || null;
  
  // Helper function to format address properly
  const formatAddress = (address) => {
    if (!address) return null;
    
    const parts = [];
    if (address.house_number && address.house_number.trim()) parts.push(address.house_number.trim());
    if (address.address && address.address.trim()) parts.push(address.address.trim());
    if (address.landmark_area && address.landmark_area.trim()) parts.push(address.landmark_area.trim());
    
    const formattedAddress = parts.join(', ');
    return formattedAddress.length > 0 ? formattedAddress : null;
  };
  
  const fullAddress = selectedAddress ? 
    formatAddress(selectedAddress) : 
    defaultAddress ? 
    formatAddress(defaultAddress) : 
    null;
    
  // Better fallback logic for display location
  let displayLocation;
  if (selectedAddress && fullAddress) {
    displayLocation = fullAddress;
  } else if (defaultAddress && fullAddress) {
    displayLocation = fullAddress;
  } else if (userLocation && userLocation !== "Current Location" && !userLocation.includes("undefined") && userLocation.length > 0) {
    displayLocation = userLocation;
  } else if (isAuthenticated) {
    displayLocation = "Select Address";
  } else {
    displayLocation = "Select location to order";
  }
  
  // Ensure we always have a valid display location
  if (!displayLocation || displayLocation.trim() === "" || displayLocation === "undefined") {
    displayLocation = "Select Address";
  }
  

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
        contentContainerStyle={{ 
          paddingBottom: Platform.OS === 'android' ? 100 + Math.max(insets.bottom - 8, 0) : 100 
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Flash Deals - First */}
        {/* <FlashDealsSection
          deals={flashDealsProducts || []}
        /> */}

        {/* Special Offers */}
        {!offersLoading && offersData?.data && offersData.data.length > 0 && (
          <OffersSliderSection offers={offersData.data} />
        )}
        
        {/* Real Products from API - Organized by specific categories */}
        {productsLoading ? (
          <View style={{ paddingHorizontal: 16, marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Inter_700Bold",
                color: "#111827",
                marginBottom: 16,
              }}
            >
              Loading Products...
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
              {Array.from({ length: 6 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </View>
          </View>
        ) : (
          homePageProductsData?.data && homePageProductsData.data.length > 0 && (
            <CategoryProductsSection categoryData={homePageProductsData.data} />
          )
        )}
        
        
        
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
