import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function auth(req, res, next) {
	const authHeader = req.headers.authorization || req.headers.Authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	const token = authHeader.split(" ")[1];

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET || "supersecret");

		// attach the user (excluding password) so downstream routes can access email/id
		const user = await User.findById(payload.userId).select("-password");
		if (!user) return res.status(401).json({ error: "Unauthorized" });

		req.user = user;
		next();
	} catch (err) {
		console.error("Auth middleware error:", err.message || err);
		return res.status(401).json({ error: "Unauthorized" });
	}
}
