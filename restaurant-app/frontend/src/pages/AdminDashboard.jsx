import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ShoppingBag, CalendarDays, Users, LogOut, ChefHat, TrendingUp, Clock } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
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
    } catch (err) {
      toast.error('Failed to load data');
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  const statCards = [
    { label: 'Menu Items', value: stats.menu, icon: UtensilsCrossed, color: 'from-orange-500/20 to-red-500/20', glow: 'glow-orange', iconColor: 'text-orange-400' },
    { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: 'from-blue-500/20 to-cyan-500/20', glow: 'glow-blue', iconColor: 'text-blue-400' },
    { label: 'Reservations', value: stats.reservations, icon: CalendarDays, color: 'from-purple-500/20 to-pink-500/20', glow: 'glow-purple', iconColor: 'text-purple-400' },
    { label: 'Customers', value: stats.customers, icon: Users, color: 'from-green-500/20 to-emerald-500/20', glow: 'glow-green', iconColor: 'text-green-400' },
  ];

  const tabs = ['overview', 'menu', 'orders', 'reservations', 'staff'];

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <div className="relative z-10">

        {/* Header */}
        <div ref={headerRef} className="glass border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl liquid-btn flex items-center justify-center">
                <ChefHat size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">RestoPro</h1>
                <p className="text-white/40 text-xs">Admin Dashboard</p>
              </div>
            </div>
            <motion.button onClick={logout} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 glass px-4 py-2 rounded-xl text-white/60 hover:text-white text-sm transition-colors">
              <LogOut size={16} /> Logout
            </motion.button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card, i) => (
              <motion.div key={card.label}
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`glass-card rounded-2xl p-5 bg-gradient-to-br ${card.color} ${card.glow} cursor-pointer`}
                whileHover={{ scale: 1.03, y: -4 }}>
                <div className="flex items-center justify-between mb-3">
                  <card.icon size={22} className={card.iconColor} />
                  <TrendingUp size={14} className="text-white/20" />
                </div>
                <p className="text-3xl font-bold text-white">{card.value}</p>
                <p className="text-white/50 text-xs mt-1">{card.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="glass rounded-2xl p-1 flex gap-1 mb-6 w-fit">
            {tabs.map(tab => (
              <motion.button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                  activeTab === tab ? 'liquid-btn text-white' : 'text-white/40 hover:text-white/70'
                }`}
                whileTap={{ scale: 0.95 }}>
                {tab}
              </motion.button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-2 gap-6">

              {/* Recent Orders */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <ShoppingBag size={18} className="text-blue-400" /> Recent Orders
                </h3>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order, i) => (
                    <motion.div key={order.id} initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className="glass rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium">{order.customer_name || 'Customer'}</p>
                        <p className="text-white/40 text-xs flex items-center gap-1">
                          <Clock size={10} /> Order #{order.id}
                        </p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'PREPARING' ? 'bg-orange-500/20 text-orange-400' :
                        order.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>{order.status || 'Pending'}</span>
                    </motion.div>
                  ))}
                  {orders.length === 0 && <p className="text-white/30 text-sm text-center py-4">No orders yet</p>}
                </div>
              </div>

              {/* Menu Items */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <UtensilsCrossed size={18} className="text-orange-400" /> Menu Items
                </h3>
                <div className="space-y-3">
                  {menuItems.slice(0, 5).map((item, i) => (
                    <motion.div key={item.id} initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className="glass rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium">{item.name}</p>
                        <p className="text-white/40 text-xs">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-orange-400 text-sm font-semibold">Rs. {item.price}</p>
                        <span className={`text-xs ${item.is_available ? 'text-green-400' : 'text-red-400'}`}>
                          {item.is_available ? '● Available' : '● Unavailable'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  {menuItems.length === 0 && <p className="text-white/30 text-sm text-center py-4">No menu items yet</p>}
                </div>
              </div>
            </motion.div>
          )}

          {/* Menu Tab */}
          {activeTab === 'menu' && <MenuManager token={token} />}

        </div>
      </div>
    </div>
  );
}

// Menu Manager Component
function MenuManager({ token }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', is_available: true });
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchMenu(); }, []);

  const fetchMenu = async () => {
    const res = await axios.get('http://localhost:5000/api/menu');
    setItems(res.data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/menu', form, { headers });
      toast.success('Menu item added!');
      fetchMenu();
      setForm({ name: '', description: '', price: '', category: '', is_available: true });
    } catch { toast.error('Failed to add item'); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/menu/${id}`, { headers });
      toast.success('Item deleted');
      fetchMenu();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-3 gap-6">
      {/* Add Form */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Add Menu Item</h3>
        <form onSubmit={handleAdd} className="space-y-3">
          {['name', 'description', 'price', 'category'].map(field => (
            <input key={field} placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="input-glass w-full px-4 py-3 rounded-xl text-sm" required={field !== 'description'} />
          ))}
          <label className="flex items-center gap-2 text-white/60 text-sm">
            <input type="checkbox" checked={form.is_available}
              onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
              className="w-4 h-4 accent-orange-500" />
            Available
          </label>
          <motion.button type="submit" whileTap={{ scale: 0.97 }}
            className="liquid-btn w-full py-3 rounded-xl text-white font-medium text-sm">
            Add Item
          </motion.button>
        </form>
      </div>

      {/* Items Grid */}
      <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4 content-start">
        {items.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            className="glass-card rounded-2xl p-4" whileHover={{ y: -4 }}>
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-white font-medium text-sm">{item.name}</h4>
              <motion.button onClick={() => handleDelete(item.id)} whileTap={{ scale: 0.9 }}
                className="text-red-400/60 hover:text-red-400 text-xs transition-colors">✕</motion.button>
            </div>
            <p className="text-white/40 text-xs mb-2">{item.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-orange-400 font-semibold text-sm">Rs. {item.price}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${item.is_available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {item.is_available ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <p className="text-white/30 text-xs mt-1">{item.category}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}