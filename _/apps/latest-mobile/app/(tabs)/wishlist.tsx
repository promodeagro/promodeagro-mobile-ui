import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  Search,
  Heart,
  ShoppingCart,
  Trash2,
  Filter,
} from 'lucide-react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { BackButton } from '../../components/BackButton';
import { useWishlist } from '../../utils/WishlistContext';
import { BlinkitQuantityControl } from '../../components/ui/BlinkitQuantityControl';
import { useCart } from '../../utils/CartContext';

export default function WishlistScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, updateQuantity, cartItems } = useCart();

  const [searchQuery, setSearchQuery] = useState('');

  // Convert Map to Array for easier handling
  const wishlistArray = Array.from(wishlistItems.values());

  // Filter wishlist items based on search query
  const filteredWishlistItems = useMemo(() => {
    if (!searchQuery.trim()) return wishlistArray;
    
    return wishlistArray.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [wishlistArray, searchQuery]);

  // Get cart quantity for a product
  const getCartQuantity = (item) => {
    const cartKey = `${item.id}-${item.variationId || 'default'}`;
    return cartItems.get(cartKey)?.quantity || 0;
  };

  // Add to cart handler
  const handleAddToCart = async (item) => {
    try {
      await addToCart(item.id, item.variationId, {
        price: item.price,
        name: item.name,
        unit: item.variation?.unit || 'unit',
        image: item.image,
      });
      Alert.alert('Success', `${item.name} added to cart!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  // Update quantity handler
  const handleUpdateQuantity = (item, newQuantity) => {
    const cartKey = `${item.id}-${item.variationId || 'default'}`;
    updateQuantity(cartKey, newQuantity);
  };

  // Remove from wishlist handler
  const handleRemoveFromWishlist = (item) => {
    Alert.alert(
      'Remove from Wishlist',
      `Are you sure you want to remove "${item.name}" from your wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromWishlist(item.id) }
      ]
    );
  };

  // Clear all wishlist items
  const handleClearWishlist = () => {
    Alert.alert(
      'Clear Wishlist',
      'Are you sure you want to remove all items from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearWishlist }
      ]
    );
  };

  // Render wishlist item
  const renderWishlistItem = ({ item }) => {
    const currentQuantity = getCartQuantity(item);
    const isInStock = true; // Assume all wishlist items are in stock for now

    return (
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          marginBottom: 16,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          {/* Product Image */}
          <TouchableOpacity
            onPress={() => router.push(`/(tabs)/product/${item.id}`)}
            style={{ marginRight: 12 }}
          >
            <Image
              source={{ uri: item.image }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 12,
              }}
              contentFit="cover"
            />
          </TouchableOpacity>

          {/* Product Details */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: 'Inter_600SemiBold',
                color: '#111827',
                marginBottom: 4,
              }}
              numberOfLines={2}
            >
              {item.name}
            </Text>

            <Text
              style={{
                fontSize: 14,
                fontFamily: 'Inter_500Medium',
                color: '#6B7280',
                marginBottom: 8,
              }}
            >
              {item.category}
            </Text>

            <Text
              style={{
                fontSize: 18,
                fontFamily: 'Inter_700Bold',
                color: '#111827',
                marginBottom: 12,
              }}
            >
              ₹{item.price}
            </Text>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Blinkit-style Quantity Controls */}
              <BlinkitQuantityControl
                currentQuantity={currentQuantity}
                isInStock={true}
                onAddToCart={() => handleAddToCart(item)}
                onIncreaseQuantity={() => handleUpdateQuantity(item, currentQuantity + 1)}
                onDecreaseQuantity={() => handleUpdateQuantity(item, currentQuantity - 1)}
                size="small"
              />

              {/* Remove from Wishlist */}
              <TouchableOpacity
                onPress={() => handleRemoveFromWishlist(item)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#FEF2F2',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Heart size={18} color="#EF4444" fill="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 8,
        paddingHorizontal: 20,
        paddingBottom: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <BackButton />
          <Text
            style={{
              fontSize: 22,
              fontFamily: 'Inter_700Bold',
              color: '#111827',
              marginLeft: 8,
            }}
          >
            My Wishlist
          </Text>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F8F9FA',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <Search size={20} color="#6B7280" />
          <TextInput
            style={{
              flex: 1,
              marginLeft: 12,
              fontSize: 16,
              fontFamily: 'Inter_400Regular',
              color: '#111827',
            }}
            placeholder="Search wishlist items..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Clear All Button */}
        {wishlistArray.length > 0 && (
          <TouchableOpacity
            onPress={handleClearWishlist}
            style={{
              alignSelf: 'flex-end',
              marginTop: 8,
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: '#FEF2F2',
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Trash2 size={14} color="#EF4444" />
            <Text
              style={{
                fontSize: 12,
                fontFamily: 'Inter_500Medium',
                color: '#EF4444',
                marginLeft: 4,
              }}
            >
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
        {filteredWishlistItems.length === 0 ? (
          // Empty State
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 80,
            }}
          >
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: '#F3F4F6',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <Heart size={40} color="#9CA3AF" />
            </View>
            <Text
              style={{
                fontSize: 20,
                fontFamily: 'Inter_700Bold',
                color: '#111827',
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              {searchQuery ? 'No items found' : 'Your wishlist is empty'}
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: 'Inter_400Regular',
                color: '#6B7280',
                textAlign: 'center',
                marginBottom: 24,
                lineHeight: 24,
              }}
            >
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Start adding items you love to your wishlist'
              }
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/home')}
                style={{
                  backgroundColor: '#8B5CF6',
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 24,
                }}
              >
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 16,
                    fontFamily: 'Inter_600SemiBold',
                  }}
                >
                  Start Shopping
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          // Wishlist Items
          <FlatList
            data={filteredWishlistItems}
            renderItem={renderWishlistItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          />
        )}
      </View>
    </View>
  );
}