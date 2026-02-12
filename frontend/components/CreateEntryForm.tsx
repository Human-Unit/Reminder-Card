'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/axios';
import { Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  onEntryCreated: () => void;
}

export default function CreateEntryForm({ onEntryCreated }: Props) {
  // Matches the Go struct tags exactly
  const initialForm = { situation: '', colour: '', icon: '', text: '' };
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    // Validation
    const newErrors: Record<string, boolean> = {};
    if (!form.situation) newErrors.situation = true;
    if (!form.colour) newErrors.colour = true;
    if (!form.icon) newErrors.icon = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setApiError(null);
    try {
      await api.post('/user/entries', form);
      setForm(initialForm);
      setErrors({});
      setShowSuccess(true);
      onEntryCreated(); 
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || error?.message || 'Failed to create entry';
      setApiError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-3xl shadow-sm mb-8 border border-gray-100"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 border-l-4 border-purple-600 pl-3">
          <h2 className="text-lg font-bold text-gray-800">Create New Memory</h2>
        </div>
        {showSuccess && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex items-center gap-1 text-green-600 font-medium text-sm">
            <CheckCircle2 size={16} /> Created!
          </motion.div>
        )}
      </div>

      {apiError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">
            <p className="font-bold">Entry Refused</p>
            <p>{apiError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        <div className="md:col-span-6">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Title</label>
          <input 
            value={form.situation}
            onChange={(e) => setForm({...form, situation: e.target.value})}
            className={`w-full p-3 border rounded-xl outline-none focus:ring-4 transition-all ${errors.situation ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 focus:ring-purple-50'}`}
            placeholder="What happened?"
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Color</label>
          <select 
            value={form.colour}
            onChange={(e) => setForm({...form, colour: e.target.value})}
            className={`w-full p-3 border rounded-xl outline-none bg-gray-50 appearance-none cursor-pointer ${errors.colour ? 'border-red-400' : 'border-gray-200'}`}
          >
            <option value="">Theme...</option>
            <option value="purple">Purple</option>
            <option value="orange">Orange</option>
            <option value="blue">Blue</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Icon</label>
          <select 
            value={form.icon}
            onChange={(e) => setForm({...form, icon: e.target.value})}
            className={`w-full p-3 border rounded-xl outline-none bg-gray-50 appearance-none cursor-pointer ${errors.icon ? 'border-red-400' : 'border-gray-200'}`}
          >
            <option value="">Type...</option>
            <option value="briefcase">Work</option>
            <option value="idea">Idea</option>
            <option value="heart">Personal</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Details</label>
        <textarea 
          value={form.text}
          onChange={(e) => setForm({...form, text: e.target.value})}
          className="w-full p-3 border border-gray-200 rounded-xl h-24 resize-none outline-none focus:ring-4 focus:ring-purple-50 transition-all"
          placeholder="Add some context..."
        />
      </div>

      <motion.button 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg flex justify-center items-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
      >
        {loading ? (
          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Plus size={20} />
            <span>Create Memory</span>
          </>
        )}
      </motion.button>
    </motion.div>
  );
}