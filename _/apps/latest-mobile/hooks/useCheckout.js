import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, AppState, Linking } from "react-native";
import * as WebBrowser from 'expo-web-browser';
import * as LinkingExpo from 'expo-linking';
import { useDispatch, useSelector } from 'react-redux';
import { apiService } from "../config/api";
import { setSelectedAddress } from "../store/Address/AddressSlice";
import { useCart } from "../utils/CartContext";

export function useCheckout() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Get real user data from Redux
  const { user, isAuthenticated } = useSelector((state) => state.login);
  const { selectedAddress } = useSelector((state) => state.address);
  const userId = user?.id || user?.userId;
  
  // Get cart functions
  const { clearCart } = useCart();
  const appStateRef = useRef(AppState.currentState);
  const pendingOrderIdRef = useRef(null);

  // Helper: verify payment for a pending order and navigate if paid
  const verifyPendingPayment = async () => {
    try {
      if (!pendingOrderIdRef.current) return false;
      const latest = await apiService.getOrderById(pendingOrderIdRef.current);
      const paid = latest?.payment_status === 'completed' || latest?.status === 'confirmed' || latest?.status === 'paid';
      if (paid) {
        clearCart();
        router.replace(`/order-confirmation/${pendingOrderIdRef.current}`);
        pendingOrderIdRef.current = null;
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Payment verification failed:', e?.message || e);
      return false;
    }
  };

  // Helper: poll server a few times to catch delayed PSP notifications
  const pollPaymentStatus = async (attempts = 6, intervalMs = 4000) => {
    for (let i = 0; i < attempts; i++) {
      const ok = await verifyPendingPayment();
      if (ok) return true;
      await new Promise(res => setTimeout(res, intervalMs));
    }
    return false;
  };

  // Use Redux selectedAddress instead of local state
  const updateSelectedAddress = (address) => dispatch(setSelectedAddress(address));
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cod");
  const [selectedSubOption, setSelectedSubOption] = useState("");
  const [selectedDeliverySlot, setSelectedDeliverySlot] = useState(null);
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [cartData, setCartData] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [deliverySlots, setDeliverySlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Fetch addresses and cart data from API when user is authenticated
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchAddresses();
      fetchCartData();
    }
  }, [isAuthenticated, userId]);

  // Fetch cart data and delivery slots when selected address changes
  useEffect(() => {
    if (selectedAddress) {
      fetchCartData();
      fetchDeliverySlots();
    }
  }, [selectedAddress]);

  const fetchAddresses = async () => {
    if (!userId) {
      console.warn("Cannot fetch addresses: No user ID available");
      setAddressesLoading(false);
      return;
    }

    try {
      setAddressesLoading(true);
      console.log("Fetching addresses for user ID:", userId);
      const data = await apiService.fetchAllAddresses(userId);
      
      // Transform API data to match the expected format
      const transformedAddresses = data.addresses.map(addr => ({
        id: addr.addressId,
        name: addr.name,
        phone: addr.phoneNumber,
        address: `${addr.house_number}, ${addr.address}`,
        landmark: addr.landmark_area,
        zipCode: addr.zipCode,
        address_type: addr.address_type,
        is_default: addr.addressId === data.defaultAddressId
      }));
      
      setAddresses(transformedAddresses);
      
      // Auto-select default address if available
      const defaultAddr = transformedAddresses.find(addr => addr.is_default);
      if (defaultAddr) {
        updateSelectedAddress(defaultAddr);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      // Fallback to empty array if API fails
      setAddresses([]);
    } finally {
      setAddressesLoading(false);
    }
  };

  const fetchCartData = async () => {
    if (!userId) {
      console.warn("Cannot fetch cart data: No user ID available");
      setCartLoading(false);
      return;
    }

    if (!selectedAddress?.id) {
      console.log("Skipping cart fetch: no selected address yet");
      setCartData(null);
      setCartLoading(false);
      return;
    }

    try {
      setCartLoading(true);
      console.log("Fetching cart data for user ID:", userId);
      const addressId = selectedAddress.id;
      const data = await apiService.getCartItems(userId, addressId);
      setCartData(data);
    } catch (error) {
      console.error('Error fetching cart data:', error);
      setCartData(null);
    } finally {
      setCartLoading(false);
    }
  };

  const fetchDeliverySlots = async () => {
    if (!selectedAddress?.zipCode) {
      console.log('No pincode available for selected address');
      return;
    }

    try {
      setSlotsLoading(true);
      console.log('Fetching delivery slots for pincode:', selectedAddress.zipCode);
      const response = await apiService.getDeliverySlots(selectedAddress.zipCode);
      console.log('Delivery slots API response:', response);
      
      if (response.slots && response.slots.length > 0) {
        const slotsData = response.slots[0]; // Get the first slot group
        
        // Transform API data to match expected format
        const transformedSlots = [];
        
        // Process nextDaySlots
        if (slotsData.nextDaySlots) {
          slotsData.nextDaySlots.forEach(daySlot => {
            if (daySlot.slots) {
              daySlot.slots.forEach(slot => {
                transformedSlots.push({
                  id: slot.id,
                  date: "Tomorrow", // Since it's next day
                  time: `${slot.start} ${slot.startAmPm} - ${slot.end} ${slot.endAmPm}`,
                  available: true,
                  slotData: slot // Keep original slot data for order placement
                });
              });
            }
          });
        }
        
        // Process sameDaySlots
        if (slotsData.sameDaySlots) {
          slotsData.sameDaySlots.forEach(daySlot => {
            if (daySlot.slots) {
              daySlot.slots.forEach(slot => {
                transformedSlots.push({
                  id: slot.id,
                  date: "Today",
                  time: `${slot.start} ${slot.startAmPm} - ${slot.end} ${slot.endAmPm}`,
                  available: true,
                  slotData: slot
                });
              });
            }
          });
        }
        
        setDeliverySlots(transformedSlots);
        console.log('Transformed delivery slots:', transformedSlots);
      } else {
        setDeliverySlots([]);
      }
    } catch (error) {
      console.error('Error fetching delivery slots:', error);
      setDeliverySlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  // Transform API cart data to match expected format
  const transformedCartData = cartData ? {
    items: cartData.items.map(item => ({
      id: item.ProductId,
      quantity: item.Quantity,
      product: {
        name: item.productName,
        images: [item.productImage],
        price: parseFloat(item.Price),
        category: item.category
      },
      variation: {
        name: item.QuantityUnits,
        price: parseFloat(item.Price),
        mrp: parseFloat(item.Mrp),
        savings: parseFloat(item.Savings),
        subtotal: parseFloat(item.Subtotal)
      }
    })),
    summary: {
      totalAmount: parseFloat(cartData.finalTotal),
      subtotal: parseFloat(cartData.subTotal),
      savings: parseFloat(cartData.savings),
      deliveryCharges: parseFloat(cartData.deliveryCharges),
      chargestag: cartData.chargestag
    }
  } : null;



  // Auto-select the first delivery slot if none is selected
  useEffect(() => {
    if (!selectedDeliverySlot && deliverySlots.length > 0) {
      setSelectedDeliverySlot(deliverySlots[0]);
    }
  }, [deliverySlots, selectedDeliverySlot]);

  const applyCouponMutation = {
    mutate: async (code: string) => {
      // Mock coupon validation
      if (code.toLowerCase() === "welcome10") {
        setAppliedCoupon({
          id: 1,
          name: "WELCOME10",
          discount_value: 10,
          max_discount_amount: 50
        });
        setCouponCode("");
        Alert.alert("Success", "Coupon applied successfully!");
      } else {
        Alert.alert("Error", "Invalid or expired coupon code");
      }
    },
    isPending: false
  };

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const placeOrderMutation = {
    mutate: async () => {
      console.log("=== ORDER PLACEMENT DEBUG ===");
      console.log("selectedAddress:", selectedAddress);
      console.log("selectedDeliverySlot:", selectedDeliverySlot);
      console.log("selectedPaymentMethod:", selectedPaymentMethod);
      console.log("cartData:", cartData);
      console.log("cartData?.items:", cartData?.items);
      
      if (!selectedAddress) {
        console.log("ERROR: No address selected");
        Alert.alert("Error", "Please select a delivery address");
        return;
      }
      if (!selectedDeliverySlot) {
        console.log("ERROR: No delivery slot selected");
        Alert.alert("Error", "Please select a delivery slot");
        return;
      }
      if (!cartData?.items || cartData.items.length === 0) {
        console.log("ERROR: Cart is empty");
        Alert.alert("Error", "Your cart is empty");
        return;
      }

      try {
        setIsPlacingOrder(true);
        
        // Prepare order payload with real user ID
        const orderPayload = {
          addressId: selectedAddress?.id,
          deliverySlotId: selectedDeliverySlot?.slotData?.id,
          items: cartData.items.map(item => ({
            productId: item.ProductId,
            quantity: item.Quantity,
            quantityUnits: item.QuantityUnits
          })),
          paymentDetails: {
            method: selectedPaymentMethod === "cod" ? (selectedSubOption === "cod-prepared" ? "prepared" : "cash") : selectedPaymentMethod
          },
          userId: userId // Using real authenticated user ID
        };

        console.log("Order payload:", JSON.stringify(orderPayload, null, 2));

        if (!orderPayload.addressId || !orderPayload.deliverySlotId) {
          throw new Error("Address or delivery slot missing");
        }

        // Call the order placement API
        console.log("Calling API...");
        const orderResponse = await apiService.placeOrder(orderPayload);
        console.log("API Response:", orderResponse);
        
        const isCod = selectedPaymentMethod === 'cod';
        // Check if payment link is provided in the response (for prepaid/UPI)
        if (!isCod && orderResponse.paymentLink) {
          console.log("Payment link received:", orderResponse.paymentLink);
          
          // Open the payment link (prefer in-app to keep user inside app)
          try {
            const payUrl = orderResponse.paymentLink;
            const isUpiIntent = typeof payUrl === 'string' && payUrl.startsWith('upi://');
            const isFinalReceipt = typeof payUrl === 'string' && payUrl.includes('/mycart/address/order-placed/');

            // Save orderId for verification on return
            const createdOrderId = orderResponse.orderId || orderResponse.id;
            pendingOrderIdRef.current = createdOrderId || null;

            // Attach AppState listener to verify payment status when app comes to foreground
            const onAppStateChange = async (nextState) => {
              if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
                try {
                  if (pendingOrderIdRef.current) {
                    console.log('Verifying payment status for order:', pendingOrderIdRef.current);
                    const latest = await apiService.getOrderById(pendingOrderIdRef.current);
                    const paid = latest?.payment_status === 'completed' || latest?.status === 'confirmed' || latest?.status === 'paid';
                    if (paid) {
                      clearCart();
                      router.replace(`/order-confirmation/${pendingOrderIdRef.current}`);
                      pendingOrderIdRef.current = null;
                    } else {
                      Alert.alert('Payment Pending', 'Payment not confirmed. If you paid, please wait a moment or try again from Orders.');
                    }
                }
                } catch (verifyErr) {
                  console.warn('Payment verification failed:', verifyErr?.message || verifyErr);
                }
              }
              appStateRef.current = nextState;
            };
            AppState.removeEventListener?.('change', onAppStateChange);
            AppState.addEventListener('change', onAppStateChange);

            if (isUpiIntent) {
              // Open UPI intent directly (GPay/PhonePe)
              console.log('Opening UPI intent...');
              await Linking.openURL(payUrl);
              // Begin short polling after user returns
              setTimeout(() => { pollPaymentStatus(); }, 1500);
            } else if (!isFinalReceipt) {
              // Open in-app web auth session to keep user inside app; await their return
              const redirectUrl = LinkingExpo.createURL('payment-callback');
              console.log('Opening in-app browser with redirectUrl:', redirectUrl);
              const result = await WebBrowser.openAuthSessionAsync(payUrl, redirectUrl);
              console.log('AuthSession result:', result?.type);
              // After user dismisses/returns, start polling server
              setTimeout(() => { pollPaymentStatus(); }, 1500);
            } else {
              // Do not redirect to external receipt page; keep user in app and rely on verification
              console.log('Skipping external receipt URL to keep user in app');
              // Kick off polling shortly after to avoid feeling stuck
              setTimeout(() => { pollPaymentStatus(); }, 1000);
            }
          } catch (error) {
            console.error("Error opening payment link:", error);
            Alert.alert("Error", `Failed to open payment link: ${error.message}`);
          }
        } else {
          // Regular order processing (no payment link)
          console.log("No payment link received, processing as regular order");
          
          // Extract orderId from the API response
          const orderId = orderResponse.orderId;
          console.log("Extracted orderId:", orderId);
          
          if (!orderId) {
            throw new Error("Order ID not received from server");
          }

          // If payment method is prepaid but no link is present, do NOT confirm immediately
          if (!isCod) {
            Alert.alert('Payment Pending', 'We could not create a payment link. Your order is pending payment. Please try again from Orders.');
            return;
          }

          // COD flow: confirm immediately
          clearCart();
          router.replace(`/order-confirmation/${orderId}`);
        }
      } catch (error) {
        console.error('Error placing order:', error);
        console.error('Error details:', error.message);
        Alert.alert("Error", `Failed to place order: ${error.message}`);
      } finally {
        setIsPlacingOrder(false);
      }
    },
    isPending: isPlacingOrder
  };

  const cartItems = transformedCartData?.items || [];
  const subtotal = transformedCartData?.summary?.subtotal || 0;
  const deliveryFee = transformedCartData?.summary?.deliveryCharges || 0;
  const savings = transformedCartData?.summary?.savings || 0;
  const discount = appliedCoupon
    ? Math.min(
        (subtotal * appliedCoupon.discount_value) / 100,
        appliedCoupon.max_discount_amount || subtotal,
      )
    : 0;
  const total = transformedCartData?.summary?.totalAmount || (subtotal + deliveryFee - discount);

  const isLoading = addressesLoading || cartLoading || slotsLoading;

  return {
    user: { id: 1, name: "John Doe" },
    cartItems,
    subtotal,
    deliveryFee,
    savings,
    discount,
    total,
    addresses,
    selectedAddress,
    setSelectedAddress: updateSelectedAddress,
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
    cartData: transformedCartData,
    chargestag: transformedCartData?.summary?.chargestag,
  };
}
