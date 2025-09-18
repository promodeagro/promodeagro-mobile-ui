import { Platform } from 'react-native';

// Font fallback utility for better Android compatibility
export const getFontFamily = (fontName: string): string => {
  if (Platform.OS === 'android') {
    // Android font mapping - use the loaded font names
    const fontMap: { [key: string]: string } = {
      'Inter_400Regular': 'Inter-Regular',
      'Inter_500Medium': 'Inter-Medium',
      'Inter_600SemiBold': 'Inter-SemiBold',
      'Inter_700Bold': 'Inter-Bold',
      'Inter_800ExtraBold': 'Inter-ExtraBold',
    };
    
    return fontMap[fontName] || fontName;
  }
  
  // iOS uses the exact font name
  return fontName;
};

// Android-specific text styling helper
export const getAndroidTextStyle = (baseStyle: any) => {
  if (Platform.OS === 'android') {
    return {
      ...baseStyle,
      // Ensure text renders properly on Android
      includeFontPadding: false,
      textAlignVertical: 'center',
    };
  }
  return baseStyle;
};

// Android-specific shadow helper
export const getAndroidShadow = (shadowConfig: any) => {
  if (Platform.OS === 'android') {
    return {
      elevation: shadowConfig.elevation || 4,
      shadowColor: shadowConfig.shadowColor || '#000',
    };
  }
  return shadowConfig;
};
