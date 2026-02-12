'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Trash2, Pencil, X } from 'lucide-react';
import { Entry } from '../types';
import { useDeleteEntry, useUpdateEntry } from '../hooks/useEntries';
import { ICON_MAP, COLOR_MAP, AVAILABLE_COLORS, AVAILABLE_ICONS } from '@/lib/constants';
import { ConfirmModal } from './ConfirmModal';

interface Props {
  entries: Entry[];
}

export default function EntryList({ entries }: Props) {
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const deleteMutation = useDeleteEntry();
  const updateMutation = useUpdateEntry();

  // Helper to safely get lowercase values
  const getColor = (c: string) => (c || '').toLowerCase();
  const getIcon = (i: string) => (i || '').toLowerCase();

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry || !editingEntry.ID) return;
    
    updateMutation.mutate(editingEntry, {
      onSuccess: () => setEditingEntry(null)
    });
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  // Hydration-safe date formatter
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Just now';
    return new Date(dateString).toLocaleDateString(undefined, {
       year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  // Safe Icon render
  const renderIcon = (iconName: string) => {
    const IconComponent = ICON_MAP[getIcon(iconName)] || ICON_MAP['briefcase'];
    return <IconComponent size={20} />;
  };

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode='popLayout'>
          {entries.map((entry, index) => (
            <motion.div
              layout
              key={entry.ID}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ delay: index * 0.05 }}
              className={`${COLOR_MAP[getColor(entry.colour)] || 'bg-gray-500'} p-5 rounded-3xl text-white shadow-lg relative overflow-hidden group`}
            >
              <div className="absolute top-4 right-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setEditingEntry(entry)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-md transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setDeleteId(entry.ID); }}
                  className="p-2 bg-white/10 hover:bg-red-500/40 rounded-xl backdrop-blur-md transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-start gap-4 z-10 relative">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md shrink-0">
                  {renderIcon(entry.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg leading-tight truncate pr-10">{entry.situation}</h4>
                  <p className="text-[10px] text-white/70 flex items-center gap-1 mt-1 font-medium uppercase">
                    <Calendar size={10} />
                    {formatDate(entry.CreatedAt)}
                  </p>
                  {entry.text && (
                    <div className="mt-3 text-sm text-white/90 line-clamp-2 italic border-l border-white/20 pl-3">
                      {entry.text}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditingEntry(null)} 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            <motion.form 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onSubmit={handleUpdate} 
              className="bg-white dark:bg-zinc-900 rounded-3xl p-8 w-full max-w-lg shadow-2xl relative z-10 space-y-4 text-gray-800 dark:text-gray-100"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400">Edit Memory</h2>
                <button type="button" onClick={() => setEditingEntry(null)} className="dark:text-gray-400 hover:text-gray-600"><X size={24}/></button>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Situation</label>
                <input 
                  className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-purple-200"
                  value={editingEntry.situation} 
                  onChange={(e) => setEditingEntry(prev => prev ? {...prev, situation: e.target.value} : null)} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Icon</label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {AVAILABLE_ICONS.map(icon => {
                      const IconComp = ICON_MAP[icon];
                      return (
                        <button 
                          key={icon} 
                          type="button" 
                          onClick={() => setEditingEntry(prev => prev ? {...prev, icon: icon} : null)}
                          className={`p-2 rounded-xl border transition-all ${editingEntry.icon === icon ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'border-gray-100 dark:border-zinc-700 text-gray-400'}`}
                        >
                          <IconComp size={18} />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Color</label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {AVAILABLE_COLORS.map(color => (
                      <button 
                        key={color} 
                        type="button" 
                        onClick={() => setEditingEntry(prev => prev ? {...prev, colour: color} : null)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform active:scale-95 ${editingEntry.colour === color ? 'border-gray-800 dark:border-white scale-110' : 'border-transparent'} ${COLOR_MAP[color]}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                <textarea 
                  className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl mt-1 h-32 outline-none resize-none focus:ring-2 focus:ring-purple-200"
                  value={editingEntry.text} 
                  onChange={(e) => setEditingEntry(prev => prev ? {...prev, text: e.target.value} : null)} 
                />
              </div>

              <button 
                type="submit" 
                disabled={updateMutation.isPending} 
                className="w-full bg-purple-600 text-white font-bold py-4 rounded-2xl hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Memory"
        message="Are you sure you want to delete this memory? This action cannot be undone."
      />
    </div>
  );
}