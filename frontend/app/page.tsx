"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle, LayoutDashboard, Zap } from "lucide-react";

export default function Home() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 overflow-hidden relative selection:bg-purple-500/30">
      
      {/* Background Ornaments */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 to-transparent blur-3xl rounded-full mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-20 pb-16 lg:pt-32">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.div variants={itemVariants} className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium border border-purple-200 dark:border-purple-800/50">
              <Zap size={14} className="text-purple-500" />
              v1.0 is now live
            </span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-purple-800 to-slate-900 dark:from-white dark:via-purple-200 dark:to-white"
          >
            Manage your entries with <span className="text-purple-600 dark:text-purple-400">confidence.</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed"
          >
            A powerful, minimalist dashboard designed to keep your data organized, secure, and accessible from anywhere. Start building your portfolio today.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/register"
              className="group flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold transition-all shadow-[0_0_40px_-10px_rgba(147,51,234,0.5)] hover:shadow-[0_0_60px_-15px_rgba(147,51,234,0.7)] hover:-translate-y-0.5 w-full sm:w-auto justify-center"
            >
              Get Started
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/login"
              className="px-8 py-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-semibold border border-slate-200 dark:border-slate-800 transition-all hover:-translate-y-0.5 w-full sm:w-auto text-center"
            >
              Sign In
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.7 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { title: "Lightning Fast", desc: "Built on Next.js 16 and Go for unparalleled performance.", icon: <Zap className="text-amber-500" /> },
            { title: "Secure by Design", desc: "Enterprise-grade authentication and data protection.", icon: <CheckCircle className="text-emerald-500" /> },
            { title: "Intuitive Dashboard", desc: "Clean interface focused on what matters most—your data.", icon: <LayoutDashboard className="text-blue-500" /> }
          ].map((feature, i) => (
            <div key={i} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
