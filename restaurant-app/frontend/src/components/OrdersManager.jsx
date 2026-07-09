import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ShoppingBag, ChevronDown, X, Plus } from 'lucide-react';
import api from '../api/axios';

export default function OrdersManager() {
  const [orders,    setOrders]    = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [showForm,  setShowForm]  = useState(false);
  const [filter,    setFilter]    = useState('ALL');
  const [form,      setForm]      = useState({
    customer_id: '', table_id: '', waiter_id: '',
    items: [{ menu_item_id: '', quantity: 1 }]
  });

  useEffect(() => { fetchOrders(); fetchMenu(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch { toast.error('Failed to load orders'); }
  };

  const fetchMenu = async () => {
    try {
      const res = await api.get('/menu');
      setMenuItems(res.data);
    } catch {}
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/orders', form);
      toast.success('Order created!');
      setShowForm(false);
      setForm({ customer_id: '', table_id: '', waiter_id: '', items: [{ menu_item_id: '', quantity: 1 }] });
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      toast.success(`Status → ${status}`);
      fetchOrders();
    } catch { toast.error('Failed to update'); }
  };

  const cancelOrder = async (id) => {
    try {
      await api.delete(`/orders/${id}`);
      toast.success('Order cancelled');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel');
    }
  };

  const addItem    = () => setForm({ ...form, items: [...form.items, { menu_item_id: '', quantity: 1 }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i, key, val) => {
    const updated = [...form.items];
    updated[i][key] = val;
    setForm({ ...form, items: updated });
  };

  const statusColors = {
    PENDING:   { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa' },
    Pending:   { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa' },
    PREPARING: { bg: 'rgba(251,146,60,0.15)',  color: '#fb923c' },
    READY:     { bg: 'rgba(168,85,247,0.15)',  color: '#a78bfa' },
    SERVED:    { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80' },
    COMPLETED: { bg: 'rgba(34,197,94,0.1)',    color: '#4ade80' },
    CANCELLED: { bg: 'rgba(239,68,68,0.15)',   color: '#f87171' },
  };

  const statusFlow = {
    Pending: 'PREPARING', PENDING: 'PREPARING',
    PREPARING: 'READY', READY: 'SERVED', SERVED: 'COMPLETED'
  };

  const allStatuses = ['ALL','PENDING','PREPARING','READY','SERVED','COMPLETED','CANCELLED'];
  const filtered = filter === 'ALL'
    ? orders
    : orders.filter(o => o.status === filter || (filter === 'PENDING' && o.status === 'Pending'));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {allStatuses.map(s => (
            <motion.button key={s} onClick={() => setFilter(s)} whileTap={{ scale: 0.95 }}
              style={{
                padding: '7px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 500,
                cursor: 'pointer', border: 'none',
                background: filter === s ? 'linear-gradient(135deg,#fb923c,#f43f5e)' : 'rgba(255,255,255,0.06)',
                color:      filter === s ? 'white' : 'rgba(255,255,255,0.45)',
                boxShadow:  filter === s ? '0 4px 12px rgba(251,146,60,0.25)' : 'none',
              }}>
              {s}
            </motion.button>
          ))}
        </div>
        <motion.button onClick={() => setShowForm(!showForm)} whileTap={{ scale: 0.95 }}
          style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '12px', color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg,#fb923c,#f43f5e)', boxShadow: '0 4px 14px rgba(251,146,60,0.3)' }}>
          <Plus size={15} /> New Order
        </motion.button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="glass-card" style={{ borderRadius: '18px', padding: '22px', marginBottom: '20px', overflow: 'hidden' }}>
            <h3 style={{ color: 'white', fontWeight: 600, fontSize: '15px', marginBottom: '16px' }}>Create New Order</h3>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                {[
                  { key: 'customer_id', placeholder: 'Customer ID',       required: true  },
                  { key: 'table_id',    placeholder: 'Table ID',           required: true  },
                  { key: 'waiter_id',   placeholder: 'Waiter ID (optional)', required: false },
                ].map(({ key, placeholder, required }) => (
                  <input key={key} type="number" placeholder={placeholder}
                    value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    required={required} className="input-glass"
                    style={{ padding: '11px 14px', borderRadius: '12px', fontSize: '13px' }} />
                ))}
              </div>

              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '10px', fontWeight: 600, letterSpacing: '0.5px' }}>ORDER ITEMS</p>
              {form.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                  <select value={item.menu_item_id}
                    onChange={(e) => updateItem(i, 'menu_item_id', e.target.value)}
                    required className="input-glass"
                    style={{ flex: 2, padding: '11px 14px', borderRadius: '12px', fontSize: '13px' }}>
                    <option value="">Select Menu Item</option>
                    {menuItems.map(m => (
                      <option key={m.id} value={m.id} style={{ background: '#1a1a2e' }}>
                        {m.name} — Rs. {m.price}
                      </option>
                    ))}
                  </select>
                  <input type="number" min="1" placeholder="Qty" value={item.quantity}
                    onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                    className="input-glass"
                    style={{ flex: 1, padding: '11px 14px', borderRadius: '12px', fontSize: '13px' }} />
                  {form.items.length > 1 && (
                    <motion.button type="button" onClick={() => removeItem(i)} whileTap={{ scale: 0.9 }}
                      style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <X size={14} />
                    </motion.button>
                  )}
                </div>
              ))}

              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <motion.button type="button" onClick={addItem} whileTap={{ scale: 0.95 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '11px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: '13px', cursor: 'pointer' }}>
                  <Plus size={14} /> Add Item
                </motion.button>
                <motion.button type="submit" whileTap={{ scale: 0.96 }}
                  style={{ padding: '9px 22px', borderRadius: '11px', color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg,#fb923c,#f43f5e)' }}>
                  Place Order
                </motion.button>
                <motion.button type="button" onClick={() => setShowForm(false)} whileTap={{ scale: 0.95 }}
                  style={{ padding: '9px 14px', borderRadius: '11px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: '13px', cursor: 'pointer' }}>
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.length === 0 && (
          <div className="glass-card" style={{ borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
            <ShoppingBag size={38} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '14px' }}>No orders found</p>
          </div>
        )}
        {filtered.map((order, i) => {
          const sc = statusColors[order.status] || statusColors.PENDING;
          return (
            <motion.div key={order.id} className="glass-card"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{ borderRadius: '16px', padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShoppingBag size={18} color={sc.color} />
                  </div>
                  <div>
                    <p style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>Order #{order.id}</p>
                    <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '12px', marginTop: '2px' }}>
                      {order.customer_name || `Customer #${order.customer_id}`} · Table {order.table_id || '—'} · Rs. {order.total_price || 0}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '20px', background: sc.bg, color: sc.color, fontWeight: 500 }}>
                    {order.status || 'Pending'}
                  </span>
                  {statusFlow[order.status] && (
                    <motion.button whileTap={{ scale: 0.95 }}
                      onClick={() => updateStatus(order.id, statusFlow[order.status])}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '10px', color: 'white', fontWeight: 500, fontSize: '12px', cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg,#fb923c,#f43f5e)' }}>
                      <ChevronDown size={13} /> {statusFlow[order.status]}
                    </motion.button>
                  )}
                  {(order.status === 'PENDING' || order.status === 'Pending') && (
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => cancelOrder(order.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '12px', cursor: 'pointer' }}>
                      <X size={13} /> Cancel
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}