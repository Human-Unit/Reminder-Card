'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/axios';
import { Plus, AlertCircle } from 'lucide-react';

interface Props {
  onEntryCreated: () => void;
}

export default function CreateEntryForm({ onEntryCreated }: Props) {
  // Используем имена полей, которые ждёт бэкенд: Situation, Text, Icon, Colour
  const [form, setForm] = useState({ Situation: '', Colour: '', Icon: '', Text: '' });
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async () => {
    // Валидация
    const newErrors: any = {};
    if (!form.Situation) newErrors.Situation = true;
    if (!form.Colour) newErrors.Colour = true;
    if (!form.Icon) newErrors.Icon = true;
    if (!form.Text) newErrors.Text = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setApiError(null);
    try {
      await api.post('/user/entries', form);
      setForm({ Situation: '', Colour: '', Icon: '', Text: '' });
      setErrors({});
      onEntryCreated(); // Обновляем список записей
    } catch (error: any) {
      console.error('Failed to create entry:', error);
      const errorMsg = error?.response?.data?.error || error?.message || 'Failed to create entry';
      setApiError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-8 rounded-3xl shadow-sm mb-8"
    >
      <div className="flex items-center gap-2 mb-6 border-l-4 border-purple-600 pl-3">
        <h2 className="text-lg font-bold text-gray-800">Create New Entry</h2>
      </div>

      {apiError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-700">Error</h3>
            <p className="text-sm text-red-600">{apiError}</p>
            <p className="text-xs text-red-500 mt-1">Make sure backend is running on {process.env.NEXT_PUBLIC_API_URL}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        {/* Situation Input */}
        <div className="md:col-span-6">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Situation</label>
          <input 
            value={form.Situation}
            onChange={(e) => setForm({...form, Situation: e.target.value})}
            className={`w-full p-3 border rounded-xl outline-none focus:ring-2 transition-all ${errors.Situation ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-purple-200'}`}
            placeholder="Brief title or situation"
          />
          {errors.Situation && <span className="text-xs text-red-500 mt-1">Situation is required</span>}
        </div>

        {/* Color Select */}
        <div className="md:col-span-3">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Color</label>
          <select 
            value={form.Colour}
            onChange={(e) => setForm({...form, Colour: e.target.value})}
            className={`w-full p-3 border rounded-xl outline-none bg-white ${errors.Colour ? 'border-red-400' : 'border-gray-200'}`}
          >
            <option value="">Select color</option>
            <option value="purple">Purple</option>
            <option value="orange">Orange</option>
            <option value="blue">Blue</option>
          </select>
          {errors.Colour && <span className="text-xs text-red-500 mt-1">Required</span>}
        </div>

        {/* Icon Select */}
        <div className="md:col-span-3">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Icon</label>
          <select 
            value={form.Icon}
            onChange={(e) => setForm({...form, Icon: e.target.value})}
            className={`w-full p-3 border rounded-xl outline-none bg-white ${errors.Icon ? 'border-red-400' : 'border-gray-200'}`}
          >
            <option value="">Select icon</option>
            <option value="briefcase">Briefcase</option>
            <option value="idea">Lightbulb</option>
            <option value="heart">Heart</option>
          </select>
          {errors.Icon && <span className="text-xs text-red-500 mt-1">Required</span>}
        </div>
      </div>

      {/* Text/Description */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label>
        <textarea 
          value={form.Text}
          onChange={(e) => setForm({...form, Text: e.target.value})}
          className={`w-full p-3 border rounded-xl h-32 resize-none outline-none focus:ring-2 transition-all ${errors.Text ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-purple-200'}`}
          placeholder="Write your thoughts, details, feelings..."
        />
        {errors.Text && <span className="text-xs text-red-500 mt-1">Description is required</span>}
      </div>

      {/* Button */}
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-xl shadow-lg flex justify-center items-center gap-2 hover:shadow-xl transition-shadow disabled:opacity-50"
      >
        <Plus size={20} />
        {loading ? 'Creating...' : 'Create Entry'}
      </motion.button>
    </motion.div>
  );
}