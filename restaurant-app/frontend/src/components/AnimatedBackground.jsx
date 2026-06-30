import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function AnimatedBackground() {
  const blob1 = useRef(null);
  const blob2 = useRef(null);
  const blob3 = useRef(null);
  const blob4 = useRef(null);

  useEffect(() => {
    gsap.to(blob1.current, {
      x: 100, y: -80, duration: 8,
      repeat: -1, yoyo: true, ease: 'sine.inOut'
    });
    gsap.to(blob2.current, {
      x: -120, y: 100, duration: 10,
      repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2
    });
    gsap.to(blob3.current, {
      x: 80, y: 120, duration: 7,
      repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1
    });
    gsap.to(blob4.current, {
      x: -60, y: -100, duration: 9,
      repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 3
    });
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Dark base */}
      <div className="absolute inset-0 bg-[#0a0a0f]" />

      {/* Gradient blobs */}
      <div ref={blob1} className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div ref={blob2} className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', filter: 'blur(80px)' }} />
      <div ref={blob3} className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div ref={blob4} className="absolute bottom-[20%] left-[20%] w-[500px] h-[500px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)', filter: 'blur(70px)' }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
    </div>
  );
}