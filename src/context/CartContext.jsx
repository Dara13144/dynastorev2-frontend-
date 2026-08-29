import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [cart, setCart] = useState({ items: [], subtotal: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      // Local storage cart for unauthenticated guests
      const local = JSON.parse(localStorage.getItem('dynastore_guest_cart') || '[]');
      setCart({
        items: local,
        subtotal: local.reduce((sum, i) => sum + (i.price || 0), 0),
        total: local.reduce((sum, i) => sum + (i.price || 0), 0),
      });
      return;
    }

    try {
      setLoading(true);
      const res = await API.get('/cart');
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.warn('Failed to load cart:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (product) => {
    const finalPrice = product.discount_price !== null && product.discount_price !== undefined
      ? Number(product.discount_price)
      : Number(product.price);

    if (!isAuthenticated) {
      const local = JSON.parse(localStorage.getItem('dynastore_guest_cart') || '[]');
      if (local.some((i) => i.productId === product.id)) {
        toast.info(`"${product.title}" is already in your cart.`);
        return;
      }
      const newItem = {
        id: product.id,
        productId: product.id,
        product,
        price: finalPrice,
        originalPrice: Number(product.price),
        quantity: 1,
      };
      const updated = [...local, newItem];
      localStorage.setItem('dynastore_guest_cart', JSON.stringify(updated));
      setCart({
        items: updated,
        subtotal: updated.reduce((sum, i) => sum + i.price, 0),
        total: updated.reduce((sum, i) => sum + i.price, 0),
      });
      toast.success(`Added "${product.title}" to cart`);
      return;
    }

    try {
      const res = await API.post('/cart', { productId: product.id });
      if (res.data.success) {
        toast.success(res.data.message || `Added "${product.title}" to cart`);
        await fetchCart();
      }
    } catch (err) {
      toast.error(err.formattedMessage || 'Failed to add item to cart');
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) {
      const local = JSON.parse(localStorage.getItem('dynastore_guest_cart') || '[]');
      const updated = local.filter((i) => i.productId !== productId);
      localStorage.setItem('dynastore_guest_cart', JSON.stringify(updated));
      setCart({
        items: updated,
        subtotal: updated.reduce((sum, i) => sum + i.price, 0),
        total: updated.reduce((sum, i) => sum + i.price, 0),
      });
      toast.info('Item removed from cart');
      return;
    }

    try {
      const res = await API.delete(`/cart/${productId}`);
      if (res.data.success) {
        toast.info('Item removed from cart');
        await fetchCart();
      }
    } catch (err) {
      toast.error(err.formattedMessage || 'Failed to remove item');
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      localStorage.removeItem('dynastore_guest_cart');
      setCart({ items: [], subtotal: 0, total: 0 });
      return;
    }

    try {
      await API.delete('/cart');
      setCart({ items: [], subtotal: 0, total: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount: cart.items.length,
        loading,
        addToCart,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
