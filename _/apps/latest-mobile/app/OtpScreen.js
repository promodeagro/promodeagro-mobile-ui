// React Native OTP Auto Fill Screen
// - Android: Uses react-native-sms-retriever (no SMS read permission required)
// - iOS: Uses native SMS AutoFill via textContentType="oneTimeCode"
//
// Notes:
// - Works in bare React Native. For Expo, this works in a Development Build (EAS) or when prebuilt; classic Expo Go may not load native modules by default.
// - Android does not require RECEIVE_SMS permission when using the SMS Retriever API.
// - You should include your app hash in the SMS so Android can surface the OTP automatically.
//
// Example backend SMS format (Android):
// <#> Your Promode Agro OTP is 123456. It is valid for 10 minutes.
// DO NOT SHARE THIS CODE WITH ANYONE.
// AB12CD3
// Where the last line (AB12CD3) is the app hash from SmsRetriever.getAppHash().

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

// Import safely to avoid bundling errors on iOS/web when the native module isn't available
let SmsRetriever = null;
if (Platform.OS === 'android') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    SmsRetriever = require('react-native-sms-retriever');
  } catch (e) {
    // Fallback: library not available (e.g., classic Expo Go). The screen still works with manual entry.
    SmsRetriever = null;
  }
}

const OTP_LENGTH = 6; // supports 4–6

export default function OtpScreen() {
  const [otp, setOtp] = useState('');
  const listenerRef = useRef(null);

  const extractOtpFromMessage = useCallback((message) => {
    if (!message || typeof message !== 'string') return '';
    const match = message.match(/\b(\d{4,6})\b/);
    return match ? match[1] : '';
  }, []);

  const startAndroidSmsListener = useCallback(async () => {
    if (Platform.OS !== 'android' || !SmsRetriever) return;
    try {
      // Log app hash so backend can append it to the SMS template
      const hash = await SmsRetriever.getAppHash();
      console.log('[OTP] App hash:', hash);

      // Start listening
      const started = await SmsRetriever.startSmsRetriever();
      console.log('[OTP] startSmsRetriever:', started);

      if (started) {
        listenerRef.current = SmsRetriever.addSmsListener((event) => {
          const message = event?.message || '';
          console.log('[OTP] SMS received:', message);
          const code = extractOtpFromMessage(message);
          if (code) {
            setOtp(code);
            // Stop listening after success
            try {
              listenerRef.current?.remove && listenerRef.current.remove();
              listenerRef.current = null;
            } catch (_) {}
          }
        });
      }
    } catch (err) {
      console.warn('[OTP] SMS Retriever error:', err);
    }
  }, [extractOtpFromMessage]);

  useEffect(() => {
    // Initialize Android SMS retriever when the screen mounts
    startAndroidSmsListener();
    return () => {
      // Cleanup listener on unmount
      try {
        listenerRef.current?.remove && listenerRef.current.remove();
        listenerRef.current = null;
      } catch (_) {}
    };
  }, [startAndroidSmsListener]);

  const handleChange = (val) => {
    // Accept only digits and trim to max length
    const digits = String(val).replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtp(digits);
  };

  const handleSubmit = () => {
    if (otp.length < 4) {
      Alert.alert('Invalid OTP', 'Please enter the 4–6 digit code.');
      return;
    }
    // TODO: call your verify endpoint here
    Alert.alert('OTP Entered', `Code: ${otp}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>We sent an SMS with your verification code.</Text>

      <TextInput
        value={otp}
        onChangeText={handleChange}
        style={styles.input}
        placeholder="Enter code"
        placeholderTextColor="#9CA3AF"
        keyboardType="number-pad"
        maxLength={OTP_LENGTH}
        textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : 'none'}
        autoComplete={Platform.OS === 'ios' ? 'one-time-code' : 'off'}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      <Text style={styles.helper}>
        On Android, the code will auto-fill when the SMS arrives. On iOS, use the SMS AutoFill
        suggestion above the keyboard.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    fontSize: 18,
    color: '#111827',
    letterSpacing: 4,
    textAlign: 'center',
  },
  helper: {
    marginTop: 12,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});

// Android Manifest note:
// - The SMS Retriever API does not require SMS read permissions.
// - Ensure your backend SMS includes the app hash from SmsRetriever.getAppHash().
// - If building with Expo, you need a Development Build or prebuild (expo prebuild) to use native modules.


