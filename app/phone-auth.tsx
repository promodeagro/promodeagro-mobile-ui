import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    useFonts,
} from "@expo-google-fonts/inter";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Phone, Shield } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from 'react-redux';
import status from '../store/Constants';
import { clearErrors } from '../store/Signin/SigninSlice';
import { signIn, validateOtp } from '../store/Signin/SigninThunk';

export default function PhoneAuthScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Redux state - exactly like PWA
  const { loginData, validateOtpRes, isAuthenticated } = useSelector((state) => state.login);

  const [step, setStep] = useState("phone"); // 'phone' or 'otp'
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSubmitMobOrEmail, setSubmitMobOrEmail] = useState(false);
  const [isOtpSubmitted, setOtpSubmitted] = useState(false);
  const [timer, setTimer] = useState(30);
  const [isActive, setIsActive] = useState(false);

  const otpRefs = useRef([]);
  const fadeAnim = useRef(new Animated.Value(1));
  const slideAnim = useRef(new Animated.Value(0));

  // Timer for OTP resend - exactly like PWA
  useEffect(() => {
    let interval = null;

    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      clearInterval(interval);
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, timer]);

  // Handle login response - exactly like PWA
  useEffect(() => {
    if (loginData.status === status.SUCCESS && isSubmitMobOrEmail) {
      if (loginData.data) {
        setSubmitMobOrEmail(false);
        if (loginData.data.statusCode === 200) {
          resetTimer();
          setStep("otp");
        } else if (loginData.data.message) {
          Alert.alert("Error", loginData.data.message);
        }
      }
    }
  }, [loginData, isSubmitMobOrEmail]);

  // Handle OTP validation response - exactly like PWA
  useEffect(() => {
    if (validateOtpRes.status === status.SUCCESS && isOtpSubmitted) {
      if (validateOtpRes?.data) {
        setOtpSubmitted(false);
        if (validateOtpRes?.data?.statusCode === 200) {
          // Authentication successful, navigate to home
          router.replace("/(tabs)/home");
        } else if (validateOtpRes?.data?.message) {
          Alert.alert("Error", validateOtpRes?.data?.message);
        }
      }
    }
  }, [validateOtpRes, isOtpSubmitted]);

  // Navigate to home if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)/home");
    }
  }, [isAuthenticated, router]);

  const resetTimer = () => {
    setTimer(30);
    setIsActive(true);
  };

  const formatPhoneNumber = (input) => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, "");

    // Format as +91 XXXXX XXXXX
    if (digits.length <= 10) {
      return digits.replace(/(\d{5})(\d{0,5})/, "$1 $2").trim();
    }
    return digits.slice(0, 10).replace(/(\d{5})(\d{5})/, "$1 $2");
  };

  const validatePhoneNumber = (phoneNumber) => {
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    return /^[6-9]\d{9}$/.test(cleanPhone);
  };

  const handleSendOTP = async () => {
    if (!validatePhoneNumber(phone)) {
      Alert.alert(
        "Invalid Number",
        "Please enter a valid 10-digit mobile number",
      );
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    dispatch(clearErrors());
    setSubmitMobOrEmail(true);
    
    // Dispatch signIn action exactly like PWA
    dispatch(signIn({ mobileNumber: cleanPhone }));
  };

  const autoFillOTP = (otpString) => {
    const otpArray = otpString.split("");
    setOtp(otpArray);
    setTimeout(() => handleVerifyOTP(otpArray), 500);
  };

  const handleOTPChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (newOtp.every((digit) => digit !== "") && newOtp.join("").length === 6) {
      setTimeout(() => handleVerifyOTP(newOtp), 500);
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpArray = otp) => {
    const otpString = otpArray.join("");
    if (otpString.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter all 6 digits");
      return;
    }

    dispatch(clearErrors());
    setOtpSubmitted(true);
    
    const cleanPhone = phone.replace(/\D/g, "");
    
    // Dispatch validateOtp action exactly like PWA
    dispatch(validateOtp({
      mobileNumber: cleanPhone,
      otp: otpString,
    }));
  };

  const handleResendOTP = () => {
    setOtp(["", "", "", "", "", ""]);
    handleSendOTP();
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F8F9FA" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 20,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
        }}
      >
        <TouchableOpacity
          onPress={() => (step === "otp" ? setStep("phone") : router.back())}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#F8F9FA",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <ArrowLeft size={20} color="#2D2D2D" />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 24,
            fontFamily: "Inter_700Bold",
            color: "#2D2D2D",
            marginBottom: 8,
          }}
        >
          {step === "phone" ? "Enter your mobile number" : "Verify your number"}
        </Text>

        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: "#666666",
            lineHeight: 22,
          }}
        >
          {step === "phone"
            ? "We'll send you a verification code to confirm your number"
            : `We've sent a 6-digit code to +91 ${formatPhoneNumber(phone)}`}
        </Text>
      </View>

      <Animated.View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          paddingTop: 32,
                  transform: [{ translateX: slideAnim.current }],
        opacity: fadeAnim.current,
        }}
      >
        {step === "phone" ? (
          // Phone Number Input
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                paddingHorizontal: 16,
                paddingVertical: 16,
                marginBottom: 24,
              }}
            >
              <Phone size={20} color="#8B5CF6" style={{ marginRight: 12 }} />
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_500Medium",
                  color: "#2D2D2D",
                  marginRight: 8,
                }}
              >
                +91
              </Text>
              <TextInput
                style={{
                  flex: 1,
                  fontSize: 16,
                  fontFamily: "Inter_500Medium",
                  color: "#2D2D2D",
                }}
                placeholder="Enter mobile number"
                placeholderTextColor="#9CA3AF"
                value={formatPhoneNumber(phone)}
                onChangeText={(text) => setPhone(text.replace(/\D/g, ""))}
                keyboardType="phone-pad"
                maxLength={11} // 5 + space + 5
                autoFocus
              />
            </View>

            <TouchableOpacity
              onPress={handleSendOTP}
              disabled={loginData.status === status.IN_PROGRESS || !validatePhoneNumber(phone)}
              style={{
                backgroundColor: validatePhoneNumber(phone)
                  ? "#8B5CF6"
                  : "#E5E7EB",
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: validatePhoneNumber(phone) ? "#FFFFFF" : "#9CA3AF",
                }}
              >
                {loginData.status === status.IN_PROGRESS ? "Sending OTP..." : "Send OTP"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // OTP Input
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 32,
              }}
            >
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (otpRefs.current[index] = ref)}
                  style={{
                    width: 48,
                    height: 56,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: digit ? "#8B5CF6" : "#E5E7EB",
                    textAlign: "center",
                    fontSize: 20,
                    fontFamily: "Inter_600SemiBold",
                    color: "#2D2D2D",
                  }}
                  value={digit}
                  onChangeText={(value) => handleOTPChange(value, index)}
                  onKeyPress={(event) => handleKeyPress(event, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={() => handleVerifyOTP()}
              disabled={validateOtpRes.status === status.IN_PROGRESS || otp.some((digit) => digit === "")}
              style={{
                backgroundColor: otp.every((digit) => digit !== "")
                  ? "#8B5CF6"
                  : "#E5E7EB",
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: otp.every((digit) => digit !== "")
                    ? "#FFFFFF"
                    : "#9CA3AF",
                }}
              >
                {validateOtpRes.status === status.IN_PROGRESS ? "Verifying..." : "Verify OTP"}
              </Text>
            </TouchableOpacity>

            {/* Resend OTP */}
            <View style={{ alignItems: "center" }}>
              {isActive && timer > 0 ? (
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_500Medium",
                    color: "#666666",
                  }}
                >
                  Resend OTP in {timer}s
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={handleResendOTP}
                  disabled={loginData.status === status.IN_PROGRESS}
                  style={{ padding: 8 }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_600SemiBold",
                      color: "#8B5CF6",
                    }}
                  >
                    Resend OTP
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Security Notice */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            backgroundColor: "#EDE9FE",
            borderRadius: 12,
            padding: 16,
            marginTop: "auto",
            marginBottom: insets.bottom + 20,
          }}
        >
          <Shield
            size={20}
            color="#8B5CF6"
            style={{ marginRight: 12, marginTop: 2 }}
          />
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: "#6B46C1",
              lineHeight: 20,
              flex: 1,
            }}
          >
            Your mobile number is secured with end-to-end encryption and will
            only be used for order updates and account security.
          </Text>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
