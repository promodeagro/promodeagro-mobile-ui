import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  variationId?: string;
  variation?: any;
}

interface WishlistContextType {
  wishlistItems: Map<string, WishlistItem>;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<Map<string, WishlistItem>>(new Map());

  const addToWishlist = useCallback((item: WishlistItem) => {
    setWishlistItems(prev => {
      const newMap = new Map(prev);
      newMap.set(item.id, item);
      return newMap;
    });
  }, []);

  const removeFromWishlist = useCallback((id: string) => {
    setWishlistItems(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const toggleWishlist = useCallback((item: WishlistItem) => {
    setWishlistItems(prev => {
      const newMap = new Map(prev);
      if (newMap.has(item.id)) {
        newMap.delete(item.id);
      } else {
        newMap.set(item.id, item);
      }
      return newMap;
    });
  }, []);

  const isInWishlist = useCallback((id: string) => {
    return wishlistItems.has(id);
  }, [wishlistItems]);

  const clearWishlist = useCallback(() => {
    setWishlistItems(new Map());
  }, []);

  const totalItems = useMemo(() => wishlistItems.size, [wishlistItems]);

  const value = useMemo(() => ({
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    totalItems,
  }), [wishlistItems, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist, clearWishlist, totalItems]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
