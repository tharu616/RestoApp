module.exports = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userRole = String(req.user.role).trim().toLowerCase();
    const allowed = roles.map(r => String(r).trim().toLowerCase());

    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};