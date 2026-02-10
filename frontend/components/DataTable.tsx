"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface BaseItem {
  ID: number;
  CreatedAt: string;
}

interface UserItem extends BaseItem {
  name: string;
  email: string;
  role?: string;
}

interface EntryItem extends BaseItem {
  Situation: string;
  Text: string;
  Colour: string;
  Icon: string;
  User_id: number;
}

type TableItem = UserItem | EntryItem;

interface DataTableProps {
  type: "users" | "entries";
  data: TableItem[];
  onDelete: (id: number) => Promise<void>; // Made async for proper loading handling
}

export const DataTable = ({ type, data, onDelete }: DataTableProps) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Filter valid items only (removes any incomplete/ghost entries)
  const validData = data.filter((item): item is TableItem => {
    if (type === "users") {
      return !!(item as UserItem).name && !!(item as UserItem).email;
    }
    return !!(item as EntryItem).Situation;
  });

  const handleDelete = async (id: number) => {
    if (!confirm(`Are you sure you want to delete this ${type === "users" ? "user" : "entry"}?`)) return;

    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (err) {
      alert("Delete failed. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("ru-RU"); // DD.MM.YYYY for Tajikistan/Russian format
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-slate-900">
          {type === "users" ? "User Management" : "Entry Management"}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 text-left text-sm font-medium text-slate-600">
              <th className="p-4">ID</th>
              <th className="p-4">
                {type === "users" ? "NAME / EMAIL" : "SITUATION / TEXT"}
              </th>
              {type === "entries" && <th className="p-4">COLOUR / ICON</th>}
              <th className="p-4">DATE</th>
              <th className="p-4">ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            <AnimatePresence mode="popLayout">
              {validData.length === 0 ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan={type === "entries" ? 5 : 4} className="p-8 text-center text-slate-500">
                    No {type} found.
                  </td>
                </motion.tr>
              ) : (
                validData.map((item) => (
                  <motion.tr
                    key={item.ID}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="border-t hover:bg-slate-50"
                  >
                    <td className="p-4">#{item.ID}</td>

                    <td className="p-4">
                      {type === "users" ? (
                        <div>
                          <div className="font-medium">{(item as UserItem).name}</div>
                          <div className="text-sm text-slate-500">
                            {(item as UserItem).email}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium">{(item as EntryItem).Situation}</div>
                          <div className="text-sm text-slate-500">
                            {(item as EntryItem).Text}
                          </div>
                        </div>
                      )}
                    </td>

                    {type === "entries" && (
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full shadow-md"
                            style={{ backgroundColor: (item as EntryItem).Colour || "#ccc" }}
                          />
                          <span className="text-sm">{(item as EntryItem).Icon}</span>
                        </div>
                      </td>
                    )}

                    <td className="p-4">{formatDate(item.CreatedAt)}</td>

                    <td className="p-4">
                      <button
                        onClick={() => handleDelete(item.ID)}
                        disabled={deletingId === item.ID}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 size={18} />
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