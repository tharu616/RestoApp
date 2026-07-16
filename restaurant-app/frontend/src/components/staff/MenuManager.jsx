import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Trash2, Pencil, Save, X } from 'lucide-react';
import api from '../../api/axios';

export default function MenuManager({ onChanged }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', is_available: true });
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', price: '', category: '', is_available: true });
  const [editImageFile, setEditImageFile] = useState(null);

  useEffect(() => { fetchMenu(); }, []);

  const fetchMenu = async () => {
    const res = await api.get('/menu');
    setItems(res.data || []);
  };

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', category: '', is_available: true });
    setImageFile(null);
  };

  const buildFormData = (data, file) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('image', file);
    return fd;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const fd = buildFormData(form, imageFile);
      await api.post('/menu', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Menu item added!');
      fetchMenu();
      onChanged?.();
      resetForm();
    } catch {
      toast.error('Failed to add item');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/menu/${id}`);
      toast.success('Item deleted');
      fetchMenu();
      onChanged?.();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      name: item.name || '',
      description: item.description || '',
      price: item.price || '',
      category: item.category || '',
      is_available: item.is_available === undefined ? true : !!item.is_available,
    });
    setEditImageFile(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditImageFile(null);
    setEditForm({ name: '', description: '', price: '', category: '', is_available: true });
  };

  const saveEdit = async (id) => {
    try {
      const fd = buildFormData(editForm, editImageFile);
      await api.put(`/menu/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Menu item updated');
      setEditingId(null);
      fetchMenu();
      onChanged?.();
    } catch {
      toast.error('Failed to update item');
    }
  };

  const imgSrc = (item) => item.image_url ? `http://localhost:5000${item.image_url}` : null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
      <div className="glass-card" style={{ borderRadius: '20px', padding: '22px', alignSelf: 'start' }}>
        <h3 style={{ color: 'white', fontWeight: 600, fontSize: '15px', marginBottom: '16px' }}>Add Menu Item</h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { key: 'name', placeholder: 'Dish Name', required: true },
            { key: 'description', placeholder: 'Description', required: false },
            { key: 'price', placeholder: 'Price (Rs.)', required: true },
            { key: 'category', placeholder: 'Category', required: true },
          ].map(({ key, placeholder, required }) => (
            <input key={key} placeholder={placeholder} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={required} className="input-glass" style={{ padding: '12px 14px', borderRadius: '12px', fontSize: '13px' }} />
          ))}
          <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
            Food Image
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="input-glass" style={{ padding: '10px 12px', borderRadius: '12px', fontSize: '12px', marginTop: '6px' }} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} style={{ width: '15px', height: '15px', accentColor: '#fb923c' }} />
            Available on menu
          </label>
          <motion.button type="submit" whileTap={{ scale: 0.97 }} className="liquid-btn" style={{ padding: '12px', borderRadius: '12px', color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer', border: 'none' }}>Add Item</motion.button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px', alignContent: 'start' }}>
        {items.map((item, i) => (
          <motion.div key={item.id} className="glass-card" initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -5 }} style={{ borderRadius: '18px', padding: 0, overflow: 'hidden' }}>
            {editingId === item.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '18px' }}>
                <input className="input-glass" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={{ padding: '10px 12px', borderRadius: '10px' }} />
                <input className="input-glass" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} style={{ padding: '10px 12px', borderRadius: '10px' }} />
                <input className="input-glass" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} style={{ padding: '10px 12px', borderRadius: '10px' }} />
                <input className="input-glass" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} style={{ padding: '10px 12px', borderRadius: '10px' }} />
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                  Replace Image
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                    className="input-glass" style={{ padding: '8px 10px', borderRadius: '10px', fontSize: '11px', marginTop: '4px' }} />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                  <input type="checkbox" checked={editForm.is_available} onChange={(e) => setEditForm({ ...editForm, is_available: e.target.checked })} /> Available
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => saveEdit(item.id)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#fb923c,#f43f5e)', color: 'white' }}><Save size={14} style={{ display: 'inline', marginRight: 6 }} />Save</button>
                  <button type="button" onClick={cancelEdit} style={{ padding: '10px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: 'white' }}><X size={14} /></button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', background: 'linear-gradient(135deg, rgba(251,146,60,0.18), rgba(244,63,94,0.12))', overflow: 'hidden' }}>
                  {imgSrc(item) ? (
                    <img src={imgSrc(item)} alt={item.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>No image</span>
                    </div>
                  )}
                  <div style={{ position: 'absolute', right: 8, top: 8, display: 'flex', gap: 6 }}>
                    <motion.button onClick={() => startEdit(item)} whileTap={{ scale: 0.85 }} style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Pencil size={13} /></motion.button>
                    <motion.button onClick={() => handleDelete(item.id)} whileTap={{ scale: 0.85 }} style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={13} /></motion.button>
                  </div>
                </div>
                <div style={{ padding: '16px' }}>
                  <h4 style={{ color: 'white', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>{item.name}</h4>
                  {item.description && <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', marginBottom: '12px', lineHeight: 1.4 }}>{item.description}</p>}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#fb923c', fontWeight: 700, fontSize: '15px' }}>Rs. {item.price}</span>
                    <span style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '20px', background: item.is_available ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: item.is_available ? '#4ade80' : '#f87171' }}>{item.is_available ? 'Available' : 'Unavailable'}</span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px' }}>{item.category}</p>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}