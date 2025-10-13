import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    useFonts,
} from "@expo-google-fonts/inter";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
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
import { CartItemsList } from "../components/checkout/CartItemsList";
import { SimilarProducts } from "../components/checkout/SimilarProducts";
import { AddressModal, AddressInput } from "../components/checkout/AddressModal";
import { PaymentOptions, PaymentMethod } from "../components/checkout/PaymentOptions";
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
    selectedSubOption,
    setSelectedSubOption,
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
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [localPayment, setLocalPayment] = useState<PaymentMethod>("cod");
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  const lineItems = (cartItems || []).map((it) => ({
    id: it.id,
    quantity: Number(it.quantity || 1),
    product: {
      name: it.product?.name,
      images: it.product?.images,
      price: Number(it.product?.price || it.variation?.price || 0),
      category: it.product?.category,
    },
    variation: {
      name: it.variation?.name,
      price: Number(it.variation?.price || it.product?.price || 0),
      mrp: Number(it.variation?.mrp || 0),
    },
  }));

  // Local editable copy for +/-/remove controls on checkout
  const [editableItems, setEditableItems] = useState(lineItems);
  const [hasUserEdited, setHasUserEdited] = useState(false);
  // Avoid update loops by only syncing when content actually changes
  const shallowEqualByIdQty = (a: typeof lineItems, b: typeof lineItems) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if ((a[i].id || i) !== (b[i].id || i)) return false;
      if ((a[i].quantity || 0) !== (b[i].quantity || 0)) return false;
    }
    return true;
  };
  useEffect(() => {
    if (hasUserEdited) return; // don't overwrite user's local edits
    if (!shallowEqualByIdQty(editableItems, lineItems)) {
      setEditableItems(lineItems);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, hasUserEdited]);

  // TODO: Wire to backend endpoints when available; for now no-op handlers
  const handleIncrease = (idx: number) => {
    console.log('++ increase item idx', idx);
    setHasUserEdited(true);
    setEditableItems((prev) => prev.map((it, i) => i === idx ? { ...it, quantity: (it.quantity || 1) + 1 } : it));
  };
  const handleDecrease = (idx: number) => {
    console.log('-- decrease item idx', idx);
    setHasUserEdited(true);
    setEditableItems((prev) => {
      const next = [...prev];
      const target = next[idx];
      if (!target) return prev;
      const currentQty = Number(target.quantity || 1);
      if (currentQty <= 1) {
        // Remove the item instead of showing 0
        next.splice(idx, 1);
        return next;
      }
      next[idx] = { ...target, quantity: currentQty - 1 };
      return next;
    });
  };
  const handleRemove = (idx: number) => {
    console.log('xx remove item idx', idx);
    setHasUserEdited(true);
    setEditableItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const editedSubtotal = editableItems.reduce((sum, it) => sum + ((it.variation?.price || it.product?.price || 0) * (it.quantity || 1)), 0);
  const editedTotal = editedSubtotal + deliveryFee - discount;

  // Authentication protection - redirect to welcome if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to welcome screen");
      router.replace("/welcome");
      return;
    }
  }, [isAuthenticated, router]);

  // Ensure selected payment method used by placeOrder reflects UI choice
  useEffect(() => {
    setSelectedPaymentMethod(localPayment);
  }, [localPayment]);

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
    <>
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
        {/* 1) Cart items first */}
        <CartItemsList items={editableItems} onIncrease={handleIncrease} onDecrease={handleDecrease} onRemove={handleRemove} />

        {/* 2) Missed something? actions with related products */}
        <SimilarProducts
          basedOnCategory={(lineItems?.[0]?.product?.category as any) || undefined}
          onAddMore={() => router.push("/(tabs)/home")}
          onSeeAll={() => router.push("/(tabs)/search")}
        />
        
        {/* 3) Order summary (bill) */}
        <OrderSummary
          cartItems={editableItems}
          subtotal={editedSubtotal}
          deliveryFee={deliveryFee}
          discount={discount}
          total={editedTotal}
          savings={savings}
          chargestag={chargestag}
        />

        {/* 4) Address and delivery details (after cart/bill) */}
        <AddressSection
          addresses={addresses}
          selectedAddress={selectedAddress}
          onSelectAddress={setSelectedAddress}
        />
        {!selectedAddress && (
          <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
            <TouchableOpacity onPress={() => setAddressModalVisible(true)} style={{ backgroundColor: "#8B5CF6", paddingVertical: 14, borderRadius: 12, alignItems: "center" }}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Add Delivery Address</Text>
            </TouchableOpacity>
          </View>
        )}
        <DeliverySlotSection
          deliverySlots={deliverySlots}
          selectedDeliverySlot={selectedDeliverySlot}
          onSelectSlot={setSelectedDeliverySlot}
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
      </ScrollView>

      <PlaceOrderButton
        onPlaceOrder={() => {
          if (!selectedAddress) {
            setAddressModalVisible(true);
            return;
          }
          setPaymentModalVisible(true);
        }}
        isPlacingOrder={placeOrderMutation.isPending}
        total={editedTotal}
        label="Click to Pay"
        disabled={!selectedDeliverySlot}
      />
    </Animated.View>

    <AddressModal
      visible={addressModalVisible}
      onClose={() => setAddressModalVisible(false)}
      onSave={(addr: AddressInput) => setSelectedAddress(addr as any)}
    />

    {/* Payment method modal shown only after user taps Click to Pay */}
    <Modal visible={paymentModalVisible} animationType="slide" transparent onRequestClose={() => setPaymentModalVisible(false)}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}>
        <View style={{ backgroundColor: "#FFFFFF", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12 }}>Choose payment method</Text>
          <PaymentOptions selected={localPayment} onSelect={setLocalPayment} />
          <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
            <TouchableOpacity onPress={() => setPaymentModalVisible(false)} style={{ paddingVertical: 12, paddingHorizontal: 16, marginRight: 12 }}>
              <Text style={{ color: "#6B7280" }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSelectedPaymentMethod(localPayment);
                setPaymentModalVisible(false);
                placeOrderMutation.mutate();
              }}
              style={{ backgroundColor: "#8B5CF6", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16 }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  </>
  );
}
