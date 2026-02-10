'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import api from '../lib/axios';
import { LogOut } from 'lucide-react'; 

export default function Header() {
  const [username, setUsername] = useState('User');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await api.post('/user/getusername');
        // Проверяем разные варианты ответа от бэкенда
        const name = res.data.username || res.data.name || res.data.user?.name || 'User';
        setUsername(name);
      } catch (err: any) {
        console.error('Failed to fetch username:', err);
        setError('Could not load username');
        setUsername('User');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsername();
  }, []);

  const handleSignOut = async () => {
    try {
      // Call backend logout endpoint
      await api.post('/user/logout');
    } catch (err) {   
      console.error('Logout endpoint error:', err);
    } finally {
      // Always clear token from frontend storage as fallback
      localStorage.removeItem('token');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      
      // Redirect to login
      router.push('/login');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl shadow-sm flex justify-between items-center mb-6"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-purple-100 overflow-hidden border-2 border-purple-500 p-1">
          {isLoading ? (
            <div className="w-full h-full bg-gray-300 animate-pulse"></div>
          ) : (
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} 
              alt="avatar"
              className="w-full h-full" 
            />
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Welcome back, <span className="text-purple-600">{username}</span>
          </h1>
          <p className="text-gray-500 text-sm">
            {error ? <span className="text-red-500">{error}</span> : 'Ready to reflect on your day?'}
          </p>
        </div>
      </div>
      
      <button 
        onClick={handleSignOut}
        className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors group"
        title="Sign out"
      >
        <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Sign Out</span>
      </button>
    </motion.div>
  );
}