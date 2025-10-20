import React, { useRef } from 'react';
import { TouchableOpacity, Text, View, Animated, Pressable } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface BlinkitQuantityControlProps {
  currentQuantity: number;
  isInStock: boolean;
  onAddToCart: () => void;
  onIncreaseQuantity: () => void;
  onDecreaseQuantity: () => void;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export const BlinkitQuantityControl: React.FC<BlinkitQuantityControlProps> = ({
  currentQuantity,
  isInStock,
  onAddToCart,
  onIncreaseQuantity,
  onDecreaseQuantity,
  size = 'medium',
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          buttonSize: 32,
          iconSize: 12,
          fontSize: 12,
          borderRadius: 16,
          paddingHorizontal: 8,
          paddingVertical: 4,
        };
      case 'large':
        return {
          buttonSize: 48,
          iconSize: 18,
          fontSize: 16,
          borderRadius: 24,
          paddingHorizontal: 12,
          paddingVertical: 6,
        };
      default: // medium
        return {
          buttonSize: 40,
          iconSize: 14,
          fontSize: 14,
          borderRadius: 20,
          paddingHorizontal: 10,
          paddingVertical: 5,
        };
    }
  };

  const sizeConfig = getSizeConfig();

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAddToCart = async () => {
    if (disabled || !isInStock) return;
    
    animatePress();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAddToCart();
  };

  const handleIncrease = async () => {
    if (disabled || !isInStock) return;
    
    animatePress();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onIncreaseQuantity();
  };

  const handleDecrease = async () => {
    if (disabled) return;
    
    animatePress();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDecreaseQuantity();
  };

  if (currentQuantity === 0) {
    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Pressable
          onPress={handleAddToCart}
          disabled={disabled || !isInStock}
          style={{
            backgroundColor: isInStock && !disabled ? '#8B5CF6' : '#D1D5DB',
            borderRadius: sizeConfig.borderRadius,
            paddingHorizontal: sizeConfig.paddingHorizontal,
            paddingVertical: sizeConfig.paddingVertical,
            borderWidth: 1,
            borderColor: isInStock && !disabled ? '#7C3AED' : '#9CA3AF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text
            style={{
              fontSize: sizeConfig.fontSize,
              fontFamily: 'Inter_600SemiBold',
              color: isInStock && !disabled ? '#FFFFFF' : '#9CA3AF',
              textAlign: 'center',
            }}
          >
            ADD
          </Text>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#8B5CF6',
          borderRadius: sizeConfig.borderRadius,
          borderWidth: 1,
          borderColor: '#7C3AED',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        {/* Minus Button */}
        <TouchableOpacity
          onPress={handleDecrease}
          disabled={disabled}
          style={{
            width: sizeConfig.buttonSize,
            height: sizeConfig.buttonSize,
            justifyContent: 'center',
            alignItems: 'center',
            borderTopLeftRadius: sizeConfig.borderRadius,
            borderBottomLeftRadius: sizeConfig.borderRadius,
          }}
        >
          <Minus 
            size={sizeConfig.iconSize} 
            color="#FFFFFF" 
            strokeWidth={2.5} 
          />
        </TouchableOpacity>

        {/* Quantity Display */}
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            minWidth: 24,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#8B5CF6',
          }}
        >
          <Text
            style={{
              fontSize: sizeConfig.fontSize,
              fontFamily: 'Inter_700Bold',
              color: '#FFFFFF',
              textAlign: 'center',
            }}
          >
            {currentQuantity}
          </Text>
        </View>

        {/* Plus Button */}
        <TouchableOpacity
          onPress={handleIncrease}
          disabled={disabled || !isInStock}
          style={{
            width: sizeConfig.buttonSize,
            height: sizeConfig.buttonSize,
            justifyContent: 'center',
            alignItems: 'center',
            borderTopRightRadius: sizeConfig.borderRadius,
            borderBottomRightRadius: sizeConfig.borderRadius,
            opacity: isInStock && !disabled ? 1 : 0.5,
          }}
        >
          <Plus 
            size={sizeConfig.iconSize} 
            color="#FFFFFF" 
            strokeWidth={2.5} 
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};
