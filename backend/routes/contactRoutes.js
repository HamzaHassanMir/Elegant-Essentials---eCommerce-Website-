import express    from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// POST /api/contact
// Body: { name, email, subject, message }
router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // ── Nodemailer transporter using Gmail ─────────────────────────────────────
  // Set these in your .env file:
  //   GMAIL_USER=yourstore@gmail.com
  //   GMAIL_PASS=your_gmail_app_password   ← NOT your normal password
  //
  // To generate an App Password:
  //   1. Go to myaccount.google.com → Security → 2-Step Verification (enable it)
  //   2. Then go to myaccount.google.com → Security → App Passwords
  //   3. Create an app password for "Mail" → copy the 16-character code
  //   4. Paste it as GMAIL_PASS in your .env
  // ─────────────────────────────────────────────────────────────────────────────
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,   // Gmail App Password (not your login password)
    },
  });

  // ── Email to the store ──────────────────────────────────────────────────────
  const storeMailOptions = {
    from:    `"Maison Contact Form" <${process.env.GMAIL_USER}>`,
    to:      process.env.GMAIL_USER,   // Sends to your own Gmail inbox
    replyTo: email,                    // Clicking "Reply" replies to the customer
    subject: `[Contact Form] ${subject} — from ${name}`,
    html: `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#fafafa">
        <div style="background:#e63946;padding:20px 24px;border-radius:8px 8px 0 0">
          <h2 style="color:white;margin:0;font-size:20px">New Contact Form Message</h2>
        </div>
        <div style="background:white;padding:28px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#6b7280;width:120px;font-weight:600">From</td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#111">${name}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#6b7280;font-weight:600">Email</td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#111"><a href="mailto:${email}" style="color:#e63946">${email}</a></td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#6b7280;font-weight:600">Subject</td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#111">${subject}</td></tr>
            <tr><td style="padding:10px 0;font-size:13px;color:#6b7280;font-weight:600;vertical-align:top">Message</td>
                <td style="padding:10px 0;font-size:13px;color:#111;line-height:1.8">${message.replace(/\n/g, "<br/>")}</td></tr>
          </table>
          <div style="margin-top:24px;padding:14px 16px;background:#eff6ff;border-radius:6px;font-size:12px;color:#1d4ed8">
            💡 Hit <strong>Reply</strong> to respond directly to ${name} at ${email}
          </div>
        </div>
        <p style="text-align:center;font-size:11px;color:#aaa;margin-top:20px">Maison Contact Form · Rawalpindi, Pakistan</p>
      </div>
    `,
  };

  // ── Auto-reply to the customer ──────────────────────────────────────────────
  const autoReplyOptions = {
    from:    `"Maison" <${process.env.GMAIL_USER}>`,
    to:      email,
    subject: `We've received your message — Maison`,
    html: `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#fafafa">
        <div style="background:#111;padding:20px 24px;border-radius:8px 8px 0 0;display:flex;align-items:center;gap:12px">
          <h1 style="color:white;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.02em">MAISON</h1>
        </div>
        <div style="background:white;padding:36px 28px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
          <p style="font-size:16px;font-weight:700;color:#111;margin-bottom:8px">Hi ${name}, thanks for reaching out! 👋</p>
          <p style="font-size:14px;color:#555;line-height:1.8;margin-bottom:20px">
            We've received your message regarding <strong>"${subject}"</strong> and our team will get back to you within <strong>1 business day</strong>.
          </p>
          <div style="background:#fafafa;border-left:4px solid #e63946;padding:16px 20px;border-radius:0 6px 6px 0;margin-bottom:24px">
            <p style="font-size:13px;color:#374151;font-style:italic;line-height:1.8;margin:0">"${message.length > 200 ? message.slice(0,200)+"…" : message}"</p>
          </div>
          <p style="font-size:13px;color:#888;line-height:1.8">
            If this is urgent, you can also reach us at <a href="mailto:care@maison.com.pk" style="color:#e63946">care@maison.com.pk</a> or during office hours at the extensions listed on our website.
          </p>
          <div style="margin-top:28px;padding-top:20px;border-top:1px solid #f0f0f0;display:flex;gap:12px">
            <a href="${process.env.CLIENT_URL || "http://localhost:5173"}" style="background:#e63946;color:white;text-decoration:none;padding:11px 24px;border-radius:6px;font-size:13px;font-weight:600">Continue Shopping</a>
          </div>
        </div>
        <p style="text-align:center;font-size:11px;color:#aaa;margin-top:20px">© 2026 Maison · Rawalpindi, Pakistan</p>
      </div>
    `,
  };

  try {
    // Send both emails concurrently
    await Promise.all([
      transporter.sendMail(storeMailOptions),
      transporter.sendMail(autoReplyOptions),
    ]);
    return res.status(200).json({ message: "Message sent successfully." });
  } catch (err) {
    console.error("Nodemailer error:", err.message);
    // Give a useful error — common cause is missing/wrong App Password
    if (err.code === "EAUTH") {
      return res.status(500).json({
        message: "Email authentication failed. Check GMAIL_USER and GMAIL_PASS in your .env file. Make sure you're using a Gmail App Password, not your regular password.",
      });
    }
    return res.status(500).json({ message: "Failed to send email. Please try again later." });
  }
});

export default router;
