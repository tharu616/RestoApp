import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed, ShoppingBag, CalendarDays, Users,
  LogOut, ChefHat, TrendingUp, Clock
} from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import OrdersManager from '../components/OrdersManager';
import ReservationsManager from '../components/ReservationsManager';
import StaffManager from '../components/StaffManager';
import CustomersManager from '../components/CustomersManager';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ menu: 0, orders: 0, reservations: 0, customers: 0 });
  const [activeTab, setActiveTab] = useState('overview');
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const headerRef = useRef(null);

  const token = localStorage.getItem('accessToken');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    gsap.fromTo(headerRef.current,
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    );
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [menuRes, ordersRes, reservRes, custRes] = await Promise.all([
        axios.get(`${API}/menu`),
        axios.get(`${API}/orders`, { headers }),
        axios.get(`${API}/reservations`, { headers }),
        axios.get(`${API}/customers`, { headers }),
      ]);
      setMenuItems(menuRes.data);
      setOrders(ordersRes.data);
      setStats({
        menu: menuRes.data.length,
        orders: ordersRes.data.length,
        reservations: reservRes.data.length,
        customers: custRes.data.length,
      });
    } catch {
      toast.error('Failed to load data');
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  const statCards = [
    { label: 'Menu Items', value: stats.menu, icon: UtensilsCrossed, bg: 'rgba(251,146,60,0.12)', iconColor: '#fb923c' },
    { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, bg: 'rgba(59,130,246,0.12)', iconColor: '#60a5fa' },
    { label: 'Reservations', value: stats.reservations, icon: CalendarDays, bg: 'rgba(168,85,247,0.12)', iconColor: '#a78bfa' },
    { label: 'Customers', value: stats.customers, icon: Users, bg: 'rgba(34,197,94,0.12)', iconColor: '#4ade80' },
  ];

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'menu', label: 'Menu' },
    { key: 'orders', label: 'Orders' },
    { key: 'reservations', label: 'Reservations' },
    { key: 'staff', label: 'Staff' },
    { key: 'customers', label: 'Customers' },
  ];

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <AnimatedBackground />
      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* Header */}
        <div ref={headerRef} className="glass"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '14px 24px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="liquid-btn"
                style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChefHat size={20} color="white" />
              </div>
              <div>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '17px', lineHeight: 1 }}>RestoPro</p>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '11px' }}>Admin Dashboard</p>
              </div>
            </div>
            <motion.button onClick={logout} whileTap={{ scale: 0.95 }} className="glass"
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 16px', borderRadius: '11px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', cursor: 'pointer', border: 'none' }}>
              <LogOut size={15} /> Logout
            </motion.button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px' }}>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
            {statCards.map((card, i) => (
              <motion.div key={card.label}
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card"
                whileHover={{ y: -5, scale: 1.02 }}
                style={{ borderRadius: '18px', padding: '20px', background: card.bg, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: `${card.bg}`, border: `1px solid ${card.iconColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <card.icon size={20} color={card.iconColor} />
                  </div>
                  <TrendingUp size={14} color="rgba(255,255,255,0.15)" />
                </div>
                <p style={{ color: 'white', fontSize: '30px', fontWeight: 800, lineHeight: 1 }}>{card.value}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '5px' }}>{card.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="glass"
            style={{ display: 'inline-flex', gap: '4px', padding: '4px', borderRadius: '14px', marginBottom: '24px' }}>
            {tabs.map(({ key, label }) => (
              <motion.button key={key} onClick={() => setActiveTab(key)} whileTap={{ scale: 0.95 }}
                className={activeTab === key ? 'liquid-btn' : ''}
                style={{
                  padding: '9px 18px', borderRadius: '11px', fontSize: '13px', fontWeight: 500,
                  color: activeTab === key ? 'white' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer', border: 'none',
                  background: activeTab === key ? undefined : 'transparent',
                  transition: 'color 0.2s'
                }}>
                {label}
              </motion.button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

              {/* Recent Orders */}
              <div className="glass-card" style={{ borderRadius: '20px', padding: '22px' }}>
                <h3 style={{ color: 'white', fontWeight: 600, fontSize: '15px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBag size={17} color="#60a5fa" /> Recent Orders
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {orders.slice(0, 5).map((order, i) => (
                    <motion.div key={order.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }} className="glass"
                      style={{ borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>
                          {order.customer_name || `Customer #${order.customer_id || order.id}`}
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={10} /> Order #{order.id}
                        </p>
                      </div>
                      <span style={{
                        fontSize: '11px', padding: '4px 10px', borderRadius: '20px',
                        background: order.status === 'COMPLETED' ? 'rgba(34,197,94,0.15)' :
                          order.status === 'PREPARING' ? 'rgba(251,146,60,0.15)' :
                          order.status === 'CANCELLED' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)',
                        color: order.status === 'COMPLETED' ? '#4ade80' :
                          order.status === 'PREPARING' ? '#fb923c' :
                          order.status === 'CANCELLED' ? '#f87171' : '#60a5fa'
                      }}>
                        {order.status || 'Pending'}
                      </span>
                    </motion.div>
                  ))}
                  {orders.length === 0 && (
                    <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No orders yet</p>
                  )}
                </div>
              </div>

              {/* Menu Items Preview */}
              <div className="glass-card" style={{ borderRadius: '20px', padding: '22px' }}>
                <h3 style={{ color: 'white', fontWeight: 600, fontSize: '15px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UtensilsCrossed size={17} color="#fb923c" /> Menu Items
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {menuItems.slice(0, 5).map((item, i) => (
                    <motion.div key={item.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }} className="glass"
                      style={{ borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>{item.name}</p>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', marginTop: '2px' }}>{item.category}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color: '#fb923c', fontSize: '13px', fontWeight: 600 }}>Rs. {item.price}</p>
                        <span style={{ fontSize: '11px', color: item.is_available ? '#4ade80' : '#f87171' }}>
                          {item.is_available ? '● Available' : '● Unavailable'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  {menuItems.length === 0 && (
                    <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No menu items yet</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'menu' && <MenuManager token={token} />}
          {activeTab === 'orders' && <OrdersManager token={token} />}
          {activeTab === 'reservations' && <ReservationsManager token={token} />}
          {activeTab === 'staff' && <StaffManager token={token} />}
          {activeTab === 'customers' && <CustomersManager token={token} />}

        </div>
      </div>
    </div>
  );
}

// ── Menu Manager ──────────────────────────────────────────────
function MenuManager({ token }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', is_available: true });
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchMenu(); }, []);

  const fetchMenu = async () => {
    const res = await axios.get(`${API}/menu`);
    setItems(res.data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/menu`, form, { headers });
      toast.success('Menu item added!');
      fetchMenu();
      setForm({ name: '', description: '', price: '', category: '', is_available: true });
    } catch { toast.error('Failed to add item'); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/menu/${id}`, { headers });
      toast.success('Item deleted');
      fetchMenu();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>

      {/* Add Form */}
      <div className="glass-card" style={{ borderRadius: '20px', padding: '22px', alignSelf: 'start' }}>
        <h3 style={{ color: 'white', fontWeight: 600, fontSize: '15px', marginBottom: '16px' }}>Add Menu Item</h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { key: 'name', placeholder: 'Dish Name', required: true },
            { key: 'description', placeholder: 'Description', required: false },
            { key: 'price', placeholder: 'Price (Rs.)', required: true },
            { key: 'category', placeholder: 'Category', required: true },
          ].map(({ key, placeholder, required }) => (
            <input key={key} placeholder={placeholder} value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              required={required} className="input-glass"
              style={{ padding: '12px 14px', borderRadius: '12px', fontSize: '13px' }} />
          ))}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_available}
              onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
              style={{ width: '15px', height: '15px', accentColor: '#fb923c' }} />
            Available on menu
          </label>
          <motion.button type="submit" whileTap={{ scale: 0.97 }} className="liquid-btn"
            style={{ padding: '12px', borderRadius: '12px', color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer', border: 'none' }}>
            Add Item
          </motion.button>
        </form>
      </div>

      {/* Items Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px', alignContent: 'start' }}>
        {items.map((item, i) => (
          <motion.div key={item.id} className="glass-card"
            initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }} whileHover={{ y: -5 }}
            style={{ borderRadius: '18px', padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <h4 style={{ color: 'white', fontWeight: 600, fontSize: '14px', flex: 1, marginRight: '8px' }}>{item.name}</h4>
              <motion.button onClick={() => handleDelete(item.id)} whileTap={{ scale: 0.85 }}
                style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                ✕
              </motion.button>
            </div>
            {item.description && (
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', marginBottom: '12px', lineHeight: 1.4 }}>{item.description}</p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#fb923c', fontWeight: 700, fontSize: '15px' }}>Rs. {item.price}</span>
              <span style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '20px', background: item.is_available ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: item.is_available ? '#4ade80' : '#f87171' }}>
                {item.is_available ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px' }}>{item.category}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}