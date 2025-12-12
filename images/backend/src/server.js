import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { config } from "./config/index.js";
import authRoutes from "./routes/auth.js";
import eventsRouter from "./routes/events.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRouter);

// Error handling middleware
app.use(errorHandler);

// Test route
app.get("/", (req, res) => res.send({ ok: true }));

// Connect to MongoDB
mongoose
	.connect(config.mongoUri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("✅ Connected to MongoDB"))
	.catch((err) => console.error("❌ MongoDB error:", err.message));

app.listen(config.port, () =>
	console.log(`🚀 Server running on port ${config.port}`)
);
