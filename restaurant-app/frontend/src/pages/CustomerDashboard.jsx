import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UtensilsCrossed, ShoppingBag, CalendarDays, LogOut, ChefHat, Search, Plus, Minus, Trash2, Truck, CreditCard, Banknote, Package, MapPin, BadgePercent, TicketPercent } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import api from '../api/axios';

const DELIVERY_FEE = 200;
const normalize = (v) => String(v || '').toLowerCase();
const orderPaymentLabel = (order) => {
  const pm = normalize(order.payment_method || order.paymentMethod);
  const dm = normalize(order.delivery_method || order.deliveryMethod);
  if (pm === 'cash') return dm === 'delivery' ? 'Cash on Delivery' : 'Cash';
  if (pm === 'card') return 'Card';
  return order.payment_method || order.paymentMethod || '—';
};

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState('menu');
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [resForm, setResForm] = useState({ table_id: '', date_time: '', time_slot: '', guests: '', notes: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem('userName') || 'Guest';

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get('payment');
    const orderId = params.get('order');

    if (paymentStatus === 'success' && orderId) {
      confirmStripePayment(orderId);
    } else if (paymentStatus === 'cancel') {
      toast.error('Payment cancelled');
      window.history.replaceState({}, '', '/customer');
    }
  }, [location.search]);

  const confirmStripePayment = async (orderId) => {
    try {
      await api.post('/payments/stripe/confirm', { orderId });
      toast.success('Payment confirmed! Order placed.');
      setActiveTab('orders');
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment confirmation failed');
    } finally {
      window.history.replaceState({}, '', '/customer');
    }
  };

  const fetchData = async () => {
    try {
      const [menuRes, ordersRes, resRes] = await Promise.all([
        api.get('/menu'),
        api.get('/orders'),
        api.get('/reservations'),
      ]);
      setMenuItems(menuRes.data || []);
      setOrders(ordersRes.data || []);
      setReservations(resRes.data || []);
    } catch {
      toast.error('Failed to load data');
    }
  };

  const handleReservation = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reservations', resForm);
      toast.success('Table booked successfully!');
      setResForm({ table_id: '', date_time: '', time_slot: '', guests: '', notes: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    }
  };

  const addToCart = (item) => {
    const available = item.is_available === undefined ? true : !!item.is_available;
    if (!available) return toast.error('This item is unavailable');
    const product = { id: item.id, name: item.name, price: Number(item.price) || 0, category: item.category || 'Food' };
    setCart((prev) => {
      const found = prev.find((x) => x.id === product.id);
      if (found) return prev.map((x) => x.id === product.id ? { ...x, qty: x.qty + 1 } : x);
      return [...prev, { ...product, qty: 1 }];
    });
    toast.success(`${item.name} added to cart`);
    setActiveTab('cart');
  };

  const updateQty = (id, delta) => setCart((prev) => prev.map((x) => x.id === id ? { ...x, qty: x.qty + delta } : x).filter((x) => x.qty > 0));
  const removeItem = (id) => setCart((prev) => prev.filter((x) => x.id !== id));
  const clearCart = () => setCart([]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.qty, 0), [cart]);
  const deliveryFee = deliveryMethod === 'delivery' ? DELIVERY_FEE : 0;
  const tax = Math.round(subtotal * 0.05);
  const discount = subtotal >= 4000 ? Math.round(subtotal * 0.1) : 0;
  const total = Math.max(0, subtotal + deliveryFee + tax - discount);

  const paymentOptions = deliveryMethod === 'delivery'
    ? [
        { key: 'card', label: 'Card', icon: CreditCard },
        { key: 'cash', label: 'Cash on Delivery', icon: Banknote },
      ]
    : [
        { key: 'card', label: 'Card', icon: CreditCard },
        { key: 'cash', label: 'Cash', icon: Banknote },
      ];

  const buildOrderPayload = (paymentType) => ({
    customer_id: Number(localStorage.getItem('userId')) || undefined,
    items: cart.map((item) => ({
      menu_item_id: item.id,
      quantity: item.qty,
    })),
    deliveryMethod,
    address,
    phone,
    paymentMethod: paymentType,
    total_price: total,
  });

  const placeOrder = async () => {
    if (!cart.length) return toast.error('Add food to cart first');
    if (deliveryMethod === 'delivery' && !address.trim()) return toast.error('Please enter delivery address');
    if (deliveryMethod === 'delivery' && !phone.trim()) return toast.error('Please enter phone number');
    setLoading(true);
    try {
      const orderRes = await api.post('/orders', buildOrderPayload(paymentMethod));
      const order = orderRes.data;

      if (paymentMethod === 'cash') {
        toast.success('Order placed successfully');
        clearCart();
        setActiveTab('orders');
        await fetchData();
        return;
      }

      const res = await api.post('/payments/stripe/create-checkout-session', {
        items: cart,
        deliveryMethod,
        orderId: order.id,
      });

      if (res.data?.url) {
        clearCart();
        window.location.href = res.data.url;
      } else {
        toast.error('Stripe checkout unavailable');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { key: 'cart', label: `Cart (${cart.length})`, icon: ShoppingBag },
    { key: 'orders', label: 'My Orders', icon: CalendarDays },
    { key: 'reservations', label: 'Reservations', icon: CalendarDays },
  ];

  const filteredMenu = menuItems.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(search.toLowerCase()) || item.category?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || normalize(item.category) === category;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(menuItems.map((m) => normalize(m.category)).filter(Boolean))];

  const orderStatusStyle = (status) => {
    const key = normalize(status);
    const map = {
      completed: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
      preparing: { bg: 'rgba(251,146,60,0.15)', color: '#fb923c' },
      cancelled: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
      pending: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
      ready: { bg: 'rgba(168,85,247,0.15)', color: '#a78bfa' },
      served: { bg: 'rgba(14,165,233,0.15)', color: '#38bdf8' },
    };
    return map[key] || map.pending;
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <AnimatedBackground />
      <div style={{ position: 'relative', zIndex: 10 }}>
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
            <motion.button
              onClick={() => { localStorage.clear(); navigate('/'); }}
              whileTap={{ scale: 0.95 }}
              className="glass"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', color: 'rgba(255,255,255,0.55)', fontSize: '13px', cursor: 'pointer', border: 'none' }}
            >
              <LogOut size={14} /> Logout
            </motion.button>
          </div>
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginBottom: 18 }}>
            {[
              { label: 'Cart Items', value: cart.length, icon: ShoppingBag },
              { label: 'Subtotal', value: `Rs. ${subtotal.toFixed(2)}`, icon: BadgePercent },
              { label: 'Total', value: `Rs. ${total.toFixed(2)}`, icon: TicketPercent },
            ].map((s) => (
              <div key={s.label} className="glass-card" style={{ padding: '14px 16px', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11 }}>{s.label}</p>
                  <p style={{ color: 'white', fontWeight: 700, marginTop: 4 }}>{s.value}</p>
                </div>
                <s.icon size={18} color="#fb923c" />
              </div>
            ))}
          </div>

          <div className="glass" style={{ display: 'inline-flex', gap: '4px', padding: '4px', borderRadius: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {tabs.map(({ key, label, icon: Icon }) => (
              <motion.button key={key} onClick={() => setActiveTab(key)} whileTap={{ scale: 0.95 }} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: 'none', background: activeTab === key ? 'linear-gradient(135deg,#fb923c,#f43f5e)' : 'transparent', color: activeTab === key ? 'white' : 'rgba(255,255,255,0.4)', boxShadow: activeTab === key ? '0 4px 14px rgba(251,146,60,0.3)' : 'none' }}>
                <Icon size={15} /> {label}
              </motion.button>
            ))}
          </div>

          {activeTab === 'menu' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
                {categories.map((c) => (
                  <button key={c} onClick={() => setCategory(c)} className="glass" style={{ padding: '8px 14px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.08)', background: category === c ? 'linear-gradient(135deg,#fb923c,#f43f5e)' : 'rgba(255,255,255,0.04)', color: 'white', cursor: 'pointer' }}>
                    {c === 'all' ? 'All' : c}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '340px' }}>
                <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
                <input placeholder="Search menu..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-glass" style={{ padding: '11px 14px 11px 38px', borderRadius: '12px', fontSize: '13px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '16px' }}>
                {filteredMenu.map((item, i) => {
                  const available = item.is_available === undefined ? true : !!item.is_available;
                  return (
                    <motion.div key={item.id} className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -5, scale: 1.02 }} style={{ borderRadius: '18px', padding: '20px', opacity: available ? 1 : 0.7, position: 'relative' }}>
                      <div style={{ position: 'absolute', right: 14, top: 14, display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(251,146,60,0.14)', color: '#fb923c' }}>{item.category || 'Food'}</span>
                        <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: available ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: available ? '#4ade80' : '#f87171' }}>{available ? 'Available' : 'Unavailable'}</span>
                      </div>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                        <UtensilsCrossed size={20} color="#fb923c" />
                      </div>
                      <h3 style={{ color: 'white', fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{item.name}</h3>
                      <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '12px', marginBottom: '12px', lineHeight: 1.4 }}>{item.description || 'Freshly prepared item'}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        <span style={{ color: '#fb923c', fontWeight: 700, fontSize: '16px' }}>Rs. {Number(item.price).toFixed(2)}</span>
                        <button disabled={!available} onClick={() => addToCart(item)} style={{ padding: '8px 12px', borderRadius: '10px', border: 'none', cursor: available ? 'pointer' : 'not-allowed', color: 'white', background: 'linear-gradient(135deg,#fb923c,#f43f5e)', opacity: available ? 1 : 0.5 }}>Add</button>
                      </div>
                    </motion.div>
                  );
                })}
                {filteredMenu.length === 0 && <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 0' }}><UtensilsCrossed size={40} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 12px' }} /><p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '14px' }}>No items found</p></div>}
              </div>
            </motion.div>
          )}

          {activeTab === 'cart' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="glass-card" style={{ borderRadius: '18px', padding: '22px', marginBottom: '18px' }}>
                <h3 style={{ color: 'white', fontWeight: 600, fontSize: '15px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><ShoppingBag size={17} color="#fb923c" /> Your Cart</h3>
                {cart.length === 0 ? <p style={{ color: 'rgba(255,255,255,0.35)' }}>No items in cart yet.</p> : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{cart.map((item) => <div key={item.id} className="glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '14px' }}><div><p style={{ color: 'white', fontWeight: 600 }}>{item.name}</p><p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12 }}>Rs. {item.price} x {item.qty}</p></div><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><button onClick={() => updateQty(item.id, -1)} style={{ width: 32, height: 32, borderRadius: 10, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: 'white' }}><Minus size={14} /></button><span style={{ color: 'white', minWidth: 18, textAlign: 'center' }}>{item.qty}</span><button onClick={() => updateQty(item.id, 1)} style={{ width: 32, height: 32, borderRadius: 10, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: 'white' }}><Plus size={14} /></button><button onClick={() => removeItem(item.id)} style={{ width: 32, height: 32, borderRadius: 10, border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.14)', color: '#f87171' }}><Trash2 size={14} /></button></div></div>)}</div>}</div>

              <div className="glass-card" style={{ borderRadius: '18px', padding: '22px' }}>
                <h3 style={{ color: 'white', fontWeight: 600, fontSize: '15px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><Truck size={17} color="#a78bfa" /> Delivery & Payment</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <button type="button" onClick={() => setDeliveryMethod('delivery')} style={{ padding: '12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: deliveryMethod === 'delivery' ? 'linear-gradient(135deg,#fb923c,#f43f5e)' : 'rgba(255,255,255,0.04)', color: 'white' }}><Truck size={16} style={{ display: 'inline', marginRight: 6 }} /> Delivery</button>
                  <button type="button" onClick={() => setDeliveryMethod('pickup')} style={{ padding: '12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: deliveryMethod === 'pickup' ? 'linear-gradient(135deg,#fb923c,#f43f5e)' : 'rgba(255,255,255,0.04)', color: 'white' }}><Package size={16} style={{ display: 'inline', marginRight: 6 }} /> Pickup</button>
                </div>
                {deliveryMethod === 'delivery' && <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}><div style={{ position: 'relative' }}><MapPin size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} /><input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Delivery address" className="input-glass" style={{ padding: '11px 14px 11px 38px', borderRadius: 12, fontSize: 13 }} /></div><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="input-glass" style={{ padding: '11px 14px', borderRadius: 12, fontSize: 13 }} /></div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  {paymentOptions.map(({ key, label, icon: Icon }) => <button key={key} type="button" onClick={() => setPaymentMethod(key)} style={{ padding: '12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: paymentMethod === key ? 'linear-gradient(135deg,#fb923c,#f43f5e)' : 'rgba(255,255,255,0.04)', color: 'white' }}><Icon size={16} style={{ display: 'inline', marginRight: 6 }} /> {label}</button>)}
                </div>
                <div className="glass" style={{ padding: 16, borderRadius: 14, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'rgba(255,255,255,0.7)' }}><span>Subtotal</span><span>Rs. {subtotal.toFixed(2)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'rgba(255,255,255,0.7)' }}><span>Delivery</span><span>Rs. {deliveryFee.toFixed(2)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'rgba(255,255,255,0.7)' }}><span>Tax</span><span>Rs. {tax.toFixed(2)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'rgba(255,255,255,0.7)' }}><span>Discount</span><span>- Rs. {discount.toFixed(2)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white', fontWeight: 700 }}><span>Total</span><span>Rs. {total.toFixed(2)}</span></div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <motion.button disabled={loading || !cart.length} onClick={placeOrder} whileTap={{ scale: 0.97 }} style={{ padding: '12px 24px', borderRadius: '12px', color: 'white', fontWeight: 600, fontSize: '13px', cursor: loading || !cart.length ? 'not-allowed' : 'pointer', border: 'none', background: 'linear-gradient(135deg,#fb923c,#f43f5e)', boxShadow: '0 4px 14px rgba(251,146,60,0.3)', opacity: loading || !cart.length ? 0.7 : 1 }}>{loading ? 'Processing...' : paymentMethod === 'card' ? 'Pay with Stripe' : 'Place COD Order'}</motion.button>
                  <button onClick={clearCart} style={{ padding: '12px 24px', borderRadius: '12px', color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer', border: 'none', background: 'rgba(255,255,255,0.08)' }}>Clear Cart</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {orders.length === 0 && <div className="glass-card" style={{ borderRadius: '16px', padding: '48px', textAlign: 'center' }}><ShoppingBag size={38} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 12px' }} /><p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '14px' }}>No orders yet</p></div>}
                {orders.map((order, i) => {
                  const sc = orderStatusStyle(order.status);
                  return (
                    <motion.div key={order.id} className="glass-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} style={{ borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ShoppingBag size={18} color={sc.color} />
                        </div>
                        <div>
                          <p style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>Order #{order.id}</p>
                          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '12px', marginTop: '3px' }}>
                            {order.customer_name || userName} · {order.delivery_method || order.deliveryMethod || 'delivery'} · {orderPaymentLabel(order)} · Rs. {order.total_price || order.total || 0}
                          </p>
                        </div>
                      </div>
                      <span style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '20px', background: sc.bg, color: sc.color, fontWeight: 500 }}>{order.status || 'Pending'}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'reservations' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="glass-card" style={{ borderRadius: '18px', padding: '22px', marginBottom: '20px' }}>
                <h3 style={{ color: 'white', fontWeight: 600, fontSize: '15px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><CalendarDays size={17} color="#a78bfa" /> Book a Table</h3>
                <form onSubmit={handleReservation}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    {[
                      { key: 'table_id', placeholder: 'Table ID', type: 'number', required: true },
                      { key: 'guests', placeholder: 'Number of Guests', type: 'number', required: true },
                      { key: 'date_time', placeholder: 'Date & Time', type: 'datetime-local', required: false },
                      { key: 'time_slot', placeholder: 'Time Slot (e.g. 7PM-9PM)', type: 'text', required: false },
                    ].map(({ key, placeholder, type, required }) => (
                      <input key={key} type={type} placeholder={placeholder} value={resForm[key]} onChange={(e) => setResForm({ ...resForm, [key]: e.target.value })} required={required} className="input-glass" style={{ padding: '11px 14px', borderRadius: '12px', fontSize: '13px' }} />
                    ))}
                    <input placeholder="Notes (optional)" value={resForm.notes} onChange={(e) => setResForm({ ...resForm, notes: e.target.value })} className="input-glass" style={{ padding: '11px 14px', borderRadius: '12px', fontSize: '13px', gridColumn: '1 / -1' }} />
                  </div>
                  <motion.button type="submit" whileTap={{ scale: 0.97 }} style={{ padding: '12px 28px', borderRadius: '12px', color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg,#fb923c,#f43f5e)', boxShadow: '0 4px 14px rgba(251,146,60,0.3)' }}>Book Now</motion.button>
                </form>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reservations.map((res, i) => (
                  <motion.div key={res.id} className="glass-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} style={{ borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CalendarDays size={18} color="#a78bfa" />
                      </div>
                      <div>
                        <p style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>Booking #{res.id}</p>
                        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '12px', marginTop: '3px' }}>
                          {res.customer_name || userName} · {res.guests} guests · Table {res.table_id || '—'} · {res.time_slot || '—'}
                        </p>
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '20px', background: res.status === 'CONFIRMED' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: res.status === 'CONFIRMED' ? '#4ade80' : '#f87171', fontWeight: 500 }}>{res.status}</span>
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