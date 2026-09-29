import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import opportunityRoutes from "./routes/opportunities.js";
import profileRoutes from "./routes/profile.js";

dotenv.config();

// CREATE EXPRESS APP
const app = express();

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.CLIENT_URL,
    ],
    credentials: true,
  })
);

// JSON BODY
app.use(express.json({ limit: "1mb" }));

// HEALTH CHECK
app.get("/api/v1/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    message: "API is running",
  });
});

// ROUTES
app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/profile", profileRoutes);

app.use(
  "/api/v1/opportunities",
  opportunityRoutes
);

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message:
      err.message ||
      "Internal server error",
  });
});

// START SERVER
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("MongoDB connected");
      console.log(`API running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(
      "DATABASE CONNECTION ERROR:",
      error
    );

    process.exit(1);
  });