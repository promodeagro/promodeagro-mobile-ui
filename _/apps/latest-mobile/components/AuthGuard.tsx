import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    useFonts,
} from '@expo-google-fonts/inter';
import { useRouter } from 'expo-router';
import { ArrowRight, Lock, Shield } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Get authentication state from Redux
  const { isAuthenticated, validateOtpRes } = useSelector((state: any) => state.login);
  const isLoading = validateOtpRes.status === 0; // IN_PROGRESS

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#F8FAFC'
      }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={{
          fontSize: 16,
          fontFamily: 'Inter_500Medium',
          color: '#6B7280',
          marginTop: 16,
        }}>
          Checking authentication...
        </Text>
      </View>
    );
  }

  // If not authenticated, show auth required screen
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: '#F8FAFC',
        paddingTop: insets.top + 20,
        paddingHorizontal: 24,
        justifyContent: 'center',
      }}>
        {/* Icon */}
        <View style={{
          width: 80,
          height: 80,
          backgroundColor: '#EDE9FE',
          borderRadius: 40,
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
          marginBottom: 32,
        }}>
          <Lock size={32} color="#8B5CF6" />
        </View>

        {/* Title */}
        <Text style={{
          fontSize: 24,
          fontFamily: 'Inter_700Bold',
          color: '#111827',
          textAlign: 'center',
          marginBottom: 12,
        }}>
          Authentication Required
        </Text>

        {/* Subtitle */}
        <Text style={{
          fontSize: 16,
          fontFamily: 'Inter_400Regular',
          color: '#6B7280',
          textAlign: 'center',
          lineHeight: 24,
          marginBottom: 48,
        }}>
          Please sign in with your mobile number to access your orders and account information.
        </Text>

        {/* Features */}
        <View style={{ marginBottom: 40 }}>
          {[
            { icon: Shield, text: "Secure mobile number verification" },
            { icon: Lock, text: "Protected account information" },
          ].map((feature, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
                paddingHorizontal: 16,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: "#EDE9FE",
                  borderRadius: 20,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 16,
                }}
              >
                <feature.icon size={20} color="#8B5CF6" />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_500Medium",
                  color: "#374151",
                  flex: 1,
                }}
              >
                {feature.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          onPress={() => router.push('/auth')}
          style={{
            backgroundColor: '#8B5CF6',
            borderRadius: 16,
            paddingVertical: 18,
            paddingHorizontal: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            shadowColor: '#8B5CF6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text style={{
            fontSize: 18,
            fontFamily: 'Inter_600SemiBold',
            color: '#FFFFFF',
            marginRight: 8,
          }}>
            Sign In
          </Text>
          <ArrowRight size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Continue as Guest */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: '#F3F4F6',
            borderRadius: 16,
            paddingVertical: 18,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#E5E7EB',
          }}
        >
          <Text style={{
            fontSize: 16,
            fontFamily: 'Inter_600SemiBold',
            color: '#6B7280',
          }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // If authenticated, render children
  return <>{children}</>;
};

export default AuthGuard;
