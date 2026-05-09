import React, { createContext, useState, useContext } from "react";

export const CardContext = createContext(null);

export const useCart = () => useContext(CardContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Add to cart — if item already exists, increment quantity
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.findIndex(item => item._id === product._id);
      if (existing !== -1) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], quantity: (updated[existing].quantity || 1) + 1 };
        return updated;
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Remove one item by index
  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // Update quantity for item at index
  const updateQuantity = (index, quantity) => {
    if (quantity < 1) { removeFromCart(index); return; }
    setCart((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity };
      return updated;
    });
  };

  const clearCart = () => setCart([]);

  // Total item count (sum of quantities)
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <CardContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount }}>
      {children}
    </CardContext.Provider>
  );
};

export default CardContext;