const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const authorize = (allowedRoles = []) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Access token required' });
  }
  if (!allowedRoles.length) return next();
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
  }
  next();
};

module.exports = authenticateToken;
module.exports.authorize = authorize;
