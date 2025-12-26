import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { config } from "./config/index.js";
import authRoutes from "./routes/auth.js";
import eventsRouter from "./routes/events.js";
import adminRoutes from "./routes/admin.js";
import workoutRoutes from "./routes/workouts.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/workouts", workoutRoutes);

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

app.listen(5000, () =>
	console.log(`🚀 Server running on port 5000`)
);
