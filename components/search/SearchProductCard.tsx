import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    useFonts,
} from '@expo-google-fonts/inter';
import { Image } from 'expo-image';
import { Plus } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

interface SearchProductCardProps {
  product: any;
  onPress: () => void;
  onAddToCart: (productId: string, variationId: string, variationData: any) => void;
}

const SearchProductCard: React.FC<SearchProductCardProps> = ({ product, onPress, onAddToCart }) => {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [selectedVariation, setSelectedVariation] = useState(0);

  if (!fontsLoaded) {
    return null;
  }

  // Get product data from Algolia result
  const productName = product.search_name || product.name || 'Product';
  const productImage = product.image || product.images?.[0] || 'https://via.placeholder.com/100x100?text=No+Image';
  const variations = product.variations || [];
  const currentVariation = variations[selectedVariation] || variations[0];
  const price = currentVariation?.price || product.sellingPrice || 0;
  const originalPrice = currentVariation?.mrp || product.originalPrice || price;
  const unit = currentVariation?.unit || product.unit || '1 unit';
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    if (!currentVariation) {
      Alert.alert('Error', 'No variation available for this product');
      return;
    }

    const variationData = {
      price: currentVariation.price,
      unit: currentVariation.unit,
      name: currentVariation.name || unit,
    };

    onAddToCart(product.groupId || product.objectID, currentVariation.id || product.objectID, variationData);
    Alert.alert('Added to Cart', `${productName} added to cart successfully!`);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      {/* Product Image */}
      <View style={{
        width: 80,
        height: 80,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
      }}>
        <Image
          source={{ uri: productImage }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
      </View>

      {/* Product Info */}
      <View style={{ flex: 1, marginLeft: 12, justifyContent: 'space-between' }}>
        <View>
          <Text
            style={{
              fontSize: 16,
              fontFamily: 'Inter_600SemiBold',
              color: '#111827',
              marginBottom: 4,
            }}
            numberOfLines={2}
          >
            {productName}
          </Text>
          
          {product.category && (
            <Text
              style={{
                fontSize: 12,
                fontFamily: 'Inter_400Regular',
                color: '#6B7280',
                marginBottom: 8,
              }}
            >
              {product.category}
            </Text>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: 'Inter_700Bold',
                color: '#111827',
              }}
            >
              ₹{price}
            </Text>
            {discount > 0 && (
              <>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'Inter_400Regular',
                    color: '#9CA3AF',
                    textDecorationLine: 'line-through',
                    marginLeft: 8,
                  }}
                >
                  ₹{originalPrice}
                </Text>
                <View
                  style={{
                    backgroundColor: '#FEE2E2',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                    marginLeft: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontFamily: 'Inter_600SemiBold',
                      color: '#EF4444',
                    }}
                  >
                    {discount}% OFF
                  </Text>
                </View>
              </>
            )}
          </View>

          <Text
            style={{
              fontSize: 12,
              fontFamily: 'Inter_500Medium',
              color: '#6B7280',
            }}
          >
            {unit}
          </Text>
        </View>
      </View>

      {/* Add to Cart Button */}
      <View style={{ justifyContent: 'flex-end', alignItems: 'flex-end' }}>
        <TouchableOpacity
          onPress={handleAddToCart}
          style={{
            backgroundColor: '#8B5CF6',
            borderRadius: 8,
            padding: 8,
            shadowColor: '#8B5CF6',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default SearchProductCard;
