import { Navigate } from 'react-router-dom';

const normalize = (v) => String(v || '').trim().toLowerCase();

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem('accessToken');
  const role = normalize(localStorage.getItem('role'));

  if (!token) return <Navigate to="/" replace />;

  if (allowedRoles.length) {
    const allowed = allowedRoles.map(normalize);
    const ok =
      allowed.includes(role) ||
      (allowed.includes('staff') && ['waiter', 'chef', 'manager', 'cashier', 'head waiter'].includes(role));

    if (!ok) return <Navigate to="/" replace />;
  }

  return children;
}