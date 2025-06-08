
"use client";

import type { CartItem, Product, ExtraItem } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';

// Helper to generate a unique ID for cart items based on product ID and extras
const generateCartItemId = (productId: string, extras?: ExtraItem[]): string => {
  if (!extras || extras.length === 0) {
    return productId;
  }
  // Sort extras by name to ensure consistent ID regardless of selection order
  const sortedExtras = [...extras].sort((a, b) => a.name.localeCompare(b.name));
  const extrasString = sortedExtras.map(ex => `${ex.name}:${ex.price}`).join('|');
  return `${productId}-${extrasString}`;
};


interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, extras?: ExtraItem[]) => void;
  removeFromCart: (cartItemId: string) => void;
  updateItemQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getTotalItems: () => number;
  isCartOpen: boolean;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const storedCart = localStorage.getItem('pizzaPlaceCart');
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        }
      } catch (error) {
        console.error("Error reading cart from localStorage:", error);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('pizzaPlaceCart', JSON.stringify(cartItems));
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
      }
    }
  }, [cartItems, isInitialized]);

  const addToCart = useCallback((product: Product, extras: ExtraItem[] = []) => {
    const cartItemId = generateCartItemId(product.id, extras);
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.cartItemId === cartItemId);
      if (existingItem) {
        return prevItems.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1, selectedExtras: extras, cartItemId }];
    });
    if (!isCartOpen) setIsCartOpen(true);
  }, [isCartOpen]);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.cartItemId !== cartItemId));
  }, []);

  const updateItemQuantity = useCallback((cartItemId: string, quantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: Math.max(0, quantity) } : item
      ).filter(item => item.quantity > 0) // Remove item if quantity is 0
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            localStorage.removeItem('pizzaPlaceCart');
        } catch (error) {
            console.error("Error clearing cart from localStorage:", error);
        }
    }
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const extrasPrice = item.selectedExtras?.reduce((sum, extra) => sum + extra.price, 0) || 0;
      return total + (item.price + extrasPrice) * item.quantity;
    }, 0);
  }, [cartItems]);

  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []);
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);


  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateItemQuantity,
        clearCart,
        getCartTotal,
        getTotalItems,
        isCartOpen,
        toggleCart,
        openCart,
        closeCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
