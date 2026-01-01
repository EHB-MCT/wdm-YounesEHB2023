import { TokenService } from '../services/TokenService.js';

export const adminAuth = (req, res, next) => {
	try {
		const token = req.headers.authorization?.replace('Bearer ', '');
		
		if (!token) {
			return res.status(401).json({ error: 'No admin token provided' });
		}

		const decoded = TokenService.verifyToken(token);
		
		if (!decoded.isAdmin) {
			return res.status(403).json({ error: 'Admin access required' });
		}

		// Add admin info to request
		req.isAdmin = true;
		req.adminId = decoded.adminId;
		next();

	} catch (error) {
		return res.status(401).json({ error: 'Invalid admin token' });
	}
};