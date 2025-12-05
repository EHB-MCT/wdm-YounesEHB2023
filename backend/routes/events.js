import express from "express";
import UserEvent from "../models/UserEvent.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// events in the console for testing
router.post("/", auth, async (req, res) => {
	console.log("📩 Event received (auth):", req.body, "user:", req.user?.email);

	try {
		const { action, data } = req.body;

		if (!action) {
			return res.status(400).json({ error: "action required" });
		}

		const event = new UserEvent({
			userId: req.user._id,
			userEmail: req.user.email,
			action,
			data,
			ip: req.ip,
			userAgent: req.headers["user-agent"],
		});

		await event.save();
		res.status(201).json({ success: true });
	} catch (err) {
		console.error("❌ Error saving event:", err.message || err);
		res.status(500).json({ error: "Server error" });
	}
});

export default router;
