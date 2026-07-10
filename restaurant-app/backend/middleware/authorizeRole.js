module.exports = (...roles) => (req, res, next) => {
  const userRole = String(req.user?.role || req.user?.userRole || '').trim().toLowerCase();
  const allowed = roles.map(r => String(r).trim().toLowerCase());

  if (!userRole) return res.status(403).json({ message: 'Role missing in token' });
  if (!allowed.includes(userRole)) return res.status(403).json({ message: 'Access denied' });
  next();
};