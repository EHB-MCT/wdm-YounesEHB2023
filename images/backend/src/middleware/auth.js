import { TokenService } from '../services/TokenService.js';
import { UserRepository } from '../repositories/UserRepository.js';

const userRepository = new UserRepository();

export async function auth(req, res, next) {
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
		
		// Check if token has expired specifically
		if (err.name === 'TokenExpiredError' || err.message === 'jwt expired') {
			return res.status(401).json({ 
				error: "jwt expired",
				message: "Your session has expired. Please log in again.",
				code: "TOKEN_EXPIRED"
			});
		}
		
		// Handle other JWT errors
		if (err.name === 'JsonWebTokenError') {
			return res.status(401).json({ 
				error: "invalid_token",
				message: "Invalid authentication token. Please log in again.",
				code: "INVALID_TOKEN"
			});
		}
		
		// Generic authentication error
		return res.status(401).json({ 
			error: "authentication_failed",
			message: "Authentication failed. Please log in again.",
			code: "AUTH_FAILED"
		});
	}
}
