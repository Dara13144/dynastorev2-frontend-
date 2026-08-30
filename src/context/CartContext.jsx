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

  const isInCart = (productId) => {
    return cart.items.some(
      (i) => String(i.productId) === String(productId) || String(i.id) === String(productId)
    );
  };

  const removeFromCart = async (productId) => {
    // Optimistic state update for instant UI response
    const currentItems = cart.items || [];
    const updated = currentItems.filter(
      (i) => String(i.productId) !== String(productId) && String(i.id) !== String(productId)
    );
    setCart({
      items: updated,
      subtotal: updated.reduce((sum, i) => sum + (Number(i.price) || 0), 0),
      total: updated.reduce((sum, i) => sum + (Number(i.price) || 0), 0),
    });

    if (!isAuthenticated) {
      const local = JSON.parse(localStorage.getItem('dynastore_guest_cart') || '[]');
      const localUpdated = local.filter(
        (i) => String(i.productId) !== String(productId) && String(i.id) !== String(productId)
      );
      localStorage.setItem('dynastore_guest_cart', JSON.stringify(localUpdated));
      toast.info('Game removed from cart');
      return;
    }

    try {
      const res = await API.delete(`/cart/${productId}`);
      if (res.data.success) {
        toast.info('Game removed from cart');
        await fetchCart();
      }
    } catch (err) {
      toast.error(err.formattedMessage || 'Failed to remove game from cart');
      await fetchCart();
    }
  };

  const toggleCart = async (product) => {
    if (isInCart(product.id)) {
      await removeFromCart(product.id);
    } else {
      await addToCart(product);
    }
  };

  const clearCart = async () => {
    localStorage.removeItem('dynastore_guest_cart');
    setCart({ items: [], subtotal: 0, total: 0 });

    if (isAuthenticated) {
      try {
        await API.delete('/cart');
      } catch (err) {
        console.error(err);
      }
    }
    toast.info('Cart cleared');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount: cart.items.length,
        loading,
        isInCart,
        addToCart,
        removeFromCart,
        toggleCart,
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
