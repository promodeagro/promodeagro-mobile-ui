import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabBarBackground() {
  const insets = useSafeAreaInsets();
  
  if (Platform.OS === 'android') {
    return (
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 88 + Math.max(insets.bottom - 8, 0),
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        }}
      />
    );
  }
  
  return null;
}

export function useBottomTabOverflow() {
  const insets = useSafeAreaInsets();
  return Platform.OS === 'android' ? Math.max(insets.bottom - 8, 0) : 0;
}
