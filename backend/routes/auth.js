import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
	const { email, password } = req.body;

	try {
		const exists = await User.findOne({ email });
		if (exists) {
			return res.status(400).json({ error: "Email already exists" });
		}

		await User.create({ email, password });

		res.status(201).json({ message: "User created" });
	} catch (err) {
		res.status(500).json({ error: "Server error" });
	}
});

// LOGIN
router.post("/login", async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email });
		if (!user || user.password !== password) {
			return res.status(400).json({ error: "Wrong email or password" });
		}

		const token = jwt.sign(
			{ userId: user._id },
			process.env.JWT_SECRET || "supersecret"
		);

		res.json({ token, userId: user._id });
	} catch (err) {
		res.status(500).json({ error: "Server error" });
	}
});

export default router;
