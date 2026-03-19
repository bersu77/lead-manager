const express = require("express");
const { Resend } = require("resend");
const Lead = require("../models/Lead");

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendWelcomeEmail(lead) {
  try {
    await resend.emails.send({
      from: "Lead Manager <onboarding@resend.dev>",
      to: lead.email,
      subject: "Welcome to Lead Manager!",
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:30px;background:#f8fafc;border-radius:12px;">
          <h2 style="color:#6366f1;">Welcome, ${lead.name}!</h2>
          <p>You have been added as a new lead in our system.</p>
          <p><strong>Status:</strong> ${lead.status}</p>
          <p style="color:#64748b;font-size:14px;">— Lead Manager Team</p>
        </div>
      `,
    });
    console.log(`Email sent to ${lead.email}`);
  } catch (err) {
    console.error(`Failed to send email to ${lead.email}:`, err.message);
  }
}

// GET /leads - Fetch all leads
router.get("/", async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

// POST /leads - Add a new lead
router.post("/", async (req, res) => {
  try {
    const { name, email, status } = req.body;
    const lead = await Lead.create({ name, email, status });
    sendWelcomeEmail(lead);
    res.status(201).json(lead);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "A lead with this email already exists" });
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(", ") });
    }
    res.status(500).json({ error: "Failed to create lead" });
  }
});

module.exports = router;
