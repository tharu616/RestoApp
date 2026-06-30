import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import StaffDashboard from './pages/StaffDashboard';
import PublicMenu from './pages/PublicMenu';


function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('role');
  if (!token) return <Navigate to="/login" />;
  if (role && userRole !== role) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: 'rgba(15,15,25,0.92)', color: 'white',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)', fontSize: '13px'
        }
      }} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/menu" element={<PublicMenu />} />

        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/customer" element={
          <ProtectedRoute role="customer"><CustomerDashboard /></ProtectedRoute>
        } />
        <Route path="/staff" element={
          <ProtectedRoute role="staff"><StaffDashboard /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}