import React, { useState, useEffect }      from "react";
import { Link, useNavigate, useLocation }  from "react-router-dom";
import { useDispatch, useSelector }        from "react-redux";
import { loginUser, clearAuthError, selectAuthLoading, selectAuthError, selectIsLoggedIn } from "../store/authSlice";

const BACKEND = "http://localhost:5000";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.4-7.7 19.4-20 0-1.3-.1-2.7-.4-4z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3.1 0 5.9 1.1 8 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-4.9l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.5 5C9.5 39.6 16.3 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.9l6.2 5.2C40.8 35.7 44 30.3 44 24c0-1.3-.1-2.7-.4-4z"/>
  </svg>
);

const Login = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const location   = useLocation();

  const loading    = useSelector(selectAuthLoading);
  const error      = useSelector(selectAuthError);
  const isLoggedIn = useSelector(selectIsLoggedIn);

  const [form, setForm]       = useState({ email:"", password:"" });
  const [showPwd, setShowPwd] = useState(false);
  const [oauthErr, setOauthErr] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) navigate("/");
  }, [isLoggedIn, navigate]);

  // Show OAuth error if redirected back with ?error=
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("error")) setOauthErr("Google sign-in failed. Please try again.");
  }, [location.search]);

  // Clear Redux auth error when component unmounts
  useEffect(() => () => { dispatch(clearAuthError()); }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ email: form.email, password: form.password }));
    if (loginUser.fulfilled.match(result)) navigate("/");
  };

  const handleGoogle = () => {
    window.location.href = `${BACKEND}/api/auth/google`;
  };

  const displayError = oauthErr || error;

  const inp = {
    width:"100%", background:"#fff", border:"1.5px solid #e5e7eb",
    padding:"13px 14px", color:"#1A1A1A", fontFamily:"'Montserrat',sans-serif",
    fontSize:12, letterSpacing:"0.04em", outline:"none", boxSizing:"border-box",
    borderRadius:6, transition:"border-color 0.2s",
  };

  return (
    <div style={{ minHeight:"100vh", backgroundColor:"#FAF7F2", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>
      <div style={{ width:"100%", maxWidth:420 }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:44 }}>
          <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:10, fontWeight:500, letterSpacing:"0.28em", textTransform:"uppercase", color:"#C9A84C", marginBottom:12 }}>Welcome Back</p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:40, fontWeight:400, color:"#1A1A1A", letterSpacing:"0.04em", marginBottom:12 }}>Sign In</h1>
          <div style={{ width:36, height:1, background:"#C9A84C", margin:"0 auto" }} />
        </div>

        {displayError && (
          <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", color:"#B91C1C", fontSize:11, padding:"11px 14px", marginBottom:20, letterSpacing:"0.04em", borderRadius:6 }}>
            {displayError}
          </div>
        )}

        {/* Google */}
        <button onClick={handleGoogle}
          style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:12, padding:"13px", background:"#fff", border:"1px solid #D9D2C5", fontFamily:"'Montserrat',sans-serif", fontSize:12, fontWeight:500, letterSpacing:"0.06em", color:"#1A1A1A", cursor:"pointer", marginBottom:24, borderRadius:6, transition:"border-color 0.2s, box-shadow 0.2s" }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="#1A1A1A";e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.08)";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="#D9D2C5";e.currentTarget.style.boxShadow="none";}}>
          <GoogleIcon /> Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24 }}>
          <div style={{ flex:1, height:1, background:"#D9D2C5" }} />
          <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:10, letterSpacing:"0.1em", color:"#8A8073" }}>OR</span>
          <div style={{ flex:1, height:1, background:"#D9D2C5" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label style={{ fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase", color:"#8A8073", display:"block", marginBottom:7 }}>Email Address</label>
            <input type="email" required style={inp} placeholder="your@email.com" value={form.email}
              onFocus={e=>e.target.style.borderColor="#1A1A1A"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}
              onChange={e=>setForm({...form,email:e.target.value})} />
          </div>
          <div>
            <label style={{ fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase", color:"#8A8073", display:"block", marginBottom:7 }}>Password</label>
            <div style={{ position:"relative" }}>
              <input type={showPwd?"text":"password"} required style={{ ...inp, paddingRight:44 }} placeholder="••••••••" value={form.password}
                onFocus={e=>e.target.style.borderColor="#1A1A1A"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}
                onChange={e=>setForm({...form,password:e.target.value})} />
              <button type="button" onClick={()=>setShowPwd(v=>!v)}
                style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#8A8073", padding:0, display:"flex" }}>
                {showPwd
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z"/></svg>
                }
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            style={{ padding:"15px", background:loading?"#8A8073":"#1A1A1A", color:"#FAF7F2", border:"none", fontFamily:"'Montserrat',sans-serif", fontSize:11, fontWeight:500, letterSpacing:"0.2em", textTransform:"uppercase", cursor:loading?"not-allowed":"pointer", marginTop:4, borderRadius:6, transition:"background 0.3s" }}
            onMouseEnter={e=>{if(!loading)e.target.style.background="#C9A84C";}}
            onMouseLeave={e=>{if(!loading)e.target.style.background="#1A1A1A";}}>
            {loading ? "Signing In…" : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign:"center", fontFamily:"'Montserrat',sans-serif", fontSize:12, color:"#8A8073", marginTop:28 }}>
          New to Maison?{" "}
          <Link to="/register" style={{ color:"#1A1A1A", fontWeight:500, textDecoration:"underline" }}>Create Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;