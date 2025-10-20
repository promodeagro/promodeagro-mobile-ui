import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  children,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E5E7EB',
          opacity,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

// Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => (
  <View
    style={{
      width: '48%',
      aspectRatio: 1,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      marginBottom: 12,
      padding: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    }}
  >
    {/* Image skeleton */}
    <SkeletonLoader
      width="100%"
      height="60%"
      borderRadius={8}
      style={{ marginBottom: 8 }}
    />
    
    {/* Product name skeleton */}
    <SkeletonLoader
      width="80%"
      height={12}
      borderRadius={6}
      style={{ marginBottom: 6 }}
    />
    
    {/* Price skeleton */}
    <SkeletonLoader
      width="60%"
      height={14}
      borderRadius={6}
      style={{ marginBottom: 4 }}
    />
    
    {/* Unit skeleton */}
    <SkeletonLoader
      width="40%"
      height={10}
      borderRadius={4}
    />
  </View>
);

// Category Skeleton
export const CategorySkeleton: React.FC = () => (
  <View
    style={{
      width: '48%',
      height: 120,
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      marginBottom: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    }}
  >
    <SkeletonLoader
      width="100%"
      height="60%"
      borderRadius={8}
      style={{ marginBottom: 12 }}
    />
    <SkeletonLoader
      width="70%"
      height={16}
      borderRadius={8}
      style={{ marginBottom: 6 }}
    />
    <SkeletonLoader
      width="50%"
      height={12}
      borderRadius={6}
    />
  </View>
);
