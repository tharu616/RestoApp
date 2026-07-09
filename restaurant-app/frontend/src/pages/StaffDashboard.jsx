import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShoppingBag, CalendarDays, UtensilsCrossed, LogOut, ChefHat, CheckCircle } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import api from '../api/axios';

export default function StaffDashboard() {
  const [activeTab,    setActiveTab]    = useState('orders');
  const [orders,       setOrders]       = useState([]);
  const [reservations, setReservations] = useState([]);
  const [menu,         setMenu]         = useState([]);
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Staff';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, resRes, menuRes] = await Promise.all([
        api.get('/orders'),
        api.get('/reservations'),
        api.get('/menu'),
      ]);
      setOrders(ordersRes.data);
      setReservations(resRes.data);
      setMenu(menuRes.data);
    } catch { toast.error('Failed to load'); }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      toast.success(`Order → ${status}`);
      fetchData();
    } catch { toast.error('Failed to update'); }
  };

  const tabs = [
    { key: 'orders',       label: 'Active Orders',   icon: ShoppingBag },
    { key: 'reservations', label: "Today's Bookings", icon: CalendarDays },
    { key: 'menu',         label: 'Menu Reference',  icon: UtensilsCrossed },
  ];

  const statusFlow = {
    Pending: 'PREPARING', PENDING: 'PREPARING',
    PREPARING: 'READY', READY: 'SERVED', SERVED: 'COMPLETED'
  };

  const activeOrders = orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status));

  const statusStyle = (status) => ({
    PREPARING: { bg: 'rgba(251,146,60,0.2)',  color: '#fb923c' },
    READY:     { bg: 'rgba(34,197,94,0.2)',   color: '#4ade80' },
    PENDING:   { bg: 'rgba(59,130,246,0.2)',  color: '#60a5fa' },
    Pending:   { bg: 'rgba(59,130,246,0.2)',  color: '#60a5fa' },
    SERVED:    { bg: 'rgba(168,85,247,0.2)',  color: '#a78bfa' },
  }[status] || { bg: 'rgba(59,130,246,0.2)', color: '#60a5fa' });

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <AnimatedBackground />
      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* Header */}
        <div className="glass" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '14px 28px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg,#fb923c,#f43f5e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChefHat size={18} color="white" />
              </div>
              <div>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '16px', lineHeight: 1 }}>RestoPro</p>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '11px' }}>Welcome, {userName}</p>
              </div>
            </div>
            <motion.button onClick={() => { localStorage.clear(); navigate('/'); }} whileTap={{ scale: 0.95 }}
              className="glass"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', color: 'rgba(255,255,255,0.55)', fontSize: '13px', cursor: 'pointer', border: 'none' }}>
              <LogOut size={14} /> Logout
            </motion.button>
          </div>
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 28px' }}>

          {/* Active Orders Banner */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{ borderRadius: '16px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(251,146,60,0.08)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(251,146,60,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={20} color="#fb923c" />
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '22px', lineHeight: 1 }}>{activeOrders.length}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Active orders need attention</p>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="glass" style={{ display: 'inline-flex', gap: '4px', padding: '4px', borderRadius: '14px', marginBottom: '24px' }}>
            {tabs.map(({ key, label, icon: Icon }) => (
              <motion.button key={key} onClick={() => setActiveTab(key)} whileTap={{ scale: 0.95 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 500,
                  cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                  background: activeTab === key ? 'linear-gradient(135deg,#fb923c,#f43f5e)' : 'transparent',
                  color:      activeTab === key ? 'white' : 'rgba(255,255,255,0.4)',
                  boxShadow:  activeTab === key ? '0 4px 14px rgba(251,146,60,0.3)' : 'none',
                }}>
                <Icon size={15} /> {label}
              </motion.button>
            ))}
          </div>

          {/* Active Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
              {activeOrders.length === 0 && (
                <div className="glass-card" style={{ borderRadius: '16px', padding: '48px', textAlign: 'center', gridColumn: '1 / -1' }}>
                  <CheckCircle size={38} color="rgba(34,197,94,0.4)" style={{ margin: '0 auto 12px' }} />
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>All orders completed!</p>
                </div>
              )}
              {activeOrders.map((order, i) => {
                const sc = statusStyle(order.status);
                return (
                  <motion.div key={order.id} className="glass-card"
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }} whileHover={{ y: -4 }}
                    style={{ borderRadius: '18px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <p style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>Order #{order.id}</p>
                        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '12px', marginTop: '2px' }}>Table {order.table_id || '—'}</p>
                      </div>
                      <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: sc.bg, color: sc.color, fontWeight: 500 }}>
                        {order.status || 'Pending'}
                      </span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '14px' }}>
                      {order.customer_name || `Customer #${order.customer_id}`} · Rs. {order.total_price || 0}
                    </p>
                    {statusFlow[order.status] && (
                      <motion.button whileTap={{ scale: 0.96 }}
                        onClick={() => updateOrderStatus(order.id, statusFlow[order.status])}
                        style={{ width: '100%', padding: '10px', borderRadius: '12px', color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg,#fb923c,#f43f5e)', boxShadow: '0 4px 12px rgba(251,146,60,0.25)' }}>
                        Mark as {statusFlow[order.status]}
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Reservations Tab */}
          {activeTab === 'reservations' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reservations.length === 0 && (
                <div className="glass-card" style={{ borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
                  <CalendarDays size={38} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 12px' }} />
                  <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '14px' }}>No reservations today</p>
                </div>
              )}
              {reservations.map((res, i) => (
                <motion.div key={res.id} className="glass-card"
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CalendarDays size={18} color="#a78bfa" />
                    </div>
                    <div>
                      <p style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{res.customer_name || `Booking #${res.id}`}</p>
                      <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '12px', marginTop: '2px' }}>
                        {res.guests} guests · Table {res.table_id || res.table_number || '—'} · {res.time_slot || '—'}
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '20px', background: res.status === 'CONFIRMED' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: res.status === 'CONFIRMED' ? '#4ade80' : '#f87171', fontWeight: 500 }}>
                    {res.status}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Menu Reference Tab */}
          {activeTab === 'menu' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '14px' }}>
              {menu.filter(item => item.is_available).map((item, i) => (
                <motion.div key={item.id} className="glass-card"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ borderRadius: '16px', padding: '16px' }}>
                  <p style={{ color: 'white', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{item.name}</p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', marginBottom: '10px' }}>{item.category}</p>
                  <p style={{ color: '#fb923c', fontWeight: 700, fontSize: '15px' }}>Rs. {item.price}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}