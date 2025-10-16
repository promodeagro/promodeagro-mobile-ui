import React, { createContext, ReactNode, useContext, useState } from 'react';
import { useSelector } from 'react-redux';
import { apiService } from '../config/api';

interface CartItem {
  product: {
    id: string;
    price: number;
    variation: string;
    variationId?: string;
  };
  quantity: number;
}

interface CartContextType {
  cartItems: Map<string, CartItem>;
  addToCart: (productId: string, variationId: string, variationData: any) => Promise<void>;
  removeFromCart: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
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

  const addToCart = async (productId: string, variationId: string, variationData: any) => {
    const cartKey = `${productId}-${variationId || "default"}`;

    // Update local state first for immediate UI feedback
    setCartItems((prev) => {
      const newCart = new Map(prev);
      const existing = newCart.get(cartKey);
      
      if (existing) {
        newCart.set(cartKey, {
          ...existing,
          quantity: existing.quantity + 1,
        });
      } else {
        newCart.set(cartKey, {
          product: {
            id: productId,
            price: variationData?.price || variationData.price,
            variation: variationData?.name || variationData.unit || "1 unit",
            variationId: variationId,
          },
          quantity: 1,
        });
      }
      
      return newCart;
    });

    // Call API to sync with backend only if user is authenticated
    if (isAuthenticated && userId) {
      try {
        console.log('Adding cart item for user ID:', userId);
        const cartItems = [{
          productId: variationId, // Using variationId as productId for the API
          quantity: 1,
          quantityUnits: variationData?.unit || "1 Pcs"
        }];
        
        await apiService.addCartItems(userId, cartItems);
        console.log('Item added to cart successfully');
      } catch (error) {
        console.error('Error adding item to cart:', error);
        // Optionally revert the local state change if API call fails
      }
    } else {
      console.log('User not authenticated, cart item stored locally only');
    }
  };

  const removeFromCart = (cartKey: string) => {
    setCartItems((prev) => {
      const newCart = new Map(prev);
      newCart.delete(cartKey);
      return newCart;
    });
  };

  const updateQuantity = (cartKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartKey);
      return;
    }

    setCartItems((prev) => {
      const newCart = new Map(prev);
      const existing = newCart.get(cartKey);
      if (existing) {
        newCart.set(cartKey, {
          ...existing,
          quantity,
        });
      }
      return newCart;
    });
  };

  const clearCart = () => {
    setCartItems(new Map());
  };

  const cartItemsArray = Array.from(cartItems.values());
  const totalItems = cartItemsArray.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItemsArray.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalAmount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
