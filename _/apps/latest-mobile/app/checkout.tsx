import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    useFonts,
} from "@expo-google-fonts/inter";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import { Animated, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { AddressSection } from "../components/checkout/AddressSection";
import { CheckoutHeader } from "../components/checkout/CheckoutHeader";
import { CheckoutLoader } from "../components/checkout/CheckoutLoader";
import { CouponSection } from "../components/checkout/CouponSection";
import { DeliveryInstructionsSection } from "../components/checkout/DeliveryInstructionsSection";
import { DeliverySlotSection } from "../components/checkout/DeliverySlotSection";
import { OrderSummary } from "../components/checkout/OrderSummary";
import { PaymentMethodSection } from "../components/checkout/PaymentMethodSection";
import { PlaceOrderButton } from "../components/checkout/PlaceOrderButton";
import { useCheckout } from "../hooks/useCheckout";

export default function CheckoutScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Get authentication state from Redux
  const { isAuthenticated } = useSelector((state) => state?.login || {
    isAuthenticated: false
  });
  const {
    user,
    cartItems,
    subtotal,
    deliveryFee,
    savings,
    discount,
    total,
    addresses,
    selectedAddress,
    setSelectedAddress,
    deliverySlots,
    selectedDeliverySlot,
    setSelectedDeliverySlot,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    couponCode,
    setCouponCode,
    appliedCoupon,
    setAppliedCoupon,
    applyCouponMutation,
    placeOrderMutation,
    isLoading,
    chargestag,
  } = useCheckout();

  const fadeAnim = useRef(new Animated.Value(0));

  // Authentication protection - redirect to welcome if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to welcome screen");
      router.replace("/welcome");
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isLoading) {
      Animated.timing(fadeAnim.current, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading]);

  if (!fontsLoaded || isLoading || !user) {
    return <CheckoutLoader />;
  }

  return (
    <Animated.View
      style={{ flex: 1, backgroundColor: "#F8F9FA", opacity: fadeAnim.current }}
    >
      <StatusBar style="dark" />
      <CheckoutHeader />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <AddressSection
          addresses={addresses}
          selectedAddress={selectedAddress}
          onSelectAddress={setSelectedAddress}
        />
        <DeliverySlotSection
          deliverySlots={deliverySlots}
          selectedDeliverySlot={selectedDeliverySlot}
          onSelectSlot={setSelectedDeliverySlot}
        />
        <PaymentMethodSection
          selectedPaymentMethod={selectedPaymentMethod}
          onSelectPaymentMethod={setSelectedPaymentMethod}
        />
        <CouponSection
          appliedCoupon={appliedCoupon}
          discount={discount}
          onRemoveCoupon={() => setAppliedCoupon(null)}
          couponCode={couponCode}
          onCouponCodeChange={setCouponCode}
          onApplyCoupon={applyCouponMutation.mutate}
          isApplyingCoupon={applyCouponMutation.isPending}
        />
        <DeliveryInstructionsSection />
        <OrderSummary
          cartItems={cartItems}
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          discount={discount}
          total={total}
          savings={savings}
          chargestag={chargestag}
        />
      </ScrollView>

      <PlaceOrderButton
        onPlaceOrder={placeOrderMutation.mutate}
        isPlacingOrder={placeOrderMutation.isPending}
        total={total}
        disabled={(() => {
          const isDisabled = !selectedAddress || !selectedDeliverySlot || !selectedPaymentMethod;
          console.log("=== BUTTON DISABLED CHECK ===");
          console.log("selectedAddress:", !!selectedAddress);
          console.log("selectedDeliverySlot:", !!selectedDeliverySlot);
          console.log("selectedPaymentMethod:", !!selectedPaymentMethod);
          console.log("isDisabled:", isDisabled);
          return isDisabled;
        })()}
      />
    </Animated.View>
  );
}
