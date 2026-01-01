export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  async signup(req, res, next) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      await this.authService.signup(email, password);
      res.status(201).json({ message: 'User created' });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await this.authService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async validate(req, res, next) {
    try {
      // If we reach here, the auth middleware has already validated the token
      // The req.user should be populated with user information
      res.json({ 
        valid: true, 
        userId: req.user._id,
        email: req.user.email 
      });
    } catch (error) {
      next(error);
    }
  }
}