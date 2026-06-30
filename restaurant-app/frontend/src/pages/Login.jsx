import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, Lock, ChefHat, Eye, EyeOff } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 60, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'back.out(1.7)' }
    );
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('role', res.data.role);
      toast.success(`Welcome back! Logged in as ${res.data.role}`);
      if (res.data.role === 'admin') navigate('/admin');
      else if (res.data.role === 'staff') navigate('/staff');
      else navigate('/customer');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <AnimatedBackground />
      <div ref={cardRef} className="relative z-10 w-full max-w-md px-4">
        <motion.div className="glass-strong rounded-3xl p-8"
          whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <motion.div className="w-16 h-16 rounded-2xl liquid-btn flex items-center justify-center mb-4"
              animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
              <ChefHat size={32} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white">RestoPro</h1>
            <p className="text-white/40 text-sm mt-1">Restaurant Management System</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input type="email" placeholder="Email address" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-glass w-full pl-12 pr-4 py-4 rounded-2xl text-sm"
                required />
            </div>

            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input type={showPassword ? 'text' : 'password'} placeholder="Password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-glass w-full pl-12 pr-12 py-4 rounded-2xl text-sm"
                required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <motion.button type="submit" disabled={loading}
              className="liquid-btn w-full py-4 rounded-2xl text-white font-semibold text-sm cursor-pointer"
              whileTap={{ scale: 0.98 }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                    animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </motion.button>
          </form>

          <p className="text-center text-white/30 text-sm mt-6">
            New customer?{' '}
            <span onClick={() => navigate('/register')}
              className="text-orange-400 cursor-pointer hover:text-orange-300 transition-colors">
              Create account
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}