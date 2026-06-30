import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Star, Clock, MapPin, ArrowRight, UtensilsCrossed, MenuSquare } from 'lucide-react';

const BG = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80';

export default function Home() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(heroRef.current,
      { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' })
      .fromTo(titleRef.current,
        { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.9, ease: 'back.out(1.4)' }, '-=0.6')
      .fromTo(subtitleRef.current,
        { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.4')
      .fromTo(btnRef.current,
        { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3');
  }, []);

  const features = [
    { icon: Star, label: 'Premium Quality', desc: 'Finest ingredients sourced daily' },
    { icon: Clock, label: 'Fast Service', desc: 'Orders ready in 20 minutes' },
    { icon: MapPin, label: 'Colombo, LK', desc: 'Located in the heart of the city' },
  ];

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

      {/* Background Image */}
      <div ref={heroRef} style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `url(${BG})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }} />

      {/* Dark Overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.75) 100%)'
      }} />

      {/* Orange Tint */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 2,
        background: 'linear-gradient(180deg, rgba(251,146,60,0.08) 0%, transparent 40%, rgba(0,0,0,0.4) 100%)'
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* ── Navbar ── */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          style={{
            padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.07)'
          }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #fb923c, #f43f5e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(251,146,60,0.35)'
            }}>
              <ChefHat size={22} color="white" />
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: 800, fontSize: '20px', lineHeight: 1 }}>RestoPro</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Fine Dining Experience</p>
            </div>
          </div>

          {/* Nav Links + Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

            {/* View Menu — goes to public menu page (customer login) */}
            <motion.button
              onClick={() => navigate('/menu')}
              whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: 600,
                color: 'rgba(255,255,255,0.65)', cursor: 'pointer',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)'
              }}>
              <MenuSquare size={15} /> Menu
            </motion.button>

            {/* Sign In */}
            <motion.button
              onClick={() => navigate('/login')}
              whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}
              style={{
                padding: '10px 22px', borderRadius: '12px', fontSize: '13px', fontWeight: 600,
                color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)',
                backdropFilter: 'blur(10px)'
              }}>
              Sign In
            </motion.button>

            {/* Get Started */}
            <motion.button
              onClick={() => navigate('/register')}
              whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}
              style={{
                padding: '10px 22px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
                color: 'white', cursor: 'pointer',
                background: 'linear-gradient(135deg, #fb923c, #f43f5e)',
                border: 'none', boxShadow: '0 4px 16px rgba(251,146,60,0.35)'
              }}>
              Get Started
            </motion.button>
          </div>
        </motion.nav>

        {/* ── Hero ── */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 40px' }}>
          <div style={{ maxWidth: '700px' }}>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', borderRadius: '50px', marginBottom: '28px',
                background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.25)',
                backdropFilter: 'blur(10px)'
              }}>
              <UtensilsCrossed size={14} color="#fb923c" />
              <span style={{ color: '#fb923c', fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px' }}>
                RESTAURANT MANAGEMENT SYSTEM
              </span>
            </motion.div>

            {/* Title */}
            <h1 ref={titleRef} style={{
              color: 'white', fontSize: '68px', fontWeight: 900, lineHeight: 1.05,
              marginBottom: '22px', letterSpacing: '-2px'
            }}>
              Where Every
              <span style={{
                display: 'block',
                background: 'linear-gradient(135deg, #fb923c, #f43f5e)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>
                Meal Matters
              </span>
            </h1>

            {/* Subtitle */}
            <p ref={subtitleRef} style={{
              color: 'rgba(255,255,255,0.55)', fontSize: '18px', lineHeight: 1.7,
              marginBottom: '38px', maxWidth: '520px'
            }}>
              Experience seamless dining with our state-of-the-art restaurant management system.
              Order, reserve, and enjoy — all in one place.
            </p>

            {/* Hero Buttons */}
            <div ref={btnRef} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>

              {/* Reserve a Table → Register */}
              <motion.button
                onClick={() => navigate('/register')}
                whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.03 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '9px',
                  padding: '15px 32px', borderRadius: '14px', fontSize: '15px', fontWeight: 700,
                  color: 'white', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #fb923c, #f43f5e)',
                  border: 'none', boxShadow: '0 6px 28px rgba(251,146,60,0.4)'
                }}>
                Reserve a Table <ArrowRight size={17} />
              </motion.button>

              {/* View Menu → Login then customer dashboard */}
              <motion.button
                onClick={() => navigate('/menu')}
                whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.03 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '9px',
                  padding: '15px 32px', borderRadius: '14px', fontSize: '15px', fontWeight: 600,
                  color: 'rgba(255,255,255,0.75)', cursor: 'pointer',
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(12px)'
                }}>
                <UtensilsCrossed size={16} /> View Menu
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── Feature Cards ── */}
        <div style={{ padding: '0 40px 48px' }}>
          <div style={{ display: 'flex', gap: '14px' }}>
            {features.map(({ icon: Icon, label, desc }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.12 }}
                whileHover={{ y: -4, scale: 1.02 }}
                style={{
                  flex: 1, padding: '18px 20px', borderRadius: '16px',
                  background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', gap: '14px',
                  cursor: 'default'
                }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
                  background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={19} color="#fb923c" />
                </div>
                <div>
                  <p style={{ color: 'white', fontWeight: 600, fontSize: '13px' }}>{label}</p>
                  <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '12px', marginTop: '2px' }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}