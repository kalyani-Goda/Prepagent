import React from 'react';
import { BookOpen, MessageSquare, Briefcase, GraduationCap } from 'lucide-react';
import { AgentMode } from '../types';

interface LayoutProps {
  currentMode: AgentMode;
  setMode: (mode: AgentMode) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentMode, setMode, children }) => {
  const navItems = [
    { mode: AgentMode.MANAGE_KB, label: 'Knowledge Base', icon: BookOpen },
    { mode: AgentMode.STUDY_PLANNER, label: 'Study Planner', icon: Briefcase },
    { mode: AgentMode.MOCK_INTERVIEW, label: 'Interview Agent', icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 flex items-center gap-3 border-b border-slate-700">
          <GraduationCap className="text-blue-400 w-8 h-8" />
          <h1 className="text-xl font-bold tracking-tight">PrepAgent</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentMode === item.mode;
            return (
              <button
                key={item.mode}
                onClick={() => setMode(item.mode)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 text-xs text-slate-500 border-t border-slate-700">
          Powered by Gemini 2.5 & 3.0 Pro
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {children}
      </main>
    </div>
  );
};

export default Layout;