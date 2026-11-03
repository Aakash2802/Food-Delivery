import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader, Store, Clock, MapPin, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { restaurantAPI } from '../../services/api';
import Navbar from '../../components/Navbar';
import ImageUpload from '../../components/ImageUpload';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const toForm = (r) => ({
  name: r.name || '',
  description: r.description || '',
  cuisines: (r.cuisines || []).join(', '),
  image: r.images?.[0]?.url || '',
  phone: r.contactInfo?.phone || '',
  email: r.contactInfo?.email || '',
  street: r.location?.street || '',
  city: r.location?.city || '',
  state: r.location?.state || '',
  zipCode: r.location?.zipCode || '',
  deliveryTimeMin: r.deliveryTime?.min ?? 30,
  deliveryTimeMax: r.deliveryTime?.max ?? 45,
  deliveryFee: r.deliveryFee ?? 0,
  minimumOrder: r.minimumOrder ?? 0,
  pricing: r.pricing || '$$',
  // One row per weekday; days missing from the saved hours are shown as closed
  hours: DAYS.map((day) => {
    const saved = (r.openingHours || []).find((h) => h.day === day);
    return saved
      ? { day, open: saved.open, close: saved.close, closed: false }
      : { day, open: '09:00', close: '22:00', closed: (r.openingHours || []).length > 0 };
  })
});

// Defined at module level so they are not recreated (and remounted) on every render
const Section = ({ icon, title, children }) => {
  const Icon = icon;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
        <Icon className="w-5 h-5 mr-2 text-red-600" />
        {title}
      </h2>
      {children}
    </div>
  );
};

