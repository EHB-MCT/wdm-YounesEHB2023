import { PasswordService } from './PasswordService.js';
import { TokenService } from './TokenService.js';

export class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async signup(email, password) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await PasswordService.hashPassword(password);
    return await this.userRepository.create({ email, password: hashedPassword });
  }

  async login(email, password) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await PasswordService.comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = TokenService.generateToken(user._id);
    return { token, userId: user._id };
  }
}