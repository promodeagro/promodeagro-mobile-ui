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
  
  // Get cart functions and local cart state
  const { clearCart, cartItems: localCartMap, totalAmount: localTotalAmount } = useCart();
  const appStateRef = useRef(AppState.currentState);
  const pendingOrderIdRef = useRef(null);
  const navigationDoneRef = useRef(false);
  const pollingInFlightRef = useRef(false);

  // Helper: verify payment for a pending order and navigate if paid
  const verifyPendingPayment = async () => {
    try {
      if (!pendingOrderIdRef.current) {
        console.log('No pending order ID to verify');
        return false;
      }
      
      console.log('Verifying payment for order:', pendingOrderIdRef.current);
      
      // If it's a temporary ID, try to find the most recent order for this user
      if (pendingOrderIdRef.current.startsWith('temp_')) {
        console.log('Temporary order ID detected, checking recent orders...');
        try {
          const recentOrders = await apiService.getOrdersByUserId(userId);
          console.log('Recent orders:', recentOrders);
          
          if (recentOrders.orders && recentOrders.orders.length > 0) {
            // Find the most recent order (assuming it's the one we just created)
            const mostRecentOrder = recentOrders.orders[0];
            console.log('Most recent order:', mostRecentOrder);
            
            const paid = mostRecentOrder?.payment_status === 'completed' || 
                         mostRecentOrder?.status === 'confirmed' || 
                         mostRecentOrder?.status === 'paid' ||
                         mostRecentOrder?.payment_status === 'paid' ||
                         mostRecentOrder?.paymentDetails?.status === 'PAID' ||
                         mostRecentOrder?.paymentDetails?.status === 'paid' ||
                         mostRecentOrder?.paymentDetails?.status === 'completed';
                         
            console.log('Recent order payment status check:', {
              payment_status: mostRecentOrder?.payment_status,
              status: mostRecentOrder?.status,
              paymentDetails_status: mostRecentOrder?.paymentDetails?.status,
              paid: paid
            });
                         
            if (paid) {
              if (!navigationDoneRef.current) {
                console.log('Payment confirmed via recent orders! Navigating to order confirmation...');
                navigationDoneRef.current = true;
                clearCart();
                router.replace(`/order-confirmation/${mostRecentOrder.id}`);
              }
              pendingOrderIdRef.current = null;
              return true;
            }
          }
        } catch (orderError) {
          console.warn('Failed to fetch recent orders:', orderError);
        }
        
        // If we can't verify, show alert to check orders
        Alert.alert(
          'Payment Status Unknown', 
          'We cannot verify your payment status automatically. Please check your orders page to see if your order was successful.',
          [
            {
              text: 'Check Orders',
              onPress: () => {
                clearCart();
                router.replace('/(tabs)/orders');
                pendingOrderIdRef.current = null;
              }
            }
          ]
        );
        return true;
      }
      
      const latestResponse = await apiService.getOrderById(pendingOrderIdRef.current);
      const latest = latestResponse?.order || latestResponse;
      console.log('Order status response:', latestResponse);
      
      const paid = latest?.payment_status === 'completed' || 
                   latest?.status === 'confirmed' || 
                   latest?.status === 'paid' ||
                   latest?.payment_status === 'paid' ||
                   latest?.paymentDetails?.status === 'PAID' ||
                   latest?.paymentDetails?.status === 'paid' ||
                   latest?.paymentDetails?.status === 'completed';
                   
      console.log('Payment status check:', {
        payment_status: latest?.payment_status,
        status: latest?.status,
        paymentDetails_status: latest?.paymentDetails?.status,
        paid: paid
      });
      
      if (paid) {
        if (!navigationDoneRef.current) {
          console.log('Payment confirmed! Navigating to order confirmation...');
          navigationDoneRef.current = true;
          clearCart();
          router.replace(`/order-confirmation/${pendingOrderIdRef.current}`);
        }
        pendingOrderIdRef.current = null;
        return true;
      }
      
      console.log('Payment not yet confirmed');
      return false;
    } catch (e) {
      console.warn('Payment verification failed:', e?.message || e);
      return false;
    }
  };

  // Helper: poll server a few times to catch delayed PSP notifications
  const pollPaymentStatus = async (attempts = 10, intervalMs = 2000) => {
    if (navigationDoneRef.current || !pendingOrderIdRef.current) {
      return true;
    }
    if (pollingInFlightRef.current) {
      return false;
    }
    pollingInFlightRef.current = true;
    console.log(`Starting payment polling: ${attempts} attempts, ${intervalMs}ms intervals`);
    for (let i = 0; i < attempts; i++) {
      if (navigationDoneRef.current || !pendingOrderIdRef.current) {
        pollingInFlightRef.current = false;
        return true;
      }
      console.log(`Payment poll attempt ${i + 1}/${attempts}`);
      const ok = await verifyPendingPayment();
      if (ok || navigationDoneRef.current) {
        console.log('Payment confirmed via polling!');
        pollingInFlightRef.current = false;
        return true;
      }
      if (i < attempts - 1) {
        await new Promise(res => setTimeout(res, intervalMs));
      }
    }
    console.log('Payment polling completed without confirmation');
    pollingInFlightRef.current = false;
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

  // Check for pending payment verification when component mounts
  useEffect(() => {
    if (pendingOrderIdRef.current) {
      console.log('Checking for pending payment on mount...');
      verifyPendingPayment();
    }
  }, []);

  // Cleanup AppState listener on unmount
  useEffect(() => {
    return () => {
      AppState.removeEventListener?.('change', () => {});
    };
  }, []);

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

  // Build a local-cart fallback (shown when server cart is empty/unavailable)
  const localCartItems = Array.from(localCartMap?.values?.() || []).map((ci) => ({
    id: `${ci.product?.id}-${ci.product?.variationId || 'default'}`,
    cartKey: `${ci.product?.id}-${ci.product?.variationId || 'default'}`,
    quantity: Number(ci.quantity || 1),
    product: {
      id: ci.product?.id,
      name: ci.product?.name,
      images: ci.product?.images || [],
      price: Number(ci.product?.price || 0),
      category: ci.product?.category,
      variationId: ci.product?.variationId,
    },
    variation: {
      name: ci.product?.variation,
      price: Number(ci.product?.price || 0),
      mrp: 0,
    },
  }));

  const hasLocalItems = (localCartItems && localCartItems.length > 0);
  const hasServerItems = (transformedCartData?.items && transformedCartData.items.length > 0);

  // Prefer local items if user has added anything this session; otherwise use server cart
  const mergedCartItems = hasLocalItems ? localCartItems : (hasServerItems ? transformedCartData.items : []);

  // Calculate delivery charges based on subtotal and pincode when using local cart
  const calculateDeliveryCharges = (subtotal) => {
    const pincode = String(selectedAddress?.zipCode || selectedAddress?.zip || selectedAddress?.pincode || '').trim();

    // Group A: specific pincodes - free >= 100, else 20
    // NOTE: Add other 3 pincodes here as business config when available
    const groupAPincodes = new Set(['500091']);

    if (groupAPincodes.has(pincode)) {
      return subtotal >= 100 ? 0 : 20;
    }

    // Group B (all other pincodes): free >= 300, else 50
    return subtotal >= 300 ? 0 : 50;
  };

  const mergedSummary = hasLocalItems
    ? {
        totalAmount: Number(localTotalAmount || 0),
        subtotal: Number(localTotalAmount || 0),
        savings: 0,
        // When using local items, estimate delivery using pincode logic above
        deliveryCharges: calculateDeliveryCharges(Number(localTotalAmount || 0)),
        chargestag: undefined,
      }
    : (hasServerItems ? transformedCartData.summary : {
        totalAmount: 0,
        subtotal: 0,
        savings: 0,
        deliveryCharges: 0,
        chargestag: undefined,
      });

  // Expose normalized billing values to consumers
  const subtotal = mergedSummary?.subtotal || 0;
  const deliveryFee = mergedSummary?.deliveryCharges || 0;
  const savings = mergedSummary?.savings || 0;
  const discount = Number(appliedCoupon?.discount_value || 0);
  const total = (mergedSummary?.totalAmount ?? (subtotal + deliveryFee - discount));

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

  // Manual payment verification function
  const verifyPaymentManually = async () => {
    if (!pendingOrderIdRef.current) {
      Alert.alert('No Pending Payment', 'No pending payment to verify.');
      return false;
    }
    
    try {
      const paid = await verifyPendingPayment();
      if (!paid) {
        Alert.alert('Payment Pending', 'Payment not yet confirmed. Please wait a moment or check your payment app.');
      }
      return paid;
    } catch (error) {
      console.error('Manual payment verification failed:', error);
      Alert.alert('Verification Error', 'Failed to verify payment. Please try again.');
      return false;
    }
  };

  const placeOrderMutation = {
    mutate: async () => {
      console.log("=== ORDER PLACEMENT DEBUG ===");
      console.log("selectedAddress:", selectedAddress);
      console.log("selectedDeliverySlot:", selectedDeliverySlot);
      console.log("selectedPaymentMethod:", selectedPaymentMethod);
      console.log("cartData:", cartData);
      console.log("cartData?.items:", cartData?.items);
      console.log("mergedCartItems (ui items):", mergedCartItems);
      
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
      if (!mergedCartItems || mergedCartItems.length === 0) {
        console.log("ERROR: Cart is empty");
        Alert.alert("Error", "Your cart is empty");
        return;
      }

      try {
        setIsPlacingOrder(true);
        
        // Build items from the same source used by UI (prefers local when present)
        const uiBasedItems = mergedCartItems.map((it) => {
          const cartKeyLikeId = (typeof it?.id === 'string' ? it.id : '') || '';
          const productId = String(it?.product?.id || '').trim();
          const variationId = String(it?.product?.variationId || '').trim();
          let pid = variationId || null;
          if (!pid && cartKeyLikeId.includes('-')) {
            const parts = cartKeyLikeId.split('-');
            const last = parts[parts.length - 1];
            if (last && last !== 'default') pid = last;
          }
          if (!pid) pid = productId; // final fallback
          return {
            productId: pid,
            quantity: Number(it?.quantity || 1),
            quantityUnits: (it?.variation?.name) || (it?.product?.variation) || '1 Pcs',
          };
        }).filter((x) => !!x.productId && x.productId !== 'default');
        
        // Prepare order payload with real user ID
        const orderPayload = {
          addressId: selectedAddress?.id,
          deliverySlotId: selectedDeliverySlot?.slotData?.id,
          items: uiBasedItems,
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
            const createdOrderId = orderResponse.orderId || orderResponse.id || orderResponse.order_id;
            console.log('Extracted order ID for payment verification:', createdOrderId);
            
            // If no order ID in response, try to extract from payment link or use a temporary ID
            if (!createdOrderId) {
              console.warn('No order ID found in API response, trying to extract from payment link...');
              
              // Try multiple patterns to extract order ID from payment link
              const orderIdPatterns = [
                /order[_-]?id[=:]([a-f0-9-]+)/i,
                /order[=:]([a-f0-9-]+)/i,
                /\/([a-f0-9-]{8,})\//i,
                /order[_-]?id[=:]([0-9-]+)/i,
                /order[=:]([0-9-]+)/i,
                /\/([0-9-]{8,})\//i
              ];
              
              let extractedOrderId = null;
              for (const pattern of orderIdPatterns) {
                const match = payUrl.match(pattern);
                if (match && match[1]) {
                  extractedOrderId = match[1];
                  console.log('Extracted order ID from payment link using pattern:', pattern, '->', extractedOrderId);
                  break;
                }
              }
              
              if (extractedOrderId) {
                pendingOrderIdRef.current = extractedOrderId;
                console.log('Using extracted order ID for tracking:', extractedOrderId);
              } else {
                // Last resort: try to extract any numeric ID from the URL
                const numericMatch = payUrl.match(/([0-9]{6,})/);
                if (numericMatch) {
                  pendingOrderIdRef.current = numericMatch[1];
                  console.log('Using numeric ID from payment link:', numericMatch[1]);
                } else {
                  const tempOrderId = `temp_${userId}_${Date.now()}`;
                  pendingOrderIdRef.current = tempOrderId;
                  console.log('Using temporary order ID for tracking:', tempOrderId);
                }
              }
            } else {
              pendingOrderIdRef.current = createdOrderId;
            }

            // If we still don't have a real order ID, try to fetch the most recent order
            if (pendingOrderIdRef.current && pendingOrderIdRef.current.startsWith('temp_')) {
              console.log('Attempting to fetch real order ID from recent orders...');
              try {
                const recentOrders = await apiService.getOrdersByUserId(userId);
                if (recentOrders.orders && recentOrders.orders.length > 0) {
                  const mostRecentOrder = recentOrders.orders[0];
                  console.log('Found most recent order with ID:', mostRecentOrder.id);
                  pendingOrderIdRef.current = mostRecentOrder.id;
                  console.log('Updated pending order ID to real ID:', pendingOrderIdRef.current);
                }
              } catch (error) {
                console.warn('Failed to fetch recent orders for real order ID:', error);
              }
            }

            // Attach AppState listener to verify payment status when app comes to foreground
            const onAppStateChange = async (nextState) => {
              console.log('App state changed from', appStateRef.current, 'to', nextState);
              if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
                try {
                  if (pendingOrderIdRef.current) {
                    console.log('App returned to foreground, verifying payment for order:', pendingOrderIdRef.current);
                    const paid = await verifyPendingPayment();
                    if (!paid && !navigationDoneRef.current) {
                      console.log('Payment not confirmed on app return, starting polling...');
                      setTimeout(() => { if (!navigationDoneRef.current) { pollPaymentStatus(); } }, 1000);
                    }
                }
                } catch (verifyErr) {
                  console.warn('Payment verification failed on app state change:', verifyErr?.message || verifyErr);
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
              
              // If user completed payment (not dismissed), show success and redirect
              if (result?.type === 'success' || result?.type === 'dismiss') {
                console.log('Payment session completed, starting verification...');
                // Do not clear pendingOrderId; start polling to confirm
                if (!navigationDoneRef.current) {
                  setTimeout(() => { if (!navigationDoneRef.current) { pollPaymentStatus(); } }, 1000);
                }
              } else {
                // Start polling as fallback
                if (!navigationDoneRef.current) {
                  setTimeout(() => { if (!navigationDoneRef.current) { pollPaymentStatus(); } }, 1500);
                }
              }
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

  const cartItems = mergedCartItems || [];
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
    verifyPaymentManually,
    isLoading,
    cartData: transformedCartData,
    chargestag: transformedCartData?.summary?.chargestag,
    hasPendingPayment: !!pendingOrderIdRef.current,
  };
}
