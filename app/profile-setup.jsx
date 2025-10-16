import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar,
  MapPin,
  Globe,
  Gift,
  CheckCircle 
} from 'lucide-react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

export default function ProfileSetupScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { phone } = useLocalSearchParams();

  const [step, setStep] = useState(1); // 1: Basic Info, 2: Preferences, 3: Location, 4: Complete
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    preferredLanguage: 'en',
    location: null
  });

  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0.25)).current;

  const languages = [
    { code: 'en', name: 'English', emoji: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', emoji: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', emoji: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', emoji: '🇮🇳' },
  ];

  const genders = [
    { value: 'male', label: 'Male', emoji: '👨' },
    { value: 'female', label: 'Female', emoji: '👩' },
    { value: 'other', label: 'Other', emoji: '🏳️‍⚧️' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say', emoji: '🤐' },
  ];

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateDateOfBirth = (date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 13 && age <= 120;
  };

  const handleNextStep = () => {
    if (step === 1) {
      // Validate basic info
      if (!formData.name.trim()) {
        Alert.alert('Required Field', 'Please enter your name');
        return;
      }
      if (!formData.email.trim() || !validateEmail(formData.email)) {
        Alert.alert('Invalid Email', 'Please enter a valid email address');
        return;
      }
    }

    if (step < 4) {
      // Animate to next step
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: (step + 1) * 0.25,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setStep(step + 1);
        slideAnim.setValue(300);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: (step - 1) * 0.25,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setStep(step - 1);
        slideAnim.setValue(-300);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else {
      router.back();
    }
  };

  const requestLocationPermission = async () => {
    try {
      setLoading(true);
      // Simulate location permission
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          location: {
            lat: 28.7041,
            lng: 77.1025,
            address: 'New Delhi, India'
          }
        }));
        setLoading(false);
        handleNextStep();
      }, 1000);
    } catch (error) {
      setLoading(false);
      console.error('Location error:', error);
      Alert.alert('Error', 'Could not get your location. You can add it later.');
      handleNextStep();
    }
  };

  const handleCompleteProfile = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        // Profile completed successfully
        handleNextStep(); // Go to success step
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error('Complete profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    router.replace('/(tabs)/home');
  };

  if (!fontsLoaded) {
    return null;
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text style={stepTitleStyle}>Tell us about yourself</Text>
            <Text style={stepSubtitleStyle}>
              We'll use this information to personalize your experience
            </Text>

            <View style={inputContainerStyle}>
              <User size={20} color="#8B5CF6" style={{ marginRight: 12 }} />
              <TextInput
                style={inputStyle}
                placeholder="Full Name"
                placeholderTextColor="#9CA3AF"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                autoCapitalize="words"
                autoFocus
              />
            </View>

            <View style={inputContainerStyle}>
              <Mail size={20} color="#8B5CF6" style={{ marginRight: 12 }} />
              <TextInput
                style={inputStyle}
                placeholder="Email Address"
                placeholderTextColor="#9CA3AF"
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={inputContainerStyle}>
              <Calendar size={20} color="#8B5CF6" style={{ marginRight: 12 }} />
              <TextInput
                style={inputStyle}
                placeholder="Date of Birth (DD/MM/YYYY)"
                placeholderTextColor="#9CA3AF"
                value={formData.dateOfBirth}
                onChangeText={(text) => {
                  // Format as DD/MM/YYYY
                  const formatted = text.replace(/\D/g, '').replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
                  setFormData(prev => ({ ...prev, dateOfBirth: formatted }));
                }}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View>
            <Text style={stepTitleStyle}>Personal Preferences</Text>
            <Text style={stepSubtitleStyle}>
              Help us customize your shopping experience
            </Text>

            <Text style={sectionTitleStyle}>Gender</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 }}>
              {genders.map((gender) => (
                <TouchableOpacity
                  key={gender.value}
                  onPress={() => setFormData(prev => ({ ...prev, gender: gender.value }))}
                  style={[
                    optionButtonStyle,
                    formData.gender === gender.value && selectedOptionStyle
                  ]}
                >
                  <Text style={{ fontSize: 16, marginRight: 8 }}>{gender.emoji}</Text>
                  <Text style={[
                    optionTextStyle,
                    formData.gender === gender.value && selectedOptionTextStyle
                  ]}>
                    {gender.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={sectionTitleStyle}>Preferred Language</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  onPress={() => setFormData(prev => ({ ...prev, preferredLanguage: lang.code }))}
                  style={[
                    optionButtonStyle,
                    formData.preferredLanguage === lang.code && selectedOptionStyle
                  ]}
                >
                  <Text style={{ fontSize: 16, marginRight: 8 }}>{lang.emoji}</Text>
                  <Text style={[
                    optionTextStyle,
                    formData.preferredLanguage === lang.code && selectedOptionTextStyle
                  ]}>
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View>
            <Text style={stepTitleStyle}>Location Access</Text>
            <Text style={stepSubtitleStyle}>
              Allow location access for accurate delivery and better local recommendations
            </Text>

            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: '#E5E7EB',
            }}>
              <MapPin size={24} color="#8B5CF6" style={{ alignSelf: 'center', marginBottom: 16 }} />
              <Text style={{
                fontSize: 16,
                fontFamily: 'Inter_600SemiBold',
                color: '#2D2D2D',
                textAlign: 'center',
                marginBottom: 8,
              }}>
                Enable Location Services
              </Text>
              <Text style={{
                fontSize: 14,
                fontFamily: 'Inter_400Regular',
                color: '#666666',
                textAlign: 'center',
                lineHeight: 20,
              }}>
                We'll use your location to show nearby stores, estimate delivery times, and provide personalized recommendations.
              </Text>
            </View>

            <TouchableOpacity
              onPress={requestLocationPermission}
              disabled={loading}
              style={primaryButtonStyle}
            >
              <Text style={primaryButtonTextStyle}>
                {loading ? 'Getting Location...' : 'Enable Location'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNextStep}
              style={{ padding: 16, alignItems: 'center' }}
            >
              <Text style={{
                fontSize: 14,
                fontFamily: 'Inter_500Medium',
                color: '#8B5CF6',
              }}>
                Skip for now
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 4:
        return (
          <View style={{ alignItems: 'center' }}>
            <CheckCircle size={64} color="#10B981" style={{ marginBottom: 24 }} />
            <Text style={stepTitleStyle}>Welcome to FreshCart!</Text>
            <Text style={stepSubtitleStyle}>
              Your profile is complete. You're ready to start shopping for fresh groceries.
            </Text>

            <View style={{
              backgroundColor: '#ECFDF5',
              borderRadius: 12,
              padding: 16,
              marginVertical: 24,
              borderWidth: 1,
              borderColor: '#D1FAE5',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Gift size={20} color="#10B981" style={{ marginRight: 8 }} />
                <Text style={{
                  fontSize: 16,
                  fontFamily: 'Inter_600SemiBold',
                  color: '#065F46',
                }}>
                  Welcome Bonus!
                </Text>
              </View>
              <Text style={{
                fontSize: 14,
                fontFamily: 'Inter_400Regular',
                color: '#065F46',
                lineHeight: 20,
              }}>
                You've earned 100 loyalty points for completing your profile. Use them on your first order!
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleFinish}
              style={primaryButtonStyle}
            >
              <Text style={primaryButtonTextStyle}>
                Start Shopping
              </Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F8F9FA' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
      }}>
        <TouchableOpacity
          onPress={handlePreviousStep}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#F8F9FA',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <ArrowLeft size={20} color="#2D2D2D" />
        </TouchableOpacity>

        {/* Progress Bar */}
        <View style={{
          height: 4,
          backgroundColor: '#E5E7EB',
          borderRadius: 2,
          marginBottom: 16,
        }}>
          <Animated.View style={{
            height: '100%',
            backgroundColor: '#8B5CF6',
            borderRadius: 2,
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }} />
        </View>

        <Text style={{
          fontSize: 14,
          fontFamily: 'Inter_500Medium',
          color: '#666666',
        }}>
          Step {step} of 4
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 32,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{
          transform: [{ translateX: slideAnim }],
        }}>
          {renderStep()}
        </Animated.View>
      </ScrollView>

      {/* Continue Button */}
      {step < 3 && (
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: insets.bottom + 16,
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
        }}>
          <TouchableOpacity
            onPress={step === 2 ? handleCompleteProfile : handleNextStep}
            disabled={loading}
            style={primaryButtonStyle}
          >
            <Text style={primaryButtonTextStyle}>
              {loading ? 'Setting up...' : step === 2 ? 'Complete Profile' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const stepTitleStyle = {
  fontSize: 24,
  fontFamily: 'Inter_700Bold',
  color: '#2D2D2D',
  marginBottom: 8,
};

const stepSubtitleStyle = {
  fontSize: 16,
  fontFamily: 'Inter_400Regular',
  color: '#666666',
  lineHeight: 22,
  marginBottom: 32,
};

const inputContainerStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#E5E7EB',
  paddingHorizontal: 16,
  paddingVertical: 16,
  marginBottom: 16,
};

const inputStyle = {
  flex: 1,
  fontSize: 16,
  fontFamily: 'Inter_500Medium',
  color: '#2D2D2D',
};

const sectionTitleStyle = {
  fontSize: 16,
  fontFamily: 'Inter_600SemiBold',
  color: '#2D2D2D',
  marginBottom: 12,
};

const optionButtonStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#E5E7EB',
  paddingHorizontal: 16,
  paddingVertical: 12,
  marginRight: 8,
  marginBottom: 8,
};

const selectedOptionStyle = {
  backgroundColor: '#EDE9FE',
  borderColor: '#8B5CF6',
};

const optionTextStyle = {
  fontSize: 14,
  fontFamily: 'Inter_500Medium',
  color: '#666666',
};

const selectedOptionTextStyle = {
  color: '#8B5CF6',
};

const primaryButtonStyle = {
  backgroundColor: '#8B5CF6',
  borderRadius: 12,
  paddingVertical: 16,
  alignItems: 'center',
};

const primaryButtonTextStyle = {
  fontSize: 16,
  fontFamily: 'Inter_600SemiBold',
  color: '#FFFFFF',
};
