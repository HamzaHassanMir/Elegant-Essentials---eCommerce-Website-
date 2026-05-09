// src/store/uiSlice.js
// Manages global UI state: toasts, active modal, admin notifications
import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    // Toast notification
    toast: null,         // { message, type: "success"|"error"|"info" }

    // Admin notifications
    notifications: [],   // [{ id, icon, color, title, body, time, read }]
  },
  reducers: {
    showToast(state, action) {
      // payload: { message, type } or just a string (defaults to "success")
      state.toast = typeof action.payload === "string"
        ? { message: action.payload, type: "success" }
        : action.payload;
    },
    clearToast(state) {
      state.toast = null;
    },

    // Notifications
    addNotification(state, action) {
      // Avoid duplicates by id
      const exists = state.notifications.some(n => n.id === action.payload.id);
      if (!exists) state.notifications.unshift(action.payload);
      // Keep max 30
      if (state.notifications.length > 30) state.notifications.pop();
    },
    markNotificationRead(state, action) {
      const n = state.notifications.find(n => n.id === action.payload);
      if (n) n.read = true;
    },
    markAllNotificationsRead(state) {
      state.notifications.forEach(n => (n.read = true));
    },
    clearNotifications(state) {
      state.notifications = [];
    },
  },
});

export const {
  showToast,
  clearToast,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
} = uiSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectToast             = (state) => state.ui.toast;
export const selectNotifications     = (state) => state.ui.notifications;
export const selectUnreadCount       = (state) => state.ui.notifications.filter(n => !n.read).length;

export default uiSlice.reducer;
