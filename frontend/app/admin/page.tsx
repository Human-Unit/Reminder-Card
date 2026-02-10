"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { DataTable } from "@/components/DataTable";
import { Users, BookOpen, CheckCircle2, Search, Loader2 } from "lucide-react";

// ── Minimal types (extend as needed) ────────────────────────────────────────
interface User {
  id?: string | number;
  Name: string;
  email?: string;
  role?: string;
  [key: string]: any; // for extra fields
}

interface Entry {
  id?: string | number;
  Situation?: string;
  Text?: string;
  Colour?: string;
  [key: string]: any; // for extra fields
}

// ──────────────────────────────────────────────────────────────────────────────

export default function AdminPanel() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"users" | "entries">("users");
  const [data, setData] = useState<{ users: User[]; entries: Entry[] }>({
    users: [],
    entries: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // ── Authorization check (runs once on mount) ────────────────────────────────
  useEffect(() => {
    const role = localStorage.getItem("role")?.toLowerCase();
    const authorized = role === "admin";

    setIsAuthorized(authorized);

    if (!authorized) {
      router.replace("/dashboard");
    }
  }, [router]);

  // ── Data loading ────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!isAuthorized) return;

    setLoading(true);
    setError(null);

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
      console.error("Admin data fetch failed:", err);

      const status = err?.response?.status;

      if (status === 401 || status === 403) {
        router.replace("/dashboard");
        return;
      }

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load dashboard data. Please try again later.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [isAuthorized, router]);

  // Load data when authorized and when tab changes
  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized, activeTab, loadData]);

  // ── Early returns ───────────────────────────────────────────────────────────
  if (isAuthorized === null) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // router.replace already called
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  // ── Filtered data ───────────────────────────────────────────────────────────
  const currentList: any[] =
    activeTab === "users"
      ? data.users.filter((user) =>
          (user.Name ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase().trim()),
        )
      : data.entries.filter((entry) =>
          (entry.Situation ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase().trim()),
        );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={() => router.push("/login")}
      />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between gap-6 mb-10">
          <h1 className="text-4xl font-black text-slate-900">
            System Overview
          </h1>

          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-400 transition"
              placeholder="Search users or entries..."
            />
          </div>
        </header>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard
            title="Users"
            value={data.users.length}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            title="Entries"
            value={data.entries.length}
            icon={BookOpen}
            color="bg-indigo-600"
          />
          <StatCard
            title="Uptime"
            value="99.9%"
            icon={CheckCircle2}
            color="bg-emerald-500"
          />
        </div>

        <DataTable type={activeTab} data={currentList} onDelete={loadData} />
      </main>
    </div>
  );
}
