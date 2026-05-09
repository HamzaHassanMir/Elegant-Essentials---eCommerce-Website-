import React from "react";
import { Link } from "react-router-dom";

export default function AboutUs() {
  return (
    <div style={{ fontFamily:"'Poppins',sans-serif", background:"#fff", minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @media(max-width:768px){
          .about-hero h1 { font-size: clamp(32px,8vw,52px) !important; }
          .about-grid { grid-template-columns: 1fr !important; }
          .values-grid { grid-template-columns: 1fr 1fr !important; }
          .team-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media(max-width:480px){
          .values-grid { grid-template-columns: 1fr !important; }
          .team-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Hero */}
      <div className="about-hero" style={{ background:"#111", padding:"80px 24px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&h=500&fit=crop)", backgroundSize:"cover", backgroundPosition:"center", opacity:0.18 }} />
        <div style={{ position:"relative", zIndex:2 }}>
          <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.22em", textTransform:"uppercase", color:"#e63946", marginBottom:12 }}>Our Story</p>
          <h1 style={{ fontSize:"clamp(36px,7vw,72px)", fontWeight:800, color:"white", lineHeight:1.1, marginBottom:16 }}>About Elegant Essentials</h1>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.6)", maxWidth:560, margin:"0 auto", lineHeight:1.8 }}>
            Born in Pakistan. Crafted for the world. We believe fashion should be timeless, accessible, and beautifully made.
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"16px 24px", fontSize:12, color:"#888" }}>
        <Link to="/" style={{ color:"#888", textDecoration:"none" }}>Home</Link>
        <span style={{ margin:"0 8px", color:"#ccc" }}>›</span>
        <span style={{ color:"#111", fontWeight:600 }}>About Us</span>
      </div>

      {/* Story Section */}
      <section style={{ maxWidth:1100, margin:"0 auto", padding:"60px 24px" }}>
        <div className="about-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"center" }}>
          <div>
            <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"#e63946", marginBottom:12 }}>Who We Are</p>
            <h2 style={{ fontSize:"clamp(26px,4vw,40px)", fontWeight:700, color:"#111", marginBottom:20, lineHeight:1.2 }}>Redefining Pakistani Fashion Since 2018</h2>
            <p style={{ fontSize:14, color:"#555", lineHeight:1.9, marginBottom:16 }}>
            Elegant Essentials began as a small atelier in Rawalpindi with a simple belief: that Pakistani craftsmanship deserves a global stage. Our founders, Hamza and Sara Mir, grew up watching their grandmother embroider by hand — and wanted to honour that tradition while making it relevant for today.
            </p>
            <p style={{ fontSize:14, color:"#555", lineHeight:1.9, marginBottom:24 }}>
              Today, Elegant Essentials serves thousands of customers across Pakistan and the diaspora, offering collections that blend traditional silhouettes with modern tailoring. Every piece is designed in-house and ethically produced in our Rawalpindi studio.
            </p>
            <Link to="/contact" style={{ display:"inline-block", background:"#e63946", color:"white", fontFamily:"'Poppins',sans-serif", fontSize:13, fontWeight:700, padding:"13px 32px", textDecoration:"none", letterSpacing:"0.06em", borderRadius:4 }}>Get in Touch</Link>
          </div>
          <div style={{ borderRadius:4, overflow:"hidden", aspectRatio:"4/5" }}>
            <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=750&fit=crop" alt="Our studio" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background:"#fafafa", padding:"60px 24px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:32, textAlign:"center" }}>
          {[
            { value:"50,000+", label:"Happy Customers" },
            { value:"800+",    label:"Products Launched" },
            { value:"7",       label:"Years of Craft" },
            { value:"4.9★",    label:"Average Rating" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p style={{ fontSize:"clamp(32px,5vw,52px)", fontWeight:800, color:"#e63946", marginBottom:8 }}>{value}</p>
              <p style={{ fontSize:13, fontWeight:600, color:"#555", letterSpacing:"0.06em", textTransform:"uppercase" }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section style={{ maxWidth:1100, margin:"0 auto", padding:"72px 24px" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"#e63946", marginBottom:10 }}>What We Stand For</p>
          <h2 style={{ fontSize:"clamp(24px,4vw,36px)", fontWeight:700, color:"#111" }}>Our Values</h2>
        </div>
        <div className="values-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:24 }}>
          {[
            { icon:"✦", title:"Craftsmanship",   desc:"Every stitch is intentional. We work with skilled artisans who bring decades of expertise to each garment." },
            { icon:"♻",  title:"Sustainability",  desc:"We prioritise natural fabrics, ethical production, and packaging that doesn't cost the earth." },
            { icon:"🤝", title:"Community",       desc:"We reinvest in the communities that make our clothes — fair wages, safe workplaces, no exceptions." },
            { icon:"🌍", title:"Inclusivity",     desc:"Fashion is for everyone. Our collections span sizes, budgets, and occasions." },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ background:"#fafafa", border:"1px solid #f0f0f0", padding:"28px 24px", borderRadius:8, transition:"box-shadow 0.2s" }}>
              <div style={{ fontSize:32, marginBottom:16 }}>{icon}</div>
              <h3 style={{ fontSize:15, fontWeight:700, color:"#111", marginBottom:10 }}>{title}</h3>
              <p style={{ fontSize:13, color:"#666", lineHeight:1.8 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section style={{ background:"#111", padding:"72px 24px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"#e63946", marginBottom:10 }}>The People Behind Elegant Essentials</p>
            <h2 style={{ fontSize:"clamp(24px,4vw,36px)", fontWeight:700, color:"white" }}>Meet the Team</h2>
          </div>
          <div className="team-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
            {[
              { name:"Hamza Mir",    role:"Co-Founder & Creative Director", img:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&facepad=2&faces=1" },
              { name:"Sara Mir",     role:"Co-Founder & Head of Design",    img:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&facepad=2&faces=1" },
              { name:"Bilal Ahmed",  role:"Head of Production",             img:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&facepad=2&faces=1" },
            ].map(({ name, role, img }) => (
              <div key={name} style={{ textAlign:"center" }}>
                <div style={{ width:120, height:120, borderRadius:"50%", overflow:"hidden", margin:"0 auto 16px", border:"3px solid #e63946" }}>
                  <img src={img} alt={name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                </div>
                <p style={{ fontSize:16, fontWeight:700, color:"white", marginBottom:4 }}>{name}</p>
                <p style={{ fontSize:12, color:"#888" }}>{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:"80px 24px", textAlign:"center", background:"#fafafa" }}>
        <h2 style={{ fontSize:"clamp(24px,4vw,36px)", fontWeight:700, color:"#111", marginBottom:12 }}>Ready to Explore?</h2>
        <p style={{ fontSize:14, color:"#666", marginBottom:32 }}>Browse our latest collections or reach out to us directly.</p>
        <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}>
          <Link to="/" style={{ background:"#e63946", color:"white", fontFamily:"'Poppins',sans-serif", fontSize:13, fontWeight:700, padding:"14px 36px", textDecoration:"none", letterSpacing:"0.06em", borderRadius:4 }}>Shop Now</Link>
          <Link to="/contact" style={{ background:"white", color:"#111", fontFamily:"'Poppins',sans-serif", fontSize:13, fontWeight:700, padding:"14px 36px", textDecoration:"none", letterSpacing:"0.06em", border:"2px solid #111", borderRadius:4 }}>Contact Us</Link>
        </div>
      </section>
    </div>
  );
}
