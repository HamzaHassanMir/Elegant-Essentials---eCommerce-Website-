// src/store/productsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API = "http://localhost:5000/api";

// ── Async thunks ──────────────────────────────────────────────────────────────

export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API}/products`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return await res.json();
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API}/products/${id}`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return await res.json();
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/create",
  async (productData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const res = await fetch(`${API}/products`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(productData),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data || "Failed to create product");
      return data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/update",
  async ({ id, ...productData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const res = await fetch(`${API}/products/${id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(productData),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data || "Failed to update product");
      return data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const res = await fetch(`${API}/products/${id}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        return rejectWithValue(data || "Failed to delete product");
      }
      return id; // return the deleted id so we can remove from state
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const productsSlice = createSlice({
  name: "products",
  initialState: {
    items:          [],
    currentProduct: null,
    loading:        false,
    error:          null,
    lastFetched:    null,   // timestamp — used to avoid re-fetching too soon
  },
  reducers: {
    clearProductError(state) { state.error = null; },
    clearCurrentProduct(state) { state.currentProduct = null; },
  },
  extraReducers: (builder) => {
    // fetchProducts
    builder
      .addCase(fetchProducts.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading     = false;
        state.items       = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchProducts.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

    // fetchProductById
    builder
      .addCase(fetchProductById.pending,   (state) => { state.loading = true;  state.error = null; state.currentProduct = null; })
      .addCase(fetchProductById.fulfilled, (state, action) => { state.loading = false; state.currentProduct = action.payload; })
      .addCase(fetchProductById.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

    // createProduct
    builder
      .addCase(createProduct.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload); // add to top of list
      })
      .addCase(createProduct.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

    // updateProduct
    builder
      .addCase(updateProduct.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.items.findIndex(p => p._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.currentProduct?._id === action.payload._id) state.currentProduct = action.payload;
      })
      .addCase(updateProduct.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

    // deleteProduct
    builder
      .addCase(deleteProduct.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items   = state.items.filter(p => p._id !== action.payload);
      })
      .addCase(deleteProduct.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearProductError, clearCurrentProduct } = productsSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectAllProducts     = (state) => state.products.items;
export const selectCurrentProduct  = (state) => state.products.currentProduct;
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsError   = (state) => state.products.error;
export const selectSaleProducts    = (state) => state.products.items.filter(p => p.onSale);
export const selectProductsByCategory = (category) => (state) =>
  state.products.items.filter(p => (p.category || "").toLowerCase() === category.toLowerCase());

export default productsSlice.reducer;
