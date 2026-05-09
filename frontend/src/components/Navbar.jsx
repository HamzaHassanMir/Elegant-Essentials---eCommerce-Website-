import React, { useState, useEffect } from "react";
import { Link, useNavigate }          from "react-router-dom";
import { useSelector, useDispatch }   from "react-redux";
import { selectCartCount }            from "../store/cartSlice";
import { selectIsLoggedIn, logout }   from "../store/authSlice";

const Navbar = () => {
  const dispatch   = useDispatch();
  const cartCount  = useSelector(selectCartCount);
  const isLoggedIn = useSelector(selectIsLoggedIn);

  const [bannerVisible, setBannerVisible] = useState(true);
  const [scrolled, setScrolled]           = useState(false);
  const [searchOpen, setSearchOpen]       = useState(false);
  const [searchQuery, setSearchQuery]     = useState("");
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [timeLeft, setTimeLeft]           = useState(38 * 60);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const pad  = n => String(n).padStart(2, "0");
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  const navLinks = [
    { label:"New In",     path:"/category/new-in" },
    { label:"Sale",       path:"/category/sale",  red: true },
    { label:"Women",      path:"/category/women" },
    { label:"Men",        path:"/category/men" },
    { label:"Bags",       path:"/category/bags" },
    { label:"Fragrances", path:"/category/fragrances" },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    setMobileOpen(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .nav-link:hover { color: #e63946 !important; }
        .nav-link.red { color: #e63946 !important; font-weight: 600; }
        .cart-badge { position:absolute; top:-6px; right:-6px; background:#e63946; color:white; font-size:9px; font-weight:700; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; }
        .mobile-menu { position:fixed; inset:0; background:white; z-index:300; overflow-y:auto; transform:translateX(-100%); transition:transform 0.3s ease; }
        .mobile-menu.open { transform:translateX(0); }
        .search-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:200; display:flex; align-items:flex-start; justify-content:center; padding-top:80px; }
        .search-box { background:white; width:100%; max-width:600px; padding:16px 20px; display:flex; align-items:center; gap:12px; box-shadow:0 8px 32px rgba(0,0,0,0.15); margin:0 16px; }
        .search-input { flex:1; border:none; outline:none; font-size:16px; font-family:'Poppins',sans-serif; }
        @media(max-width:768px){
          .desktop-links { display:none !important; }
          .hamburger-btn { display:flex !important; }
          .desktop-search { display:none !important; }
          .sale-countdown { display:none !important; }
        }
        @media(min-width:769px){ .hamburger-btn { display:none !important; } }
      `}</style>

      {/* Sale Banner */}
      {bannerVisible && (
        <div style={{ background:"#e63946", color:"white", padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"center", gap:16, position:"relative", zIndex:100, flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, fontFamily:"'Poppins',sans-serif", flexWrap:"wrap", justifyContent:"center" }}>
            <span style={{ fontSize:13, fontWeight:700, letterSpacing:"0.05em" }}>SUMMER SALE — UPTO 50% OFF</span>
            <div className="sale-countdown" style={{ display:"flex", gap:6, alignItems:"center" }}>
              {[["00","DAYS"],["00","HRS"],[pad(mins),"MINS"],[pad(secs),"SECS"]].map(([val,lbl])=>(
                <div key={lbl} style={{ textAlign:"center" }}>
                  <div style={{ background:"rgba(0,0,0,0.25)", padding:"2px 8px", borderRadius:3, fontSize:18, fontWeight:700, fontVariantNumeric:"tabular-nums", minWidth:36 }}>{val}</div>
                  <div style={{ fontSize:8, letterSpacing:"0.1em", marginTop:1 }}>{lbl}</div>
                </div>
              ))}
            </div>
            <Link to="/category/sale" style={{ background:"white", color:"#e63946", fontSize:11, fontWeight:700, padding:"6px 16px", textDecoration:"none", letterSpacing:"0.08em", borderRadius:2 }}>SHOP NOW</Link>
          </div>
          <button onClick={()=>setBannerVisible(false)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"white", fontSize:20, cursor:"pointer", padding:"4px" }}>×</button>
        </div>
      )}

      {/* Ticker */}
      <div style={{ background:"#111", color:"#ccc", padding:"7px 0", overflow:"hidden" }}>
        <div style={{ animation:"ticker 25s linear infinite", display:"inline-block", whiteSpace:"nowrap", fontFamily:"'Poppins',sans-serif", fontSize:11, letterSpacing:"0.06em" }}>
          {Array(6).fill("  ✦  Free Delivery Nationwide for Orders PKR 3500 and above").join("")}
        </div>
        <style>{`@keyframes ticker{0%{transform:translateX(100vw)}100%{transform:translateX(-100%)}}`}</style>
      </div>

      {/* Main Nav */}
      <nav style={{ background:"white", borderBottom:"2px solid #e63946", position:"sticky", top:0, zIndex:99, boxShadow:scrolled?"0 2px 16px rgba(0,0,0,0.08)":"none", transition:"box-shadow 0.3s" }}>
        <div style={{ maxWidth:1300, margin:"0 auto", padding:"0 20px", display:"flex", alignItems:"center", justifyContent:"space-between", height:64 }}>

          {/* Hamburger */}
          <button className="hamburger-btn" onClick={()=>setMobileOpen(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:4, display:"none", alignItems:"center" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>

          {/* Logo */}
          <Link to="/" style={{ fontFamily:"'Poppins',sans-serif", fontSize:24, fontWeight:700, color:"#111", textDecoration:"none", letterSpacing:"-0.02em" }}>Mir</Link>

          {/* Desktop links */}
          <div className="desktop-links" style={{ display:"flex", gap:24, alignItems:"center" }}>
            {navLinks.map(({label,path,red})=>(
              <Link key={label} to={path} className={`nav-link${red?" red":""}`}
                style={{ fontFamily:"'Poppins',sans-serif", fontSize:13, fontWeight:500, color:"#222", textDecoration:"none", transition:"color 0.2s" }}>
                {label}
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <button className="desktop-search" onClick={()=>setSearchOpen(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:0, color:"#111", display:"flex" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>

            {/* Account — shows logout if logged in */}
            {isLoggedIn ? (
              <button onClick={handleLogout} title="Sign out" style={{ background:"none", border:"none", cursor:"pointer", padding:0, color:"#e63946", display:"flex" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            ) : (
              <Link to="/login" style={{ color:"#111", display:"flex" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </Link>
            )}

            <Link to="/cart" style={{ position:"relative", color:"#111", display:"flex" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu${mobileOpen?" open":""}`}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid #f0f0f0" }}>
          <Link to="/" onClick={()=>setMobileOpen(false)} style={{ fontFamily:"'Poppins',sans-serif", fontSize:22, fontWeight:700, color:"#111", textDecoration:"none" }}>Mir</Link>
          <button onClick={()=>setMobileOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:24, color:"#666" }}>×</button>
        </div>
        <div style={{ padding:"16px 0" }}>
          {navLinks.map(({label,path,red})=>(
            <Link key={label} to={path} onClick={()=>setMobileOpen(false)}
              style={{ display:"block", padding:"14px 24px", fontFamily:"'Poppins',sans-serif", fontSize:15, fontWeight:500, color:red?"#e63946":"#111", textDecoration:"none", borderBottom:"1px solid #f5f5f5" }}>
              {label}
            </Link>
          ))}
          {isLoggedIn ? (
            <button onClick={handleLogout}
              style={{ display:"block", width:"100%", textAlign:"left", padding:"14px 24px", fontFamily:"'Poppins',sans-serif", fontSize:15, color:"#e63946", background:"none", border:"none", cursor:"pointer", borderBottom:"1px solid #f5f5f5" }}>
              Sign Out
            </button>
          ) : (
            <Link to="/login" onClick={()=>setMobileOpen(false)} style={{ display:"block", padding:"14px 24px", fontFamily:"'Poppins',sans-serif", fontSize:15, color:"#111", textDecoration:"none", borderBottom:"1px solid #f5f5f5" }}>Account</Link>
          )}
          <Link to="/cart" onClick={()=>setMobileOpen(false)} style={{ display:"block", padding:"14px 24px", fontFamily:"'Poppins',sans-serif", fontSize:15, color:"#111", textDecoration:"none", borderBottom:"1px solid #f5f5f5" }}>
            Cart {cartCount>0&&<span style={{ background:"#e63946", color:"white", fontSize:10, fontWeight:700, padding:"1px 7px", borderRadius:10, marginLeft:6 }}>{cartCount}</span>}
          </Link>
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div className="search-overlay" onClick={()=>setSearchOpen(false)}>
          <div className="search-box" onClick={e=>e.stopPropagation()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input autoFocus className="search-input" placeholder="Search for products…" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter"){ setSearchOpen(false); navigate(`/category/all?q=${searchQuery}`); }}} />
            <button onClick={()=>setSearchOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:"#999" }}>×</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;