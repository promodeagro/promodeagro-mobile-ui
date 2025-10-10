import { Platform } from 'react-native';

// Font mapping for Android compatibility
export const getFont = (fontName: string): string => {
  // For Android, we need to use the exact font names that are loaded
  // The @expo-google-fonts/inter package loads fonts with these exact names
  return fontName;
};

// Android text style helper
export const getTextStyle = (style: any) => {
  if (Platform.OS === 'android') {
    return {
      ...style,
      includeFontPadding: false,
      textAlignVertical: 'center',
    };
  }
  return style;
};
