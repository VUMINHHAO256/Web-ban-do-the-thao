import React, { createContext, useContext, useState, useCallback } from 'react';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  oldPrice?: number;
}

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  toggleItem: () => {},
  isInWishlist: () => false,
});

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    try {
      const stored = localStorage.getItem('wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const addItem = useCallback((item: WishlistItem) => {
    setItems(prev => {
      if (prev.find(i => i.id === item.id)) return prev;
      const updated = [...prev, item];
      localStorage.setItem('wishlist', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => {
      const updated = prev.filter(i => i.id !== id);
      localStorage.setItem('wishlist', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleItem = useCallback((item: WishlistItem) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      const updated = exists ? prev.filter(i => i.id !== item.id) : [...prev, item];
      localStorage.setItem('wishlist', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isInWishlist = useCallback((id: string) => items.some(i => i.id === id), [items]);

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, toggleItem, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
