import React                           from "react";
import { Link, useNavigate }           from "react-router-dom";
import { useSelector, useDispatch }    from "react-redux";
import {
  selectCartItems,
  selectCartSubtotal,
  selectCartCount,
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../store/cartSlice";
import {
  placeOrder,
  selectOrderPlacing,
  selectOrderError,
  selectLastPlaced,
  clearLastPlaced,
} from "../store/ordersSlice";
import { selectIsLoggedIn } from "../store/authSlice";

export default function Cart() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();

  const items      = useSelector(selectCartItems);
  const subtotal   = useSelector(selectCartSubtotal);
  const cartCount  = useSelector(selectCartCount);
  const isPlacing  = useSelector(selectOrderPlacing);
  const orderError = useSelector(selectOrderError);
  const lastPlaced = useSelector(selectLastPlaced);
  const isLoggedIn = useSelector(selectIsLoggedIn);

  const shipping = subtotal >= 3500 ? 0 : 250;
  const total    = subtotal + shipping;

  const handleCheckout = async () => {
    if (!isLoggedIn) { navigate("/login"); return; }
    const products = items.map(item => ({
      productId: item._id,
      name:      item.name,
      price:     item.price,
      image:     item.image,
      quantity:  item.quantity || 1,
    }));
    const result = await dispatch(placeOrder({ products, totalAmount: total }));
    if (placeOrder.fulfilled.match(result)) {
      dispatch(clearCart());
      dispatch(clearLastPlaced());
      navigate("/");
    }
  };

  return (
    <div style={{ fontFamily:"'Poppins',sans-serif", minHeight:"100vh", background:"#fafafa" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box}
        @media(max-width:768px){
          .cart-layout{grid-template-columns:1fr !important}
          .cart-summary{position:static !important}
        }
        .qty-btn{width:30px;height:30px;border:1.5px solid #e5e7eb;background:white;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:background 0.15s}
        .qty-btn:hover{background:#f5f5f5}
      `}</style>

      {/* Breadcrumb */}
      <div style={{ background:"white", borderBottom:"1px solid #eee", padding:"16px 24px", display:"flex", alignItems:"center", gap:12 }}>
        <Link to="/" style={{ color:"#888", textDecoration:"none", fontSize:13 }}>Home</Link>
        <span style={{ color:"#ccc" }}>›</span>
        <span style={{ color:"#111", fontSize:13, fontWeight:600 }}>Shopping Bag</span>
      </div>

      <div className="cart-layout" style={{ maxWidth:1200, margin:"0 auto", padding:"40px 24px", display:"grid", gridTemplateColumns:"1fr 360px", gap:32, alignItems:"start" }}>

        {/* ── Items ── */}
        <div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
            <h1 style={{ fontSize:26, fontWeight:700, color:"#111" }}>
              Shopping Bag{" "}
              <span style={{ fontSize:15, fontWeight:400, color:"#888" }}>({cartCount} item{cartCount!==1?"s":""})</span>
            </h1>
            {items.length > 0 && (
              <button onClick={()=>dispatch(clearCart())}
                style={{ background:"none", border:"1px solid #ddd", color:"#888", fontFamily:"'Poppins',sans-serif", fontSize:11, fontWeight:600, padding:"6px 16px", cursor:"pointer", letterSpacing:"0.06em", borderRadius:4 }}>
                Clear All
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div style={{ background:"white", border:"1px solid #eee", padding:"80px 40px", textAlign:"center", borderRadius:4 }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🛍️</div>
              <p style={{ fontSize:20, fontWeight:600, color:"#111", marginBottom:8 }}>Your bag is empty</p>
              <p style={{ fontSize:13, color:"#888", marginBottom:28 }}>Add items to get started</p>
              <Link to="/" style={{ background:"#e63946", color:"white", fontFamily:"'Poppins',sans-serif", fontSize:13, fontWeight:700, padding:"13px 36px", textDecoration:"none", borderRadius:4 }}>
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div style={{ background:"white", border:"1px solid #eee", borderRadius:4, overflow:"hidden" }}>
              {items.map((item, i) => (
                <div key={`${item._id}-${i}`}
                  style={{ display:"flex", gap:16, padding:"20px 24px", borderBottom:i<items.length-1?"1px solid #f0f0f0":"none", alignItems:"center" }}>
                  <div style={{ width:80, height:100, background:"#f5f5f5", flexShrink:0, overflow:"hidden", borderRadius:2 }}>
                    <img
                      src={item.image||"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&fit=crop"}
                      alt={item.name}
                      style={{ width:"100%", height:"100%", objectFit:"cover" }}
                    />
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:600, fontSize:14, color:"#111", marginBottom:4 }}>{item.name}</p>
                    <p style={{ fontSize:12, color:"#888", marginBottom:14 }}>{item.category||"Fashion"}</p>
                    {/* Quantity controls */}
                    <div style={{ display:"flex", alignItems:"center", gap:0 }}>
                      <button className="qty-btn" onClick={()=>dispatch(updateQuantity({index:i, quantity:(item.quantity||1)-1}))}>−</button>
                      <div style={{ width:40, textAlign:"center", fontSize:13, fontWeight:600, color:"#111", border:"1.5px solid #e5e7eb", borderLeft:"none", borderRight:"none", height:30, lineHeight:"28px" }}>
                        {item.quantity||1}
                      </div>
                      <button className="qty-btn" onClick={()=>dispatch(updateQuantity({index:i, quantity:(item.quantity||1)+1}))}>+</button>
                      <button onClick={()=>dispatch(removeFromCart(i))}
                        style={{ background:"none", border:"none", color:"#e63946", fontFamily:"'Poppins',sans-serif", fontSize:11, fontWeight:600, cursor:"pointer", padding:"0 0 0 16px" }}>
                        Remove
                      </button>
                    </div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <p style={{ fontWeight:700, fontSize:15, color:"#111" }}>PKR {((item.price||0)*(item.quantity||1)).toLocaleString()}</p>
                    <p style={{ fontSize:11, color:"#aaa", marginTop:4 }}>PKR {item.price?.toLocaleString()} each</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Order Summary ── */}
        {items.length > 0 && (
          <div className="cart-summary" style={{ background:"white", border:"1px solid #eee", padding:"28px", position:"sticky", top:90, borderRadius:4 }}>
            <h2 style={{ fontSize:18, fontWeight:700, color:"#111", marginBottom:20, paddingBottom:16, borderBottom:"1px solid #eee" }}>Order Summary</h2>

            {[
              { label:`Subtotal (${cartCount} item${cartCount!==1?"s":""})`, value:`PKR ${subtotal.toLocaleString()}` },
              { label:"Shipping", value:shipping===0?"Free 🎉":`PKR ${shipping}` },
            ].map(({label,value})=>(
              <div key={label} style={{ display:"flex", justifyContent:"space-between", marginBottom:14, fontSize:13, color:"#555" }}>
                <span>{label}</span>
                <span style={{ fontWeight:500, color:value.includes("Free")?"#10b981":"#111" }}>{value}</span>
              </div>
            ))}

            {shipping>0 && (
              <p style={{ fontSize:11, color:"#e63946", marginBottom:14, fontWeight:500, background:"#fff5f5", padding:"8px 10px", borderRadius:4 }}>
                Add PKR {(3500-subtotal).toLocaleString()} more for free shipping
              </p>
            )}

            {orderError && (
              <p style={{ fontSize:12, color:"#dc2626", background:"#fef2f2", padding:"8px 10px", borderRadius:4, marginBottom:14 }}>
                ⚠️ {orderError}
              </p>
            )}

            <div style={{ borderTop:"2px solid #111", paddingTop:14, display:"flex", justifyContent:"space-between", marginBottom:24 }}>
              <span style={{ fontWeight:700, fontSize:15, color:"#111" }}>Total</span>
              <span style={{ fontWeight:800, fontSize:22, color:"#111" }}>PKR {total.toLocaleString()}</span>
            </div>

            <button onClick={handleCheckout} disabled={isPlacing}
              style={{ width:"100%", background:isPlacing?"#9ca3af":"#e63946", color:"white", border:"none", fontFamily:"'Poppins',sans-serif", fontSize:14, fontWeight:700, padding:"15px", cursor:isPlacing?"not-allowed":"pointer", marginBottom:12, transition:"opacity 0.2s", borderRadius:4 }}
              onMouseEnter={e=>{if(!isPlacing)e.target.style.opacity="0.9";}} onMouseLeave={e=>e.target.style.opacity="1"}>
              {isPlacing ? "Placing Order…" : isLoggedIn ? "Place Order" : "Sign In to Checkout"}
            </button>

            <Link to="/" style={{ display:"block", textAlign:"center", fontFamily:"'Poppins',sans-serif", fontSize:12, color:"#888", textDecoration:"underline" }}>
              Continue Shopping
            </Link>

            <div style={{ marginTop:20, borderTop:"1px solid #f0f0f0", paddingTop:16, display:"flex", gap:12, alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:10, color:"#aaa" }}>🔒 Secure Checkout</span>
              <span style={{ fontSize:10, color:"#aaa" }}>|</span>
              <span style={{ fontSize:10, color:"#aaa" }}>💳 Cash on Delivery</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}