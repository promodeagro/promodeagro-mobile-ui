import {
    Inter_500Medium,
    Inter_600SemiBold,
    useFonts,
} from "@expo-google-fonts/inter";
import { usePathname, useRouter } from "expo-router";
import { ShoppingCart } from "lucide-react-native";
import React, { useMemo } from "react";
import { Text, TouchableOpacity, View, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "../utils/CartContext";

export default function GlobalCheckoutWidget() {
  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_500Medium,
  });

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems, totalAmount, cartItems } = useCart();

  // Only show widget on home and categories pages
  const allowedPages = [
    '/(tabs)/home',
    '/home',
    '/(tabs)/categories', 
    '/categories',
    '/category'
  ];
  
  const shouldShowWidget = allowedPages.some(page => pathname?.includes(page)) || 
                          pathname === '/' || 
                          pathname === '/home' ||
                          pathname === '/categories';

  // Don't early-return before hooks/derived values are declared next time; keep simple guard here
  // do not return before declaring all hooks/memos below to keep hook order stable

  const handleViewCart = () => {
    router.push("/checkout" as any);
  };

  const handleCheckout = () => {
    // Navigate to checkout screen
    console.log("Proceeding to checkout");
    router.push("/checkout" as any);
  };

  // Primary thumbnail (first cart item) for avatar-style preview
  const firstThumb = useMemo(() => {
    const it = Array.from(cartItems.values());
    const uri = it.length ? it[0].product?.images?.[0] : undefined;
    return (uri || undefined) as string | undefined;
  }, [cartItems]);

  // Build distinct product thumbnails (unique by first image) up to 3
  const distinctThumbs: string[] = useMemo(() => {
    const acc: string[] = [];
    for (const ci of Array.from(cartItems.values())) {
      const uri = ci.product?.images?.[0];
      if (uri && !acc.includes(uri)) acc.push(uri);
      if (acc.length >= 3) break;
    }
    return acc;
  }, [cartItems]);

  // Avatar size scales slightly with number of distinct items (Blinkit-like subtle growth)
  const baseSize = 22;
  const sizeBump = Math.min(distinctThumbs.length - 1, 2) * 2; // 0, 2, 4
  const avatarSize = baseSize + sizeBump; // 22, 24, 26
  const avatarRadius = Math.round(avatarSize / 2);

  // Safe guards AFTER all hooks/memos
  if (!fontsLoaded) return null;
  if (totalItems === 0 || !shouldShowWidget) return null;

  return (
    <View
      style={{
        position: "absolute",
        // place fully above the bottom tab bar so icons remain visible
        bottom: Math.max(insets.bottom, 0) + 80,
        alignSelf: "center",
        backgroundColor: "#8B5CF6",
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.22,
        shadowRadius: 6,
        elevation: 4,
        zIndex: 1000,
        minWidth: 200,
        maxWidth: 260,
        justifyContent: "space-between",
      }}
    >
      {/* Left thumbnail stack (up to 3), grows subtly with more distinct items */}
      <View style={{ flexDirection: "row", marginLeft: -10, marginRight: 8, alignItems: "center" }}>
        {distinctThumbs.map((uri, idx) => (
          <View
            key={`${uri}-${idx}`}
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarRadius,
              overflow: "hidden",
              backgroundColor: "#F3F4F6",
              borderWidth: 2,
              borderColor: "#FFFFFF",
              marginLeft: idx === 0 ? 0 : -Math.max(avatarSize / 3, 6),
            }}
          >
            <Image source={{ uri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          </View>
        ))}
      </View>

      {/* Cart Info */}
      <TouchableOpacity onPress={handleViewCart} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 16, fontFamily: "Inter_800ExtraBold", color: "#FFFFFF", marginBottom: 0, textAlign: "center" }}>View cart</Text>
        <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#F3E8FF", textAlign: "center" }}>
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </Text>
      </TouchableOpacity>

      {/* Arrow Icon pinned to right */}
      <View style={{ paddingLeft: 8 }}>
        <Text style={{ fontSize: 18, color: "#FFFFFF", fontFamily: "Inter_800ExtraBold" }}>›</Text>
      </View>
    </View>
  );
}
