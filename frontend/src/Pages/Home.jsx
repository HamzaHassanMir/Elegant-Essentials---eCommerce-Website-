import React, { useEffect, useState }  from "react";
import { Link, useNavigate }           from "react-router-dom";
import { useDispatch, useSelector }    from "react-redux";
import { fetchProducts, selectAllProducts, selectProductsLoading, selectProductsError } from "../store/productsSlice";
import ProductCard from "../components/ProductCard";

const UNSPLASH_CATEGORIES = [
  { name: "Women's", img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop", path: "/category/women" },
  { name: "Men's",   img: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&h=500&fit=crop", path: "/category/men" },
  { name: "Bags",    img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop", path: "/category/bags" },
  { name: "Winter",  img: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400&h=500&fit=crop", path: "/category/winter" },
];

const BLOGS = [
  {
    id: 1,
    title: "Style With Substance",
    excerpt: "Discover the art of curating a wardrobe that transcends seasons.",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=280&fit=crop",
    content: `Building a wardrobe that stands the test of time starts with understanding your personal aesthetic. Rather than chasing every trend, focus on pieces that speak to who you are — garments that carry quiet confidence.\n\nStart with a strong foundation: a well-cut kurta in a neutral tone, a structured shawl, a versatile pair of trousers. These anchors allow you to build outward, layering statement pieces with purpose rather than noise.\n\nThe art of curating isn't about having less — it's about having exactly what you need. Each piece should earn its place. Ask yourself: does this fit the life I actually live, or the life I imagine? The best wardrobes bridge that gap.\n\nFinally, invest in fabric. Cotton, lawn, and khaddar in Pakistan's climate are not just practical — they are beautiful. Clothes that breathe allow you to move through the world with ease, and ease is the foundation of true style.`,
    author: "Style Desk",
    date: "April 2026",
  },
  {
    id: 2,
    title: "Top Pakistani Fashion Brands",
    excerpt: "A look at the brands reshaping fashion in Pakistan today.",
    img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=280&fit=crop",
    content: `Pakistan's fashion industry has undergone a remarkable transformation over the past decade. What was once a landscape dominated by a handful of heritage names has exploded into a vibrant ecosystem of emerging designers, digital-first brands, and bold creative voices.\n\nBrands like Élan, Sana Safinaz, and Khaadi have earned international recognition, taking Pakistani craftsmanship to global runways. Meanwhile, newer labels are experimenting with streetwear aesthetics fused with traditional silhouettes — creating something entirely new.\n\nThe rise of e-commerce has been a game changer. Smaller independent designers now reach customers across the country — and the diaspora — without needing a physical footprint. Platforms like Dukaan, Shopify, and Instagram have levelled the playing field.\n\nAt Maison, we believe Pakistan's fashion story is only just beginning. The creativity, the textiles, the craftsmanship — it all points to a future where Pakistani fashion is not regional, but genuinely global.`,
    author: "Editorial Team",
    date: "March 2026",
  },
  {
    id: 3,
    title: "Comfort & Style Together",
    excerpt: "You don't have to sacrifice comfort for a polished look.",
    img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=280&fit=crop",
    content: `For too long, fashion has asked us to choose: look good, or feel comfortable. The good news? That choice is a myth.\n\nThe shift toward relaxed tailoring, breathable fabrics, and thoughtful construction means your most stylish outfit can also be the one you want to stay in all day. Pakistani fashion, with its roots in loose-fitting shalwar kameez and flowing dupattas, has always understood this. We just needed to remind ourselves.\n\nThe key is fit. A well-fitted kurta in soft lawn will always look more intentional than an ill-fitted one in expensive fabric. Proportion matters more than price. When clothes move with you rather than against you, confidence follows naturally.\n\nPractical styling tips: choose natural fibres, embrace slightly oversized silhouettes styled with a belt or tuck, and invest in footwear that matches the energy of your outfit without punishing your feet. Comfort, properly understood, is the ultimate luxury.`,
    author: "Fashion Features",
    date: "February 2026",
  },
];

const DiamondDivider = () => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, margin:"12px 0 32px" }}>
    <div style={{ width:48, height:1, background:"#ddd" }} />
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#bbb"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
    <div style={{ width:48, height:1, background:"#ddd" }} />
  </div>
);

const SectionHeader = ({ title, subtitle, viewAllPath }) => (
  <div style={{ textAlign:"center", marginBottom:8 }}>
    {subtitle && <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:12, color:"#e63946", fontWeight:600, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:6 }}>{subtitle}</p>}
    <h2 style={{ fontFamily:"'Poppins',sans-serif", fontSize:"clamp(22px,4vw,32px)", fontWeight:700, color:"#111", margin:0 }}>{title}</h2>
    <DiamondDivider />
    {viewAllPath && (
      <Link to={viewAllPath} style={{ display:"inline-block", border:"1.5px solid #111", color:"#111", fontFamily:"'Poppins',sans-serif", fontSize:12, fontWeight:600, letterSpacing:"0.08em", padding:"9px 28px", textDecoration:"none", borderRadius:40, marginBottom:40, transition:"all 0.2s" }}
        onMouseEnter={e=>{e.currentTarget.style.background="#111";e.currentTarget.style.color="#fff";}}
        onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#111";}}>
        View All
      </Link>
    )}
  </div>
);

