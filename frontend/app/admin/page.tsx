"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { DataTable } from "@/components/DataTable";
import { Toast, ToastType } from "@/components/Toast"; // Assumes you saved the Toast component
import { ConfirmModal } from "@/components/ConfirmModal"; // Assumes you saved the ConfirmModal component
import { Users, BookOpen, CheckCircle2, Search, Loader2 } from "lucide-react";

// --- Types ---
interface User {
  ID: number;
  name: string;
  email: string;
  role?: string;
  CreatedAt: string;
}

interface Entry {
  ID: number;
  situation: string;
  text: string;
  colour: string;
  icon: string;
  CreatedAt: string;
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
    } catch (err: any) {
      showToast("Failed to fetch system data", "error");
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        router.replace("/dashboard");
      }
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
    } catch (err) {
      showToast("Deletion failed. Please try again.", "error");
    } finally {
      setIsDeleting(false);
      setConfirm({ show: false, id: 0 });
    }
  };

  // --- Filtered data ---
  const currentList =
    activeTab === "users"
      ? data.users.filter((u) =>
          u.name?.toLowerCase().includes(searchTerm.toLowerCase().trim()),
        )
      : data.entries.filter((e) =>
          e.situation?.toLowerCase().includes(searchTerm.toLowerCase().trim()),
        );

  // --- Guard Clauses ---
  if (
    isAuthorized === null ||
    (isAuthorized && loading && data.users.length === 0)
  ) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
            Loading Core...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              System Overview
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Manage global users and memory logs.
            </p>
          </div>

          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl shadow-sm border border-transparent focus:border-indigo-100 outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
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
          data={currentList as any[]} // This bypasses the error
          onDelete={triggerDelete}
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
    </div>
  );
}
