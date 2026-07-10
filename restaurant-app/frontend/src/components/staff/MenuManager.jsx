import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const normalizeMenuItem = (item) => ({
  ...item,
  available: item.available ?? item.is_available ?? true,
});

export default function MenuManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main',
    image: '',
    available: true,
  });
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main',
    image: '',
    available: true,
  });

  const loadItems = async () => {
    try {
      const res = await api.get('/menu');
      setItems((res.data || []).map(normalizeMenuItem));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load menu');
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const createItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/menu', {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        image: form.image || null,
        is_available: form.available,
      });
      toast.success('Menu item added');
      setForm({ name: '', description: '', price: '', category: 'Main', image: '', available: true });
      await loadItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      name: item.name || '',
      description: item.description || '',
      price: item.price ?? '',
      category: item.category || 'Main',
      image: item.image || '',
      available: item.available ?? true,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', description: '', price: '', category: 'Main', image: '', available: true });
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/menu/${id}`, {
        name: editForm.name,
        description: editForm.description,
        price: Number(editForm.price),
        category: editForm.category,
        image: editForm.image || null,
        is_available: editForm.available,
      });
      toast.success('Menu item updated');
      setEditingId(null);
      await loadItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update item');
    }
  };

  const toggleAvailable = async (item) => {
    try {
      await api.patch(`/menu/${item.id}`, { is_available: !item.available });
      toast.success('Item updated');
      await loadItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update item');
    }
  };

  const removeItem = async (id) => {
    try {
      await api.delete(`/menu/${id}`);
      toast.success('Item deleted');
      await loadItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete item');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' }}>
      <form onSubmit={createItem} style={{ display: 'grid', gap: 12, padding: 16, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}>
        <h3 style={{ margin: 0 }}>Add Menu Item</h3>
        <input placeholder="Item name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option>Main</option>
          <option>Starter</option>
          <option>Dessert</option>
          <option>Drinks</option>
        </select>
        <label>
          <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} /> Available
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Item'}</button>
      </form>

      <div style={{ display: 'grid', gap: 14 }}>
        {items.map((item) => (
          <div key={item.id} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 14 }}>
            {editingId === item.id ? (
              <div style={{ display: 'grid', gap: 10 }}>
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Item name" />
                <input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description" />
                <input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} placeholder="Price" />
                <input value={editForm.image} onChange={(e) => setEditForm({ ...editForm, image: e.target.value })} placeholder="Image URL" />
                <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                  <option>Main</option>
                  <option>Starter</option>
                  <option>Dessert</option>
                  <option>Drinks</option>
                </select>
                <label>
                  <input type="checkbox" checked={editForm.available} onChange={(e) => setEditForm({ ...editForm, available: e.target.checked })} /> Available
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => saveEdit(item.id)}>Save</button>
                  <button type="button" onClick={cancelEdit}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h4>{item.name}</h4>
                <p>{item.category}</p>
                <p>{item.description}</p>
                <p>Rs. {Number(item.price || 0).toFixed(2)}</p>
                <p>{item.available ? 'Available' : 'Unavailable'}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button onClick={() => startEdit(item)}>Edit</button>
                  <button onClick={() => toggleAvailable(item)}>
                    {item.available ? 'Mark Unavailable' : 'Mark Available'}
                  </button>
                  <button onClick={() => removeItem(item.id)}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}