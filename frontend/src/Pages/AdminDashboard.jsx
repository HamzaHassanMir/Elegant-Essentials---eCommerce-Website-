import React, { useState, useEffect, useRef, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const API   = "http://localhost:5000/api";
const token = () => localStorage.getItem("token");

const req = async (path, options = {}) => {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type":"application/json", Authorization:`Bearer ${token()}`, ...(options.headers||{}) },
  });
  if (!res.ok) throw new Error((await res.json()) || "Request failed");
  return res.json();
};

// Upload image to ImgBB (free, no auth needed for public uploads)
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  // Using base64 approach that works without API key
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result); // returns base64 data URL
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const ICONS = {
  home:    "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  product: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  users:   "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  orders:  "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0",
  tag:     "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01",
  sale:    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  logout:  "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  plus:    "M12 5v14M5 12h14",
  edit:    "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:   "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  x:       "M18 6L6 18M6 6l12 12",
  check:   "M20 6L9 17l-5-5",
  alert:   "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  eye:     "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  search:  "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  bell:    "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  upload:  "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  link:    "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
};

const Ic = ({ d, size=16, stroke="currentColor", fill="none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {d.split(" M").map((p,i) => <path key={i} d={i===0?p:"M"+p} />)}
  </svg>
);

const STATUS_COLORS = { pending:"#f59e0b", processing:"#3b82f6", shipped:"#8b5cf6", delivered:"#10b981", cancelled:"#ef4444" };
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const EMPTY_P = { name:"", price:"", description:"", imageUrl:"", stock:"", category:"", onSale:false, salePercent:"25" };
const EMPTY_C = { name:"", description:"" };

// ── Login Gate ────────────────────────────────────────────────────────────────
function LoginGate({ onLogin }) {
  const [email, setEmail]     = useState("");
  const [pwd, setPwd]         = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/auth/login`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email,password:pwd}) });
      const data = await res.json();
      if (!res.ok) { setError(data||"Invalid credentials"); return; }
      localStorage.setItem("token", data.token);
      onLogin();
    } catch { setError("Cannot reach server. Is backend running?"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f5f6fa", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Poppins',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{ background:"white", borderRadius:12, padding:"48px 40px", width:400, boxShadow:"0 4px 32px rgba(0,0,0,0.08)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:32 }}>
          <div style={{ width:36, height:36, background:"#2563eb", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ color:"white", fontWeight:800, fontSize:16 }}>EE</span>
          </div>
          <span style={{ fontWeight:700, fontSize:18, color:"#111" }}>Elegant Essentials Admin</span>
        </div>
        <h2 style={{ fontSize:22, fontWeight:700, color:"#111", marginBottom:6 }}>Welcome back</h2>
        <p style={{ fontSize:13, color:"#888", marginBottom:28 }}>Sign in to your admin console</p>
        {error && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", color:"#dc2626", fontSize:12, padding:"10px 14px", borderRadius:6, marginBottom:20 }}>{error}</div>}
        <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>Email</label>
            <input type="email" value={email} placeholder="admin@example.com" onChange={e=>setEmail(e.target.value)} required
              style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e5e7eb", borderRadius:8, fontFamily:"'Poppins',sans-serif", fontSize:13, outline:"none" }}
              onFocus={e=>e.target.style.borderColor="#2563eb"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>Password</label>
            <input type="password" value={pwd} placeholder="••••••••" onChange={e=>setPwd(e.target.value)} required
              style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #e5e7eb", borderRadius:8, fontFamily:"'Poppins',sans-serif", fontSize:13, outline:"none" }}
              onFocus={e=>e.target.style.borderColor="#2563eb"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
          </div>
          <button type="submit" disabled={loading}
            style={{ marginTop:8, background:"#2563eb", color:"white", border:"none", borderRadius:8, padding:"12px", fontFamily:"'Poppins',sans-serif", fontSize:14, fontWeight:600, cursor:"pointer" }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <p style={{ textAlign:"center", fontSize:11, color:"#ccc", marginTop:24 }}>Use your storefront account credentials</p>
      </div>
    </div>
  );
}

// ── DeleteDialog ──────────────────────────────────────────────────────────────
function DeleteDialog({ msg, onConfirm, onCancel }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:60, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"white", borderRadius:12, padding:"32px 36px", maxWidth:340, width:"90%", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ width:48, height:48, background:"#fef2f2", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
          <Ic d={ICONS.alert} size={22} stroke="#dc2626" />
        </div>
        <p style={{ fontWeight:700, fontSize:17, color:"#111", marginBottom:8 }}>Confirm Delete</p>
        <p style={{ fontSize:12, color:"#888", lineHeight:1.7, marginBottom:24 }}>{msg}</p>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onConfirm} style={{ flex:1, background:"#dc2626", color:"white", border:"none", borderRadius:8, padding:"11px", fontFamily:"'Poppins',sans-serif", fontWeight:600, cursor:"pointer", fontSize:13 }}>Delete</button>
          <button onClick={onCancel}  style={{ flex:1, background:"white", color:"#374151", border:"1.5px solid #e5e7eb", borderRadius:8, padding:"11px", fontFamily:"'Poppins',sans-serif", fontWeight:600, cursor:"pointer", fontSize:13 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── ImageUploader (standalone component — never re-creates on parent render) ──
function ImageUploader({ value, onChange }) {
  const fileRef  = useRef();
  const [mode, setMode]       = useState(value && !value.startsWith("data:") ? "url" : "upload");
  const [preview, setPreview] = useState(value || "");
  const [urlInput, setUrlInput] = useState(value && !value.startsWith("data:") ? value : "");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]   = useState(false);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const dataUrl = await uploadImage(file);
      setPreview(dataUrl);
      onChange(dataUrl);
    } catch { alert("Failed to read image."); }
    finally { setUploading(false); }
  };

  const handleUrl = (v) => {
    setUrlInput(v);
    setPreview(v);
    onChange(v);
  };

  return (
    <div>
      {/* Mode toggle */}
      <div style={{ display:"flex", gap:0, marginBottom:12, border:"1.5px solid #e5e7eb", borderRadius:8, overflow:"hidden" }}>
        {[["upload","📁 Upload File"],["url","🔗 Paste URL"]].map(([m,lbl])=>(
          <button key={m} type="button" onClick={()=>setMode(m)}
            style={{ flex:1, padding:"8px", border:"none", background:mode===m?"#2563eb":"white", color:mode===m?"white":"#6b7280", fontFamily:"'Poppins',sans-serif", fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>
            {lbl}
          </button>
        ))}
      </div>

      {mode === "url" ? (
        <div style={{ display:"flex", gap:8 }}>
          <input
            type="text"
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={e=>handleUrl(e.target.value)}
            style={{ flex:1, padding:"9px 12px", border:"1.5px solid #e5e7eb", borderRadius:7, fontFamily:"'Poppins',sans-serif", fontSize:12, outline:"none" }}
            onFocus={e=>e.target.style.borderColor="#2563eb"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}
          />
        </div>
      ) : (
        <div
          onDragOver={e=>{e.preventDefault();setDragOver(true);}}
          onDragLeave={()=>setDragOver(false)}
          onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0]);}}
          onClick={()=>fileRef.current?.click()}
          style={{ border:`2px dashed ${dragOver?"#2563eb":"#e5e7eb"}`, borderRadius:8, padding:"28px 16px", textAlign:"center", cursor:"pointer", background:dragOver?"#eff6ff":"#fafafa", transition:"all 0.2s" }}
        >
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e=>handleFile(e.target.files[0])} />
          {uploading ? (
            <p style={{ fontSize:12, color:"#6b7280" }}>Processing…</p>
          ) : (
            <>
              <Ic d={ICONS.upload} size={24} stroke="#9ca3af" />
              <p style={{ fontSize:12, color:"#6b7280", marginTop:8 }}>Click or drag & drop an image</p>
              <p style={{ fontSize:10, color:"#aaa", marginTop:4 }}>PNG, JPG, WEBP up to 5MB</p>
            </>
          )}
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div style={{ marginTop:10, position:"relative", display:"inline-block" }}>
          <img src={preview} alt="preview" style={{ width:120, height:140, objectFit:"cover", borderRadius:8, border:"1px solid #e5e7eb" }}
            onError={e=>{e.target.style.display="none";}} />
          <button type="button" onClick={()=>{setPreview("");setUrlInput("");onChange("");}}
            style={{ position:"absolute", top:-6, right:-6, background:"#dc2626", border:"none", borderRadius:"50%", width:20, height:20, color:"white", fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
      )}
    </div>
  );
}

// ── ProductPanel (standalone to prevent focus loss) ───────────────────────────
function ProductPanel({ open, onClose, editId, form, setForm, onSave, saving, categories }) {
  if (!open) return null;
  const inp = { width:"100%", padding:"9px 12px", border:"1.5px solid #e5e7eb", borderRadius:7, fontFamily:"'Poppins',sans-serif", fontSize:12, outline:"none", boxSizing:"border-box" };
  const lbl = { fontSize:11, fontWeight:600, color:"#6b7280", display:"block", marginBottom:6, letterSpacing:"0.04em", textTransform:"uppercase" };
  const fo  = e => (e.target.style.borderColor="#2563eb");
  const bl  = e => (e.target.style.borderColor="#e5e7eb");
  return (
    <>
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.3)", zIndex:40 }} onClick={onClose} />
      <div style={{ position:"fixed", top:0, right:0, width:440, height:"100vh", background:"white", zIndex:50, padding:"28px 28px 32px", overflowY:"auto", boxShadow:"-4px 0 32px rgba(0,0,0,0.08)", display:"flex", flexDirection:"column", gap:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h2 style={{ fontSize:18, fontWeight:700, color:"#111" }}>{editId ? "Edit Product" : "New Product"}</h2>
          <button onClick={onClose} style={{ background:"#f5f6fa", border:"none", borderRadius:8, padding:"6px 8px", cursor:"pointer", display:"flex" }}><Ic d={ICONS.x} size={16} /></button>
        </div>

        {/* Name */}
        <div>
          <label style={lbl}>Product Name *</label>
          <input type="text" style={inp} placeholder="e.g. Classic Linen Kurta" value={form.name}
            onFocus={fo} onBlur={bl} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
        </div>

        {/* Price + Stock */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>
            <label style={lbl}>Price (PKR) *</label>
            <input type="number" style={inp} placeholder="4500" value={form.price}
              onFocus={fo} onBlur={bl} onChange={e=>setForm(f=>({...f,price:e.target.value}))} />
          </div>
          <div>
            <label style={lbl}>Stock Quantity</label>
            <input type="number" style={inp} placeholder="25" value={form.stock}
              onFocus={fo} onBlur={bl} onChange={e=>setForm(f=>({...f,stock:e.target.value}))} />
          </div>
        </div>

        {/* Category */}
        <div>
          <label style={lbl}>Category</label>
          <select style={{ ...inp, background:"white", cursor:"pointer" }} value={form.category}
            onFocus={fo} onBlur={bl} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
            <option value="">— Select a category —</option>
            {categories.map(c=><option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        {/* Sale toggle */}
        <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:8, padding:"14px 16px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: form.onSale ? 12 : 0 }}>
            <div>
              <p style={{ fontWeight:600, fontSize:13, color:"#92400e" }}>🏷️ Add to Sale</p>
              <p style={{ fontSize:11, color:"#a16207", marginTop:2 }}>Product will appear in the Sale section</p>
            </div>
            <button type="button" onClick={()=>setForm(f=>({...f,onSale:!f.onSale}))}
              style={{ width:44, height:24, borderRadius:12, border:"none", cursor:"pointer", background:form.onSale?"#f59e0b":"#d1d5db", transition:"background 0.2s", position:"relative" }}>
              <div style={{ width:18, height:18, borderRadius:"50%", background:"white", position:"absolute", top:3, left:form.onSale?23:3, transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }} />
            </button>
          </div>
          {form.onSale && (
            <div>
              <label style={{ ...lbl, color:"#92400e" }}>Discount Percentage</label>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <input type="number" min="1" max="90" style={{ ...inp, width:90 }} value={form.salePercent}
                  onFocus={fo} onBlur={bl} onChange={e=>setForm(f=>({...f,salePercent:e.target.value}))} />
                <span style={{ fontSize:13, fontWeight:700, color:"#f59e0b" }}>% OFF</span>
                {form.price && <span style={{ fontSize:11, color:"#888" }}>
                  Sale price: PKR {Math.round(Number(form.price) * (1 - Number(form.salePercent||0)/100)).toLocaleString()}
                </span>}
              </div>
            </div>
          )}
        </div>

        {/* Image */}
        <div>
          <label style={lbl}>Product Image</label>
          <ImageUploader value={form.imageUrl} onChange={v=>setForm(f=>({...f,imageUrl:v}))} />
        </div>

        {/* Description */}
        <div>
          <label style={lbl}>Description</label>
          <textarea style={{ ...inp, minHeight:80, resize:"vertical" }} placeholder="Brief description…" value={form.description}
            onFocus={fo} onBlur={bl} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
        </div>

        <div style={{ display:"flex", gap:10, marginTop:4 }}>
          <button onClick={onSave} disabled={saving}
            style={{ flex:1, background:"#2563eb", color:"white", border:"none", borderRadius:8, padding:"12px", fontFamily:"'Poppins',sans-serif", fontSize:13, fontWeight:600, cursor:saving?"not-allowed":"pointer" }}>
            {saving ? "Saving…" : editId ? "Update Product" : "Add Product"}
          </button>
          <button onClick={onClose}
            style={{ flex:1, background:"white", color:"#374151", border:"1.5px solid #e5e7eb", borderRadius:8, padding:"12px", fontFamily:"'Poppins',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer" }}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

// ── CategoryPanel (standalone) ────────────────────────────────────────────────
function CategoryPanel({ open, onClose, editIdx, form, setForm, onSave }) {
  if (!open) return null;
  const inp = { width:"100%", padding:"9px 12px", border:"1.5px solid #e5e7eb", borderRadius:7, fontFamily:"'Poppins',sans-serif", fontSize:12, outline:"none", boxSizing:"border-box" };
  const lbl = { fontSize:11, fontWeight:600, color:"#6b7280", display:"block", marginBottom:6, letterSpacing:"0.04em", textTransform:"uppercase" };
  return (
    <>
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.3)", zIndex:40 }} onClick={onClose} />
      <div style={{ position:"fixed", top:0, right:0, width:360, height:"100vh", background:"white", zIndex:50, padding:"32px 28px", boxShadow:"-4px 0 32px rgba(0,0,0,0.08)", display:"flex", flexDirection:"column", gap:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h2 style={{ fontSize:18, fontWeight:700, color:"#111" }}>{editIdx !== null ? "Edit Category" : "New Category"}</h2>
          <button onClick={onClose} style={{ background:"#f5f6fa", border:"none", borderRadius:8, padding:"6px 8px", cursor:"pointer", display:"flex" }}><Ic d={ICONS.x} size={16} /></button>
        </div>
        <div>
          <label style={lbl}>Name *</label>
          <input type="text" style={inp} placeholder="e.g. Kurta" value={form.name}
            onFocus={e=>e.target.style.borderColor="#2563eb"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}
            onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
        </div>
        <div>
          <label style={lbl}>Description</label>
          <textarea style={{ ...inp, minHeight:80, resize:"vertical" }} placeholder="Brief description…" value={form.description}
            onFocus={e=>e.target.style.borderColor="#2563eb"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}
            onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onSave} style={{ flex:1, background:"#2563eb", color:"white", border:"none", borderRadius:8, padding:"12px", fontFamily:"'Poppins',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer" }}>
            {editIdx !== null ? "Update" : "Add Category"}
          </button>
          <button onClick={onClose} style={{ flex:1, background:"white", color:"#374151", border:"1.5px solid #e5e7eb", borderRadius:8, padding:"12px", fontFamily:"'Poppins',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer" }}>Cancel</button>
        </div>
      </div>
    </>
  );
}

// ── Notifications Panel ────────────────────────────────────────────────────────
function NotificationsPanel({ open, onClose, notifications, onClear, onMarkRead }) {
  if (!open) return null;
  return (
    <>
      <div style={{ position:"fixed", inset:0, zIndex:199 }} onClick={onClose} />
      <div style={{ position:"fixed", top:64, right:24, width:360, background:"white", borderRadius:12, boxShadow:"0 8px 40px rgba(0,0,0,0.15)", zIndex:200, overflow:"hidden", border:"1px solid #e5e7eb" }}>
        <div style={{ padding:"16px 20px", borderBottom:"1px solid #f0f0f0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <p style={{ fontWeight:700, fontSize:15, color:"#111" }}>Notifications</p>
          <button onClick={onClear} style={{ background:"none", border:"none", fontSize:11, color:"#e63946", fontWeight:600, cursor:"pointer" }}>Clear All</button>
        </div>
        <div style={{ maxHeight:420, overflowY:"auto" }}>
          {notifications.length === 0 ? (
            <div style={{ padding:"40px 20px", textAlign:"center" }}>
              <div style={{ fontSize:32, marginBottom:8 }}>🔔</div>
              <p style={{ fontSize:13, color:"#888" }}>No notifications</p>
            </div>
          ) : notifications.map(n => (
            <div key={n.id} onClick={()=>onMarkRead(n.id)}
              style={{ padding:"14px 20px", borderBottom:"1px solid #f9f9f9", cursor:"pointer", background:n.read?"white":"#f0f9ff", transition:"background 0.15s" }}>
              <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:n.color+"20", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ fontSize:14 }}>{n.icon}</span>
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13, fontWeight:n.read?400:600, color:"#111", marginBottom:2 }}>{n.title}</p>
                  <p style={{ fontSize:11, color:"#888" }}>{n.body}</p>
                  <p style={{ fontSize:10, color:"#aaa", marginTop:4 }}>{n.time}</p>
                </div>
                {!n.read && <div style={{ width:8, height:8, borderRadius:"50%", background:"#2563eb", flexShrink:0, marginTop:4 }} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const [authed, setAuthed]         = useState(!!localStorage.getItem("token"));
  const [page, setPage]             = useState("home");
  const [products, setProducts]     = useState([]);
  const [orders, setOrders]         = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState(null);
  const [saving, setSaving]         = useState(false);
  const [signOutDlg, setSignOutDlg] = useState(false);
  const [notifOpen, setNotifOpen]   = useState(false);

  // product state (hoisted to dashboard level — prevents focus loss)
  const [prodForm, setProdForm]     = useState(EMPTY_P);
  const [editProdId, setEditProdId] = useState(null);
  const [prodPanel, setProdPanel]   = useState(false);
  const [delProdId, setDelProdId]   = useState(null);
  const [prodSearch, setProdSearch] = useState("");

  // category state (hoisted)
  const [catForm, setCatForm]       = useState(EMPTY_C);
  const [editCatIdx, setEditCatIdx] = useState(null);
  const [catPanel, setCatPanel]     = useState(false);
  const [delCatIdx, setDelCatIdx]   = useState(null);

  // order state (hoisted)
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandOrder, setExpandOrder] = useState(null);
  const [updatingOrd, setUpdatingOrd] = useState(null);

  // notifications
  const [notifications, setNotifications] = useState([]);
  const prevOrderCount = useRef(0);

  const showToast = useCallback((msg, type="success") => {
    setToast({msg,type}); setTimeout(()=>setToast(null),3000);
  }, []);

  const signOut = () => { localStorage.removeItem("token"); setAuthed(false); setSignOutDlg(false); };

  const loadAll = async () => {
    setLoading(true);
    try { setProducts(await req("/products")); } catch(e) { showToast(e.message,"error"); }
    try {
      const fetchedOrders = await req("/orders/all");
      setOrders(fetchedOrders);
      // Generate notifications from orders
      const newNotifs = [];
      fetchedOrders.forEach((o, i) => {
        if (o.status === "pending") newNotifs.push({ id:`ord-${o._id}`, icon:"🛍️", color:"#f59e0b", title:"New Order Received", body:`Order #${o._id.slice(-8).toUpperCase()} — PKR ${(o.totalAmount||0).toLocaleString()}`, time: new Date(o.createdAt).toLocaleString("en-PK"), read:false });
        if ((o.products||[]).some(p => (p.quantity||1) >= 3)) newNotifs.push({ id:`bulk-${o._id}`, icon:"📦", color:"#3b82f6", title:"Bulk Order Alert", body:`Order #${o._id.slice(-8).toUpperCase()} has high-quantity items`, time: new Date(o.createdAt).toLocaleString("en-PK"), read:false });
      });
      setNotifications(prev => {
        const existingIds = new Set(prev.map(n=>n.id));
        const fresh = newNotifs.filter(n=>!existingIds.has(n.id));
        return [...fresh, ...prev].slice(0, 30);
      });
    } catch {}
    const saved = localStorage.getItem("Elegant Essentials_categories");
    setCategories(saved ? JSON.parse(saved) : [
      {name:"Women",description:"Women's clothing and fashion"},
      {name:"Men",description:"Men's clothing and fashion"},
      {name:"Bags",description:"Bags and accessories"},
      {name:"Fragrances",description:"Perfumes and fragrances"},
      {name:"Kurta",description:"Traditional & modern kurtas"},
      {name:"Suit",description:"Two and three piece suits"},
      {name:"Lawn",description:"Printed & embroidered lawn"},
      {name:"Winter",description:"Khaddar and winter wear"},
      {name:"Formal",description:"Formal occasion wear"},
      {name:"Accessories",description:"Shawls, dupattas and more"},
    ]);
    setLoading(false);
  };

  useEffect(() => { if (authed) loadAll(); }, [authed]);

  if (!authed) return <LoginGate onLogin={() => setAuthed(true)} />;

  // ── stats ──────────────────────────────────────────────────────────────────
  const totalRev    = orders.filter(o=>o.status!=="cancelled").reduce((s,o)=>s+(o.totalAmount||0),0);
  const pendingOrds = orders.filter(o=>o.status==="pending").length;
  const lowStock    = products.filter(p=>(p.stock||0)<5).length;
  const unreadNotifs = notifications.filter(n=>!n.read).length;
  const saleProducts = products.filter(p=>p.onSale);

  // Real monthly revenue from actual orders
  const currentYear = new Date().getFullYear();
  const chartData = MONTHS.map((month, mi) => {
    const revenue = orders
      .filter(o => {
        const d = new Date(o.createdAt);
        return d.getFullYear() === currentYear && d.getMonth() === mi && o.status !== "cancelled";
      })
      .reduce((s,o) => s+(o.totalAmount||0), 0);
    const orderCount = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d.getFullYear() === currentYear && d.getMonth() === mi;
    }).length;
    return { month, revenue, orders: orderCount };
  });

  // Top products by order frequency
  const productOrderCounts = {};
  orders.forEach(o => {
    (o.products||[]).forEach(p => {
      if (p.productId) productOrderCounts[p.productId] = (productOrderCounts[p.productId]||0) + (p.quantity||1);
    });
  });
  const popularProducts = [...products]
    .sort((a,b) => (productOrderCounts[b._id]||0) - (productOrderCounts[a._id]||0))
    .slice(0,5);

  // ── product CRUD ───────────────────────────────────────────────────────────
  const saveProd = async () => {
    if (!prodForm.name.trim() || !prodForm.price) return showToast("Name and price required","error");
    setSaving(true);
    try {
      const body = {
        name: prodForm.name.trim(),
        price: Number(prodForm.price),
        stock: Number(prodForm.stock)||0,
        category: prodForm.category,
        description: prodForm.description,
        image: prodForm.imageUrl,
        onSale: prodForm.onSale,
        salePercent: prodForm.onSale ? Number(prodForm.salePercent||25) : 0,
      };
      if (editProdId) {
        const u = await req(`/products/${editProdId}`,{method:"PUT",body:JSON.stringify(body)});
        setProducts(prev=>prev.map(p=>p._id===editProdId?u:p));
        showToast("Product updated");
      } else {
        const c = await req("/products",{method:"POST",body:JSON.stringify(body)});
        setProducts(prev=>[c,...prev]);
        showToast("Product added successfully");
        setNotifications(prev=>[{id:`prod-${Date.now()}`,icon:"✅",color:"#10b981",title:"Product Added",body:`"${body.name}" was added to the catalogue`,time:"Just now",read:false},...prev]);
      }
      setProdPanel(false);
    } catch(e) { showToast(e.message,"error"); }
    finally { setSaving(false); }
  };

  const confirmDelProd = async () => {
    try {
      await req(`/products/${delProdId}`,{method:"DELETE"});
      setProducts(prev=>prev.filter(p=>p._id!==delProdId));
      showToast("Product deleted");
    } catch(e) { showToast(e.message,"error"); }
    finally { setDelProdId(null); }
  };

  // ── category CRUD ──────────────────────────────────────────────────────────
  const saveCatFn = () => {
    if (!catForm.name.trim()) return showToast("Name required","error");
    const list = [...categories];
    if (editCatIdx !== null) { list[editCatIdx] = catForm; showToast("Category updated"); }
    else {
      if (list.find(c=>c.name.toLowerCase()===catForm.name.toLowerCase())) return showToast("Category already exists","error");
      list.unshift(catForm);
      showToast("Category added");
    }
    setCategories(list); localStorage.setItem("Elegant Essentials_categories",JSON.stringify(list)); setCatPanel(false);
  };

  const confirmDelCat = () => {
    const list = categories.filter((_,i)=>i!==delCatIdx);
    setCategories(list); localStorage.setItem("Elegant Essentials_categories",JSON.stringify(list)); setDelCatIdx(null); showToast("Category deleted");
  };

  const updateOrderStatus = async (id, status) => {
    setUpdatingOrd(id);
    try {
      const u = await req(`/orders/${id}/status`,{method:"PATCH",body:JSON.stringify({status})});
      setOrders(prev=>prev.map(o=>o._id===id?{...o,status:u.status}:o));
      showToast("Order status updated");
      if (status === "shipped" || status === "delivered") {
        setNotifications(prev=>[{id:`status-${id}-${Date.now()}`,icon:status==="delivered"?"✅":"🚚",color:"#10b981",title:`Order ${status.charAt(0).toUpperCase()+status.slice(1)}`,body:`Order #${id.slice(-8).toUpperCase()} marked as ${status}`,time:"Just now",read:false},...prev]);
      }
    } catch(e) { showToast(e.message,"error"); }
    finally { setUpdatingOrd(null); }
  };

  const filteredProds  = products.filter(p=>p.name.toLowerCase().includes(prodSearch.toLowerCase())||(p.category||"").toLowerCase().includes(prodSearch.toLowerCase()));
  const filteredOrders = orders.filter(o=>{
    const ms = orderSearch===""||o._id.toLowerCase().includes(orderSearch.toLowerCase());
    return ms && (statusFilter==="all"||o.status===statusFilter);
  });

  // ── Shared styles ──────────────────────────────────────────────────────────
  const card = { background:"white", borderRadius:10, border:"1px solid #e5e7eb", padding:"20px 24px" };

  const navItems = [
    { id:"home",       icon:ICONS.home,    label:"Home" },
    { id:"products",   icon:ICONS.product, label:"Products" },
    { id:"sale",       icon:ICONS.sale,    label:"Sale Items",  badge: saleProducts.length || null },
    { id:"customers",  icon:ICONS.users,   label:"Customers" },
    { id:"orders",     icon:ICONS.orders,  label:"Orders",     badge: pendingOrds||null },
    { id:"categories", icon:ICONS.tag,     label:"Categories" },
  ];

  const NavItem = ({ id, icon, label, badge }) => {
    const active = page===id;
    return (
      <div onClick={()=>setPage(id)} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 20px", borderRadius:8, cursor:"pointer", background:active?"#eff6ff":"transparent", color:active?"#2563eb":"#6b7280", fontWeight:active?600:400, fontSize:13, transition:"all 0.15s", marginBottom:2 }}>
        <Ic d={icon} size={16} stroke={active?"#2563eb":"#9ca3af"} />
        {label}
        {badge && <span style={{ marginLeft:"auto", background:"#ef4444", color:"white", fontSize:9, fontWeight:700, padding:"1px 6px", borderRadius:10 }}>{badge}</span>}
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE: HOME
  // ══════════════════════════════════════════════════════════════════════════
  const renderHome = () => (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:700, color:"#111", marginBottom:2 }}>Dashboard</h1>
          <p style={{ fontSize:13, color:"#9ca3af" }}>Welcome back! Here's what's happening.</p>
        </div>
        <button onClick={()=>{setProdForm(EMPTY_P);setEditProdId(null);setProdPanel(true);setPage("products");}}
          style={{ background:"#2563eb", color:"white", border:"none", borderRadius:8, padding:"10px 20px", fontFamily:"'Poppins',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
          <Ic d={ICONS.plus} size={14} stroke="white" /> Add Product
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {[
          { label:"Total Products", value:products.length,                       color:"#2563eb" },
          { label:"Total Revenue",  value:`PKR ${(totalRev/1000).toFixed(1)}k`,  color:"#10b981" },
          { label:"Total Orders",   value:orders.length,                          color:"#f59e0b" },
          { label:"Pending Orders", value:pendingOrds,                            color:"#ef4444" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ ...card, borderTop:`3px solid ${color}` }}>
            <p style={{ fontSize:11, fontWeight:600, color:"#9ca3af", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8 }}>{label}</p>
            <p style={{ fontSize:28, fontWeight:800, color:"#111", marginBottom:2 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart + popular products */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:20, marginBottom:20 }}>
        <div style={card}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
            <div>
              <p style={{ fontWeight:700, fontSize:16, color:"#111" }}>Total Income {currentYear}</p>
              <p style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>Based on actual confirmed orders (excluding cancelled)</p>
            </div>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontWeight:800, fontSize:20, color:"#2563eb" }}>PKR {totalRev.toLocaleString()}</p>
              <p style={{ fontSize:11, color:"#10b981" }}>All-time revenue</p>
            </div>
          </div>
          {chartData.every(d=>d.revenue===0) ? (
            <div style={{ textAlign:"center", padding:"60px 0", color:"#ccc" }}>
              <p style={{ fontSize:36, marginBottom:12 }}>📊</p>
              <p style={{ fontSize:14, fontWeight:600 }}>No revenue data yet</p>
              <p style={{ fontSize:12, marginTop:6 }}>Revenue will appear here once orders are placed</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize:10, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:"#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v=>[`PKR ${v.toLocaleString()}`, "Revenue"]} contentStyle={{ borderRadius:8, border:"1px solid #e5e7eb", fontSize:12 }} />
                <Bar dataKey="revenue" fill="#2563eb" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={card}>
          <p style={{ fontWeight:700, fontSize:15, color:"#111", marginBottom:4 }}>Top Products</p>
          <p style={{ fontSize:11, color:"#9ca3af", marginBottom:16 }}>Ranked by order volume</p>
          {popularProducts.length===0 ? (
            <p style={{ fontSize:12, color:"#ccc", textAlign:"center", padding:"20px 0" }}>No products yet</p>
          ) : popularProducts.map((p,i) => (
            <div key={p._id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:i<popularProducts.length-1?"1px solid #f5f5f5":"none" }}>
              <div style={{ width:36, height:40, background:"#f5f5f5", borderRadius:4, overflow:"hidden", flexShrink:0 }}>
                {p.image && <img src={p.image} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:12, fontWeight:600, color:"#111", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</p>
                <p style={{ fontSize:10, color:"#9ca3af" }}>{productOrderCounts[p._id]||0} ordered</p>
              </div>
              <p style={{ fontSize:13, fontWeight:700, color:"#2563eb", flexShrink:0 }}>PKR {p.price?.toLocaleString()}</p>
            </div>
          ))}
          <button onClick={()=>setPage("products")} style={{ marginTop:16, width:"100%", background:"#f5f6fa", color:"#374151", border:"none", borderRadius:7, padding:"9px", fontFamily:"'Poppins',sans-serif", fontSize:12, fontWeight:600, cursor:"pointer" }}>All Products</button>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <div style={card}>
          <p style={{ fontWeight:700, fontSize:15, color:"#111", marginBottom:16 }}>Recent Orders</p>
          {orders.length===0 ? <p style={{ fontSize:12, color:"#ccc" }}>No orders yet</p> :
            orders.slice(0,5).map(o=>(
              <div key={o._id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #f5f5f5" }}>
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:"#111" }}>#{o._id.slice(-8).toUpperCase()}</p>
                  <p style={{ fontSize:10, color:"#9ca3af" }}>{new Date(o.createdAt).toLocaleDateString("en-PK",{day:"numeric",month:"short"})}</p>
                </div>
                <span style={{ background:STATUS_COLORS[o.status]+"20", color:STATUS_COLORS[o.status], fontSize:10, fontWeight:600, padding:"3px 10px", borderRadius:20 }}>{o.status}</span>
                <p style={{ fontSize:13, fontWeight:700, color:"#111" }}>PKR {(o.totalAmount||0).toLocaleString()}</p>
              </div>
            ))
          }
        </div>
        <div style={card}>
          <p style={{ fontWeight:700, fontSize:15, color:"#111", marginBottom:16 }}>Inventory Alerts</p>
          {lowStock===0 ? (
            <div style={{ textAlign:"center", padding:"20px 0" }}>
              <p style={{ fontSize:32, marginBottom:8 }}>✅</p>
              <p style={{ fontSize:13, color:"#10b981", fontWeight:600 }}>All stock levels healthy</p>
            </div>
          ) : products.filter(p=>(p.stock||0)<5).map(p=>(
            <div key={p._id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid #f5f5f5" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:32, height:36, background:"#f5f5f5", borderRadius:4, overflow:"hidden" }}>
                  {p.image && <img src={p.image} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />}
                </div>
                <p style={{ fontSize:12, fontWeight:600, color:"#111" }}>{p.name}</p>
              </div>
              <span style={{ background:"#fef2f2", color:"#dc2626", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:4 }}>{p.stock||0} left</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE: PRODUCTS
  // ══════════════════════════════════════════════════════════════════════════
  const renderProducts = () => (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div><h1 style={{ fontSize:22, fontWeight:700, color:"#111" }}>Products</h1><p style={{ fontSize:13, color:"#9ca3af", marginTop:2 }}>{products.length} items</p></div>
        <button onClick={()=>{setProdForm(EMPTY_P);setEditProdId(null);setProdPanel(true);}}
          style={{ background:"#2563eb", color:"white", border:"none", borderRadius:8, padding:"10px 20px", fontFamily:"'Poppins',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
          <Ic d={ICONS.plus} size={14} stroke="white" /> Add Product
        </button>
      </div>
      <div style={{ ...card, marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
        <Ic d={ICONS.search} size={16} stroke="#9ca3af" />
        <input style={{ flex:1, border:"none", outline:"none", fontFamily:"'Poppins',sans-serif", fontSize:13, color:"#374151" }}
          placeholder="Search products…" value={prodSearch} onChange={e=>setProdSearch(e.target.value)} />
      </div>
      <div style={card}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>{["Product","Category","Price","Stock","Sale","Actions"].map(h=>(
            <th key={h} style={{ textAlign:"left", fontSize:11, fontWeight:600, color:"#9ca3af", padding:"10px 14px", borderBottom:"1px solid #f0f0f0", letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {filteredProds.length===0 ? (
              <tr><td colSpan={6} style={{ textAlign:"center", padding:"48px", color:"#ccc", fontSize:13 }}>No products found</td></tr>
            ) : filteredProds.map(p=>(
              <tr key={p._id} style={{ borderBottom:"1px solid #f9f9f9" }}>
                <td style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:40, height:48, background:"#f5f5f5", borderRadius:6, overflow:"hidden", flexShrink:0 }}>
                      {p.image&&<img src={p.image} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />}
                    </div>
                    <div>
                      <p style={{ fontWeight:600, fontSize:13, color:"#111" }}>{p.name}</p>
                      <p style={{ fontSize:11, color:"#9ca3af", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:180 }}>{p.description||"—"}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding:"12px 14px" }}><span style={{ background:"#eff6ff", color:"#2563eb", fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20 }}>{p.category||"—"}</span></td>
                <td style={{ padding:"12px 14px", fontWeight:700, fontSize:14, color:"#111" }}>PKR {p.price?.toLocaleString()}</td>
                <td style={{ padding:"12px 14px" }}><span style={{ background:(p.stock||0)<5?"#fef2f2":"#f0fdf4", color:(p.stock||0)<5?"#dc2626":"#16a34a", fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20 }}>{p.stock??0}</span></td>
                <td style={{ padding:"12px 14px" }}>
                  {p.onSale ? <span style={{ background:"#fffbeb", color:"#d97706", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>-{p.salePercent||25}%</span>
                    : <span style={{ color:"#ccc", fontSize:11 }}>—</span>}
                </td>
                <td style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={()=>{setProdForm({name:p.name,price:p.price,description:p.description||"",imageUrl:p.image||"",stock:p.stock??"",category:p.category||"",onSale:p.onSale||false,salePercent:p.salePercent||"25"});setEditProdId(p._id);setProdPanel(true);}}
                      style={{ background:"#f5f6fa", border:"none", borderRadius:6, padding:"6px 8px", cursor:"pointer", color:"#6b7280", display:"flex" }}><Ic d={ICONS.edit} size={14} /></button>
                    <button onClick={()=>setDelProdId(p._id)} style={{ background:"#fef2f2", border:"none", borderRadius:6, padding:"6px 8px", cursor:"pointer", color:"#dc2626", display:"flex" }}><Ic d={ICONS.trash} size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE: SALE ITEMS
  // ══════════════════════════════════════════════════════════════════════════
  const renderSale = () => (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:"#111" }}>Sale Items</h1>
          <p style={{ fontSize:13, color:"#9ca3af", marginTop:2 }}>{saleProducts.length} products currently on sale</p>
        </div>
        <button onClick={()=>{setProdForm({...EMPTY_P,onSale:true});setEditProdId(null);setProdPanel(true);}}
          style={{ background:"#f59e0b", color:"white", border:"none", borderRadius:8, padding:"10px 20px", fontFamily:"'Poppins',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
          <Ic d={ICONS.plus} size={14} stroke="white" /> Add Sale Item
        </button>
      </div>

      <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:10, padding:"16px 20px", marginBottom:20, display:"flex", gap:12, alignItems:"center" }}>
        <span style={{ fontSize:24 }}>🏷️</span>
        <div>
          <p style={{ fontWeight:600, fontSize:14, color:"#92400e" }}>Sale Section Manager</p>
          <p style={{ fontSize:12, color:"#a16207" }}>Toggle products on/off sale. Sale products show a discount badge on the storefront and appear in /category/sale.</p>
        </div>
      </div>

      <div style={card}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>{["Product","Original Price","Discount","Sale Price","Toggle Sale","Actions"].map(h=>(
            <th key={h} style={{ textAlign:"left", fontSize:11, fontWeight:600, color:"#9ca3af", padding:"10px 14px", borderBottom:"1px solid #f0f0f0", letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {products.length===0 ? (
              <tr><td colSpan={6} style={{ textAlign:"center", padding:"48px", color:"#ccc", fontSize:13 }}>No products yet. Add products first.</td></tr>
            ) : products.map(p=>(
              <tr key={p._id} style={{ borderBottom:"1px solid #f9f9f9", background:p.onSale?"#fffbeb":"white" }}>
                <td style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:36, height:44, background:"#f5f5f5", borderRadius:4, overflow:"hidden" }}>
                      {p.image&&<img src={p.image} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />}
                    </div>
                    <p style={{ fontWeight:600, fontSize:13, color:"#111" }}>{p.name}</p>
                  </div>
                </td>
                <td style={{ padding:"12px 14px", fontSize:13, color:"#374151" }}>PKR {p.price?.toLocaleString()}</td>
                <td style={{ padding:"12px 14px" }}>
                  {p.onSale ? (
                    <span style={{ background:"#fef2f2", color:"#dc2626", fontSize:12, fontWeight:700, padding:"3px 10px", borderRadius:6 }}>-{p.salePercent||25}%</span>
                  ) : <span style={{ color:"#ccc", fontSize:12 }}>No discount</span>}
                </td>
                <td style={{ padding:"12px 14px", fontWeight:700, fontSize:14, color:p.onSale?"#f59e0b":"#ccc" }}>
                  {p.onSale ? `PKR ${Math.round(p.price*(1-(p.salePercent||25)/100)).toLocaleString()}` : "—"}
                </td>
                <td style={{ padding:"12px 14px" }}>
                  <button type="button"
                    onClick={async ()=>{
                      try {
                        const updated = await req(`/products/${p._id}`,{method:"PUT",body:JSON.stringify({...p, image:p.image, onSale:!p.onSale, salePercent:p.salePercent||25})});
                        setProducts(prev=>prev.map(x=>x._id===p._id?updated:x));
                        showToast(p.onSale?"Removed from sale":"Added to sale 🏷️");
                      } catch(e){ showToast(e.message,"error"); }
                    }}
                    style={{ width:44, height:24, borderRadius:12, border:"none", cursor:"pointer", background:p.onSale?"#f59e0b":"#d1d5db", transition:"background 0.2s", position:"relative" }}>
                    <div style={{ width:18, height:18, borderRadius:"50%", background:"white", position:"absolute", top:3, left:p.onSale?23:3, transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }} />
                  </button>
                </td>
                <td style={{ padding:"12px 14px" }}>
                  <button onClick={()=>{setProdForm({name:p.name,price:p.price,description:p.description||"",imageUrl:p.image||"",stock:p.stock??"",category:p.category||"",onSale:p.onSale||false,salePercent:p.salePercent||"25"});setEditProdId(p._id);setProdPanel(true);}}
                    style={{ background:"#f5f6fa", border:"none", borderRadius:6, padding:"6px 8px", cursor:"pointer", color:"#6b7280", display:"flex" }}><Ic d={ICONS.edit} size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE: ORDERS
  // ══════════════════════════════════════════════════════════════════════════
  const renderOrders = () => (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:"#111" }}>Orders</h1>
        <p style={{ fontSize:13, color:"#9ca3af", marginTop:2 }}>{orders.length} total orders</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {[
          {label:"Total Revenue", value:`PKR ${totalRev.toLocaleString()}`, color:"#2563eb"},
          {label:"Total Orders",  value:orders.length,                       color:"#10b981"},
          {label:"Pending",       value:pendingOrds,                         color:"#f59e0b"},
          {label:"Delivered",     value:orders.filter(o=>o.status==="delivered").length, color:"#10b981"},
        ].map(({label,value,color})=>(
          <div key={label} style={{ ...card, borderLeft:`4px solid ${color}` }}>
            <p style={{ fontSize:10, fontWeight:600, color:"#9ca3af", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:6 }}>{label}</p>
            <p style={{ fontSize:22, fontWeight:800, color:"#111" }}>{value}</p>
          </div>
        ))}
      </div>
      <div style={{ ...card, marginBottom:16, display:"flex", gap:12, alignItems:"center" }}>
        <div style={{ flex:1, display:"flex", alignItems:"center", gap:8 }}>
          <Ic d={ICONS.search} size={15} stroke="#9ca3af" />
          <input style={{ border:"none", outline:"none", fontFamily:"'Poppins',sans-serif", fontSize:13, flex:1, minWidth:0 }}
            placeholder="Search by order ID…" value={orderSearch} onChange={e=>setOrderSearch(e.target.value)} />
        </div>
        <select style={{ border:"1.5px solid #e5e7eb", borderRadius:7, padding:"7px 12px", fontFamily:"'Poppins',sans-serif", fontSize:12, outline:"none" }}
          value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          {Object.keys(STATUS_COLORS).map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div style={card}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>{["Order ID","Date","Items","Total","Status",""].map(h=>(
            <th key={h} style={{ textAlign:"left", fontSize:11, fontWeight:600, color:"#9ca3af", padding:"10px 14px", borderBottom:"1px solid #f0f0f0", letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {filteredOrders.length===0 ? (
              <tr><td colSpan={6} style={{ textAlign:"center", padding:"48px", color:"#ccc", fontSize:13 }}>No orders found</td></tr>
            ) : filteredOrders.map(o=>(
              <React.Fragment key={o._id}>
                <tr style={{ borderBottom:"1px solid #f9f9f9" }}>
                  <td style={{ padding:"12px 14px", fontSize:12, color:"#6b7280", fontWeight:600 }}>#{o._id.slice(-8).toUpperCase()}</td>
                  <td style={{ padding:"12px 14px", fontSize:12, color:"#9ca3af" }}>{new Date(o.createdAt).toLocaleDateString("en-PK",{day:"numeric",month:"short",year:"numeric"})}</td>
                  <td style={{ padding:"12px 14px", fontSize:13 }}>{(o.products||[]).length} item{(o.products||[]).length!==1?"s":""}</td>
                  <td style={{ padding:"12px 14px", fontWeight:700, fontSize:14, color:"#111" }}>PKR {(o.totalAmount||0).toLocaleString()}</td>
                  <td style={{ padding:"12px 14px" }}>
                    <select disabled={updatingOrd===o._id} value={o.status} onChange={e=>updateOrderStatus(o._id,e.target.value)}
                      style={{ background:STATUS_COLORS[o.status]+"18", color:STATUS_COLORS[o.status], border:`1.5px solid ${STATUS_COLORS[o.status]}44`, borderRadius:20, padding:"4px 12px", fontFamily:"'Poppins',sans-serif", fontSize:11, fontWeight:600, outline:"none", cursor:"pointer" }}>
                      {Object.keys(STATUS_COLORS).map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ padding:"12px 14px" }}>
                    <button onClick={()=>setExpandOrder(expandOrder===o._id?null:o._id)}
                      style={{ background:"#f5f6fa", border:"none", borderRadius:6, padding:"6px 8px", cursor:"pointer", color:expandOrder===o._id?"#2563eb":"#6b7280", display:"flex" }}>
                      <Ic d={ICONS.eye} size={14} />
                    </button>
                  </td>
                </tr>
                {expandOrder===o._id&&(
                  <tr><td colSpan={6} style={{ background:"#f9fafb", padding:"16px 20px" }}>
                    <p style={{ fontSize:11, fontWeight:600, color:"#9ca3af", letterSpacing:"0.06em", marginBottom:10, textTransform:"uppercase" }}>Order Items</p>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
                      {(o.products||[]).map((item,i)=>(
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:10, background:"white", border:"1px solid #e5e7eb", borderRadius:8, padding:"10px 14px" }}>
                          {item.image&&<img src={item.image} alt={item.name} style={{ width:32, height:40, objectFit:"cover", borderRadius:4 }} />}
                          <div>
                            <p style={{ fontSize:12, fontWeight:600, color:"#111" }}>{item.name||"Product"}</p>
                            <p style={{ fontSize:10, color:"#9ca3af" }}>PKR {(item.price||0).toLocaleString()} × {item.quantity||1}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td></tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE: CATEGORIES
  // ══════════════════════════════════════════════════════════════════════════
  const renderCategories = () => (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div><h1 style={{ fontSize:22, fontWeight:700, color:"#111" }}>Categories</h1><p style={{ fontSize:13, color:"#9ca3af", marginTop:2 }}>{categories.length} categories</p></div>
        <button onClick={()=>{setCatForm(EMPTY_C);setEditCatIdx(null);setCatPanel(true);}}
          style={{ background:"#2563eb", color:"white", border:"none", borderRadius:8, padding:"10px 20px", fontFamily:"'Poppins',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
          <Ic d={ICONS.plus} size={14} stroke="white" /> New Category
        </button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:16 }}>
        {categories.map((cat,idx)=>{
          const cnt = products.filter(p=>p.category===cat.name).length;
          return (
            <div key={idx} style={{ ...card, borderLeft:"4px solid #2563eb" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <div>
                  <p style={{ fontWeight:700, fontSize:15, color:"#111", marginBottom:4 }}>{cat.name}</p>
                  <p style={{ fontSize:12, color:"#9ca3af", lineHeight:1.6 }}>{cat.description||"No description"}</p>
                </div>
                <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                  <button onClick={()=>{setCatForm({name:cat.name,description:cat.description||""});setEditCatIdx(idx);setCatPanel(true);}}
                    style={{ background:"#f5f6fa", border:"none", borderRadius:6, padding:"5px 7px", cursor:"pointer", color:"#6b7280", display:"flex" }}><Ic d={ICONS.edit} size={13} /></button>
                  <button onClick={()=>setDelCatIdx(idx)} style={{ background:"#fef2f2", border:"none", borderRadius:6, padding:"5px 7px", cursor:"pointer", color:"#dc2626", display:"flex" }}><Ic d={ICONS.trash} size={13} /></button>
                </div>
              </div>
              <span style={{ background:"#eff6ff", color:"#2563eb", fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20 }}>{cnt} product{cnt!==1?"s":""}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE: CUSTOMERS
  // ══════════════════════════════════════════════════════════════════════════
  const renderCustomers = () => (
    <div>
      <h1 style={{ fontSize:22, fontWeight:700, color:"#111", marginBottom:6 }}>Customers</h1>
      <p style={{ fontSize:13, color:"#9ca3af", marginBottom:24 }}>Users who have placed orders</p>
      <div style={card}>
        {orders.length===0 ? (
          <div style={{ textAlign:"center", padding:"60px", color:"#ccc" }}>
            <p style={{ fontSize:32, marginBottom:12 }}>👥</p>
            <p style={{ fontSize:16 }}>No orders yet</p>
            <p style={{ fontSize:12, marginTop:8 }}>Customers appear here once they place an order</p>
          </div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr>{["#","Customer","Order ID","Amount","Status"].map(h=>(
              <th key={h} style={{ textAlign:"left", fontSize:11, fontWeight:600, color:"#9ca3af", padding:"10px 14px", borderBottom:"1px solid #f0f0f0", letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {orders.map((o,i)=>(
                <tr key={o._id} style={{ borderBottom:"1px solid #f9f9f9" }}>
                  <td style={{ padding:"12px 14px", fontSize:12, color:"#9ca3af" }}>{i+1}</td>
                  <td style={{ padding:"12px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <img src={`https://i.pravatar.cc/36?img=${i+5}`} alt="avatar" style={{ width:36, height:36, borderRadius:"50%", border:"2px solid #e5e7eb" }} />
                      <div>
                        <p style={{ fontWeight:600, fontSize:13, color:"#111" }}>Customer {i+1}</p>
                        <p style={{ fontSize:11, color:"#9ca3af" }}>ID: {o.userId?.toString().slice(-6)||"—"}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:"12px 14px", fontSize:12, color:"#6b7280", fontWeight:600 }}>#{o._id.slice(-8).toUpperCase()}</td>
                  <td style={{ padding:"12px 14px", fontWeight:700, fontSize:14, color:"#111" }}>PKR {(o.totalAmount||0).toLocaleString()}</td>
                  <td style={{ padding:"12px 14px" }}><span style={{ background:STATUS_COLORS[o.status]+"18", color:STATUS_COLORS[o.status], fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20 }}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight:"100vh", background:"#f5f6fa", fontFamily:"'Poppins',sans-serif", display:"flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:4px}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* Sidebar */}
      <aside style={{ width:240, background:"white", borderRight:"1px solid #e5e7eb", padding:"24px 16px", position:"fixed", top:0, left:0, height:"100vh", display:"flex", flexDirection:"column", zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:32, padding:"0 8px" }}>
          <div style={{ width:34, height:34, background:"#2563eb", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ color:"white", fontWeight:800, fontSize:16 }}>M</span>
          </div>
          <div>
            <p style={{ fontWeight:700, fontSize:15, color:"#111", lineHeight:1 }}>Elegant Essentials</p>
            <p style={{ fontSize:10, color:"#9ca3af" }}>Admin Console</p>
          </div>
        </div>
        <nav style={{ flex:1 }}>
          {navItems.map(item => <NavItem key={item.id} {...item} />)}
        </nav>
        <div style={{ borderTop:"1px solid #f0f0f0", paddingTop:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 8px", marginBottom:4 }}>
            <div style={{ width:32, height:32, background:"#f0fdf4", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Ic d={ICONS.users} size={14} stroke="#16a34a" />
            </div>
            <div>
              <p style={{ fontSize:12, fontWeight:600, color:"#111" }}>Admin</p>
              <p style={{ fontSize:10, color:"#9ca3af" }}>Logged in</p>
            </div>
          </div>
          <div onClick={()=>setSignOutDlg(true)} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 8px", borderRadius:8, cursor:"pointer", color:"#9ca3af", fontSize:13, transition:"all 0.15s" }}
            onMouseEnter={e=>{e.currentTarget.style.background="#fef2f2";e.currentTarget.style.color="#dc2626";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#9ca3af";}}>
            <Ic d={ICONS.logout} size={15} />
            Sign Out
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft:240, flex:1, padding:"32px 36px", minHeight:"100vh" }}>
        {/* Topbar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", marginBottom:28, gap:16 }}>
          {/* Notification Bell */}
          <div style={{ position:"relative" }}>
            <button onClick={()=>setNotifOpen(v=>!v)}
              style={{ background:"white", border:"1px solid #e5e7eb", borderRadius:8, padding:"8px 10px", cursor:"pointer", color:"#6b7280", display:"flex", alignItems:"center", gap:6, position:"relative" }}>
              <Ic d={ICONS.bell} size={18} />
              {unreadNotifs > 0 && (
                <span style={{ position:"absolute", top:-4, right:-4, background:"#ef4444", color:"white", fontSize:9, fontWeight:700, width:16, height:16, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>{unreadNotifs}</span>
              )}
            </button>
            <NotificationsPanel
              open={notifOpen}
              onClose={()=>setNotifOpen(false)}
              notifications={notifications}
              onClear={()=>setNotifications([])}
              onMarkRead={id=>setNotifications(prev=>prev.map(n=>n.id===id?{...n,read:true}:n))}
            />
          </div>
          <div style={{ width:36, height:36, background:"#2563eb", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ color:"white", fontWeight:700, fontSize:14 }}>A</span>
          </div>
        </div>

        {loading ? (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh" }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ width:40, height:40, border:"3px solid #e5e7eb", borderTopColor:"#2563eb", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }} />
              <p style={{ fontSize:13, color:"#9ca3af" }}>Loading dashboard…</p>
            </div>
          </div>
        ) : (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            {page==="home"       && renderHome()}
            {page==="products"   && renderProducts()}
            {page==="sale"       && renderSale()}
            {page==="orders"     && renderOrders()}
            {page==="categories" && renderCategories()}
            {page==="customers"  && renderCustomers()}
          </div>
        )}
      </main>

      {/* Product Panel (hoisted — no remount on state change) */}
      <ProductPanel
        open={prodPanel}
        onClose={()=>setProdPanel(false)}
        editId={editProdId}
        form={prodForm}
        setForm={setProdForm}
        onSave={saveProd}
        saving={saving}
        categories={categories}
      />

      {/* Category Panel (hoisted) */}
      <CategoryPanel
        open={catPanel}
        onClose={()=>setCatPanel(false)}
        editIdx={editCatIdx}
        form={catForm}
        setForm={setCatForm}
        onSave={saveCatFn}
      />

      {/* Delete dialogs */}
      {delProdId && <DeleteDialog msg="This product will be permanently removed." onConfirm={confirmDelProd} onCancel={()=>setDelProdId(null)} />}
      {delCatIdx!==null && <DeleteDialog msg="This category will be removed. Products will not be deleted." onConfirm={confirmDelCat} onCancel={()=>setDelCatIdx(null)} />}

      {/* Sign out confirm */}
      {signOutDlg && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:60, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"white", borderRadius:12, padding:"32px 36px", maxWidth:320, width:"90%", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }}>
            <p style={{ fontWeight:700, fontSize:17, color:"#111", marginBottom:8 }}>Sign Out?</p>
            <p style={{ fontSize:12, color:"#888", lineHeight:1.7, marginBottom:24 }}>You'll be returned to the login screen.</p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={signOut} style={{ flex:1, background:"#2563eb", color:"white", border:"none", borderRadius:8, padding:"11px", fontFamily:"'Poppins',sans-serif", fontWeight:600, cursor:"pointer", fontSize:13 }}>Sign Out</button>
              <button onClick={()=>setSignOutDlg(false)} style={{ flex:1, background:"white", color:"#374151", border:"1.5px solid #e5e7eb", borderRadius:8, padding:"11px", fontFamily:"'Poppins',sans-serif", fontWeight:600, cursor:"pointer", fontSize:13 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", bottom:24, right:24, zIndex:99, background:toast.type==="error"?"#fef2f2":"#f0fdf4", border:`1px solid ${toast.type==="error"?"#fecaca":"#bbf7d0"}`, color:toast.type==="error"?"#dc2626":"#16a34a", padding:"12px 20px", borderRadius:8, fontFamily:"'Poppins',sans-serif", fontSize:12, fontWeight:500, display:"flex", alignItems:"center", gap:10, boxShadow:"0 4px 16px rgba(0,0,0,0.08)", animation:"fadeIn 0.3s ease" }}>
          <Ic d={toast.type==="error"?ICONS.alert:ICONS.check} size={14} stroke={toast.type==="error"?"#dc2626":"#16a34a"} />
          {toast.msg}
        </div>
      )}
    </div>
  );
}