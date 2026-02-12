"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Trash2, 
  Calendar, 
  Briefcase, 
  Lightbulb, 
  Heart, 
  Loader2,
  Search,
  Edit,
  Eye
} from "lucide-react";
import { useState } from "react";
import { User, Entry, TableItem } from "@/types";
import { Toast, ToastType } from "./Toast"; // Import the Toast component

interface DataTableProps {
  type: "users" | "entries";
  data: TableItem[];
  onDelete: (id: number) => void;
  onEdit?: (user: User) => void;
  onViewEntries?: (userId: number) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  briefcase: <Briefcase size={18} />,
  idea: <Lightbulb size={18} />,
  heart: <Heart size={18} />,
  default: <Briefcase size={18} />
};

const colorMap: Record<string, string> = {
  purple: 'bg-gradient-to-r from-blue-500 to-purple-600',
  orange: 'bg-gradient-to-r from-orange-400 to-red-500',
  blue: 'bg-gradient-to-r from-cyan-500 to-blue-500',
  default: 'bg-slate-400'
};

export const DataTable = ({ type, data, onDelete, onEdit, onViewEntries }: DataTableProps) => {
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as ToastType });

  const validData = data.filter((item): item is TableItem => {
    if (type === "users") return !!(item as User).email;
    return !!(item as Entry).situation;
  });

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric"
      });
    } catch {
      return "Invalid date";
    }
  };

  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : "??";
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden relative transition-colors">
      {/* Toast Notification for the Table */}
      <Toast 
        isVisible={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
            {type === "users" ? "Users Directory" : "Memory Entries"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-1">
            Total: {validData.length} items
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <th className="p-5 pl-8 w-16">ID</th>
              <th className="p-5">{type === "users" ? "User Profile" : "Memory Detail"}</th>
              <th className="p-5 hidden md:table-cell">Date Created</th>
              {type === "entries" && <th className="p-5 hidden sm:table-cell">Category</th>}
              <th className="p-5 text-right pr-8">Actions</th>
            </tr>
          </thead>

          <tbody className="text-sm">
            <AnimatePresence mode="popLayout">
              {validData.length === 0 ? (
                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                      <Search size={48} className="mb-4 opacity-20" />
                      <p className="font-medium">No records found</p>
                    </div>
                  </td>
                </motion.tr>
              ) : (
                validData.map((item, index) => (
                  <motion.tr
                    key={item.ID}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0"
                  >
                    <td className="p-5 pl-8 text-slate-400 dark:text-slate-500 font-mono text-xs">#{item.ID}</td>

                    <td className="p-5">
                      {type === "users" ? (
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-200 font-bold text-xs shadow-inner">
                            {getInitials((item as User).name)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-700 dark:text-slate-200">{(item as User).name}</div>
                            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">{(item as User).email}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-4 max-w-[200px] sm:max-w-xs md:max-w-md">
                          <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${(item as Entry).colour ? colorMap[(item as Entry).colour.toLowerCase()] : colorMap.default}`}>
                            {iconMap[(item as Entry).icon?.toLowerCase()] || iconMap.default}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-700 dark:text-slate-200 truncate block">{(item as Entry).situation}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{(item as Entry).text}</div>
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="p-5 hidden md:table-cell text-slate-500 dark:text-slate-400 font-medium">
                      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                        <Calendar size={14} />
                        <span className="text-xs font-semibold">{formatDate(item.CreatedAt)}</span>
                      </div>
                    </td>

                    {type === "entries" && (
                      <td className="p-5 hidden sm:table-cell">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200/50 dark:border-slate-700/50">
                          {(item as Entry).icon || 'General'}
                        </span>
                      </td>
                    )}

                    <td className="p-5 text-right pr-8 flex items-center justify-end gap-2">
                       {type === "users" && onEdit && (
                        <button
                          onClick={() => onEdit(item as User)}
                          className="p-2 rounded-xl text-slate-300 dark:text-slate-600 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all active:scale-90"
                          title="Edit User"
                        >
                          <Edit size={18} strokeWidth={2.5} />
                        </button>
                      )}
                      {type === "users" && onViewEntries && (
                        <button
                          onClick={() => onViewEntries((item as User).ID)}
                          className="p-2 rounded-xl text-slate-300 dark:text-slate-600 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all active:scale-90"
                          title="View Entries"
                        >
                          <Eye size={18} strokeWidth={2.5} />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(item.ID)}
                        className="p-2 rounded-xl text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group-hover:text-slate-400 dark:group-hover:text-slate-500 active:scale-90"
                        title="Delete Record"
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};