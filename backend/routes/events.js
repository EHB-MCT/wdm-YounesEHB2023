import express from "express";
import UserEvent from "../models/UserEvent.js";

const router = express.Router();

router.post("/", async (req, res) => {
	// 👇 ADD THIS — so you see events in your terminal
	console.log("📩 Event received:", req.body);

	try {
		const { userId, action, data } = req.body;

		if (!userId || !action) {
			return res.status(400).json({ error: "userId and action required" });
		}

		const event = new UserEvent({
			userId,
			action,
			data,
			ip: req.ip,
			userAgent: req.headers["user-agent"],
		});

		await event.save();
		res.status(201).json({ success: true });
	} catch (err) {
		console.error("❌ Error saving event:", err.message);
		res.status(500).json({ error: "Server error" });
	}
});

export default router;
