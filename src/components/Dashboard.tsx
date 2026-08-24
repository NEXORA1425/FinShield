import React from 'react';
import {
  Wallet,
  TrendingDown,
  PiggyBank,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useAuth } from '../context/AuthContext';

interface DashboardProps {
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectTab, onOpenAuth }) => {
  const { user } = useAuth();
  
  // Demo baseline figures
  const income = 30000;
  const totalExpenses = 21000;
  const remaining = 9000;

  const spendingCategories = [
    { name: 'Food', actual: 5000, heightPct: 'h-24' },
    { name: 'Transport', actual: 3000, heightPct: 'h-16' },
    { name: 'Bills', actual: 7000, heightPct: 'h-28' },
    { name: 'Shopping', actual: 4000, heightPct: 'h-20' },
    { name: 'Education', actual: 1000, heightPct: 'h-10' },
    { name: 'Other', actual: 1000, heightPct: 'h-8' },
  ];

  return (
    <div className="space-y-8 py-2">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Financial Overview</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Understand your spending at a glance.
          </p>
        </div>
      </header>

      {/* Cloud Account Banner if not signed in */}
      {!user && onOpenAuth && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Save custom scans and budgets across sessions</p>
              <p className="text-xs text-slate-400">Optional Firebase authentication to retain your analysis history.</p>
            </div>
          </div>
          <button
            onClick={() => onOpenAuth('signup')}
            className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 transition-colors shadow-sm"
          >
            Sign Up / Login
          </button>
        </div>
      )}

      {/* 3 Primary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Monthly Income */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Monthly Income
            </p>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 pt-1">
            ₹{income.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">Sample monthly income</p>
        </div>

        {/* Card 2: Total Expenses */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Expenses
            </p>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 pt-1">
            ₹{totalExpenses.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">Sample expenses</p>
        </div>

        {/* Card 3: Remaining */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Remaining
            </p>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#10B981] pt-1">
            ₹{remaining.toLocaleString()}
          </p>
          <p className="text-xs text-emerald-700">Sample remaining surplus</p>
        </div>
      </div>

      {/* Grid: Spending Overview on Left (3 cols), Quick Actions on Right (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Spending Overview */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg text-slate-900">Spending Overview</h2>
              <p className="text-xs text-slate-500 mt-0.5">Category breakdown of expenses</p>
            </div>
            <button
              onClick={() => onSelectTab('budget')}
              className="text-[#10B981] hover:text-emerald-700 font-semibold text-xs inline-flex items-center gap-1"
            >
              <span>View Budget Tool</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Visual Column Bars */}
          <div className="pt-4 flex items-end justify-between gap-2 sm:gap-4 h-48 border-b border-slate-100 pb-2">
            {spendingCategories.map((cat) => (
              <div key={cat.name} className="w-full flex flex-col items-center space-y-2 group">
                <div className="w-full max-w-[48px] h-36 bg-slate-100 rounded-t-xl relative flex items-end justify-center overflow-hidden">
                  <div
                    className={`w-full bg-[#10B981] rounded-t-xl transition-all group-hover:bg-emerald-600 ${cat.heightPct}`}
                  />
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold py-0.5 px-1.5 rounded pointer-events-none whitespace-nowrap shadow-sm">
                    ₹{cat.actual.toLocaleString()}
                  </div>
                </div>
                <p className="text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate max-w-[54px]">
                  {cat.name}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom Insights */}
          <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
            <span className="text-slate-500 text-xs">
              Top category: <strong className="text-slate-900 font-semibold">Bills (₹7,000)</strong>
            </span>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-2 space-y-3.5 flex flex-col justify-start">
          <div>
            <h2 className="font-bold text-lg text-slate-900">Quick Actions</h2>
            <p className="text-xs text-slate-500 mt-0.5">Access AI-powered financial tools</p>
          </div>

          {/* Action 1: Risk Analyzer */}
          <button
            id="quick-action-risk"
            onClick={() => onSelectTab('risk-analyzer')}
            className="w-full bg-white border border-slate-200/80 p-4 rounded-xl flex items-center gap-4 text-left hover:border-[#10B981] hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 group-hover:bg-orange-100 transition-colors shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-slate-900">Analyze Message</p>
              <p className="text-xs text-slate-500 truncate">Identify warning signs in financial messages</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>

          {/* Action 2: Review Budget */}
          <button
            id="quick-action-budget"
            onClick={() => onSelectTab('budget')}
            className="w-full bg-white border border-slate-200/80 p-4 rounded-xl flex items-center gap-4 text-left hover:border-[#10B981] hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-slate-900">Review Budget</p>
              <p className="text-xs text-slate-500 truncate">Calculate spending breakdown and get insights</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>

          {/* Action 3: Explain Finance */}
          <button
            id="quick-action-explainer"
            onClick={() => onSelectTab('explainer')}
            className="w-full bg-white border border-slate-200/80 p-4 rounded-xl flex items-center gap-4 text-left hover:border-[#10B981] hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-slate-900">Explain Finance</p>
              <p className="text-xs text-slate-500 truncate">Ask everyday questions in English or Hindi</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};
