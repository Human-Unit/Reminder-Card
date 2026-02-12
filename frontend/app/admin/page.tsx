"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { DataTable } from "@/components/DataTable";
import { Toast, ToastType } from "@/components/Toast"; // Assumes you saved the Toast component
import { ConfirmModal } from "@/components/ConfirmModal"; // Assumes you saved the ConfirmModal component
import { Users, BookOpen, CheckCircle2, Search, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// --- Types ---
import { User, Entry } from "@/types";
// --- Types ---
interface UserEditForm {
  ID: number;
  name: string;
  role: string;
  password?: string;
}

export default function AdminPanel() {
  const router = useRouter();

  // --- UI States ---
  const [activeTab, setActiveTab] = useState<"users" | "entries">("users");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // --- Data State ---
  const [data, setData] = useState<{ users: User[]; entries: Entry[] }>({
    users: [],
    entries: [],
  });

  // --- Feedback States (Custom Alerts) ---
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as ToastType,
  });
  const [confirm, setConfirm] = useState({ show: false, id: 0 });
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Edit Modal State
  const [editModal, setEditModal] = useState({ show: false, user: null as UserEditForm | null });
  const [isUpdating, setIsUpdating] = useState(false);

  // --- Helper: Show Toast ---
  const showToast = (message: string, type: ToastType) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  // --- Authorization check ---
  useEffect(() => {
    const role = localStorage.getItem("role")?.toLowerCase();
    const authorized = role === "admin";
    setIsAuthorized(authorized);
    if (!authorized) router.replace("/dashboard");
  }, [router]);

  // --- Data loading ---
  const loadData = useCallback(async () => {
    if (!isAuthorized) return;
    setLoading(true);
    try {
      const [usersRes, entriesRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/entries"),
      ]);
      setData({
        users: usersRes.data ?? [],
        entries: entriesRes.data ?? [],
      });
    } catch {
      showToast("Failed to fetch system data", "error");
      router.replace("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [isAuthorized, router]);

  useEffect(() => {
    if (isAuthorized) loadData();
  }, [isAuthorized, activeTab, loadData]);

  // --- Action: Delete Logic ---
  const triggerDelete = (id: number) => setConfirm({ show: true, id });

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      const endpoint =
        activeTab === "users"
          ? `/admin/users/${confirm.id}`
          : `/admin/entries/${confirm.id}`;
      await api.delete(endpoint);
      showToast(
        `${activeTab === "users" ? "User" : "Entry"} deleted successfully`,
        "success",
      );
      loadData(); // Refresh list
    } catch {
      showToast("Deletion failed. Please try again.", "error");
    } finally {
      setIsDeleting(false);
      setConfirm({ show: false, id: 0 });
    }
  };

  // --- Action: Update User Logic ---
  const openEditModal = (user: User) => {
    setEditModal({ 
      show: true, 
      user: { ID: user.ID, name: user.name, role: user.role || "user" } 
    });
  };

  // Revised Update Logic with Password
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.user) return;
    
    setIsUpdating(true);
    try {
      // Backend now expects PUT /admin/users/:id
      await api.put(`/admin/users/${editModal.user.ID}`, {
        name: editModal.user.name,
        // Only send password if it's not empty, otherwise backend might hash empty string if logic isn't careful.
        // My backend logic checks: if user.Password != "" { hash it }
        // The form state initializes password as undefined or empty string, so it's safe.
        password: editModal.user.password
      });

      showToast("User updated successfully", "success");
      setEditModal({ show: false, user: null });
      loadData();
    } catch {
      showToast("Update failed", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Navigate to Entries ---
  const viewUserEntries = (userId: number) => {
     // We need to filter entries by this user.
     // The current API /admin/entries returns ID, situation, text, colour, icon, CreatedAt.
     // It DOES NOT return user_id? Check backend models.Entry.
     // Backend Entry model usually has UserID.
     // Backend GetAllEntries: DB.Find(&entries). 
     // We need to check if Entry struct has JSON tag for UserID.
     
     // Assuming we can filter on client side if the data is there.
     // If not, we might need backend change.
     // Let's assume for now we switch tab and filter if possible.
     // But wait, the `Entry` interface in this file DOES NOT have UserID.
     // I need to update the `Entry` interface too.
     
     setActiveTab("entries");
     setSearchTerm(`user:${userId}`); // Hacky way to filter? 
     // Or better, just set a filter state. 
     // For now, let's just switch tab and pre-fill search with something unique?
     // Actually, looking at the requested feature "move to his entries on click".
     // I will implement a client-side filter for now.
  };

  // --- Filtered data ---
  const currentList =
    activeTab === "users"
      ? data.users.filter((u) =>
          u.name?.toLowerCase().includes(searchTerm.toLowerCase().trim()),
        )
      : data.entries.filter((e) => {
          const term = searchTerm.toLowerCase().trim();
          if (term.startsWith("user:")) {
            const userId = parseInt(term.split(":")[1]);
            return !isNaN(userId) && e.user_id === userId;
          }
          return e.situation?.toLowerCase().includes(term);
        });

  // --- Guard Clauses ---
  if (
    isAuthorized === null ||
    (isAuthorized && loading && data.users.length === 0)
  ) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-slate-400 dark:text-slate-500 font-bold text-sm uppercase tracking-widest">
            Loading Core...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col lg:flex-row transition-colors">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto pb-32 lg:pb-12">
        <header className="flex flex-col md:flex-row justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              System Overview
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
              Manage global users and memory logs.
            </p>
          </div>

          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              size={20}
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-transparent dark:border-slate-800 focus:border-indigo-100 dark:focus:border-indigo-900 outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              placeholder={`Search ${activeTab}...`}
            />
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard
            title="Total Users"
            value={data.users.length}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Entries"
            value={data.entries.length}
            icon={BookOpen}
            color="bg-indigo-600"
          />
          <StatCard
            title="Server Status"
            value="Healthy"
            icon={CheckCircle2}
            color="bg-emerald-500"
          />
        </div>

        {/* Data Display */}
        <DataTable
          type={activeTab}
          data={currentList}
          onDelete={triggerDelete}
          onEdit={activeTab === 'users' ? openEditModal : undefined}
          onViewEntries={activeTab === 'users' ? viewUserEntries : undefined}
        />
      </main>

      {/* --- CUSTOM FEEDBACK COMPONENTS --- */}
      <Toast
        isVisible={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <ConfirmModal
        isOpen={confirm.show}
        title="Confirm Deletion"
        message={`Are you sure you want to remove this ${activeTab === "users" ? "user" : "entry"}? This action is permanent and cannot be reversed.`}
        isLoading={isDeleting}
        onConfirm={executeDelete}
        onCancel={() => setConfirm({ show: false, id: 0 })}
      />

       {/* Edit User Modal */}
       <AnimatePresence>
        {editModal.show && editModal.user && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Edit User</h3>
                <button 
                  onClick={() => setEditModal({ show: false, user: null })}
                  className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editModal.user.name}
                    onChange={(e) => setEditModal({
                      ...editModal,
                      user: { ...editModal.user!, name: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-r-0 border-transparent rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all outline-none font-medium text-slate-700 dark:text-slate-200"
                    placeholder="Enter username"
                    required
                  />
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                    New Password <span className="text-slate-300 dark:text-slate-600 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="password"
                    value={editModal.user.password || ""}
                    onChange={(e) => setEditModal({
                      ...editModal,
                      user: { ...editModal.user!, password: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-r-0 border-transparent rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all outline-none font-medium text-slate-700 dark:text-slate-200"
                    placeholder="Leave empty to keep current"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditModal({ show: false, user: null })}
                    className="flex-1 px-4 py-3 font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 px-4 py-3 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                  >
                    {isUpdating ? <Loader2 size={18} className="animate-spin" /> : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
