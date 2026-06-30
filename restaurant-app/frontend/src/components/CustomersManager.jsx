import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Users, Mail, Phone, MapPin, Trash2, ShoppingBag } from 'lucide-react';

const API = 'http://localhost:5000/api';

export default function CustomersManager({ token }) {
  const [customers, setCustomers] = useState([]);
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API}/customers`, { headers });
      setCustomers(res.data);
    } catch { toast.error('Failed to load customers'); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/customers/${id}`, { headers });
      toast.success('Customer removed');
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete customer');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
        {customers.length === 0 && (
          <div className="glass-card" style={{ borderRadius: '16px', padding: '48px', textAlign: 'center', gridColumn: '1 / -1' }}>
            <Users size={38} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '14px' }}>No customers yet</p>
          </div>
        )}
        {customers.map((customer, i) => (
          <motion.div key={customer.id} className="glass-card"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }} whileHover={{ y: -4 }}
            style={{ borderRadius: '18px', padding: '20px' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: '#4ade80' }}>
                  {customer.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{customer.name}</p>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}>
                    Customer
                  </span>
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(customer.id)}
                style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.18)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={12} />
              </motion.button>
            </div>

            {/* Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={12} color="rgba(255,255,255,0.28)" />
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>{customer.email}</p>
              </div>
              {customer.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={12} color="rgba(255,255,255,0.28)" />
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>{customer.phone}</p>
                </div>
              )}
              {customer.address && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={12} color="rgba(255,255,255,0.28)" />
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>{customer.address}</p>
                </div>
              )}
            </div>

            {/* Order History Link */}
            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShoppingBag size={12} color="rgba(255,255,255,0.25)" />
              <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '12px' }}>ID: #{customer.id}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}