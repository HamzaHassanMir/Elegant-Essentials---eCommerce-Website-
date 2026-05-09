import React, { useState } from "react";
import { Link }             from "react-router-dom";
import { useDispatch }      from "react-redux";
import { addToCart }        from "../store/cartSlice";

const ProductCard = ({ product }) => {
  const dispatch          = useDispatch();
  const [added, setAdded]     = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart(product));
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const salePrice = product.onSale && product.salePercent
    ? Math.round(product.price * (1 - product.salePercent / 100))
    : product.price;
  const origPrice = product.price;
  const discount  = product.onSale && product.salePercent ? product.salePercent : 25;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff", position: "relative", border: "1px solid #f0f0f0",
        transition: "box-shadow 0.3s",
        boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.10)" : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* Discount Badge */}
      <div style={{ position:"absolute", top:12, left:12, background:"#111", color:"white", fontFamily:"'Poppins',sans-serif", fontSize:11, fontWeight:700, padding:"3px 8px", zIndex:2, letterSpacing:"0.04em" }}>
        -{discount}%
      </div>

      {/* Image */}
      <Link to={`/product/${product._id}`} style={{ display:"block", overflow:"hidden", height:300, background:"#f8f8f8", position:"relative" }}>
        <img
          src={product.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop"}
          alt={product.name}
          style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.5s ease", transform:hovered?"scale(1.05)":"scale(1)" }}
        />
        {/* Quick-add overlay */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0,
          background:"rgba(0,0,0,0.75)", padding:"12px 16px",
          transform:hovered?"translateY(0)":"translateY(100%)",
          transition:"transform 0.3s ease",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <button onClick={handleAdd}
            style={{ background:"none", border:"none", color:added?"#4ade80":"white", fontFamily:"'Poppins',sans-serif", fontSize:12, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}>
            {added ? "✓ Added to Bag" : "+ Add to Bag"}
          </button>
        </div>
      </Link>

      {/* Info */}
      <div style={{ padding:"14px 14px 18px" }}>
        <Link to={`/product/${product._id}`} style={{ textDecoration:"none" }}>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:13, fontWeight:500, color:"#111", marginBottom:6, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {product.name}
          </p>
        </Link>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:14, fontWeight:700, color:"#111" }}>
            PKR {salePrice?.toLocaleString()}
          </span>
          {product.onSale && salePrice !== origPrice && (
            <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:12, color:"#aaa", textDecoration:"line-through" }}>
              PKR {origPrice?.toLocaleString()}
            </span>
          )}
        </div>
        <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:10, color:"#6c63ff", marginTop:4, fontWeight:500 }}>
          Pay only PKR {Math.round(salePrice / 2.6).toLocaleString()} now
        </p>
      </div>
    </div>
  );
};

export default ProductCard;