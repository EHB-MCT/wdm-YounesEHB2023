export const validateAuth = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  next();
};

export const validateEvent = (req, res, next) => {
  const { action } = req.body;

  if (!action) {
    return res.status(400).json({ error: 'Action is required' });
  }

  if (typeof action !== 'string') {
    return res.status(400).json({ error: 'Action must be a string' });
  }

  next();
};