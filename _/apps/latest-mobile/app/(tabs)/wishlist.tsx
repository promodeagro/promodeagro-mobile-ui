import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
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
  Star,
  Plus,
  StickyNote,
  AlertCircle,
  ChevronDown,
} from 'lucide-react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

export default function WishlistScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all'); // 'all', 'high', 'normal'

  // Mock data for demonstration
  const [wishlistItems] = useState([
    {
      id: 1,
      favorite_id: 1,
      name: "Organic Basmati Rice",
      category_name: "Grains",
      unit: "1kg",
      price: 180,
      original_price: 220,
      variation_price: 180,
      discount_percentage: 18,
      rating: 4.5,
      in_stock: true,
      priority: 1,
      notes: "Need for next week's cooking",
      images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop"],
      variations: [
        {
          id: 1,
          name: "500g",
          price: 95,
          original_price: 115,
          unit: "500g",
          stock_quantity: 20
        },
        {
          id: 2,
          name: "1kg",
          price: 180,
          original_price: 220,
          unit: "1kg",
          stock_quantity: 15,
          is_default: true
        },
        {
          id: 3,
          name: "5kg",
          price: 850,
          original_price: 1050,
          unit: "5kg",
          stock_quantity: 8
        }
      ]
    },
    {
      id: 2,
      favorite_id: 2,
      name: "Fresh Organic Tomatoes",
      category_name: "Vegetables",
      unit: "500g",
      price: 45,
      original_price: 60,
      variation_price: 45,
      discount_percentage: 25,
      rating: 4.2,
      in_stock: false,
      priority: 0,
      notes: "",
      images: ["https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&h=200&fit=crop"],
      variations: [
        {
          id: 1,
          name: "250g",
          price: 25,
          original_price: 30,
          unit: "250g",
          stock_quantity: 0
        },
        {
          id: 2,
          name: "500g",
          price: 45,
          original_price: 60,
          unit: "500g",
          stock_quantity: 0,
          is_default: true
        },
        {
          id: 3,
          name: "1kg",
          price: 85,
          original_price: 110,
          unit: "1kg",
          stock_quantity: 0
        }
      ]
    },
    {
      id: 3,
      favorite_id: 3,
      name: "Premium Honey",
      category_name: "Sweeteners",
      unit: "250g",
      price: 120,
      original_price: 120,
      variation_price: 120,
      discount_percentage: null,
      rating: 4.8,
      in_stock: true,
      priority: 0,
      notes: "For tea and breakfast",
      images: ["https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200&h=200&fit=crop"],
      variations: [
        {
          id: 1,
          name: "100g",
          price: 50,
          original_price: 50,
          unit: "100g",
          stock_quantity: 25
        },
        {
          id: 2,
          name: "250g",
          price: 120,
          original_price: 120,
          unit: "250g",
          stock_quantity: 15,
          is_default: true
        },
        {
          id: 3,
          name: "500g",
          price: 220,
          original_price: 220,
          unit: "500g",
          stock_quantity: 10
        }
      ]
    }
  ]);

  const handleRemoveFromWishlist = (productId: number, productName: string) => {
    Alert.alert(
      'Remove from Wishlist',
      `Are you sure you want to remove "${productName}" from your wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            // Handle remove from wishlist
            console.log('Remove from wishlist:', productId);
          },
        },
      ]
    );
  };

  const handleAddToCart = (item: any) => {
    // Handle add to cart
    console.log('Add to cart:', item);
    Alert.alert('Success', 'Added to cart!');
  };

  const filteredItems = wishlistItems.filter(item => {
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = selectedPriority === 'all' || 
      (selectedPriority === 'high' && item.priority > 0) ||
      (selectedPriority === 'normal' && item.priority === 0);
    
    return matchesSearch && matchesPriority;
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
      }}>
        <Text style={{
          fontSize: 24,
          fontFamily: 'Inter_700Bold',
          color: '#2D2D2D',
          marginBottom: 16,
        }}>
          My Wishlist
        </Text>

        {/* Search and Filter */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <View style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F8F9FA',
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginRight: 12,
          }}>
            <Search size={16} color="#666666" style={{ marginRight: 8 }} />
            <TextInput
              style={{
                flex: 1,
                fontSize: 14,
                fontFamily: 'Inter_400Regular',
                color: '#2D2D2D',
              }}
              placeholder="Search wishlist..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <TouchableOpacity style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: '#F8F9FA',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Filter size={16} color="#666666" />
          </TouchableOpacity>
        </View>

        {/* Priority Filter */}
        <View style={{ flexDirection: 'row' }}>
          {[
            { value: 'all', label: 'All Items' },
            { value: 'high', label: 'High Priority' },
            { value: 'normal', label: 'Normal' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.value}
              onPress={() => setSelectedPriority(filter.value)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: selectedPriority === filter.value ? '#EDE9FE' : '#F8F9FA',
                marginRight: 8,
              }}
            >
              <Text style={{
                fontSize: 12,
                fontFamily: 'Inter_500Medium',
                color: selectedPriority === filter.value ? '#8B5CF6' : '#666666',
              }}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Items Count */}
        <Text style={{
          fontSize: 12,
          fontFamily: 'Inter_400Regular',
          color: '#666666',
          marginTop: 8,
        }}>
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
        </Text>
      </View>

      {/* Empty State */}
      {filteredItems.length === 0 ? (
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 40,
        }}>
          <Heart size={64} color="#E5E7EB" />
          <Text style={{
            fontSize: 18,
            fontFamily: 'Inter_600SemiBold',
            color: '#2D2D2D',
            textAlign: 'center',
            marginTop: 16,
            marginBottom: 8,
          }}>
            {searchQuery ? 'No matching items' : 'Your wishlist is empty'}
          </Text>
          <Text style={{
            fontSize: 14,
            fontFamily: 'Inter_400Regular',
            color: '#666666',
            textAlign: 'center',
            lineHeight: 20,
            marginBottom: 24,
          }}>
            {searchQuery 
              ? 'Try adjusting your search or filters'
              : 'Browse products and add your favorites here'
            }
          </Text>
          {!searchQuery && (
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/categories')}
              style={{
                backgroundColor: '#8B5CF6',
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 24,
              }}
            >
              <Text style={{
                fontSize: 16,
                fontFamily: 'Inter_600SemiBold',
                color: '#FFFFFF',
              }}>
                Start Shopping
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: insets.bottom + 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {filteredItems.map((item) => (
            <View
              key={`${item.favorite_id}-${item.id}`}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View style={{ flexDirection: 'row' }}>
                {/* Product Image */}
                <TouchableOpacity
                  onPress={() => router.push(`/product/${item.id}`)}
                  style={{ position: 'relative' }}
                >
                  <Image
                    source={{ uri: item.images?.[0] }}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                      backgroundColor: '#F8F9FA',
                    }}
                    contentFit="cover"
                  />
                  
                  {/* Priority Badge */}
                  {item.priority > 0 && (
                    <View style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: '#FF4757',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <AlertCircle size={12} color="#FFFFFF" />
                    </View>
                  )}
                  
                  {/* Discount Badge */}
                  {item.discount_percentage && (
                    <View style={{
                      position: 'absolute',
                      bottom: 4,
                      left: 4,
                      backgroundColor: '#10B981',
                      paddingHorizontal: 4,
                      paddingVertical: 2,
                      borderRadius: 4,
                    }}>
                      <Text style={{
                        fontSize: 8,
                        fontFamily: 'Inter_600SemiBold',
                        color: '#FFFFFF',
                      }}>
                        {item.discount_percentage}% OFF
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Product Info */}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <TouchableOpacity
                    onPress={() => router.push(`/product/${item.id}`)}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: 'Inter_600SemiBold',
                        color: '#2D2D2D',
                        marginBottom: 4,
                        lineHeight: 20,
                      }}
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>
                    
                    {/* Variation Selector */}
                    {item.variations && item.variations.length > 1 && (
                      <TouchableOpacity
                        onPress={() => {
                          // Show variation selection modal
                          Alert.alert(
                            "Select Size",
                            "Choose your preferred size:",
                            item.variations.map((variation: any) => ({
                              text: `${variation.name} - ₹${variation.price}`,
                              onPress: () => {
                                // Update the current variation
                                const newVariation = variation;
                                // You might want to update the wishlist item with new variation
                                console.log("Selected variation:", newVariation);
                              },
                            }))
                          );
                        }}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "#F8FAFC",
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: "#E2E8F0",
                          marginBottom: 6,
                          alignSelf: "flex-start",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontFamily: "Inter_600SemiBold",
                            color: "#1F2937",
                            marginRight: 4,
                          }}
                        >
                          {item.unit}
                        </Text>
                        <ChevronDown size={10} color="#6B7280" />
                      </TouchableOpacity>
                    )}
                    
                    <Text style={{
                      fontSize: 12,
                      fontFamily: 'Inter_400Regular',
                      color: '#666666',
                      marginBottom: 8,
                    }}>
                      {item.category_name} • {item.unit}
                    </Text>

                    {/* Price */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Text style={{
                        fontSize: 18,
                        fontFamily: 'Inter_700Bold',
                        color: '#2D2D2D',
                        marginRight: 8,
                      }}>
                        ₹{item.variation_price || item.price}
                      </Text>
                      {item.original_price && item.price < item.original_price && (
                        <Text style={{
                          fontSize: 14,
                          fontFamily: 'Inter_500Medium',
                          color: '#999999',
                          textDecorationLine: 'line-through',
                        }}>
                          ₹{item.original_price}
                        </Text>
                      )}
                    </View>

                    {/* Rating */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Star size={12} color="#FFD700" fill="#FFD700" />
                      <Text style={{
                        fontSize: 12,
                        fontFamily: 'Inter_500Medium',
                        color: '#666666',
                        marginLeft: 4,
                      }}>
                        {item.rating || 0}
                      </Text>
                      
                      {/* Stock Status */}
                      <View style={{
                        marginLeft: 12,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                        backgroundColor: item.in_stock ? '#ECFDF5' : '#FEF2F2',
                      }}>
                        <Text style={{
                          fontSize: 10,
                          fontFamily: 'Inter_500Medium',
                          color: item.in_stock ? '#065F46' : '#991B1B',
                        }}>
                          {item.in_stock ? 'In Stock' : 'Out of Stock'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Notes */}
                  {item.notes && (
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      marginTop: 8,
                      paddingTop: 8,
                      borderTopWidth: 1,
                      borderTopColor: '#F3F4F6',
                    }}>
                      <StickyNote size={12} color="#8B5CF6" style={{ marginRight: 6, marginTop: 2 }} />
                      <Text style={{
                        flex: 1,
                        fontSize: 12,
                        fontFamily: 'Inter_400Regular',
                        color: '#666666',
                        lineHeight: 16,
                      }}>
                        {item.notes}
                      </Text>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 12,
                  }}>
                    {item.in_stock ? (
                      <TouchableOpacity
                        onPress={() => handleAddToCart(item)}
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#8B5CF6',
                          borderRadius: 8,
                          paddingVertical: 8,
                          marginRight: 8,
                        }}
                      >
                        <ShoppingCart size={14} color="#FFFFFF" />
                        <Text style={{
                          fontSize: 12,
                          fontFamily: 'Inter_600SemiBold',
                          color: '#FFFFFF',
                          marginLeft: 4,
                        }}>
                          Add to Cart
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#F3F4F6',
                        borderRadius: 8,
                        paddingVertical: 8,
                        marginRight: 8,
                      }}>
                        <AlertCircle size={14} color="#666666" />
                        <Text style={{
                          fontSize: 12,
                          fontFamily: 'Inter_600SemiBold',
                          color: '#666666',
                          marginLeft: 4,
                        }}>
                          Out of Stock
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={() => handleRemoveFromWishlist(item.id, item.name)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        backgroundColor: '#FEF2F2',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Trash2 size={14} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
