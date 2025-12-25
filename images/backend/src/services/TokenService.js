import jwt from 'jsonwebtoken';

export class TokenService {
  static generateToken(userId) {
    return jwt.sign(
      { userId, isAdmin: false },
      process.env.JWT_SECRET || 'supersecret',
      { expiresIn: '24h' }
    );
  }

  static generateAdminToken() {
    return jwt.sign(
      { isAdmin: true, adminId: 'admin' },
      process.env.JWT_SECRET || 'supersecret',
      { expiresIn: '24h' }
    );
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
    } catch (error) {
      // Re-throw the error to be handled by middleware
      throw error;
    }
  }
}