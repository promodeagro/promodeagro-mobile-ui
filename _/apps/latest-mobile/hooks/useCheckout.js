import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useSelector } from 'react-redux';
import { apiService } from "../config/api";
import { useCart } from "../utils/CartContext";

export function useCheckout() {
  const router = useRouter();

  // Get real user data from Redux
  const { user, isAuthenticated } = useSelector((state) => state.login);
  const userId = user?.id || user?.userId;
  
  // Get cart functions
  const { clearCart } = useCart();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cod");
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
        setSelectedAddress(defaultAddr);
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

    try {
      setCartLoading(true);
      console.log("Fetching cart data for user ID:", userId);
      const addressId = selectedAddress?.id || "e17a3e7b-2469-4b70-86a1-adb358787f3c"; // Use selected address or default
      
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
          addressId: selectedAddress?.id || "66d22b07-89e9-4bd8-bfec-d6d7bf936a0a", // Use selected address or fallback
          deliverySlotId: selectedDeliverySlot?.slotData?.id || "c7e8d862", // Use selected slot or fallback
          items: cartData.items.map(item => ({
            productId: item.ProductId,
            quantity: item.Quantity,
            quantityUnits: item.QuantityUnits
          })),
          paymentDetails: {
            method: selectedPaymentMethod === "cod" ? "cash" : selectedPaymentMethod
          },
          userId: userId // Using real authenticated user ID
        };

        console.log("Order payload:", JSON.stringify(orderPayload, null, 2));

        // Call the order placement API
        console.log("Calling API...");
        const orderResponse = await apiService.placeOrder(orderPayload);
        console.log("API Response:", orderResponse);
        
        // Extract orderId from the API response
        const orderId = orderResponse.orderId;
        console.log("Extracted orderId:", orderId);
        
        if (!orderId) {
          throw new Error("Order ID not received from server");
        }
        
        // Clear cart after successful order placement
        console.log("Order placed successfully, clearing cart...");
        clearCart();
        
        console.log("=== NAVIGATION DEBUG ===");
        console.log("orderId for navigation:", orderId);
        console.log("Navigation route:", `/order-confirmation/${orderId}`);
        console.log("router object:", router);
        
        // Try direct navigation first
        try {
          console.log("Attempting direct navigation...");
          router.replace(`/order-confirmation/${orderId}`);
          console.log("Direct navigation command executed successfully");
        } catch (navError) {
          console.error("Direct navigation error:", navError);
        }
        
        Alert.alert("Success", "Order placed successfully!", [
          {
            text: "OK",
            onPress: () => {
              // Fallback navigation in case direct navigation didn't work
              console.log("Alert OK pressed - attempting fallback navigation");
              try {
                router.push(`/order-confirmation/${orderId}`);
                console.log("Fallback navigation executed");
              } catch (navError) {
                console.error("Fallback navigation error:", navError);
              }
            }
          }
        ]);
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
    cartData: transformedCartData,
    chargestag: transformedCartData?.summary?.chargestag,
  };
}
