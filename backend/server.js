require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRouter = require("./routes/auth");
const leadsRouter = require("./routes/leads");
const auth = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/leads", auth, leadsRouter);

const Lead = require("./models/Lead");
app.get("/stats", async (req, res) => {
  try {
    const leads = await Lead.find();
    res.json({
      total: leads.length,
      new_: leads.filter(l => l.status === "New").length,
      engaged: leads.filter(l => l.status === "Engaged").length,
      proposal: leads.filter(l => l.status === "Proposal Sent").length,
      won: leads.filter(l => l.status === "Closed-Won").length,
      lost: leads.filter(l => l.status === "Closed-Lost").length,
    });
  } catch { res.json({ total: 0, new_: 0, engaged: 0, proposal: 0, won: 0, lost: 0 }); }
});

app.get("/", (req, res) => {
  res.json({ message: "Lead Manager API is running" });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
