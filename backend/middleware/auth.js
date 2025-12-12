import { TokenService } from '../services/TokenService.js';
import { UserRepository } from '../repositories/UserRepository.js';

const userRepository = new UserRepository();

export default async function auth(req, res, next) {
	const authHeader = req.headers.authorization || req.headers.Authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	const token = authHeader.split(" ")[1];

	try {
		const payload = TokenService.verifyToken(token);
		const user = await userRepository.findById(payload.userId);
		
		if (!user) return res.status(401).json({ error: "Unauthorized" });

		req.user = user;
		next();
	} catch (err) {
		console.error("Auth middleware error:", err.message || err);
		return res.status(401).json({ error: "Unauthorized" });
	}
}
