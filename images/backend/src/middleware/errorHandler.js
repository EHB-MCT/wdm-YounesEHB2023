export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message || err);

  if (err.message === 'Email already exists') {
    return res.status(400).json({ error: err.message });
  }

  if (err.message === 'Invalid credentials') {
    return res.status(400).json({ error: 'Wrong email or password' });
  }

  if (err.message === 'Action is required') {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation error', details: err.message });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.status(500).json({ error: 'Server error' });
};