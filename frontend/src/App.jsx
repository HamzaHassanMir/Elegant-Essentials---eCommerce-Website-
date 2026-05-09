import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar         from "./components/Navbar";
import Home           from "./Pages/Home";
import Cart           from "./Pages/Cart";
import Login          from "./Pages/Login";
import Register       from "./Pages/Register";
import ProductDetails from "./Pages/ProductDetails";
import OAuthCallback  from "./Pages/OAuthCallback";
import AdminDashboard from "./Pages/AdminDashboard";
import AboutUs        from "./Pages/AboutUs";
import ContactUs      from "./Pages/ContactUs";
import CategoryPage   from "./Pages/CategoryPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin — no Navbar */}
        <Route path="/admin"          element={<AdminDashboard />} />
        {/* OAuth callback — no Navbar */}
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        {/* login-success alias for Google OAuth redirect */}
        <Route path="/login-success"  element={<OAuthCallback />} />

        {/* Storefront — with Navbar */}
        <Route path="/*" element={
          <>
            <Navbar />
            <Routes>
              <Route path="/"                element={<Home />} />
              <Route path="/cart"            element={<Cart />} />
              <Route path="/login"           element={<Login />} />
              <Route path="/register"        element={<Register />} />
              <Route path="/product/:id"     element={<ProductDetails />} />
              <Route path="/about"           element={<AboutUs />} />
              <Route path="/contact"         element={<ContactUs />} />
              <Route path="/category/:slug"  element={<CategoryPage />} />
            </Routes>
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;