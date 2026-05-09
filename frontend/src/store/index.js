// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import cartReducer     from "./cartSlice";
import authReducer     from "./authSlice";
import productsReducer from "./productsSlice";
import ordersReducer   from "./ordersSlice";
import uiReducer       from "./uiSlice";

const store = configureStore({
  reducer: {
    cart:     cartReducer,
    auth:     authReducer,
    products: productsReducer,
    orders:   ordersReducer,
    ui:       uiReducer,
  },
  // Redux Toolkit includes redux-thunk by default — no extra setup needed
  // serializableCheck middleware is on by default and will warn if you put
  // non-serialisable values (like Dates, Functions) in state — keep state plain.
  devTools: import.meta.env.DEV, // enable Redux DevTools in development only
});

export default store;
