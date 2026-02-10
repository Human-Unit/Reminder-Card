import { Users, BookOpen, ShieldAlert, LogOut, ChevronRight } from 'lucide-react';

interface SidebarProps {
  activeTab: 'users' | 'entries';
  setActiveTab: (tab: 'users' | 'entries') => void;
  onLogout: () => void;
}

export const Sidebar = ({ activeTab, setActiveTab, onLogout }: SidebarProps) => (
  <aside className="w-72 bg-white border-r border-slate-200 p-8 flex flex-col hidden lg:flex h-screen sticky top-0">
    <div className="flex items-center gap-3 mb-12">
      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
        <ShieldAlert size={20} />
      </div>
      <span className="font-black text-xl tracking-tight">ADMIN.CORE</span>
    </div>

    <nav className="space-y-2 flex-1">
      {[
        { id: 'users', label: 'Users', icon: Users },
        { id: 'entries', label: 'Entries', icon: BookOpen },
      ].map((item) => (
        <button 
          key={item.id}
          onClick={() => setActiveTab(item.id as any)}
          className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
            activeTab === item.id 
            ? 'bg-indigo-50 text-indigo-600 font-bold' 
            : 'hover:bg-gray-50 text-gray-500'
          }`}
        >
          <div className="flex items-center gap-3"><item.icon size={20}/> {item.label}</div>
          {activeTab === item.id && <ChevronRight size={16} />}
        </button>
      ))}
    </nav>

    <button 
      onClick={onLogout}
      className="mt-auto flex items-center gap-3 p-4 text-red-400 font-bold hover:bg-red-50 rounded-2xl transition-all"
    >
      <LogOut size={20} /> Logout
    </button>
  </aside>
);  