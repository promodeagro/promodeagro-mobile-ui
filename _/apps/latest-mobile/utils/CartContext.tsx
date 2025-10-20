import React, { createContext, ReactNode, useContext, useState, useCallback, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { apiService } from '../config/api';

interface CartItem {
  product: {
    id: string;
    price: number;
    variation: string;
    variationId?: string;
    name?: string;
    images?: string[];
  };
  quantity: number;
}

interface CartContextType {
  cartItems: Map<string, CartItem>;
  addToCart: (productId: string, variationId: string, variationData: any) => Promise<void>;
  removeFromCart: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  replaceCart: (items: Array<{ productId: string; variationId?: string; price: number; quantity: number; name?: string; image?: string }>) => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<Map<string, CartItem>>(new Map());
  
  // Get real user data from Redux
  const { user, isAuthenticated } = useSelector((state: any) => state.login);
  const userId = user?.id || user?.userId;

  // Debounce ref for API calls
  const apiCallTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Micro-batching: queue quantity updates to apply in a single state update
  const pendingQuantitiesRef = useRef<Map<string, number>>(new Map());
  const pendingNewItemsRef = useRef<Map<string, CartItem>>(new Map());
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scheduleFlush = useCallback(() => {
    if (flushTimeoutRef.current) return;
    flushTimeoutRef.current = setTimeout(() => {
      flushTimeoutRef.current = null;
      const quantityEntries = Array.from(pendingQuantitiesRef.current.entries());
      const newItemEntries = Array.from(pendingNewItemsRef.current.entries());
      if (quantityEntries.length === 0 && newItemEntries.length === 0) return;

      setCartItems((prev) => {
        const next = new Map(prev);
        // apply new items first
        for (const [key, cartItem] of newItemEntries) {
          if (!next.has(key)) {
            next.set(key, cartItem);
          }
        }
        // then apply quantity updates
        for (const [key, qty] of quantityEntries) {
          if (qty <= 0) {
            next.delete(key);
          } else {
            const existing = next.get(key);
            if (existing) {
              next.set(key, { ...existing, quantity: qty });
            }
          }
        }
        return next;
      });

      pendingQuantitiesRef.current.clear();
      pendingNewItemsRef.current.clear();
    }, 24); // apply within one animation frame (~16-24ms)
  }, []);

  const addToCart = useCallback(async (productId: string, variationId: string, variationData: any) => {
    const effectiveVariationId = variationId || productId; // avoid 'default' ids
    const cartKey = `${productId}-${effectiveVariationId}`;

    // Optimistic local update using micro-batching
    const existing = cartItems.get(cartKey);
    if (existing) {
      const nextQty = (pendingQuantitiesRef.current.get(cartKey) ?? existing.quantity) + 1;
      pendingQuantitiesRef.current.set(cartKey, nextQty);
    } else {
      pendingNewItemsRef.current.set(cartKey, {
        product: {
          id: productId,
          price: variationData?.price || variationData.price,
          variation: variationData?.name || variationData.unit || "1 unit",
          variationId: effectiveVariationId,
          name: undefined,
          images: (variationData?.image || (variationData?.images && variationData.images[0])) ? [variationData?.image || variationData?.images?.[0]] : undefined,
        },
        quantity: 1,
      });
      pendingQuantitiesRef.current.set(cartKey, 1);
    }
    scheduleFlush();

    // Debounced API call to avoid spamming the server
    if (isAuthenticated && userId) {
      if (apiCallTimeoutRef.current) {
        clearTimeout(apiCallTimeoutRef.current);
      }
      
      apiCallTimeoutRef.current = setTimeout(async () => {
        try {
          console.log('Adding cart item for user ID:', userId);
          const cartItems = [{
            // Backend expects variationId as productId based on error message
            productId: effectiveVariationId,
            quantity: 1,
            // Prefer explicit unit/name fields from variation data
            quantityUnits: variationData?.quantityUnits || variationData?.unit || variationData?.name || "1 Pcs"
          }];
          
          await apiService.addCartItems(userId, cartItems);
          console.log('Item added to cart successfully');
        } catch (error) {
          console.error('Error adding item to cart:', error);
        }
      }, 100); // 100ms debounce
    } else {
      console.log('User not authenticated, cart item stored locally only');
    }
  }, [isAuthenticated, userId]);

  const removeFromCart = useCallback((cartKey: string) => {
    setCartItems((prev) => {
      const newCart = new Map(prev);
      newCart.delete(cartKey);
      return newCart;
    });
  }, []);

  const updateQuantity = useCallback((cartKey: string, quantity: number) => {
    const nextQty = Math.max(0, Number(quantity || 0));
    const pending = pendingQuantitiesRef.current.get(cartKey);
    const current = cartItems.get(cartKey)?.quantity;
    // Skip if the quantity is already the same (avoid redundant flushes)
    if (pending === nextQty || current === nextQty) {
      return;
    }
    pendingQuantitiesRef.current.set(cartKey, nextQty);
    scheduleFlush();
  }, [scheduleFlush, cartItems]);

  const clearCart = useCallback(() => {
    setCartItems(new Map());
  }, []);

  const replaceCart = useCallback((items: Array<{ productId: string; variationId?: string; price: number; quantity: number; name?: string; image?: string }>) => {
    setCartItems(() => {
      const next = new Map<string, CartItem>();
      for (const it of items) {
        const key = `${it.productId}-${it.variationId || 'default'}`;
        next.set(key, {
          product: {
            id: it.productId,
            variation: it.name || '1 unit',
            variationId: it.variationId,
            price: it.price,
            name: it.name,
            images: it.image ? [it.image] : undefined,
          },
          quantity: Math.max(0, Number(it.quantity || 0)),
        });
      }
      return next;
    });
  }, []);

  // Memoized calculations to prevent unnecessary recalculations
  const cartItemsArray = useMemo(() => Array.from(cartItems.values()), [cartItems]);
  const totalItems = useMemo(() => cartItemsArray.reduce((sum, item) => sum + item.quantity, 0), [cartItemsArray]);
  const totalAmount = useMemo(() => cartItemsArray.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [cartItemsArray]);

  const value: CartContextType = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    replaceCart,
    totalItems,
    totalAmount,
  }), [cartItems, addToCart, removeFromCart, updateQuantity, clearCart, replaceCart, totalItems, totalAmount]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
