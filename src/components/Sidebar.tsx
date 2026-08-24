import React from 'react';
import {
  Shield,
  LayoutDashboard,
  AlertTriangle,
  BarChart3,
  HelpCircle,
  Home,
  User as UserIcon,
  LogOut,
  LogIn
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, onOpenAuth }) => {
  const { user, logout } = useAuth();

  const mainNav: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'landing',
      label: 'Home',
      icon: <Home className="w-4 h-4" />,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
  ];

  const toolsNav: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'risk-analyzer',
      label: 'Risk Analyzer',
      icon: <AlertTriangle className="w-4 h-4" />,
    },
    {
      id: 'budget',
      label: 'Budget',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'explainer',
      label: 'AI Explainer',
      icon: <HelpCircle className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="hidden md:flex w-64 bg-[#0F172A] flex-col justify-between p-6 shrink-0 min-h-screen border-r border-slate-800 sticky top-0 h-screen overflow-y-auto">
      <div>
        {/* Brand */}
        <button
          id="sidebar-brand-btn"
          onClick={() => onSelectTab('landing')}
          className="flex items-center gap-3 mb-8 w-full text-left group"
        >
          <div className="w-9 h-9 bg-[#10B981] rounded-xl flex items-center justify-center shadow-md shadow-emerald-950/40 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-tight">FinShield</span>
          </div>
        </button>

        {/* Primary Navigation */}
        <nav className="space-y-1 mb-6">
          {mainNav.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={isActive ? 'text-emerald-400' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Tools Section */}
        <div>
          <p className="px-3.5 mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Tools
          </p>
          <nav className="space-y-1">
            {toolsNav.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={isActive ? 'text-emerald-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Account Section if logged in */}
      {user && (
        <div className="pt-4 border-t border-slate-800/80">
          <div className="bg-[#1E293B] rounded-xl p-3 border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-7 h-7 rounded-full border border-emerald-400/40" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.displayName || user.email?.split('@')[0] || 'User'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
