import React, { useEffect, useState }  from "react";
import { useParams, Link }             from "react-router-dom";
import { useDispatch, useSelector }    from "react-redux";
import { fetchProducts, selectAllProducts, selectProductsLoading, selectProductsError } from "../store/productsSlice";
import ProductCard from "../components/ProductCard";

const CATEGORY_META = {
  "new-in":      { title:"New In",       subtitle:"Fresh arrivals, just landed",            hero:"https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&h=400&fit=crop" },
  "sale":        { title:"Sale",         subtitle:"Up to 50% off — limited time only",       hero:"https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&h=400&fit=crop" },
  "women":       { title:"Women",        subtitle:"Crafted for the modern woman",            hero:"https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&h=400&fit=crop" },
  "men":         { title:"Men",          subtitle:"Sharp, refined, effortless",              hero:"https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1400&h=400&fit=crop" },
  "bags":        { title:"Bags",         subtitle:"The perfect finishing touch",             hero:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1400&h=400&fit=crop" },
  "fragrances":  { title:"Fragrances",   subtitle:"Scents that linger long after you leave", hero:"https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1400&h=400&fit=crop" },
  "accessories": { title:"Accessories",  subtitle:"Details that define you",                hero:"https://images.unsplash.com/photo-1537832816519-689ad163238b?w=1400&h=400&fit=crop" },
  "winter":      { title:"Winter Wear",  subtitle:"Stay warm, stay stylish",                hero:"https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=1400&h=400&fit=crop" },
  "all":         { title:"All Products", subtitle:"Our complete collection",                hero:"https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&h=400&fit=crop" },
};

const SORT_OPTIONS = [
  { value:"newest",     label:"Newest First" },
  { value:"price-asc",  label:"Price: Low to High" },
  { value:"price-desc", label:"Price: High to Low" },
  { value:"name",       label:"Name A–Z" },
];

const SHOW_ALL_SLUGS = new Set(["new-in", "all"]);

export default function CategoryPage() {
  const { slug } = useParams();
  const meta = CATEGORY_META[slug] || {
    title:    slug ? slug.split("-").map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(" ") : "Products",
    subtitle: "Browse our collection",
    hero:     "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&h=400&fit=crop",
  };

  const dispatch    = useDispatch();
  const allProducts = useSelector(selectAllProducts);
  const loading     = useSelector(selectProductsLoading);
  const error       = useSelector(selectProductsError);
  const [sort, setSort]   = useState("newest");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSearch("");
    if (allProducts.length === 0) dispatch(fetchProducts());
  }, [slug, dispatch]);

  let filtered = allProducts.filter(p => {
    const matchesSearch = search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description||"").toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (slug === "sale") return p.onSale === true;
    if (SHOW_ALL_SLUGS.has(slug)) return true;
    const slugNorm = slug.replace(/-/g, " ").toLowerCase();
    const catNorm  = (p.category || "").toLowerCase();
    return catNorm === slugNorm || catNorm === slug.toLowerCase();
  });

  if (sort === "price-asc")  filtered = [...filtered].sort((a,b)=>(a.price||0)-(b.price||0));
  if (sort === "price-desc") filtered = [...filtered].sort((a,b)=>(b.price||0)-(a.price||0));
  if (sort === "name")       filtered = [...filtered].sort((a,b)=>a.name.localeCompare(b.name));

  return (
    <div style={{ fontFamily:"'Poppins',sans-serif", minHeight:"100vh", background:"#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        .skeleton { background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @media(max-width:768px){
          .cat-toolbar { flex-direction:column !important; align-items:stretch !important; gap:10px !important; }
          .cat-search-wrap { width:100% !important; }
          .cat-sort { width:100% !important; font-size:16px !important; }
          .cat-search-wrap input { font-size:16px !important; }
        }
      `}</style>

      {/* Hero */}
      <div style={{ position:"relative", height:220, overflow:"hidden" }}>
        <img src={meta.hero} alt={meta.title} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 30%" }} />
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"0 24px" }}>
          <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.22em", textTransform:"uppercase", color:"#e63946", marginBottom:8 }}>Collection</p>
          <h1 style={{ fontSize:"clamp(28px,6vw,52px)", fontWeight:800, color:"white", marginBottom:8 }}>{meta.title}</h1>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.7)" }}>{meta.subtitle}</p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div style={{ maxWidth:1300, margin:"0 auto", padding:"14px 24px", fontSize:12, color:"#888" }}>
        <Link to="/" style={{ color:"#888", textDecoration:"none" }}>Home</Link>
        <span style={{ margin:"0 8px", color:"#ccc" }}>›</span>
        <span style={{ color:"#111", fontWeight:600 }}>{meta.title}</span>
      </div>

      {/* Toolbar */}
      <div style={{ maxWidth:1300, margin:"0 auto", padding:"0 24px 28px" }}>
        <div className="cat-toolbar" style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div className="cat-search-wrap" style={{ flex:"1 1 260px", position:"relative" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"
              style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="search"
              placeholder={`Search in ${meta.title}…`}
              value={search}
              onChange={e=>setSearch(e.target.value)}
              style={{ width:"100%", padding:"11px 14px 11px 38px", border:"1.5px solid #e5e7eb", borderRadius:8, fontFamily:"'Poppins',sans-serif", fontSize:14, outline:"none", WebkitAppearance:"none", appearance:"none" }}
              onFocus={e=>e.target.style.borderColor="#e63946"}
              onBlur={e=>e.target.style.borderColor="#e5e7eb"}
            />
          </div>
          <select className="cat-sort" value={sort} onChange={e=>setSort(e.target.value)}
            style={{ flex:"0 1 200px", padding:"11px 14px", border:"1.5px solid #e5e7eb", borderRadius:8, fontFamily:"'Poppins',sans-serif", fontSize:14, outline:"none", background:"white", cursor:"pointer", WebkitAppearance:"none", appearance:"none" }}>
            {SORT_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <p style={{ fontSize:13, color:"#888", whiteSpace:"nowrap", flexShrink:0 }}>
            {loading ? "Loading…" : `${filtered.length} item${filtered.length!==1?"s":""}`}
          </p>
        </div>
        {slug==="sale" && (
          <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:"10px 16px", marginTop:12, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:18 }}>🏷️</span>
            <p style={{ fontSize:13, color:"#dc2626", fontWeight:600 }}>Showing {filtered.length} products currently on sale.</p>
          </div>
        )}
      </div>

      {/* Grid */}
      <div style={{ maxWidth:1300, margin:"0 auto", padding:"0 24px 72px" }}>
        {loading ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:16 }}>
            {[1,2,3,4,5,6].map(i=><div key={i} className="skeleton" style={{ height:380, borderRadius:2 }} />)}
          </div>
        ) : error ? (
          <div style={{ textAlign:"center", padding:"80px 0", background:"#fff3f3", border:"1px solid #fecaca", borderRadius:8 }}>
            <p style={{ color:"#e63946", fontWeight:600, marginBottom:8 }}>Could not load products</p>
            <p style={{ color:"#888", fontSize:13 }}>Make sure your backend is running on port 5000</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 24px" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>{slug==="sale"?"🏷️":"🔍"}</div>
            <p style={{ fontSize:20, fontWeight:600, color:"#111", marginBottom:8 }}>
              {slug==="sale" ? "No items on sale right now" : "No products found"}
            </p>
            <p style={{ fontSize:13, color:"#888", marginBottom:28 }}>
              {search ? `No results for "${search}"` :
               slug==="sale" ? "The admin can toggle products on/off sale from the dashboard." :
               `No products in "${meta.title}" yet. Set a product's category to "${meta.title}" from the admin dashboard.`}
            </p>
            <Link to="/" style={{ background:"#e63946", color:"white", fontFamily:"'Poppins',sans-serif", fontSize:13, fontWeight:700, padding:"13px 36px", textDecoration:"none", borderRadius:4 }}>
              Back to Home
            </Link>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:16 }}>
            {filtered.map(p=><ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}