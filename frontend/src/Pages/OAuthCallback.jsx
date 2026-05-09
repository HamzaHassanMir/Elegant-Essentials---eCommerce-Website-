import React, { useEffect }           from "react";
import { useNavigate }                from "react-router-dom";
import { useDispatch }                from "react-redux";
import { setTokenFromStorage }        from "../store/authSlice";

// Lives at /oauth-callback
// The backend redirects here with ?token=xxx after Google login
const OAuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get("token");
    const error  = params.get("error");

    if (token) {
      // Save to localStorage then sync into Redux store
      localStorage.setItem("token", token);
      dispatch(setTokenFromStorage());
      navigate("/", { replace: true });
    } else {
      navigate("/login?error=" + (error || "oauth_failed"), { replace: true });
    }
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:"#FAF7F2", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:40, height:40, border:"2px solid #C9A84C", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 20px" }} />
        <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:12, color:"#8A8073", letterSpacing:"0.1em" }}>
          Completing sign in…
        </p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default OAuthCallback;