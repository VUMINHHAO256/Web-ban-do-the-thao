import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface AppliedPromo {
  code: string;
  discount: string;        // nhãn hiển thị, VD: "Giảm 10%"
  discountType: string;    // 'percent' | 'amount' | 'freeship'
  discountValue: number;
  min: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  appliedPromo: AppliedPromo | null;
  discountAmount: number;        // số tiền được giảm (tính từ promo)
  isFreeShip: boolean;           // true nếu promo type là freeship
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyPromo: (code: string) => Promise<void>;
  removePromo: () => void;
}

const CartContext = createContext<CartContextType>({
  items: [],
  totalItems: 0,
  totalPrice: 0,
  appliedPromo: null,
  discountAmount: 0,
  isFreeShip: false,
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  applyPromo: async () => {},
  removePromo: () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('cart');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(() => {
    try {
      const stored = localStorage.getItem('cart_promo');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  // Persist cart items
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Persist applied promo
  useEffect(() => {
    if (appliedPromo) {
      localStorage.setItem('cart_promo', JSON.stringify(appliedPromo));
    } else {
      localStorage.removeItem('cart_promo');
    }
  }, [appliedPromo]);

  const addItem = useCallback((product: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.id !== id));
    } else {
      setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedPromo(null);
  }, []);

  // ── Áp dụng mã giảm giá ──
  const applyPromo = useCallback(async (code: string) => {
    const res = await api.post('/promotions/validate', { code: code.trim().toUpperCase() });
    const promo = res.data?.promotion;
    if (!promo) throw new Error('Mã giảm giá không hợp lệ');
    setAppliedPromo({
      code: promo.code,
      discount: promo.discount,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      min: promo.min || 0,
    });
  }, []);

  const removePromo = useCallback(() => {
    setAppliedPromo(null);
  }, []);

  // ── Tính toán ──
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  let discountAmount = 0;
  let isFreeShip = false;
  if (appliedPromo) {
    if (appliedPromo.discountType === 'percent') {
      discountAmount = Math.round(totalPrice * (appliedPromo.discountValue / 100));
    } else if (appliedPromo.discountType === 'amount') {
      discountAmount = Math.min(appliedPromo.discountValue, totalPrice);
    } else if (appliedPromo.discountType === 'freeship') {
      isFreeShip = true;
    }
    // Nếu đơn chưa đủ minOrderAmount, không tính giảm
    if (appliedPromo.min > 0 && totalPrice < appliedPromo.min) {
      discountAmount = 0;
      isFreeShip = false;
    }
  }

  return (
    <CartContext.Provider value={{
      items, totalItems, totalPrice,
      appliedPromo, discountAmount, isFreeShip,
      addItem, removeItem, updateQuantity, clearCart,
      applyPromo, removePromo,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
