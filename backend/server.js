import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import eventsRouter from "./routes/events.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Define mongoUri from .env
const mongoUri = process.env.MONGO_URI;

// ✅ Connect to MongoDB
mongoose
	.connect(mongoUri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("✅ Connected to MongoDB"))
	.catch((err) => console.error("❌ MongoDB error:", err.message));

// ✅ Routes
app.get("/", (req, res) => res.send({ ok: true }));
app.use("/api/events", eventsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
