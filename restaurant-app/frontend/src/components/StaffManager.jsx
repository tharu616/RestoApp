import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Users, Plus, X, Edit2, Check, Mail, Phone } from 'lucide-react';

const API = 'http://localhost:5000/api';

export default function StaffManager({ token }) {
  const [staff, setStaff] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [filterRole, setFilterRole] = useState('ALL');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Waiter', shift: 'Morning' });
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    try {
      const res = await axios.get(`${API}/staff`, { headers });
      setStaff(res.data);
    } catch { toast.error('Failed to load staff'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/staff`, form, { headers });
      toast.success('Staff member added!');
      setShowForm(false);
      setForm({ name: '', email: '', password: '', role: 'Waiter', shift: 'Morning' });
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add staff');
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.patch(`${API}/staff/${id}`, editData, { headers });
      toast.success('Staff updated!');
      setEditId(null);
      fetchStaff();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/staff/${id}`, { headers });
      toast.success('Staff removed');
      fetchStaff();
    } catch { toast.error('Failed to delete'); }
  };

  const roles = ['ALL', 'Waiter', 'Chef', 'Manager', 'Cashier', 'Head Waiter'];
  const shifts = ['Morning', 'Evening', 'Night'];

  const roleColors = {
    Waiter: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
    Chef: { bg: 'rgba(251,146,60,0.15)', color: '#fb923c' },
    Manager: { bg: 'rgba(168,85,247,0.15)', color: '#a78bfa' },
    Cashier: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
    'Head Waiter': { bg: 'rgba(236,72,153,0.15)', color: '#f472b6' },
  };

  const filteredStaff = filterRole === 'ALL' ? staff : staff.filter(s => s.role === filterRole);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {roles.map(r => (
            <motion.button key={r} onClick={() => setFilterRole(r)} whileTap={{ scale: 0.95 }}
              className={filterRole === r ? 'liquid-btn' : 'glass'}
              style={{ padding: '7px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 500, color: filterRole === r ? 'white' : 'rgba(255,255,255,0.45)', cursor: 'pointer', border: 'none' }}>
              {r}
            </motion.button>
          ))}
        </div>
        <motion.button onClick={() => setShowForm(!showForm)} whileTap={{ scale: 0.95 }} className="liquid-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '12px', color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer', border: 'none' }}>
          <Plus size={15} /> Add Staff
        </motion.button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="glass-card" style={{ borderRadius: '18px', padding: '22px', marginBottom: '20px', overflow: 'hidden' }}>
            <h3 style={{ color: 'white', fontWeight: 600, fontSize: '15px', marginBottom: '16px' }}>Add New Staff Member</h3>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <input placeholder="Full Name" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required
                  className="input-glass" style={{ padding: '11px 14px', borderRadius: '12px', fontSize: '13px' }} />
                <input type="email" placeholder="Email Address" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required
                  className="input-glass" style={{ padding: '11px 14px', borderRadius: '12px', fontSize: '13px' }} />
                <input type="password" placeholder="Password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required
                  className="input-glass" style={{ padding: '11px 14px', borderRadius: '12px', fontSize: '13px' }} />
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="input-glass" style={{ padding: '11px 14px', borderRadius: '12px', fontSize: '13px' }}>
                  {['Waiter', 'Chef', 'Manager', 'Cashier', 'Head Waiter'].map(r => (
                    <option key={r} value={r} style={{ background: '#1a1a2e' }}>{r}</option>
                  ))}
                </select>
                <select value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })}
                  className="input-glass" style={{ padding: '11px 14px', borderRadius: '12px', fontSize: '13px' }}>
                  {shifts.map(s => (
                    <option key={s} value={s} style={{ background: '#1a1a2e' }}>{s} Shift</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <motion.button type="submit" whileTap={{ scale: 0.96 }} className="liquid-btn"
                  style={{ padding: '9px 22px', borderRadius: '11px', color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer', border: 'none' }}>
                  Add Staff
                </motion.button>
                <motion.button type="button" onClick={() => setShowForm(false)} whileTap={{ scale: 0.95 }} className="glass"
                  style={{ padding: '9px 14px', borderRadius: '11px', color: 'rgba(255,255,255,0.4)', fontSize: '13px', cursor: 'pointer', border: 'none' }}>
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Staff Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
        {filteredStaff.length === 0 && (
          <div className="glass-card" style={{ borderRadius: '16px', padding: '48px', textAlign: 'center', gridColumn: '1 / -1' }}>
            <Users size={38} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '14px' }}>No staff members found</p>
          </div>
        )}
        {filteredStaff.map((member, i) => {
          const rc = roleColors[member.role] || { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' };
          const isEditing = editId === member.id;
          return (
            <motion.div key={member.id} className="glass-card"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }} whileHover={{ y: -4 }}
              style={{ borderRadius: '18px', padding: '20px' }}>

              {isEditing ? (
                <div>
                  <select value={editData.role || member.role} onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                    className="input-glass" style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', fontSize: '13px', marginBottom: '10px' }}>
                    {['Waiter', 'Chef', 'Manager', 'Cashier', 'Head Waiter'].map(r => (
                      <option key={r} value={r} style={{ background: '#1a1a2e' }}>{r}</option>
                    ))}
                  </select>
                  <select value={editData.shift || member.shift} onChange={(e) => setEditData({ ...editData, shift: e.target.value })}
                    className="input-glass" style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', fontSize: '13px', marginBottom: '12px' }}>
                    {shifts.map(s => (
                      <option key={s} value={s} style={{ background: '#1a1a2e' }}>{s} Shift</option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <motion.button onClick={() => handleUpdate(member.id)} whileTap={{ scale: 0.95 }} className="liquid-btn"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '8px', borderRadius: '10px', color: 'white', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none' }}>
                      <Check size={13} /> Save
                    </motion.button>
                    <motion.button onClick={() => setEditId(null)} whileTap={{ scale: 0.95 }} className="glass"
                      style={{ padding: '8px 12px', borderRadius: '10px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', cursor: 'pointer', border: 'none' }}>
                      Discard
                    </motion.button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Avatar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: rc.bg, border: `1px solid ${rc.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: rc.color }}>
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{member.name}</p>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: rc.bg, color: rc.color }}>
                          {member.role}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <motion.button whileTap={{ scale: 0.9 }}
                        onClick={() => { setEditId(member.id); setEditData({ role: member.role, shift: member.shift }); }}
                        style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Edit2 size={12} />
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(member.id)}
                        style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={12} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={12} color="rgba(255,255,255,0.3)" />
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{member.email}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={12} color="rgba(255,255,255,0.3)" />
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{member.shift} Shift</p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}