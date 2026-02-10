'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Lightbulb, Heart, Calendar, Trash2, Pencil, X, Check } from 'lucide-react';
import { Entry } from '../types';
import api from '../lib/axios';

interface Props {
  entries: Entry[];
  onRefresh: () => void;
}

const iconMap: any = {
  briefcase: <Briefcase size={20} />,
  idea: <Lightbulb size={20} />,
  heart: <Heart size={20} />,
};

const colorMap: any = {
  purple: 'bg-gradient-to-r from-blue-500 to-purple-600',
  orange: 'bg-gradient-to-r from-orange-400 to-red-500',
  blue: 'bg-gradient-to-r from-cyan-500 to-blue-500',
};

export default function EntryList({ entries, onRefresh }: Props) {
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Исправлено: передаем entry.ID (уникальный ID записи)
  const handleDelete = async (e: React.MouseEvent, id: any) => {
    e.stopPropagation();
    if (!id) return;
    if (!confirm('Are you sure you want to delete this memory?')) return;
    try {
      await api.delete(`/user/entries/${id}`);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry || !editingEntry.ID) return;

    try {
      setIsUpdating(true);
      // Исправлено: шлем запрос на ID записи, а не на ID юзера
      await api.put(`/user/entries/${editingEntry.ID}`, {
        Situation: editingEntry.Situation,
        Text: editingEntry.Text,
        Colour: editingEntry.Colour,
        Icon: editingEntry.Icon
      });
      setEditingEntry(null);
      onRefresh();
    } catch (err) {
      alert('Update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode='popLayout'>
          {entries.map((entry) => (
            <motion.div
              key={entry.ID} // Исправлено: ключ должен быть уникальным ID записи
              layout
              className={`${colorMap[entry.Colour?.toLowerCase()] || 'bg-gray-500'} p-5 rounded-3xl text-white shadow-lg relative overflow-hidden group`}
            >
              {/* Кнопки управления */}
              <div className="absolute top-4 right-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setEditingEntry(entry)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-md transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button 
                  onClick={(e) => handleDelete(e, entry.ID)} // Исправлено: entry.ID
                  className="p-2 bg-white/10 hover:bg-red-500/40 rounded-xl backdrop-blur-md transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-start gap-4 z-10 relative">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md shrink-0">
                  {iconMap[entry.Icon?.toLowerCase()] || <Briefcase size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg leading-tight truncate pr-10">{entry.Situation}</h4>
                  <p className="text-[10px] text-white/70 flex items-center gap-1 mt-1 font-medium uppercase">
                    <Calendar size={10} />
                    {new Date(entry.CreatedAt).toLocaleDateString()}
                  </p>
                  {entry.Text && (
                    <div className="mt-3 text-sm text-white/90 line-clamp-2 italic border-l border-white/20 pl-3">
                      {entry.Text}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Модалка остается такой же, главное чтобы в ней был доступ к editingEntry.ID */}
      <AnimatePresence>
        {editingEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditingEntry(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.form initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onSubmit={handleUpdate} className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative z-10 space-y-4 text-gray-800"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-purple-600">Edit Memory</h2>
                <button type="button" onClick={() => setEditingEntry(null)}><X size={24}/></button>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Situation</label>
                <input className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl mt-1 outline-none"
                  value={editingEntry.Situation} onChange={(e) => setEditingEntry({...editingEntry, Situation: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Icon</label>
                  <div className="flex gap-2 mt-2">
                    {['briefcase', 'idea', 'heart'].map(icon => (
                      <button key={icon} type="button" onClick={() => setEditingEntry({...editingEntry, Icon: icon})}
                        className={`p-3 rounded-xl border ${editingEntry.Icon === icon ? 'border-purple-500 bg-purple-50 text-purple-600' : 'border-gray-100 text-gray-400'}`}>
                        {iconMap[icon]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Color</label>
                  <div className="flex gap-2 mt-2">
                    {['purple', 'orange', 'blue'].map(color => (
                      <button key={color} type="button" onClick={() => setEditingEntry({...editingEntry, Colour: color})}
                        className={`w-10 h-10 rounded-full border-2 ${editingEntry.Colour === color ? 'border-gray-800' : 'border-transparent'} ${color === 'purple' ? 'bg-purple-500' : color === 'orange' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                <textarea className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl mt-1 h-32 outline-none"
                  value={editingEntry.Text} onChange={(e) => setEditingEntry({...editingEntry, Text: e.target.value})} />
              </div>

              <button type="submit" disabled={isUpdating} className="w-full bg-purple-600 text-white font-bold py-4 rounded-2xl hover:bg-purple-700 transition-colors">
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}