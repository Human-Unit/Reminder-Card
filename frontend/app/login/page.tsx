"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { motion } from "framer-motion";
import { AlertCircle, User, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/user/login", form);

      // Debug: log full response so we can inspect role/token shape
      if (typeof window !== 'undefined') console.debug('Login response:', res.data);

      const token = res.data?.token || null;
      
      // 1. Robust Role Detection
      let rawRole = res.data?.role ?? res.data?.roleName ?? res.data?.user?.role ?? res.data?.user?.roleName ?? null;
      if (!rawRole && res.data?.user && (res.data.user.role || res.data.user.roleName)) {
        rawRole = res.data.user.role || res.data.user.roleName;
      }
      
      // Normalize role to lowercase string
      const userRole = rawRole ? String(rawRole).trim().toLowerCase() : "user";

      if (token) {
        // 2. Persist to LocalStorage (For Client-side use)
        localStorage.setItem("token", token);
        localStorage.setItem("role", userRole);

        // 3. Persist to Cookies (CRITICAL for Server-side Middleware)
        const cookieAge = 7 * 24 * 60 * 60; // 7 days in seconds
        document.cookie = `token=${token}; path=/; max-age=${cookieAge}; SameSite=Lax`;
        document.cookie = `role=${userRole}; path=/; max-age=${cookieAge}; SameSite=Lax`;

        // 4. Smart Redirect
        if (userRole === "admin") {
          // We use window.location.href for admins to force the browser 
          // to send the fresh cookies to the Middleware immediately.
          window.location.href = "/admin";
        } else {
          router.push("/dashboard");
        }
      } else {
        throw new Error("No token received from server");
      }

    } catch (err) {
      const errorMsg = (err as Error)?.message || "Login failed";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 font-sans">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-100/50 dark:bg-purple-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.2)] w-full max-w-md border border-white dark:border-slate-700"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-purple-200"
          >
            <Lock className="text-white" size={28} />
          </motion.div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to continue your journey</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600"
          >
            <AlertCircle size={18} className="shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Username"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full pl-12 pr-4 py-4 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white dark:focus:bg-slate-800 transition-all text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              disabled={loading}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full pl-12 pr-4 py-4 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white dark:focus:bg-slate-800 transition-all text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-purple-100 hover:shadow-purple-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Sign In
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-50 dark:border-slate-700 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            New here?
            <a href="/register" className="ml-2 text-purple-600 font-bold hover:text-purple-700 transition-colors">
              Create an account
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}