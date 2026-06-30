import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CalendarDays, Plus, X, Edit2, Check } from 'lucide-react';

const API = 'http://localhost:5000/api';

export default function ReservationsManager({ token }) {
  const [reservations, setReservations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [form, setForm] = useState({ customer_id: '', table_id: '', date_time: '', time_slot: '', guests: '', notes: '' });
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchReservations(); }, []);

  const fetchReservations = async () => {
    try {
      const res = await axios.get(`${API}/reservations`, { headers });
      setReservations(res.data);
    } catch { toast.error('Failed to load'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/reservations`, form, { headers });
      toast.success('Reservation created!');
      setShowForm(false);
      setForm({ customer_id: '', table_id: '', date_time: '', time_slot: '', guests: '', notes: '' });
      fetchReservations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book');
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.patch(`${API}/reservations/${id}`, editData, { headers });
      toast.success('Reservation updated!');
      setEditId(null);
      fetchReservations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleCancel = async (id) => {
    try {
      await axios.delete(`${API}/reservations/${id}`, { headers });
      toast.success('Reservation cancelled');
      fetchReservations();
    } catch { toast.error('Failed to cancel'); }
  };

  const statusColor = (status) => ({
    CONFIRMED: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
    CANCELLED: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
  }[status] || { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <motion.button onClick={() => setShowForm(!showForm)} whileTap={{ scale: 0.95 }} className="liquid-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '12px', color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer', border: 'none' }}>
          <Plus size={15} /> New Reservation
        </motion.button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="glass-card" style={{ borderRadius: '18px', padding: '22px', marginBottom: '20px', overflow: 'hidden' }}>
            <h3 style={{ color: 'white', fontWeight: 600, fontSize: '15px', marginBottom: '16px' }}>New Reservation</h3>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { key: 'customer_id', placeholder: 'Customer ID', type: 'number' },
                  { key: 'table_id', placeholder: 'Table ID', type: 'number' },
                  { key: 'guests', placeholder: 'Number of Guests', type: 'number' },
                  { key: 'time_slot', placeholder: 'Time Slot (e.g. 7PM-9PM)', type: 'text' },
                  { key: 'date_time', placeholder: 'Date & Time', type: 'datetime-local' },
                  { key: 'notes', placeholder: 'Notes (optional)', type: 'text' },
                ].map(({ key, placeholder, type }) => (
                  <input key={key} type={type} placeholder={placeholder}
                    value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    required={key !== 'notes'}
                    className="input-glass" style={{ padding: '11px 14px', borderRadius: '12px', fontSize: '13px' }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <motion.button type="submit" whileTap={{ scale: 0.96 }} className="liquid-btn"
                  style={{ padding: '9px 22px', borderRadius: '11px', color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer', border: 'none' }}>
                  Book Table
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

      {/* Reservations List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {reservations.length === 0 && (
          <div className="glass-card" style={{ borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
            <CalendarDays size={38} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '14px' }}>No reservations yet</p>
          </div>
        )}
        {reservations.map((res, i) => {
          const sc = statusColor(res.status);
          const isEditing = editId === res.id;
          return (
            <motion.div key={res.id} className="glass-card"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ borderRadius: '16px', padding: '18px 20px' }}>

              {isEditing ? (
                // Edit Mode
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    <input type="datetime-local" placeholder="Date & Time"
                      value={editData.date_time || ''} onChange={(e) => setEditData({ ...editData, date_time: e.target.value })}
                      className="input-glass" style={{ padding: '9px 12px', borderRadius: '10px', fontSize: '13px' }} />
                    <input type="text" placeholder="Time Slot"
                      value={editData.time_slot || ''} onChange={(e) => setEditData({ ...editData, time_slot: e.target.value })}
                      className="input-glass" style={{ padding: '9px 12px', borderRadius: '10px', fontSize: '13px' }} />
                    <input type="number" placeholder="Guests"
                      value={editData.guests || ''} onChange={(e) => setEditData({ ...editData, guests: e.target.value })}
                      className="input-glass" style={{ padding: '9px 12px', borderRadius: '10px', fontSize: '13px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <motion.button onClick={() => handleUpdate(res.id)} whileTap={{ scale: 0.95 }} className="liquid-btn"
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '10px', color: 'white', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none' }}>
                      <Check size={13} /> Save
                    </motion.button>
                    <motion.button onClick={() => setEditId(null)} whileTap={{ scale: 0.95 }} className="glass"
                      style={{ padding: '7px 12px', borderRadius: '10px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', cursor: 'pointer', border: 'none' }}>
                      Discard
                    </motion.button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CalendarDays size={18} color="#a78bfa" />
                    </div>
                    <div>
                      <p style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>
                        {res.customer_name || `Booking #${res.id}`}
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '12px', marginTop: '3px' }}>
                        Table {res.table_id || res.table_number} · {res.guests} guests · {res.time_slot || '—'} · {res.date_time ? new Date(res.date_time).toLocaleDateString() : '—'}
                      </p>
                      {res.notes && <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', marginTop: '2px' }}>📝 {res.notes}</p>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '20px', background: sc.bg, color: sc.color, fontWeight: 500 }}>
                      {res.status}
                    </span>
                    {res.status !== 'CANCELLED' && (
                      <>
                        <motion.button whileTap={{ scale: 0.9 }}
                          onClick={() => { setEditId(res.id); setEditData({ date_time: res.date_time, time_slot: res.time_slot, guests: res.guests }); }}
                          style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Edit2 size={13} />
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.9 }}
                          onClick={() => handleCancel(res.id)}
                          style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <X size={13} />
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}