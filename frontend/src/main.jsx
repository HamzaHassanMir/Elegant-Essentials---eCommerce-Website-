import { StrictMode } from "react";
import { createRoot }  from "react-dom/client";
import { Provider }    from "react-redux";
import store           from "./store/index";
import "./index.css";
import App             from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Redux store wraps the entire app.
        CartProvider has been removed — cart state now lives in Redux. */}
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);