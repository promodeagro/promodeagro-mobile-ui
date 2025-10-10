import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { useColorScheme } from '@/hooks/useColorScheme';
import GlobalCheckoutWidget from '../components/GlobalCheckoutWidget';
import { API_CONFIG } from '../config/api';
import store, { persistor } from '../store/store';
import { CartProvider } from '../utils/CartContext';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      ...API_CONFIG.DEFAULT_QUERY_OPTIONS,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <CartProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack>
                <Stack.Screen name="splash" options={{ headerShown: false }} />
                <Stack.Screen name="welcome" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="phone-auth" options={{ headerShown: false }} />
                <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen 
                  name="category" 
                  options={{ 
                    headerShown: false,
                    header: () => null,
                    presentation: 'modal'
                  }} 
                />
                <Stack.Screen 
                  name="checkout" 
                  options={{ 
                    headerShown: false,
                    header: () => null,
                  }} 
                />
                <Stack.Screen 
                  name="order-confirmation" 
                  options={{ 
                    headerShown: false,
                    header: () => null,
                  }} 
                />
                <Stack.Screen 
                  name="payment-methods" 
                  options={{ 
                    headerShown: false,
                    header: () => null,
                  }} 
                />
                <Stack.Screen 
                  name="security" 
                  options={{ 
                    headerShown: false,
                    header: () => null,
                  }} 
                />
                <Stack.Screen 
                  name="notifications" 
                  options={{ 
                    headerShown: false,
                    header: () => null,
                  }} 
                />
                <Stack.Screen 
                  name="help" 
                  options={{ 
                    headerShown: false,
                    header: () => null,
                  }} 
                />
                <Stack.Screen 
                  name="settings" 
                  options={{ 
                    headerShown: false,
                    header: () => null,
                  }} 
                />
                <Stack.Screen 
                  name="referral" 
                  options={{ 
                    headerShown: false,
                    header: () => null,
                  }} 
                />
                <Stack.Screen 
                  name="payment" 
                  options={{ 
                    headerShown: false,
                    header: () => null,
                  }} 
                />
                <Stack.Screen 
                  name="address" 
                  options={{ 
                    headerShown: false,
                    header: () => null,
                  }} 
                />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
              
              {/* Global Checkout Widget - Visible across all screens */}
              <GlobalCheckoutWidget />
            </ThemeProvider>
          </CartProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
