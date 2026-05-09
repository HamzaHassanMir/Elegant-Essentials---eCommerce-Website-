import React, { useState } from "react";
import { Link } from "react-router-dom";

const BACKEND = "http://localhost:5000";

export default function ContactUs() {
  const [form, setForm]           = useState({ name:"", email:"", subject:"", message:"" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${BACKEND}/api/contact`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to send. Please try again."); return; }
      setSubmitted(true);
    } catch {
      setError("Cannot reach server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    width:"100%", padding:"12px 14px", border:"1.5px solid #e5e7eb", borderRadius:8,
    fontFamily:"'Poppins',sans-serif", fontSize:13, outline:"none", transition:"border-color 0.2s",
    boxSizing:"border-box", background:"white",
  };
  const lbl = { fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:7 };
  const fo  = e => (e.target.style.borderColor = "#e63946");
  const bl  = e => (e.target.style.borderColor = "#e5e7eb");

  return (
    <div style={{ fontFamily:"'Poppins',sans-serif", background:"#fff", minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @media(max-width:768px){
          .contact-grid{grid-template-columns:1fr !important}
          .contact-cards{grid-template-columns:1fr 1fr !important}
          .name-row{grid-template-columns:1fr !important}
        }
        @media(max-width:480px){
          .contact-cards{grid-template-columns:1fr !important}
        }
      `}</style>

      {/* Hero */}
      <div style={{ background:"#111", padding:"80px 24px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"url(https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1400&h=400&fit=crop)", backgroundSize:"cover", backgroundPosition:"center", opacity:0.15 }} />
        <div style={{ position:"relative", zIndex:2 }}>
          <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.22em", textTransform:"uppercase", color:"#e63946", marginBottom:12 }}>We're Here</p>
          <h1 style={{ fontSize:"clamp(32px,7vw,64px)", fontWeight:800, color:"white", lineHeight:1.1, marginBottom:14 }}>Get in Touch</h1>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.6)", maxWidth:480, margin:"0 auto", lineHeight:1.8 }}>
            Questions, feedback, or just want to say hello? We'd love to hear from you.
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"16px 24px", fontSize:12, color:"#888" }}>
        <Link to="/" style={{ color:"#888", textDecoration:"none" }}>Home</Link>
        <span style={{ margin:"0 8px", color:"#ccc" }}>›</span>
        <span style={{ color:"#111", fontWeight:600 }}>Contact Us</span>
      </div>

      {/* Info Cards */}
      <section style={{ maxWidth:1100, margin:"0 auto", padding:"40px 24px 0" }}>
        <div className="contact-cards" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20, marginBottom:60 }}>
          {[
            { icon:"📍", title:"Address",     info:"6th Floor Makkah Tower\nAdam Jee Road, Saddar\nRawalpindi, 46000" },
            { icon:"📧", title:"Email",        info:"care@Elegant Essentials.com.pk" },
            { icon:"⏰", title:"Office Hours", info:"9:30 AM – 5:00 PM\nMonday – Friday" },
            { icon:"📞", title:"Departments",  info:"Marketing: Ext. 127 & 144\nCustomer Care: Ext. 100" },
          ].map(({ icon, title, info }) => (
            <div key={title} style={{ background:"#fafafa", border:"1px solid #f0f0f0", padding:"24px 20px", borderRadius:8, textAlign:"center" }}>
              <div style={{ fontSize:30, marginBottom:12 }}>{icon}</div>
              <p style={{ fontSize:13, fontWeight:700, color:"#111", marginBottom:8 }}>{title}</p>
              <p style={{ fontSize:12, color:"#666", lineHeight:1.7, whiteSpace:"pre-line" }}>{info}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form + Map */}
      <section style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px 80px" }}>
        <div className="contact-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:48 }}>

          {/* ── Form ── */}
          <div>
            <h2 style={{ fontSize:26, fontWeight:700, color:"#111", marginBottom:6 }}>Send a Message</h2>
            <p style={{ fontSize:13, color:"#888", marginBottom:28 }}>
              Your message is emailed directly to our team. We typically respond within 1 business day.
            </p>

            {submitted ? (
              <div style={{ background:"#f0fdf4", border:"1.5px solid #86efac", borderRadius:8, padding:"40px 32px", textAlign:"center" }}>
                <div style={{ fontSize:52, marginBottom:12 }}>✅</div>
                <h3 style={{ fontSize:20, fontWeight:700, color:"#166534", marginBottom:8 }}>Message Sent!</h3>
                <p style={{ fontSize:13, color:"#16a34a", marginBottom:6 }}>
                  Thanks for reaching out, <strong>{form.name}</strong>.
                </p>
                <p style={{ fontSize:13, color:"#16a34a", marginBottom:28 }}>
                  We'll reply to <strong>{form.email}</strong> as soon as possible.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name:"", email:"", subject:"", message:"" }); }}
                  style={{ background:"#166534", color:"white", border:"none", borderRadius:6, padding:"11px 28px", fontFamily:"'Poppins',sans-serif", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:18 }}>
                {error && (
                  <div style={{ background:"#fef2f2", border:"1px solid #fecaca", color:"#b91c1c", fontSize:12, padding:"11px 14px", borderRadius:6 }}>
                    ⚠️ {error}
                  </div>
                )}

                <div className="name-row" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                  <div>
                    <label style={lbl}>Full Name *</label>
                    <input type="text" required placeholder="Your name" value={form.name}
                      onChange={e=>setForm({...form,name:e.target.value})} style={inp} onFocus={fo} onBlur={bl} />
                  </div>
                  <div>
                    <label style={lbl}>Email Address *</label>
                    <input type="email" required placeholder="your@email.com" value={form.email}
                      onChange={e=>setForm({...form,email:e.target.value})} style={inp} onFocus={fo} onBlur={bl} />
                  </div>
                </div>

                <div>
                  <label style={lbl}>Subject *</label>
                  <select required value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}
                    style={{ ...inp, cursor:"pointer" }} onFocus={fo} onBlur={bl}>
                    <option value="">Select a subject…</option>
                    <option>Order Enquiry</option>
                    <option>Return / Exchange</option>
                    <option>Product Question</option>
                    <option>Partnership</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label style={lbl}>Message *</label>
                  <textarea required placeholder="How can we help you?" rows={5} value={form.message}
                    onChange={e=>setForm({...form,message:e.target.value})}
                    style={{ ...inp, resize:"vertical", minHeight:130 }} onFocus={fo} onBlur={bl} />
                </div>

                <button type="submit" disabled={loading}
                  style={{ background:loading?"#9ca3af":"#e63946", color:"white", border:"none", borderRadius:8, padding:"14px", fontFamily:"'Poppins',sans-serif", fontSize:14, fontWeight:700, cursor:loading?"not-allowed":"pointer", transition:"background 0.2s" }}
                  onMouseEnter={e=>{ if(!loading) e.target.style.background="#c62828"; }}
                  onMouseLeave={e=>{ if(!loading) e.target.style.background="#e63946"; }}>
                  {loading ? "Sending…" : "Send Message →"}
                </button>
              </form>
            )}
          </div>

          {/* ── Map ── */}
          <div>
            <h2 style={{ fontSize:26, fontWeight:700, color:"#111", marginBottom:6 }}>Find Us</h2>
            <p style={{ fontSize:13, color:"#888", marginBottom:24 }}>We're in Rawalpindi's commercial district.</p>
            <div style={{ borderRadius:8, overflow:"hidden", border:"1px solid #f0f0f0", marginBottom:24 }}>
              <iframe
                title="Elegant Essentials Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3318.9!2d73.0479!3d33.6007!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDM2JzAyLjUiTiA3M8KwMDInNTIuNCJF!5e0!3m2!1sen!2spk!4v1620000000000!5m2!1sen!2spk"
                width="100%" height="260" style={{ border:0, display:"block" }}
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div style={{ background:"#fafafa", border:"1px solid #f0f0f0", borderRadius:8, padding:"20px 24px" }}>
              <p style={{ fontWeight:700, fontSize:14, color:"#111", marginBottom:8 }}>Elegant Essentials Head Office</p>
              <p style={{ fontSize:13, color:"#666", lineHeight:1.8 }}>
              Makkah Tower<br/>Adam Road, Saddar<br/>Rawalpindi, 46000, Pakistan
              </p>
              <p style={{ fontSize:12, color:"#e63946", marginTop:10, fontWeight:600 }}>⏰ Mon–Fri: 9:30 AM – 5:00 PM</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}