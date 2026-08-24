import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  BarChart3,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Lock,
  Compass,
  CheckCircle2,
  TrendingUp,
  Award,
  LogIn,
  Cloud
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectTab, onOpenAuth }) => {
  const { user } = useAuth();
  return (
    <div className="space-y-12 py-2">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#0F172A] text-white rounded-3xl p-6 sm:p-12 lg:p-14 border border-slate-800 shadow-sm">
        {/* Subtle background ambient accents */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#1E293B] border border-slate-700 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>Privacy-First Prototype • AI Financial Safety</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Make Smarter Financial Decisions.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            AI-powered financial education, budgeting and safety awareness for everyone.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              id="hero-get-started-btn"
              onClick={() => onSelectTab('dashboard')}
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#10B981] hover:bg-emerald-400 text-slate-950 font-bold text-sm sm:text-base shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-analyze-risk-btn"
              onClick={() => onSelectTab('risk-analyzer')}
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm sm:text-base border border-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Analyze a Risk</span>
            </button>
          </div>

          {/* Quick metric highlights */}
          <div className="pt-8 grid grid-cols-3 gap-4 border-t border-slate-800 text-xs sm:text-sm text-slate-300">
            <div>
              <p className="font-bold text-white text-base sm:text-xl">Cloud Sync</p>
              <p className="text-slate-400 text-[11px] sm:text-xs">Firebase Firestore</p>
            </div>
            <div>
              <p className="font-bold text-white text-base sm:text-xl">Zero Exposure</p>
              <p className="text-slate-400 text-[11px] sm:text-xs">Private & secure AI</p>
            </div>
            <div>
              <p className="font-bold text-white text-base sm:text-xl">Bilingual</p>
              <p className="text-slate-400 text-[11px] sm:text-xs">English & Hindi support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Core Modules
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Three Powerful Tools for Financial Safety & Inclusion
          </h2>
          <p className="text-sm text-slate-500">
            Designed specifically for students, young earners, and anyone navigating unfamiliar financial communications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Card 1: Risk Analyzer (Hero Feature) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 hover:border-[#10B981] shadow-sm hover:shadow transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 text-[10px] font-bold text-[#10B981] bg-emerald-50 border border-emerald-200 rounded-full uppercase tracking-wider">
                  Hero Feature
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                1. Financial Risk Analyzer
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Paste suspicious SMS, lottery alerts, bank block threats, or payment notices. Gemini identifies psychological triggers, spoofing flags, and safe next steps.
              </p>
            </div>
            <div className="pt-6">
              <button
                id="card-cta-risk"
                onClick={() => onSelectTab('risk-analyzer')}
                className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition group-hover:bg-[#10B981] group-hover:text-slate-950"
              >
                <span>Try Risk Analyzer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Smart Budget */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 hover:border-[#10B981] shadow-sm hover:shadow transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                2. Budget Analyzer
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Enter your monthly income and key expenses. Get deterministic arithmetic, visual charts, and empathetic AI guidance without complex jargon.
              </p>
            </div>
            <div className="pt-6">
              <button
                id="card-cta-budget"
                onClick={() => onSelectTab('budget')}
                className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-xs sm:text-sm transition"
              >
                <span>Analyze Budget</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 3: AI Financial Explainer */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 hover:border-[#10B981] shadow-sm hover:shadow transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <HelpCircle className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                3. Financial Explainer
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Demystify intimidating financial terms like Compound Interest, EMI, Inflation, and Credit Scores with clear everyday analogies and takeaways.
              </p>
            </div>
            <div className="pt-6">
              <button
                id="card-cta-explainer"
                onClick={() => onSelectTab('explainer')}
                className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-xs sm:text-sm transition"
              >
                <span>Explain Finance</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* "Why FinShield?" Section */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 space-y-6 shadow-sm">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Why FinShield?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Financial inclusion starts with safety, transparent awareness, and accessible language.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Easier Financial Understanding</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              No complex financial jargon or textbook theories. Concepts are broken down into daily life examples that anyone can relate to.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Smarter Spending Awareness</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Clear visual arithmetic shows where monthly income flows, helping young earners build sustainable saving and spending habits.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Safer Financial Decisions</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Proactively identify urgent red flags in suspicious messages before financial loss, phishing, or unauthorized credential sharing occurs.
            </p>
          </div>
        </div>
      </section>

      {/* "How It Works" Section */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 space-y-6 shadow-sm">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Get instant financial clarity, security warnings, and smart spending insights in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 space-y-3">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-base">Input or Paste Data</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Paste suspicious SMS text, enter monthly budget figures, or type any confusing financial term in English or Hindi.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 space-y-3">
            <div className="w-8 h-8 rounded-full bg-[#10B981] text-slate-950 font-bold text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-base">AI & Local Evaluation</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Deterministic calculations run instantly in the browser while server-side Gemini AI evaluates risk cues and provides contextual insights.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 space-y-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-base">Actionable Guidance</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive structured recommendations, risk badges, interactive spending distribution charts, and clear everyday analogies.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy / Safety Notice */}
      <section className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#10B981] flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Privacy & Safety Notice</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              FinShield is engineered with strict privacy safeguards. We evaluate message patterns without harvesting personal banking passwords, OTPs, or card CVVs. All AI requests are executed through secured server-side endpoints.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
