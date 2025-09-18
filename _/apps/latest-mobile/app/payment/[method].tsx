import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Animated,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export default function PaymentScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { method, orderId, amount, userId } = useLocalSearchParams();

  const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, processing, success, failed
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [paymentData, setPaymentData] = useState<any>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Start pulse animation for pending payments
    if (paymentStatus === "pending" || paymentStatus === "processing") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [paymentStatus]);

  // Timer countdown
  useEffect(() => {
    if (paymentStatus === "pending" || paymentStatus === "processing") {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setPaymentStatus("failed");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [paymentStatus]);

  // Create payment intent
  const createPaymentMutation = async () => {
    try {
      // Mock payment data for demonstration
      setPaymentData({
        transactionId: 'TXN_' + Date.now(),
        upiLink: 'upi://pay?pa=merchant@upi&pn=CreateXYZ&am=' + amount + '&tn=Order%20' + orderId,
        deepLink: 'upi://pay?pa=merchant@upi&pn=CreateXYZ&am=' + amount + '&tn=Order%20' + orderId,
        paymentUrl: 'https://payment.example.com/pay?order=' + orderId,
        qrCode: 'upi://pay?pa=merchant@upi&pn=CreateXYZ&am=' + amount + '&tn=Order%20' + orderId,
      });
      setPaymentStatus("pending");
    } catch (error) {
      Alert.alert("Error", "Failed to create payment");
      router.back();
    }
  };

  // Check payment status
  const checkPaymentStatus = async () => {
    try {
      // Mock status check - in real app this would call the API
      const statuses = ["pending", "processing", "success"];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setPaymentStatus(randomStatus);
    } catch (error) {
      console.error("Error checking payment status:", error);
    }
  };

  useEffect(() => {
    if (method && orderId && amount) {
      createPaymentMutation();
    }
  }, [method, orderId, amount]);

  // Auto-check payment status every 5 seconds
  useEffect(() => {
    if (paymentData && (paymentStatus === "pending" || paymentStatus === "processing")) {
      const statusChecker = setInterval(() => {
        checkPaymentStatus();
      }, 5000);

      return () => clearInterval(statusChecker);
    }
  }, [paymentData, paymentStatus]);

  const handleCopyUPI = async () => {
    if (paymentData?.upiLink) {
      Alert.alert("Copied", "UPI link copied to clipboard");
    }
  };

  const handleOpenUPIApp = () => {
    if (paymentData?.deepLink) {
      Linking.openURL(paymentData.deepLink).catch(() => {
        Alert.alert("Error", "Unable to open UPI app. Please copy the UPI link instead.");
      });
    } else if (paymentData?.paymentUrl) {
      Linking.openURL(paymentData.paymentUrl).catch(() => {
        Alert.alert("Error", "Unable to open payment page");
      });
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getPaymentMethodInfo = () => {
    switch (method) {
      case "upi":
        return { name: "UPI", icon: "🏦", color: "#FF6B35" };
      case "phonepe":
        return { name: "PhonePe", icon: "Pe", color: "#7C3AED" };
      case "googlepay":
        return { name: "Google Pay", icon: "G", color: "#4285F4" };
      case "paytm":
        return { name: "Paytm", icon: "Py", color: "#3B82F6" };
      default:
        return { name: "Payment", icon: "💳", color: "#8B5CF6" };
    }
  };

  const paymentMethodInfo = getPaymentMethodInfo();

  if (!fontsLoaded) {
    return null;
  }

  if (!paymentData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Setting up payment...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#2D2D2D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Pay with {paymentMethodInfo.name}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Payment Status */}
        <Animated.View style={[styles.statusCard, { transform: [{ scale: pulseAnim }] }]}>
          {paymentStatus === "pending" && (
            <>
              <Clock size={48} color="#F59E0B" />
              <Text style={styles.statusTitle}>Waiting for Payment</Text>
              <Text style={styles.statusSubtitle}>
                Complete your payment to proceed
              </Text>
              <Text style={styles.timer}>
                Time remaining: {formatTime(timeRemaining)}
              </Text>
            </>
          )}

          {paymentStatus === "processing" && (
            <>
              <ActivityIndicator size={48} color="#8B5CF6" />
              <Text style={styles.statusTitle}>Processing Payment</Text>
              <Text style={styles.statusSubtitle}>
                Please wait while we confirm your payment
              </Text>
            </>
          )}

          {paymentStatus === "success" && (
            <>
              <CheckCircle size={48} color="#10B981" />
              <Text style={[styles.statusTitle, { color: "#10B981" }]}>
                Payment Successful!
              </Text>
              <Text style={styles.statusSubtitle}>
                Your order has been confirmed
              </Text>
            </>
          )}

          {paymentStatus === "failed" && (
            <>
              <XCircle size={48} color="#EF4444" />
              <Text style={[styles.statusTitle, { color: "#EF4444" }]}>
                Payment Failed
              </Text>
              <Text style={styles.statusSubtitle}>
                Please try again or choose a different payment method
              </Text>
            </>
          )}
        </Animated.View>

        {/* Payment Details */}
        <View style={styles.paymentCard}>
          <Text style={styles.amountLabel}>Amount to Pay</Text>
          <Text style={styles.amount}>₹{parseFloat(amount as string).toFixed(2)}</Text>
          <Text style={styles.orderId}>Order ID: {orderId}</Text>
        </View>

        {/* QR Code for UPI */}
        {method === "upi" && paymentData?.qrCode && (
          <View style={styles.qrCard}>
            <Text style={styles.qrTitle}>Scan QR Code</Text>
            <Image
              source={{
                uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentData.qrCode)}`,
              }}
              style={styles.qrCode}
            />
            <Text style={styles.qrSubtitle}>
              Open any UPI app and scan this QR code
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        {(paymentStatus === "pending" || paymentStatus === "processing") && (
          <View style={styles.actionButtons}>
            {paymentData?.deepLink && (
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: paymentMethodInfo.color }]}
                onPress={handleOpenUPIApp}
              >
                <ExternalLink size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>
                  Open {paymentMethodInfo.name}
                </Text>
              </TouchableOpacity>
            )}

            {method === "upi" && paymentData?.upiLink && (
              <TouchableOpacity style={styles.secondaryButton} onPress={handleCopyUPI}>
                <Copy size={20} color="#8B5CF6" />
                <Text style={styles.secondaryButtonText}>Copy UPI Link</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={() => checkPaymentStatus()}
            >
              <RefreshCw size={20} color="#6B7280" />
              <Text style={styles.refreshButtonText}>Check Status</Text>
            </TouchableOpacity>
          </View>
        )}

        {paymentStatus === "success" && (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: "#10B981" }]}
            onPress={() => router.replace(`/order-confirmation/${orderId}`)}
          >
            <Text style={styles.primaryButtonText}>View Order</Text>
          </TouchableOpacity>
        )}

        {paymentStatus === "failed" && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: "#8B5CF6" }]}
              onPress={() => createPaymentMutation()}
            >
              <Text style={styles.primaryButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.back()}
            >
              <Text style={styles.secondaryButtonText}>Change Method</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: "#6B7280",
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  statusSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    textAlign: "center",
  },
  timer: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#F59E0B",
    marginTop: 12,
  },
  paymentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#6B7280",
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 8,
  },
  orderId: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },
  qrCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  qrTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    marginBottom: 16,
  },
  qrCode: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  qrSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    textAlign: "center",
  },
  actionButtons: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#8B5CF6",
    marginLeft: 8,
  },
  refreshButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  refreshButtonText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#6B7280",
    marginLeft: 8,
  },
});
