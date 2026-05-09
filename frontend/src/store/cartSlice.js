// src/store/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Load cart from localStorage so it survives page refresh
const loadCart = () => {
  try {
    const raw = localStorage.getItem("maison_cart");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  try {
    localStorage.setItem("maison_cart", JSON.stringify(items));
  } catch {}
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: loadCart(),
  },
  reducers: {
    // Add product — increment quantity if already in cart
    addToCart(state, action) {
      const product = action.payload;
      const existing = state.items.findIndex(item => item._id === product._id);
      if (existing !== -1) {
        state.items[existing].quantity += 1;
      } else {
        state.items.push({ ...product, quantity: 1 });
      }
      saveCart(state.items);
    },

    // Remove item by index
    removeFromCart(state, action) {
      state.items.splice(action.payload, 1);
      saveCart(state.items);
    },

    // Set an item's quantity by index (removes if quantity < 1)
    updateQuantity(state, action) {
      const { index, quantity } = action.payload;
      if (quantity < 1) {
        state.items.splice(index, 1);
      } else {
        state.items[index].quantity = quantity;
      }
      saveCart(state.items);
    },

    // Clear the entire cart
    clearCart(state) {
      state.items = [];
      saveCart([]);
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectCartItems    = (state) => state.cart.items;
export const selectCartCount    = (state) => state.cart.items.reduce((s, i) => s + (i.quantity || 1), 0);
export const selectCartSubtotal = (state) => state.cart.items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);

export default cartSlice.reducer;
