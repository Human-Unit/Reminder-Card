'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  ShieldAlert, 
  LogOut, 
  ChevronRight, 
  Loader2 
} from 'lucide-react';
import api from '../lib/axios';

interface SidebarProps {
  activeTab: 'users' | 'entries';
  setActiveTab: (tab: 'users' | 'entries') => void;
}

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // --- The Fixed Logout Function ---
  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to log out?")) return;

    setIsLoggingOut(true);
    try {
      // 1. Call backend logout endpoint
      await api.post('/user/logout');
    } catch (err) {
      console.error('Logout endpoint error:', err);
    } finally {
      // 2. Always clear token from frontend storage as fallback
      localStorage.removeItem('token');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      
      // 3. Redirect to login
      router.push('/login');
    }
  };

  const navItems = [
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'entries', label: 'Memory Records', icon: BookOpen },
  ] as const;

  return (
    <aside className="w-80 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 hidden lg:flex shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] z-20">
      
      {/* Brand Header */}
      <div className="p-8 pb-10">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 ring-4 ring-indigo-50">
            <ShieldAlert size={22} strokeWidth={2.5} />
          </div>
          <div>
            <span className="block font-black text-xl tracking-tight text-slate-800 leading-none">
              ADMIN<span className="text-indigo-600">.</span>CORE
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1 block">
              System Control
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2">
        <div className="px-4 mb-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
          Management
        </div>
        
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
            >
              {/* Animated Background Pill */}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-indigo-50 rounded-2xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}

              <div className="relative z-10 flex items-center gap-3.5">
                <item.icon 
                  size={20} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} 
                />
                <span className={`tracking-tight ${isActive ? 'font-extrabold text-sm' : 'font-semibold text-sm'}`}>
                  {item.label}
                </span>
              </div>

              {isActive && (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative z-10"
                >
                  <ChevronRight size={16} strokeWidth={3} />
                </motion.div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / User Profile & Logout */}
      <div className="p-4 m-6 bg-slate-50 rounded-[2rem] border border-slate-100">
        <div className="flex items-center gap-3 mb-4 px-2 pt-1">
          <div className="w-9 h-9 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-xs font-black text-indigo-600">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-700 truncate">System Admin</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Online</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 p-3.5 text-red-500 font-bold bg-white border border-slate-200 rounded-2xl hover:bg-red-50 hover:border-red-100 hover:text-red-600 transition-all shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <LogOut size={18} strokeWidth={2.5} />
          )}
          <span className="text-sm">{isLoggingOut ? 'Logging out...' : 'Sign Out'}</span>
        </button>
      </div>
    </aside>
  );
};