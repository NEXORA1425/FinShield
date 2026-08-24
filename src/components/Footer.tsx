import React from 'react';
import { Shield, ShieldCheck, Lock, ExternalLink } from 'lucide-react';
import { ActiveTab } from '../types';

interface FooterProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="mt-auto pt-8 pb-8 border-t border-slate-200/80 text-slate-400">
      <div className="space-y-6">
        {/* Module quick jump pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#10B981] flex items-center justify-center text-white">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-700 tracking-tight">FinShield AI Safety</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
            <button
              onClick={() => onSelectTab('landing')}
              className="hover:text-slate-900 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => onSelectTab('dashboard')}
              className="hover:text-slate-900 transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => onSelectTab('risk-analyzer')}
              className="hover:text-slate-900 transition-colors"
            >
              Risk Analyzer
            </button>
            <button
              onClick={() => onSelectTab('budget')}
              className="hover:text-slate-900 transition-colors"
            >
              Budget Analyzer
            </button>
            <button
              onClick={() => onSelectTab('explainer')}
              className="hover:text-slate-900 transition-colors"
            >
              AI Explain
            </button>
          </div>
        </div>

        {/* Bottom Sleek Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest gap-2 pt-4 border-t border-slate-100">
          <p>FinShield — Built for MelbourneHack 2026</p>
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Privacy-first prototype</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
