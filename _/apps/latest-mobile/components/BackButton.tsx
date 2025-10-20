import React from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface BackButtonProps {
  onPress?: () => void;
  size?: number;
  style?: any;
  accessibilityLabel?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  size = 48,
  style,
  accessibilityLabel = "Go back"
}) => {
  const router = useRouter();
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Smooth click animation
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  const buttonStyle = [
    styles.button,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
    },
    style,
  ];

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={buttonStyle}
        onPress={handlePress}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        activeOpacity={0.7}
      >
        <ArrowLeft 
          size={24} 
          color="#1f2937" 
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
});

export default BackButton;
