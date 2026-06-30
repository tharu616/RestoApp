import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UtensilsCrossed, ShoppingBag, CalendarDays, LogOut, ChefHat, Search } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';

const API = 'http://localhost:5000/api';

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState('menu');
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [menuRes, ordersRes, resRes] = await Promise.all([
        axios.get(`${API}/menu`),
        axios.get(`${API}/orders`, { headers }),
        axios.get(`${API}/reservations`, { headers }),
      ]);
      setMenuItems(menuRes.data);
      setOrders(ordersRes.data);
      setReservations(resRes.data);
    } catch { toast.error('Failed to load data'); }
  };

  const tabs = [
    { key: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { key: 'orders', label: 'My Orders', icon: ShoppingBag },
    { key: 'reservations', label: 'Reservations', icon: CalendarDays },
  ];

  const filteredMenu = menuItems.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <AnimatedBackground />
      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* Header */}
        <div className="glass" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '14px 24px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="liquid-btn" style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChefHat size={18} color="white" />
              </div>
              <div>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '16px', lineHeight: 1 }}>RestoPro</p>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '11px' }}>Customer Portal</p>
              </div>
            </div>
            <motion.button onClick={() => { localStorage.clear(); navigate('/'); }}
              whileTap={{ scale: 0.95 }} className="glass"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', color: 'rgba(255,255,255,0.55)', fontSize: '13px', cursor: 'pointer', border: 'none' }}>
              <LogOut size={14} /> Logout
            </motion.button>
          </div>
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 24px' }}>

          {/* Tabs */}
          <div className="glass" style={{ display: 'inline-flex', gap: '4px', padding: '4px', borderRadius: '14px', marginBottom: '24px' }}>
            {tabs.map(({ key, label, icon: Icon }) => (
              <motion.button key={key} onClick={() => setActiveTab(key)} whileTap={{ scale: 0.95 }}
                className={activeTab === key ? 'liquid-btn' : ''}
                style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, color: activeTab === key ? 'white' : 'rgba(255,255,255,0.4)', cursor: 'pointer', border: 'none', background: activeTab === key ? undefined : 'transparent', transition: 'all 0.2s' }}>
                <Icon size={15} />
                {label}
              </motion.button>
            ))}
          </div>

          {/* Menu Tab */}
          {activeTab === 'menu' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              {/* Search */}
              <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '340px' }}>
                <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
                <input placeholder="Search menu..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="input-glass" style={{ padding: '11px 14px 11px 38px', borderRadius: '12px', fontSize: '13px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {filteredMenu.map((item, i) => (
                  <motion.div key={item.id} className="glass-card"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }} whileHover={{ y: -5, scale: 1.02 }}
                    style={{ borderRadius: '18px', padding: '20px', cursor: 'pointer' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                      <UtensilsCrossed size={20} color="#fb923c" />
                    </div>
                    <h3 style={{ color: 'white', fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{item.name}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '12px', marginBottom: '12px', lineHeight: 1.4 }}>{item.description || item.category}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: '#fb923c', fontWeight: 700, fontSize: '16px' }}>Rs. {item.price}</span>
                      <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: item.is_available ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: item.is_available ? '#4ade80' : '#f87171' }}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {orders.length === 0 && (
                  <div className="glass-card" style={{ borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
                    <ShoppingBag size={36} color="rgba(255,255,255,0.15)" style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>No orders yet</p>
                  </div>
                )}
                {orders.map((order, i) => (
                  <motion.div key={order.id} className="glass-card"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    style={{ borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>Order #{order.id}</p>
                      <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '12px', marginTop: '3px' }}>
                        Table {order.table_id || '—'} · Rs. {order.total_price || order.subtotal || 0}
                      </p>
                    </div>
                    <span style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '20px',
                      background: order.status === 'COMPLETED' ? 'rgba(34,197,94,0.15)' : order.status === 'PREPARING' ? 'rgba(251,146,60,0.15)' : order.status === 'CANCELLED' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)',
                      color: order.status === 'COMPLETED' ? '#4ade80' : order.status === 'PREPARING' ? '#fb923c' : order.status === 'CANCELLED' ? '#f87171' : '#60a5fa' }}>
                      {order.status || 'Pending'}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Reservations Tab */}
          {activeTab === 'reservations' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <ReservationForm token={token} onSuccess={fetchData} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                {reservations.map((res, i) => (
                  <motion.div key={res.id} className="glass-card"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    style={{ borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>Booking #{res.id}</p>
                      <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '12px', marginTop: '3px' }}>
                        {res.guests} guests · {res.time_slot || new Date(res.date_time).toLocaleDateString()}
                      </p>
                    </div>
                    <span style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '20px',
                      background: res.status === 'CONFIRMED' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                      color: res.status === 'CONFIRMED' ? '#4ade80' : '#f87171' }}>
                      {res.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReservationForm({ token, onSuccess }) {
  const [form, setForm] = useState({ table_id: '', date_time: '', time_slot: '', guests: '', notes: '' });
  const headers = { Authorization: `Bearer ${token}` };
  const userId = JSON.parse(atob(token.split('.')[1])).id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/reservations', { ...form, customer_id: userId }, { headers });
      toast.success('Reservation booked!');
      setForm({ table_id: '', date_time: '', time_slot: '', guests: '', notes: '' });
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <div className="glass-card" style={{ borderRadius: '18px', padding: '22px' }}>
      <h3 style={{ color: 'white', fontWeight: 600, fontSize: '15px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <CalendarDays size={17} color="#a78bfa" /> Book a Table
      </h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {[
          { key: 'table_id', placeholder: 'Table ID', type: 'number' },
          { key: 'guests', placeholder: 'Number of Guests', type: 'number' },
          { key: 'date_time', placeholder: 'Date & Time', type: 'datetime-local' },
          { key: 'time_slot', placeholder: 'Time Slot (e.g. 7PM-9PM)', type: 'text' },
        ].map(({ key, placeholder, type }) => (
          <input key={key} type={type} placeholder={placeholder}
            value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            required={key !== 'notes'}
            className="input-glass" style={{ padding: '11px 14px', borderRadius: '12px', fontSize: '13px' }} />
        ))}
        <input placeholder="Notes (optional)" value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="input-glass" style={{ padding: '11px 14px', borderRadius: '12px', fontSize: '13px', gridColumn: '1 / -1' }} />
        <motion.button type="submit" whileTap={{ scale: 0.97 }} className="liquid-btn"
          style={{ gridColumn: '1 / -1', padding: '12px', borderRadius: '12px', color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer', border: 'none' }}>
          Book Now
        </motion.button>
      </form>
    </div>
  );
}