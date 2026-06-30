import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('role');
  if (!token) return <Navigate to="/" />;
  if (role && userRole !== role) return <Navigate to="/" />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background: 'rgba(20,20,30,0.9)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }
      }} />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}