import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

export const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => (
  <motion.div
    whileHover={{ y: -5 }}
    transition={{ duration: 0.2 }}
    className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm flex items-center justify-between"
  >
    <div>
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
        {title}
      </p>
      <h3 className="text-2xl sm:text-3xl font-black text-gray-800 mt-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </h3>
    </div>
    <div className={`p-4 rounded-2xl ${color} text-white shadow-lg`}>
      <Icon size={24} aria-hidden="true" />
    </div>
  </motion.div>
);