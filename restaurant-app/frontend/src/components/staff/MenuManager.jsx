import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function MenuManager() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main',
    image: '',
    available: true,
  });

  const loadItems = async () => {
    const res = await api.get('/menu');
    setItems(res.data);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const createItem = async (e) => {
    e.preventDefault();
    try {
      await api.post('/menu', { ...form, price: Number(form.price) });
      toast.success('Menu item added');
      setForm({ name: '', description: '', price: '', category: 'Main', image: '', available: true });
      loadItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item');
    }
  };

  const toggleAvailable = async (id, available) => {
    try {
      await api.patch(`/menu/${id}`, { available: !available });
      loadItems();
    } catch {
      toast.error('Failed to update item');
    }
  };

  const removeItem = async (id) => {
    try {
      await api.delete(`/menu/${id}`);
      toast.success('Item deleted');
      loadItems();
    } catch {
      toast.error('Failed to delete item');
    }
  };

  return (
    <div>
      <form onSubmit={createItem}>
        <input placeholder="Item name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option>Main</option>
          <option>Starter</option>
          <option>Dessert</option>
          <option>Drinks</option>
        </select>
        <button type="submit">Add Item</button>
      </form>

      <div>
        {items.map((item) => (
          <div key={item.id}>
            <h4>{item.name}</h4>
            <p>{item.category}</p>
            <button onClick={() => toggleAvailable(item.id, item.available)}>
              {item.available ? 'Mark Unavailable' : 'Mark Available'}
            </button>
            <button onClick={() => removeItem(item.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}