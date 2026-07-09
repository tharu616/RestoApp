import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ChefHat } from 'lucide-react';
import api from '../api/axios';

const BG = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 50, scale: 0.93 },
      { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'back.out(1.4)' }
    );
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });

      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('role', String(res.data.role || '').toLowerCase());
      localStorage.setItem('userName', res.data.name || '');

      toast.success(`Welcome back, ${res.data.name}!`);

      const role = String(res.data.role || '').toLowerCase();

      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (role === 'staff' || role === 'waiter' || role === 'chef' || role === 'manager' || role === 'cashier' || role === 'head waiter') {
        navigate('/staff', { replace: true });
      } else {
        navigate('/customer', { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'linear-gradient(135deg,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0.65) 50%,rgba(0,0,0,0.88) 100%)' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 2, background: 'radial-gradient(ellipse at 30% 50%,rgba(251,146,60,0.1) 0%,transparent 60%)' }} />

      <div ref={cardRef} style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '420px', padding: '0 20px' }}>
        <div style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.13)', boxShadow: '0 24px 60px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.18)', borderRadius: '24px', padding: '40px 36px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <motion.div animate={{ rotate: [0, 4, -4, 0] }} transition={{ duration: 4, repeat: Infinity }}
              style={{ width: '64px', height: '64px', borderRadius: '18px', marginBottom: '14px', background: 'linear-gradient(135deg,#fb923c,#f43f5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(251,146,60,0.35)' }}>
              <ChefHat size={28} color="white" />
            </motion.div>
            <h1 style={{ color: 'white', fontSize: '26px', fontWeight: 800, margin: 0 }}>RestoPro</h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginTop: '4px' }}>Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ position: 'relative', marginBottom: '13px' }}>
              <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
                <Mail size={16} color="rgba(255,255,255,0.32)" />
              </div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-glass"
                style={{ padding: '14px 14px 14px 44px', borderRadius: '14px', fontSize: '14px' }}
              />
            </div>

            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
                <Lock size={16} color="rgba(255,255,255,0.32)" />
              </div>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-glass"
                style={{ padding: '14px 44px 14px 44px', borderRadius: '14px', fontSize: '14px' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
              >
                {showPass ? <EyeOff size={16} color="rgba(255,255,255,0.32)" /> : <Eye size={16} color="rgba(255,255,255,0.32)" />}
              </button>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              style={{ width: '100%', padding: '14px', borderRadius: '14px', color: 'white', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg,#fb923c,#f43f5e)', boxShadow: '0 6px 24px rgba(251,146,60,0.35)', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                    style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                  Signing in...
                </>
              ) : 'Sign In'}
            </motion.button>
          </form>

          <div style={{ marginTop: '22px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '13px' }}>
              Don't have an account?{' '}
              <span onClick={() => navigate('/register')} style={{ color: '#fb923c', cursor: 'pointer', fontWeight: 600 }}>
                Create one
              </span>
            </p>
            <span onClick={() => navigate('/home')} style={{ color: 'rgba(255,255,255,0.28)', fontSize: '12px', cursor: 'pointer' }}>
              ← Back to Home
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}