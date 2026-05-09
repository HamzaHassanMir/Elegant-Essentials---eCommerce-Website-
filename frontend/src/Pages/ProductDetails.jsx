import React, { useEffect, useState }  from "react";
import { useParams, Link }             from "react-router-dom";
import { useDispatch }                 from "react-redux";
import { addToCart }                   from "../store/cartSlice";

const ProductDetails = () => {
  const { id }    = useParams();
  const dispatch  = useDispatch();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded]     = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
      .then(res => res.json())
      .then(data => { setProduct(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    dispatch(addToCart(product));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return (
    <div style={{ minHeight:"80vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:"#8A8073", letterSpacing:"0.1em" }}>Loading…</p>
    </div>
  );

  if (!product) return (
    <div style={{ minHeight:"80vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:20 }}>
      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:"#8A8073" }}>Product not found</p>
      <Link to="/" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:11, letterSpacing:"0.16em", textTransform:"uppercase", color:"#1A1A1A", textDecoration:"underline" }}>
        Back to Collections
      </Link>
    </div>
  );

  const salePrice = product.onSale && product.salePercent
    ? Math.round(product.price * (1 - product.salePercent / 100))
    : product.price;

  return (
    <div style={{ minHeight:"100vh", backgroundColor:"#FAF7F2" }}>

      {/* Breadcrumb */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 40px" }}>
        <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:10, letterSpacing:"0.14em", color:"#8A8073" }}>
          <Link to="/" style={{ color:"#8A8073", textDecoration:"none" }}>Collections</Link>
          {" / "}
          <span style={{ color:"#1A1A1A" }}>{product.name}</span>
        </p>
      </div>

      {/* Layout */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 40px 80px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"start" }}>

        {/* Image */}
        <div style={{ position:"sticky", top:120 }}>
          <img
            src={product.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=720&fit=crop"}
            alt={product.name}
            style={{ width:"100%", aspectRatio:"4/5", objectFit:"cover" }}
          />
        </div>

        {/* Details */}
        <div style={{ paddingTop:20 }}>
          <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:10, fontWeight:500, letterSpacing:"0.24em", textTransform:"uppercase", color:"#C9A84C", marginBottom:16 }}>
            {product.onSale ? `🏷️ ${product.salePercent}% OFF` : "New Season"}
          </p>

          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:48, fontWeight:400, color:"#1A1A1A", letterSpacing:"0.04em", lineHeight:1.1, marginBottom:20 }}>
            {product.name}
          </h1>

          <div style={{ width:36, height:1, background:"#C9A84C", marginBottom:20 }} />

          {/* Price */}
          <div style={{ display:"flex", alignItems:"baseline", gap:12, marginBottom:28 }}>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:400, color:"#1A1A1A" }}>
              PKR {salePrice?.toLocaleString()}
            </p>
            {product.onSale && salePrice !== product.price && (
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:"#aaa", textDecoration:"line-through" }}>
                PKR {product.price?.toLocaleString()}
              </p>
            )}
          </div>

          <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:13, fontWeight:300, color:"#8A8073", lineHeight:1.9, letterSpacing:"0.04em", marginBottom:40, maxWidth:440 }}>
            {product.description || "A masterfully crafted piece from our latest collection. Designed to transcend seasons, this piece embodies our commitment to timeless elegance and uncompromising quality."}
          </p>

          <button onClick={handleAdd}
            style={{ width:"100%", padding:18, background:added?"#C9A84C":"#1A1A1A", color:"#FAF7F2", border:"none", fontFamily:"'Montserrat',sans-serif", fontSize:11, fontWeight:500, letterSpacing:"0.2em", textTransform:"uppercase", cursor:"pointer", transition:"background 0.3s", marginBottom:16 }}>
            {added ? "✓ Added to Bag" : "Add to Bag"}
          </button>

          <Link to="/cart"
            style={{ display:"block", textAlign:"center", padding:17, background:"transparent", border:"1px solid #1A1A1A", color:"#1A1A1A", fontFamily:"'Montserrat',sans-serif", fontSize:11, fontWeight:500, letterSpacing:"0.2em", textTransform:"uppercase", textDecoration:"none", transition:"all 0.3s" }}
            onMouseEnter={e=>{e.currentTarget.style.background="#1A1A1A";e.currentTarget.style.color="#FAF7F2";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#1A1A1A";}}>
            View Bag
          </Link>

          {/* Care info */}
          <div style={{ marginTop:48, borderTop:"1px solid #D9D2C5", paddingTop:28 }}>
            {[
              { icon:"✦", label:"Premium Quality Fabric" },
              { icon:"✦", label:"Free shipping over PKR 3,500" },
              { icon:"✦", label:"Easy 14-day returns" },
            ].map(({ icon, label }) => (
              <div key={label} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                <span style={{ color:"#C9A84C", fontSize:8 }}>{icon}</span>
                <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:11, letterSpacing:"0.08em", color:"#8A8073" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;