import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Phone, ChefHat, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';

const BG = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80';

export default function Register() {
  const [form,     setForm]     = useState({ name: '', email: '', phone: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const cardRef  = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 50, scale: 0.93 },
      { opacity: 1, y: 0,  scale: 1,    duration: 0.85, ease: 'back.out(1.4)' }
    );
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', {
        name:     form.name,
        email:    form.email,
        phone:    form.phone,
        password: form.password,
      });
      toast.success('Account created! Please sign in.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const fields = [
    { key: 'name',  placeholder: 'Full Name',       icon: User,  type: 'text' },
    { key: 'email', placeholder: 'Email Address',   icon: Mail,  type: 'email' },
    { key: 'phone', placeholder: 'Phone (optional)',icon: Phone, type: 'text' },
  ];

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      {/* BG */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'linear-gradient(135deg,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0.60) 50%,rgba(0,0,0,0.88) 100%)' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 2, background: 'radial-gradient(ellipse at 70% 50%,rgba(251,146,60,0.08) 0%,transparent 60%)' }} />

      {/* Card */}
      <div ref={cardRef} style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '440px', padding: '0 20px' }}>
        <div style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.13)', boxShadow: '0 24px 60px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.18)', borderRadius: '24px', padding: '40px 36px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', marginBottom: '12px', background: 'linear-gradient(135deg,#fb923c,#f43f5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(251,146,60,0.3)' }}>
              <ChefHat size={26} color="white" />
            </div>
            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 800, margin: 0 }}>Create Account</h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginTop: '4px' }}>Join RestoPro today — it's free</p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister}>
            {fields.map(({ key, placeholder, icon: Icon, type }) => (
              <div key={key} style={{ position: 'relative', marginBottom: '13px' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
                  <Icon size={16} color="rgba(255,255,255,0.32)" />
                </div>
                <input type={type} placeholder={placeholder} value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  required={key !== 'phone'} className="input-glass"
                  style={{ padding: '14px 14px 14px 44px', borderRadius: '14px', fontSize: '14px' }} />
              </div>
            ))}

            {/* Password */}
            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
                <Lock size={16} color="rgba(255,255,255,0.32)" />
              </div>
              <input type={showPass ? 'text' : 'password'} placeholder="Create Password (min 6 chars)"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                required className="input-glass"
                style={{ padding: '14px 44px 14px 44px', borderRadius: '14px', fontSize: '14px' }} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                {showPass ? <EyeOff size={16} color="rgba(255,255,255,0.32)" /> : <Eye size={16} color="rgba(255,255,255,0.32)" />}
              </button>
            </div>

            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
              style={{ width: '100%', padding: '14px', borderRadius: '14px', color: 'white', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg,#fb923c,#f43f5e)', boxShadow: '0 6px 24px rgba(251,146,60,0.35)', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </motion.button>
          </form>

          <div style={{ marginTop: '22px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '13px' }}>
              Already have an account?{' '}
              <span onClick={() => navigate('/')} style={{ color: '#fb923c', cursor: 'pointer', fontWeight: 600 }}>Sign in</span>
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