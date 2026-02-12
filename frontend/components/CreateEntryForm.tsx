'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, AlertCircle } from 'lucide-react';
import { useCreateEntry } from '../hooks/useEntries';
import { ICON_MAP, COLOR_MAP, AVAILABLE_ICONS, AVAILABLE_COLORS } from '@/lib/constants';

interface Props {
  onEntryCreated?: () => void; // Optional now as RQ INVALIDATES queries automatically
}

export default function CreateEntryForm({ onEntryCreated }: Props) {
  const initialForm = { situation: '', colour: '', icon: '', text: '' };
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  
  const createMutation = useCreateEntry();

  const handleSubmit = () => {
    // Validation
    const newErrors: Record<string, boolean> = {};
    if (!form.situation) newErrors.situation = true;
    if (!form.colour) newErrors.colour = true;
    if (!form.icon) newErrors.icon = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    createMutation.mutate(form, {
      onSuccess: () => {
        setForm(initialForm);
        setErrors({});
        if (onEntryCreated) onEntryCreated();
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm mb-8 border border-gray-100 dark:border-slate-700 transition-colors"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 border-l-4 border-purple-600 pl-3">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Create New Memory</h2>
        </div>
      </div>

      {createMutation.isError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">
            <p className="font-bold">Entry Refused</p>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <p>{(createMutation.error as any)?.response?.data?.error || 'Failed to create entry'}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        <div className="md:col-span-6">
          <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-1 ml-1">Title</label>
          <input 
            value={form.situation}
            onChange={(e) => setForm({...form, situation: e.target.value})}
            className={`w-full p-3 border rounded-xl outline-none focus:ring-4 transition-all bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-200 ${errors.situation ? 'border-red-400 focus:ring-red-100 dark:focus:ring-red-900/30' : 'focus:ring-purple-50 dark:focus:ring-purple-900/30'}`}
            placeholder="What happened?"
          />
        </div>

        <div className="md:col-span-12 space-y-4">
          {/* Icon Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2 ml-1">Icon</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_ICONS.map((iconKey) => {
                const IconComp = ICON_MAP[iconKey];
                const isSelected = form.icon === iconKey;
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setForm({ ...form, icon: iconKey })}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-center ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 shadow-md transform scale-105'
                        : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-400 hover:border-purple-200'
                    }`}
                  >
                    <IconComp size={20} />
                  </button>
                );
              })}
            </div>
            {errors.icon && <p className="text-xs text-red-500 mt-1 ml-1 font-bold">Please select an icon</p>}
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2 ml-1">Theme</label>
            <div className="flex flex-wrap gap-3">
              {AVAILABLE_COLORS.map((colorKey) => {
                const isSelected = form.colour === colorKey;
                return (
                  <button
                    key={colorKey}
                    type="button"
                    onClick={() => setForm({ ...form, colour: colorKey })}
                    className={`h-10 w-10 rounded-full cursor-pointer transition-transform border-4 ${
                      isSelected ? 'border-purple-500 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                    } ${COLOR_MAP[colorKey]}`}
                  />
                );
              })}
            </div>
            {errors.colour && <p className="text-xs text-red-500 mt-1 ml-1 font-bold">Please select a theme</p>}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-1 ml-1">Details</label>
        <textarea 
          value={form.text}
          onChange={(e) => setForm({...form, text: e.target.value})}
          className="w-full p-3 border border-gray-200 dark:border-slate-700 rounded-xl h-24 resize-none outline-none focus:ring-4 focus:ring-purple-50 dark:focus:ring-purple-900/30 transition-all bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200"
          placeholder="Add some context..."
        />
      </div>

      <motion.button 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleSubmit}
        disabled={createMutation.isPending}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg flex justify-center items-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
      >
        {createMutation.isPending ? (
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