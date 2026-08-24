import React, { useState } from 'react';
import {
  Shield,
  LayoutDashboard,
  AlertTriangle,
  BarChart3,
  HelpCircle,
  Home,
  Menu,
  X,
  Sparkles,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, onOpenAuth }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'landing', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'risk-analyzer', label: 'Risk Analyzer', icon: <AlertTriangle className="w-4 h-4" />, badge: 'Hero' },
    { id: 'budget', label: 'Budget Analyzer', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'explainer', label: 'AI Explain', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  const handleSelect = (tab: ActiveTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="md:hidden sticky top-0 z-50 bg-[#0F172A] border-b border-slate-800 shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <button
          onClick={() => handleSelect('landing')}
          className="flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div className="w-8 h-8 bg-[#10B981] rounded-lg flex items-center justify-center shadow-sm">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">FinShield</span>
            <span className="block text-[9px] uppercase tracking-wider text-emerald-400 font-semibold">
              MelbourneHack '26
            </span>
          </div>
        </button>

        {/* Mobile Toggle & Quick Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-rose-400"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth('signin')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

          <button
            onClick={() => handleSelect('risk-analyzer')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#10B981] text-slate-950 font-bold text-xs shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Scan</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="px-4 py-4 bg-[#0F172A] border-t border-slate-800 space-y-2 animate-in fade-in duration-150">
          {user && (
            <div className="p-3 bg-slate-800/80 rounded-xl mb-3 flex items-center justify-between border border-slate-700/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{user.displayName || user.email}</p>
                  <p className="text-[10px] text-emerald-400">Synced to Firestore</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-white/10 text-white font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-[#10B981]' : 'text-slate-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge === 'Hero' && item.id === 'risk-analyzer' && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      Hero
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
