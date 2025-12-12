import jwt from 'jsonwebtoken';

export class TokenService {
  static generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'supersecret',
      { expiresIn: '24h' }
    );
  }

  static verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
  }
}