export default function Home() {
  const dispatch  = useDispatch();
  const products  = useSelector(selectAllProducts);
  const loading   = useSelector(selectProductsLoading);
  const error     = useSelector(selectProductsError);
  const [heroSlide, setHeroSlide]   = useState(0);
  const [activeBlog, setActiveBlog] = useState(null);
  const navigate = useNavigate();

  const heroSlides = [
    { bg:"#1a1a2e", accent:"#e63946", tag:"New Arrivals 2026", title:"Step Into\nThe Season", sub:"Discover our latest collection crafted for every occasion.", cta:"Shop New In", ctaPath:"/category/new-in", img:"https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=700&fit=crop" },
    { bg:"#2c1810", accent:"#f4a261", tag:"Summer Sale", title:"Upto 50%\nOff Sitewide", sub:"Limited time. Premium quality at unbeatable prices.", cta:"Shop Sale", ctaPath:"/category/sale", img:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=700&fit=crop" },
    { bg:"#0d1b2a", accent:"#48cae4", tag:"Luxury Edit", title:"Timeless\nElegance", sub:"A curated edit of our finest pieces for the discerning.", cta:"Explore Edit", ctaPath:"/category/new-in", img:"https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=700&fit=crop" },
  ];

  useEffect(() => {
    const t = setInterval(() => setHeroSlide(s => (s+1) % heroSlides.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // Only fetch if we don't already have products in the store
    if (products.length === 0) dispatch(fetchProducts());
  }, [dispatch]);

  const slide = heroSlides[heroSlide];

  return (
    <div style={{ fontFamily:"'Poppins',sans-serif", background:"#fff", minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .cat-card:hover img { transform: scale(1.06) !important; }
        .cat-card:hover .cat-overlay { opacity: 1 !important; }
        .blog-card { cursor:pointer; transition:box-shadow 0.25s,transform 0.25s; }
        .blog-card:hover { transform:translateY(-3px); box-shadow:0 8px 32px rgba(0,0,0,0.1) !important; }
        .blog-card:hover img { transform: scale(1.04) !important; }
        .budget-card:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 40px rgba(0,0,0,0.18) !important; }
        .feature-item { display:flex; align-items:center; gap:16px; padding:24px; flex:1; }
        .hero-dot { width:8px; height:8px; border-radius:50%; border:2px solid white; cursor:pointer; transition:background 0.2s; }
        .hero-dot.active { background:white; }
        @keyframes fadeSlide { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .hero-content { animation: fadeSlide 0.6s ease; }
        .skeleton { background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200% 100%; animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .blog-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:500; display:flex; align-items:center; justify-content:center; padding:20px; }
        .blog-modal { background:white; max-width:680px; width:100%; max-height:90vh; overflow-y:auto; border-radius:8px; }
        @media(max-width:768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-img-wrap { display: none !important; }
          .hero-content h1 { font-size: clamp(36px,10vw,64px) !important; }
          .features-grid { flex-direction: column !important; }
          .feature-item { border-right: none !important; border-bottom: 1px solid #eee; }
          .budget-grid { grid-template-columns: 1fr !important; }
          .blog-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
          .footer-brand { grid-column: 1 / -1 !important; }
          .cart-summary-grid { grid-template-columns: 1fr !important; }
        }
        @media(max-width:480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ background:slide.bg, minHeight:"88vh", display:"flex", alignItems:"center", overflow:"hidden", position:"relative", transition:"background 0.8s ease" }}>
        <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 70% 50%, ${slide.accent}15, transparent 60%)` }} />
        <div className="hero-grid" style={{ maxWidth:1300, margin:"0 auto", padding:"60px 24px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"center", width:"100%", position:"relative", zIndex:2 }}>
          <div key={heroSlide} className="hero-content">
            <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:11, fontWeight:600, letterSpacing:"0.22em", textTransform:"uppercase", color:slide.accent, display:"block", marginBottom:16 }}>{slide.tag}</span>
            <h1 style={{ fontFamily:"'Poppins',sans-serif", fontSize:"clamp(40px,6vw,84px)", fontWeight:800, color:"white", lineHeight:1.05, whiteSpace:"pre-line", marginBottom:20 }}>{slide.title}</h1>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:15, color:"rgba(255,255,255,0.6)", lineHeight:1.8, marginBottom:36, maxWidth:420 }}>{slide.sub}</p>
            <div style={{ display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" }}>
              <Link to={slide.ctaPath}
                style={{ background:slide.accent, color:"white", fontFamily:"'Poppins',sans-serif", fontSize:13, fontWeight:700, padding:"14px 32px", textDecoration:"none", letterSpacing:"0.06em", transition:"opacity 0.2s" }}
                onMouseEnter={e=>e.currentTarget.style.opacity="0.85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                {slide.cta}
              </Link>
              <Link to="/category/new-in"
                style={{ color:"rgba(255,255,255,0.7)", fontFamily:"'Poppins',sans-serif", fontSize:13, fontWeight:500, textDecoration:"none", borderBottom:"1px solid rgba(255,255,255,0.3)", paddingBottom:2 }}>
                Explore All →
              </Link>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:40 }}>
              {heroSlides.map((_,i) => (
                <div key={i} className={`hero-dot${i===heroSlide?" active":""}`} onClick={() => setHeroSlide(i)} />
              ))}
            </div>
          </div>
          <div className="hero-img-wrap" style={{ display:"flex", justifyContent:"flex-end" }}>
            <img key={heroSlide} src={slide.img} alt="hero" style={{ width:"100%", maxWidth:480, height:560, objectFit:"cover", animation:"fadeSlide 0.6s ease" }} />
          </div>
        </div>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:60, background:"linear-gradient(to top, white, transparent)" }} />
      </section>

      {/* ── FEATURES STRIP ── */}
      <div style={{ borderTop:"1px solid #eee", borderBottom:"1px solid #eee", background:"#fafafa" }}>
        <div className="features-grid" style={{ maxWidth:1300, margin:"0 auto", display:"flex", flexWrap:"wrap" }}>
          {[
            { icon:"🚚", title:"Free Shipping",  desc:"On orders above PKR 3,500" },
            { icon:"💬", title:"Support 24/7",   desc:"Contact us any time, any day" },
            { icon:"💳", title:"Pay Later",      desc:"Cash on Delivery available" },
            { icon:"🔒", title:"100% Secure",   desc:"Fully encrypted payments" },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="feature-item" style={{ flex:"1 1 200px", borderRight:"1px solid #eee" }}>
              <span style={{ fontSize:28 }}>{icon}</span>
              <div>
                <p style={{ fontWeight:700, fontSize:13, color:"#111", marginBottom:2 }}>{title}</p>
                <p style={{ fontSize:11, color:"#888" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <section style={{ padding:"72px 24px" }}>
        <div style={{ maxWidth:1300, margin:"0 auto" }}>
          <SectionHeader title="Explore Our Collections" />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:16 }}>
            {UNSPLASH_CATEGORIES.map(cat => (
              <Link key={cat.name} to={cat.path} className="cat-card" style={{ position:"relative", overflow:"hidden", display:"block", textDecoration:"none", aspectRatio:"4/5" }}>
                <img src={cat.img} alt={cat.name} style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.5s ease" }} />
                <div className="cat-overlay" style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.35)", opacity:0, transition:"opacity 0.3s", display:"flex", alignItems:"flex-end", padding:24 }}>
                  <span style={{ color:"white", fontFamily:"'Poppins',sans-serif", fontSize:11, letterSpacing:"0.16em", textTransform:"uppercase", fontWeight:600, borderBottom:"1px solid rgba(255,255,255,0.5)", paddingBottom:3 }}>Shop Now</span>
                </div>
                <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"20px 20px 16px", background:"linear-gradient(to top,rgba(0,0,0,0.6),transparent)" }}>
                  <p style={{ color:"white", fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:18, letterSpacing:"0.02em" }}>{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section style={{ padding:"0 24px 72px", background:"#fafafa" }}>
        <div style={{ maxWidth:1300, margin:"0 auto", paddingTop:72 }}>
          <SectionHeader title="We Think You'll Love New Arrivals" viewAllPath="/category/new-in" />
          {loading ? (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:16 }}>
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height:380, borderRadius:2 }} />)}
            </div>
          ) : error ? (
            <div style={{ textAlign:"center", padding:"60px 0", background:"#fff3f3", border:"1px solid #fecaca", borderRadius:4 }}>
              <p style={{ color:"#e63946", fontWeight:600, marginBottom:8 }}>Could not load products</p>
              <p style={{ color:"#888", fontSize:13 }}>{error} — make sure your backend is running on port 5000</p>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign:"center", padding:"80px 0", color:"#888" }}>
              <p style={{ fontSize:20, fontWeight:600, marginBottom:8 }}>No products yet</p>
              <p style={{ fontSize:13 }}>Add products from the admin panel at <strong>/admin</strong></p>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:16 }}>
              {products.slice(0,8).map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── BUDGET DEALS ── */}
      <section style={{ padding:"72px 24px", background:"white" }}>
        <div style={{ maxWidth:1300, margin:"0 auto" }}>
          <SectionHeader title="Budget Deals" />
          <div className="budget-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
            {[
              { label:"Budget Bestsellers", price:"1500", bg:"linear-gradient(135deg,#1a1a1a,#333)", img:"https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=300&h=200&fit=crop", path:"/category/sale" },
              { label:"Midrange Magic",     price:"2500", bg:"linear-gradient(135deg,#1a1a2e,#16213e)", img:"https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&h=200&fit=crop", path:"/category/sale" },
              { label:"Affordable Luxury",  price:"3500", bg:"linear-gradient(135deg,#2c1810,#4a2c20)", img:"https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=300&h=200&fit=crop", path:"/category/sale" },
            ].map(({ label, price, bg, img, path }) => (
              <Link key={label} to={path} style={{ textDecoration:"none" }}>
                <div className="budget-card" style={{ background:bg, position:"relative", overflow:"hidden", cursor:"pointer", transition:"transform 0.3s, box-shadow 0.3s" }}>
                  <img src={img} alt={label} style={{ width:"100%", height:240, objectFit:"cover", opacity:0.35, mixBlendMode:"luminosity" }} />
                  <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, textAlign:"center" }}>
                    <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:13, color:"rgba(255,255,255,0.7)", letterSpacing:"0.08em", marginBottom:6 }}>Everything Under</p>
                    <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:52, fontWeight:800, color:"#C9A84C", lineHeight:1 }}>{price}</p>
                    <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:13, color:"rgba(255,255,255,0.7)", marginBottom:20 }}>PKR</p>
                    <div style={{ background:"white", color:"#111", fontFamily:"'Poppins',sans-serif", fontSize:11, fontWeight:700, padding:"8px 24px", letterSpacing:"0.1em" }}>SHOP NOW</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOGS ── */}
      <section style={{ padding:"72px 24px", background:"#fafafa" }}>
        <div style={{ maxWidth:1300, margin:"0 auto" }}>
          <SectionHeader title="Blogs" />
          <div className="blog-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
            {BLOGS.map(blog => (
              <div key={blog.id} className="blog-card" onClick={() => setActiveBlog(blog)} style={{ background:"white", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ overflow:"hidden", height:220 }}>
                  <img src={blog.img} alt={blog.title} style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.4s ease" }} />
                </div>
                <div style={{ padding:"20px 20px 24px" }}>
                  <h3 style={{ fontFamily:"'Poppins',sans-serif", fontSize:16, fontWeight:700, color:"#111", marginBottom:8 }}>{blog.title}</h3>
                  <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:12, color:"#888", lineHeight:1.7, marginBottom:14 }}>{blog.excerpt}</p>
                  <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:11, fontWeight:600, color:"#e63946", letterSpacing:"0.06em", borderBottom:"1px solid #e63946", paddingBottom:1 }}>Read More →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG MODAL ── */}
      {activeBlog && (
        <div className="blog-modal-overlay" onClick={() => setActiveBlog(null)}>
          <div className="blog-modal" onClick={e => e.stopPropagation()}>
            <img src={activeBlog.img} alt={activeBlog.title} style={{ width:"100%", height:280, objectFit:"cover" }} />
            <div style={{ padding:"32px 32px 40px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                <div>
                  <p style={{ fontSize:11, color:"#e63946", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>{activeBlog.author} · {activeBlog.date}</p>
                  <h2 style={{ fontFamily:"'Poppins',sans-serif", fontSize:26, fontWeight:700, color:"#111", lineHeight:1.2 }}>{activeBlog.title}</h2>
                </div>
                <button onClick={() => setActiveBlog(null)} style={{ background:"none", border:"1px solid #eee", cursor:"pointer", fontSize:18, color:"#888", padding:"4px 10px", marginLeft:16, flexShrink:0, borderRadius:4 }}>×</button>
              </div>
              <div style={{ height:1, background:"#f0f0f0", marginBottom:24 }} />
              {activeBlog.content.split("\n\n").map((para, i) => (
                <p key={i} style={{ fontFamily:"'Poppins',sans-serif", fontSize:14, color:"#444", lineHeight:1.9, marginBottom:16 }}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ background:"#111", color:"#999", fontFamily:"'Poppins',sans-serif" }}>
        <div className="footer-grid" style={{ maxWidth:1300, margin:"0 auto", padding:"60px 24px 40px", display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1.5fr", gap:48 }}>
          <div className="footer-brand">
            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:22, fontWeight:800, color:"white", marginBottom:6, letterSpacing:"-0.01em" }}>MAISON</p>
            <p style={{ fontSize:12, lineHeight:1.8, marginBottom:20, color:"#666" }}>6th Floor Makkah Tower, Adam Jee Road, Saddar, Rawalpindi, 46000</p>
            <p style={{ fontSize:12, color:"#666", marginBottom:6 }}>📧 care@maison.com.pk</p>
            <p style={{ fontSize:12, color:"#666", marginBottom:6 }}>⏰ Office Timings: 9:30 AM – 5:00 PM, Mon–Fri</p>
            <p style={{ fontSize:12, color:"#666" }}>Any Query: Marketing Dept. Ext. 127 &amp; 144</p>
          </div>
          <div>
            <p style={{ fontWeight:700, color:"white", fontSize:13, marginBottom:16, letterSpacing:"0.06em", textTransform:"uppercase" }}>Explore</p>
            {[
              { label:"Women",       path:"/category/women" },
              { label:"Men",         path:"/category/men" },
              { label:"Sale",        path:"/category/sale" },
              { label:"Bags",        path:"/category/bags" },
              { label:"Accessories", path:"/category/accessories" },
            ].map(({ label, path }) => (
              <Link key={label} to={path} style={{ display:"block", color:"#666", textDecoration:"none", fontSize:12, marginBottom:10, transition:"color 0.2s" }}
                onMouseEnter={e=>e.target.style.color="#e63946"} onMouseLeave={e=>e.target.style.color="#666"}>{label}</Link>
            ))}
          </div>
          <div>
            <p style={{ fontWeight:700, color:"white", fontSize:13, marginBottom:16, letterSpacing:"0.06em", textTransform:"uppercase" }}>Useful Links</p>
            {[
              { label:"About Us",          path:"/about" },
              { label:"Contact Us",        path:"/contact" },
              { label:"FAQs",              path:"/contact" },
              { label:"Terms & Conditions",path:"/about" },
              { label:"Privacy Policy",    path:"/about" },
            ].map(({ label, path }) => (
              <Link key={label} to={path} style={{ display:"block", color:"#666", textDecoration:"none", fontSize:12, marginBottom:10, transition:"color 0.2s" }}
                onMouseEnter={e=>e.target.style.color="#e63946"} onMouseLeave={e=>e.target.style.color="#666"}>{label}</Link>
            ))}
          </div>
          <div>
            <p style={{ fontWeight:700, color:"white", fontSize:13, marginBottom:16, letterSpacing:"0.06em", textTransform:"uppercase" }}>Newsletter Signup</p>
            <p style={{ fontSize:12, color:"#666", marginBottom:16, lineHeight:1.7 }}>Subscribe to get the latest deals and new arrivals straight to your inbox.</p>
            <div style={{ display:"flex", gap:0 }}>
              <input placeholder="Your email address" style={{ flex:1, padding:"11px 14px", border:"1px solid #333", background:"#1a1a1a", color:"white", fontFamily:"'Poppins',sans-serif", fontSize:12, outline:"none", minWidth:0 }} />
              <button style={{ background:"#e63946", color:"white", border:"none", padding:"11px 18px", fontFamily:"'Poppins',sans-serif", fontSize:12, fontWeight:600, cursor:"pointer", letterSpacing:"0.06em", flexShrink:0 }}>Subscribe</button>
            </div>
          </div>
        </div>
        <div style={{ borderTop:"1px solid #222", padding:"20px 24px", textAlign:"center" }}>
          <p style={{ fontSize:11, color:"#444" }}>© 2026 Maison. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}