const Field = ({ label, children, className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    {children}
  </div>
);

const VendorSettings = () => {
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    restaurantAPI.getByVendor()
      .then((res) => {
        const r = res.data?.restaurant;
        if (!r) {
          toast.error('Create your restaurant first');
          navigate('/vendor');
          return;
        }
        setRestaurant(r);
        setForm(toForm(r));
      })
      .catch(() => toast.error('Failed to load restaurant'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const setHour = (index, patch) =>
    setForm((f) => ({ ...f, hours: f.hours.map((h, i) => (i === index ? { ...h, ...patch } : h)) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const min = parseInt(form.deliveryTimeMin, 10);
    const max = parseInt(form.deliveryTimeMax, 10);
    if (!(min >= 10) || !(max >= min)) {
      toast.error('Delivery time: minimum must be at least 10 min and not more than the maximum');
      return;
    }
    for (const h of form.hours) {
      if (!h.closed && h.open >= h.close) {
        toast.error(`${h.day}: closing time must be after opening time`);
        return;
      }
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      cuisines: form.cuisines.split(',').map((c) => c.trim()).filter(Boolean),
      images: form.image ? [{ url: form.image, isPrimary: true }] : [],
      contactInfo: { phone: form.phone.trim(), email: form.email.trim() || undefined },
      location: {
        street: form.street.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zipCode: form.zipCode.trim(),
        country: restaurant.location?.country || 'India',
        // No map picker yet - keep the coordinates the restaurant already has
        coordinates: restaurant.location?.coordinates
      },
      deliveryTime: { min, max },
      deliveryFee: parseFloat(form.deliveryFee) || 0,
      minimumOrder: parseFloat(form.minimumOrder) || 0,
      pricing: form.pricing,
      openingHours: form.hours.filter((h) => !h.closed).map(({ day, open, close }) => ({ day, open, close }))
    };

    try {
      setSaving(true);
      const res = await restaurantAPI.updateVendor(payload);
      const updated = res.data?.restaurant || res.data;
      setRestaurant(updated);
      setForm(toForm(updated));
      toast.success('Restaurant updated');
    } catch (error) {
      if (error?.errors?.length) {
        error.errors.forEach((err) => toast.error(`${err.field}: ${err.message}`));
      } else {
        toast.error(error?.message || 'Failed to update restaurant');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => navigate('/vendor')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-red-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to dashboard
        </button>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Restaurant Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Section icon={Store} title="Basic information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Restaurant name *" className="md:col-span-2">
                <input type="text" value={form.name} onChange={set('name')} className="input" required minLength={2} />
              </Field>
              <Field label="Description" className="md:col-span-2">
                <textarea value={form.description} onChange={set('description')} className="input" rows="3" maxLength={1000} />
              </Field>
              <Field label="Cuisines (comma separated)">
                <input type="text" value={form.cuisines} onChange={set('cuisines')} className="input" placeholder="South Indian, Chinese" />
              </Field>
              <Field label="Price range">
                <select value={form.pricing} onChange={set('pricing')} className="input">
                  <option value="$">$ - Budget friendly</option>
                  <option value="$$">$$ - Moderate</option>
                  <option value="$$$">$$$ - Expensive</option>
                  <option value="$$$$">$$$$ - Fine dining</option>
                </select>
              </Field>
              <div className="md:col-span-2">
                <ImageUpload
                  label="Cover photo"
                  value={form.image}
                  onChange={(url) => setForm((f) => ({ ...f, image: url }))}
                />
              </div>
            </div>
          </Section>

          <Section icon={MapPin} title="Contact & address">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Phone *">
                <input type="tel" value={form.phone} onChange={set('phone')} className="input" required placeholder="+919876543210" />
              </Field>
              <Field label="Email">
                <input type="email" value={form.email} onChange={set('email')} className="input" />
              </Field>
              <Field label="Street *" className="md:col-span-2">
                <input type="text" value={form.street} onChange={set('street')} className="input" required />
              </Field>
              <Field label="City *">
                <input type="text" value={form.city} onChange={set('city')} className="input" required />
              </Field>
              <Field label="State">
                <input type="text" value={form.state} onChange={set('state')} className="input" />
              </Field>
              <Field label="PIN code">
                <input type="text" value={form.zipCode} onChange={set('zipCode')} className="input" />
              </Field>
            </div>
          </Section>

          <Section icon={Truck} title="Delivery">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Min time (mins)">
                <input type="number" min="10" value={form.deliveryTimeMin} onChange={set('deliveryTimeMin')} className="input" required />
              </Field>
              <Field label="Max time (mins)">
                <input type="number" min="10" value={form.deliveryTimeMax} onChange={set('deliveryTimeMax')} className="input" required />
              </Field>
              <Field label="Delivery fee (₹)">
                <input type="number" min="0" step="1" value={form.deliveryFee} onChange={set('deliveryFee')} className="input" />
              </Field>
              <Field label="Minimum order (₹)">
                <input type="number" min="0" step="1" value={form.minimumOrder} onChange={set('minimumOrder')} className="input" />
              </Field>
            </div>
          </Section>

          <Section icon={Clock} title="Opening hours">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Shown to customers on your restaurant page. Use the Open/Closed button on the dashboard to pause orders at any time.
            </p>
            <div className="space-y-2">
              {form.hours.map((h, i) => (
                <div key={h.day} className="grid grid-cols-[6rem_1fr_1fr_auto] items-center gap-3">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{h.day}</span>
                  <input
                    type="time"
                    value={h.open}
                    disabled={h.closed}
                    onChange={(e) => setHour(i, { open: e.target.value })}
                    className="input disabled:opacity-40"
                  />
                  <input
                    type="time"
                    value={h.close}
                    disabled={h.closed}
                    onChange={(e) => setHour(i, { close: e.target.value })}
                    className="input disabled:opacity-40"
                  />
                  <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={h.closed}
                      onChange={(e) => setHour(i, { closed: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <span>Closed</span>
                  </label>
                </div>
              ))}
            </div>
          </Section>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate('/vendor')} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary flex items-center space-x-2 disabled:opacity-60">
              {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving…' : 'Save changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorSettings;
