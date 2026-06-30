import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Search, ArrowLeft, UtensilsCrossed } from 'lucide-react';

const BG = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80';

export default function PublicMenu() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/menu').then(res => setItems(res.data));
  }, []);

  const categories = ['ALL', ...new Set(items.map(i => i.category).filter(Boolean))];
  const filtered = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'ALL' || item.category === category;
    return matchSearch && matchCat && item.is_available;
  });

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>

      {/* BG */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'rgba(0,0,0,0.88)' }} />

      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* Header */}
        <div style={{ padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <motion.button onClick={() => navigate('/home')} whileTap={{ scale: 0.95 }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)', fontSize: '13px', cursor: 'pointer' }}>
              <ArrowLeft size={14} /> Back
            </motion.button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #fb923c, #f43f5e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChefHat size={18} color="white" />
              </div>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '17px' }}>Our Menu</p>
            </div>
          </div>
          <motion.button onClick={() => navigate('/register')} whileTap={{ scale: 0.95 }}
            style={{ padding: '10px 22px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, color: 'white', cursor: 'pointer', background: 'linear-gradient(135deg, #fb923c, #f43f5e)', border: 'none', boxShadow: '0 4px 16px rgba(251,146,60,0.3)' }}>
            Order Now
          </motion.button>
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

          {/* Search + Filter */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
              <input placeholder="Search dishes..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="input-glass" style={{ padding: '12px 14px 12px 40px', borderRadius: '12px', fontSize: '14px' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <motion.button key={cat} onClick={() => setCategory(cat)} whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: 'none',
                    background: category === cat ? 'linear-gradient(135deg, #fb923c, #f43f5e)' : 'rgba(255,255,255,0.07)',
                    color: category === cat ? 'white' : 'rgba(255,255,255,0.45)',
                    boxShadow: category === cat ? '0 4px 14px rgba(251,146,60,0.3)' : 'none'
                  }}>
                  {cat}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Menu Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
            {filtered.map((item, i) => (
              <motion.div key={item.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} whileHover={{ y: -6, scale: 1.02 }}
                style={{ borderRadius: '20px', overflow: 'hidden', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>

                {/* Image Placeholder */}
                <div style={{ height: '160px', background: 'linear-gradient(135deg, rgba(251,146,60,0.15), rgba(239,68,68,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <UtensilsCrossed size={36} color="rgba(251,146,60,0.4)" />
                  )}
                </div>

                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h3 style={{ color: 'white', fontWeight: 700, fontSize: '15px', flex: 1 }}>{item.name}</h3>
                    <span style={{ color: '#fb923c', fontWeight: 800, fontSize: '16px', marginLeft: '8px' }}>Rs. {item.price}</span>
                  </div>
                  {item.description && (
                    <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '12px', lineHeight: 1.5, marginBottom: '10px' }}>{item.description}</p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(251,146,60,0.1)', color: '#fb923c' }}>{item.category}</span>
                    <span style={{ fontSize: '11px', color: '#4ade80' }}>● Available</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <UtensilsCrossed size={44} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 14px' }} />
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '15px' }}>No items found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}