import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function AnimatedBackground() {
  const b1 = useRef(null);
  const b2 = useRef(null);
  const b3 = useRef(null);

  useEffect(() => {
    gsap.to(b1.current, { x: 80, y: -60, duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to(b2.current, { x: -100, y: 80, duration: 11, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2 });
    gsap.to(b3.current, { x: 60, y: 100, duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1 });
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div className="absolute inset-0" style={{ background: '#0a0a0f' }} />
      <div ref={b1} className="absolute" style={{
        top: '-15%', left: '-10%', width: '550px', height: '550px',
        borderRadius: '50%', opacity: 0.18,
        background: 'radial-gradient(circle, #f97316 0%, transparent 70%)',
        filter: 'blur(70px)'
      }} />
      <div ref={b2} className="absolute" style={{
        bottom: '-15%', right: '-10%', width: '650px', height: '650px',
        borderRadius: '50%', opacity: 0.14,
        background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
        filter: 'blur(80px)'
      }} />
      <div ref={b3} className="absolute" style={{
        top: '35%', right: '15%', width: '400px', height: '400px',
        borderRadius: '50%', opacity: 0.1,
        background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)',
        filter: 'blur(65px)'
      }} />
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />
    </div>
  );
}