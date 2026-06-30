const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ message: 'No token provided' });
  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token invalid or expired' });
  }
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'admin') next();
    else res.status(403).json({ message: 'Admin access only' });
  });
};

const verifyStaff = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'staff' || req.user.role === 'admin') next();
    else res.status(403).json({ message: 'Staff access only' });
  });
};

module.exports = { verifyToken, verifyAdmin, verifyStaff };