// src/store/ordersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API = "http://localhost:5000/api";

// ── Async thunks ──────────────────────────────────────────────────────────────

// Customer: place a new order
export const placeOrder = createAsyncThunk(
  "orders/place",
  async (orderData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue("You must be logged in to place an order.");
      const res = await fetch(`${API}/orders`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(orderData),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data || "Failed to place order");
      return data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

// Customer: fetch their own orders
export const fetchMyOrders = createAsyncThunk(
  "orders/fetchMine",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const res = await fetch(`${API}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return await res.json();
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

// Admin: fetch all orders
export const fetchAllOrders = createAsyncThunk(
  "orders/fetchAll",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const res = await fetch(`${API}/orders/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return await res.json();
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

// Admin: update order status
export const updateOrderStatus = createAsyncThunk(
  "orders/updateStatus",
  async ({ id, status }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const res = await fetch(`${API}/orders/${id}/status`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data || "Failed to update status");
      return data; // updated order object
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    myOrders:  [],
    allOrders: [],
    loading:   false,
    placing:   false,  // separate flag so the checkout button shows its own loading
    error:     null,
    lastPlaced: null,
  },
  reducers: {
    clearOrderError(state) { state.error = null; },
    clearLastPlaced(state) { state.lastPlaced = null; },
  },
  extraReducers: (builder) => {
    // placeOrder
    builder
      .addCase(placeOrder.pending,   (state) => { state.placing = true; state.error = null; })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.placing    = false;
        state.lastPlaced = action.payload;
        state.myOrders.unshift(action.payload);
      })
      .addCase(placeOrder.rejected,  (state, action) => { state.placing = false; state.error = action.payload; });

    // fetchMyOrders
    builder
      .addCase(fetchMyOrders.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMyOrders.fulfilled, (state, action) => { state.loading = false; state.myOrders = action.payload; })
      .addCase(fetchMyOrders.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

    // fetchAllOrders (admin)
    builder
      .addCase(fetchAllOrders.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAllOrders.fulfilled, (state, action) => { state.loading = false; state.allOrders = action.payload; })
      .addCase(fetchAllOrders.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

    // updateOrderStatus (admin)
    builder
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.allOrders.findIndex(o => o._id === updated._id);
        if (idx !== -1) state.allOrders[idx] = { ...state.allOrders[idx], status: updated.status };
        const myIdx = state.myOrders.findIndex(o => o._id === updated._id);
        if (myIdx !== -1) state.myOrders[myIdx] = { ...state.myOrders[myIdx], status: updated.status };
      });
  },
});

export const { clearOrderError, clearLastPlaced } = ordersSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectMyOrders       = (state) => state.orders.myOrders;
export const selectAllOrders      = (state) => state.orders.allOrders;
export const selectOrdersLoading  = (state) => state.orders.loading;
export const selectOrderPlacing   = (state) => state.orders.placing;
export const selectOrderError     = (state) => state.orders.error;
export const selectLastPlaced     = (state) => state.orders.lastPlaced;

// Revenue helpers used by admin dashboard
export const selectTotalRevenue = (state) =>
  state.orders.allOrders
    .filter(o => o.status !== "cancelled")
    .reduce((s, o) => s + (o.totalAmount || 0), 0);

export const selectMonthlyRevenue = (year) => (state) => {
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return MONTHS.map((month, mi) => {
    const revenue = state.orders.allOrders
      .filter(o => {
        const d = new Date(o.createdAt);
        return d.getFullYear() === year && d.getMonth() === mi && o.status !== "cancelled";
      })
      .reduce((s, o) => s + (o.totalAmount || 0), 0);
    const orders = state.orders.allOrders.filter(o => {
      const d = new Date(o.createdAt);
      return d.getFullYear() === year && d.getMonth() === mi;
    }).length;
    return { month, revenue, orders };
  });
};

export default ordersSlice.reducer;
