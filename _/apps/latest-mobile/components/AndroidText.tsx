import React from 'react';
import { Platform, Text, TextProps } from 'react-native';

interface AndroidTextProps extends TextProps {
  fontFamily?: string;
  children: React.ReactNode;
}

export const AndroidText: React.FC<AndroidTextProps> = ({ 
  fontFamily, 
  style, 
  children, 
  ...props 
}) => {
  const androidStyle = Platform.OS === 'android' ? {
    includeFontPadding: false,
    textAlignVertical: 'center',
  } : {};

  const finalFontFamily = Platform.OS === 'android' && fontFamily ? 
    fontFamily.replace('Inter_', 'Inter-').replace(/(\d+)/, '') : 
    fontFamily;

  return (
    <Text
      style={[
        {
          fontFamily: finalFontFamily,
        },
        androidStyle,
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
